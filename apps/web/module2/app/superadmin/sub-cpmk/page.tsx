'use client';

import React, { useState, useEffect } from 'react';
import { subCpmkApi, mkCplApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

interface SubCPMK {
  id: number;
  kode_sub_cpmk: string;
  deskripsi: string;
  bobot: number;
  mk_cpl_id?: number;
  kode_cpl?: string;
  kode_mk?: string;
  nama_mk?: string;
  created_at?: string;
}

interface MKCPL {
  id: number;
  mk_id: string;
  cpl_id: string;
  kode_mk: string;
  nama_mk: string;
  kode_cpl: string;
  deskripsi_cpl: string;
}

export default function SubCPMKPage() {
  const [items, setItems] = useState<SubCPMK[]>([]);
  const [mkCplList, setMkCplList] = useState<MKCPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SubCPMK | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    kode_sub_cpmk: '',
    deskripsi: '',
    mk_cpl_id: '',
    bobot: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadSubCpmk();
    loadMKCPL();
  }, []);

  const loadSubCpmk = async () => {
    try {
      setLoading(true);
      const response = await subCpmkApi.getAll();
      setItems(response.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data sub-CPMK', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMKCPL = async () => {
    try {
      const response = await mkCplApi.getAll();
      setMkCplList(response.data || []);
    } catch (error) {
      console.error('Error loading MK-CPL:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus sub-CPMK ini?')) return;
    
    try {
      await subCpmkApi.delete(String(id));
      showToast('Sub-CPMK berhasil dihapus', 'success');
      loadSubCpmk();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus sub-CPMK', 'error');
    }
  };

  const handleEdit = (item: SubCPMK) => {
    setEditMode(true);
    setSelectedItem(item);
    setFormData({
      kode_sub_cpmk: item.kode_sub_cpmk,
      deskripsi: item.deskripsi,
      mk_cpl_id: String(item.mk_cpl_id || ''),
      bobot: String(item.bobot * 100), // Convert 0-1 to 0-100 for display
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.kode_sub_cpmk || !formData.deskripsi || !formData.mk_cpl_id || !formData.bobot) {
      showToast('Semua field wajib diisi', 'error');
      return;
    }

    const bobotNum = parseFloat(formData.bobot);
    if (isNaN(bobotNum) || bobotNum <= 0 || bobotNum > 100) {
      showToast('Bobot harus antara 0-100', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const bobotDecimal = bobotNum / 100; // Convert 0-100 to 0-1 for backend
      
      if (editMode && selectedItem) {
        // Update - sekarang bisa update mk_cpl_id juga
        await subCpmkApi.update(String(selectedItem.id), {
          kode_sub_cpmk: formData.kode_sub_cpmk,
          deskripsi: formData.deskripsi,
          mk_cpl_id: formData.mk_cpl_id,
          bobot: bobotDecimal,
        });
        showToast('Sub-CPMK berhasil diupdate', 'success');
      } else {
        // Create
        await subCpmkApi.create({
          kode_sub_cpmk: formData.kode_sub_cpmk,
          deskripsi: formData.deskripsi,
          mk_cpl_id: formData.mk_cpl_id,
          bobot: bobotDecimal,
        });
        showToast('Sub-CPMK berhasil ditambahkan', 'success');
      }
      setShowModal(false);
      resetForm();
      loadSubCpmk();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan sub-CPMK', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      kode_sub_cpmk: '',
      deskripsi: '',
      mk_cpl_id: '',
      bobot: '',
    });
    setEditMode(false);
    setSelectedItem(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredItems = items.filter(item =>
    item.kode_sub_cpmk.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Sub-CPMK</h1>
        <p className="page-subtitle">Kelola sub capaian pembelajaran mata kuliah</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari sub-CPMK..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah Sub-CPMK
        </button>
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
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada sub-CPMK ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode Sub-CPMK</th>
                <th>Deskripsi</th>
                <th>Mata Kuliah</th>
                <th>CPL</th>
                <th>Bobot (%)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-blue">{item.kode_sub_cpmk}</span></td>
                  <td style={{ maxWidth: '250px', fontSize: '13px' }}>{item.deskripsi}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="badge badge-dark" style={{ fontSize: '11px' }}>{item.kode_mk || '-'}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.nama_mk || '-'}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-green">{item.kode_cpl || '-'}</span></td>
                  <td><span className="badge badge-yellow">{(item.bobot * 100).toFixed(1)}%</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleEdit(item)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              {editMode ? 'Edit Sub-CPMK' : 'Tambah Sub-CPMK'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode ? 'Ubah data sub-CPMK' : 'Isi form di bawah untuk menambahkan sub-CPMK baru'}
            </p>
            
            <form onSubmit={handleSubmit}>
              {/* Kode Sub-CPMK */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Kode Sub-CPMK <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.kode_sub_cpmk}
                  onChange={(e) => setFormData({ ...formData, kode_sub_cpmk: e.target.value })}
                  placeholder="Contoh: SCPL-01, SCPL-02"
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
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Deskripsi sub-CPMK"
                  className="input-field"
                  required
                  disabled={formLoading}
                  rows={3}
                  style={{ resize: 'vertical', minHeight: '60px' }}
                />
              </div>

              {/* Mata Kuliah & CPL */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Mata Kuliah & CPL <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  value={formData.mk_cpl_id}
                  onChange={(e) => setFormData({ ...formData, mk_cpl_id: e.target.value })}
                  className="select-field"
                  required
                  disabled={formLoading}
                >
                  <option value="">Pilih Mata Kuliah & CPL</option>
                  {mkCplList.map((mkCpl) => (
                    <option key={mkCpl.id} value={mkCpl.id}>
                      {mkCpl.kode_mk} - {mkCpl.nama_mk} → {mkCpl.kode_cpl}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Pilih pemetaan mata kuliah ke CPL yang sesuai
                </p>
              </div>

              {/* Bobot */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Bobot (%) <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.bobot}
                  onChange={(e) => setFormData({ ...formData, bobot: e.target.value })}
                  placeholder="Masukkan bobot 0-100"
                  className="input-field"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  disabled={formLoading}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Masukkan bobot dalam persen (0-100). Total bobot semua sub-CPMK dalam satu MK-CPL harus 100%
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
                  disabled={formLoading}
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
