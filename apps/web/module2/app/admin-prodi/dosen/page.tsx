'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dosenApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

interface Dosen {
  id: string;
  nidn: string;
  nama: string;
  email?: string;
  prodi_id?: string;
  nama_prodi?: string;
  created_at?: string;
}

export default function AdminProdiDosenPage() {
  const { user } = useAuth();
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDosen();
  }, []);

  const loadDosen = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const prodiId = (user as any)?.prodi_id || (user as any)?.entity_id;
      
      if (!prodiId) {
        showToast('Prodi ID tidak ditemukan', 'error');
        return;
      }

      // Fetch dosen with prodi info from users table
      const response = await fetch(`http://localhost:3000/api/v1/m1/dosen`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Gagal memuat data dosen');
      }

      const data = await response.json();
      const allDosen = data.data || [];
      
      // Fetch users to get prodi_id and email
      const usersResponse = await fetch(`http://localhost:3000/api/v1/m2/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      let usersData: any[] = [];
      if (usersResponse.ok) {
        const usersResult = await usersResponse.json();
        usersData = usersResult.data || [];
      }
      
      // Merge dosen with user data
      const dosenWithProdi = allDosen.map((d: any) => {
        const userInfo = usersData.find((u: any) => u.entity_id === d.id && u.entity_type === 'dosen');
        return {
          ...d,
          prodi_id: userInfo?.prodi_id,
          email: userInfo?.email,
        };
      });
      
      // Filter by prodi
      const filteredDosen = dosenWithProdi.filter((d: any) => String(d.prodi_id) === String(prodiId));
      setDosenList(filteredDosen);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data dosen', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredDosen = dosenList.filter(dosen =>
    dosen.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dosen.nidn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dosen.email && dosen.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Data Dosen</h1>
        <p className="page-subtitle">Lihat data dosen program studi Anda</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari dosen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <button 
          onClick={loadDosen}
          className="btn btn-secondary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Stats */}
      {dosenList.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }} className="animate-fade-in stagger-1">
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Dosen</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{dosenList.length}</p>
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
        ) : filteredDosen.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada dosen ditemukan</p>
            <p>Belum ada data dosen untuk program studi Anda</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIDN</th>
                <th>Nama Dosen</th>
                <th>Email</th>
                <th>Program Studi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDosen.map((dosen, index) => (
                <tr key={dosen.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-dark">{dosen.nidn}</span></td>
                  <td style={{ fontWeight: '600' }}>{dosen.nama}</td>
                  <td style={{ fontSize: '13px' }}>{dosen.email || '-'}</td>
                  <td style={{ fontSize: '13px' }}>{dosen.nama_prodi || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
