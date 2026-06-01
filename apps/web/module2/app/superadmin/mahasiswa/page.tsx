'use client';

import React, { useState, useEffect } from 'react';
import ToastContainer, { showToast } from '@/components/Toast';

interface Mahasiswa {
  id: string;
  prodi_id: string;
  nim: string;
  nama: string;
  angkatan: number;
  email?: string;
  created_at?: string;
}

interface Prodi {
  id: string;
  kode_prodi: string;
  nama_prodi: string;
}

export default function MahasiswaPage() {
  const [items, setItems] = useState<Mahasiswa[]>([]);
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Mahasiswa | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Mahasiswa | null>(null);

  const [formData, setFormData] = useState({
    prodi_id: '',
    nim: '',
    nama: '',
    angkatan: new Date().getFullYear(),
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mhsResponse, prodiResponse] = await Promise.all([
        fetch('http://localhost:3000/api/v1/m1/mahasiswa', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        }),
        fetch('http://localhost:3000/api/v1/m1/prodi', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        }),
      ]);
      const mhsData = await mhsResponse.json();
      const prodiData = await prodiResponse.json();
      setItems(mhsData.data || []);
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
      const response = await fetch(`http://localhost:3000/api/v1/m1/mahasiswa/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!response.ok) throw new Error('Gagal menghapus mahasiswa');
      showToast('Mahasiswa berhasil dihapus', 'success');
      loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus mahasiswa', 'error');
    }
  };

  const handleEdit = (item: Mahasiswa) => {
    setEditMode(true);
    setSelectedItem(item);
    setFormData({
      prodi_id: item.prodi_id,
      nim: item.nim,
      nama: item.nama,
      angkatan: item.angkatan,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prodi_id || !formData.nim || !formData.nama || !formData.angkatan) {
      showToast('Semua field wajib diisi', 'error');
      return;
    }
    try {
      setFormLoading(true);
      const url = editMode && selectedItem
        ? `http://localhost:3000/api/v1/m1/mahasiswa/${selectedItem.id}`
        : 'http://localhost:3000/api/v1/m1/mahasiswa';
      const submitData = editMode ? formData : { ...formData, email: `${formData.nim}@student.ac.id` };
      const response = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(submitData),
      });
      if (!response.ok) throw new Error('Gagal menyimpan mahasiswa');
      showToast(editMode ? 'Data mahasiswa berhasil diupdate' : 'Mahasiswa berhasil ditambahkan', 'success');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan mahasiswa', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      prodi_id: filterProdi || (prodiList[0]?.id || ''),
      nim: '',
      nama: '',
      angkatan: new Date().getFullYear(),
    });
    setEditMode(false);
    setSelectedItem(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const angkatanList = [...new Set(items.map(m => m.angkatan))].sort((a, b) => b - a);
  const filteredItems = items.filter(item => {
    const matchSearch = item.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProdi = !filterProdi || item.prodi_id === filterProdi;
    const matchAngkatan = !filterAngkatan || String(item.angkatan) === filterAngkatan;
    return matchSearch && matchProdi && matchAngkatan;
  });

  const getProdiName = (id: string) => prodiList.find(p => p.id === id)?.nama_prodi || '—';
  const getProdiCode = (id: string) => prodiList.find(p => p.id === id)?.kode_prodi || '—';
  const angkatanColors = (a: number) => {
    const colors = ['badge-blue', 'badge-green', 'badge-yellow', 'badge-gray'];
    return colors[a % colors.length];
  };

  return (
    <div className="sa-page">
      <ToastContainer />
      <div className="sa-page-header">
        <h1 className="sa-page-title">Mahasiswa</h1>
        <p className="sa-page-subtitle">Kelola data mahasiswa</p>
      </div>

      {prodiList.length === 0 && (
        <div className="sa-alert sa-alert-warning">
          ⚠️ Belum ada Program Studi. Daftarkan dulu di menu Prodi.
        </div>
      )}

      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <div className="sa-search">
            <span className="sa-search-icon">🔍</span>
            <input type="text" placeholder="Cari NIM atau nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="sa-search-input" />
          </div>
          <select className="sa-form-control" value={filterProdi} onChange={(e) => setFilterProdi(e.target.value)} style={{ minWidth: '200px' }}>
            <option value="">Semua Prodi</option>
            {prodiList.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
          <select className="sa-form-control" value={filterAngkatan} onChange={(e) => setFilterAngkatan(e.target.value)} style={{ minWidth: '150px' }}>
            <option value="">Semua Angkatan</option>
            {angkatanList.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="sa-toolbar-right">
          <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)} disabled={prodiList.length === 0}>
            <span>➕</span>
            <span>Tambah Mahasiswa</span>
          </button>
        </div>
      </div>

      <div className="sa-card">
        <div className="sa-card-header">
          <div>
            <div className="sa-card-title">Daftar Mahasiswa</div>
            <div className="sa-card-subtitle">{filteredItems.length} dari {items.length} mahasiswa</div>
          </div>
        </div>

        {loading ? (
          <div className="sa-empty">
            <p>⏳ Memuat data...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="sa-empty">
            <p className="sa-empty-title">🎓 Belum ada mahasiswa</p>
            <p className="sa-empty-subtitle">Daftarkan mahasiswa ke dalam sistem</p>
            <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)} disabled={prodiList.length === 0}>Tambah Mahasiswa</button>
          </div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th style={{ width: '140px' }}>NIM</th>
                  <th style={{ minWidth: '180px' }}>Nama</th>
                  <th style={{ width: '200px' }}>Program Studi</th>
                  <th style={{ width: '100px' }}>Angkatan</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td><span className="sa-badge sa-badge-primary">{item.nim}</span></td>
                    <td>{item.nama}</td>
                    <td>
                      <div style={{ fontSize: '13px' }}>{getProdiName(item.prodi_id)}</div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>{getProdiCode(item.prodi_id)}</div>
                    </td>
                    <td><span className={`sa-badge ${angkatanColors(item.angkatan).replace('badge', 'sa-badge')}`}>{item.angkatan}</span></td>
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

      {showModal && (
        <div className="sa-modal-overlay" onClick={handleModalClose}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">{editMode ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</h2>
              <p className="sa-modal-subtitle">{editMode ? 'Ubah data mahasiswa' : 'Isi form di bawah untuk menambahkan mahasiswa baru'}</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="sa-modal-body">
                <div className="sa-form-group">
                  <label className="sa-form-label">Program Studi <span style={{ color: '#e74c3c' }}>*</span></label>
                  <select value={formData.prodi_id} onChange={(e) => setFormData({ ...formData, prodi_id: e.target.value })} className="sa-form-control" required disabled={formLoading}>
                    <option value="">— Pilih Prodi —</option>
                    {prodiList.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
                  </select>
                </div>
                <div className="sa-form-row">
                  <div className="sa-form-group">
                    <label className="sa-form-label">NIM <span style={{ color: '#e74c3c' }}>*</span></label>
                    <input type="text" value={formData.nim} onChange={(e) => setFormData({ ...formData, nim: e.target.value })} placeholder="Contoh: 2023001001" className="sa-form-control" required maxLength={20} disabled={editMode || formLoading} />
                  </div>
                  <div className="sa-form-group">
                    <label className="sa-form-label">Angkatan <span style={{ color: '#e74c3c' }}>*</span></label>
                    <input type="number" value={formData.angkatan} onChange={(e) => setFormData({ ...formData, angkatan: parseInt(e.target.value) })} placeholder="Contoh: 2023" className="sa-form-control" required min={2000} max={2099} disabled={formLoading} />
                  </div>
                </div>
                <div className="sa-form-group">
                  <label className="sa-form-label">Nama Lengkap <span style={{ color: '#e74c3c' }}>*</span></label>
                  <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Budi Santoso" className="sa-form-control" required maxLength={150} disabled={formLoading} />
                </div>
              </div>
              <div className="sa-modal-footer">
                <button type="button" onClick={handleModalClose} className="sa-btn sa-btn-ghost" disabled={formLoading}>Batal</button>
                <button type="submit" className="sa-btn sa-btn-primary" disabled={formLoading}>{formLoading ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && itemToDelete && (
        <div className="sa-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="sa-modal sa-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">Hapus Mahasiswa</h2>
            </div>
            <div className="sa-modal-body">
              <p>Yakin ingin menghapus mahasiswa <strong>{itemToDelete.nama}</strong> (NIM: {itemToDelete.nim})?</p>
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
