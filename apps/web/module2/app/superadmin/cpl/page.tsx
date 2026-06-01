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
    <>
      <ToastContainer />
      <div className="page-header animate-fade-in">
        <h1 className="page-title">CPL</h1>
        <p className="page-subtitle">Kelola Capaian Pembelajaran Lulusan</p>
      </div>

      {prodiList.length === 0 && (
        <div style={{ background: '#fef9e7', border: '1px solid #f9ca7a', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' }}>
          ⚠️ Belum ada Program Studi. Daftarkan dulu di menu Prodi.
        </div>
      )}

      <div className="animate-fade-in stagger-1" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: '1' }}>
            <div style={{ position: 'relative', minWidth: '250px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" placeholder="Cari CPL..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
            </div>
            <select className="select-field" value={filterProdi} onChange={(e) => setFilterProdi(e.target.value)} style={{ minWidth: '200px' }}>
              <option value="">Semua Prodi</option>
              {prodiList.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={prodiList.length === 0}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah CPL
          </button>
        </div>
      </div>

      <div className="card animate-fade-in stagger-2">
        <div className="card-header">
          <div>
            <div className="card-title">Daftar CPL</div>
            <div className="card-subtitle">{filteredItems.length} dari {items.length} CPL terdaftar</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Belum ada CPL</p>
            <p>Tambahkan Capaian Pembelajaran Lulusan untuk prodi Anda</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={prodiList.length === 0}>Tambah CPL</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
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
                    <td style={{ color: 'var(--text-secondary)' }}>{index + 1}</td>
                    <td><span className="badge badge-blue" style={{ fontFamily: 'monospace', fontWeight: '700' }}>{item.kode_cpl}</span></td>
                    <td style={{ maxWidth: '400px', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.deskripsi}>{item.deskripsi}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{getProdiName(item.prodi_id)}</td>
                    <td>
                      <button onClick={() => toggleActive(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: item.is_active ? '#27ae60' : '#9ca3af' }}>
                        {item.is_active ? '✅ Aktif' : '⭕ Nonaktif'}
                      </button>
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

      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              {editMode ? 'Edit CPL' : 'Tambah CPL'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode ? 'Ubah data CPL' : 'Isi form di bawah untuk menambahkan CPL baru'}
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Program Studi <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select value={formData.prodi_id} onChange={(e) => setFormData({ ...formData, prodi_id: e.target.value })} className="select-field" required disabled={formLoading}>
                  <option value="">— Pilih Prodi —</option>
                  {prodiList.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Kode CPL <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input type="text" value={formData.kode_cpl} onChange={(e) => setFormData({ ...formData, kode_cpl: e.target.value })} placeholder="Contoh: CPL-01" className="input-field" required maxLength={20} disabled={formLoading} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Deskripsi CPL <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <textarea value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} placeholder="Deskripsikan capaian pembelajaran..." className="input-field" rows={3} required disabled={formLoading} style={{ resize: 'vertical', minHeight: '60px' }} />
              </div>
              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: '16px', height: '16px' }} disabled={formLoading} />
                <label htmlFor="is_active" style={{ fontSize: '14px', cursor: 'pointer' }}>CPL aktif</label>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleModalClose} className="btn btn-ghost" disabled={formLoading}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>{formLoading ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && itemToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Hapus CPL</h2>
            <p style={{ fontSize: '15px' }}>Yakin ingin menghapus CPL <strong>{itemToDelete.kode_cpl}</strong>?</p>
            <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '6px' }}>⚠️ Semua pemetaan MK-CPL dan Sub-CPMK terkait juga akan dihapus!</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost">Batal</button>
              <button onClick={handleDelete} className="btn" style={{ backgroundColor: '#e74c3c', color: 'white' }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
