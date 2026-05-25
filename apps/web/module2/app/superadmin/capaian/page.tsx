'use client';

import React, { useState, useEffect } from 'react';
import { prodiApi, capaianApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

interface Prodi {
  id: number;
  nama_prodi: string;
}

interface Capaian {
  mahasiswa_id: number;
  nim?: string;
  nama_mahasiswa?: string;
  cpl_id: number;
  kode_cpl?: string;
  capaian_persen: number;
  status?: string;
}

export default function CapaianPage() {
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [capaianList, setCapaianList] = useState<Capaian[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProdi, setSelectedProdi] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Form state untuk input capaian manual
  const [formData, setFormData] = useState({
    mahasiswa_id: '',
    cpl_id: '',
    nilai_capaian: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadProdi();
  }, []);

  useEffect(() => {
    if (selectedProdi) {
      loadCapaian(selectedProdi);
    }
  }, [selectedProdi]);

  const loadProdi = async () => {
    try {
      const response = await prodiApi.getAll();
      setProdiList(response.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data prodi', 'error');
    }
  };

  const loadCapaian = async (prodiId: string) => {
    try {
      setLoading(true);
      const response = await capaianApi.getByProdi(prodiId);
      setCapaianList(response.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data capaian', 'error');
      setCapaianList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mahasiswaId: number, cplId: number, namaMhs: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data capaian untuk mahasiswa "${namaMhs}"?`)) return;
    
    try {
      // Note: Endpoint delete capaian mungkin belum ada di backend
      // await capaianApi.delete(mahasiswaId, cplId);
      showToast('Fitur hapus capaian belum tersedia di backend', 'error');
      // loadCapaian(selectedProdi);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus data capaian', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.mahasiswa_id || !formData.cpl_id || !formData.nilai_capaian) {
      showToast('Semua field wajib diisi', 'error');
      return;
    }

    const nilai = parseFloat(formData.nilai_capaian);
    if (isNaN(nilai) || nilai < 0 || nilai > 100) {
      showToast('Nilai capaian harus antara 0-100', 'error');
      return;
    }

    try {
      setFormLoading(true);
      // Note: Endpoint create capaian manual mungkin belum ada di backend
      // await capaianApi.createManual(formData);
      showToast('Fitur input capaian manual belum tersedia di backend', 'error');
      // setShowModal(false);
      // resetForm();
      // if (selectedProdi) loadCapaian(selectedProdi);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan data capaian', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      mahasiswa_id: '',
      cpl_id: '',
      nilai_capaian: '',
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredCapaian = capaianList.filter(capaian =>
    (capaian.nim && capaian.nim.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (capaian.nama_mahasiswa && capaian.nama_mahasiswa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (capaian: number) => {
    if (capaian >= 80) return { class: 'badge-green', text: 'Tercapai' };
    if (capaian >= 70) return { class: 'badge-yellow', text: 'Dalam Progress' };
    return { class: 'badge-red', text: 'Belum Tercapai' };
  };

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Capaian CPL Mahasiswa</h1>
        <p className="page-subtitle">Pantau capaian pembelajaran lulusan mahasiswa</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
          <select 
            className="select-field" 
            value={selectedProdi} 
            onChange={(e) => setSelectedProdi(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            <option value="">Pilih Program Studi</option>
            {prodiList.map(prodi => (
              <option key={prodi.id} value={prodi.id}>{prodi.nama_prodi}</option>
            ))}
          </select>
          <div style={{ position: 'relative', flex: '1', maxWidth: '300px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Cari mahasiswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Laporan
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Input Capaian Manual
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {!selectedProdi ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Pilih Program Studi</p>
            <p>Pilih program studi untuk melihat capaian CPL mahasiswa</p>
          </div>
        ) : loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : filteredCapaian.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada data capaian ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIM</th>
                <th>Nama Mahasiswa</th>
                <th>CPL</th>
                <th>Capaian (%)</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCapaian.map((capaian, index) => {
                const status = getStatusBadge(capaian.capaian_persen);
                return (
                  <tr key={`${capaian.mahasiswa_id}-${capaian.cpl_id}`}>
                    <td>{index + 1}</td>
                    <td><span className="badge badge-dark">{capaian.nim || '-'}</span></td>
                    <td style={{ fontWeight: '600' }}>{capaian.nama_mahasiswa || '-'}</td>
                    <td><span className="badge badge-blue">{capaian.kode_cpl || `CPL ${capaian.cpl_id}`}</span></td>
                    <td>
                      <span className={`badge ${capaian.capaian_persen >= 80 ? 'badge-green' : capaian.capaian_persen >= 70 ? 'badge-yellow' : 'badge-red'}`}>
                        {capaian.capaian_persen.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-accent btn-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                          Detail
                        </button>
                        <button className="btn btn-secondary btn-sm">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(capaian.mahasiswa_id, capaian.cpl_id, capaian.nama_mahasiswa || 'Mahasiswa')}
                          className="btn btn-sm" 
                          style={{ backgroundColor: '#fdecea', color: '#e74c3c' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Input Capaian Manual */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Input Capaian Manual</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '14px' }}>
              Isi form di bawah untuk input capaian CPL secara manual
            </p>
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: '6px', 
              padding: '10px 12px', 
              marginBottom: '20px',
              display: 'flex',
              gap: '8px',
              alignItems: 'start'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#856404" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p style={{ color: '#856404', fontSize: '12px', margin: 0 }}>
                <strong>Perhatian:</strong> Capaian CPL biasanya dihitung otomatis dari nilai mahasiswa. Input manual hanya untuk kasus khusus atau koreksi data.
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Program Studi (Read-only dari filter) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Program Studi
                </label>
                <input
                  type="text"
                  value={prodiList.find(p => String(p.id) === selectedProdi)?.nama_prodi || 'Pilih prodi terlebih dahulu'}
                  className="input-field"
                  disabled
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>

              {/* Mahasiswa */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Mahasiswa <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  value={formData.mahasiswa_id}
                  onChange={(e) => setFormData({ ...formData, mahasiswa_id: e.target.value })}
                  className="select-field"
                  required
                  disabled={formLoading || !selectedProdi}
                >
                  <option value="">Pilih Mahasiswa</option>
                  {/* Unique mahasiswa dari capaianList */}
                  {Array.from(new Set(capaianList.map(c => c.mahasiswa_id))).map(mhsId => {
                    const mhs = capaianList.find(c => c.mahasiswa_id === mhsId);
                    return (
                      <option key={mhsId} value={mhsId}>
                        {mhs?.nim} - {mhs?.nama_mahasiswa}
                      </option>
                    );
                  })}
                </select>
                {!selectedProdi && (
                  <p style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px' }}>
                    Pilih program studi terlebih dahulu
                  </p>
                )}
              </div>

              {/* CPL */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  CPL <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  value={formData.cpl_id}
                  onChange={(e) => setFormData({ ...formData, cpl_id: e.target.value })}
                  className="select-field"
                  required
                  disabled={formLoading || !selectedProdi}
                >
                  <option value="">Pilih CPL</option>
                  {/* Unique CPL dari capaianList */}
                  {Array.from(new Set(capaianList.map(c => c.cpl_id))).map(cplId => {
                    const cpl = capaianList.find(c => c.cpl_id === cplId);
                    return (
                      <option key={cplId} value={cplId}>
                        {cpl?.kode_cpl || `CPL ${cplId}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Nilai Capaian */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Nilai Capaian (%) <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.nilai_capaian}
                  onChange={(e) => setFormData({ ...formData, nilai_capaian: e.target.value })}
                  placeholder="Masukkan nilai 0-100"
                  className="input-field"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={formLoading}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Masukkan nilai capaian dalam persen (0-100)
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={handleModalClose} 
                  className="btn btn-ghost"
                  disabled={formLoading}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading || !selectedProdi}
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
