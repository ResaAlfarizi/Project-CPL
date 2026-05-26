import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Read-only API client for Module 1
// Only GET endpoints — no create/update/delete

export async function getAPIUrl() {
  // Otomatis mengambil IP dari server Expo yang sedang berjalan
  const hostUri = Constants.expoConfig?.hostUri;
  // Jika gagal, akan fallback ke 127.0.0.1 (tapi hampir selalu berhasil jika dari Expo Go)
  const ip = hostUri ? hostUri.split(':')[0] : '127.0.0.1';
  return `http://${ip}:3000/api/v1/m1`;
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
