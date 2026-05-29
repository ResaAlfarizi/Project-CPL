'use client';

import React, { useState, useEffect } from 'react';
import { nilaiApi, enrollmentApi, subCpmkApi, kelasApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

interface Nilai {
  id: string;
  enrollment_id: string;
  sub_cpmk_id: number;
  nilai: number;
  nim?: string;
  nama_mahasiswa?: string;
  kode_sub_cpmk?: string;
  kode_mk?: string;
  nama_mk?: string;
  tahun_akademik?: string;
  semester_aktif?: number;
  input_at?: string;
}

interface Enrollment {
  id: string;
  mahasiswa_id: string;
  kelas_id: string;
  nim: string;
  nama_mahasiswa: string;
  kode_mk: string;
  nama_mk: string;
  tahun_akademik: string;
  semester_aktif: number;
}

interface SubCPMK {
  id: number;
  kode_sub_cpmk: string;
  deskripsi: string;
  kode_mk?: string;
  nama_mk?: string;
  mk_cpl_id?: string;
}

interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
}

interface Kelas {
  id: string;
  mk_id: string;
  kode_mk: string;
  nama_mk: string;
  tahun_akademik: string;
  semester_aktif: number;
  nama_kelas?: string;
}

export default function InputNilaiPage() {
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [subCpmkList, setSubCpmkList] = useState<SubCPMK[]>([]);
  const [filteredKelasList, setFilteredKelasList] = useState<Kelas[]>([]);
  const [filteredSubCpmkList, setFilteredSubCpmkList] = useState<SubCPMK[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedNilai, setSelectedNilai] = useState<Nilai | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    mahasiswa_id: '',
    kelas_id: '',
    sub_cpmk_id: '',
    nilai: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadNilai();
    loadMahasiswa();
    loadKelas();
    loadSubCpmk();
  }, []);

  // Filter kelas when mahasiswa is selected
  useEffect(() => {
    if (formData.mahasiswa_id && !editMode) {
      // For now, show all kelas since enrollment might be empty
      // In production, you should filter based on enrollment
      setFilteredKelasList(kelasList);
      // Reset kelas and sub-cpmk selection
      setFormData(prev => ({ ...prev, kelas_id: '', sub_cpmk_id: '' }));
      setFilteredSubCpmkList([]);
    }
  }, [formData.mahasiswa_id, kelasList, editMode]);

  // Filter sub-CPMK when kelas is selected
  useEffect(() => {
    if (formData.kelas_id && !editMode) {
      const selectedKelas = kelasList.find(k => k.id === formData.kelas_id);
      if (selectedKelas) {
        // Filter sub-CPMK by mk_id from selected kelas
        loadSubCpmkByMk(selectedKelas.mk_id);
      }
      // Reset sub-cpmk selection
      setFormData(prev => ({ ...prev, sub_cpmk_id: '' }));
    }
  }, [formData.kelas_id, kelasList, editMode]);

  const loadNilai = async () => {
    try {
      setLoading(true);
      const response = await nilaiApi.getAll();
      setNilaiList(response.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data nilai', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMahasiswa = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/m1/mahasiswa', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setMahasiswaList(data.data || []);
    } catch (error) {
      console.error('Error loading mahasiswa:', error);
    }
  };

  const loadKelas = async () => {
    try {
      const response = await kelasApi.getAll();
      setKelasList(response.data || []);
    } catch (error) {
      console.error('Error loading kelas:', error);
    }
  };

  const loadSubCpmk = async () => {
    try {
      const response = await subCpmkApi.getAll();
      setSubCpmkList(response.data || []);
    } catch (error) {
      console.error('Error loading sub-CPMK:', error);
    }
  };

  const loadSubCpmkByMk = async (mkId: string) => {
    try {
      const response = await subCpmkApi.getByMk(mkId);
      setFilteredSubCpmkList(response.data || []);
    } catch (error) {
      console.error('Error loading sub-CPMK by MK:', error);
      setFilteredSubCpmkList([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus nilai ini?')) return;
    
    try {
      await nilaiApi.delete(id);
      showToast('Nilai berhasil dihapus', 'success');
      loadNilai();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus nilai', 'error');
    }
  };

  const handleEdit = (nilai: Nilai) => {
    setEditMode(true);
    setSelectedNilai(nilai);
    setFormData({
      mahasiswa_id: '',
      kelas_id: '',
      sub_cpmk_id: String(nilai.sub_cpmk_id),
      nilai: String(nilai.nilai),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!editMode && (!formData.mahasiswa_id || !formData.kelas_id)) {
      showToast('Pilih mahasiswa dan kelas terlebih dahulu', 'error');
      return;
    }
    
    if (!formData.sub_cpmk_id || !formData.nilai) {
      showToast('Semua field wajib diisi', 'error');
      return;
    }

    const nilaiNum = parseFloat(formData.nilai);
    if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
      showToast('Nilai harus antara 0-100', 'error');
      return;
    }

    try {
      setFormLoading(true);
      if (editMode && selectedNilai) {
        // Update
        await nilaiApi.update(selectedNilai.id, { nilai: nilaiNum });
        showToast('Nilai berhasil diupdate', 'success');
      } else {
        // Create: First check/create enrollment, then create nilai
        // Step 1: Check if enrollment exists
        const enrollmentResponse = await enrollmentApi.getByKelas(formData.kelas_id);
        let enrollmentId = null;
        
        const existingEnrollment = enrollmentResponse.data?.find(
          (e: any) => e.mahasiswa_id === formData.mahasiswa_id
        );
        
        if (existingEnrollment) {
          enrollmentId = existingEnrollment.id;
        } else {
          // Create enrollment
          const newEnrollment = await fetch('http://localhost:3000/api/v1/m2/enrollment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({
              mahasiswa_id: formData.mahasiswa_id,
              kelas_id: formData.kelas_id,
            }),
          });
          const enrollmentData = await newEnrollment.json();
          if (!newEnrollment.ok) {
            throw new Error(enrollmentData.message || 'Gagal membuat enrollment');
          }
          enrollmentId = enrollmentData.data.id;
        }
        
        // Step 2: Create nilai
        await nilaiApi.create({
          enrollment_id: enrollmentId,
          sub_cpmk_id: formData.sub_cpmk_id,
          nilai: nilaiNum,
        });
        showToast('Nilai berhasil ditambahkan', 'success');
      }
      setShowModal(false);
      resetForm();
      loadNilai();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan nilai', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      mahasiswa_id: '',
      kelas_id: '',
      sub_cpmk_id: '',
      nilai: '',
    });
    setFilteredKelasList([]);
    setFilteredSubCpmkList([]);
    setEditMode(false);
    setSelectedNilai(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredNilai = nilaiList.filter(nilai =>
    (nilai.nim && nilai.nim.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (nilai.nama_mahasiswa && nilai.nama_mahasiswa.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (nilai.kode_mk && nilai.kode_mk.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group by Mata Kuliah
  const groupedByMK = filteredNilai.reduce((acc, nilai) => {
    const mkKey = nilai.kode_mk || 'unknown';
    if (!acc[mkKey]) {
      acc[mkKey] = {
        kode_mk: nilai.kode_mk || '-',
        nama_mk: nilai.nama_mk || 'Tidak diketahui',
        tahun_akademik: nilai.tahun_akademik || '-',
        semester_aktif: nilai.semester_aktif || 0,
        items: []
      };
    }
    acc[mkKey].items.push(nilai);
    return acc;
  }, {} as Record<string, { kode_mk: string; nama_mk: string; tahun_akademik: string; semester_aktif: number; items: Nilai[] }>);

  const mkGroups = Object.values(groupedByMK);

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Input Nilai Sub-CPMK</h1>
        <p className="page-subtitle">Kelola input nilai sub-CPMK mahasiswa</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari mahasiswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Input Nilai
        </button>
      </div>

      {/* Grouped by Mata Kuliah */}
      <div className="animate-fade-in stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : mkGroups.length === 0 ? (
          <div className="card empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada data nilai ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          mkGroups.map((group, groupIndex) => {
            // Calculate statistics
            const totalNilai = group.items.length;
            const rataRata = group.items.reduce((sum, item) => sum + item.nilai, 0) / totalNilai;
            const mahasiswaUnik = new Set(group.items.map(item => item.nim)).size;
            
            return (
              <div key={groupIndex} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* MK Header */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  padding: '16px 20px',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>{group.kode_mk}</div>
                      <div style={{ fontSize: '18px', fontWeight: '700' }}>{group.nama_mk}</div>
                      <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                        {group.tahun_akademik} • Semester {group.semester_aktif}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', opacity: 0.9 }}>Total Nilai</div>
                        <div style={{ fontSize: '20px', fontWeight: '700' }}>{totalNilai}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', opacity: 0.9 }}>Mahasiswa</div>
                        <div style={{ fontSize: '20px', fontWeight: '700' }}>{mahasiswaUnik}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', opacity: 0.9 }}>Rata-rata</div>
                        <div style={{ fontSize: '20px', fontWeight: '700' }}>{rataRata.toFixed(1)}</div>
                      </div>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => setShowModal(true)}
                        style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          border: '1px solid rgba(255,255,255,0.3)',
                          color: 'white',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Input Nilai
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nilai List */}
                <div style={{ padding: '16px 20px' }}>
                  <table style={{ width: '100%', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>NO</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>NIM</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>NAMA MAHASISWA</th>
                        <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>SUB-CPMK</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>CPL</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>NILAI</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>TANGGAL INPUT</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((nilai, itemIndex) => (
                        <tr key={nilai.id} style={{ borderBottom: itemIndex < group.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                          <td style={{ padding: '12px 8px' }}>{itemIndex + 1}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className="badge badge-dark" style={{ fontSize: '11px' }}>{nilai.nim || '-'}</span>
                          </td>
                          <td style={{ padding: '12px 8px', fontWeight: '600' }}>{nilai.nama_mahasiswa || '-'}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className="badge badge-blue" style={{ fontSize: '11px' }}>{nilai.kode_sub_cpmk || '-'}</span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <span className="badge badge-green" style={{ fontSize: '11px' }}>CPL-01</span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <span className={`badge ${nilai.nilai >= 80 ? 'badge-green' : nilai.nilai >= 70 ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: '12px', fontWeight: '700' }}>
                              {Number(nilai.nilai).toFixed(2)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {nilai.input_at ? new Date(nilai.input_at).toLocaleDateString('id-ID', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            }) : new Date().toLocaleDateString('id-ID', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            })}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button 
                                onClick={() => handleEdit(nilai)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '6px 10px', fontSize: '12px' }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(nilai.id)}
                                className="btn btn-sm"
                                style={{ padding: '6px 10px', fontSize: '12px', backgroundColor: '#fdecea', color: '#e74c3c' }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              {editMode ? 'Edit Nilai' : 'Input Nilai Baru'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode ? 'Ubah nilai sub-CPMK mahasiswa' : 'Isi form di bawah untuk menginput nilai sub-CPMK'}
            </p>
            
            <form onSubmit={handleSubmit}>
              {/* Step 1: Pilih Mahasiswa */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Mahasiswa <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={`${selectedNilai?.nim} - ${selectedNilai?.nama_mahasiswa}`}
                    className="input-field"
                    disabled
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                ) : (
                  <select
                    value={formData.mahasiswa_id}
                    onChange={(e) => setFormData({ ...formData, mahasiswa_id: e.target.value })}
                    className="select-field"
                    required
                    disabled={formLoading}
                  >
                    <option value="">Pilih Mahasiswa</option>
                    {mahasiswaList.map((mhs) => (
                      <option key={mhs.id} value={mhs.id}>
                        {mhs.nim} - {mhs.nama}
                      </option>
                    ))}
                  </select>
                )}
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {editMode ? 'Mahasiswa tidak dapat diubah saat edit' : 'Pilih mahasiswa terlebih dahulu'}
                </p>
              </div>

              {/* Step 2: Pilih Kelas (shown after mahasiswa selected) */}
              {(formData.mahasiswa_id || editMode) && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Kelas <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={`${selectedNilai?.kode_mk} - ${selectedNilai?.nama_mk}`}
                      className="input-field"
                      disabled
                      style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                  ) : (
                    <select
                      value={formData.kelas_id}
                      onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                      className="select-field"
                      required
                      disabled={formLoading}
                    >
                      <option value="">Pilih Kelas</option>
                      {filteredKelasList.map((kelas) => (
                        <option key={kelas.id} value={kelas.id}>
                          {kelas.kode_mk} - {kelas.nama_mk} ({kelas.tahun_akademik} - Semester {kelas.semester_aktif})
                        </option>
                      ))}
                    </select>
                  )}
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {editMode ? 'Kelas tidak dapat diubah saat edit' : 'Pilih kelas yang diikuti mahasiswa'}
                  </p>
                </div>
              )}

              {/* Step 3: Pilih Sub-CPMK (shown after kelas selected) */}
              {(formData.kelas_id || editMode) && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Sub-CPMK <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={selectedNilai?.kode_sub_cpmk || '-'}
                      className="input-field"
                      disabled
                      style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                  ) : (
                    <select
                      value={formData.sub_cpmk_id}
                      onChange={(e) => setFormData({ ...formData, sub_cpmk_id: e.target.value })}
                      className="select-field"
                      required
                      disabled={formLoading}
                    >
                      <option value="">Pilih Sub-CPMK</option>
                      {filteredSubCpmkList.map((subCpmk) => (
                        <option key={subCpmk.id} value={subCpmk.id}>
                          {subCpmk.kode_sub_cpmk} - {subCpmk.deskripsi.substring(0, 50)}...
                        </option>
                      ))}
                    </select>
                  )}
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {editMode ? 'Sub-CPMK tidak dapat diubah saat edit' : 'Pilih sub-CPMK yang akan dinilai'}
                  </p>
                </div>
              )}

              {/* Nilai */}
              {(formData.sub_cpmk_id || editMode) && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Nilai <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.nilai}
                    onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
                    placeholder="Masukkan nilai 0-100"
                    className="input-field"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={formLoading}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Masukkan nilai antara 0-100
                  </p>
                </div>
              )}

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
          </div>
        </div>
      )}
    </>
  );
}
