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
    <div className="sa-page">
      <ToastContainer />
      
      {/* Header */}
      <div className="sa-page-header">
        <h1 className="sa-page-title">Program Studi & CPL</h1>
        <p className="sa-page-subtitle">Kelola program studi dan capaian pembelajaran lulusan</p>
      </div>

      {/* Toolbar */}
      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <div className="sa-search">
            <span className="sa-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Cari program studi..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="sa-search-input"
            />
          </div>
        </div>
        <div className="sa-toolbar-right">
          <button className="sa-btn sa-btn-accent" onClick={() => setShowCPLModal(true)}>
            <span>➕</span>
            <span>Tambah CPL</span>
          </button>
          <button className="sa-btn sa-btn-primary" onClick={() => setShowProdiModal(true)}>
            <span>➕</span>
            <span>Tambah Program Studi</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="sa-card">
        {loading ? (
          <div className="sa-empty">
            <p>⏳ Memuat data...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="sa-empty">
            <p className="sa-empty-title">🎓 Tidak ada program studi ditemukan</p>
            <p className="sa-empty-subtitle">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
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
                  <td><span className="sa-badge sa-badge-primary">{item.kode_prodi}</span></td>
                  <td style={{ fontWeight: '600' }}>{item.nama_prodi}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleViewCPL(item)}
                        className="sa-btn sa-btn-accent sa-btn-sm"
                      >
                        <span>👁️</span>
                        <span>CPL</span>
                      </button>
                      <button 
                        onClick={() => handleEditProdi(item)}
                        className="sa-btn sa-btn-secondary sa-btn-sm"
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="sa-btn sa-btn-danger sa-btn-sm"
                      >
                        <span>🗑️</span>
                        <span>Hapus</span>
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
        <div className="sa-modal-overlay" onClick={handleProdiModalClose}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">{editProdiMode ? 'Edit Program Studi' : 'Tambah Program Studi'}</h2>
              <p className="sa-modal-subtitle">{editProdiMode ? 'Ubah data program studi' : 'Isi form di bawah untuk menambahkan program studi baru'}</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="sa-modal-body">
                <div className="sa-form-group">
                  <label className="sa-form-label">Kode Program Studi <span style={{ color: '#e74c3c' }}>*</span></label>
                  <input
                    type="text"
                    value={prodiFormData.kode_prodi}
                    onChange={(e) => setProdiFormData({ ...prodiFormData, kode_prodi: e.target.value })}
                    placeholder="Contoh: TI, SI, IF"
                    className="sa-form-control"
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="sa-form-group">
                  <label className="sa-form-label">Nama Program Studi <span style={{ color: '#e74c3c' }}>*</span></label>
                  <input
                    type="text"
                    value={prodiFormData.nama_prodi}
                    onChange={(e) => setProdiFormData({ ...prodiFormData, nama_prodi: e.target.value })}
                    placeholder="Contoh: Teknik Informatika"
                    className="sa-form-control"
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="sa-form-group">
                  <label className="sa-form-label">Jenjang <span style={{ color: '#e74c3c' }}>*</span></label>
                  <select
                    value={prodiFormData.jenjang}
                    onChange={(e) => setProdiFormData({ ...prodiFormData, jenjang: e.target.value })}
                    className="sa-form-control"
                    required
                    disabled={formLoading}
                  >
                    <option value="D3">D3 - Diploma 3</option>
                    <option value="S1">S1 - Sarjana</option>
                    <option value="S2">S2 - Magister</option>
                    <option value="S3">S3 - Doktor</option>
                  </select>
                </div>
              </div>

              <div className="sa-modal-footer">
                <button type="button" onClick={handleProdiModalClose} className="sa-btn sa-btn-ghost" disabled={formLoading}>
                  Batal
                </button>
                <button type="submit" className="sa-btn sa-btn-primary" disabled={formLoading}>
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah CPL */}
      {showCPLModal && (
        <div className="sa-modal-overlay" onClick={handleCPLModalClose}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">{editMode ? 'Edit CPL' : 'Tambah CPL'}</h2>
              <p className="sa-modal-subtitle">{editMode ? 'Ubah data Capaian Pembelajaran Lulusan' : 'Isi form di bawah untuk menambahkan Capaian Pembelajaran Lulusan baru'}</p>
            </div>
            
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
        <div className="sa-modal-overlay" onClick={() => setShowCPLListModal(false)}>
          <div className="sa-modal sa-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">Daftar CPL - {selectedProdi?.nama_prodi}</h2>
              <p className="sa-modal-subtitle">Capaian Pembelajaran Lulusan untuk program studi {selectedProdi?.kode_prodi}</p>
            </div>

            <div className="sa-modal-body">
              {cplListLoading ? (
                <div className="sa-empty">
                  <p>⏳ Memuat data...</p>
                </div>
              ) : cplList.length === 0 ? (
                <div className="sa-empty">
                  <p className="sa-empty-title">📋 Belum ada CPL</p>
                  <p className="sa-empty-subtitle">Tambahkan CPL untuk program studi ini</p>
                </div>
              ) : (
                <div className="sa-table-wrapper">
                  <table className="sa-table">
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
