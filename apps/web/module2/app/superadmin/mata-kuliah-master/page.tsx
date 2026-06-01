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
  const semColor = (s: number) => s <= 2 ? 'sa-badge-primary' : s <= 4 ? 'sa-badge-success' : s <= 6 ? 'sa-badge-accent' : 'sa-badge-secondary';

  return (
    <div className="sa-page">
      <ToastContainer />

      <div className="sa-page-header">
        <h1 className="sa-page-title">Mata Kuliah</h1>
        <p className="sa-page-subtitle">Kelola data mata kuliah per program studi</p>
      </div>

      {prodi.length === 0 && (
        <div className="sa-alert sa-alert-warning">
          ⚠️ Belum ada Program Studi. Daftarkan dulu di menu Program Studi.
        </div>
      )}

      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <select className="sa-form-control" value={filterProdi} onChange={e => setFilterProdi(e.target.value)}>
            <option value="">Semua Prodi</option>
            {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
          <select className="sa-form-control" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
            <option value="">Semua Semester</option>
            {semList.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <div className="sa-toolbar-right">
          <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)} disabled={prodi.length === 0}>
            <span>➕</span>
            <span>Tambah MK</span>
          </button>
        </div>
      </div>

      {semList.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {semList.map(s => (
            <div
              key={s}
              className="sa-card"
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                background: filterSem === String(s) ? '#EFFDA3' : '#fff',
                transition: 'all 0.2s',
              }}
              onClick={() => setFilterSem(filterSem === String(s) ? '' : String(s))}
            >
              <span style={{ fontWeight: '600', fontSize: '13px' }}>Sem {s}</span>
              <span className={`sa-badge ${semColor(s).replace('badge', 'sa-badge')}`} style={{ fontSize: '11px', padding: '3px 7px' }}>{items.filter(m => m.semester === s).length} MK</span>
            </div>
          ))}
        </div>
      )}

      <div className="sa-card">
        <div className="sa-card-header">
          <div>
            <div className="sa-card-title">Daftar Mata Kuliah</div>
            <div className="sa-card-subtitle">{filtered.length} dari {items.length} mata kuliah</div>
          </div>
        </div>

        {loading ? (
          <div className="sa-empty">
            <p>⏳ Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sa-empty">
            <p className="sa-empty-title">📚 Belum ada Mata Kuliah</p>
            <p className="sa-empty-subtitle">Tambahkan mata kuliah untuk program studi</p>
            <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)} disabled={prodi.length === 0}>
              Tambah Sekarang
            </button>
          </div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
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
                    <td>{i + 1}</td>
                    <td>
                      <span className="sa-badge sa-badge-primary">{row.kode_mk}</span>
                    </td>
                    <td style={{ fontWeight: '600' }} title={row.nama_mk}>{row.nama_mk}</td>
                    <td>{getProdiCode(row.prodi_id)}</td>
                    <td>
                      <span className="sa-badge sa-badge-secondary">{row.sks} SKS</span>
                    </td>
                    <td>
                      <span className={`sa-badge ${semColor(row.semester).replace('badge', 'sa-badge')}`}>Sem {row.semester}</span>
                    </td>
                    <td>
                      {getMkCplCount(row.id) > 0 ? (
                        <span className="sa-badge sa-badge-success">{getMkCplCount(row.id)} CPL</span>
                      ) : (
                        <span className="sa-badge sa-badge-danger">Belum dipetakan</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => handleEdit(row)} className="sa-btn sa-btn-secondary sa-btn-sm">
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(row);
                            setShowDeleteModal(true);
                          }}
                          className="sa-btn sa-btn-danger sa-btn-sm"
                        >
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
              <h2 className="sa-modal-title">{editMode ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</h2>
              <p className="sa-modal-subtitle">{editMode ? 'Ubah data mata kuliah' : 'Isi form di bawah untuk menambahkan mata kuliah baru'}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="sa-modal-body">
                <div className="sa-form-group">
                  <label className="sa-form-label">Program Studi <span style={{ color: '#e74c3c' }}>*</span></label>
                  <select
                    className="sa-form-control"
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

                <div className="sa-form-row">
                  <div className="sa-form-group">
                    <label className="sa-form-label">Kode MK <span style={{ color: '#e74c3c' }}>*</span></label>
                    <input
                      type="text"
                      className="sa-form-control"
                      placeholder="Contoh: IF101"
                      value={formData.kode_mk}
                      onChange={(e) => setFormData({ ...formData, kode_mk: e.target.value })}
                      required
                      maxLength={20}
                      disabled={formLoading}
                    />
                  </div>
                  <div className="sa-form-group">
                    <label className="sa-form-label">SKS <span style={{ color: '#e74c3c' }}>*</span></label>
                    <select
                      className="sa-form-control"
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

                <div className="sa-form-group">
                  <label className="sa-form-label">Nama Mata Kuliah <span style={{ color: '#e74c3c' }}>*</span></label>
                  <input
                    type="text"
                    className="sa-form-control"
                    placeholder="Contoh: Algoritma & Pemrograman"
                    value={formData.nama_mk}
                    onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                    required
                    maxLength={200}
                    disabled={formLoading}
                  />
                </div>

                <div className="sa-form-group">
                  <label className="sa-form-label">Semester <span style={{ color: '#e74c3c' }}>*</span></label>
                  <select
                    className="sa-form-control"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    disabled={formLoading}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
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

      {showDeleteModal && itemToDelete && (
        <div className="sa-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="sa-modal sa-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">Hapus Mata Kuliah</h2>
            </div>
            <div className="sa-modal-body">
              <p style={{ marginBottom: '8px' }}>
                Yakin ingin menghapus MK <strong>{itemToDelete.nama_mk}</strong>?
              </p>
              <p style={{ fontSize: '13px', color: '#e74c3c' }}>
                ⚠️ Semua pemetaan MK-CPL dan Sub-CPMK terkait juga akan dihapus!
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
