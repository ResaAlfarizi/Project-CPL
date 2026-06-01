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
    <div className="sa-page">
      <ToastContainer />
      
      {/* Header */}
      <div className="sa-page-header">
        <h1 className="sa-page-title">Pengaturan Threshold</h1>
        <p className="sa-page-subtitle">Kelola batas nilai threshold per program studi</p>
      </div>

      {/* Toolbar */}
      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <span style={{ fontSize: '14px', marginRight: '8px' }}>Filter Prodi:</span>
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="sa-form-control"
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
        <div className="sa-toolbar-right">
          <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)}>
            <span>➕</span>
            <span>Tambah Threshold</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="sa-card">
        {loading ? (
          <div className="sa-empty">
            <p>⏳ Memuat data...</p>
          </div>
        ) : filteredThresholds.length === 0 ? (
          <div className="sa-empty">
            <p className="sa-empty-title">⚙️ Tidak ada threshold ditemukan</p>
            <p className="sa-empty-subtitle">Coba ubah filter program studi</p>
          </div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
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
                      <span className="sa-badge sa-badge-primary" style={{ fontSize: '11px' }}>{threshold.kode_prodi}</span>
                      <span style={{ fontSize: '12px', opacity: 0.7 }}>{threshold.nama_prodi}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`sa-badge ${
                      threshold.nama_status === 'Excellence' ? 'sa-badge-success' :
                      threshold.nama_status === 'Satisfactory' ? 'sa-badge-primary' :
                      threshold.nama_status === 'Competent' ? 'sa-badge-accent' : 'sa-badge-danger'
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
                        className="sa-btn sa-btn-secondary sa-btn-sm"
                      >
                        <span>✏️</span>
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(threshold.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="sa-modal-overlay" onClick={handleModalClose}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">{editMode ? 'Edit Threshold' : 'Tambah Threshold Baru'}</h2>
              <p className="sa-modal-subtitle">{editMode ? 'Ubah batas nilai threshold' : 'Isi form di bawah untuk menambah threshold baru'}</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="sa-modal-body">
                {/* Program Studi */}
                <div className="sa-form-group">
                  <label className="sa-form-label">
                    Program Studi <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <select
                    value={formData.prodi_id}
                    onChange={(e) => setFormData({ ...formData, prodi_id: e.target.value })}
                    className="sa-form-control"
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
                  <p className="sa-form-hint">
                    {editMode ? 'Program studi tidak dapat diubah saat edit' : 'Pilih program studi untuk threshold'}
                  </p>
                </div>

                {/* Nama Status */}
                <div className="sa-form-group">
                  <label className="sa-form-label">
                    Nama Status <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_status}
                    onChange={(e) => setFormData({ ...formData, nama_status: e.target.value })}
                    placeholder="Contoh: Excellence, Satisfactory, Competent"
                    className="sa-form-control"
                    required
                    disabled={formLoading}
                  />
                  <p className="sa-form-hint">
                    Nama label status threshold (Excellence, Satisfactory, dll)
                  </p>
                </div>

                {/* Nilai Minimum */}
                <div className="sa-form-group">
                  <label className="sa-form-label">
                    Nilai Minimum <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.nilai_min}
                    onChange={(e) => setFormData({ ...formData, nilai_min: e.target.value })}
                    placeholder="Masukkan nilai minimum"
                    className="sa-form-control"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={formLoading}
                  />
                  <p className="sa-form-hint">
                    Batas nilai minimum untuk status ini
                  </p>
                </div>

                {/* Nilai Maximum */}
                <div className="sa-form-group">
                  <label className="sa-form-label">
                    Nilai Maximum <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.nilai_max}
                    onChange={(e) => setFormData({ ...formData, nilai_max: e.target.value })}
                    placeholder="Masukkan nilai maximum"
                    className="sa-form-control"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={formLoading}
                  />
                  <p className="sa-form-hint">
                    Batas nilai maximum untuk status ini
                  </p>
                </div>
              </div>

              {/* Buttons */}
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
          </div>
        </div>
      )}
    </div>
  );
}
