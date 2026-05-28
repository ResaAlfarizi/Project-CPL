'use client';

import React, { useState, useEffect } from 'react';
import { prodiApi, cplApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

interface Prodi {
  id: string;
  kode_prodi: string;
  nama_prodi: string;
}

interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  prodi_id: string;
}

interface CPL {
  id: string;
  kode_cpl: string;
  deskripsi: string;
}

interface CapaianDetail {
  mahasiswa_id: string;
  nim: string;
  nama_mahasiswa: string;
  cpl_id: string;
  kode_cpl: string;
  nilai_cpl_total: number;
  status: string;
}

interface FormData {
  mahasiswa_id: string;
  cpl_id: string;
  nilai_cpl_total: number;
}

export default function CapaianPage() {
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [capaianList, setCapaianList] = useState<CapaianDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProdi, setSelectedProdi] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    mahasiswa_id: '',
    cpl_id: '',
    nilai_cpl_total: 0,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadProdi();
  }, []);

  useEffect(() => {
    if (selectedProdi) {
      loadCapaianDetail(selectedProdi);
      loadMahasiswaByProdi(selectedProdi);
      loadCPLByProdi(selectedProdi);
    } else {
      setCapaianList([]);
      setMahasiswaList([]);
      setCplList([]);
    }
  }, [selectedProdi]);

  const loadProdi = async () => {
    try {
      const response = await prodiApi.getAll();
      const prodiData = response.data || response || [];
      setProdiList(Array.isArray(prodiData) ? prodiData : []);
    } catch (error) {
      showToast('Gagal memuat data prodi', 'error');
      console.error('Error loading prodi:', error);
    }
  };

  const loadMahasiswaByProdi = async (prodiId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3000/api/v1/m1/mahasiswa`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      const allMahasiswa = data.data || [];
      const filtered = allMahasiswa.filter((m: Mahasiswa) => String(m.prodi_id) === String(prodiId));
      setMahasiswaList(filtered);
    } catch (error) {
      console.error('Error loading mahasiswa:', error);
    }
  };

  const loadCPLByProdi = async (prodiId: string) => {
    try {
      const response = await cplApi.getByProdi(prodiId);
      const cplData = response.data || [];
      setCplList(cplData);
    } catch (error) {
      console.error('Error loading CPL:', error);
    }
  };

  const loadCapaianDetail = async (prodiId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      console.log('Loading capaian for prodi:', prodiId);
      
      // Fetch mahasiswa by prodi
      const mhsResponse = await fetch(`http://localhost:3000/api/v1/m1/mahasiswa`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const mhsData = await mhsResponse.json();
      const allMahasiswa = mhsData.data || [];
      const mahasiswaList = allMahasiswa.filter((m: any) => String(m.prodi_id) === String(prodiId));
      
      console.log('Mahasiswa found:', mahasiswaList.length);
      
      if (mahasiswaList.length === 0) {
        showToast('Tidak ada mahasiswa di program studi ini', 'error');
        setCapaianList([]);
        return;
      }
      
      const allCapaian: CapaianDetail[] = [];
      
      // Fetch CPL untuk mapping kode_cpl
      
      const cplResponse = await cplApi.getByProdi(prodiId);
      const cplList = cplResponse.data || [];
      const cplMap = new Map(cplList.map((c: any) => [c.id, c]));
      
      // Untuk setiap mahasiswa, coba fetch capaian
      for (const mhs of mahasiswaList) {
        try {
          const capaianUrl = `http://localhost:3000/api/v1/m2/capaian/mahasiswa/${mhs.id}`;
          const capaianResponse = await fetch(capaianUrl, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          
          if (capaianResponse.ok) {
            const capaianData = await capaianResponse.json();
            const capaianMhs = capaianData.data || [];
            
            capaianMhs.forEach((c: any) => {
              allCapaian.push({
                mahasiswa_id: mhs.id,
                nim: mhs.nim,
                nama_mahasiswa: mhs.nama,
                cpl_id: c.cpl_id,
                kode_cpl: c.kode_cpl,
                nilai_cpl_total: parseFloat(c.rata_rata_nilai || c.nilai_cpl_total || 0),
                status: c.status_capaian || getStatusText(parseFloat(c.rata_rata_nilai || c.nilai_cpl_total || 0)),
              });
            });
          } else {
            console.log(`Cannot fetch capaian for ${mhs.nim}: ${capaianResponse.status}`);
          }
        } catch (err) {
          console.error(`Error fetching capaian for ${mhs.nim}:`, err);
        }
      }
      
      console.log('Total capaian loaded:', allCapaian.length);
      
      setCapaianList(allCapaian);
    } catch (error) {
      showToast('Gagal memuat data capaian', 'error');
      console.error('Error loading capaian:', error);
      setCapaianList([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (nilai: number): string => {
    if (nilai >= 85) return 'Excellence';
    if (nilai >= 70) return 'Satisfactory';
    if (nilai >= 55) return 'Competent';
    if (nilai >= 40) return 'Developing';
    return 'Not Competent';
  };

  const getStatusBadge = (nilai: number) => {
    if (nilai >= 85) return { class: 'badge-green', text: 'Excellence' };
    if (nilai >= 70) return { class: 'badge-blue', text: 'Satisfactory' };
    if (nilai >= 55) return { class: 'badge-yellow', text: 'Competent' };
    if (nilai >= 40) return { class: 'badge-red', text: 'Developing' };
    return { class: 'badge-red', text: 'Not Competent' };
  };

  const handleAdd = () => {
    if (!selectedProdi) {
      showToast('Pilih program studi terlebih dahulu', 'error');
      return;
    }
    setEditMode(false);
    setFormData({
      mahasiswa_id: '',
      cpl_id: '',
      nilai_cpl_total: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (capaian: CapaianDetail) => {
    setEditMode(true);
    setFormData({
      mahasiswa_id: capaian.mahasiswa_id,
      cpl_id: capaian.cpl_id,
      nilai_cpl_total: capaian.nilai_cpl_total,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mahasiswa_id || !formData.cpl_id) {
      showToast('Mahasiswa dan CPL harus dipilih', 'error');
      return;
    }

    if (formData.nilai_cpl_total < 0 || formData.nilai_cpl_total > 100) {
      showToast('Nilai harus antara 0-100', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (editMode) {
        // Update
        const response = await fetch(
          `http://localhost:3000/api/v1/m2/capaian/${formData.mahasiswa_id}/${formData.cpl_id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ nilai_cpl_total: formData.nilai_cpl_total }),
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Gagal mengupdate capaian');
        }

        showToast('Berhasil mengupdate capaian', 'success');
      } else {
        // Create
        const response = await fetch('http://localhost:3000/api/v1/m2/capaian', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Gagal menambahkan capaian');
        }

        showToast('Berhasil menambahkan capaian', 'success');
      }

      setShowModal(false);
      loadCapaianDetail(selectedProdi);
    } catch (error: any) {
      showToast(error.message || 'Terjadi kesalahan', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (mahasiswaId: string, cplId: string, namaMhs: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data capaian CPL untuk mahasiswa "${namaMhs}"?`)) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3000/api/v1/m2/capaian/${mahasiswaId}/${cplId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal menghapus capaian');
      }

      showToast('Berhasil menghapus capaian', 'success');
      loadCapaianDetail(selectedProdi);
    } catch (error: any) {
      showToast(error.message || 'Terjadi kesalahan', 'error');
    }
  };

  const filteredCapaian = capaianList.filter(capaian =>
    (capaian.nim && capaian.nim.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (capaian.nama_mahasiswa && capaian.nama_mahasiswa.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (capaian.kode_cpl && capaian.kode_cpl.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Capaian CPL Mahasiswa</h1>
        <p className="page-subtitle">Pantau capaian pembelajaran lulusan mahasiswa per program studi</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
          <select 
            className="select-field" 
            value={selectedProdi} 
            onChange={(e) => setSelectedProdi(e.target.value)}
            style={{ minWidth: '250px' }}
          >
            <option value="">Pilih Program Studi</option>
            {prodiList.map(prodi => (
              <option key={prodi.id} value={prodi.id}>
                {prodi.kode_prodi} - {prodi.nama_prodi}
              </option>
            ))}
          </select>
          <div style={{ position: 'relative', flex: '1', maxWidth: '300px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              placeholder="Cari NIM, nama, atau CPL..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="input-field" 
              style={{ paddingLeft: '38px' }} 
            />
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="btn btn-primary"
          disabled={!selectedProdi}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah Capaian Manual
        </button>
      </div>

      {/* Stats Summary */}
      {selectedProdi && capaianList.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }} className="animate-fade-in stagger-1">
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Data</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{capaianList.length}</p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Mahasiswa Unik</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {new Set(capaianList.map(c => c.mahasiswa_id)).size}
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>CPL Unik</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {new Set(capaianList.map(c => c.cpl_id)).size}
            </p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Rata-rata Capaian</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {(capaianList.reduce((sum, c) => sum + c.nilai_cpl_total, 0) / capaianList.length).toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {!selectedProdi ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Pilih Program Studi</p>
            <p>Pilih program studi untuk melihat capaian CPL mahasiswa</p>
          </div>
        ) : loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : filteredCapaian.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada data capaian ditemukan</p>
            <p>Coba ubah kata kunci pencarian atau pilih program studi lain</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIM</th>
                <th>Nama Mahasiswa</th>
                <th>CPL</th>
                <th>Nilai Capaian</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCapaian.map((capaian, index) => {
                const status = getStatusBadge(capaian.nilai_cpl_total);
                return (
                  <tr key={`${capaian.mahasiswa_id}-${capaian.cpl_id}`}>
                    <td>{index + 1}</td>
                    <td><span className="badge badge-dark">{capaian.nim}</span></td>
                    <td style={{ fontWeight: '600' }}>{capaian.nama_mahasiswa}</td>
                    <td><span className="badge badge-blue">{capaian.kode_cpl}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${status.class}`} style={{ minWidth: '60px' }}>
                          {capaian.nilai_cpl_total.toFixed(1)}%
                        </span>
                        <div style={{ flex: 1, maxWidth: '150px', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${Math.min(capaian.nilai_cpl_total, 100)}%`, 
                              height: '100%', 
                              backgroundColor: capaian.nilai_cpl_total >= 85 ? '#10b981' : capaian.nilai_cpl_total >= 70 ? '#3b82f6' : capaian.nilai_cpl_total >= 55 ? '#f59e0b' : '#ef4444',
                              transition: 'width 0.3s ease'
                            }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => handleEdit(capaian)}
                          className="btn btn-secondary btn-sm"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(capaian.mahasiswa_id, capaian.cpl_id, capaian.nama_mahasiswa)}
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '16px',
        }} onClick={() => setShowModal(false)}>
          <div className="card animate-scale-in" style={{
            maxWidth: '500px', width: '100%', padding: '24px',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--eerie-black)' }}>
                {editMode ? 'Edit Capaian' : 'Tambah Capaian Manual'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', padding: '4px',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Mahasiswa</label>
                  <select
                    className="select-field"
                    value={formData.mahasiswa_id}
                    onChange={(e) => setFormData({ ...formData, mahasiswa_id: e.target.value })}
                    required
                    disabled={editMode}
                  >
                    <option value="">Pilih Mahasiswa</option>
                    {mahasiswaList.map(mhs => (
                      <option key={mhs.id} value={mhs.id}>
                        {mhs.nim} - {mhs.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">CPL</label>
                  <select
                    className="select-field"
                    value={formData.cpl_id}
                    onChange={(e) => setFormData({ ...formData, cpl_id: e.target.value })}
                    required
                    disabled={editMode}
                  >
                    <option value="">Pilih CPL</option>
                    {cplList.map(cpl => (
                      <option key={cpl.id} value={cpl.id}>
                        {cpl.kode_cpl} - {cpl.deskripsi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Nilai Capaian (0-100)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.nilai_cpl_total}
                    onChange={(e) => setFormData({ ...formData, nilai_cpl_total: parseFloat(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  disabled={formLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Menyimpan...' : editMode ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
