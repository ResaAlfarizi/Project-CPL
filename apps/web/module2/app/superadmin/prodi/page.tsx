'use client';

import React, { useState, useEffect } from 'react';
import ToastContainer, { showToast } from '@/components/Toast';

interface Prodi {
  id: string;
  kode_prodi: string;
  nama_prodi: string;
  jenjang: string;
  created_at?: string;
}

const JENJANG = ['D3', 'S1', 'S2', 'S3'];
const JENJANG_COLOR: Record<string, string> = {
  D3: 'badge-gray',
  S1: 'badge-blue',
  S2: 'badge-green',
  S3: 'badge-yellow',
};

export default function ProdiPage() {
  const [items, setItems] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Prodi | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Prodi | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    kode_prodi: '',
    nama_prodi: '',
    jenjang: 'S1',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadProdi();
  }, []);

  const loadProdi = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/m1/prodi', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setItems(data.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data prodi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/m1/prodi/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Gagal menghapus prodi');

      showToast('Program studi berhasil dihapus', 'success');
      loadProdi();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus prodi', 'error');
    }
  };

  const handleEdit = (item: Prodi) => {
    setEditMode(true);
    setSelectedItem(item);
    setFormData({
      kode_prodi: item.kode_prodi,
      nama_prodi: item.nama_prodi,
      jenjang: item.jenjang,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.kode_prodi || !formData.nama_prodi || !formData.jenjang) {
      showToast('Semua field wajib diisi', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const url = editMode && selectedItem
        ? `http://localhost:3000/api/v1/m1/prodi/${selectedItem.id}`
        : 'http://localhost:3000/api/v1/m1/prodi';

      const response = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Gagal menyimpan prodi');

      showToast(editMode ? 'Program studi berhasil diupdate' : 'Program studi berhasil ditambahkan', 'success');
      setShowModal(false);
      resetForm();
      loadProdi();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan prodi', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      kode_prodi: '',
      nama_prodi: '',
      jenjang: 'S1',
    });
    setEditMode(false);
    setSelectedItem(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredItems = items.filter(item =>
    item.kode_prodi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama_prodi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sa-page">
      <ToastContainer />

      {/* Header */}
      <div className="sa-page-header">
        <h1 className="sa-page-title">Program Studi</h1>
        <p className="sa-page-subtitle">Kelola data program studi</p>
      </div>

      {/* Summary Cards */}
      <div className="sa-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {JENJANG.map((jenjang) => {
          const count = items.filter(item => item.jenjang === jenjang).length;
          return (
            <div key={jenjang} className="sa-stat-card">
              <div className="sa-stat-icon" style={{ fontSize: '14px', fontWeight: '700' }}>
                {jenjang}
              </div>
              <div className="sa-stat-content">
                <div className="sa-stat-value">{count}</div>
                <div className="sa-stat-label">Prodi {jenjang}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <div className="sa-search">
            <span className="sa-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Cari prodi..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="sa-search-input"
            />
          </div>
        </div>
        <div className="sa-toolbar-right">
          <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)}>
            <span>➕</span>
            <span>Tambah Prodi</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="sa-card">
        <div className="sa-card-header">
          <div>
            <div className="sa-card-title">
              <span className="sa-card-title-icon">🎓</span>
              <span>Daftar Program Studi</span>
            </div>
            <div className="sa-card-subtitle">{filteredItems.length} dari {items.length} prodi</div>
          </div>
        </div>

        {loading ? (
          <div className="sa-card-body" style={{ textAlign: 'center' }}>
            <div style={{ height: '20px', width: '200px', margin: '0 auto 12px', background: '#e5e7eb', borderRadius: '4px' }} />
            <div style={{ height: '16px', width: '300px', margin: '0 auto', background: '#e5e7eb', borderRadius: '4px' }} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty-icon">🎓</div>
            <div className="sa-empty-title">Belum ada program studi</div>
            <div className="sa-empty-text">Mulai dengan menambahkan program studi pertama</div>
            <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)}>
              <span>➕</span>
              <span>Tambah Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th style={{ width: '120px' }}>Kode</th>
                  <th style={{ minWidth: '200px' }}>Nama Program Studi</th>
                  <th style={{ width: '100px' }}>Jenjang</th>
                  <th style={{ width: '120px' }}>Dibuat</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="sa-text-muted">{index + 1}</td>
                    <td>
                      <span className="sa-badge sa-badge-secondary" style={{ fontFamily: 'monospace' }}>{item.kode_prodi}</span>
                    </td>
                    <td className="sa-font-semibold">{item.nama_prodi}</td>
                    <td>
                      <span className={`sa-badge ${
                        item.jenjang === 'S1' ? 'sa-badge-secondary' :
                        item.jenjang === 'S2' ? 'sa-badge-success' :
                        item.jenjang === 'S3' ? 'sa-badge-accent' :
                        'sa-badge-gray'
                      }`}>{item.jenjang}</span>
                    </td>
                    <td className="sa-text-muted" style={{ fontSize: '12px' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '—'}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="sa-modal-overlay" onClick={handleModalClose}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div className="sa-modal-title">
                <span>{editMode ? '✏️' : '➕'}</span>
                <span>{editMode ? 'Edit Program Studi' : 'Tambah Program Studi'}</span>
              </div>
              <button className="sa-modal-close" onClick={handleModalClose}>×</button>
            </div>

            <div className="sa-modal-body">
              <p className="sa-text-muted sa-mb-24" style={{ fontSize: '14px' }}>
                {editMode ? 'Ubah data program studi' : 'Isi form di bawah untuk menambahkan program studi baru'}
              </p>

              <form onSubmit={handleSubmit}>
                <div className="sa-form-row">
                  <div className="sa-form-group">
                    <label className="sa-form-label required">Kode Prodi</label>
                    <input
                      type="text"
                      value={formData.kode_prodi}
                      onChange={(e) => setFormData({ ...formData, kode_prodi: e.target.value })}
                      placeholder="Contoh: TI-S1"
                      className="sa-form-control"
                      required
                      maxLength={20}
                      disabled={formLoading}
                    />
                  </div>
                  <div className="sa-form-group">
                    <label className="sa-form-label required">Jenjang</label>
                    <select
                      value={formData.jenjang}
                      onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                      className="sa-form-control"
                      required
                      disabled={formLoading}
                    >
                      {JENJANG.map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sa-form-group">
                  <label className="sa-form-label required">Nama Program Studi</label>
                  <input
                    type="text"
                    value={formData.nama_prodi}
                    onChange={(e) => setFormData({ ...formData, nama_prodi: e.target.value })}
                    placeholder="Contoh: Teknik Informatika"
                    className="sa-form-control"
                    required
                    maxLength={150}
                    disabled={formLoading}
                  />
                </div>
              </form>
            </div>

            <div className="sa-modal-footer">
              <button type="button" onClick={handleModalClose} className="sa-btn sa-btn-ghost" disabled={formLoading}>
                Batal
              </button>
              <button type="submit" onClick={handleSubmit} className="sa-btn sa-btn-primary" disabled={formLoading}>
                {formLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="sa-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="sa-modal-header">
              <div className="sa-modal-title">
                <span>🗑️</span>
                <span>Hapus Program Studi</span>
              </div>
              <button className="sa-modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="sa-modal-body">
              <p style={{ fontSize: '15px', marginBottom: '8px' }}>
                Yakin ingin menghapus prodi <strong>{itemToDelete.nama_prodi}</strong>?
              </p>
              <p style={{ fontSize: '13px', color: '#e74c3c' }}>
                ⚠️ Semua CPL, Mahasiswa, MK, dan data terkait akan ikut terhapus!
              </p>
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
