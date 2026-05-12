-- ====================================================================================
-- SKRIP 1: DDL (DATA DEFINITION LANGUAGE) - 7 ALUR SETUP CPL
-- Eksekutor: Ammar Arifin (Database Manager)
-- ====================================================================================

-- ① Pendaftaran Program Studi 
CREATE TABLE program_studi (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_prodi  VARCHAR(20)   UNIQUE NOT NULL,
    nama_prodi  VARCHAR(150)  NOT NULL,
    jenjang     VARCHAR(10)   NOT NULL CHECK (jenjang IN ('D3','S1','S2','S3')),
    created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- ② Pendefinisian CPL Program Studi 
CREATE TABLE cpl (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id    UUID          NOT NULL REFERENCES program_studi(id) ON DELETE CASCADE,
    kode_cpl    VARCHAR(20)   NOT NULL,
    deskripsi   TEXT          NOT NULL,
    is_active   BOOLEAN       DEFAULT TRUE,
    UNIQUE (prodi_id, kode_cpl)
);

-- ③ Pendaftaran Dosen & Mahasiswa 
CREATE TABLE dosen (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    nidn        VARCHAR(20)   UNIQUE NOT NULL,
    nama        VARCHAR(150)  NOT NULL,
    prodi_id    UUID          REFERENCES program_studi(id) ON DELETE SET NULL,
    role        VARCHAR(20)   NOT NULL CHECK (role IN ('superadmin', 'admin', 'dosen')),
    is_active   BOOLEAN       DEFAULT TRUE
);

CREATE TABLE mahasiswa (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id    UUID          NOT NULL REFERENCES program_studi(id),
    nim         VARCHAR(20)   UNIQUE NOT NULL,
    nama        VARCHAR(150)  NOT NULL,
    angkatan    SMALLINT      NOT NULL,
    is_active   BOOLEAN       DEFAULT TRUE
);

-- ④ Pendaftaran Mata Kuliah (MK) 
CREATE TABLE mata_kuliah (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id    UUID          NOT NULL REFERENCES program_studi(id),
    kode_mk     VARCHAR(20)   NOT NULL,
    nama_mk     VARCHAR(200)  NOT NULL,
    sks         SMALLINT      NOT NULL,
    semester    SMALLINT      NOT NULL,
    UNIQUE (prodi_id, kode_mk)
);

-- ⑤ Pemetaan MK → CPL 
CREATE TABLE mk_cpl (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    mk_id       UUID          NOT NULL REFERENCES mata_kuliah(id) ON DELETE CASCADE,
    cpl_id      UUID          NOT NULL REFERENCES cpl(id) ON DELETE CASCADE,
    bobot       NUMERIC(5,4)  NOT NULL CHECK (bobot > 0 AND bobot <= 1),
    UNIQUE (mk_id, cpl_id)
);

-- ⑥ Pendefinisian Sub-CPMK per MK 
CREATE TABLE sub_cpmk (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    mk_cpl_id      UUID          NOT NULL REFERENCES mk_cpl(id) ON DELETE CASCADE,
    kode_sub_cpmk  VARCHAR(30)   NOT NULL,
    deskripsi      TEXT,
    bobot          NUMERIC(5,4)  NOT NULL CHECK (bobot > 0 AND bobot <= 1),
    UNIQUE (mk_cpl_id, kode_sub_cpmk)
);

-- ⑦ Konfigurasi Threshold Status
CREATE TABLE threshold_status (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id     UUID          NOT NULL REFERENCES program_studi(id),
    nama_status  VARCHAR(50)   NOT NULL,
    nilai_min    NUMERIC(5,2)  NOT NULL,
    nilai_max    NUMERIC(5,2)  NOT NULL,
    UNIQUE (prodi_id, nama_status)
);

-- Pembuatan Index 
CREATE INDEX idx_cpl_prodi        ON cpl(prodi_id);
CREATE INDEX idx_mk_prodi         ON mata_kuliah(prodi_id);
CREATE INDEX idx_mk_cpl_mk        ON mk_cpl(mk_id);
CREATE INDEX idx_mk_cpl_cpl       ON mk_cpl(cpl_id);
CREATE INDEX idx_sub_cpmk_mkcpl   ON sub_cpmk(mk_cpl_id);
CREATE INDEX idx_mhs_prodi        ON mahasiswa(prodi_id);

-- ====================================================================================
-- SKRIP 2: DML (SEEDING) - IMPLEMENTASI 7 ALUR SETUP
-- Eksekutor: Ammar Arifin (Database Manager)
-- ====================================================================================

-- ① Pendaftaran Program Studi
INSERT INTO program_studi (kode_prodi, nama_prodi, jenjang) VALUES 
('0906', 'Sistem Informasi', 'S1'),
('0903', 'Arsitektur', 'S1'),
('0901', 'Biologi', 'S1');

-- ② Pendefinisian CPL
INSERT INTO cpl (prodi_id, kode_cpl, deskripsi) VALUES 
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'CPL-01', 'Mampu merancang arsitektur perangkat lunak dan desain antarmuka (UI/UX)'),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'CPL-02', 'Mampu mengimplementasikan pemrograman berbasis web dan mobile');

-- ③ Pendaftaran Dosen & Mahasiswa
INSERT INTO dosen (nidn, nama, prodi_id, role) VALUES 
('0000000000', 'Superadmin IT FST', NULL, 'superadmin'),
('197909272014032001', 'Dwi Rolliawati, MT', (SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'admin'),
('197906092014031002', 'Khalid, M. Kom', (SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'admin'),
('198810262014031003', 'Dr. Achmad Teguh Wibowo, M.T.', (SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'dosen'),
('198403072014031001', 'Muhammad Andik Izzuddin, MT', (SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'dosen'),
('198604272014031004', 'Mujib Ridwan, S.Kom., M.T', (SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'dosen'),
('197911132014031001', 'Dr. Eng. Anang Kunaefi, M. Kom', (SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'dosen');

INSERT INTO mahasiswa (prodi_id, nim, nama, angkatan) VALUES 
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), '09020624032', 'Hafidz Arkaan Syauqi', 2024),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), '09020624070', 'Zahwa Neida Yasmin', 2024),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), '09020624027', 'Diaz Asbahna Fitroh Azzani', 2024),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), '09020624026', 'Daffa Danendra Fairuzza', 2024),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), '09020624028', 'Eva Amilia', 2024),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), '09040624081', 'Ammar Arifin', 2024),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), '09010624017', 'Titha Auliya Khotim', 2024);

-- ④ Pendaftaran Mata Kuliah (Sesuai KRS & Transkrip)
INSERT INTO mata_kuliah (prodi_id, kode_mk, nama_mk, sks, semester) VALUES 
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'SIF121105', 'Basis Data', 3, 2),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'SIF121112', 'Rekayasa Perangkat Lunak', 3, 3),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'SIF121123', 'Software Quality Assurance', 3, 4),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'SIF121117', 'Mobile and Web Programming', 4, 4);

-- ⑤ Pemetaan MK → CPL (Aturan: Σ bobot per MK = 1.0)
INSERT INTO mk_cpl (mk_id, cpl_id, bobot) VALUES 
((SELECT id FROM mata_kuliah WHERE kode_mk = 'SIF121123'), (SELECT id FROM cpl WHERE kode_cpl = 'CPL-01'), 1.0000), -- SQA 100% CPL-01
((SELECT id FROM mata_kuliah WHERE kode_mk = 'SIF121117'), (SELECT id FROM cpl WHERE kode_cpl = 'CPL-02'), 1.0000); -- Mobile Web 100% CPL-02

-- ⑥ Pendefinisian Sub-CPMK (Aturan: Σ bobot per mk_cpl = 1.0)
INSERT INTO sub_cpmk (mk_cpl_id, kode_sub_cpmk, deskripsi, bobot) VALUES 
((SELECT mk.id FROM mk_cpl mk JOIN mata_kuliah m ON mk.mk_id = m.id WHERE m.kode_mk = 'SIF121117'), 'SIF121117-01', 'Mampu membuat REST API Backend', 0.5000),
((SELECT mk.id FROM mk_cpl mk JOIN mata_kuliah m ON mk.mk_id = m.id WHERE m.kode_mk = 'SIF121117'), 'SIF121117-02', 'Mampu membuat Frontend Web/Mobile', 0.5000);

-- ⑦ Konfigurasi Threshold Status
INSERT INTO threshold_status (prodi_id, nama_status, nilai_min, nilai_max) VALUES 
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'Excellence', 85.00, 100.00),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'Satisfactory', 70.00, 84.99),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'Competent', 55.00, 69.99),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'Developing', 40.00, 54.99),
((SELECT id FROM program_studi WHERE kode_prodi = '0906'), 'Not Competent', 0.00, 39.99);