'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cplApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

interface CPL {
  id: string;
  kode_cpl: string;
  deskripsi: string;
  prodi_id: string;
  is_active: boolean;
  created_at?: string;
}

export default function AdminProdiCPLPage() {
  const { user } = useAuth();
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    kode_cpl: '',
    deskripsi: '',
    is_active: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadCPL();
  }, []);

  const loadCPL = async () => {
    try {
      setLoading(true);
      // Admin Prodi hanya bisa lihat CPL prodi sendiri
      // Asumsi: user.prodi_id tersedia dari token
      const prodiId = (user as any)?.prodi_id || (user as any)?.entity_id;
      
      if (!prodiId) {
        showToast('Prodi ID tidak ditemukan', 'error');
        return;
      }

      const response = await cplApi.getByProdi(prodiId);
      setCplList(response.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data CPL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setFormData({
      id: '',
      kode_cpl: '',
      deskripsi: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (cpl: CPL) => {
    setEditMode(true);
    setFormData({
      id: cpl.id,
      kode_cpl: cpl.kode_cpl,
      deskripsi: cpl.deskripsi,
      is_active: cpl.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, kodeCpl: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus CPL "${kodeCpl}"?`)) return;
    
    try {
      await cplApi.delete(id);
      showToast('CPL berhasil dihapus', 'success');
      loadCPL();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus CPL', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.kode_cpl || !formData.deskripsi) {
      showToast('Kode CPL dan deskripsi wajib diisi', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const prodiId = (user as any)?.prodi_id || (user as any)?.entity_id;

      if (editMode && formData.id) {
        await cplApi.update(formData.id, {
          kode_cpl: formData.kode_cpl,
          deskripsi: formData.deskripsi,
          prodi_id: prodiId,
          is_active: formData.is_active,
        });
        showToast('CPL berhasil diupdate', 'success');
      } else {
        await cplApi.create({
          kode_cpl: formData.kode_cpl,
          deskripsi: formData.deskripsi,
          prodi_id: prodiId,
          is_active: formData.is_active,
        });
        showToast('CPL berhasil ditambahkan', 'success');
      }
      
      setShowModal(false);
      loadCPL();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan CPL', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCPL = cplList.filter(cpl =>
    cpl.kode_cpl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cpl.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Kelola CPL</h1>
        <p className="page-subtitle">Kelola Capaian Pembelajaran Lulusan program studi Anda</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari CPL..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah CPL
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : filteredCPL.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Belum ada CPL</p>
            <p>Tambahkan CPL untuk program studi Anda</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode CPL</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCPL.map((cpl, index) => (
                <tr key={cpl.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-dark">{cpl.kode_cpl}</span></td>
                  <td style={{ maxWidth: '400px' }}>{cpl.deskripsi}</td>
                  <td>
                    {cpl.is_active ? (
                      <span className="badge badge-green">Aktif</span>
                    ) : (
                      <span className="badge badge-red">Nonaktif</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleEdit(cpl)}
                        className="btn btn-secondary btn-sm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              {editMode ? 'Edit CPL' : 'Tambah CPL'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode ? 'Ubah data Capaian Pembelajaran Lulusan' : 'Isi form untuk menambahkan CPL baru'}
            </p>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Kode CPL <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.kode_cpl}
                  onChange={(e) => setFormData({ ...formData, kode_cpl: e.target.value })}
                  placeholder="Contoh: CPL-01"
                  className="input-field"
                  required
                  disabled={formLoading}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Deskripsi <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Deskripsi capaian pembelajaran"
                  className="input-field"
                  required
                  disabled={formLoading}
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    disabled={formLoading}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>CPL Aktif</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)} 
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
