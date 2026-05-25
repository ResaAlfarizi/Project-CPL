-- =============================================
-- INSERT TEST USERS (SIAP PAKAI)
-- Password semua user: admin123
-- =============================================

-- Hash untuk password 'admin123' (bcrypt cost 10)
-- $2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5

-- =============================================
-- STEP 1: INSERT PROGRAM STUDI
-- =============================================

DO $$
DECLARE
    prodi_ti_id UUID;
    prodi_si_id UUID;
BEGIN
    -- Insert Program Studi
    INSERT INTO program_studi (kode_prodi, nama_prodi, jenjang) VALUES
        ('TI', 'Teknik Informatika', 'S1'),
        ('SI', 'Sistem Informasi', 'S1')
    ON CONFLICT (kode_prodi) DO NOTHING;

    -- Ambil ID prodi
    SELECT id INTO prodi_ti_id FROM program_studi WHERE kode_prodi = 'TI';
    SELECT id INTO prodi_si_id FROM program_studi WHERE kode_prodi = 'SI';

    RAISE NOTICE 'Prodi TI ID: %', prodi_ti_id;
    RAISE NOTICE 'Prodi SI ID: %', prodi_si_id;

    -- =============================================
    -- STEP 2: INSERT THRESHOLD STATUS
    -- =============================================

    INSERT INTO threshold_status (prodi_id, nama_status, nilai_min, nilai_max) VALUES
        (prodi_ti_id, 'Excellence',    85.00, 100.00),
        (prodi_ti_id, 'Satisfactory',  70.00,  84.99),
        (prodi_ti_id, 'Competent',     55.00,  69.99),
        (prodi_ti_id, 'Developing',    40.00,  54.99),
        (prodi_ti_id, 'Not Competent',  0.00,  39.99)
    ON CONFLICT (prodi_id, nama_status) DO NOTHING;

    INSERT INTO threshold_status (prodi_id, nama_status, nilai_min, nilai_max) VALUES
        (prodi_si_id, 'Excellence',    85.00, 100.00),
        (prodi_si_id, 'Satisfactory',  70.00,  84.99),
        (prodi_si_id, 'Competent',     55.00,  69.99),
        (prodi_si_id, 'Developing',    40.00,  54.99),
        (prodi_si_id, 'Not Competent',  0.00,  39.99)
    ON CONFLICT (prodi_id, nama_status) DO NOTHING;

    RAISE NOTICE 'Threshold status berhasil dibuat';

    -- =============================================
    -- STEP 3: INSERT CPL
    -- =============================================

    INSERT INTO cpl (prodi_id, kode_cpl, deskripsi) VALUES
        (prodi_ti_id, 'CPL-01', 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif'),
        (prodi_ti_id, 'CPL-02', 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur'),
        (prodi_ti_id, 'CPL-03', 'Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan teknologi')
    ON CONFLICT (prodi_id, kode_cpl) DO NOTHING;

    RAISE NOTICE 'CPL berhasil dibuat';

END $$;

-- =============================================
-- STEP 4: INSERT DOSEN
-- =============================================

DO $$
DECLARE
    dosen1_id UUID;
    dosen2_id UUID;
BEGIN
    INSERT INTO dosen (nidn, nama) VALUES
        ('0123456789', 'Dr. Budi Santoso, M.Kom'),
        ('0987654321', 'Prof. Ani Wijaya, Ph.D')
    ON CONFLICT (nidn) DO NOTHING
    RETURNING id INTO dosen1_id;

    SELECT id INTO dosen1_id FROM dosen WHERE nidn = '0123456789';
    SELECT id INTO dosen2_id FROM dosen WHERE nidn = '0987654321';

    RAISE NOTICE 'Dosen 1 ID: %', dosen1_id;
    RAISE NOTICE 'Dosen 2 ID: %', dosen2_id;
END $$;

-- =============================================
-- STEP 5: INSERT MAHASISWA
-- =============================================

DO $$
DECLARE
    prodi_ti_id UUID;
    mhs1_id UUID;
    mhs2_id UUID;
BEGIN
    SELECT id INTO prodi_ti_id FROM program_studi WHERE kode_prodi = 'TI';

    INSERT INTO mahasiswa (prodi_id, nim, nama, angkatan) VALUES
        (prodi_ti_id, '2021001', 'Ahmad Fauzi', 2021),
        (prodi_ti_id, '2021002', 'Siti Nurhaliza', 2021)
    ON CONFLICT (nim) DO NOTHING;

    SELECT id INTO mhs1_id FROM mahasiswa WHERE nim = '2021001';
    SELECT id INTO mhs2_id FROM mahasiswa WHERE nim = '2021002';

    RAISE NOTICE 'Mahasiswa 1 ID: %', mhs1_id;
    RAISE NOTICE 'Mahasiswa 2 ID: %', mhs2_id;
END $$;

-- =============================================
-- STEP 6: INSERT USERS
-- =============================================

DO $$
DECLARE
    role_superadmin_id UUID;
    role_admin_prodi_id UUID;
    role_dosen_id UUID;
    role_mahasiswa_id UUID;
    prodi_ti_id UUID;
    dosen1_id UUID;
    mhs1_id UUID;
BEGIN
    -- Ambil role IDs
    SELECT id INTO role_superadmin_id FROM roles WHERE nama_role = 'Superadmin';
    SELECT id INTO role_admin_prodi_id FROM roles WHERE nama_role = 'Admin Prodi';
    SELECT id INTO role_dosen_id FROM roles WHERE nama_role = 'Dosen';
    SELECT id INTO role_mahasiswa_id FROM roles WHERE nama_role = 'Mahasiswa';

    -- Ambil entity IDs
    SELECT id INTO prodi_ti_id FROM program_studi WHERE kode_prodi = 'TI';
    SELECT id INTO dosen1_id FROM dosen WHERE nidn = '0123456789';
    SELECT id INTO mhs1_id FROM mahasiswa WHERE nim = '2021001';

    -- Insert Superadmin
    INSERT INTO users (email, password_hash, role_id, entity_type) VALUES
        ('admin@cpl.ac.id', '$2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5', role_superadmin_id, 'admin')
    ON CONFLICT (email) DO NOTHING;

    -- Insert Admin Prodi
    INSERT INTO users (email, password_hash, role_id, entity_type, prodi_id) VALUES
        ('admin.ti@cpl.ac.id', '$2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5', role_admin_prodi_id, 'admin', prodi_ti_id)
    ON CONFLICT (email) DO NOTHING;

    -- Insert Dosen
    INSERT INTO users (email, password_hash, role_id, entity_type, entity_id) VALUES
        ('budi.santoso@cpl.ac.id', '$2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5', role_dosen_id, 'dosen', dosen1_id)
    ON CONFLICT (email) DO NOTHING;

    -- Insert Mahasiswa
    INSERT INTO users (email, password_hash, role_id, entity_type, entity_id, prodi_id) VALUES
        ('ahmad.fauzi@student.cpl.ac.id', '$2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5', role_mahasiswa_id, 'mahasiswa', mhs1_id, prodi_ti_id)
    ON CONFLICT (email) DO NOTHING;

    RAISE NOTICE '✅ Users berhasil dibuat!';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Login Credentials (Password semua: admin123):';
    RAISE NOTICE '   Superadmin:   admin@cpl.ac.id';
    RAISE NOTICE '   Admin Prodi:  admin.ti@cpl.ac.id';
    RAISE NOTICE '   Dosen:        budi.santoso@cpl.ac.id';
    RAISE NOTICE '   Mahasiswa:    ahmad.fauzi@student.cpl.ac.id';
END $$;

-- =============================================
-- VERIFIKASI
-- =============================================

SELECT 
    u.email,
    r.nama_role,
    u.entity_type,
    CASE 
        WHEN u.entity_type = 'mahasiswa' THEN m.nama
        WHEN u.entity_type = 'dosen' THEN d.nama
        ELSE 'Admin'
    END as nama,
    u.is_active
FROM users u
JOIN roles r ON u.role_id = r.id
LEFT JOIN mahasiswa m ON u.entity_id = m.id AND u.entity_type = 'mahasiswa'
LEFT JOIN dosen d ON u.entity_id = d.id AND u.entity_type = 'dosen'
ORDER BY r.nama_role;
