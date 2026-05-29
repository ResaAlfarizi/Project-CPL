'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subCpmkApi, mkCplApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';
import Modal from '@/components/Modal';

interface SubCPMK {
  id: number;
  kode_sub_cpmk: string;
  deskripsi: string;
  bobot: number;
  mk_cpl_id?: number;
  kode_cpl?: string;
  kode_mk?: string;
  nama_mk?: string;
  sks?: number;
  semester?: number;
  created_at?: string;
}

interface MKCPL {
  id: number;
  mk_id: string;
  cpl_id: string;
  kode_mk: string;
  nama_mk: string;
  kode_cpl: string;
  deskripsi_cpl: string;
  bobot: number;
  sks?: number;
  semester?: number;
}

interface MataKuliahGroup {
  kode_mk: string;
  nama_mk: string;
  sks?: number;
  semester?: number;
  mkCplList: MKCPL[];
  subCpmkList: SubCPMK[];
  totalBobot: number;
}

export default function AdminProdiSubCPMKPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<SubCPMK[]>([]);
  const [mkCplList, setMkCplList] = useState<MKCPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SubCPMK | null>(null);
  const [selectedMkCplId, setSelectedMkCplId] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    kode_sub_cpmk: '',
    deskripsi: '',
    mk_cpl_id: '',
    bobot: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const prodiId = (user as any)?.prodi_id || (user as any)?.entity_id;
      
      if (!prodiId) {
        showToast('Prodi ID tidak ditemukan', 'error');
        return;
      }

      const [subResponse, mkCplResponse] = await Promise.all([
        subCpmkApi.getAll(),
        mkCplApi.getAll(),
      ]);
      
      const allSubCpmk = subResponse.data || [];
      const allMkCpl = mkCplResponse.data || [];
      
      // Fetch mata kuliah to filter by prodi
      const mkResponse = await fetch(`http://localhost:3000/api/v1/m1/kurikulum/mk`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      let mkData: any[] = [];
      if (mkResponse.ok) {
        const mkResult = await mkResponse.json();
        mkData = mkResult.data || [];
      }
      
      // Filter sub-cpmk by prodi through mk
      const filteredSubCpmk = allSubCpmk.filter((item: SubCPMK) => {
        if (!item.kode_mk) return false;
        const mk = mkData.find((m: any) => m.kode_mk === item.kode_mk);
        return mk && String(mk.prodi_id) === String(prodiId);
      });
      
      // Filter mk-cpl by prodi
      const filteredMkCpl = allMkCpl.filter((item: MKCPL) => {
        const mk = mkData.find((m: any) => m.id === item.mk_id);
        return mk && String(mk.prodi_id) === String(prodiId);
      });
      
      setItems(filteredSubCpmk);
      setMkCplList(filteredMkCpl);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus sub-CPMK ini?')) return;
    
    try {
      await subCpmkApi.delete(String(id));
      showToast('Sub-CPMK berhasil dihapus', 'success');
      loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus sub-CPMK', 'error');
    }
  };

  const openCreate = (mkCplId: string) => {
    setEditMode(false);
    setSelectedItem(null);
    setSelectedMkCplId(mkCplId);
    setFormData({
      kode_sub_cpmk: '',
      deskripsi: '',
      mk_cpl_id: mkCplId,
      bobot: '',
    });
    setShowModal(true);
  };

  const handleEdit = (item: SubCPMK) => {
    setEditMode(true);
    setSelectedItem(item);
    setSelectedMkCplId(String(item.mk_cpl_id || ''));
    setFormData({
      kode_sub_cpmk: item.kode_sub_cpmk,
      deskripsi: item.deskripsi,
      mk_cpl_id: String(item.mk_cpl_id || ''),
      bobot: String(item.bobot * 100),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.kode_sub_cpmk || !formData.deskripsi || !formData.mk_cpl_id || !formData.bobot) {
      showToast('Semua field wajib diisi', 'error');
      return;
    }

    const bobotNum = parseFloat(formData.bobot);
    if (isNaN(bobotNum) || bobotNum <= 0 || bobotNum > 100) {
      showToast('Bobot harus antara 0-100', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const bobotDecimal = bobotNum / 100;
      
      // Validate total bobot
      const mkCpl = mkCplList.find(m => String(m.id) === formData.mk_cpl_id);
      if (mkCpl) {
        const currentTotal = items
          .filter(s => String(s.mk_cpl_id) === formData.mk_cpl_id && s.id !== selectedItem?.id)
          .reduce((sum, s) => {
            const bobotNum = typeof s.bobot === 'string' ? parseFloat(s.bobot) : s.bobot;
            return sum + bobotNum;
          }, 0);
        const newTotal = currentTotal + bobotDecimal;
        
        if (newTotal > 1.0001) {
          showToast(`Total bobot Sub-CPMK untuk ${mkCpl.nama_mk} akan melebihi 100% (${(newTotal * 100).toFixed(1)}%)`, 'error');
          setFormLoading(false);
          return;
        }
      }
      
      if (editMode && selectedItem) {
        await subCpmkApi.update(String(selectedItem.id), {
          kode_sub_cpmk: formData.kode_sub_cpmk,
          deskripsi: formData.deskripsi,
          mk_cpl_id: formData.mk_cpl_id,
          bobot: bobotDecimal,
        });
        showToast('Sub-CPMK berhasil diupdate', 'success');
      } else {
        await subCpmkApi.create({
          kode_sub_cpmk: formData.kode_sub_cpmk,
          deskripsi: formData.deskripsi,
          mk_cpl_id: formData.mk_cpl_id,
          bobot: bobotDecimal,
        });
        showToast('Sub-CPMK berhasil ditambahkan', 'success');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan sub-CPMK', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      kode_sub_cpmk: '',
      deskripsi: '',
      mk_cpl_id: '',
      bobot: '',
    });
    setEditMode(false);
    setSelectedItem(null);
    setSelectedMkCplId('');
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  // Group by mata kuliah
  const mataKuliahGroups: MataKuliahGroup[] = [];
  const mkMap = new Map<string, MataKuliahGroup>();

  mkCplList.forEach(mkCpl => {
    if (!mkMap.has(mkCpl.kode_mk)) {
      mkMap.set(mkCpl.kode_mk, {
        kode_mk: mkCpl.kode_mk,
        nama_mk: mkCpl.nama_mk,
        sks: mkCpl.sks,
        semester: mkCpl.semester,
        mkCplList: [],
        subCpmkList: [],
        totalBobot: 0,
      });
    }
    mkMap.get(mkCpl.kode_mk)!.mkCplList.push(mkCpl);
  });

  items.forEach(sub => {
    if (sub.kode_mk && mkMap.has(sub.kode_mk)) {
      const group = mkMap.get(sub.kode_mk)!;
      const bobotNum = typeof sub.bobot === 'string' ? parseFloat(sub.bobot) : sub.bobot;
      group.subCpmkList.push({ ...sub, bobot: bobotNum });
      group.totalBobot += bobotNum;
    }
  });

  mkMap.forEach(group => mataKuliahGroups.push(group));

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Kelola Sub-CPMK</h1>
        <p className="page-subtitle">Kelola sub capaian pembelajaran mata kuliah program studi Anda</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 12px' }} />
          <div className="skeleton" style={{ width: '300px', height: '16px', margin: '0 auto' }} />
        </div>
      ) : mataKuliahGroups.length === 0 ? (
        <div className="card animate-fade-in" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Belum ada Mata Kuliah</p>
          <p style={{ color: 'var(--text-secondary)' }}>Belum ada mata kuliah di program studi Anda</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {mataKuliahGroups.map((group, index) => {
            const isOverLimit = group.totalBobot > 1.0001;
            const percentage = (group.totalBobot * 100).toFixed(1);
            
            return (
              <div key={group.kode_mk} className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden', animationDelay: `${index * 0.1}s` }}>
                {/* Header Mata Kuliah */}
                <div style={{ 
                  padding: '20px 24px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: '700', 
                        padding: '4px 10px', 
                        background: 'rgba(255,255,255,0.2)', 
                        borderRadius: '6px' 
                      }}>
                        {group.kode_mk}
                      </span>
                      {group.sks && (
                        <span style={{ fontSize: '12px', opacity: 0.9 }}>{group.sks} SKS</span>
                      )}
                      {group.semester && (
                        <span style={{ fontSize: '12px', opacity: 0.9 }}>Sem {group.semester}</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{group.nama_mk}</h3>
                  </div>
                </div>

                {/* Warning jika over limit */}
                {isOverLimit && (
                  <div style={{
                    padding: '12px 24px',
                    background: '#FEF2F2',
                    borderBottom: '1px solid #FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p style={{ margin: 0, fontSize: '13px', color: '#DC2626', fontWeight: '600' }}>
                      Peringatan: Total keseluruhan bobot Sub-CPMK untuk Mata Kuliah ini melebihi 1.00 ({percentage}%)
                    </p>
                  </div>
                )}

                {/* Sub-CPMK per CPL */}
                <div style={{ padding: '24px' }}>
                  {group.mkCplList.map((mkCpl) => {
                    const subCpmksForThisCpl = group.subCpmkList.filter(s => String(s.mk_cpl_id) === String(mkCpl.id));
                    const totalBobotForCpl = subCpmksForThisCpl.reduce((sum, s) => {
                      const bobotNum = typeof s.bobot === 'string' ? parseFloat(s.bobot) : s.bobot;
                      return sum + bobotNum;
                    }, 0);
                    const isOverLimitCpl = totalBobotForCpl > 1.0001;
                    
                    return (
                      <div key={mkCpl.id} style={{ marginBottom: '32px' }}>
                        {/* CPL Header */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          marginBottom: '12px',
                          padding: '12px 16px',
                          background: isOverLimitCpl ? '#FEF2F2' : '#F0FDF4',
                          borderRadius: '8px',
                          border: `1.5px solid ${isOverLimitCpl ? '#FEE2E2' : '#BBF7D0'}`
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="badge badge-blue" style={{ fontSize: '12px' }}>{mkCpl.kode_cpl}</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              Bobot MK→CPL: <strong>{(mkCpl.bobot * 100).toFixed(0)}%</strong>
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: '700',
                              color: isOverLimitCpl ? '#DC2626' : totalBobotForCpl >= 0.99 ? '#16A34A' : '#F59E0B'
                            }}>
                              Σ bobot: {(totalBobotForCpl * 100).toFixed(1)}%
                              {isOverLimitCpl && ' ⚠️'}
                            </span>
                            <button 
                              className="btn btn-accent btn-sm" 
                              onClick={() => openCreate(String(mkCpl.id))}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                              </svg>
                              Tambah Sub-CPMK
                            </button>
                          </div>
                        </div>

                        {/* Sub-CPMK Table */}
                        {subCpmksForThisCpl.length === 0 ? (
                          <div style={{ 
                            padding: '32px', 
                            textAlign: 'center', 
                            background: '#F9FAFB', 
                            borderRadius: '8px',
                            border: '1px dashed #E5E7EB'
                          }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                              Belum ada Sub-CPMK untuk pemetaan ini
                            </p>
                          </div>
                        ) : (
                          <table className="data-table" style={{ marginBottom: 0 }}>
                            <thead>
                              <tr>
                                <th style={{ width: '120px' }}>Kode Sub-CPMK</th>
                                <th>Deskripsi</th>
                                <th style={{ width: '100px' }}>Bobot</th>
                                <th style={{ width: '120px' }}>% Kontribusi</th>
                                <th style={{ width: '80px' }}>Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subCpmksForThisCpl.map((sub) => {
                                const bobotNum = typeof sub.bobot === 'string' ? parseFloat(sub.bobot) : sub.bobot;
                                return (
                                  <tr key={sub.id}>
                                    <td><span className="badge badge-dark">{sub.kode_sub_cpmk}</span></td>
                                    <td style={{ fontSize: '13px' }}>{sub.deskripsi || '-'}</td>
                                    <td><span className="badge badge-yellow">{bobotNum.toFixed(4)}</span></td>
                                    <td>
                                      <div style={{ 
                                        background: '#FEF3C7', 
                                        padding: '4px 8px', 
                                        borderRadius: '6px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        fontSize: '12px'
                                      }}>
                                        {(bobotNum * 100).toFixed(1)}%
                                      </div>
                                    </td>
                                    <td>
                                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(sub)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        Edit
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={handleModalClose} title={editMode ? 'Edit Sub-CPMK' : 'Tambah Sub-CPMK'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Mata Kuliah → CPL
              </label>
              <select
                className="select-field"
                value={formData.mk_cpl_id}
                onChange={(e) => setFormData({ ...formData, mk_cpl_id: e.target.value })}
                required
                disabled={!!editMode || formLoading}
              >
                <option value="">-- Pilih MK dan CPL --</option>
                {mkCplList.map((mc) => (
                  <option key={mc.id} value={mc.id}>
                    {mc.nama_mk} ({mc.kode_mk}) → {mc.kode_cpl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Kode Sub-CPMK <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                className="input-field"
                value={formData.kode_sub_cpmk}
                onChange={(e) => setFormData({ ...formData, kode_sub_cpmk: e.target.value })}
                placeholder="Contoh: SCPL-01"
                required
                disabled={formLoading}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Deskripsi</label>
              <textarea
                className="input-field"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Deskripsi sub-CPMK"
                rows={3}
                style={{ resize: 'vertical' }}
                disabled={formLoading}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Bobot (%) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="input-field"
                value={formData.bobot}
                onChange={(e) => setFormData({ ...formData, bobot: e.target.value })}
                placeholder="Contoh: 50 (untuk 50%)"
                required
                disabled={formLoading}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                ⚠️ Total bobot semua Sub-CPMK untuk MK-CPL yang sama harus = 100%
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-ghost" onClick={handleModalClose} disabled={formLoading}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Menyimpan...' : editMode ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
