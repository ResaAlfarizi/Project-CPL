import AsyncStorage from '@react-native-async-storage/async-storage';

// PENTING: Ganti dengan IP komputer Anda yang menjalankan backend
const API_BASE = 'http://20.5.30.158:3000/api/v1/m2'; // GANTI IP INI JIKA BERUBAH!
const API_BASE_M1 = 'http://20.5.30.158:3000/api/v1/m1'; // Module 1 untuk dosen, mahasiswa, prodi

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// ─── Token helpers ────────────────────────────────────────────────────────────

export const tokenStorage = {
    get: async () => {
        try { 
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            console.log('📱 Access Token retrieved:', token ? 'exists' : 'null');
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
            console.log('✅ Access Token saved successfully');
        }
        catch (error) {
            console.error('❌ Error saving token:', error);
        }
    },
    getRefresh: async () => {
        try { 
            const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
            console.log('📱 Refresh Token retrieved:', token ? 'exists' : 'null');
            return token;
        }
        catch (error) { 
            console.error('❌ Error getting refresh token:', error);
            return null; 
        }
    },
    setRefresh: async (token) => {
        try { 
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
            console.log('✅ Refresh Token saved successfully');
        }
        catch (error) {
            console.error('❌ Error saving refresh token:', error);
        }
    },
    remove: async () => {
        try { 
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
            console.log('🗑️ All tokens removed');
        }
        catch (error) {
            console.error('❌ Error removing tokens:', error);
        }
    },
};

// ─── Token refresh helper ─────────────────────────────────────────────────────

// Callback untuk handle session expired (diset dari AppNavigator)
let onSessionExpired = null;
export const setSessionExpiredHandler = (handler) => {
    onSessionExpired = handler;
};

async function performTokenRefresh() {
    const refreshToken = await tokenStorage.getRefresh();
    if (!refreshToken) throw new Error('Tidak ada refresh token');

    const url = `${API_BASE}/auth/refresh-token`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Refresh token gagal');

    // Simpan access token baru
    await tokenStorage.set(data.access_token);
    if (data.refresh_token) await tokenStorage.setRefresh(data.refresh_token);

    console.log('🔄 Token berhasil di-refresh');
    return data.access_token;
}

async function handleTokenExpired() {
    await tokenStorage.remove();
    if (onSessionExpired) {
        onSessionExpired();
    }
    throw new Error('Sesi habis. Silakan login ulang.');
}

// ─── Base fetch dengan JWT + auto-refresh ────────────────────────────────────

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
    console.log(`🌐 [M2] ${url}`);

    try {
        const res = await fetch(url, { ...options, headers });
        const data = await res.json();

        // Auto-refresh jika 401 token kadaluarsa
        if (res.status === 401) {
            console.warn('⚠️ Token expired, mencoba refresh...');
            try {
                const newToken = await performTokenRefresh();
                // Retry request dengan token baru
                const retryRes = await fetch(url, {
                    ...options,
                    headers: {
                        ...headers,
                        'Authorization': `Bearer ${newToken}`,
                    },
                });
                const retryData = await retryRes.json();
                if (!retryRes.ok) throw new Error(retryData.message || 'Request gagal');
                console.log(`✅ [M2] Retry sukses: ${endpoint}`);
                return retryData;
            } catch (refreshErr) {
                console.error('❌ Refresh gagal, sesi dihapus:', refreshErr.message);
                return await handleTokenExpired();
            }
        }

        if (!res.ok) {
            console.error('❌ API Error:', res.status, data.message);
            throw new Error(data.message || 'Request gagal');
        }

        console.log(`✅ [M2] Success: ${endpoint}`);
        return data;
    } catch (error) {
        console.error('❌ Fetch Error:', error.message);
        throw error;
    }
}

// ─── Base fetch untuk Module 1 (dosen, mahasiswa, prodi) ─────────────────────

async function apiFetchModule1(endpoint, options = {}) {
    const token = await tokenStorage.get();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_M1}${endpoint}`;
    console.log('🌐 API Call (M1):', url);

    try {
        const res = await fetch(url, { ...options, headers });
        const data = await res.json();

        // Auto-refresh jika 401 token kadaluarsa
        if (res.status === 401) {
            console.warn('⚠️ [M1] Token expired, mencoba refresh...');
            try {
                const newToken = await performTokenRefresh();
                const retryRes = await fetch(url, {
                    ...options,
                    headers: {
                        ...headers,
                        'Authorization': `Bearer ${newToken}`,
                    },
                });
                const retryData = await retryRes.json();
                if (!retryRes.ok) throw new Error(retryData.message || 'Request gagal');
                console.log('✅ API Retry sukses (M1):', endpoint);
                return retryData;
            } catch (refreshErr) {
                console.error('❌ [M1] Refresh gagal, sesi dihapus:', refreshErr.message);
                return await handleTokenExpired();
            }
        }

        if (!res.ok) {
            console.error('❌ API Error (M1):', res.status, data.message);
            throw new Error(data.message || 'Request gagal');
        }

        console.log('✅ API Success (M1):', endpoint);
        return data;
    } catch (error) {
        console.error('❌ Fetch Error (M1):', error.message);
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
    
    refreshToken: async (refreshToken) => {
        console.log('🔄 Refresh token attempt');
        const url = `${API_BASE}/auth/refresh-token`;
        
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Refresh token gagal');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Refresh token error:', error.message);
            throw error;
        }
    },

    logout: async (refreshToken) => {
        console.log('🚪 Logout attempt');
        const url = `${API_BASE}/auth/logout`;
        
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Logout gagal');
            }
            
            return data;
        } catch (error) {
            console.error('❌ Logout error:', error.message);
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
    getDosenProfile: ()       => apiFetch('/profile/dosen/me'),
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
    getAll:  ()             => {
        console.log('🔥 prodiApi.getAll() called - using Module 1');
        return apiFetchModule1('/prodi');
    },
    getById: (id)           => apiFetchModule1(`/prodi/${id}`),
    create:  (body)         => apiFetchModule1('/prodi', { method: 'POST', body: JSON.stringify(body) }),
    update:  (id, body)     => apiFetchModule1(`/prodi/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:  (id)           => apiFetchModule1(`/prodi/${id}`, { method: 'DELETE' }),
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
    getAll:      ()             => apiFetch('/mata-kuliah'),
    getById:     (id)           => apiFetch(`/mata-kuliah/${id}`),
    // ✅ NOTE: Backend doesn't have /mata-kuliah/prodi/:prodiId endpoint yet
    // Frontend will filter after getAll() until backend adds this endpoint
    getByProdi:  (prodiId)      => apiFetch('/mata-kuliah').then(res => {
        const data = res?.data || res;
        const filtered = Array.isArray(data) ? data.filter(mk => String(mk.prodi_id) === String(prodiId)) : [];
        return { success: true, data: filtered };
    }),
    // ✅ CRUD lengkap untuk Admin Prodi & Superadmin
    create:      (body)         => apiFetch('/mata-kuliah', { method: 'POST', body: JSON.stringify(body) }),
    update:      (id, body)     => apiFetch(`/mata-kuliah/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:      (id)           => apiFetch(`/mata-kuliah/${id}`, { method: 'DELETE' }),
};

// ─── MATA KULIAH SUPERADMIN ───────────────────────────────────────────────────
// Endpoint /mata-kuliah (terbukti jalan, dipakai SAKelolaMKScreen)
// mkApi lama tidak disentuh agar screen lain tidak terdampak

export const mkSaApi = {
    getAll:  ()             => apiFetch('/mata-kuliah'),
    getById: (id)           => apiFetch(`/mata-kuliah/${id}`),
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
    // ✅ ADDED: For Dosen to get their Sub-CPMK
    getMySubCpmk: ()              => apiFetch('/sub-cpmk/dosen/my-sub-cpmk'),
    create:       (body)          => apiFetch('/sub-cpmk', { method: 'POST', body: JSON.stringify(body) }),
    update:       (id, body)      => apiFetch(`/sub-cpmk/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    // ✅ BARU: Delete untuk Superadmin
    delete:       (id)            => apiFetch(`/sub-cpmk/${id}`, { method: 'DELETE' }),
};

// ─── MK-CPL ───────────────────────────────────────────────────────────────────

export const mkCplApi = {
    getAll:      ()             => apiFetch('/mk-cpl'),
    getByMk:     (mkId)         => apiFetch(`/mk-cpl/mk/${mkId}`),
    getMyMkCpl:  ()             => apiFetch('/mk-cpl/dosen/my-mk-cpl'), // ✅ For Dosen
    // ✅ CRUD untuk Pemetaan MK-CPL
    create:      (body)         => apiFetch('/mk-cpl', { method: 'POST', body: JSON.stringify(body) }),
    update:      (id, body)     => apiFetch(`/mk-cpl/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:      (id)           => apiFetch(`/mk-cpl/${id}`, { method: 'DELETE' }),
};

// ─── THRESHOLD ────────────────────────────────────────────────────────────────
// ✅ BARU: Endpoint Threshold untuk Superadmin

export const thresholdApi = {
    getAll:      ()             => apiFetchModule1('/threshold'),
    // create digunakan untuk save batch (menerima prodi_id + array thresholds)
    create:      (body)         => apiFetchModule1('/threshold', { method: 'POST', body: JSON.stringify(body) }),
    // Endpoint individual tidak tersedia di backend, gunakan batch save
    update:      (id, body)     => Promise.reject(new Error('Update individual tidak tersedia. Gunakan batch save.')),
    delete:      (id)           => Promise.reject(new Error('Delete individual tidak tersedia. Gunakan batch save.')),
    getByProdi:  (prodiId)      => Promise.reject(new Error('getByProdi tidak tersedia. Gunakan getAll() dan filter di frontend.')),
    resetDefault: (prodiId)     => Promise.reject(new Error('resetDefault tidak tersedia. Reset di frontend lalu save.')),
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
    getByMahasiswaId: (mahasiswaId) => apiFetch(`/capaian/mahasiswa/${mahasiswaId}`),
    create:         (body)      => apiFetch('/capaian', { method: 'POST', body: JSON.stringify(body) }),
    update: (mahasiswa_id, cpl_id, body) => apiFetch(`/capaian/${mahasiswa_id}/${cpl_id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (mahasiswa_id, cpl_id)           => apiFetch(`/capaian/${mahasiswa_id}/${cpl_id}`, { method: 'DELETE' }),
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
// CATATAN: Endpoint /roles tidak tersedia di backend. Sudah tidak dipakai.
// Hapus referensi ini di masa depan.

// ─── USER API ─────────────────────────────────────────────────────────────────

export const userApi = {
    getAll:          ()             => apiFetch('/users'),
    getById:         (id)           => apiFetch(`/users/${id}`),
    getByEmail:      (email)        => apiFetch(`/users/email/${email}`),
    create:          (body)         => apiFetch('/users', { method: 'POST', body: JSON.stringify(body) }),
    update:          (id, body)     => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:          (id)           => apiFetch(`/users/${id}`, { method: 'DELETE' }),
    // ✅ BARU: Delete audit logs untuk cascade delete user
    deleteAuditLogs: (userId)       => apiFetch(`/auth-audit-log/user/${userId}`, { method: 'DELETE' }),
};

// ─── DOSEN API ────────────────────────────────────────────────────────────────
// ✅ BARU: Endpoint khusus dosen

export const dosenApi = {
    getAll:       ()             => {
        console.log('🔥 dosenApi.getAll() called - using Module 1');
        return apiFetchModule1('/dosen');
    },
    getById:      (id)           => apiFetchModule1(`/dosen/${id}`),
    create:       (body)         => apiFetchModule1('/dosen', { method: 'POST', body: JSON.stringify(body) }),
    update:       (id, body)     => apiFetchModule1(`/dosen/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:       (id)           => apiFetchModule1(`/dosen/${id}`, { method: 'DELETE' }),
};
// ─── MAHASISWA API ────────────────────────────────────────────────────────────

export const mahasiswaApi = {
    getAll:         ()           => {
        console.log('🔥 mahasiswaApi.getAll() called - using Module 1');
        return apiFetchModule1('/mahasiswa');
    },
    getById:        (id)         => apiFetchModule1(`/mahasiswa/${id}`),
    create:         (body)       => apiFetchModule1('/mahasiswa', { method: 'POST', body: JSON.stringify(body) }),
    update:         (id, body)   => apiFetchModule1(`/mahasiswa/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:         (id)         => apiFetchModule1(`/mahasiswa/${id}`, { method: 'DELETE' }),
    
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
    
    getAllProdi:         ()          => apiFetchModule1('/prodi'),
    getAllCPL:           ()          => apiFetch('/cpl'),
    getCPLByProdi:       (prodiId)   => apiFetch(`/cpl/prodi/${prodiId}`),
    getAllKelas:         ()          => apiFetch('/kelas'),
    getMyKelas:         ()          => apiFetch('/kelas'),
    getAllSubCpmk:       ()          => apiFetch('/sub-cpmk'),
    getSubCpmkByMk:     (mkId)      => apiFetch(`/sub-cpmk/mk/${mkId}`),
    
    getMyCapaian: async () => {
        try {
            // ✅ Gunakan endpoint real dari backend
            return await apiFetch('/capaian/mahasiswa/my-capaian');
        } catch (error) {
            console.error('❌ Error getMyCapaian:', error);
            // Fallback ke dummy data jika gagal
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                data: [
                    { id: 1, kode_cpl: 'CPL-01', nama_cpl: 'Mampu menerapkan pemikiran logis...', deskripsi_cpl: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi.', nilai: 85.5, persentase: 85.5, status: 'Tercapai', target: 75 },
                    { id: 2, kode_cpl: 'CPL-02', nama_cpl: 'Mampu menunjukkan kinerja mandiri...', deskripsi_cpl: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur dalam menyelesaikan tugas.', nilai: 72.3, persentase: 72.3, status: 'Belum Tercapai', target: 75 },
                    { id: 3, kode_cpl: 'CPL-03', nama_cpl: 'Mampu mengkaji implikasi...', deskripsi_cpl: 'Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan teknologi.', nilai: 88.7, persentase: 88.7, status: 'Tercapai', target: 75 },
                    { id: 4, kode_cpl: 'CPL-04', nama_cpl: 'Mampu menyusun deskripsi saintifik...', deskripsi_cpl: 'Mampu menyusun deskripsi saintifik hasil kajian.', nilai: 79.2, persentase: 79.2, status: 'Tercapai', target: 75 },
                ]
            };
        }
    },
    
    getMyCapaianDetail: async () => {
        try {
            // ✅ Gunakan endpoint real dari backend
            return await apiFetch('/capaian/mahasiswa/my-capaian/detail');
        } catch (error) {
            console.error('❌ Error getMyCapaianDetail:', error);
            // Fallback ke dummy data jika gagal
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                data: [
                    // CPL-01 details
                    { kode_cpl: 'CPL-01', kode_mk: 'IF101', nama_mk: 'Pemrograman Dasar', nilai: 85, semester_aktif: 1, tahun_akademik: '2023/2024', status: 'Tercapai' },
                    { kode_cpl: 'CPL-01', kode_mk: 'IF103', nama_mk: 'Algoritma dan Struktur Data', nilai: 90, semester_aktif: 2, tahun_akademik: '2023/2024', status: 'Tercapai' },
                    { kode_cpl: 'CPL-01', kode_mk: 'IF202', nama_mk: 'Pemrograman Web', nilai: 88, semester_aktif: 3, tahun_akademik: '2024/2025', status: 'Tercapai' },
                    
                    // CPL-02 details
                    { kode_cpl: 'CPL-02', kode_mk: 'IF102', nama_mk: 'Matematika Diskrit', nilai: 78, semester_aktif: 1, tahun_akademik: '2023/2024', status: 'Tercapai' },
                    { kode_cpl: 'CPL-02', kode_mk: 'IF201', nama_mk: 'Basis Data', nilai: 82, semester_aktif: 2, tahun_akademik: '2023/2024', status: 'Tercapai' },
                    { kode_cpl: 'CPL-02', kode_mk: 'IF203', nama_mk: 'Sistem Operasi', nilai: 65, semester_aktif: 3, tahun_akademik: '2024/2025', status: 'Belum Tercapai' },
                    
                    // CPL-03 details
                    { kode_cpl: 'CPL-03', kode_mk: 'IF104', nama_mk: 'Pemrograman Berorientasi Objek', nilai: 92, semester_aktif: 2, tahun_akademik: '2023/2024', status: 'Tercapai' },
                    { kode_cpl: 'CPL-03', kode_mk: 'IF204', nama_mk: 'Rekayasa Perangkat Lunak', nilai: 85, semester_aktif: 3, tahun_akademik: '2024/2025', status: 'Tercapai' },
                    
                    // CPL-04 details
                    { kode_cpl: 'CPL-04', kode_mk: 'IF105', nama_mk: 'Jaringan Komputer', nilai: 80, semester_aktif: 2, tahun_akademik: '2023/2024', status: 'Tercapai' },
                    { kode_cpl: 'CPL-04', kode_mk: 'IF205', nama_mk: 'Keamanan Informasi', nilai: 78, semester_aktif: 3, tahun_akademik: '2024/2025', status: 'Tercapai' },
                ]
            };
        }
    },
};

// ─── AUDIT LOG API ────────────────────────────────────────────────────────────

export const auditLogApi = {
    getAll: () => apiFetch('/auth-audit-log'),
};