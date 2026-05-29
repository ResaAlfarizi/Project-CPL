import AsyncStorage from '@react-native-async-storage/async-storage';

// PENTING: Ganti dengan IP komputer Anda yang menjalankan backend
// Cara cek IP:
// Windows: ipconfig (lihat IPv4 Address)
// Mac/Linux: ifconfig (lihat inet)
const API_BASE = 'http://192.168.1.94:3000/api/v1/m2'; // GANTI IP INI!

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
            return data; // { token, user, message }
        } catch (error) {
            console.error('❌ Login error:', error.message);
            throw error;
        }
    },
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export const dashboardApi = {
    getDosen: () => apiFetch('/dashboard/dosen'),
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export const profileApi = {
    getMyProfile:    ()       => apiFetch('/profile/me'),
    updateProfile:   (body)   => apiFetch('/profile/me', { method: 'PUT', body: JSON.stringify(body) }),
    changePassword:  (body)   => apiFetch('/profile/change-password', { method: 'PUT', body: JSON.stringify(body) }),
};

// ─── KELAS ────────────────────────────────────────────────────────────────────

export const kelasApi = {
    getMyClasses: () => apiFetch('/kelas/dosen/my-classes'),
};

// ─── PRODI ────────────────────────────────────────────────────────────────────

export const prodiApi = {
    getAll: () => apiFetch('/prodi'),
};

// ─── CPL ──────────────────────────────────────────────────────────────────────

export const cplApi = {
    getByProdi: (prodiId) => apiFetch(`/cpl/prodi/${prodiId}`),
};

// ─── SUB-CPMK ─────────────────────────────────────────────────────────────────

export const subCpmkApi = {
    getAll:    ()       => apiFetch('/sub-cpmk'),
    getByMk:   (mkId)   => apiFetch(`/sub-cpmk/mk/${mkId}`),
    create: (body)      => apiFetch('/sub-cpmk', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body)  => apiFetch(`/sub-cpmk/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

// ─── MK-CPL (untuk dropdown di SubCpmk form) ─────────────────────────────────
export const mkCplApi = {
    getAll: () => apiFetch('/mk-cpl'),
};

// ─── NILAI ────────────────────────────────────────────────────────────────────

export const nilaiApi = {
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

// ─── MAHASISWA API ────────────────────────────────────────────────────────────

export const mahasiswaApi = {
    // Profile - Gunakan endpoint profile/mahasiswa/me (sesuai dengan routing backend)
    getMyProfile: async () => {
        try {
            console.log('📡 Calling: /profile/mahasiswa/me');
            const result = await apiFetch('/profile/mahasiswa/me');
            console.log('✅ Success: /profile/mahasiswa/me');
            return result;
        } catch (error) {
            console.error('❌ API Error:', error.message);
            // Fallback dummy data jika endpoint belum ada
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
    
    // Prodi & CPL - Gunakan endpoint yang sudah ada
    getAllProdi:         ()       => apiFetch('/prodi'),
    getAllCPL:           ()       => apiFetch('/cpl'),
    getCPLByProdi:       (prodiId) => apiFetch(`/cpl/prodi/${prodiId}`),
    
    // Kelas & Mata Kuliah - Gunakan endpoint /kelas (bisa diakses mahasiswa)
    getAllKelas:         ()       => apiFetch('/kelas'),
    getMyKelas:          ()       => apiFetch('/kelas'), // Mahasiswa akses endpoint /kelas langsung
    
    // Sub-CPMK - Gunakan endpoint yang sudah ada
    getAllSubCpmk:       ()       => apiFetch('/sub-cpmk'),
    getSubCpmkByMk:      (mkId)   => apiFetch(`/sub-cpmk/mk/${mkId}`),
    
    // Capaian - Dummy data karena endpoint belum ada
    getMyCapaian: async () => {
        // Simulasi delay API
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            data: [
                { 
                    id: 1, 
                    kode_cpl: 'CPL-01', 
                    nama_cpl: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi', 
                    nilai: 85.5, 
                    persentase: 85.5, 
                    status: 'Tercapai', 
                    target: 75 
                },
                { 
                    id: 2, 
                    kode_cpl: 'CPL-02', 
                    nama_cpl: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur', 
                    nilai: 72.3, 
                    persentase: 72.3, 
                    status: 'Belum Tercapai', 
                    target: 75 
                },
                { 
                    id: 3, 
                    kode_cpl: 'CPL-03', 
                    nama_cpl: 'Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan dan teknologi', 
                    nilai: 88.7, 
                    persentase: 88.7, 
                    status: 'Tercapai', 
                    target: 75 
                },
                { 
                    id: 4, 
                    kode_cpl: 'CPL-04', 
                    nama_cpl: 'Mampu menyusun deskripsi saintifik hasil kajian dalam bentuk skripsi atau laporan tugas akhir', 
                    nilai: 79.2, 
                    persentase: 79.2, 
                    status: 'Tercapai', 
                    target: 75 
                },
            ]
        };
    },
    
    getMyCapaianDetail: async () => {
        // Simulasi delay API
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
