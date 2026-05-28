-- =============================================
-- TAMBAH USER ADMIN PRODI
-- =============================================
-- Email: adminprodi@example.com
-- Password: admin123
-- Hash: $2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5
-- =============================================

DO $$
DECLARE
    role_admin_prodi_id UUID;
    prodi_ti_id UUID;
BEGIN
    -- Ambil role Admin Prodi
    SELECT id INTO role_admin_prodi_id FROM roles WHERE nama_role = 'Admin Prodi';
    
    IF role_admin_prodi_id IS NULL THEN
        RAISE EXCEPTION 'Role Admin Prodi tidak ditemukan! Pastikan tabel roles sudah terisi.';
    END IF;

    -- Ambil prodi TI (atau prodi pertama yang ada)
    SELECT id INTO prodi_ti_id FROM program_studi LIMIT 1;
    
    IF prodi_ti_id IS NULL THEN
        RAISE EXCEPTION 'Tidak ada program studi! Pastikan tabel program_studi sudah terisi.';
    END IF;

    -- Insert user Admin Prodi
    INSERT INTO users (email, password_hash, role_id, entity_type, prodi_id, is_active) 
    VALUES (
        'adminprodi@example.com',
        '$2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5',
        role_admin_prodi_id,
        'admin',
        prodi_ti_id,
        true
    )
    ON CONFLICT (email) DO UPDATE 
    SET 
        password_hash = EXCLUDED.password_hash,
        role_id = EXCLUDED.role_id,
        prodi_id = EXCLUDED.prodi_id,
        is_active = true;

    RAISE NOTICE '✅ User Admin Prodi berhasil ditambahkan!';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Login Credentials:';
    RAISE NOTICE '   Email:    adminprodi@example.com';
    RAISE NOTICE '   Password: admin123';
    RAISE NOTICE '   Role:     Admin Prodi';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Akses dashboard di: http://localhost:3000/admin-prodi';
END $$;

-- Verifikasi user yang baru dibuat
SELECT 
    u.id,
    u.email,
    r.nama_role,
    ps.kode_prodi,
    ps.nama_prodi,
    u.is_active,
    u.created_at
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE u.email = 'adminprodi@example.com';
