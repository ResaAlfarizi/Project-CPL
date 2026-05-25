'use client';

import { useEffect, useState } from 'react';
import { kelasApi } from '@/lib/api';

interface Kelas {
  id: string;
  nama_kelas: string;
  tahun_akademik: string;
  semester_aktif: number;
  mk_id: string;
  nama_mk?: string;
  kode_mk?: string;
  sks?: number;
  semester?: number;
  dosen_id?: string;
  nama_dosen?: string;
}

export default function MataKuliahPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await kelasApi.getMyClasses();
        setKelasList(res.data || []);
      } catch { setKelasList([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = kelasList.filter(k =>
    (k.nama_mk || '').toLowerCase().includes(search.toLowerCase()) ||
    (k.kode_mk || '').toLowerCase().includes(search.toLowerCase()) ||
    (k.nama_kelas || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Mata Kuliah</h1>
        <p className="page-subtitle">Daftar mata kuliah dan kelas yang Anda ampu (hanya baca)</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px', maxWidth: '400px' }} className="animate-fade-in stagger-1">
        <input
          type="text"
          placeholder="Cari mata kuliah atau kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ background: '#fff' }}
        />
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ width: '300px', height: '16px', margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada data</p>
            <p>Anda belum memiliki kelas yang diampu</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode MK</th>
                <th>Nama Mata Kuliah</th>
                <th>SKS</th>
                <th>Semester</th>
                <th>Kelas</th>
                <th>Tahun Akademik</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((k, i) => (
                <tr key={k.id}>
                  <td>{i + 1}</td>
                  <td><span className="badge badge-dark">{k.kode_mk || '-'}</span></td>
                  <td style={{ fontWeight: '600' }}>{k.nama_mk || '-'}</td>
                  <td>{k.sks ?? '-'}</td>
                  <td><span className="badge badge-blue">Sem {k.semester ?? k.semester_aktif}</span></td>
                  <td><span className="badge badge-yellow">{k.nama_kelas || '-'}</span></td>
                  <td>{k.tahun_akademik}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
