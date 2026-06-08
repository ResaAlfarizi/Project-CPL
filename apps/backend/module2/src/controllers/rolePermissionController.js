const {
  getAllPermissions,
  getPermissionsByRoleName,
  upsertPermission,
  deletePermission,
  seedDefaultPermissions,
} = require("../models/rolePermissionModel");

// GET ALL PERMISSIONS
const getAll = async (req, res) => {
  try {
    const permissions = await getAllPermissions();

    res.json({
      message: "Berhasil mengambil semua permissions",
      count: permissions.length,
      data: permissions,
    });
  } catch (error) {
    console.error('Get all permissions error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET PERMISSIONS BY ROLE
const getByRole = async (req, res) => {
  try {
    const { roleName } = req.params;

    const permissions = await getPermissionsByRoleName(roleName);

    res.json({
      message: `Berhasil mengambil permissions untuk role ${roleName}`,
      role: roleName,
      count: permissions.length,
      data: permissions,
    });
  } catch (error) {
    console.error('Get permissions by role error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPSERT PERMISSION
const upsert = async (req, res) => {
  try {
    const { role_id, resource, can_read, can_write, can_delete } = req.body;

    if (!role_id || !resource) {
      return res.status(400).json({
        message: "role_id dan resource diperlukan",
      });
    }

    const permission = await upsertPermission(
      role_id,
      resource,
      can_read || false,
      can_write || false,
      can_delete || false
    );

    res.json({
      message: "Permission berhasil disimpan",
      data: permission,
    });
  } catch (error) {
    console.error('Upsert permission error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE PERMISSION
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deletePermission(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Permission tidak ditemukan",
      });
    }

    res.json({
      message: "Permission berhasil dihapus",
      data: deleted,
    });
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// SEED DEFAULT PERMISSIONS
const seed = async (req, res) => {
  try {
    const result = await seedDefaultPermissions();

    res.json({
      message: "Default permissions berhasil di-seed",
      ...result,
    });
  } catch (error) {
    console.error('Seed permissions error:', error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAll,
  getByRole,
  upsert,
  remove,
  seed,
};
