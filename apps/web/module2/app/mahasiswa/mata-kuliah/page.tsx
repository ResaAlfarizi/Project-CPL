'use client';

import { useEffect, useState } from 'react';
import { mahasiswaApi } from '@/lib/api';

interface Kelas {
  id: number;
  kode_mk: string;
  nama_mk: string;
  nama_kelas?: string;
  tahun_akademik: string;
  semester_aktif: number;
  sks: number;
  nama_dosen?: string;
  nidn?: string;
  nama_prodi?: string;
}

export default function MataKuliahPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await mahasiswaApi.getMyKelas();
        const data = Array.isArray(res) ? res : res.data || [];
        setKelasList(data);
      } catch (error) {
        console.error('Error fetching kelas:', error);
        setKelasList([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = kelasList.filter((k) => {
    const q = search.toLowerCase();
    const matchSearch = 
      k.nama_mk.toLowerCase().includes(q) ||
      k.kode_mk.toLowerCase().includes(q) ||
      (k.nama_kelas || '').toLowerCase().includes(q);
    
    const semester = `${k.semester_aktif % 2 === 1 ? 'Ganjil' : 'Genap'} ${k.tahun_akademik}`;
    const matchSemester = selectedSemester === 'all' || semester === selectedSemester;
    
    return matchSearch && matchSemester;
  });

  const semesters = Array.from(new Set(kelasList.map(k => {
    return `${k.semester_aktif % 2 === 1 ? 'Ganjil' : 'Genap'} ${k.tahun_akademik}`;
  })));

  return (
    <>
      {/* Page Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Mata Kuliah</h1>
        <p className="page-subtitle">Daftar mata kuliah dan kelas yang Anda ikuti</p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }} className="animate-fade-in stagger-1">
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '400px' }}>
          <svg style={{ width: '16px', height: '16px', color: '#9CA3AF', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari mata kuliah atau kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px', background: '#fff' }}
          />
        </div>
        {semesters.length > 1 && (
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="select-field"
            style={{ minWidth: '180px', background: '#fff' }}
          >
            <option value="all">Semua Semester</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
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
            <p>{search || selectedSemester !== 'all' ? 'Tidak ada mata kuliah yang sesuai filter' : 'Anda belum terdaftar di kelas manapun'}</p>
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
                <th>Dosen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((kelas, idx) => {
                const semLabel = `${kelas.semester_aktif % 2 === 1 ? 'Ganjil' : 'Genap'}`;
                return (
                  <tr key={kelas.id}>
                    <td>{idx + 1}</td>
                    <td><span className="badge badge-dark">{kelas.kode_mk || '-'}</span></td>
                    <td style={{ fontWeight: '600' }}>{kelas.nama_mk || '-'}</td>
                    <td>{kelas.sks ?? '-'}</td>
                    <td><span className="badge badge-blue">Sem {kelas.semester_aktif} {semLabel}</span></td>
                    <td><span className="badge badge-yellow">{kelas.nama_kelas || '-'}</span></td>
                    <td>{kelas.tahun_akademik || '-'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{kelas.nama_dosen || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      {!isLoading && filtered.length > 0 && (
        <div className="card animate-fade-in" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '16px 24px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Menampilkan <span style={{ fontWeight: '700', color: 'var(--eerie-black)' }}>{filtered.length}</span> mata kuliah
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Total SKS: <span style={{ fontWeight: '700', color: 'var(--eerie-black)' }}>
              {filtered.reduce((sum, k) => sum + (k.sks || 0), 0)}
            </span>
          </p>
        </div>
      )}
    </>
  );
}
