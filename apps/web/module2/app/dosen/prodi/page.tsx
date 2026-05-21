'use client';

import { useEffect, useState } from 'react';
import { prodiApi, cplApi } from '@/lib/api';

interface Prodi {
  id: string;
  kode_prodi: string;
  nama_prodi: string;
  jenjang: string;
}

interface CPL {
  id: string;
  kode_cpl: string;
  deskripsi: string;
  is_active: boolean;
}

export default function ProdiPage() {
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingCpl, setLoadingCpl] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await prodiApi.getAll();
        setProdiList(res.data || []);
      } catch { setProdiList([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedProdi) { setCplList([]); return; }
    const loadCpl = async () => {
      setLoadingCpl(true);
      try {
        const res = await cplApi.getByProdi(selectedProdi);
        setCplList(res.data || []);
      } catch { setCplList([]); }
      finally { setLoadingCpl(false); }
    };
    loadCpl();
  }, [selectedProdi]);

  const filtered = prodiList.filter(p =>
    p.nama_prodi.toLowerCase().includes(search.toLowerCase()) ||
    p.kode_prodi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Program Studi & CPL</h1>
        <p className="page-subtitle">Data program studi dan Capaian Pembelajaran Lulusan (hanya baca)</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px', maxWidth: '400px' }} className="animate-fade-in stagger-1">
        <input
          type="text"
          placeholder="Cari program studi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ background: '#fff' }}
        />
      </div>

      {/* Prodi Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ width: '300px', height: '16px', margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada data</p>
            <p>Data program studi belum tersedia</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode Prodi</th>
                <th>Nama Program Studi</th>
                <th>Jenjang</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td><span className="badge badge-dark">{p.kode_prodi}</span></td>
                  <td style={{ fontWeight: '600' }}>{p.nama_prodi}</td>
                  <td><span className="badge badge-blue">{p.jenjang}</span></td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedProdi(selectedProdi === p.id ? '' : p.id)}
                    >
                      {selectedProdi === p.id ? 'Tutup CPL' : 'Lihat CPL'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CPL Section */}
      {selectedProdi && (
        <div className="animate-slide-in-up">
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-yellow">CPL</span>
            Capaian Pembelajaran Lulusan
          </h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loadingCpl ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto' }} />
              </div>
            ) : cplList.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontWeight: '600' }}>Belum ada CPL untuk prodi ini</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Kode CPL</th>
                    <th>Deskripsi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cplList.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td><span className="badge badge-dark">{c.kode_cpl}</span></td>
                      <td>{c.deskripsi}</td>
                      <td>
                        <span className={`badge ${c.is_active ? 'badge-green' : 'badge-red'}`}>
                          {c.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  );
}
