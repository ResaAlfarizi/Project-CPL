const API_URL = 'http://localhost:3000/api/v1/m1';

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
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

export const DosenAPI = {
  list: () => fetchAPI('/dosen'),
  create: (data) => fetchAPI('/dosen', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/dosen/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/dosen/${id}`, { method: 'DELETE' }),
};

export const MahasiswaAPI = {
  list: () => fetchAPI('/mahasiswa'),
  create: (data) => fetchAPI('/mahasiswa', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/mahasiswa/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/mahasiswa/${id}`, { method: 'DELETE' }),
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
  saveBatch: (mk_cpl_id, subCpmks) => fetchAPI('/kurikulum/sub-cpmk', {
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
