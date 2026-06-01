'use client';

import React, { useState, useEffect } from 'react';
import ToastContainer, { showToast } from '@/components/Toast';

interface CPL {
  id: string;
  prodi_id: string;
  kode_cpl: string;
  deskripsi: string;
  is_active: boolean;
  created_at?: string;
}

interface Prodi {
  id: string;
  kode_prodi: string;
  nama_prodi: string;
}

export default function CPLPage() {
  const [items, setItems] = useState<CPL[]>([]);
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CPL | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CPL | null>(null);

  const [formData, setFormData] = useState({
    prodi_id: '',
    kode_cpl: '',
    deskripsi: '',
    is_active: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cplResponse, prodiResponse] = await Promise.all([
        fetch('http://localhost:3000/api/v1/m1/kurikulum/cpl', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        }),
        fetch('http://localhost:3000/api/v1/m1/prodi', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        }),
      ]);
      const cplData = await cplResponse.json();
      const prodiData = await prodiResponse.json();
      setItems(cplData.data || []);
      setProdiList(prodiData.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/m1/kurikulum/cpl/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!response.ok) throw new Error('Gagal menghapus CPL');
      showToast('CPL berhasil dihapus', 'success');
      loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus CPL', 'error');
    }
  };

  const handleEdit = (item: CPL) => {
    setEditMode(true);
    setSelectedItem(item);
    setFormData({
      prodi_id: item.prodi_id,
      kode_cpl: item.kode_cpl,
      deskripsi: item.deskripsi,
      is_active: item.is_active,
    });
    setShowModal(true);
  };

  const toggleActive = async (item: CPL) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/m1/kurikulum/cpl/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      if (!response.ok) throw new Error('Gagal mengubah status CPL');
      showToast(`CPL ${item.kode_cpl} ${!item.is_active ? 'diaktifkan' : 'dinonaktifkan'}`, 'info');
      loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal mengubah status', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prodi_id || !formData.kode_cpl || !formData.deskripsi) {
      showToast('Semua field wajib diisi', 'error');
      return;
    }
    try {
      setFormLoading(true);
      const url = editMode && selectedItem
        ? `http://localhost:3000/api/v1/m1/kurikulum/cpl/${selectedItem.id}`
        : 'http://localhost:3000/api/v1/m1/kurikulum/cpl';
      const response = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Gagal menyimpan CPL');
      showToast(editMode ? 'CPL berhasil diupdate' : 'CPL berhasil ditambahkan', 'success');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan CPL', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      prodi_id: filterProdi || (prodiList[0]?.id || ''),
      kode_cpl: '',
      deskripsi: '',
      is_active: true,
    });
    setEditMode(false);
    setSelectedItem(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredItems = items.filter(item => {
    const matchSearch = item.kode_cpl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProdi = !filterProdi || item.prodi_id === filterProdi;
    return matchSearch && matchProdi;
  });

  const getProdiName = (id: string) => prodiList.find(p => p.id === id)?.nama_prodi || '—';

  return (
    <div className="sa-page">
      <ToastContainer />
      <div className="sa-page-header">
        <h1 className="sa-page-title">CPL</h1>
        <p className="sa-page-subtitle">Kelola Capaian Pembelajaran Lulusan</p>
      </div>

      {prodiList.length === 0 && (
        <div style={{ background: '#fef9e7', border: '1px solid #f9ca7a', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' }}>
          ⚠️ Belum ada Program Studi. Daftarkan dulu di menu Prodi.
        </div>
      )}

      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <div className="sa-search">
            <span className="sa-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Cari CPL..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="sa-search-input"
            />
          </div>
          <select 
            className="sa-select" 
            value={filterProdi} 
            onChange={(e) => setFilterProdi(e.target.value)}
          >
            <option value="">Semua Prodi</option>
            {prodiList.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
        </div>
        <div className="sa-toolbar-right">
          <button 
            className="sa-btn sa-btn-primary" 
            onClick={() => setShowModal(true)} 
            disabled={prodiList.length === 0}
          >
            <span>➕</span>
            <span>Tambah CPL</span>
          </button>
        </div>
      </div>

      <div className="sa-card">
        <div className="sa-card-header">
          <div>
            <div className="sa-card-title">
              <span className="sa-card-title-icon">✅</span>
              <span>Daftar CPL</span>
            </div>
            <div className="sa-card-subtitle">{filteredItems.length} dari {items.length} CPL terdaftar</div>
          </div>
        </div>

        {loading ? (
          <div className="sa-card-body" style={{ textAlign: 'center' }}>
            <div style={{ height: '20px', width: '200px', margin: '0 auto 12px', background: '#e5e7eb', borderRadius: '4px' }} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty-icon">✅</div>
            <div className="sa-empty-title">Belum ada CPL</div>
            <div className="sa-empty-text">Tambahkan Capaian Pembelajaran Lulusan untuk prodi Anda</div>
            <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)} disabled={prodiList.length === 0}>
              <span>➕</span>
              <span>Tambah CPL</span>
            </button>
          </div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th style={{ width: '120px' }}>Kode CPL</th>
                  <th style={{ minWidth: '300px' }}>Deskripsi</th>
                  <th style={{ width: '180px' }}>Program Studi</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="sa-text-muted">{index + 1}</td>
                    <td><span className="sa-badge sa-badge-secondary" style={{ fontFamily: 'monospace', fontWeight: '700' }}>{item.kode_cpl}</span></td>
                    <td style={{ maxWidth: '400px', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.deskripsi}>{item.deskripsi}</td>
                    <td className="sa-text-muted" style={{ fontSize: '13px' }}>{getProdiName(item.prodi_id)}</td>
                    <td>
                      <button 
                        onClick={() => toggleActive(item)} 
                        className={`sa-badge ${item.is_active ? 'sa-badge-success' : 'sa-badge-gray'}`}
                        style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                      >
                        {item.is_active ? '✅ Aktif' : '⭕ Nonaktif'}
                      </button>
                    </td>
                    <td>
                      <div className="sa-table-actions">
                        <button onClick={() => handleEdit(item)} className="sa-btn sa-btn-sm sa-btn-secondary">
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                        <button onClick={() => { setItemToDelete(item); setShowDeleteModal(true); }} className="sa-btn sa-btn-sm sa-btn-danger">
                          <span>🗑️</span>
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="sa-modal-overlay" onClick={handleModalClose}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div className="sa-modal-title">
                <span>{editMode ? '✏️' : '➕'}</span>
                <span>{editMode ? 'Edit CPL' : 'Tambah CPL'}</span>
              </div>
              <button className="sa-modal-close" onClick={handleModalClose}>×</button>
            </div>
            <div className="sa-modal-body">
              <p className="sa-text-muted sa-mb-24" style={{ fontSize: '14px' }}>
                {editMode ? 'Ubah data CPL' : 'Isi form di bawah untuk menambahkan CPL baru'}
              </p>
              <form onSubmit={handleSubmit}>
                <div className="sa-form-group">
                  <label className="sa-form-label required">Program Studi</label>
                  <select value={formData.prodi_id} onChange={(e) => setFormData({ ...formData, prodi_id: e.target.value })} className="sa-form-control" required disabled={formLoading}>
                    <option value="">— Pilih Prodi —</option>
                    {prodiList.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
                  </select>
                </div>
                <div className="sa-form-group">
                  <label className="sa-form-label required">Kode CPL</label>
                  <input type="text" value={formData.kode_cpl} onChange={(e) => setFormData({ ...formData, kode_cpl: e.target.value })} placeholder="Contoh: CPL-01" className="sa-form-control" required maxLength={20} disabled={formLoading} />
                </div>
                <div className="sa-form-group">
                  <label className="sa-form-label required">Deskripsi CPL</label>
                  <textarea value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} placeholder="Deskripsikan capaian pembelajaran..." className="sa-form-control" rows={3} required disabled={formLoading} style={{ resize: 'vertical', minHeight: '60px' }} />
                </div>
                <div className="sa-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: '16px', height: '16px' }} disabled={formLoading} />
                    <span style={{ fontSize: '14px' }}>CPL aktif</span>
                  </label>
                </div>
              </form>
            </div>
            <div className="sa-modal-footer">
              <button type="button" onClick={handleModalClose} className="sa-btn sa-btn-ghost" disabled={formLoading}>Batal</button>
              <button type="submit" onClick={handleSubmit} className="sa-btn sa-btn-primary" disabled={formLoading}>{formLoading ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && itemToDelete && (
        <div className="sa-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="sa-modal-header">
              <div className="sa-modal-title">
                <span>🗑️</span>
                <span>Hapus CPL</span>
              </div>
              <button className="sa-modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="sa-modal-body">
              <p style={{ fontSize: '15px' }}>Yakin ingin menghapus CPL <strong>{itemToDelete.kode_cpl}</strong>?</p>
              <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '6px' }}>⚠️ Semua pemetaan MK-CPL dan Sub-CPMK terkait juga akan dihapus!</p>
            </div>
            <div className="sa-modal-footer">
              <button onClick={() => setShowDeleteModal(false)} className="sa-btn sa-btn-ghost">Batal</button>
              <button onClick={handleDelete} className="sa-btn sa-btn-danger">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
