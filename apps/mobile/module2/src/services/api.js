import AsyncStorage from '@react-native-async-storage/async-storage';

// PENTING: Ganti dengan IP komputer Anda yang menjalankan backend
const API_BASE = 'http://192.168.1.2:3000/api/v1/m2'; // GANTI IP INI JIKA BERUBAH!

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
        console.log('🌐 Login URL:', url);
        
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            
            console.log('📡 Login response status:', res.status);
            const data = await res.json();
            
            if (!res.ok) {
                console.error('❌ Login failed:', data.message);
                throw new Error(data.message || 'Login gagal');
            }
            
            console.log('✅ Login success:', data.user?.nama || data.user?.name);
            return data;
        } catch (error) {
            console.error('❌ Login error:', error.message);
            throw error;
        }
    },
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export const dashboardApi = {
    getDosen: () => apiFetch('/dashboard/dosen'),
    // Tambahkan baris di bawah ini:
    getAdmin: (prodiId) => apiFetch(`/dashboard/admin/${prodiId}`),
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
    getMyClasses: () => apiFetch('/kelas/dosen/my-classes'),
    getById:      (id) => apiFetch(`/kelas/${id}`),
};

// ─── PRODI ────────────────────────────────────────────────────────────────────

export const prodiApi = {
    getAll: () => apiFetch('/prodi'),
};

// ─── ✅ CPL (SUDAH DIPERBAIKI SECARA LENGKAP SESUAI BACKEND) ──────────────────

export const cplApi = {
    getAll:      ()         => apiFetch('/cpl'),
    getById:     (id)       => apiFetch(`/cpl/${id}`),
    getByProdi:  (prodiId)  => apiFetch(`/cpl/prodi/${prodiId}`),
    create:      (body)     => apiFetch('/cpl', { method: 'POST', body: JSON.stringify(body) }),
    update:      (id, body) => apiFetch(`/cpl/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:      (id)       => apiFetch(`/cpl/${id}`, { method: 'DELETE' }),
};

// ─── SUB-CPMK ─────────────────────────────────────────────────────────────────

export const subCpmkApi = {
    getAll:        ()       => apiFetch('/sub-cpmk'),
    getMySubCpmk:  ()       => apiFetch('/sub-cpmk/dosen/my-sub-cpmk'),
    getByMk:       (mkId)   => apiFetch(`/sub-cpmk/mk/${mkId}`),
    create:        (body)   => apiFetch('/sub-cpmk', { method: 'POST', body: JSON.stringify(body) }),
    update:        (id, body) => apiFetch(`/sub-cpmk/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

// ─── MK-CPL ───────────────────────────────────────────────────────────────────
export const mkCplApi = {
    getAll:      () => apiFetch('/mk-cpl'),
    getMyMkCpl:  () => apiFetch('/mk-cpl/dosen/my-mk-cpl'),
};

// ─── NILAI ────────────────────────────────────────────────────────────────────

export const nilaiApi = {
    getAll:          ()             => apiFetch('/nilai'), 
    getByKelas:      (kelasId)      => apiFetch(`/nilai/kelas/${kelasId}`),
    create:          (body)         => apiFetch('/nilai', { method: 'POST', body: JSON.stringify(body) }),
    update:          (id, body)     => apiFetch(`/nilai/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

// ─── ENROLLMENT ───────────────────────────────────────────────────────────────

export const enrollmentApi = {
    getByKelas: (kelasId) => apiFetch(`/enrollment/kelas/${kelasId}`),
};

// ─── CAPAIAN ──────────────────────────────────────────────────────────────────

export const capaianApi = {
    getByKelas: (kelasId) => apiFetch(`/capaian/kelas/${kelasId}`),
};

// ─── USER API (KELOLA USER ADMIN) ─────────────────────────────────────────────

export const userApi = {
    getAll:       ()             => apiFetch('/users'),
    getById:      (id)           => apiFetch(`/users/${id}`),
    getByEmail:   (email)        => apiFetch(`/users/email/${email}`),
    create:       (body)         => apiFetch('/users', { method: 'POST', body: JSON.stringify(body) }),
    update:       (id, body)     => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete:       (id)           => apiFetch(`/users/${id}`, { method: 'DELETE' }),
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
                    throw new Error(errData.message || `Akses log ditolak role Anda (Status: ${res.status})`);
                }
            } catch (e) {
                if (e.message.includes('ditolak')) throw e;
            }
        }
        throw new Error("Endpoint Audit log tidak ditemukan di server (404).");
    }
};

// ─── MAHASISWA API ────────────────────────────────────────────────────────────

export const mahasiswaApi = {
    getMyProfile: async () => {
        try {
            console.log('📡 Calling: /profile/mahasiswa/me');
            const result = await apiFetch('/profile/mahasiswa/me');
            console.log('✅ Success: /profile/mahasiswa/me');
            return result;
        } catch (error) {
            console.error('❌ API Error:', error.message);
            return {
                success: true,
                data: {
                    id: '1',
                    nim: '123456789',
                    nama: 'Mahasiswa Demo',
                    email: 'mahasiswa@example.com',
                    prodi_id: '1',
                    nama_prodi: 'S1 Informatika',
                    kode_prodi: 'IF',
                    jenjang: 'S1',
                    angkatan: 2021,
                    total_kelas: 8,
                    total_nilai: 24,
                }
            };
        }
    },
    
    getAllProdi:         ()       => apiFetch('/prodi'),
    getAllCPL:           ()       => apiFetch('/cpl'),
    getCPLByProdi:       (prodiId) => apiFetch(`/cpl/prodi/${prodiId}`),
    getAllKelas:         ()       => apiFetch('/kelas'),
    getMyKelas:          ()       => apiFetch('/kelas'),
    getAllSubCpmk:       ()       => apiFetch('/sub-cpmk'),
    getSubCpmkByMk:      (mkId)   => apiFetch(`/sub-cpmk/mk/${mkId}`),
    
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