'use client';

import { useEffect, useState } from 'react';
import { mahasiswaApi } from '@/lib/api';

interface Kelas {
  id: number;
  kode_mk?: string;
  nama_mk?: string;
  nama_kelas?: string;
  semester?: string;
  tahun_ajaran?: string;
  sks?: number;
  dosen_pengampu?: string;
  [key: string]: unknown;
}

export default function MataKuliahPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await mahasiswaApi.getAllKelas();
        const data = Array.isArray(res) ? res : res.data || [];
        setKelasList(data);
      } catch (error) {
        console.error('Error fetching kelas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = kelasList.filter((k) => {
    const q = search.toLowerCase();
    const matchSearch = 
      (k.nama_mk || '').toLowerCase().includes(q) ||
      (k.kode_mk || '').toLowerCase().includes(q) ||
      (k.nama_kelas || '').toLowerCase().includes(q);
    
    const matchSemester = selectedSemester === 'all' || k.semester === selectedSemester;
    
    return matchSearch && matchSemester;
  });

  const semesters = Array.from(new Set(kelasList.map(k => k.semester).filter(Boolean)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Cari mata kuliah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px' }}
          />
          <svg style={{ width: '20px', height: '20px', color: '#9CA3AF', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="select-field"
          style={{ minWidth: '180px' }}
        >
          <option value="all">Semua Semester</option>
          {semesters.map((sem) => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />
      ) : (
        <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>NO</th>
                <th>KODE MK</th>
                <th>NAMA MATA KULIAH</th>
                <th>KELAS</th>
                <th style={{ width: '80px' }}>SKS</th>
                <th>SEMESTER</th>
                <th>DOSEN</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
                    Tidak ada data mata kuliah
                  </td>
                </tr>
              ) : (
                filtered.map((kelas, idx) => (
                  <tr key={kelas.id}>
                    <td style={{ fontWeight: '500' }}>{idx + 1}</td>
                    <td>
                      <span className="badge badge-dark">{kelas.kode_mk || '-'}</span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{kelas.nama_mk || '-'}</td>
                    <td>
                      <span className="badge badge-green">{kelas.nama_kelas || '-'}</span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{kelas.sks || '-'}</td>
                    <td>
                      <span className="badge badge-blue">{kelas.semester || '-'}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{kelas.dosen_pengampu || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {!isLoading && filtered.length > 0 && (
        <div className="card animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Menampilkan <span style={{ fontWeight: '600', color: 'var(--eerie-black)' }}>{filtered.length}</span> mata kuliah
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Total SKS: <span style={{ fontWeight: '600', color: 'var(--eerie-black)' }}>
              {filtered.reduce((sum, k) => sum + (k.sks || 0), 0)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
