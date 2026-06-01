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
    <>
      <ToastContainer />

      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Program Studi</h1>
        <p className="page-subtitle">Kelola data program studi</p>
      </div>

      {/* Summary Cards */}
      <div className="animate-fade-in stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {JENJANG.map((jenjang) => {
          const count = items.filter(item => item.jenjang === jenjang).length;
          return (
            <div key={jenjang} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--color-alice-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                {jenjang}
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', lineHeight: '1.2' }}>{count}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Prodi {jenjang}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Cari prodi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Prodi
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-3">
        <div className="card-header">
          <div>
            <div className="card-title">Daftar Program Studi</div>
            <div className="card-subtitle">{filteredItems.length} dari {items.length} prodi</div>
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
              <path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Belum ada program studi</p>
            <p>Mulai dengan menambahkan program studi pertama</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Tambah Sekarang</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
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
                    <td style={{ color: 'var(--text-secondary)' }}>{index + 1}</td>
                    <td>
                      <span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>{item.kode_prodi}</span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{item.nama_prodi}</td>
                    <td>
                      <span className={`badge ${JENJANG_COLOR[item.jenjang] || 'badge-gray'}`}>{item.jenjang}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '—'}
                    </td>
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
              {editMode ? 'Edit Program Studi' : 'Tambah Program Studi'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode ? 'Ubah data program studi' : 'Isi form di bawah untuk menambahkan program studi baru'}
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Kode Prodi <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kode_prodi}
                    onChange={(e) => setFormData({ ...formData, kode_prodi: e.target.value })}
                    placeholder="Contoh: TI-S1"
                    className="input-field"
                    required
                    maxLength={20}
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Jenjang <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <select
                    value={formData.jenjang}
                    onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                    className="select-field"
                    required
                    disabled={formLoading}
                  >
                    {JENJANG.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Nama Program Studi <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama_prodi}
                  onChange={(e) => setFormData({ ...formData, nama_prodi: e.target.value })}
                  placeholder="Contoh: Teknik Informatika"
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
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Hapus Program Studi</h2>
            <p style={{ fontSize: '15px', marginBottom: '8px' }}>
              Yakin ingin menghapus prodi <strong>{itemToDelete.nama_prodi}</strong>?
            </p>
            <p style={{ fontSize: '13px', color: '#e74c3c', marginBottom: '20px' }}>
              ⚠️ Semua CPL, Mahasiswa, MK, dan data terkait akan ikut terhapus!
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
