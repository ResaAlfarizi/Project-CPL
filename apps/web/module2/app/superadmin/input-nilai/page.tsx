'use client';

import React, { useState, useEffect } from 'react';
import { nilaiApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

interface Nilai {
  id: number;
  enrollment_id: number;
  sub_cpmk_id: number;
  nilai: number;
  nim?: string;
  nama_mahasiswa?: string;
  kode_sub_cpmk?: string;
  input_at?: string;
}

export default function InputNilaiPage() {
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedNilai, setSelectedNilai] = useState<Nilai | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    enrollment_id: '',
    sub_cpmk_id: '',
    nilai: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadNilai();
  }, []);

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

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus nilai ini?')) return;
    
    try {
      await nilaiApi.delete(String(id));
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
      enrollment_id: String(nilai.enrollment_id),
      sub_cpmk_id: String(nilai.sub_cpmk_id),
      nilai: String(nilai.nilai),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.enrollment_id || !formData.sub_cpmk_id || !formData.nilai) {
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
        await nilaiApi.update(String(selectedNilai.id), { nilai: nilaiNum });
        showToast('Nilai berhasil diupdate', 'success');
      } else {
        // Create
        await nilaiApi.create({
          enrollment_id: formData.enrollment_id,
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
      enrollment_id: '',
      sub_cpmk_id: '',
      nilai: '',
    });
    setEditMode(false);
    setSelectedNilai(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredNilai = nilaiList.filter(nilai =>
    (nilai.nim && nilai.nim.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (nilai.nama_mahasiswa && nilai.nama_mahasiswa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : filteredNilai.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada data nilai ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIM</th>
                <th>Nama Mahasiswa</th>
                <th>Sub-CPMK</th>
                <th>Nilai</th>
                <th>Tanggal Input</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredNilai.map((nilai, index) => (
                <tr key={nilai.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-dark">{nilai.nim || '-'}</span></td>
                  <td style={{ fontWeight: '600' }}>{nilai.nama_mahasiswa || '-'}</td>
                  <td><span className="badge badge-blue">{nilai.kode_sub_cpmk || '-'}</span></td>
                  <td>
                    <span className={`badge ${nilai.nilai >= 80 ? 'badge-green' : nilai.nilai >= 70 ? 'badge-yellow' : 'badge-red'}`}>
                      {nilai.nilai}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {nilai.input_at ? new Date(nilai.input_at).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleEdit(nilai)}
                        className="btn btn-secondary btn-sm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(nilai.id)}
                        className="btn btn-sm" 
                        style={{ backgroundColor: '#fdecea', color: '#e74c3c' }}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              {editMode ? 'Edit Nilai' : 'Input Nilai Baru'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode ? 'Ubah nilai sub-CPMK mahasiswa' : 'Isi form di bawah untuk menginput nilai sub-CPMK'}
            </p>
            
            <form onSubmit={handleSubmit}>
              {/* Enrollment ID (Mahasiswa + Kelas) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Mahasiswa & Kelas <span style={{ color: '#e74c3c' }}>*</span>
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
                    value={formData.enrollment_id}
                    onChange={(e) => setFormData({ ...formData, enrollment_id: e.target.value })}
                    className="select-field"
                    required
                    disabled={formLoading}
                  >
                    <option value="">Pilih Mahasiswa & Kelas</option>
                    {/* Unique enrollment dari nilaiList */}
                    {Array.from(new Set(nilaiList.map(n => n.enrollment_id))).map(enrollId => {
                      const enroll = nilaiList.find(n => n.enrollment_id === enrollId);
                      return (
                        <option key={enrollId} value={enrollId}>
                          {enroll?.nim} - {enroll?.nama_mahasiswa}
                        </option>
                      );
                    })}
                  </select>
                )}
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {editMode ? 'Mahasiswa tidak dapat diubah saat edit' : 'Pilih mahasiswa yang akan dinilai'}
                </p>
              </div>

              {/* Sub-CPMK */}
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
                    {/* Unique sub-CPMK dari nilaiList */}
                    {Array.from(new Set(nilaiList.map(n => n.sub_cpmk_id))).map(subCpmkId => {
                      const subCpmk = nilaiList.find(n => n.sub_cpmk_id === subCpmkId);
                      return (
                        <option key={subCpmkId} value={subCpmkId}>
                          {subCpmk?.kode_sub_cpmk || `Sub-CPMK ${subCpmkId}`}
                        </option>
                      );
                    })}
                  </select>
                )}
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {editMode ? 'Sub-CPMK tidak dapat diubah saat edit' : 'Pilih sub-CPMK yang akan dinilai'}
                </p>
              </div>

              {/* Nilai */}
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
