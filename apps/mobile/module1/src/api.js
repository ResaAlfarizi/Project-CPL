// Read-only API client for Module 1
// Only GET endpoints — no create/update/delete

// Gunakan IP lokal komputer agar bisa diakses dari emulator maupun device fisik
const API_URL = 'http://192.168.1.15/api/v1/m1';

async function fetchAPI(endpoint) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Terjadi kesalahan pada server');
    }
    return data.data;
  } catch (error) {
    if (error.message === 'Network request failed') {
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    }
    throw error;
  }
}

export const ProdiAPI = {
  list: () => fetchAPI('/prodi'),
};

export const CPLAPI = {
  list: () => fetchAPI('/kurikulum/cpl'),
};

export const MKAPI = {
  list: () => fetchAPI('/kurikulum/mk'),
};

export const MkCplAPI = {
  listAll: () => fetchAPI('/kurikulum/mapping'),
};

export const SubCpmkAPI = {
  listAll: () => fetchAPI('/kurikulum/sub-cpmk'),
};

// Helper to change base URL at runtime (e.g. for physical device)
export function setBaseUrl(url) {
  // This is a simple approach - in production you'd use env config
  console.log(`API Base URL set to: ${url}`);
}
