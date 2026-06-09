import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Full CRUD API client for Module 1

export async function getAPIUrl() {
  return `http://20.5.25.251:3000/api/v1/m1`;
}

async function fetchAPI(endpoint, options = {}) {
  const url = await getAPIUrl();
  try {
    const res = await fetch(`${url}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
  create: (data) => fetchAPI('/prodi', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/prodi/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/prodi/${id}`, { method: 'DELETE' }),
};

export const CPLAPI = {
  list: () => fetchAPI('/kurikulum/cpl'),
  create: (data) => fetchAPI('/kurikulum/cpl', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/kurikulum/cpl/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/kurikulum/cpl/${id}`, { method: 'DELETE' }),
};

export const MKAPI = {
  list: () => fetchAPI('/kurikulum/mk'),
  create: (data) => fetchAPI('/kurikulum/mk', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/kurikulum/mk/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/kurikulum/mk/${id}`, { method: 'DELETE' }),
};

export const MkCplAPI = {
  listAll: () => fetchAPI('/kurikulum/mapping'),
  saveBatch: (mk_id, mappings) => fetchAPI('/kurikulum/mapping', {
    method: 'POST',
    body: JSON.stringify({ mk_id, mappings })
  })
};

export const SubCpmkAPI = {
  listAll: () => fetchAPI('/kurikulum/sub-cpmk'),
  saveBatch: (mk_cpl_id, subCpmks) => fetchAPI('/kurikulum/sub-cpmk/batch', {
    method: 'POST',
    body: JSON.stringify({ mk_cpl_id, subCpmks })
  })
};

export const ThresholdAPI = {
  listAll: () => fetchAPI('/threshold'),
  save: (prodi_id, thresholds) => fetchAPI('/threshold', {
    method: 'POST',
    body: JSON.stringify({ prodi_id, thresholds })
  })
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
