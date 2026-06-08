import { authStorage } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_BASE = `${API_URL}/api/v1/m2`;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    role: string;
    entity_type: string;
    entity_id: string;
    prodi_id?: string;
    nama: string;
  };
}

export interface ApiError {
  message: string;
}

// Helper fetch with JWT
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
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

// AUTH
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login gagal');
    }
    return data;
  },
  
  refreshToken: async (refreshToken: string): Promise<{ access_token: string; expires_in: number }> => {
    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Refresh token gagal');
    }
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Logout gagal');
    }
  },

  register: async (body: { email: string; password: string; role_id: number }) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Registrasi gagal');
    }
    return result;
  },
};

// DASHBOARD
export const dashboardApi = {
  getDosen: () => apiFetch('/dashboard/dosen'),
};

// PROFILE
export const profileApi = {
  getMyProfile: () => apiFetch('/profile/me'),
};

// PRODI
export const prodiApi = {
  getAll: () => apiFetch('/prodi'),
  getById: (id: string) => apiFetch(`/prodi/${id}`),
  create: (body: { kode_prodi: string; nama_prodi: string; jenjang: string }) =>
    apiFetch('/prodi', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { kode_prodi: string; nama_prodi: string; jenjang: string }) =>
    apiFetch(`/prodi/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => apiFetch(`/prodi/${id}`, { method: 'DELETE' }),
};

// CPL
export const cplApi = {
  getAll: () => apiFetch('/cpl'),
  getById: (id: string) => apiFetch(`/cpl/${id}`),
  getByProdi: (prodiId: string) => apiFetch(`/cpl/prodi/${prodiId}`),
  create: (body: { kode_cpl: string; deskripsi: string; prodi_id: string; is_active?: boolean }) =>
    apiFetch('/cpl', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { kode_cpl: string; deskripsi: string; prodi_id: string; is_active?: boolean }) =>
    apiFetch(`/cpl/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => apiFetch(`/cpl/${id}`, { method: 'DELETE' }),
};

// MK-CPL
export const mkCplApi = {
  getAll: () => apiFetch('/mk-cpl'),
  getMyMkCpl: () => apiFetch('/mk-cpl/dosen/my-mk-cpl'),
  getByMk: (mkId: string) => apiFetch(`/mk-cpl/mk/${mkId}`),
};

// KELAS
export const kelasApi = {
  getAll: () => apiFetch('/kelas'),
  getById: (id: string) => apiFetch(`/kelas/${id}`),
  getMyClasses: () => apiFetch('/kelas/dosen/my-classes'),
  create: (body: { mk_id: string; dosen_id?: string; tahun_akademik: string; semester_aktif: number; nama_kelas?: string }) =>
    apiFetch('/kelas', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { mk_id: string; dosen_id?: string; tahun_akademik: string; semester_aktif: number; nama_kelas?: string }) =>
    apiFetch(`/kelas/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => apiFetch(`/kelas/${id}`, { method: 'DELETE' }),
};

// SUB-CPMK
export const subCpmkApi = {
  getAll: () => apiFetch('/sub-cpmk'),
  getById: (id: string) => apiFetch(`/sub-cpmk/${id}`),
  getByMkCpl: (mkCplId: string) => apiFetch(`/sub-cpmk/mk-cpl/${mkCplId}`),
  getByMk: (mkId: string) => apiFetch(`/sub-cpmk/mk/${mkId}`),
  getMySubCpmk: () => apiFetch('/sub-cpmk/dosen/my-sub-cpmk'),
  getByCpl: (cplId: string) => apiFetch(`/sub-cpmk/cpl/${cplId}`),
  create: (body: { mk_cpl_id: string; kode_sub_cpmk: string; deskripsi: string; bobot: number }) =>
    apiFetch('/sub-cpmk', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { kode_sub_cpmk: string; deskripsi: string; mk_cpl_id: string; bobot: number }) =>
    apiFetch(`/sub-cpmk/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => apiFetch(`/sub-cpmk/${id}`, { method: 'DELETE' }),
};

// NILAI
export const nilaiApi = {
  getAll: () => apiFetch('/nilai'),
  getByKelas: (kelasId: string) => apiFetch(`/nilai/kelas/${kelasId}`),
  getByEnrollment: (enrollmentId: string) => apiFetch(`/nilai/enrollment/${enrollmentId}`),
  getById: (id: string) => apiFetch(`/nilai/${id}`),
  create: (body: { enrollment_id: string; sub_cpmk_id: string; nilai: number }) =>
    apiFetch('/nilai', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { nilai: number }) =>
    apiFetch(`/nilai/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => apiFetch(`/nilai/${id}`, { method: 'DELETE' }),
};

// CAPAIAN
export const capaianApi = {
  getByMahasiswa: (mahasiswaId: string) => apiFetch(`/capaian/mahasiswa/${mahasiswaId}`),
  getByKelas: (kelasId: string) => apiFetch(`/capaian/kelas/${kelasId}`),
  getByProdi: (prodiId: string) => apiFetch(`/capaian/prodi/${prodiId}`),
};

// ENROLLMENT
export const enrollmentApi = {
  getAll: () => apiFetch('/enrollment'),
  getByKelas: (kelasId: string) => apiFetch(`/enrollment/kelas/${kelasId}`),
};

// USER API (for Superadmin)
export const userApi = {
  getAll: () => apiFetch('/users'),
  getById: (id: string) => apiFetch(`/users/${id}`),
  getByEmail: (email: string) => apiFetch(`/users/email/${email}`),
  create: (body: { email: string; password: string; role: string; prodi_id?: string; nama?: string; identifier?: string }) =>
    apiFetch('/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { email: string; role: string }) =>
    apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

// AUDIT LOG API (for Superadmin)
export const auditLogApi = {
  getAll: () => apiFetch('/auth-audit-log'),
  getById: (id: string) => apiFetch(`/auth-audit-log/${id}`),
  getByUser: (userId: string) => apiFetch(`/auth-audit-log/user/${userId}`),
  getByEventType: (eventType: string) => apiFetch(`/auth-audit-log/event/${eventType}`),
  getLoginStatistics: () => apiFetch('/auth-audit-log/statistics/login'),
  getFailedLogins: () => apiFetch('/auth-audit-log/statistics/failed-logins'),
  deleteOld: () => apiFetch('/auth-audit-log/cleanup', { method: 'DELETE' }),
};

// MATA KULIAH API (from module1)
export const mataKuliahApi = {
  getAll: async () => {
    const token = authStorage.getToken();
    const res = await fetch(`${API_URL}/api/v1/m1/kurikulum/mk`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memuat mata kuliah');
    return data;
  },
  create: async (body: { kode_mk: string; nama_mk: string; sks: number; prodi_id: string; semester?: number }) => {
    const token = authStorage.getToken();
    const res = await fetch(`${API_URL}/api/v1/m1/kurikulum/mk`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menambah mata kuliah');
    return data;
  },
};

// DOSEN API (from module1)
export const dosenApi = {
  getAll: async () => {
    const token = authStorage.getToken();
    const res = await fetch(`${API_URL}/api/v1/m1/dosen`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memuat dosen');
    return data;
  },
};

// MAHASISWA API
export const mahasiswaApi = {
  // Profile
  getMyProfile: () => apiFetch('/profile/mahasiswa/me'),

  // Capaian CPL diri sendiri
  getMyCapaian: () => apiFetch('/capaian/mahasiswa/my-capaian'),
  getMyCapaianDetail: () => apiFetch('/capaian/mahasiswa/my-capaian/detail'),

  // Program Studi (Read only)
  getAllProdi: () => apiFetch('/prodi'),
  getProdiById: (id: number) => apiFetch(`/prodi/${id}`),

  // CPL (Read only)
  getAllCPL: () => apiFetch('/cpl'),
  getCPLByProdi: (prodiId: number) => apiFetch(`/cpl/prodi/${prodiId}`),

  // Mata Kuliah / Kelas (Read only)
  getAllKelas: () => apiFetch('/kelas'),
  getMyKelas: () => apiFetch('/kelas/mahasiswa/my-classes'),
  getKelasById: (id: number) => apiFetch(`/kelas/${id}`),

  // Sub-CPMK (Read only)
  getAllSubCpmk: () => apiFetch('/sub-cpmk'),
  getSubCpmkByMK: (mkId: number) => apiFetch(`/sub-cpmk/mk/${mkId}`),
};
