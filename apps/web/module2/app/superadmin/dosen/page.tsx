'use client';

import React, { useState, useEffect } from 'react';
import ToastContainer, { showToast } from '@/components/Toast';

interface Dosen {
  id: string;
  nidn: string;
  nama: string;
  created_at?: string;
}

export default function DosenPage() {
  const [items, setItems] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Dosen | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Dosen | null>(null);

  const [formData, setFormData] = useState({
    nidn: '',
    nama: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadDosen();
  }, []);

  const loadDosen = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/m1/dosen', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setItems(data.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data dosen', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/m1/dosen/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Gagal menghapus dosen');

      showToast('Dosen berhasil dihapus', 'success');
      loadDosen();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus dosen', 'error');
    }
  };

  const handleEdit = (item: Dosen) => {
    setEditMode(true);
    setSelectedItem(item);
    setFormData({
      nidn: item.nidn,
      nama: item.nama,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nidn || !formData.nama) {
      showToast('Semua field wajib diisi', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const url = editMode && selectedItem
        ? `http://localhost:3000/api/v1/m1/dosen/${selectedItem.id}`
        : 'http://localhost:3000/api/v1/m1/dosen';

      const response = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Gagal menyimpan dosen');

      showToast(editMode ? 'Data dosen berhasil diupdate' : 'Dosen berhasil ditambahkan', 'success');
      setShowModal(false);
      resetForm();
      loadDosen();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan dosen', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nidn: '',
      nama: '',
    });
    setEditMode(false);
    setSelectedItem(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredItems = items.filter(item =>
    item.nidn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sa-page">
      <ToastContainer />

      {/* Header */}
      <div className="sa-page-header">
        <h1 className="sa-page-title">Dosen</h1>
        <p className="sa-page-subtitle">Kelola data dosen</p>
      </div>

      {/* Summary Cards */}
      <div className="sa-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="sa-stat-card">
          <div className="sa-stat-value">{items.length}</div>
          <div className="sa-stat-label">Total Dosen</div>
        </div>
        <div className="sa-stat-card sa-stat-accent">
          <div className="sa-stat-value">{filteredItems.length}</div>
          <div className="sa-stat-label">Hasil Pencarian</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <div className="sa-search">
            <span className="sa-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Cari NIDN atau nama..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="sa-search-input"
            />
          </div>
        </div>
        <div className="sa-toolbar-right">
          <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)}>
            <span>➕</span>
            <span>Tambah Dosen</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="sa-card">
        <div className="sa-card-header">
          <div>
            <div className="sa-card-title">Daftar Dosen</div>
            <div className="sa-card-subtitle">{filteredItems.length} dosen</div>
          </div>
        </div>

        {loading ? (
          <div className="sa-empty">
            <p>⏳ Memuat data...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="sa-empty">
            <p className="sa-empty-title">👨‍🏫 Belum ada dosen</p>
            <p className="sa-empty-subtitle">Daftarkan data dosen ke dalam sistem</p>
            <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)}>Tambah Dosen</button>
          </div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th style={{ width: '140px' }}>NIDN</th>
                  <th style={{ minWidth: '200px' }}>Nama Lengkap</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <span className="sa-badge sa-badge-primary">{item.nidn}</span>
                    </td>
                    <td>{item.nama}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => handleEdit(item)} className="sa-btn sa-btn-secondary sa-btn-sm">
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                        <button onClick={() => { setItemToDelete(item); setShowDeleteModal(true); }} className="sa-btn sa-btn-danger sa-btn-sm">
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="sa-modal-overlay" onClick={handleModalClose}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">{editMode ? 'Edit Dosen' : 'Tambah Dosen'}</h2>
              <p className="sa-modal-subtitle">{editMode ? 'Ubah data dosen' : 'Isi form di bawah untuk menambahkan dosen baru'}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="sa-modal-body">
                <div className="sa-form-group">
                  <label className="sa-form-label">
                    NIDN <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nidn}
                    onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                    placeholder="Contoh: 0101019001"
                    className="sa-form-control"
                    required
                    maxLength={20}
                    disabled={editMode || formLoading}
                  />
                  <p className="sa-form-hint">NIDN tidak dapat diubah setelah disimpan</p>
                </div>

                <div className="sa-form-group">
                  <label className="sa-form-label">
                    Nama Lengkap <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Dr. Ahmad Fauzi, M.Kom"
                    className="sa-form-control"
                    required
                    maxLength={150}
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="sa-modal-footer">
                <button type="button" onClick={handleModalClose} className="sa-btn sa-btn-ghost" disabled={formLoading}>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="sa-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="sa-modal sa-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">Hapus Dosen</h2>
            </div>
            <div className="sa-modal-body">
              <p>Yakin ingin menghapus dosen <strong>{itemToDelete.nama}</strong> (NIDN: {itemToDelete.nidn})?</p>
            </div>
            <div className="sa-modal-footer">
              <button onClick={() => setShowDeleteModal(false)} className="sa-btn sa-btn-ghost">
                Batal
              </button>
              <button onClick={handleDelete} className="sa-btn sa-btn-danger">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
