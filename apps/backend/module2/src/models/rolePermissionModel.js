const pool = require("../config/db");

/**
 * ROLE PERMISSION MODEL
 * Mengelola granular permissions per role per resource
 * Sesuai Matrix Hak Akses di spesifikasi CPL System
 */

// Ambil semua permissions
const getAllPermissions = async () => {
  const query = `
    SELECT 
      rp.id,
      rp.role_id,
      r.nama_role,
      rp.resource,
      rp.can_read,
      rp.can_write,
      rp.can_delete
    FROM role_permissions rp
    JOIN roles r ON rp.role_id = r.id
    ORDER BY r.nama_role, rp.resource
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Ambil permissions berdasarkan role
const getPermissionsByRole = async (roleId) => {
  const query = `
    SELECT 
      id,
      resource,
      can_read,
      can_write,
      can_delete
    FROM role_permissions
    WHERE role_id = $1
    ORDER BY resource
  `;

  const result = await pool.query(query, [roleId]);
  return result.rows;
};

// Ambil permissions berdasarkan role name
const getPermissionsByRoleName = async (roleName) => {
  const query = `
    SELECT 
      rp.id,
      rp.resource,
      rp.can_read,
      rp.can_write,
      rp.can_delete
    FROM role_permissions rp
    JOIN roles r ON rp.role_id = r.id
    WHERE LOWER(r.nama_role) = LOWER($1)
    ORDER BY rp.resource
  `;

  const result = await pool.query(query, [roleName]);
  return result.rows;
};

// Cek apakah role punya akses ke resource
const checkPermission = async (roleId, resource, action = 'read') => {
  const actionColumn = {
    read: 'can_read',
    write: 'can_write',
    delete: 'can_delete',
  }[action.toLowerCase()] || 'can_read';

  const query = `
    SELECT ${actionColumn} as has_permission
    FROM role_permissions
    WHERE role_id = $1 AND resource = $2
  `;

  const result = await pool.query(query, [roleId, resource]);
  return result.rows[0]?.has_permission || false;
};

// Cek permission by role name
const checkPermissionByRoleName = async (roleName, resource, action = 'read') => {
  const actionColumn = {
    read: 'can_read',
    write: 'can_write',
    delete: 'can_delete',
  }[action.toLowerCase()] || 'can_read';

  const query = `
    SELECT rp.${actionColumn} as has_permission
    FROM role_permissions rp
    JOIN roles r ON rp.role_id = r.id
    WHERE LOWER(r.nama_role) = LOWER($1) AND rp.resource = $2
  `;

  const result = await pool.query(query, [roleName, resource]);
  return result.rows[0]?.has_permission || false;
};

// Buat/update permission
const upsertPermission = async (roleId, resource, canRead, canWrite, canDelete) => {
  const query = `
    INSERT INTO role_permissions (
      role_id,
      resource,
      can_read,
      can_write,
      can_delete
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (role_id, resource) 
    DO UPDATE SET
      can_read = EXCLUDED.can_read,
      can_write = EXCLUDED.can_write,
      can_delete = EXCLUDED.can_delete
    RETURNING *
  `;

  const values = [roleId, resource, canRead, canWrite, canDelete];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Hapus permission
const deletePermission = async (id) => {
  const query = `DELETE FROM role_permissions WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Seed default permissions sesuai Matrix Hak Akses
const seedDefaultPermissions = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Hapus permissions lama (opsional)
    await client.query('DELETE FROM role_permissions');

    // Ambil role IDs
    const rolesQuery = await client.query(`
      SELECT id, nama_role FROM roles
    `);
    
    const roles = {};
    rolesQuery.rows.forEach(r => {
      roles[r.nama_role.toLowerCase()] = r.id;
    });

    // Matrix Hak Akses sesuai spesifikasi
    const permissions = [
      // SUPERADMIN - Full access semua resource
      { role: 'superadmin', resource: 'program_studi_cpl', read: true, write: true, delete: true },
      { role: 'superadmin', resource: 'mata_kuliah_pemetaan', read: true, write: true, delete: true },
      { role: 'superadmin', resource: 'sub_cpmk', read: true, write: true, delete: true },
      { role: 'superadmin', resource: 'nilai_sub_cpmk', read: true, write: true, delete: true },
      { role: 'superadmin', resource: 'capaian_cpl', read: true, write: true, delete: true },
      { role: 'superadmin', resource: 'users', read: true, write: true, delete: true },
      { role: 'superadmin', resource: 'audit_log', read: true, write: false, delete: false },

      // ADMIN_PRODI - Kelola data prodi sendiri
      { role: 'admin_prodi', resource: 'program_studi_cpl', read: true, write: true, delete: false },
      { role: 'admin_prodi', resource: 'mata_kuliah_pemetaan', read: true, write: true, delete: false },
      { role: 'admin_prodi', resource: 'sub_cpmk', read: true, write: true, delete: false },
      { role: 'admin_prodi', resource: 'nilai_sub_cpmk', read: true, write: false, delete: false },
      { role: 'admin_prodi', resource: 'capaian_cpl', read: true, write: true, delete: false },
      { role: 'admin_prodi', resource: 'users', read: true, write: true, delete: false },
      { role: 'admin_prodi', resource: 'audit_log', read: true, write: false, delete: false },

      // DOSEN - Input nilai kelas sendiri
      { role: 'dosen', resource: 'program_studi_cpl', read: true, write: false, delete: false },
      { role: 'dosen', resource: 'mata_kuliah_pemetaan', read: true, write: false, delete: false },
      { role: 'dosen', resource: 'sub_cpmk', read: true, write: true, delete: false },
      { role: 'dosen', resource: 'nilai_sub_cpmk', read: true, write: true, delete: false },
      { role: 'dosen', resource: 'capaian_cpl', read: true, write: false, delete: false },
      { role: 'dosen', resource: 'users', read: false, write: false, delete: false },
      { role: 'dosen', resource: 'audit_log', read: false, write: false, delete: false },

      // MAHASISWA - Lihat capaian diri sendiri
      { role: 'mahasiswa', resource: 'program_studi_cpl', read: true, write: false, delete: false },
      { role: 'mahasiswa', resource: 'mata_kuliah_pemetaan', read: true, write: false, delete: false },
      { role: 'mahasiswa', resource: 'sub_cpmk', read: true, write: false, delete: false },
      { role: 'mahasiswa', resource: 'nilai_sub_cpmk', read: false, write: false, delete: false },
      { role: 'mahasiswa', resource: 'capaian_cpl', read: true, write: false, delete: false },
      { role: 'mahasiswa', resource: 'users', read: false, write: false, delete: false },
      { role: 'mahasiswa', resource: 'audit_log', read: false, write: false, delete: false },
    ];

    // Insert permissions
    for (const perm of permissions) {
      const roleId = roles[perm.role];
      if (roleId) {
        await client.query(
          `INSERT INTO role_permissions (role_id, resource, can_read, can_write, can_delete)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (role_id, resource) DO UPDATE SET
             can_read = EXCLUDED.can_read,
             can_write = EXCLUDED.can_write,
             can_delete = EXCLUDED.can_delete`,
          [roleId, perm.resource, perm.read, perm.write, perm.delete]
        );
      }
    }

    await client.query('COMMIT');
    
    const countResult = await client.query('SELECT COUNT(*) as count FROM role_permissions');
    return {
      success: true,
      message: 'Default permissions seeded successfully',
      count: parseInt(countResult.rows[0].count),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllPermissions,
  getPermissionsByRole,
  getPermissionsByRoleName,
  checkPermission,
  checkPermissionByRoleName,
  upsertPermission,
  deletePermission,
  seedDefaultPermissions,
};
