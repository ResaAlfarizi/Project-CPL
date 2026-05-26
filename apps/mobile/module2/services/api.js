import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://172.30.100.119:3000/api/v1/m2';

const TOKEN_KEY = 'auth_token';

// ─── Token helpers ────────────────────────────────────────────────────────────

export const tokenStorage = {
    get: async () => {
        try { return await AsyncStorage.getItem(TOKEN_KEY); }
        catch { return null; }
    },
    set: async (token) => {
        try { await AsyncStorage.setItem(TOKEN_KEY, token); }
        catch {}
    },
    remove: async () => {
        try { await AsyncStorage.removeItem(TOKEN_KEY); }
        catch {}
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

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Request gagal');
    }
    return data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const authApi = {
    login: async ({ email, password }) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login gagal');
        return data; // { token, user, message }
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
