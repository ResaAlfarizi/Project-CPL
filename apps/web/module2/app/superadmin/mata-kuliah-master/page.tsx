'use client';

import React, { useState, useEffect } from 'react';
import ToastContainer, { showToast } from '@/components/Toast';

interface MataKuliah {
  id: string;
  prodi_id: string;
  kode_mk: string;
  nama_mk: string;
  sks: number;
  semester: number;
  created_at?: string;
}

interface Prodi {
  id: string;
  kode_prodi: string;
  nama_prodi: string;
}

interface MkCpl {
  mk_id: string;
  cpl_id: string;
}

const EMPTY_FORM = { prodi_id: '', kode_mk: '', nama_mk: '', sks: 3, semester: 1 };

export default function MataKuliahMasterPage() {
  const [items, setItems] = useState<MataKuliah[]>([]);
  const [prodi, setProdi] = useState<Prodi[]>([]);
  const [mkcpl, setMkcpl] = useState<MkCpl[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProdi, setFilterProdi] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MataKuliah | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MataKuliah | null>(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const [mkRes, prodiRes, mkcplRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/m1/kurikulum/mk', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/v1/m1/prodi', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/v1/m1/kurikulum/mapping', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const mkData = await mkRes.json();
      const prodiData = await prodiRes.json();
      const mkcplData = await mkcplRes.json();

      setItems(mkData.data || []);
      setProdi(prodiData.data || []);
      setMkcpl(mkcplData.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const semList = [...new Set(items.map(m => m.semester))].sort((a, b) => a - b);
  const filtered = items.filter(m =>
    (!filterProdi || m.prodi_id === filterProdi) &&
    (!filterSem || String(m.semester) === filterSem)
  );

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/m1/kurikulum/mk/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      });

      if (!response.ok) throw new Error('Gagal menghapus mata kuliah');

      showToast('Mata kuliah berhasil dihapus', 'success');
      loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus mata kuliah', 'error');
    }
  };

  const handleEdit = (item: MataKuliah) => {
    setEditMode(true);
    setSelectedItem(item);
    setFormData({
      prodi_id: item.prodi_id,
      kode_mk: item.kode_mk,
      nama_mk: item.nama_mk,
      sks: item.sks,
      semester: item.semester,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prodi_id || !formData.kode_mk || !formData.nama_mk) {
      showToast('Semua field wajib diisi', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const url = editMode && selectedItem
        ? `http://localhost:3000/api/v1/m1/kurikulum/mk/${selectedItem.id}`
        : 'http://localhost:3000/api/v1/m1/kurikulum/mk';

      const response = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Gagal menyimpan mata kuliah');

      showToast(editMode ? 'Mata kuliah berhasil diupdate' : 'Mata kuliah berhasil ditambahkan', 'success');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan mata kuliah', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM, prodi_id: filterProdi || (prodi[0]?.id || '') });
    setEditMode(false);
    setSelectedItem(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const getMkCplCount = (mkId: string) => mkcpl.filter(m => m.mk_id === mkId).length;
  const getProdiCode = (id: string) => prodi.find(p => p.id === id)?.kode_prodi || '—';
  const semColor = (s: number) => s <= 2 ? 'badge-blue' : s <= 4 ? 'badge-green' : s <= 6 ? 'badge-yellow' : 'badge-gray';

  return (
    <>
      <ToastContainer />

      <div className="page-header animate-fade-in">
        <h1 className="page-title">Mata Kuliah</h1>
        <p className="page-subtitle">Kelola data mata kuliah per program studi</p>
      </div>

      {prodi.length === 0 && (
        <div className="animate-fade-in stagger-1" style={{ background: '#fef9e7', border: '1px solid #f9ca7a', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' }}>
          ⚠️ Belum ada Program Studi. Daftarkan dulu di menu Program Studi.
        </div>
      )}

      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select className="select-field" value={filterProdi} onChange={e => setFilterProdi(e.target.value)}>
            <option value="">Semua Prodi</option>
            {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
          <select className="select-field" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
            <option value="">Semua Semester</option>
            {semList.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={prodi.length === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah MK
        </button>
      </div>

      {semList.length > 0 && (
        <div className="animate-fade-in stagger-2" style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {semList.map(s => (
            <div
              key={s}
              className="card"
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                background: filterSem === String(s) ? 'var(--color-alice-blue)' : '#fff',
                transition: 'all 0.2s',
              }}
              onClick={() => setFilterSem(filterSem === String(s) ? '' : String(s))}
            >
              <span style={{ fontWeight: '600', fontSize: '13px' }}>Sem {s}</span>
              <span className={`badge ${semColor(s)}`} style={{ fontSize: '11px', padding: '3px 7px' }}>{items.filter(m => m.semester === s).length} MK</span>
            </div>
          ))}
        </div>
      )}

      <div className="card animate-fade-in stagger-3">
        <div className="card-header">
          <div>
            <div className="card-title">Daftar Mata Kuliah</div>
            <div className="card-subtitle">{filtered.length} dari {items.length} mata kuliah</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Belum ada Mata Kuliah</p>
            <p>Tambahkan mata kuliah untuk program studi</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={prodi.length === 0}>
              Tambah Sekarang
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th style={{ width: '120px' }}>Kode MK</th>
                  <th style={{ minWidth: '250px' }}>Nama Mata Kuliah</th>
                  <th style={{ width: '80px' }}>Prodi</th>
                  <th style={{ width: '80px' }}>SKS</th>
                  <th style={{ width: '100px' }}>Semester</th>
                  <th style={{ width: '140px' }}>CPL Terpetakan</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                    <td>
                      <span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>{row.kode_mk}</span>
                    </td>
                    <td style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }} title={row.nama_mk}>{row.nama_mk}</td>
                    <td style={{ fontSize: '13px' }}>{getProdiCode(row.prodi_id)}</td>
                    <td>
                      <span className="badge badge-gray">{row.sks} SKS</span>
                    </td>
                    <td>
                      <span className={`badge ${semColor(row.semester)}`}>Sem {row.semester}</span>
                    </td>
                    <td>
                      {getMkCplCount(row.id) > 0 ? (
                        <span className="badge badge-green">{getMkCplCount(row.id)} CPL</span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#fdecea', color: '#e74c3c' }}>Belum dipetakan</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => handleEdit(row)} className="btn btn-secondary btn-sm">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(row);
                            setShowDeleteModal(true);
                          }}
                          className="btn btn-sm"
                          style={{ backgroundColor: '#fdecea', color: '#e74c3c' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
              {editMode ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode ? 'Ubah data mata kuliah' : 'Isi form di bawah untuk menambahkan mata kuliah baru'}
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Program Studi <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  className="select-field"
                  value={formData.prodi_id}
                  onChange={(e) => setFormData({ ...formData, prodi_id: e.target.value })}
                  required
                  disabled={formLoading}
                >
                  <option value="">— Pilih Prodi —</option>
                  {prodi.map(p => (
                    <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    Kode MK <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: IF101"
                    value={formData.kode_mk}
                    onChange={(e) => setFormData({ ...formData, kode_mk: e.target.value })}
                    required
                    maxLength={20}
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                    SKS <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <select
                    className="select-field"
                    value={formData.sks}
                    onChange={(e) => setFormData({ ...formData, sks: parseInt(e.target.value) })}
                    disabled={formLoading}
                  >
                    {[1, 2, 3, 4, 5, 6].map(s => (
                      <option key={s} value={s}>{s} SKS</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Nama Mata Kuliah <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Contoh: Algoritma & Pemrograman"
                  value={formData.nama_mk}
                  onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                  required
                  maxLength={200}
                  disabled={formLoading}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Semester <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  className="select-field"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  disabled={formLoading}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
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

      {showDeleteModal && itemToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Hapus Mata Kuliah</h2>
            <p style={{ fontSize: '15px', marginBottom: '8px' }}>
              Yakin ingin menghapus MK <strong>{itemToDelete.nama_mk}</strong>?
            </p>
            <p style={{ fontSize: '13px', color: '#e74c3c', marginBottom: '20px' }}>
              ⚠️ Semua pemetaan MK-CPL dan Sub-CPMK terkait juga akan dihapus!
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
