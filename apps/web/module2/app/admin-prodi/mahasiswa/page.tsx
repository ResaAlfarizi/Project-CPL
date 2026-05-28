'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ToastContainer, { showToast } from '@/components/Toast';

interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  email?: string;
  prodi_id: string;
  nama_prodi?: string;
  angkatan?: string;
  created_at?: string;
}

export default function AdminProdiMahasiswaPage() {
  const { user } = useAuth();
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMahasiswa();
  }, []);

  const loadMahasiswa = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const prodiId = (user as any)?.prodi_id || (user as any)?.entity_id;
      
      if (!prodiId) {
        showToast('Prodi ID tidak ditemukan', 'error');
        return;
      }

      // Fetch mahasiswa from module1
      const response = await fetch(`http://localhost:3000/api/v1/m1/mahasiswa`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Gagal memuat data mahasiswa');
      }

      const data = await response.json();
      const allMahasiswa = data.data || [];
      
      // Fetch users to get email
      const usersResponse = await fetch(`http://localhost:3000/api/v1/m2/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      let usersData: any[] = [];
      if (usersResponse.ok) {
        const usersResult = await usersResponse.json();
        usersData = usersResult.data || [];
      }
      
      // Merge mahasiswa with user email
      const mahasiswaWithEmail = allMahasiswa.map((m: any) => {
        const userInfo = usersData.find((u: any) => u.entity_id === m.id && u.entity_type === 'mahasiswa');
        return {
          ...m,
          email: userInfo?.email,
        };
      });
      
      // Filter by prodi
      const filteredMahasiswa = mahasiswaWithEmail.filter((m: Mahasiswa) => String(m.prodi_id) === String(prodiId));
      setMahasiswaList(filteredMahasiswa);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data mahasiswa', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredMahasiswa = mahasiswaList.filter(mhs =>
    mhs.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mhs.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mhs.email && mhs.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Data Mahasiswa</h1>
        <p className="page-subtitle">Lihat data mahasiswa program studi Anda (Read Only)</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari mahasiswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <button 
          onClick={loadMahasiswa}
          className="btn btn-secondary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Stats */}
      {mahasiswaList.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }} className="animate-fade-in stagger-1">
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Mahasiswa</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{mahasiswaList.length}</p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Angkatan Unik</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {new Set(mahasiswaList.map(m => m.angkatan).filter(Boolean)).size}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : filteredMahasiswa.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada mahasiswa ditemukan</p>
            <p>Belum ada data mahasiswa untuk program studi Anda</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIM</th>
                <th>Nama Mahasiswa</th>
                <th>Email</th>
                <th>Angkatan</th>
                <th>Program Studi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMahasiswa.map((mhs, index) => (
                <tr key={mhs.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-dark">{mhs.nim}</span></td>
                  <td style={{ fontWeight: '600' }}>{mhs.nama}</td>
                  <td style={{ fontSize: '13px' }}>{mhs.email || '-'}</td>
                  <td>
                    {mhs.angkatan ? (
                      <span className="badge badge-blue">{mhs.angkatan}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ fontSize: '13px' }}>{mhs.nama_prodi || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
