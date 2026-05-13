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
