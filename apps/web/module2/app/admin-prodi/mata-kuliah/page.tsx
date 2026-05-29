'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { kelasApi, mataKuliahApi, dosenApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

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
  nama_dosen: string | null;
  nama_prodi: string;
  prodi_id?: string;
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
  prodi_id?: string;
}

export default function AdminProdiMataKuliahPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMKModal, setShowMKModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Kelas | null>(null);
  
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    mk_id: '',
    dosen_id: '',
    tahun_akademik: '',
    semester_aktif: '',
    nama_kelas: '',
  });
  
  const [mkFormData, setMkFormData] = useState({
    kode_mk: '',
    nama_mk: '',
    sks: '',
    semester: '',
  });
  
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const prodiId = (user as any)?.prodi_id || (user as any)?.entity_id;
      
      if (!prodiId) {
        showToast('Prodi ID tidak ditemukan', 'error');
        return;
      }

      const response = await kelasApi.getAll();
      const allKelas = response.data || [];
      
      // Fetch mata kuliah to filter by prodi
      const mkResponse = await fetch(`http://localhost:3000/api/v1/m1/kurikulum/mk`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      let mkData: any[] = [];
      if (mkResponse.ok) {
        const mkResult = await mkResponse.json();
        mkData = mkResult.data || [];
      }
      
      // Filter kelas by prodi through mk
      const filteredKelas = allKelas.filter((kelas: Kelas) => {
        const mk = mkData.find((m: any) => m.id === kelas.mk_id);
        return mk && String(mk.prodi_id) === String(prodiId);
      });
      
      setItems(filteredKelas);
    } catch (error: any) {
      showToast(error.message || 'Gagal memuat data kelas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, namaKelas: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kelas "${namaKelas}"?`)) return;

    try {
      await kelasApi.delete(id);
      showToast('Kelas berhasil dihapus', 'success');
      fetchKelas();
    } catch (error: any) {
      showToast(error.message || 'Gagal menghapus kelas', 'error');
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
    fetchDropdownData();
  };

  const fetchDropdownData = async () => {
    try {
      setDropdownLoading(true);
      const prodiId = (user as any)?.prodi_id || (user as any)?.entity_id;
      
      const [mkResponse, dosenResponse] = await Promise.all([
        mataKuliahApi.getAll(),
        dosenApi.getAll(),
      ]);
      
      const allMK = mkResponse.data || [];
      const allDosen = dosenResponse.data || [];
      
      console.log('All MK:', allMK); // Debug
      console.log('All Dosen:', allDosen); // Debug
      console.log('User prodi_id:', prodiId); // Debug
      
      // Filter MK by prodi
      const filteredMK = allMK.filter((mk: MataKuliah) => String(mk.prodi_id) === String(prodiId));
      
      // Filter Dosen - lebih fleksibel
      // Tampilkan semua dosen jika tidak ada prodi_id, atau filter by prodi jika ada
      const filteredDosen = prodiId 
        ? allDosen.filter((d: Dosen) => !d.prodi_id || String(d.prodi_id) === String(prodiId))
        : allDosen;
      
      console.log('Filtered MK:', filteredMK); // Debug
      console.log('Filtered Dosen:', filteredDosen); // Debug
      
      setMataKuliahList(filteredMK);
      setDosenList(filteredDosen);
    } catch (error: any) {
      console.error('Error loading dropdown:', error); // Debug
      showToast(error.message || 'Gagal memuat data dropdown', 'error');
    } finally {
      setDropdownLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mk_id || !formData.tahun_akademik || !formData.semester_aktif) {
      showToast('Mata kuliah, tahun akademik, dan semester wajib diisi', 'error');
      return;
    }

    const semester = parseInt(formData.semester_aktif);
    if (isNaN(semester) || semester < 1 || semester > 8) {
      showToast('Semester harus antara 1-8', 'error');
      return;
    }

    const selectedMK = mataKuliahList.find(mk => mk.id === formData.mk_id);
    if (selectedMK && selectedMK.semester && selectedMK.semester !== semester) {
      showToast(
        `Mata kuliah "${selectedMK.nama_mk}" hanya bisa dibuka di semester ${selectedMK.semester}`,
        'error'
      );
      return;
    }

    const tahunAkademikPattern = /^\d{4}\/\d{4}$/;
    if (!tahunAkademikPattern.test(formData.tahun_akademik)) {
      showToast('Format tahun akademik harus YYYY/YYYY (contoh: 2024/2025)', 'error');
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
        await kelasApi.update(selectedItem.id, payload);
        showToast('Kelas berhasil diupdate', 'success');
      } else {
        await kelasApi.create(payload);
        showToast('Kelas berhasil ditambahkan', 'success');
      }
      setShowModal(false);
      resetForm();
      fetchKelas();
    } catch (error: any) {
      showToast(error.message || 'Gagal menyimpan kelas', 'error');
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

  const handleMKSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mkFormData.kode_mk || !mkFormData.nama_mk || !mkFormData.sks) {
      showToast('Kode MK, nama MK, dan SKS wajib diisi', 'error');
      return;
    }

    const sks = parseInt(mkFormData.sks);
    if (isNaN(sks) || sks < 1 || sks > 6) {
      showToast('SKS harus antara 1-6', 'error');
      return;
    }

    const semester = mkFormData.semester ? parseInt(mkFormData.semester) : undefined;
    if (semester && (isNaN(semester) || semester < 1 || semester > 8)) {
      showToast('Semester harus antara 1-8', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const prodiId = (user as any)?.prodi_id || (user as any)?.entity_id;
      
      await mataKuliahApi.create({
        kode_mk: mkFormData.kode_mk,
        nama_mk: mkFormData.nama_mk,
        sks: sks,
        prodi_id: prodiId,
        semester: semester,
      });
      
      showToast('Mata kuliah berhasil ditambahkan', 'success');
      setShowMKModal(false);
      setMkFormData({
        kode_mk: '',
        nama_mk: '',
        sks: '',
        semester: '',
      });
      
      // Refresh data kelas dan mata kuliah
      await fetchKelas();
      
      // Show info to user
      setTimeout(() => {
        showToast('Mata kuliah baru sudah tersedia di dropdown "Tambah Kelas"', 'info');
      }, 1000);
    } catch (error: any) {
      showToast(error.message || 'Gagal menyimpan mata kuliah', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.nama_mk.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode_mk.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama_prodi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Kelola Mata Kuliah</h1>
        <p className="page-subtitle">Kelola mata kuliah dan kelas program studi Anda</p>
      </div>

      {/* Info Banner */}
      <div className="animate-fade-in" style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
        borderRadius: '12px',
        border: '1.5px solid #93C5FD',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <div>
          <p style={{ fontSize: '13px', color: '#1E40AF', fontWeight: '600', margin: 0 }}>
            <strong>Tambah Mata Kuliah</strong> untuk membuat mata kuliah baru. 
            <strong> Tambah Kelas</strong> untuk membuka kelas dari mata kuliah yang sudah ada.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari mata kuliah..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => setShowMKModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Mata Kuliah
          </button>
          <button className="btn btn-primary" onClick={() => {
            setShowModal(true);
            fetchDropdownData();
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Kelas
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '40px' }}></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada mata kuliah ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode MK</th>
                <th>Nama Mata Kuliah</th>
                <th>SKS</th>
                <th>Tahun Akademik</th>
                <th>Semester</th>
                <th>Nama Kelas</th>
                <th>Dosen</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-dark">{item.kode_mk}</span></td>
                  <td style={{ fontWeight: '600' }}>{item.nama_mk}</td>
                  <td><span className="badge badge-blue">{item.sks} SKS</span></td>
                  <td style={{ fontSize: '13px' }}>{item.tahun_akademik}</td>
                  <td><span className="badge badge-yellow">Semester {item.semester_aktif}</span></td>
                  <td style={{ fontSize: '13px' }}>{item.nama_kelas || '-'}</td>
                  <td style={{ fontSize: '13px' }}>{item.nama_dosen || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleEdit(item)}
                        className="btn btn-secondary btn-sm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm" 
                        style={{ backgroundColor: '#fdecea', color: '#e74c3c' }}
                        onClick={() => handleDelete(item.id, item.nama_mk)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
              {editMode ? 'Edit Kelas' : 'Tambah Kelas'}
            </h2>
            
            {dropdownLoading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '12px' }}></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
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

      {/* Modal Tambah Mata Kuliah */}
      {showMKModal && (
        <div className="modal-overlay" onClick={() => setShowMKModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              Tambah Mata Kuliah
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              Isi form untuk menambahkan mata kuliah baru ke program studi Anda
            </p>
            
            <form onSubmit={handleMKSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                  Kode Mata Kuliah <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={mkFormData.kode_mk}
                  onChange={(e) => setMkFormData({ ...mkFormData, kode_mk: e.target.value })}
                  placeholder="Contoh: IF101"
                  className="input-field"
                  required
                  disabled={formLoading}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                  Nama Mata Kuliah <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={mkFormData.nama_mk}
                  onChange={(e) => setMkFormData({ ...mkFormData, nama_mk: e.target.value })}
                  placeholder="Contoh: Pemrograman Web"
                  className="input-field"
                  required
                  disabled={formLoading}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                  SKS <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  value={mkFormData.sks}
                  onChange={(e) => setMkFormData({ ...mkFormData, sks: e.target.value })}
                  className="input-field"
                  required
                  disabled={formLoading}
                >
                  <option value="">Pilih SKS</option>
                  {[1, 2, 3, 4, 5, 6].map((sks) => (
                    <option key={sks} value={sks}>{sks} SKS</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                  Semester (Opsional)
                </label>
                <select
                  value={mkFormData.semester}
                  onChange={(e) => setMkFormData({ ...mkFormData, semester: e.target.value })}
                  className="input-field"
                  disabled={formLoading}
                >
                  <option value="">Pilih Semester (Opsional)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Semester di mana mata kuliah ini biasanya diambil
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowMKModal(false)} 
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
