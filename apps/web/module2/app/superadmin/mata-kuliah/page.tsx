'use client';

import React, { useState, useEffect } from 'react';
import { kelasApi, mataKuliahApi, dosenApi } from '@/lib/api';

interface Kelas {
  id: string;
  mk_id: string;
  dosen_id: string | null;
  tahun_akademik: string;
  semester_aktif: number;
  nama_kelas: string | null;
  kode_mk: string;
  nama_mk: string;
  sks: number;
  semester_mk: number;
  nama_dosen: string | null;
  nama_prodi: string;
}

interface MataKuliah {
  id: string;
  kode_mk: string;
  nama_mk: string;
  sks: number;
  prodi_id: string;
  semester?: number;
}

interface Dosen {
  id: string;
  nidn: string;
  nama: string;
}

export default function MataKuliahPage() {
  const [items, setItems] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProdi, setFilterProdi] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [prodiList, setProdiList] = useState<Array<{id: string; nama_prodi: string}>>([]);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Kelas | null>(null);
  
  // Dropdown data
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    mk_id: '',
    dosen_id: '',
    tahun_akademik: '',
    semester_aktif: '',
    nama_kelas: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch data dari backend
  useEffect(() => {
    fetchKelas();
    loadProdi();
  }, []);

  const loadProdi = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/m1/prodi', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setProdiList(data.data || []);
    } catch (error) {
      console.error('Error loading prodi:', error);
    }
  };

  const fetchKelas = async () => {
    try {
      setLoading(true);
      const response = await kelasApi.getAll();
      setItems(response.data || []);
    } catch (error: any) {
      showToastMessage(error.message || 'Gagal memuat data kelas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, namaKelas: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kelas "${namaKelas}"?`)) return;

    try {
      await kelasApi.delete(id);
      showToastMessage('Kelas berhasil dihapus', 'success');
      fetchKelas(); // Refresh data
    } catch (error: any) {
      showToastMessage(error.message || 'Gagal menghapus kelas', 'error');
    }
  };

  const handleEdit = (item: Kelas) => {
    setEditMode(true);
    setSelectedItem(item);
    setFormData({
      mk_id: item.mk_id,
      dosen_id: item.dosen_id || '',
      tahun_akademik: item.tahun_akademik,
      semester_aktif: String(item.semester_aktif),
      nama_kelas: item.nama_kelas || '',
    });
    setShowModal(true);
    fetchDropdownData(); // Load dropdown data when opening modal
  };

  const fetchDropdownData = async () => {
    try {
      setDropdownLoading(true);
      const [mkResponse, dosenResponse] = await Promise.all([
        mataKuliahApi.getAll(),
        dosenApi.getAll(),
      ]);
      setMataKuliahList(mkResponse.data || []);
      setDosenList(dosenResponse.data || []);
    } catch (error: any) {
      showToastMessage(error.message || 'Gagal memuat data dropdown', 'error');
    } finally {
      setDropdownLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.mk_id || !formData.tahun_akademik || !formData.semester_aktif) {
      showToastMessage('Mata kuliah, tahun akademik, dan semester wajib diisi', 'error');
      return;
    }

    // Validasi semester (1-8)
    const semester = parseInt(formData.semester_aktif);
    if (isNaN(semester) || semester < 1 || semester > 8) {
      showToastMessage('Semester harus antara 1-8', 'error');
      return;
    }

    // Cek apakah semester sesuai dengan mata kuliah
    const selectedMK = mataKuliahList.find(mk => mk.id === formData.mk_id);
    if (selectedMK && selectedMK.semester && selectedMK.semester !== semester) {
      showToastMessage(
        `Mata kuliah "${selectedMK.nama_mk}" hanya bisa dibuka di semester ${selectedMK.semester}. Anda memilih semester ${semester}.`,
        'error'
      );
      return;
    }

    // Validasi format tahun akademik (contoh: 2024/2025)
    const tahunAkademikPattern = /^\d{4}\/\d{4}$/;
    if (!tahunAkademikPattern.test(formData.tahun_akademik)) {
      showToastMessage('Format tahun akademik harus YYYY/YYYY (contoh: 2024/2025)', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        mk_id: formData.mk_id,
        dosen_id: formData.dosen_id || undefined,
        tahun_akademik: formData.tahun_akademik,
        semester_aktif: semester,
        nama_kelas: formData.nama_kelas || undefined,
      };

      if (editMode && selectedItem) {
        // Update
        await kelasApi.update(selectedItem.id, payload);
        showToastMessage('Kelas berhasil diupdate', 'success');
      } else {
        // Create
        await kelasApi.create(payload);
        showToastMessage('Kelas berhasil ditambahkan', 'success');
      }
      setShowModal(false);
      resetForm();
      fetchKelas();
    } catch (error: any) {
      showToastMessage(error.message || 'Gagal menyimpan kelas', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      mk_id: '',
      dosen_id: '',
      tahun_akademik: '',
      semester_aktif: '',
      nama_kelas: '',
    });
    setEditMode(false);
    setSelectedItem(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const filteredItems = items.filter(item => {
    // Get prodi_id from kelas through mata_kuliah
    const matchProdi = !filterProdi || (item.nama_prodi && prodiList.find(p => p.id === filterProdi)?.nama_prodi === item.nama_prodi);
    const matchSemester = !filterSemester || String(item.semester_aktif) === filterSemester;
    
    return matchProdi && matchSemester;
  });

  return (
    <>
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Mata Kuliah & Pemetaan</h1>
        <p className="page-subtitle">Kelola mata kuliah dan pemetaan CPL</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ marginBottom: '20px' }}>
        {/* Filter and Button Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: '1' }}>
            <select
              value={filterProdi}
              onChange={(e) => setFilterProdi(e.target.value)}
              className="select-field"
              style={{ minWidth: '200px' }}
            >
              <option value="">Semua Prodi</option>
              {prodiList.map((prodi) => (
                <option key={prodi.id} value={prodi.id}>
                  {prodi.nama_prodi}
                </option>
              ))}
            </select>

            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="select-field"
              style={{ minWidth: '150px' }}
            >
              <option value="">Semua Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
          
          <button className="btn btn-primary" onClick={() => {
            setShowModal(true);
            fetchDropdownData();
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Mata Kuliah
          </button>
        </div>
      </div>

      {/* Table - Compact Card Layout */}
      <div className="animate-fade-in stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '40px' }}></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada mata kuliah ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div key={item.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                {/* Left Section - Main Info */}
                <div style={{ flex: '1', minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge-dark">{item.kode_mk}</span>
                    <span className="badge badge-blue">{item.sks} SKS</span>
                    <span className="badge badge-yellow">Sem {item.semester_mk || item.semester_aktif}</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {item.nama_mk}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>{item.nama_dosen || 'Belum ada dosen'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>{item.tahun_akademik}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <span>{item.nama_prodi}</span>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <button 
                    onClick={() => handleEdit(item)}
                    className="btn btn-secondary btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm" 
                    style={{ backgroundColor: '#fdecea', color: '#e74c3c', whiteSpace: 'nowrap' }}
                    onClick={() => handleDelete(item.id, item.nama_mk)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
              {editMode ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
            </h2>
            
            {dropdownLoading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '40px' }}></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Mata Kuliah Dropdown */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                    Mata Kuliah <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <select
                    value={formData.mk_id}
                    onChange={(e) => setFormData({ ...formData, mk_id: e.target.value })}
                    className="input-field"
                    required
                    disabled={editMode}
                  >
                    <option value="">Pilih Mata Kuliah</option>
                    {mataKuliahList.map((mk) => (
                      <option key={mk.id} value={mk.id}>
                        {mk.kode_mk} - {mk.nama_mk} ({mk.sks} SKS)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dosen Dropdown (Optional) */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                    Dosen Pengampu
                  </label>
                  <select
                    value={formData.dosen_id}
                    onChange={(e) => setFormData({ ...formData, dosen_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Pilih Dosen (Opsional)</option>
                    {dosenList.map((dosen) => (
                      <option key={dosen.id} value={dosen.id}>
                        {dosen.nama} - {dosen.nidn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tahun Akademik */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                    Tahun Akademik <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tahun_akademik}
                    onChange={(e) => setFormData({ ...formData, tahun_akademik: e.target.value })}
                    placeholder="Contoh: 2024/2025"
                    className="input-field"
                    required
                  />
                </div>

                {/* Semester Aktif */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                    Semester Aktif <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <select
                    value={formData.semester_aktif}
                    onChange={(e) => setFormData({ ...formData, semester_aktif: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Pilih Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                {/* Nama Kelas (Optional) */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                    Nama Kelas
                  </label>
                  <input
                    type="text"
                    value={formData.nama_kelas}
                    onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                    placeholder="Contoh: Kelas A (Opsional)"
                    className="input-field"
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    onClick={handleModalClose} 
                    className="btn btn-ghost"
                    disabled={formLoading}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={formLoading}
                  >
                    {formLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`toast ${toastType === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toastMessage}
        </div>
      )}
    </>
  );
}
