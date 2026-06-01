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
    <>
      <ToastContainer />

      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Dosen</h1>
        <p className="page-subtitle">Kelola data dosen</p>
      </div>

      {/* Summary Cards */}
      <div className="animate-fade-in stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.2', color: 'var(--text-primary)' }}>{items.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Total Dosen</div>
        </div>
        <div className="card" style={{ padding: '14px 16px', background: 'var(--color-alice-blue)', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.2', color: '#2d5986' }}>{filteredItems.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Hasil Pencarian</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Cari NIDN atau nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Dosen
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-3">
        <div className="card-header">
          <div>
            <div className="card-title">Daftar Dosen</div>
            <div className="card-subtitle">{filteredItems.length} dosen</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Belum ada dosen</p>
            <p>Daftarkan data dosen ke dalam sistem</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Tambah Dosen</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
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
                    <td style={{ color: 'var(--text-secondary)' }}>{index + 1}</td>
                    <td>
                      <span className="badge badge-blue" style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{item.nidn}</span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{item.nama}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => handleEdit(item)} className="btn btn-secondary btn-sm">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                        <button onClick={() => { setItemToDelete(item); setShowDeleteModal(true); }} className="btn btn-sm" style={{ backgroundColor: '#fdecea', color: '#e74c3c' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              {editMode ? 'Edit Dosen' : 'Tambah Dosen'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode ? 'Ubah data dosen' : 'Isi form di bawah untuk menambahkan dosen baru'}
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  NIDN <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.nidn}
                  onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                  placeholder="Contoh: 0101019001"
                  className="input-field"
                  required
                  maxLength={20}
                  disabled={editMode || formLoading}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  NIDN tidak dapat diubah setelah disimpan
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Nama Lengkap <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Dr. Ahmad Fauzi, M.Kom"
                  className="input-field"
                  required
                  maxLength={150}
                  disabled={formLoading}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleModalClose} className="btn btn-ghost" disabled={formLoading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Hapus Dosen</h2>
            <p style={{ fontSize: '15px' }}>
              Yakin ingin menghapus dosen <strong>{itemToDelete.nama}</strong> (NIDN: {itemToDelete.nidn})?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost">
                Batal
              </button>
              <button onClick={handleDelete} className="btn" style={{ backgroundColor: '#e74c3c', color: 'white' }}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
