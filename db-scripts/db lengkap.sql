-- =============================================
-- MODUL 1: SETUP PRODI  (Tim A)
-- =============================================

CREATE TABLE program_studi (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_prodi  VARCHAR(20) UNIQUE NOT NULL,
    nama_prodi  VARCHAR(150) NOT NULL,
    jenjang     VARCHAR(10) NOT NULL CHECK(jenjang IN('D3','S1','S2','S3')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cpl (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id   UUID        NOT NULL REFERENCES program_studi(id) ON DELETE CASCADE,
    kode_cpl   VARCHAR(20) NOT NULL,
    deskripsi  TEXT        NOT NULL,
    is_active  BOOLEAN     DEFAULT TRUE,
    UNIQUE(prodi_id, kode_cpl)
);

CREATE TABLE dosen (
    id    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nidn  VARCHAR(20) UNIQUE NOT NULL,
    nama  VARCHAR(150) NOT NULL
);

CREATE TABLE mahasiswa (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id  UUID        NOT NULL REFERENCES program_studi(id),
    nim       VARCHAR(20) UNIQUE NOT NULL,
    nama      VARCHAR(150) NOT NULL,
    angkatan  SMALLINT    NOT NULL
);

CREATE TABLE mata_kuliah (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id  UUID        NOT NULL REFERENCES program_studi(id),
    kode_mk   VARCHAR(20) NOT NULL,
    nama_mk   VARCHAR(200) NOT NULL,
    sks       SMALLINT    NOT NULL,
    semester  SMALLINT    NOT NULL,
    UNIQUE(prodi_id, kode_mk)
);

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

-- Threshold status pencapaian CPL, dapat beda per prodi
CREATE TABLE threshold_status (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    prodi_id     UUID         NOT NULL REFERENCES program_studi(id),
    nama_status  VARCHAR(50)  NOT NULL,
    nilai_min    NUMERIC(5,2) NOT NULL,
    nilai_max    NUMERIC(5,2) NOT NULL,
    UNIQUE(prodi_id, nama_status)
);

-- Seed default threshold (ganti <prodi_id> dengan UUID aktual)
-- INSERT INTO threshold_status (prodi_id, nama_status, nilai_min, nilai_max) VALUES
--   ('<prodi_id>', 'Excellence',    85.00, 100.00),
--   ('<prodi_id>', 'Satisfactory',  70.00,  84.99),
--   ('<prodi_id>', 'Competent',     55.00,  69.99),
--   ('<prodi_id>', 'Developing',    40.00,  54.99),
--   ('<prodi_id>', 'Not Competent',  0.00,  39.99);

-- Index Modul 1
CREATE INDEX idx_cpl_prodi       ON cpl(prodi_id);
CREATE INDEX idx_mk_prodi        ON mata_kuliah(prodi_id);
CREATE INDEX idx_mk_cpl_mk       ON mk_cpl(mk_id);
CREATE INDEX idx_mk_cpl_cpl      ON mk_cpl(cpl_id);
CREATE INDEX idx_sub_cpmk_mkcpl  ON sub_cpmk(mk_cpl_id);
CREATE INDEX idx_mhs_prodi       ON mahasiswa(prodi_id);

-- =============================================
-- MODUL 2: OPERASIONAL  (Tim B)
-- Jalankan SETELAH DDL Modul 1 selesai
-- =============================================

CREATE TABLE kelas (
    id              UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    mk_id           UUID       NOT NULL REFERENCES mata_kuliah(id),
    dosen_id        UUID       REFERENCES dosen(id),
    tahun_akademik  VARCHAR(9) NOT NULL,          -- '2024/2025'
    semester_aktif  SMALLINT   NOT NULL CHECK(semester_aktif IN(1,2)),
    nama_kelas      VARCHAR(20),
    UNIQUE(mk_id, tahun_akademik, semester_aktif, nama_kelas)
);

CREATE TABLE enrollment (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kelas_id      UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
    mahasiswa_id  UUID NOT NULL REFERENCES mahasiswa(id),
    UNIQUE(kelas_id, mahasiswa_id)
);

CREATE TABLE nilai_sub_cpmk (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id  UUID         NOT NULL REFERENCES enrollment(id) ON DELETE CASCADE,
    sub_cpmk_id    UUID         NOT NULL REFERENCES sub_cpmk(id),
    nilai          NUMERIC(6,2) NOT NULL CHECK(nilai >= 0 AND nilai <= 100),
    input_at       TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(enrollment_id, sub_cpmk_id)
);

CREATE TABLE capaian_cpl_mk (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id  UUID         NOT NULL REFERENCES enrollment(id) ON DELETE CASCADE,
    mk_cpl_id      UUID         NOT NULL REFERENCES mk_cpl(id),
    nilai_capaian  NUMERIC(6,2),
    status         VARCHAR(30),
    calculated_at  TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(enrollment_id, mk_cpl_id)
);

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
    SUM(n.nilai * sc.bobot)        AS nilai_capaian_cpl_mk
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
        SUM(v.nilai_capaian_cpl_mk * v.bobot_mk_ke_cpl)
        / NULLIF(SUM(v.bobot_mk_ke_cpl), 0), 2
    )                             AS nilai_cpl_total
FROM v_capaian_cpl_mk v
WHERE v.nilai_capaian_cpl_mk IS NOT NULL
GROUP BY v.mahasiswa_id, v.cpl_id;

-- FUNCTION: ambil status berdasarkan nilai & prodi
CREATE OR REPLACE FUNCTION get_status_cpl(p_prodi_id UUID, p_nilai NUMERIC)
RETURNS VARCHAR AS $$
BEGIN
    RETURN (
        SELECT nama_status FROM threshold_status
        WHERE prodi_id = p_prodi_id
          AND p_nilai BETWEEN nilai_min AND nilai_max
        ORDER BY nilai_min DESC LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- PROCEDURE: hitung & simpan capaian CPL MK per enrollment
CREATE OR REPLACE PROCEDURE hitung_capaian_cpl_mk(p_enrollment_id UUID)
LANGUAGE plpgsql AS $$
DECLARE v_prodi_id UUID;
BEGIN
    SELECT m.prodi_id INTO v_prodi_id
    FROM enrollment e JOIN mahasiswa m ON e.mahasiswa_id = m.id
    WHERE e.id = p_enrollment_id;

    INSERT INTO capaian_cpl_mk(enrollment_id, mk_cpl_id, nilai_capaian, status)
    SELECT enrollment_id, mk_cpl_id, nilai_capaian_cpl_mk,
           get_status_cpl(v_prodi_id, nilai_capaian_cpl_mk)
    FROM   v_capaian_cpl_mk
    WHERE  enrollment_id = p_enrollment_id
    ON CONFLICT(enrollment_id, mk_cpl_id) DO UPDATE SET
        nilai_capaian = EXCLUDED.nilai_capaian,
        status        = EXCLUDED.status,
        calculated_at = NOW();
END;
$$;

-- Index operasional
CREATE INDEX idx_kelas_mk        ON kelas(mk_id);
CREATE INDEX idx_kelas_dosen     ON kelas(dosen_id);
CREATE INDEX idx_enroll_kelas    ON enrollment(kelas_id);
CREATE INDEX idx_enroll_mhs      ON enrollment(mahasiswa_id);
CREATE INDEX idx_nilai_enroll    ON nilai_sub_cpmk(enrollment_id);
CREATE INDEX idx_capaian_mk_enr  ON capaian_cpl_mk(enrollment_id);
CREATE INDEX idx_capaian_mhs     ON capaian_cpl_mahasiswa(mahasiswa_id, cpl_id);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE roles (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_role  VARCHAR(50) UNIQUE NOT NULL,
    deskripsi  TEXT
);
INSERT INTO roles(nama_role, deskripsi) VALUES
    ('superadmin',  'Akses penuh seluruh sistem'),
    ('admin_prodi', 'Kelola data satu program studi'),
    ('dosen',       'Input nilai kelas sendiri'),
    ('mahasiswa',   'Lihat capaian CPL diri sendiri');

CREATE TABLE users (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(200) UNIQUE NOT NULL,
    password_hash       TEXT        NOT NULL,
    role_id             UUID        NOT NULL REFERENCES roles(id),
    prodi_id            UUID        REFERENCES program_studi(id),
    entity_type         VARCHAR(20) CHECK(entity_type IN('dosen','mahasiswa','admin')),
    entity_id           UUID,
    is_active           BOOLEAN     DEFAULT TRUE,
    failed_login_count  SMALLINT    DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE role_permissions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id     UUID        NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    resource    VARCHAR(80) NOT NULL,
    can_read    BOOLEAN     DEFAULT FALSE,
    can_write   BOOLEAN     DEFAULT FALSE,
    can_delete  BOOLEAN     DEFAULT FALSE,
    UNIQUE(role_id, resource)
);

CREATE TABLE refresh_tokens (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash   TEXT        NOT NULL UNIQUE,
    device_info  TEXT,
    ip_address   INET,
    expires_at   TIMESTAMPTZ NOT NULL,
    revoked_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE password_resets (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auth_audit_log (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     UUID        REFERENCES users(id),
    event_type  VARCHAR(30) NOT NULL CHECK(event_type IN(
                    'login_success','login_failed','logout',
                    'token_refresh','account_locked',
                    'password_reset_req','password_changed')),
    ip_address  INET,
    user_agent  TEXT,
    detail      JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- FUNCTION: handle login attempt + auto lockout
CREATE OR REPLACE FUNCTION handle_login_attempt(
    p_user_id UUID, p_success BOOLEAN,
    p_ip INET DEFAULT NULL, p_ua TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    IF p_success THEN
        UPDATE users SET
            failed_login_count = 0, locked_until = NULL, last_login_at = NOW()
        WHERE id = p_user_id;
        INSERT INTO auth_audit_log(user_id,event_type,ip_address,user_agent)
        VALUES(p_user_id,'login_success',p_ip,p_ua);
    ELSE
        UPDATE users SET
            failed_login_count = failed_login_count + 1,
            locked_until = CASE WHEN failed_login_count + 1 >= 5
                THEN NOW() + INTERVAL '15 minutes'
                ELSE locked_until END
        WHERE id = p_user_id;
        INSERT INTO auth_audit_log(user_id,event_type,ip_address,user_agent)
        VALUES(p_user_id,
            CASE WHEN(SELECT failed_login_count FROM users WHERE id=p_user_id)>=5
            THEN 'account_locked' ELSE 'login_failed' END, p_ip, p_ua);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION: revoke semua session user (logout all devices)
CREATE OR REPLACE FUNCTION revoke_all_tokens(p_user_id UUID) RETURNS INT AS $$
DECLARE v_count INT;
BEGIN
    UPDATE refresh_tokens SET revoked_at = NOW()
    WHERE  user_id = p_user_id AND revoked_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Index autentikasi
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_entity   ON users(entity_type, entity_id);
CREATE INDEX idx_refresh_hash   ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_user   ON refresh_tokens(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_audit_user     ON auth_audit_log(user_id, created_at DESC);

-- Row-Level Security: mahasiswa hanya baca capaian diri sendiri
ALTER TABLE capaian_cpl_mahasiswa ENABLE ROW LEVEL SECURITY;
CREATE POLICY mhs_own_capaian ON capaian_cpl_mahasiswa
    FOR SELECT USING(
        mahasiswa_id = current_setting('app.current_entity_id')::UUID
    );

-- Row-Level Security: dosen hanya akses nilai kelas yang diampu
ALTER TABLE nilai_sub_cpmk ENABLE ROW LEVEL SECURITY;
CREATE POLICY dosen_own_kelas ON nilai_sub_cpmk
    FOR ALL USING(
        enrollment_id IN (
            SELECT e.id FROM enrollment e
            JOIN kelas k ON e.kelas_id = k.id
            WHERE k.dosen_id = current_setting('app.current_entity_id')::UUID
        )
    );

-- Cleanup token kedaluwarsa via pg_cron (tiap malam pukul 02.00)
-- SELECT cron.schedule('0 2 * * *', $$
--   DELETE FROM refresh_tokens  WHERE expires_at < NOW();
--   DELETE FROM password_resets WHERE expires_at < NOW();
-- $$);