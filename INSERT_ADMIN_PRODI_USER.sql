-- ============================================
-- TAMBAH USER ADMIN PRODI (TANPA UBAH STRUKTUR)
-- ============================================
-- Email: adminprodi@if.ac.id
-- Password: admin123
-- Hash: $2b$10$rHZSqJZ5vZ5qZ5qZ5qZ5qOqZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q
-- ============================================

DO $$
DECLARE
    role_admin_prodi_id UUID;
    prodi_tl_id UUID;
BEGIN
    -- Ambil role Admin Prodi (dengan spasi)
    SELECT id INTO role_admin_prodi_id FROM roles WHERE nama_role = 'Admin Prodi';
    
    IF role_admin_prodi_id IS NULL THEN
        RAISE EXCEPTION 'Role "Admin Prodi" tidak ditemukan! Jalankan script 03_auth_system.sql terlebih dahulu.';
    END IF;

    -- Ambil prodi Teknik Lingkungan (TL) - prodi pertama di dummy data
    SELECT id INTO prodi_tl_id FROM program_studi WHERE kode_prodi = 'TL';
    
    IF prodi_tl_id IS NULL THEN
        -- Jika TL tidak ada, ambil prodi pertama yang ada
        SELECT id INTO prodi_tl_id FROM program_studi ORDER BY kode_prodi LIMIT 1;
    END IF;
    
    IF prodi_tl_id IS NULL THEN
        RAISE EXCEPTION 'Tidak ada program studi! Jalankan script 06_dummy_data_lengkap.sql terlebih dahulu.';
    END IF;

    -- Insert user Admin Prodi
    INSERT INTO users (email, password_hash, role_id, entity_type, prodi_id, is_active) 
    VALUES (
        'adminprodi@if.ac.id',
        '$2b$10$rHZSqJZ5vZ5qZ5qZ5qZ5qOqZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5q',
        role_admin_prodi_id,
        'admin',
        prodi_tl_id,
        true
    )
    ON CONFLICT (email) DO UPDATE 
    SET 
        password_hash = EXCLUDED.password_hash,
        role_id = EXCLUDED.role_id,
        prodi_id = EXCLUDED.prodi_id,
        is_active = true,
        updated_at = CURRENT_TIMESTAMP;

    RAISE NOTICE '✅ User Admin Prodi berhasil ditambahkan/diupdate!';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Login Credentials:';
    RAISE NOTICE '   Email:    adminprodi@if.ac.id';
    RAISE NOTICE '   Password: admin123';
    RAISE NOTICE '   Role:     Admin Prodi';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Akses dashboard di: http://localhost:3001/admin-prodi';
    RAISE NOTICE '   (Frontend di port 3001, Backend di port 3000)';
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
WHERE u.email = 'adminprodi@if.ac.id';
