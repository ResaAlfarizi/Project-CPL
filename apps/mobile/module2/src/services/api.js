import AsyncStorage from '@react-native-async-storage/async-storage';

// PENTING: Ganti dengan IP komputer Anda yang menjalankan backend
const API_BASE = 'http://192.168.18.252:3000/api/v1/m2'; // GANTI IP INI JIKA BERUBAH!

const TOKEN_KEY = 'auth_token';

// ─── Token helpers ────────────────────────────────────────────────────────────

export const tokenStorage = {
    get: async () => {
        try { 
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            console.log('📱 Token retrieved:', token ? 'exists' : 'null');
            return token;
        }
        catch (error) { 
            console.error('❌ Error getting token:', error);
            return null; 
        }
    },
    set: async (token) => {
        try { 
            await AsyncStorage.setItem(TOKEN_KEY, token);
            console.log('✅ Token saved successfully');
        }
        catch (error) {
            console.error('❌ Error saving token:', error);
        }
    },
    remove: async () => {
        try { 
            await AsyncStorage.removeItem(TOKEN_KEY);
            console.log('🗑️ Token removed');
        }
        catch (error) {
            console.error('❌ Error removing token:', error);
        }
    },
};

// ─── Base fetch dengan JWT ────────────────────────────────────────────────────

async function apiFetch(endpoint, options = {}) {
    const token = await tokenStorage.get();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE}${endpoint}`;
    console.log('🌐 API Call:', url);

    try {
        const res = await fetch(url, { ...options, headers });
        const data = await res.json();

        if (!res.ok) {
            console.error('❌ API Error:', res.status, data.message);
            throw new Error(data.message || 'Request gagal');
        }
        
        console.log('✅ API Success:', endpoint);
        return data;
    } catch (error) {
        console.error('❌ Fetch Error:', error.message);
        throw error;
    }
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const authApi = {
    login: async ({ email, password }) => {
        console.log('🔐 Login attempt:', email);
        const url = `${API_BASE}/auth/login`;
        
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Login gagal');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Login error:', error.message);
            throw error;
        }
    },
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export const dashboardApi = {
    getDosen:       ()          => apiFetch('/dashboard/dosen'),
    getAdmin:       (prodiId)   => apiFetch(`/dashboard/admin/${prodiId}`),
    getSuperAdmin:  ()          => apiFetch('/dashboard/superadmin'),
    getCapaianAgregat:   ()        => apiFetch('/dashboard/capaian-agregat'),
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export const profileApi = {
    getMyProfile:    ()       => apiFetch('/profile/me'),
    getAdmin:        ()       => apiFetch('/profile/me'), 
    updateProfile:   (body)   => apiFetch('/profile/me', { method: 'PUT', body: JSON.stringify(body) }),
    changePassword:  (body)   => apiFetch('/profile/change-password', { method: 'PUT', body: JSON.stringify(body) }),
};

// ─── KELAS ────────────────────────────────────────────────────────────────────

export const kelasApi = {
    getAll:       ()    => apiFetch('/kelas'),            // Dipakai sa_input_nilai (daftar semua kelas)
    getMyClasses: ()    => apiFetch('/kelas/dosen/my-classes'),
    getById:      (id)  => apiFetch(`/kelas/${id}`),
};

// ─── PRODI ────────────────────────────────────────────────────────────────────

export const prodiApi = {
    getAll:  ()             => apiFetch('/prodi'),
    getById: (id)           => apiFetch(`/prodi/${id}`),
    // ✅ BARU: Create, Update, Delete untuk Superadmin
    create:  (body)         => apiFetch('/prodi', { method: 'POST', body: JSON.stringify(body) }),
    update:  (id, body)     => apiFetch(`/prodi/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:  (id)           => apiFetch(`/prodi/${id}`, { method: 'DELETE' }),
};

// ─── CPL ──────────────────────────────────────────────────────────────────────

export const cplApi = {
    getAll:      ()         => apiFetch('/cpl'),
    getById:     (id)       => apiFetch(`/cpl/${id}`),
    getByProdi:  (prodiId)  => apiFetch(`/cpl/prodi/${prodiId}`),
    create:      (body)     => apiFetch('/cpl', { method: 'POST', body: JSON.stringify(body) }),
    update:      (id, body) => apiFetch(`/cpl/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:      (id)       => apiFetch(`/cpl/${id}`, { method: 'DELETE' }),
};

// ─── MATA KULIAH (MK) ─────────────────────────────────────────────────────────

export const mkApi = {
    getAll:      ()             => apiFetch('/mk'),
    getById:     (id)           => apiFetch(`/mk/${id}`),
    getByProdi:  (prodiId)      => apiFetch(`/mk/prodi/${prodiId}`),
    // ✅ BARU: CRUD lengkap untuk Superadmin
    create:      (body)         => apiFetch('/mk', { method: 'POST', body: JSON.stringify(body) }),
    update:      (id, body)     => apiFetch(`/mk/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:      (id)           => apiFetch(`/mk/${id}`, { method: 'DELETE' }),
};

// ─── MATA KULIAH SUPERADMIN ───────────────────────────────────────────────────
// Endpoint /mata-kuliah (terbukti jalan, dipakai SAKelolaMKScreen)
// mkApi lama tidak disentuh agar screen lain tidak terdampak

export const mkSaApi = {
    getAll:  ()             => apiFetch('/mata-kuliah'),
    create:  (body)         => apiFetch('/mata-kuliah', { method: 'POST', body: JSON.stringify(body) }),
    update:  (id, body)     => apiFetch(`/mata-kuliah/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:  (id)           => apiFetch(`/mata-kuliah/${id}`, { method: 'DELETE' }),
};

// ─── SUB-CPMK ─────────────────────────────────────────────────────────────────

export const subCpmkApi = {
    getAll:       ()              => apiFetch('/sub-cpmk'),
    getByMk:      (mkId)          => apiFetch(`/sub-cpmk/mk/${mkId}`),
    // Sub-CPMK terhubung ke mk_cpl (bukan langsung cpl) — endpoint ini ambil sub_cpmk by mk_cpl_id
    getByMkCpl:   (mkCplId)       => apiFetch(`/sub-cpmk/mk-cpl/${mkCplId}`),
    create:       (body)          => apiFetch('/sub-cpmk', { method: 'POST', body: JSON.stringify(body) }),
    update:       (id, body)      => apiFetch(`/sub-cpmk/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    // ✅ BARU: Delete untuk Superadmin
    delete:       (id)            => apiFetch(`/sub-cpmk/${id}`, { method: 'DELETE' }),
};

// ─── MK-CPL ───────────────────────────────────────────────────────────────────

export const mkCplApi = {
    getAll:      ()             => apiFetch('/mk-cpl'),
    getByMk:     (mkId)         => apiFetch(`/mk-cpl/mk/${mkId}`),
    // ✅ BARU: CRUD untuk Pemetaan MK-CPL
    create:      (body)         => apiFetch('/mk-cpl', { method: 'POST', body: JSON.stringify(body) }),
    update:      (id, body)     => apiFetch(`/mk-cpl/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:      (id)           => apiFetch(`/mk-cpl/${id}`, { method: 'DELETE' }),
};

// ─── THRESHOLD ────────────────────────────────────────────────────────────────
// ✅ BARU: Endpoint Threshold untuk Superadmin

export const thresholdApi = {
    getAll:      ()             => apiFetch('/threshold'),
    getByProdi:  (prodiId)      => apiFetch(`/threshold/prodi/${prodiId}`),
    create:      (body)         => apiFetch('/threshold', { method: 'POST', body: JSON.stringify(body) }),
    update:      (id, body)     => apiFetch(`/threshold/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:      (id)           => apiFetch(`/threshold/${id}`, { method: 'DELETE' }),
    resetDefault: (prodiId)     => apiFetch(`/threshold/reset/${prodiId}`, { method: 'POST' }),
};

// ─── NILAI ────────────────────────────────────────────────────────────────────

export const nilaiApi = {
    getAll:          ()             => apiFetch('/nilai'), 
    getByKelas:      (kelasId)      => apiFetch(`/nilai/kelas/${kelasId}`),
    create:          (body)         => apiFetch('/nilai', { method: 'POST', body: JSON.stringify(body) }),
    update:          (id, body)     => apiFetch(`/nilai/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    // ✅ BARU: Delete nilai
    delete:          (id)           => apiFetch(`/nilai/${id}`, { method: 'DELETE' }),
};

// ─── ENROLLMENT ───────────────────────────────────────────────────────────────

export const enrollmentApi = {
    getByKelas: (kelasId) => apiFetch(`/enrollment/kelas/${kelasId}`),
};

// ─── CAPAIAN ──────────────────────────────────────────────────────────────────

export const capaianApi = {
    getByKelas:     (kelasId)   => apiFetch(`/capaian/kelas/${kelasId}`),
    getAll:         ()          => apiFetch('/capaian'),
    getByProdi:     (prodiId)   => apiFetch(`/capaian/prodi/${prodiId}`),
    // ✅ BARU: Input manual capaian
    create:         (body)      => apiFetch('/capaian', { method: 'POST', body: JSON.stringify(body) }),
    update:         (id, body)  => apiFetch(`/capaian/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:         (id)        => apiFetch(`/capaian/${id}`, { method: 'DELETE' }),
};

// ─── CAPAIAN CPL MAHASISWA ─────────────────────────────────────────────────────
// Backend endpoint ini harus membaca dari view v_capaian_cpl_mahasiswa
// (JOIN mahasiswa, cpl, program_studi, threshold_status via get_status_cpl())
// Dipakai sa_monitoring_cpl untuk monitoring lintas prodi

export const capaianMhsApi = {
    getAll:         ()              => apiFetch('/capaian-mahasiswa'),
    getByProdi:     (prodiId)       => apiFetch(`/capaian-mahasiswa/prodi/${prodiId}`),
    getByMahasiswa: (mahasiswaId)   => apiFetch(`/capaian-mahasiswa/${mahasiswaId}`),
    create:         (body)          => apiFetch('/capaian-mahasiswa', { method: 'POST', body: JSON.stringify(body) }),
    update:         (id, body)      => apiFetch(`/capaian-mahasiswa/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:         (id)            => apiFetch(`/capaian-mahasiswa/${id}`, { method: 'DELETE' }),
};

// ─── ROLES API ────────────────────────────────────────────────────────────────
// Dipakai sa_hak_user untuk resolve nama_role → role_id (UUID) sesuai tabel roles di DB

export const rolesApi = {
    getAll: () => apiFetch('/roles'),
};

// ─── USER API ─────────────────────────────────────────────────────────────────

export const userApi = {
    getAll:       ()             => apiFetch('/users'),
    getById:      (id)           => apiFetch(`/users/${id}`),
    getByEmail:   (email)        => apiFetch(`/users/email/${email}`),
    create:       (body)         => apiFetch('/users', { method: 'POST', body: JSON.stringify(body) }),
    update:       (id, body)     => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:       (id)           => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

// ─── DOSEN API ────────────────────────────────────────────────────────────────
// ✅ BARU: Endpoint khusus dosen

export const dosenApi = {
    getAll:       ()             => apiFetch('/dosen'),
    getById:      (id)           => apiFetch(`/dosen/${id}`),
    create:       (body)         => apiFetch('/dosen', { method: 'POST', body: JSON.stringify(body) }),
    update:       (id, body)     => apiFetch(`/dosen/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:       (id)           => apiFetch(`/dosen/${id}`, { method: 'DELETE' }),
};

// ─── MAHASISWA API ────────────────────────────────────────────────────────────

export const mahasiswaApi = {
    getAll:         ()           => apiFetch('/mahasiswa'),
    getById:        (id)         => apiFetch(`/mahasiswa/${id}`),
    create:         (body)       => apiFetch('/mahasiswa', { method: 'POST', body: JSON.stringify(body) }),
    update:         (id, body)   => apiFetch(`/mahasiswa/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:         (id)         => apiFetch(`/mahasiswa/${id}`, { method: 'DELETE' }),
    
    getMyProfile: async () => {
        try {
            return await apiFetch('/profile/mahasiswa/me');
        } catch (error) {
            return {
                success: true,
                data: {
                    id: '1', nim: '123456789', nama: 'Mahasiswa Demo',
                    email: 'mahasiswa@example.com', prodi_id: '1',
                    nama_prodi: 'S1 Informatika', kode_prodi: 'IF',
                    jenjang: 'S1', angkatan: 2021, total_kelas: 8, total_nilai: 24,
                }
            };
        }
    },
    
    getAllProdi:         ()          => apiFetch('/prodi'),
    getAllCPL:           ()          => apiFetch('/cpl'),
    getCPLByProdi:       (prodiId)   => apiFetch(`/cpl/prodi/${prodiId}`),
    getAllKelas:         ()          => apiFetch('/kelas'),
    getMyKelas:         ()          => apiFetch('/kelas'),
    getAllSubCpmk:       ()          => apiFetch('/sub-cpmk'),
    getSubCpmkByMk:     (mkId)      => apiFetch(`/sub-cpmk/mk/${mkId}`),
    
    getMyCapaian: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            data: [
                { id: 1, kode_cpl: 'CPL-01', nama_cpl: 'Mampu menerapkan pemikiran logis...', nilai: 85.5, persentase: 85.5, status: 'Tercapai', target: 75 },
                { id: 2, kode_cpl: 'CPL-02', nama_cpl: 'Mampu menunjukkan kinerja mandiri...', nilai: 72.3, persentase: 72.3, status: 'Belum Tercapai', target: 75 },
                { id: 3, kode_cpl: 'CPL-03', nama_cpl: 'Mampu mengkaji implikasi...', nilai: 88.7, persentase: 88.7, status: 'Tercapai', target: 75 },
                { id: 4, kode_cpl: 'CPL-04', nama_cpl: 'Mampu menyusun deskripsi saintifik...', nilai: 79.2, persentase: 79.2, status: 'Tercapai', target: 75 },
            ]
        };
    },
    
    getMyCapaianDetail: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            data: [
                { mk_id: 1, kode_mk: 'IF101', nama_mk: 'Pemrograman Dasar', nilai: 85, semester: 'Ganjil 2023/2024' },
                { mk_id: 2, kode_mk: 'IF102', nama_mk: 'Matematika Diskrit', nilai: 78, semester: 'Ganjil 2023/2024' },
                { mk_id: 3, kode_mk: 'IF103', nama_mk: 'Algoritma dan Struktur Data', nilai: 90, semester: 'Genap 2023/2024' },
                { mk_id: 4, kode_mk: 'IF201', nama_mk: 'Basis Data', nilai: 82, semester: 'Genap 2023/2024' },
                { mk_id: 5, kode_mk: 'IF202', nama_mk: 'Pemrograman Web', nilai: 88, semester: 'Ganjil 2024/2025' },
                { mk_id: 6, kode_mk: 'IF203', nama_mk: 'Sistem Operasi', nilai: 75, semester: 'Ganjil 2024/2025' },
            ]
        };
    },
};

// ─── AUDIT LOG API ────────────────────────────────────────────────────────────

export const auditLogApi = {
    getAll: async () => {
        const token = await tokenStorage.get();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const variations = [
            '/auth-audit-log',
            '/auth-audit-logs',
            '/audit-log',
            '/audit-logs',
            '/audit'
        ];

        for (const path of variations) {
            try {
                const url = `${API_BASE}${path}`;
                const res = await fetch(url, { method: 'GET', headers });
                if (res.ok) {
                    return await res.json();
                }
                if (res.status === 403 || res.status === 401) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.message || `Akses log ditolak (Status: ${res.status})`);
                }
            } catch (e) {
                if (e.message.includes('ditolak')) throw e;
            }
        }
        throw new Error("Endpoint Audit log tidak ditemukan di server (404).");
    }
};