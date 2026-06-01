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
    <>
      <ToastContainer />
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Mahasiswa</h1>
        <p className="page-subtitle">Kelola data mahasiswa</p>
      </div>

      {prodiList.length === 0 && (
        <div style={{ background: '#fef9e7', border: '1px solid #f9ca7a', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' }}>
          ⚠️ Belum ada Program Studi. Daftarkan dulu di menu Prodi.
        </div>
      )}

      <div className="animate-fade-in stagger-1" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: '1' }}>
            <div style={{ position: 'relative', minWidth: '250px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" placeholder="Cari NIM atau nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
            </div>
            <select className="select-field" value={filterProdi} onChange={(e) => setFilterProdi(e.target.value)} style={{ minWidth: '200px' }}>
              <option value="">Semua Prodi</option>
              {prodiList.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
            </select>
            <select className="select-field" value={filterAngkatan} onChange={(e) => setFilterAngkatan(e.target.value)} style={{ minWidth: '150px' }}>
              <option value="">Semua Angkatan</option>
              {angkatanList.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={prodiList.length === 0}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Mahasiswa
          </button>
        </div>
      </div>

      <div className="card animate-fade-in stagger-2">
        <div className="card-header">
          <div>
            <div className="card-title">Daftar Mahasiswa</div>
            <div className="card-subtitle">{filteredItems.length} dari {items.length} mahasiswa</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Belum ada mahasiswa</p>
            <p>Daftarkan mahasiswa ke dalam sistem</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={prodiList.length === 0}>Tambah Mahasiswa</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
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
                    <td style={{ color: 'var(--text-secondary)' }}>{index + 1}</td>
                    <td><span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>{item.nim}</span></td>
                    <td style={{ fontWeight: '600' }}>{item.nama}</td>
                    <td>
                      <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={getProdiName(item.prodi_id)}>{getProdiName(item.prodi_id)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{getProdiCode(item.prodi_id)}</div>
                    </td>
                    <td><span className={`badge ${angkatanColors(item.angkatan)}`}>{item.angkatan}</span></td>
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
              {editMode ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode ? 'Ubah data mahasiswa' : 'Isi form di bawah untuk menambahkan mahasiswa baru'}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    NIM <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input type="text" value={formData.nim} onChange={(e) => setFormData({ ...formData, nim: e.target.value })} placeholder="Contoh: 2023001001" className="input-field" required maxLength={20} disabled={editMode || formLoading} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    Angkatan <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input type="number" value={formData.angkatan} onChange={(e) => setFormData({ ...formData, angkatan: parseInt(e.target.value) })} placeholder="Contoh: 2023" className="input-field" required min={2000} max={2099} disabled={formLoading} />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Nama Lengkap <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Budi Santoso" className="input-field" required maxLength={150} disabled={formLoading} />
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
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Hapus Mahasiswa</h2>
            <p style={{ fontSize: '15px' }}>Yakin ingin menghapus mahasiswa <strong>{itemToDelete.nama}</strong> (NIM: {itemToDelete.nim})?</p>
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
