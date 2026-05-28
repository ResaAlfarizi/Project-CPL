'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mkCplApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

interface MKCPL {
  id: number;
  mk_id: string;
  cpl_id: string;
  kode_mk: string;
  nama_mk: string;
  kode_cpl: string;
  deskripsi_cpl: string;
  prodi_id?: string;
}

export default function AdminProdiCPMKPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MKCPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMKCPL();
  }, []);

  const loadMKCPL = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const prodiId = (user as any)?.prodi_id || (user as any)?.entity_id;
      
      if (!prodiId) {
        showToast('Prodi ID tidak ditemukan', 'error');
        return;
      }

      const response = await mkCplApi.getAll();
      const allData = response.data || [];
      
      // Fetch mata kuliah to get prodi_id
      const mkResponse = await fetch(`http://localhost:3000/api/v1/m1/kurikulum/mk`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      let mkData: any[] = [];
      if (mkResponse.ok) {
        const mkResult = await mkResponse.json();
        mkData = mkResult.data || [];
      }
      
      // Filter by prodi - check if mk belongs to this prodi
      const filteredData = allData.filter((item: MKCPL) => {
        const mk = mkData.find((m: any) => m.id === item.mk_id);
        return mk && String(mk.prodi_id) === String(prodiId);
      });
      
      setItems(filteredData);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data CPMK', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.kode_mk.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama_mk.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode_cpl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Pemetaan MK-CPL (CPMK)</h1>
        <p className="page-subtitle">Lihat pemetaan mata kuliah ke capaian pembelajaran lulusan</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari mata kuliah atau CPL..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
      </div>

      {/* Stats */}
      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }} className="animate-fade-in stagger-1">
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Pemetaan</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{items.length}</p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Mata Kuliah Unik</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {new Set(items.map(i => i.mk_id)).size}
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>CPL Unik</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {new Set(items.map(i => i.cpl_id)).size}
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
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada pemetaan ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode MK</th>
                <th>Nama Mata Kuliah</th>
                <th>Kode CPL</th>
                <th>Deskripsi CPL</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-dark">{item.kode_mk}</span></td>
                  <td style={{ fontWeight: '600' }}>{item.nama_mk}</td>
                  <td><span className="badge badge-green">{item.kode_cpl}</span></td>
                  <td style={{ maxWidth: '300px', fontSize: '13px' }}>{item.deskripsi_cpl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
