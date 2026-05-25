-- =============================================
-- MODUL 1: SETUP PRODI (Tim A)
-- Database Schema untuk Sistem CPL
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABEL MASTER
-- =============================================

-- Program Studi
CREATE TABLE program_studi (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_prodi  VARCHAR(20) UNIQUE NOT NULL,
    nama_prodi  VARCHAR(150) NOT NULL,
    jenjang     VARCHAR(10) NOT NULL CHECK(jenjang IN('D3','S1','S2','S3')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Capaian Pembelajaran Lulusan (CPL)
CREATE TABLE cpl (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id   UUID        NOT NULL REFERENCES program_studi(id) ON DELETE CASCADE,
    kode_cpl   VARCHAR(20) NOT NULL,
    deskripsi  TEXT        NOT NULL,
    is_active  BOOLEAN     DEFAULT TRUE,
    UNIQUE(prodi_id, kode_cpl)
);

-- Dosen
CREATE TABLE dosen (
    id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nidn  VARCHAR(20) UNIQUE NOT NULL,
    nama  VARCHAR(150) NOT NULL
);

-- Mahasiswa
CREATE TABLE mahasiswa (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id  UUID        NOT NULL REFERENCES program_studi(id),
    nim       VARCHAR(20) UNIQUE NOT NULL,
    nama      VARCHAR(150) NOT NULL,
    angkatan  SMALLINT    NOT NULL
);

-- Mata Kuliah
CREATE TABLE mata_kuliah (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id  UUID        NOT NULL REFERENCES program_studi(id),
    kode_mk   VARCHAR(20) NOT NULL,
    nama_mk   VARCHAR(200) NOT NULL,
    sks       SMALLINT    NOT NULL,
    semester  SMALLINT    NOT NULL,
    UNIQUE(prodi_id, kode_mk)
);

-- =============================================
-- TABEL PEMETAAN
-- =============================================

-- Pemetaan MK ke CPL + bobot kontribusi
-- Constraint: Σ bobot per mk_id = 1.0 (ditegakkan di aplikasi/trigger)
CREATE TABLE mk_cpl (
    id      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    mk_id   UUID         NOT NULL REFERENCES mata_kuliah(id) ON DELETE CASCADE,
    cpl_id  UUID         NOT NULL REFERENCES cpl(id) ON DELETE CASCADE,
    bobot   NUMERIC(5,4) NOT NULL CHECK(bobot > 0 AND bobot <= 1),
    UNIQUE(mk_id, cpl_id)
);

-- Sub-CPMK terikat ke mk_cpl (bukan langsung ke MK)
-- Constraint: Σ bobot per mk_cpl_id = 1.0
CREATE TABLE sub_cpmk (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    mk_cpl_id      UUID         NOT NULL REFERENCES mk_cpl(id) ON DELETE CASCADE,
    kode_sub_cpmk  VARCHAR(30)  NOT NULL,
    deskripsi      TEXT,
    bobot          NUMERIC(5,4) NOT NULL CHECK(bobot > 0 AND bobot <= 1),
    UNIQUE(mk_cpl_id, kode_sub_cpmk)
);

-- =============================================
-- TABEL THRESHOLD
-- =============================================

-- Threshold status pencapaian CPL, dapat beda per prodi
CREATE TABLE threshold_status (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id     UUID         NOT NULL REFERENCES program_studi(id),
    nama_status  VARCHAR(50)  NOT NULL,
    nilai_min    NUMERIC(5,2) NOT NULL,
    nilai_max    NUMERIC(5,2) NOT NULL,
    UNIQUE(prodi_id, nama_status)
);

-- =============================================
-- INDEX MODUL 1
-- =============================================

CREATE INDEX idx_cpl_prodi       ON cpl(prodi_id);
CREATE INDEX idx_mk_prodi        ON mata_kuliah(prodi_id);
CREATE INDEX idx_mk_cpl_mk       ON mk_cpl(mk_id);
CREATE INDEX idx_mk_cpl_cpl      ON mk_cpl(cpl_id);
CREATE INDEX idx_sub_cpmk_mkcpl  ON sub_cpmk(mk_cpl_id);
CREATE INDEX idx_mhs_prodi       ON mahasiswa(prodi_id);

-- =============================================
-- SEED DATA THRESHOLD (CONTOH)
-- =============================================
-- Uncomment dan ganti <prodi_id> dengan UUID aktual setelah insert program_studi
-- 
-- INSERT INTO threshold_status (prodi_id, nama_status, nilai_min, nilai_max) VALUES
--   ('<prodi_id>', 'Excellence',    85.00, 100.00),
--   ('<prodi_id>', 'Satisfactory',  70.00,  84.99),
--   ('<prodi_id>', 'Competent',     55.00,  69.99),
--   ('<prodi_id>', 'Developing',    40.00,  54.99),
--   ('<prodi_id>', 'Not Competent',  0.00,  39.99);
