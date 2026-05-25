-- =============================================
-- SISTEM AUTENTIKASI & OTORISASI
-- =============================================

-- =============================================
-- TABEL ROLES & USERS
-- =============================================

-- Roles (Peran pengguna)
CREATE TABLE roles (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_role  VARCHAR(50) UNIQUE NOT NULL,
    deskripsi  TEXT
);

-- Seed roles
INSERT INTO roles(nama_role, deskripsi) VALUES
    ('Superadmin',  'Akses penuh seluruh sistem'),
    ('Admin Prodi', 'Kelola data satu program studi'),
    ('Dosen',       'Input nilai kelas sendiri'),
    ('Mahasiswa',   'Lihat capaian CPL diri sendiri');

-- Users (Pengguna sistem)
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

-- =============================================
-- TABEL PERMISSIONS
-- =============================================

-- Role Permissions (Hak akses per role)
CREATE TABLE role_permissions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id     UUID        NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    resource    VARCHAR(80) NOT NULL,
    can_read    BOOLEAN     DEFAULT FALSE,
    can_write   BOOLEAN     DEFAULT FALSE,
    can_delete  BOOLEAN     DEFAULT FALSE,
    UNIQUE(role_id, resource)
);

-- =============================================
-- TABEL TOKEN & SECURITY
-- =============================================

-- Refresh Tokens (Token untuk refresh JWT)
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

-- Password Resets (Token reset password)
CREATE TABLE password_resets (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABEL AUDIT LOG
-- =============================================

-- Auth Audit Log (Log aktivitas autentikasi)
CREATE TABLE auth_audit_log (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     UUID        REFERENCES users(id),
    event_type  VARCHAR(30) NOT NULL CHECK(event_type IN(
        'login_success',
        'login_failed',
        'logout',
        'token_refresh',
        'account_locked',
        'password_reset_req',
        'password_changed'
    )),
    ip_address  INET,
    user_agent  TEXT,
    detail      JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FUNCTION: HANDLE LOGIN ATTEMPT
-- =============================================

-- FUNCTION: handle login attempt + auto lockout
CREATE OR REPLACE FUNCTION handle_login_attempt(
    p_user_id UUID, 
    p_success BOOLEAN,
    p_ip INET DEFAULT NULL, 
    p_ua TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    IF p_success THEN
        UPDATE users SET
            failed_login_count = 0, 
            locked_until = NULL, 
            last_login_at = NOW()
        WHERE id = p_user_id;
        
        INSERT INTO auth_audit_log(user_id, event_type, ip_address, user_agent)
        VALUES(p_user_id, 'login_success', p_ip, p_ua);
    ELSE
        UPDATE users SET
            failed_login_count = failed_login_count + 1,
            locked_until = CASE 
                WHEN failed_login_count + 1 >= 5
                THEN NOW() + INTERVAL '15 minutes'
                ELSE locked_until 
            END
        WHERE id = p_user_id;
        
        INSERT INTO auth_audit_log(user_id, event_type, ip_address, user_agent)
        VALUES(
            p_user_id,
            CASE 
                WHEN (SELECT failed_login_count FROM users WHERE id=p_user_id) >= 5
                THEN 'account_locked' 
                ELSE 'login_failed' 
            END, 
            p_ip, 
            p_ua
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION: REVOKE ALL TOKENS
-- =============================================

-- FUNCTION: revoke semua session user (logout all devices)
CREATE OR REPLACE FUNCTION revoke_all_tokens(p_user_id UUID) 
RETURNS INT AS $$
DECLARE 
    v_count INT;
BEGIN
    UPDATE refresh_tokens 
    SET revoked_at = NOW()
    WHERE user_id = p_user_id 
    AND revoked_at IS NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INDEX AUTENTIKASI
-- =============================================

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_entity   ON users(entity_type, entity_id);
CREATE INDEX idx_refresh_hash   ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_user   ON refresh_tokens(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_audit_user     ON auth_audit_log(user_id, created_at DESC);

-- =============================================
-- ROW-LEVEL SECURITY (RLS)
-- =============================================

-- RLS: mahasiswa hanya baca capaian diri sendiri
ALTER TABLE capaian_cpl_mahasiswa ENABLE ROW LEVEL SECURITY;

CREATE POLICY mhs_own_capaian ON capaian_cpl_mahasiswa
    FOR SELECT 
    USING(mahasiswa_id = current_setting('app.current_entity_id')::UUID);

-- RLS: dosen hanya akses nilai kelas yang diampu
ALTER TABLE nilai_sub_cpmk ENABLE ROW LEVEL SECURITY;

CREATE POLICY dosen_own_kelas ON nilai_sub_cpmk
    FOR ALL 
    USING(
        enrollment_id IN (
            SELECT e.id 
            FROM enrollment e
            JOIN kelas k ON e.kelas_id = k.id
            WHERE k.dosen_id = current_setting('app.current_entity_id')::UUID
        )
    );

-- =============================================
-- CLEANUP (OPTIONAL - REQUIRES pg_cron)
-- =============================================

-- Cleanup token kedaluwarsa via pg_cron (tiap malam pukul 02.00)
-- Uncomment jika pg_cron sudah terinstall:
-- 
-- SELECT cron.schedule('0 2 * * *', $$
--   DELETE FROM refresh_tokens  WHERE expires_at < NOW();
--   DELETE FROM password_resets WHERE expires_at < NOW();
-- $$);
