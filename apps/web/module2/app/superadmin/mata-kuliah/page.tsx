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
    <div className="sa-page">
      {/* Header */}
      <div className="sa-page-header">
        <h1 className="sa-page-title">Mata Kuliah & Kelas</h1>
        <p className="sa-page-subtitle">Kelola mata kuliah dan kelas perkuliahan</p>
      </div>

      {/* Toolbar */}
      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <select
            value={filterProdi}
            onChange={(e) => setFilterProdi(e.target.value)}
            className="sa-form-control"
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
            className="sa-form-control"
            style={{ minWidth: '150px' }}
          >
            <option value="">Semua Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>
        
        <div className="sa-toolbar-right">
          <button className="sa-btn sa-btn-primary" onClick={() => {
            setShowModal(true);
            fetchDropdownData();
          }}>
            <span>➕</span>
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* Table - Compact Card Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div className="sa-empty">
            <p>⏳ Memuat data...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="sa-empty">
            <p className="sa-empty-title">📚 Tidak ada kelas ditemukan</p>
            <p className="sa-empty-subtitle">Coba ubah filter pencarian</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div key={item.id} className="sa-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                {/* Left Section - Main Info */}
                <div style={{ flex: '1', minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="sa-badge sa-badge-primary">{item.kode_mk}</span>
                    <span className="sa-badge sa-badge-accent">{item.sks} SKS</span>
                    <span className="sa-badge sa-badge-secondary">Sem {item.semester_mk || item.semester_aktif}</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
                    {item.nama_mk}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', opacity: 0.8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>👨‍🏫</span>
                      <span>{item.nama_dosen || 'Belum ada dosen'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📅</span>
                      <span>{item.tahun_akademik}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🏛️</span>
                      <span>{item.nama_prodi}</span>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <button 
                    onClick={() => handleEdit(item)}
                    className="sa-btn sa-btn-secondary sa-btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <span>✏️</span>
                    <span>Edit</span>
                  </button>
                  <button 
                    className="sa-btn sa-btn-danger sa-btn-sm" 
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => handleDelete(item.id, item.nama_mk)}
                  >
                    <span>🗑️</span>
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="sa-modal-overlay" onClick={handleModalClose}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">{editMode ? 'Edit Kelas' : 'Tambah Kelas'}</h2>
            </div>
            
            {dropdownLoading ? (
              <div className="sa-empty">
                <p>⏳ Memuat data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="sa-modal-body">
                  <div className="sa-form-group">
                    <label className="sa-form-label">Mata Kuliah <span style={{ color: '#e74c3c' }}>*</span></label>
                    <select
                      value={formData.mk_id}
                      onChange={(e) => setFormData({ ...formData, mk_id: e.target.value })}
                      className="sa-form-control"
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

                  <div className="sa-form-group">
                    <label className="sa-form-label">Dosen Pengampu</label>
                    <select
                      value={formData.dosen_id}
                      onChange={(e) => setFormData({ ...formData, dosen_id: e.target.value })}
                      className="sa-form-control"
                    >
                      <option value="">Pilih Dosen (Opsional)</option>
                      {dosenList.map((dosen) => (
                        <option key={dosen.id} value={dosen.id}>
                          {dosen.nama} - {dosen.nidn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sa-form-group">
                    <label className="sa-form-label">Tahun Akademik <span style={{ color: '#e74c3c' }}>*</span></label>
                    <input
                      type="text"
                      value={formData.tahun_akademik}
                      onChange={(e) => setFormData({ ...formData, tahun_akademik: e.target.value })}
                      placeholder="Contoh: 2024/2025"
                      className="sa-form-control"
                      required
                    />
                  </div>

                  <div className="sa-form-group">
                    <label className="sa-form-label">Semester Aktif <span style={{ color: '#e74c3c' }}>*</span></label>
                    <select
                      value={formData.semester_aktif}
                      onChange={(e) => setFormData({ ...formData, semester_aktif: e.target.value })}
                      className="sa-form-control"
                      required
                    >
                      <option value="">Pilih Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sa-form-group">
                    <label className="sa-form-label">Nama Kelas</label>
                    <input
                      type="text"
                      value={formData.nama_kelas}
                      onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                      placeholder="Contoh: Kelas A (Opsional)"
                      className="sa-form-control"
                    />
                  </div>
                </div>

                <div className="sa-modal-footer">
                  <button 
                    type="button" 
                    onClick={handleModalClose} 
                    className="sa-btn sa-btn-ghost"
                    disabled={formLoading}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="sa-btn sa-btn-primary"
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
    </div>
  );
}
