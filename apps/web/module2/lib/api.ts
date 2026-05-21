import { authStorage } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE = `${API_URL}/api/v1/m2`;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
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
};

// CPL
export const cplApi = {
  getAll: () => apiFetch('/cpl'),
  getById: (id: string) => apiFetch(`/cpl/${id}`),
  getByProdi: (prodiId: string) => apiFetch(`/cpl/prodi/${prodiId}`),
};

// KELAS
export const kelasApi = {
  getAll: () => apiFetch('/kelas'),
  getById: (id: string) => apiFetch(`/kelas/${id}`),
  getMyClasses: () => apiFetch('/kelas/dosen/my-classes'),
};

// SUB-CPMK
export const subCpmkApi = {
  getAll: () => apiFetch('/sub-cpmk'),
  getById: (id: string) => apiFetch(`/sub-cpmk/${id}`),
  getByMkCpl: (mkCplId: string) => apiFetch(`/sub-cpmk/mk-cpl/${mkCplId}`),
  getByMk: (mkId: string) => apiFetch(`/sub-cpmk/mk/${mkId}`),
  getByCpl: (cplId: string) => apiFetch(`/sub-cpmk/cpl/${cplId}`),
  create: (body: { mk_cpl_id: string; kode_sub_cpmk: string; deskripsi: string; bobot: number }) =>
    apiFetch('/sub-cpmk', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { kode_sub_cpmk: string; deskripsi: string; bobot: number }) =>
    apiFetch(`/sub-cpmk/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

// NILAI
export const nilaiApi = {
  getByKelas: (kelasId: string) => apiFetch(`/nilai/kelas/${kelasId}`),
  getByEnrollment: (enrollmentId: string) => apiFetch(`/nilai/enrollment/${enrollmentId}`),
  getById: (id: string) => apiFetch(`/nilai/${id}`),
  create: (body: { enrollment_id: string; sub_cpmk_id: string; nilai: number }) =>
    apiFetch('/nilai', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { nilai: number }) =>
    apiFetch(`/nilai/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

// CAPAIAN
export const capaianApi = {
  getByMahasiswa: (mahasiswaId: string) => apiFetch(`/capaian/mahasiswa/${mahasiswaId}`),
  getByKelas: (kelasId: string) => apiFetch(`/capaian/kelas/${kelasId}`),
};

// ENROLLMENT
export const enrollmentApi = {
  getByKelas: (kelasId: string) => apiFetch(`/enrollment/kelas/${kelasId}`),
};

// MAHASISWA API
export const mahasiswaApi = {
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
  getKelasById: (id: number) => apiFetch(`/kelas/${id}`),

  // Sub-CPMK (Read only)
  getAllSubCpmk: () => apiFetch('/sub-cpmk'),
  getSubCpmkByMK: (mkId: number) => apiFetch(`/sub-cpmk/mk/${mkId}`),
};
