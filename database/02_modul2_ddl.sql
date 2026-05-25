-- =============================================
-- MODUL 2: OPERASIONAL (Tim B)
-- Jalankan SETELAH DDL Modul 1 selesai
-- =============================================

-- =============================================
-- TABEL OPERASIONAL
-- =============================================

-- Kelas (Mata Kuliah yang dibuka untuk semester tertentu)
CREATE TABLE kelas (
    id              UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    mk_id           UUID       NOT NULL REFERENCES mata_kuliah(id),
    dosen_id        UUID       REFERENCES dosen(id),
    tahun_akademik  VARCHAR(9) NOT NULL,          -- '2024/2025'
    semester_aktif  SMALLINT   NOT NULL CHECK(semester_aktif IN(1,2)),
    nama_kelas      VARCHAR(20),
    UNIQUE(mk_id, tahun_akademik, semester_aktif, nama_kelas)
);

-- Enrollment (Mahasiswa terdaftar di kelas)
CREATE TABLE enrollment (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kelas_id      UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
    mahasiswa_id  UUID NOT NULL REFERENCES mahasiswa(id),
    UNIQUE(kelas_id, mahasiswa_id)
);

-- Nilai Sub-CPMK per mahasiswa
CREATE TABLE nilai_sub_cpmk (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id  UUID         NOT NULL REFERENCES enrollment(id) ON DELETE CASCADE,
    sub_cpmk_id    UUID         NOT NULL REFERENCES sub_cpmk(id),
    nilai          NUMERIC(6,2) NOT NULL CHECK(nilai >= 0 AND nilai <= 100),
    input_at       TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(enrollment_id, sub_cpmk_id)
);

-- Capaian CPL per MK (hasil kalkulasi)
CREATE TABLE capaian_cpl_mk (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id  UUID         NOT NULL REFERENCES enrollment(id) ON DELETE CASCADE,
    mk_cpl_id      UUID         NOT NULL REFERENCES mk_cpl(id),
    nilai_capaian  NUMERIC(6,2),
    status         VARCHAR(30),
    calculated_at  TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(enrollment_id, mk_cpl_id)
);

-- Capaian CPL total per mahasiswa (hasil agregasi)
CREATE TABLE capaian_cpl_mahasiswa (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    mahasiswa_id    UUID         NOT NULL REFERENCES mahasiswa(id),
    cpl_id          UUID         NOT NULL REFERENCES cpl(id),
    tahun_akademik  VARCHAR(9),
    nilai_capaian   NUMERIC(6,2),
    status          VARCHAR(30),
    calculated_at   TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(mahasiswa_id, cpl_id, tahun_akademik)
);

-- =============================================
-- VIEW: CAPAIAN CPL
-- =============================================

-- VIEW: Capaian CPL per mahasiswa per MK
-- nilai_cpl_di_mk = SUM(nilai_sub_cpmk × bobot_sub_cpmk)
CREATE OR REPLACE VIEW v_capaian_cpl_mk AS
SELECT
    e.id                          AS enrollment_id,
    e.mahasiswa_id,
    k.mk_id,
    mc.cpl_id,
    mc.id                         AS mk_cpl_id,
    mc.bobot                      AS bobot_mk_ke_cpl,
    SUM(n.nilai * sc.bobot)       AS nilai_capaian_cpl_mk
FROM enrollment e
JOIN kelas k           ON e.kelas_id      = k.id
JOIN mk_cpl mc         ON mc.mk_id        = k.mk_id
JOIN sub_cpmk sc       ON sc.mk_cpl_id    = mc.id
LEFT JOIN nilai_sub_cpmk n
    ON n.enrollment_id = e.id
    AND n.sub_cpmk_id  = sc.id
GROUP BY e.id, e.mahasiswa_id, k.mk_id, mc.cpl_id, mc.id, mc.bobot;

-- VIEW: Agregasi CPL total per mahasiswa
-- nilai_cpl_total = SUM(capaian_mk × bobot_mk) / SUM(bobot_mk)
CREATE OR REPLACE VIEW v_capaian_cpl_mahasiswa AS
SELECT
    v.mahasiswa_id,
    v.cpl_id,
    ROUND(
        SUM(v.nilai_capaian_cpl_mk * v.bobot_mk_ke_cpl) / 
        NULLIF(SUM(v.bobot_mk_ke_cpl), 0), 
        2
    ) AS nilai_cpl_total
FROM v_capaian_cpl_mk v
WHERE v.nilai_capaian_cpl_mk IS NOT NULL
GROUP BY v.mahasiswa_id, v.cpl_id;

-- =============================================
-- FUNCTION: GET STATUS CPL
-- =============================================

-- FUNCTION: ambil status berdasarkan nilai & prodi
CREATE OR REPLACE FUNCTION get_status_cpl(p_prodi_id UUID, p_nilai NUMERIC)
RETURNS VARCHAR AS $$
BEGIN
    RETURN (
        SELECT nama_status 
        FROM threshold_status
        WHERE prodi_id = p_prodi_id
        AND p_nilai BETWEEN nilai_min AND nilai_max
        ORDER BY nilai_min DESC 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PROCEDURE: HITUNG CAPAIAN
-- =============================================

-- PROCEDURE: hitung & simpan capaian CPL MK per enrollment
CREATE OR REPLACE PROCEDURE hitung_capaian_cpl_mk(p_enrollment_id UUID)
LANGUAGE plpgsql AS $$
DECLARE 
    v_prodi_id UUID;
BEGIN
    SELECT m.prodi_id INTO v_prodi_id
    FROM enrollment e 
    JOIN mahasiswa m ON e.mahasiswa_id = m.id
    WHERE e.id = p_enrollment_id;

    INSERT INTO capaian_cpl_mk(enrollment_id, mk_cpl_id, nilai_capaian, status)
    SELECT 
        enrollment_id, 
        mk_cpl_id, 
        nilai_capaian_cpl_mk,
        get_status_cpl(v_prodi_id, nilai_capaian_cpl_mk)
    FROM v_capaian_cpl_mk
    WHERE enrollment_id = p_enrollment_id
    ON CONFLICT(enrollment_id, mk_cpl_id) DO UPDATE SET
        nilai_capaian = EXCLUDED.nilai_capaian,
        status        = EXCLUDED.status,
        calculated_at = NOW();
END;
$$;

-- =============================================
-- INDEX OPERASIONAL
-- =============================================

CREATE INDEX idx_kelas_mk        ON kelas(mk_id);
CREATE INDEX idx_kelas_dosen     ON kelas(dosen_id);
CREATE INDEX idx_enroll_kelas    ON enrollment(kelas_id);
CREATE INDEX idx_enroll_mhs      ON enrollment(mahasiswa_id);
CREATE INDEX idx_nilai_enroll    ON nilai_sub_cpmk(enrollment_id);
CREATE INDEX idx_capaian_mk_enr  ON capaian_cpl_mk(enrollment_id);
CREATE INDEX idx_capaian_mhs     ON capaian_cpl_mahasiswa(mahasiswa_id, cpl_id);
