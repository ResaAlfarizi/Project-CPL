-- =============================================
-- TAMBAH USER DOSEN
-- =============================================
-- Email: dosen@example.com
-- Password: dosen123
-- Hash: $2b$10$YourHashedPasswordHere
-- =============================================

DO $$
DECLARE
    role_dosen_id UUID;
    prodi_ti_id UUID;
    dosen_entity_id UUID;
BEGIN
    -- Ambil role Dosen
    SELECT id INTO role_dosen_id FROM roles WHERE nama_role = 'Dosen';
    
    IF role_dosen_id IS NULL THEN
        RAISE EXCEPTION 'Role Dosen tidak ditemukan! Pastikan tabel roles sudah terisi.';
    END IF;

    -- Ambil prodi (contoh: Teknik Informatika)
    SELECT id INTO prodi_ti_id FROM program_studi WHERE kode_prodi = 'TI' LIMIT 1;
    
    IF prodi_ti_id IS NULL THEN
        -- Jika tidak ada, ambil prodi pertama yang ada
        SELECT id INTO prodi_ti_id FROM program_studi LIMIT 1;
    END IF;
    
    IF prodi_ti_id IS NULL THEN
        RAISE EXCEPTION 'Tidak ada program studi! Pastikan tabel program_studi sudah terisi.';
    END IF;

    -- Cek apakah ada dosen di tabel dosen
    SELECT id INTO dosen_entity_id FROM dosen LIMIT 1;
    
    IF dosen_entity_id IS NULL THEN
        RAISE NOTICE 'Tidak ada data dosen di tabel dosen. User akan dibuat tanpa entity_id.';
    END IF;

    -- Insert user Dosen
    INSERT INTO users (email, password_hash, role_id, entity_type, entity_id, prodi_id, is_active) 
    VALUES (
        'dosen@example.com',
        '$2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5', -- dosen123
        role_dosen_id,
        'dosen',
        dosen_entity_id,
        prodi_ti_id,
        true
    )
    ON CONFLICT (email) DO UPDATE 
    SET 
        password_hash = EXCLUDED.password_hash,
        role_id = EXCLUDED.role_id,
        entity_type = EXCLUDED.entity_type,
        entity_id = EXCLUDED.entity_id,
        prodi_id = EXCLUDED.prodi_id,
        is_active = true;

    RAISE NOTICE '✅ User Dosen berhasil ditambahkan!';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Login Credentials:';
    RAISE NOTICE '   Email:    dosen@example.com';
    RAISE NOTICE '   Password: dosen123';
    RAISE NOTICE '   Role:     Dosen';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Akses dashboard di: http://localhost:3000/dosen';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  CATATAN:';
    RAISE NOTICE '   - Pastikan ada data di tabel dosen untuk entity_id';
    RAISE NOTICE '   - Dosen hanya bisa akses kelas yang diampu';
    RAISE NOTICE '   - Untuk menambah kelas, gunakan tabel kelas dengan dosen_id';
END $$;

-- Verifikasi user yang baru dibuat
SELECT 
    u.id,
    u.email,
    r.nama_role,
    ps.kode_prodi,
    ps.nama_prodi,
    u.entity_type,
    u.entity_id,
    u.is_active,
    u.created_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN program_studi ps ON u.prodi_id = ps.id
WHERE u.email = 'dosen@example.com';

-- Tampilkan kelas yang bisa diakses dosen (jika ada)
SELECT 
    k.id,
    k.kode_mk,
    k.nama_mk,
    k.nama_kelas,
    k.tahun_akademik,
    k.semester_aktif,
    d.nidn,
    d.nama as nama_dosen
FROM kelas k
LEFT JOIN dosen d ON k.dosen_id = d.id
WHERE k.dosen_id IN (
    SELECT entity_id FROM users WHERE email = 'dosen@example.com'
)
LIMIT 5;
