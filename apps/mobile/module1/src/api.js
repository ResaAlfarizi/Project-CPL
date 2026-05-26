import AsyncStorage from '@react-native-async-storage/async-storage';

// Read-only API client for Module 1
// Only GET endpoints — no create/update/delete

// Default IP lokal komputer
let cachedAPIUrl = 'http://192.168.137.1:3000/api/v1/m1';

export async function getAPIUrl() {
  try {
    const saved = await AsyncStorage.getItem('API_URL');
    if (saved) {
      cachedAPIUrl = saved;
      return saved;
    }
  } catch (e) {
    // ignore
  }
  return cachedAPIUrl;
}

async function fetchAPI(endpoint) {
  const url = await getAPIUrl();
  try {
    const res = await fetch(`${url}${endpoint}`, {
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
      throw new Error(`Tidak dapat terhubung ke server (${url}). Pastikan backend berjalan.`);
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
export async function setBaseUrl(url) {
  try {
    await AsyncStorage.setItem('API_URL', url);
    cachedAPIUrl = url;
    console.log(`API Base URL set to: ${url}`);
  } catch (e) {
    console.error('Failed to save API URL:', e);
  }
}
