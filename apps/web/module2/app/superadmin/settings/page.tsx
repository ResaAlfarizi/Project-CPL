'use client';

import React, { useState, useEffect } from 'react';
import ToastContainer, { showToast } from '@/components/Toast';
import { prodiApi } from '@/lib/api';

interface Threshold {
  id: string;
  prodi_id: string;
  nama_status: string;
  nilai_min: number;
  nilai_max: number;
  nama_prodi?: string;
  kode_prodi?: string;
}

interface Prodi {
  id: string;
  kode_prodi: string;
  nama_prodi: string;
}

export default function SettingsPage() {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProdi, setSelectedProdi] = useState<string>('Semua');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState<Threshold | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    prodi_id: '',
    nama_status: '',
    nilai_min: '',
    nilai_max: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadThresholds();
    loadProdi();
  }, []);

  const loadThresholds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3000/api/v1/m1/threshold', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.status === 'Success') {
        // Fetch all prodi first
        const prodiResponse = await prodiApi.getAll();
        const prodiData = prodiResponse.data || prodiResponse || [];
        const prodiArray = Array.isArray(prodiData) ? prodiData : [];
        const prodiMap = new Map(
          prodiArray.map((p: Prodi) => [p.id, p])
        );
        
        // Map threshold with prodi info
        const thresholdsWithProdi = data.data.map((t: Threshold) => {
          const prodi = prodiMap.get(t.prodi_id);
          return {
            ...t,
            nama_prodi: prodi?.nama_prodi || 'Unknown',
            kode_prodi: prodi?.kode_prodi || '-',
          };
        });
        
        setThresholds(thresholdsWithProdi);
      }
    } catch (error) {
      showToast('Gagal memuat data threshold', 'error');
      console.error('Error loading thresholds:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProdi = async () => {
    try {
      const response = await prodiApi.getAll();
      // Module 2 returns { success: true, data: [...] }
      const prodiData = response.data || response || [];
      setProdiList(Array.isArray(prodiData) ? prodiData : []);
    } catch (error) {
      console.error('Error loading prodi:', error);
      showToast('Gagal memuat data program studi', 'error');
    }
  };

  const handleEdit = (threshold: Threshold) => {
    setEditMode(true);
    setSelectedThreshold(threshold);
    setFormData({
      prodi_id: threshold.prodi_id,
      nama_status: threshold.nama_status,
      nilai_min: String(threshold.nilai_min),
      nilai_max: String(threshold.nilai_max),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    showToast('Fitur hapus threshold belum tersedia', 'error');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prodi_id || !formData.nama_status || !formData.nilai_min || !formData.nilai_max) {
      showToast('Semua field wajib diisi', 'error');
      return;
    }

    const nilaiMin = parseFloat(formData.nilai_min);
    const nilaiMax = parseFloat(formData.nilai_max);

    if (nilaiMin > nilaiMax) {
      showToast('Nilai minimum tidak boleh lebih besar dari nilai maximum', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Get all thresholds for this prodi
      const existingThresholds = thresholds.filter(t => t.prodi_id === formData.prodi_id);
      
      // Prepare new threshold list
      let newThresholds;
      if (editMode && selectedThreshold) {
        // Update existing
        newThresholds = existingThresholds.map(t => 
          t.id === selectedThreshold.id 
            ? { nama_status: formData.nama_status, nilai_min: nilaiMin, nilai_max: nilaiMax }
            : { nama_status: t.nama_status, nilai_min: t.nilai_min, nilai_max: t.nilai_max }
        );
      } else {
        // Add new
        newThresholds = [
          ...existingThresholds.map(t => ({ 
            nama_status: t.nama_status, 
            nilai_min: t.nilai_min, 
            nilai_max: t.nilai_max 
          })),
          { nama_status: formData.nama_status, nilai_min: nilaiMin, nilai_max: nilaiMax }
        ];
      }

      const response = await fetch('http://localhost:3000/api/v1/m1/threshold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prodi_id: formData.prodi_id,
          thresholds: newThresholds,
        }),
      });

      const data = await response.json();
      
      if (data.status === 'Success') {
        showToast(editMode ? 'Threshold berhasil diupdate' : 'Threshold berhasil ditambahkan', 'success');
        setShowModal(false);
        resetForm();
        loadThresholds();
      } else {
        showToast(data.message || 'Gagal menyimpan threshold', 'error');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan threshold', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      prodi_id: '',
      nama_status: '',
      nilai_min: '',
      nilai_max: '',
    });
    setEditMode(false);
    setSelectedThreshold(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredThresholds = selectedProdi === 'Semua' 
    ? thresholds 
    : thresholds.filter(t => t.prodi_id === selectedProdi);

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Pengaturan Threshold</h1>
        <p className="page-subtitle">Kelola batas nilai threshold per program studi</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', marginRight: '4px' }}>
            Filter Prodi:
          </span>
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="select-field"
            style={{ minWidth: '200px' }}
          >
            <option value="Semua">Semua Program Studi</option>
            {prodiList.map((prodi) => (
              <option key={prodi.id} value={prodi.id}>
                {prodi.kode_prodi} - {prodi.nama_prodi}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah Threshold
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : filteredThresholds.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H5m13.2 5.2l-4.2-4.2m0-6l4.2-4.2"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada threshold ditemukan</p>
            <p>Coba ubah filter program studi</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Program Studi</th>
                <th>Status</th>
                <th>Nilai Minimum</th>
                <th>Nilai Maximum</th>
                <th>Range</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredThresholds.map((threshold, index) => (
                <tr key={threshold.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="badge badge-blue" style={{ fontSize: '11px' }}>{threshold.kode_prodi}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{threshold.nama_prodi}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      threshold.nama_status === 'Excellence' ? 'badge-green' :
                      threshold.nama_status === 'Satisfactory' ? 'badge-blue' :
                      threshold.nama_status === 'Competent' ? 'badge-yellow' : 'badge-red'
                    }`}>
                      {threshold.nama_status}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      backgroundColor: '#f3f4f6', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {threshold.nilai_min}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      backgroundColor: '#f3f4f6', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {threshold.nilai_max}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {threshold.nilai_min} - {threshold.nilai_max}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleEdit(threshold)}
                        className="btn btn-secondary btn-sm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(threshold.id)}
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
              {editMode ? 'Edit Threshold' : 'Tambah Threshold Baru'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode ? 'Ubah batas nilai threshold' : 'Isi form di bawah untuk menambah threshold baru'}
            </p>
            
            <form onSubmit={handleSubmit}>
              {/* Program Studi */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Program Studi <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  value={formData.prodi_id}
                  onChange={(e) => setFormData({ ...formData, prodi_id: e.target.value })}
                  className="select-field"
                  required
                  disabled={formLoading || editMode}
                  style={editMode ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                >
                  <option value="">Pilih Program Studi</option>
                  {prodiList.map((prodi) => (
                    <option key={prodi.id} value={prodi.id}>
                      {prodi.kode_prodi} - {prodi.nama_prodi}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {editMode ? 'Program studi tidak dapat diubah saat edit' : 'Pilih program studi untuk threshold'}
                </p>
              </div>

              {/* Nama Status */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Nama Status <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama_status}
                  onChange={(e) => setFormData({ ...formData, nama_status: e.target.value })}
                  placeholder="Contoh: Excellence, Satisfactory, Competent"
                  className="input-field"
                  required
                  disabled={formLoading}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Nama label status threshold (Excellence, Satisfactory, dll)
                </p>
              </div>

              {/* Nilai Minimum */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Nilai Minimum <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.nilai_min}
                  onChange={(e) => setFormData({ ...formData, nilai_min: e.target.value })}
                  placeholder="Masukkan nilai minimum"
                  className="input-field"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  disabled={formLoading}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Batas nilai minimum untuk status ini
                </p>
              </div>

              {/* Nilai Maximum */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Nilai Maximum <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.nilai_max}
                  onChange={(e) => setFormData({ ...formData, nilai_max: e.target.value })}
                  placeholder="Masukkan nilai maximum"
                  className="input-field"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  disabled={formLoading}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Batas nilai maximum untuk status ini
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
