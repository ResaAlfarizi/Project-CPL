'use client';

import React, { useState, useEffect } from 'react';
import { prodiApi, cplApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

interface Prodi {
  id: number;
  kode_prodi: string;
  nama_prodi: string;
  fakultas?: string;
  created_at?: string;
}

export default function ProdiCPLPage() {
  const [items, setItems] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProdiModal, setShowProdiModal] = useState(false);
  const [showCPLModal, setShowCPLModal] = useState(false);
  const [showCPLListModal, setShowCPLListModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editProdiMode, setEditProdiMode] = useState(false);
  const [selectedProdi, setSelectedProdi] = useState<Prodi | null>(null);
  const [cplList, setCplList] = useState<any[]>([]);
  const [cplListLoading, setCplListLoading] = useState(false);
  
  // Form state untuk Prodi
  const [prodiFormData, setProdiFormData] = useState({
    kode_prodi: '',
    nama_prodi: '',
    jenjang: 'S1',
  });
  
  // Form state untuk CPL
  const [cplFormData, setCplFormData] = useState({
    id: '',
    kode_cpl: '',
    deskripsi: '',
    prodi_id: '',
    is_active: true,
  });
  
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadProdi();
  }, []);

  const loadProdi = async () => {
    try {
      setLoading(true);
      const response = await prodiApi.getAll();
      setItems(response.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data prodi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus program studi ini?')) return;
    
    try {
      await prodiApi.delete(String(id));
      showToast('Program studi berhasil dihapus', 'success');
      loadProdi();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus program studi', 'error');
    }
  };

  const handleEditProdi = (item: Prodi) => {
    setEditProdiMode(true);
    setSelectedProdi(item);
    setProdiFormData({
      kode_prodi: item.kode_prodi,
      nama_prodi: item.nama_prodi,
      jenjang: 'S1', // Default, bisa disesuaikan jika ada field jenjang di database
    });
    setShowProdiModal(true);
  };

  const handleViewCPL = async (prodi: Prodi) => {
    setSelectedProdi(prodi);
    setShowCPLListModal(true);
    setCplListLoading(true);
    
    try {
      const response = await cplApi.getByProdi(String(prodi.id));
      setCplList(response.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat CPL', 'error');
      setCplList([]);
    } finally {
      setCplListLoading(false);
    }
  };

  const handleEditCPL = (cpl: any) => {
    setEditMode(true);
    setCplFormData({
      id: cpl.id,
      kode_cpl: cpl.kode_cpl,
      deskripsi: cpl.deskripsi,
      prodi_id: cpl.prodi_id,
      is_active: cpl.is_active !== false,
    });
    setShowCPLModal(true);
    setShowCPLListModal(false);
  };

  const handleDeleteCPL = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus CPL ini?')) return;
    
    try {
      await cplApi.delete(id);
      showToast('CPL berhasil dihapus', 'success');
      // Refresh CPL list
      if (selectedProdi) {
        const response = await cplApi.getByProdi(String(selectedProdi.id));
        setCplList(response.data || []);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus CPL', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!prodiFormData.kode_prodi || !prodiFormData.nama_prodi || !prodiFormData.jenjang) {
      showToast('Semua field wajib diisi', 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      if (editProdiMode && selectedProdi) {
        // Update
        await prodiApi.update(String(selectedProdi.id), prodiFormData);
        showToast('Program studi berhasil diupdate', 'success');
      } else {
        // Create
        await prodiApi.create(prodiFormData);
        showToast('Program studi berhasil ditambahkan', 'success');
      }
      
      setShowProdiModal(false);
      resetProdiForm();
      loadProdi();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan program studi', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCPLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!cplFormData.kode_cpl || !cplFormData.deskripsi || !cplFormData.prodi_id) {
      showToast('Kode CPL, deskripsi, dan program studi wajib diisi', 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      if (editMode && cplFormData.id) {
        // Update
        await cplApi.update(cplFormData.id, {
          kode_cpl: cplFormData.kode_cpl,
          deskripsi: cplFormData.deskripsi,
          prodi_id: cplFormData.prodi_id,
          is_active: cplFormData.is_active,
        });
        showToast('CPL berhasil diupdate', 'success');
      } else {
        // Create
        await cplApi.create({
          kode_cpl: cplFormData.kode_cpl,
          deskripsi: cplFormData.deskripsi,
          prodi_id: cplFormData.prodi_id,
          is_active: cplFormData.is_active,
        });
        showToast('CPL berhasil ditambahkan', 'success');
      }
      
      setShowCPLModal(false);
      resetCPLForm();
      
      // Refresh CPL list jika sedang melihat detail
      if (selectedProdi) {
        const response = await cplApi.getByProdi(String(selectedProdi.id));
        setCplList(response.data || []);
        setShowCPLListModal(true);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan CPL', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetProdiForm = () => {
    setProdiFormData({
      kode_prodi: '',
      nama_prodi: '',
      jenjang: 'S1',
    });
    setEditProdiMode(false);
    setSelectedProdi(null);
  };

  const resetCPLForm = () => {
    setCplFormData({
      id: '',
      kode_cpl: '',
      deskripsi: '',
      prodi_id: '',
      is_active: true,
    });
    setEditMode(false);
  };

  const handleProdiModalClose = () => {
    setShowProdiModal(false);
    resetProdiForm();
  };

  const handleCPLModalClose = () => {
    setShowCPLModal(false);
    resetCPLForm();
  };

  const filteredItems = items.filter(item =>
    item.nama_prodi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode_prodi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Program Studi & CPL</h1>
        <p className="page-subtitle">Kelola program studi dan capaian pembelajaran lulusan</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari program studi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-accent" onClick={() => setShowCPLModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah CPL
          </button>
          <button className="btn btn-primary" onClick={() => setShowProdiModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Program Studi
          </button>
        </div>
      </div>

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
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada program studi ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Nama Program Studi</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-dark">{item.kode_prodi}</span></td>
                  <td style={{ fontWeight: '600' }}>{item.nama_prodi}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleViewCPL(item)}
                        className="btn btn-accent btn-sm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        CPL
                      </button>
                      <button 
                        onClick={() => handleEditProdi(item)}
                        className="btn btn-secondary btn-sm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Tambah Prodi */}
      {showProdiModal && (
        <div className="modal-overlay" onClick={handleProdiModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              {editProdiMode ? 'Edit Program Studi' : 'Tambah Program Studi'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editProdiMode ? 'Ubah data program studi' : 'Isi form di bawah untuk menambahkan program studi baru'}
            </p>
            
            <form onSubmit={handleSubmit}>
              {/* Kode Prodi */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Kode Program Studi <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={prodiFormData.kode_prodi}
                  onChange={(e) => setProdiFormData({ ...prodiFormData, kode_prodi: e.target.value })}
                  placeholder="Contoh: TI, SI, IF"
                  className="input-field"
                  required
                  disabled={formLoading}
                />
              </div>

              {/* Nama Prodi */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Nama Program Studi <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={prodiFormData.nama_prodi}
                  onChange={(e) => setProdiFormData({ ...prodiFormData, nama_prodi: e.target.value })}
                  placeholder="Contoh: Teknik Informatika"
                  className="input-field"
                  required
                  disabled={formLoading}
                />
              </div>

              {/* Jenjang */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Jenjang <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  value={prodiFormData.jenjang}
                  onChange={(e) => setProdiFormData({ ...prodiFormData, jenjang: e.target.value })}
                  className="select-field"
                  required
                  disabled={formLoading}
                >
                  <option value="D3">D3 - Diploma 3</option>
                  <option value="S1">S1 - Sarjana</option>
                  <option value="S2">S2 - Magister</option>
                  <option value="S3">S3 - Doktor</option>
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={handleProdiModalClose} 
                  className="btn btn-ghost"
                  disabled={formLoading}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah CPL */}
      {showCPLModal && (
        <div className="modal-overlay" onClick={handleCPLModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              {editMode ? 'Edit CPL' : 'Tambah CPL'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode ? 'Ubah data Capaian Pembelajaran Lulusan' : 'Isi form di bawah untuk menambahkan Capaian Pembelajaran Lulusan baru'}
            </p>
            
            <form onSubmit={handleCPLSubmit}>
              {/* Program Studi */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Program Studi <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  value={cplFormData.prodi_id}
                  onChange={(e) => setCplFormData({ ...cplFormData, prodi_id: e.target.value })}
                  className="select-field"
                  required
                  disabled={formLoading}
                >
                  <option value="">Pilih Program Studi</option>
                  {items.map((prodi) => (
                    <option key={prodi.id} value={prodi.id}>
                      {prodi.kode_prodi} - {prodi.nama_prodi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kode CPL */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Kode CPL <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={cplFormData.kode_cpl}
                  onChange={(e) => setCplFormData({ ...cplFormData, kode_cpl: e.target.value })}
                  placeholder="Contoh: CPL-01, CPL-02"
                  className="input-field"
                  required
                  disabled={formLoading}
                />
              </div>

              {/* Deskripsi */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Deskripsi <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <textarea
                  value={cplFormData.deskripsi}
                  onChange={(e) => setCplFormData({ ...cplFormData, deskripsi: e.target.value })}
                  placeholder="Deskripsi capaian pembelajaran lulusan"
                  className="input-field"
                  required
                  disabled={formLoading}
                  rows={4}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
              </div>

              {/* Status Aktif */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={cplFormData.is_active}
                    onChange={(e) => setCplFormData({ ...cplFormData, is_active: e.target.checked })}
                    disabled={formLoading}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    CPL Aktif
                  </span>
                </label>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '24px' }}>
                  CPL yang aktif akan ditampilkan dalam sistem penilaian
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={handleCPLModalClose} 
                  className="btn btn-ghost"
                  disabled={formLoading}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Daftar CPL per Prodi */}
      {showCPLListModal && (
        <div className="modal-overlay" onClick={() => setShowCPLListModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              Daftar CPL - {selectedProdi?.nama_prodi}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              Capaian Pembelajaran Lulusan untuk program studi {selectedProdi?.kode_prodi}
            </p>

            {cplListLoading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '40px' }}></div>
              </div>
            ) : cplList.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', margin: '0 auto 12px' }}>
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                </svg>
                <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>Belum ada CPL</p>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Tambahkan CPL untuk program studi ini</p>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Kode CPL</th>
                      <th>Deskripsi</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cplList.map((cpl, index) => (
                      <tr key={cpl.id}>
                        <td>{index + 1}</td>
                        <td><span className="badge badge-dark">{cpl.kode_cpl}</span></td>
                        <td style={{ fontSize: '13px', maxWidth: '300px' }}>{cpl.deskripsi}</td>
                        <td>
                          {cpl.is_active !== false ? (
                            <span className="badge badge-green">Aktif</span>
                          ) : (
                            <span className="badge" style={{ backgroundColor: '#fee', color: '#c33' }}>Nonaktif</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => handleEditCPL(cpl)}
                              className="btn btn-secondary btn-sm"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCPL(cpl.id)}
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowCPLListModal(false)} 
                className="btn btn-ghost"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
