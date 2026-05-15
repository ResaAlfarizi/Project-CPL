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

module.exports = authorize;