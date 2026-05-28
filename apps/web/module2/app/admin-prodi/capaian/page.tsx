'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cplApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  prodi_id: string;
}

interface CPL {
  id: string;
  kode_cpl: string;
  deskripsi: string;
}

interface CapaianDetail {
  mahasiswa_id: string;
  nim: string;
  nama_mahasiswa: string;
  cpl_id: string;
  kode_cpl: string;
  nilai_cpl_total: number;
  status: string;
}

export default function AdminProdiCapaianPage() {
  const { user } = useAuth();
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [capaianList, setCapaianList] = useState<CapaianDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCapaianData();
  }, []);

  const loadCapaianData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const prodiId = (user as any)?.prodi_id || (user as any)?.entity_id;
      
      if (!prodiId) {
        showToast('Prodi ID tidak ditemukan', 'error');
        return;
      }

      // Fetch mahasiswa by prodi
      const mhsResponse = await fetch(`http://localhost:3000/api/v1/m1/mahasiswa`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const mhsData = await mhsResponse.json();
      const allMahasiswa = mhsData.data || [];
      const mahasiswaList = allMahasiswa.filter((m: any) => String(m.prodi_id) === String(prodiId));
      
      setMahasiswaList(mahasiswaList);
      
      if (mahasiswaList.length === 0) {
        showToast('Tidak ada mahasiswa di program studi ini', 'error');
        setCapaianList([]);
        return;
      }
      
      // Fetch CPL untuk mapping
      const cplResponse = await cplApi.getByProdi(prodiId);
      const cplList = cplResponse.data || [];
      setCplList(cplList);
      
      const allCapaian: CapaianDetail[] = [];
      
      // Untuk setiap mahasiswa, fetch capaian
      for (const mhs of mahasiswaList) {
        try {
          const capaianUrl = `http://localhost:3000/api/v1/m2/capaian/mahasiswa/${mhs.id}`;
          const capaianResponse = await fetch(capaianUrl, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          
          if (capaianResponse.ok) {
            const capaianData = await capaianResponse.json();
            const capaianMhs = capaianData.data || [];
            
            capaianMhs.forEach((c: any) => {
              allCapaian.push({
                mahasiswa_id: mhs.id,
                nim: mhs.nim,
                nama_mahasiswa: mhs.nama,
                cpl_id: c.cpl_id,
                kode_cpl: c.kode_cpl,
                nilai_cpl_total: parseFloat(c.rata_rata_nilai || c.nilai_cpl_total || 0),
                status: c.status_capaian || getStatusText(parseFloat(c.rata_rata_nilai || c.nilai_cpl_total || 0)),
              });
            });
          }
        } catch (err) {
          console.error(`Error fetching capaian for ${mhs.nim}:`, err);
        }
      }
      
      setCapaianList(allCapaian);
    } catch (error) {
      showToast('Gagal memuat data capaian', 'error');
      console.error('Error loading capaian:', error);
      setCapaianList([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (nilai: number): string => {
    if (nilai >= 85) return 'Excellence';
    if (nilai >= 70) return 'Satisfactory';
    if (nilai >= 55) return 'Competent';
    if (nilai >= 40) return 'Developing';
    return 'Not Competent';
  };

  const getStatusBadge = (nilai: number) => {
    if (nilai >= 85) return { class: 'badge-green', text: 'Excellence' };
    if (nilai >= 70) return { class: 'badge-blue', text: 'Satisfactory' };
    if (nilai >= 55) return { class: 'badge-yellow', text: 'Competent' };
    if (nilai >= 40) return { class: 'badge-red', text: 'Developing' };
    return { class: 'badge-red', text: 'Not Competent' };
  };

  const filteredCapaian = capaianList.filter(capaian =>
    (capaian.nim && capaian.nim.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (capaian.nama_mahasiswa && capaian.nama_mahasiswa.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (capaian.kode_cpl && capaian.kode_cpl.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Capaian Mahasiswa</h1>
        <p className="page-subtitle">Pantau capaian pembelajaran mahasiswa program studi Anda (Read Only)</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            placeholder="Cari NIM, nama, atau CPL..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="input-field" 
            style={{ paddingLeft: '38px' }} 
          />
        </div>
        <button 
          onClick={loadCapaianData}
          className="btn btn-secondary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Stats Summary */}
      {capaianList.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }} className="animate-fade-in stagger-1">
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Data</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{capaianList.length}</p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Mahasiswa</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {new Set(capaianList.map(c => c.mahasiswa_id)).size}
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>CPL Unik</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {new Set(capaianList.map(c => c.cpl_id)).size}
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Rata-rata</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {(capaianList.reduce((sum, c) => sum + c.nilai_cpl_total, 0) / capaianList.length).toFixed(1)}%
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
        ) : filteredCapaian.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada data capaian</p>
            <p>Belum ada data capaian mahasiswa untuk program studi Anda</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIM</th>
                <th>Nama Mahasiswa</th>
                <th>CPL</th>
                <th>Nilai Capaian</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCapaian.map((capaian, index) => {
                const status = getStatusBadge(capaian.nilai_cpl_total);
                return (
                  <tr key={`${capaian.mahasiswa_id}-${capaian.cpl_id}`}>
                    <td>{index + 1}</td>
                    <td><span className="badge badge-dark">{capaian.nim}</span></td>
                    <td style={{ fontWeight: '600' }}>{capaian.nama_mahasiswa}</td>
                    <td><span className="badge badge-blue">{capaian.kode_cpl}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${status.class}`} style={{ minWidth: '60px' }}>
                          {capaian.nilai_cpl_total.toFixed(1)}%
                        </span>
                        <div style={{ flex: 1, maxWidth: '150px', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${Math.min(capaian.nilai_cpl_total, 100)}%`, 
                              height: '100%', 
                              backgroundColor: capaian.nilai_cpl_total >= 85 ? '#10b981' : capaian.nilai_cpl_total >= 70 ? '#3b82f6' : capaian.nilai_cpl_total >= 55 ? '#f59e0b' : '#ef4444',
                              transition: 'width 0.3s ease'
                            }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
