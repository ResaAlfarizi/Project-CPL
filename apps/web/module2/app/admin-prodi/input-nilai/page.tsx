'use client';

import React, { useState, useEffect } from 'react';
import { nilaiApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';

interface Nilai {
  id: string;
  enrollment_id: string;
  sub_cpmk_id: number;
  nilai: number;
  nim?: string;
  nama_mahasiswa?: string;
  kode_sub_cpmk?: string;
  kode_mk?: string;
  nama_mk?: string;
  tahun_akademik?: string;
  semester_aktif?: number;
  input_at?: string;
}

export default function InputNilaiPage() {
  const { user } = useAuth();
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadNilai();
  }, []);

  const loadNilai = async () => {
    try {
      setLoading(true);
      const response = await nilaiApi.getAll();
      // Filter by prodi if user has prodi_id
      let data = response.data || [];
      if (user?.prodi_id) {
        // In production, you should filter by prodi_id from backend
        // For now, show all data
      }
      setNilaiList(data);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data nilai', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredNilai = nilaiList.filter(nilai =>
    (nilai.nim && nilai.nim.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (nilai.nama_mahasiswa && nilai.nama_mahasiswa.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (nilai.kode_mk && nilai.kode_mk.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Input Nilai Sub-CPMK</h1>
        <p className="page-subtitle">Lihat data input nilai sub-CPMK mahasiswa (Read Only)</p>
      </div>

      {/* Info Badge */}
      <div className="animate-fade-in stagger-1" style={{ 
        padding: '12px 16px', 
        backgroundColor: '#EFF6FF', 
        border: '1px solid #BFDBFE', 
        borderRadius: '8px', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span style={{ fontSize: '13px', color: '#1E40AF', fontWeight: '500' }}>
          Anda memiliki akses <strong>Read Only</strong> untuk melihat data nilai. Untuk mengedit, hubungi Dosen atau Superadmin.
        </span>
      </div>

      {/* Search */}
      <div className="animate-fade-in stagger-2" style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            placeholder="Cari mahasiswa atau mata kuliah..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="input-field" 
            style={{ paddingLeft: '38px' }} 
          />
        </div>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-3" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : filteredNilai.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada data nilai ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIM</th>
                <th>Nama Mahasiswa</th>
                <th>Mata Kuliah</th>
                <th>Sub-CPMK</th>
                <th>Nilai</th>
                <th>Tanggal Input</th>
              </tr>
            </thead>
            <tbody>
              {filteredNilai.map((nilai, index) => (
                <tr key={nilai.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-dark">{nilai.nim || '-'}</span></td>
                  <td style={{ fontWeight: '600' }}>{nilai.nama_mahasiswa || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="badge badge-blue" style={{ fontSize: '11px' }}>{nilai.kode_mk || '-'}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{nilai.nama_mk || '-'}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-green">{nilai.kode_sub_cpmk || '-'}</span></td>
                  <td>
                    <span className={`badge ${nilai.nilai >= 80 ? 'badge-green' : nilai.nilai >= 70 ? 'badge-yellow' : 'badge-red'}`}>
                      {nilai.nilai}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {nilai.input_at ? new Date(nilai.input_at).toLocaleDateString('id-ID', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    }) : new Date().toLocaleDateString('id-ID', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
