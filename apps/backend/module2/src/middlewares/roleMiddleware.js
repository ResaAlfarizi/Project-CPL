const { checkPermissionByRoleName } = require("../models/rolePermissionModel");

/**
 * ROLE MIDDLEWARE - Basic role authorization
 * Cek apakah user punya role yang diizinkan
 * 
 * Usage: authorize('superadmin', 'admin_prodi')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Normalize role: convert to lowercase and replace underscore with space
    const userRole = req.user.role
      ? req.user.role.toLowerCase().replace(/_/g, " ")
      : "";

    // Normalize allowed roles
    const normalizedRoles = roles.map((role) =>
      role.toLowerCase().replace(/_/g, " ")
    );

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Akses ditolak",
        userRole: req.user.role,
        allowedRoles: roles,
      });
    }

    next();
  };
};

/**
 * PERMISSION MIDDLEWARE - Granular permission check
 * Cek apakah user punya permission untuk resource & action tertentu
 * 
 * Usage: checkPermission('capaian_cpl', 'write')
 */
const checkPermission = (resource, action = 'read') => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (!userRole) {
        return res.status(401).json({
          message: "Role tidak ditemukan di token",
        });
      }

      // Superadmin bypass permission check (full access)
      if (userRole.toLowerCase() === 'superadmin') {
        return next();
      }

      // Check permission dari database
      const hasPermission = await checkPermissionByRoleName(
        userRole,
        resource,
        action
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: `Akses ditolak: Anda tidak punya permission ${action.toUpperCase()} untuk resource ${resource}`,
          role: userRole,
          resource,
          action,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        message: "Error checking permissions",
        error: error.message,
      });
    }
  };
};

/**
 * COMBINED MIDDLEWARE - Role + Permission check
 * Cek role dulu, baru cek permission
 * 
 * Usage: authorizeWithPermission(['admin_prodi', 'superadmin'], 'users', 'write')
 */
const authorizeWithPermission = (roles, resource, action = 'read') => {
  return async (req, res, next) => {
    // Check role first
    const userRole = req.user.role
      ? req.user.role.toLowerCase().replace(/_/g, " ")
      : "";

    const normalizedRoles = roles.map((role) =>
      role.toLowerCase().replace(/_/g, " ")
    );

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Akses ditolak: Role tidak sesuai",
        userRole: req.user.role,
        allowedRoles: roles,
      });
    }

    // Superadmin bypass permission check
    if (req.user.role.toLowerCase() === 'superadmin') {
      return next();
    }

    // Check permission
    try {
      const hasPermission = await checkPermissionByRoleName(
        req.user.role,
        resource,
        action
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: `Akses ditolak: Tidak punya permission ${action.toUpperCase()} untuk ${resource}`,
          role: req.user.role,
          resource,
          action,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        message: "Error checking permissions",
        error: error.message,
      });
    }
  };
};

module.exports = authorize;
module.exports.authorize = authorize;
module.exports.checkPermission = checkPermission;
module.exports.authorizeWithPermission = authorizeWithPermission;