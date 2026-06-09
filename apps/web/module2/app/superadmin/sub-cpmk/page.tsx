'use client';

import React, { useState, useEffect } from 'react';
import ToastContainer, { showToast } from '@/components/Toast';

interface SubCPMK {
  id: number;
  kode_sub_cpmk: string;
  deskripsi: string;
  bobot: number;
  mk_cpl_id?: number;
  kode_cpl?: string;
  kode_mk?: string;
  nama_mk?: string;
  prodi_id?: string;
  created_at?: string;
}

interface MKCPL {
  id: number;
  mk_id: string;
  cpl_id: string;
  bobot: number;
}

interface MataKuliah {
  id: string;
  kode_mk: string;
  nama_mk: string;
  prodi_id: string;
  semester: number;
  sks: number;
}

interface CPL {
  id: string;
  kode_cpl: string;
  deskripsi: string;
  prodi_id: string;
}

export default function SubCPMKPage() {
  const [items, setItems] = useState<SubCPMK[]>([]);
  const [enrichedItems, setEnrichedItems] = useState<SubCPMK[]>([]);
  const [mkCplList, setMkCplList] = useState<MKCPL[]>([]);
  const [mkList, setMkList] = useState<MataKuliah[]>([]);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProdi, setFilterProdi] = useState('');
  const [filterMK, setFilterMK] = useState('');
  const [prodiList, setProdiList] = useState<Array<{ id: string; nama_prodi: string; kode_prodi: string }>>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SubCPMK | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  // Form state
  const [formData, setFormData] = useState({
    kode_sub_cpmk: '',
    deskripsi: '',
    mk_cpl_id: '',
    bobot: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadSubCpmk();
    loadMKCPL();
    loadMK();
    loadCPL();
    loadProdi();
  }, []);

  // Enrich Sub-CPMK data when all data is loaded
  useEffect(() => {
    if (items.length > 0 && mkCplList.length > 0 && mkList.length > 0 && cplList.length > 0) {
      const enriched = items.map(item => {
        // Find MK-CPL mapping
        const mkCpl = mkCplList.find(mc => mc.id === item.mk_cpl_id);
        if (!mkCpl) return item;

        // Find MK data
        const mk = mkList.find(m => m.id === mkCpl.mk_id);

        // Find CPL data
        const cpl = cplList.find(c => c.id === mkCpl.cpl_id);

        return {
          ...item,
          kode_mk: mk?.kode_mk,
          nama_mk: mk?.nama_mk,
          prodi_id: mk?.prodi_id,
          kode_cpl: cpl?.kode_cpl,
        };
      });
      setEnrichedItems(enriched);
    }
  }, [items, mkCplList, mkList, cplList]);

  const loadSubCpmk = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/m1/kurikulum/sub-cpmk', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setItems(data.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data sub-CPMK', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMKCPL = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/m1/kurikulum/mapping', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setMkCplList(data.data || []);
    } catch (error) {
      console.error('Error loading MK-CPL:', error);
    }
  };

  const loadMK = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/m1/kurikulum/mk', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setMkList(data.data || []);
    } catch (error) {
      console.error('Error loading MK:', error);
    }
  };

  const loadCPL = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/m1/kurikulum/cpl', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      setCplList(data.data || []);
    } catch (error) {
      console.error('Error loading CPL:', error);
    }
  };

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

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus sub-CPMK ini?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/m1/kurikulum/sub-cpmk/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Gagal menghapus sub-CPMK');

      showToast('Sub-CPMK berhasil dihapus', 'success');
      loadSubCpmk();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus sub-CPMK', 'error');
    }
  };

  const handleEdit = (item: SubCPMK) => {
    setEditMode(true);
    setSelectedItem(item);
    setFormData({
      kode_sub_cpmk: item.kode_sub_cpmk,
      deskripsi: item.deskripsi,
      mk_cpl_id: String(item.mk_cpl_id || ''),
      bobot: String(item.bobot * 100), // Convert 0-1 to 0-100 for display
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
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
      const bobotDecimal = bobotNum / 100; // Convert 0-100 to 0-1 for backend

      const payload = {
        kode_sub_cpmk: formData.kode_sub_cpmk,
        deskripsi: formData.deskripsi,
        mk_cpl_id: formData.mk_cpl_id,
        bobot: bobotDecimal,
      };

      if (editMode && selectedItem) {
        // Update
        const response = await fetch(`http://localhost:3000/api/v1/m1/kurikulum/sub-cpmk/${selectedItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Gagal mengupdate sub-CPMK');

        showToast('Sub-CPMK berhasil diupdate', 'success');
      } else {
        // Create
        const response = await fetch('http://localhost:3000/api/v1/m1/kurikulum/sub-cpmk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Gagal menambahkan sub-CPMK');

        showToast('Sub-CPMK berhasil ditambahkan', 'success');
      }
      setShowModal(false);
      resetForm();
      loadSubCpmk();
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
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  // Get unique MK list from enriched items for filter dropdown
  // Filter by selected prodi first
  const uniqueMKList = Array.from(new Set(enrichedItems.map(item => item.kode_mk)))
    .filter(Boolean)
    .map(kode_mk => {
      const item = enrichedItems.find(i => i.kode_mk === kode_mk);
      return {
        kode_mk: kode_mk!,
        nama_mk: item?.nama_mk || '',
        prodi_id: item?.prodi_id || ''
      };
    })
    .filter(mk => !filterProdi || mk.prodi_id === filterProdi); // Filter by selected prodi

  // Filter items based on prodi and MK
  const filteredItems = enrichedItems.filter(item => {
    if (!item.kode_mk) return false;

    // Match prodi: compare selected prodi_id with item's prodi_id
    const matchProdi = !filterProdi || item.prodi_id === filterProdi;

    // Match MK: compare selected kode_mk with item's kode_mk
    const matchMK = !filterMK || item.kode_mk === filterMK;

    return matchProdi && matchMK;
  });

  // Group by Mata Kuliah
  const groupedByMK = filteredItems.reduce((acc, item) => {
    const mkKey = item.kode_mk || 'unknown';
    if (!acc[mkKey]) {
      acc[mkKey] = {
        kode_mk: item.kode_mk || '-',
        nama_mk: item.nama_mk || 'Tidak diketahui',
        items: []
      };
    }
    acc[mkKey].items.push(item);
    return acc;
  }, {} as Record<string, { kode_mk: string; nama_mk: string; items: SubCPMK[] }>);

  const mkGroups = Object.values(groupedByMK);

  return (
    <div className="sa-page">
      <ToastContainer />

      {/* Header */}
      <div className="sa-page-header">
        <h1 className="sa-page-title">Sub-CPMK</h1>
        <p className="sa-page-subtitle">Kelola sub capaian pembelajaran mata kuliah</p>
      </div>

      {/* Toolbar */}
      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <select
            value={filterProdi}
            onChange={(e) => {
              setFilterProdi(e.target.value);
              setFilterMK('');
            }}
            className="sa-form-control"
            style={{ minWidth: '200px' }}
          >
            <option value="">Semua Prodi</option>
            {prodiList.map((prodi) => (
              <option key={prodi.id} value={prodi.id}>
                {prodi.kode_prodi} - {prodi.nama_prodi}
              </option>
            ))}
          </select>

          <select
            value={filterMK}
            onChange={(e) => setFilterMK(e.target.value)}
            className="sa-form-control"
            style={{ minWidth: '300px', flex: '1' }}
          >
            <option value="">Semua Mata Kuliah</option>
            {uniqueMKList.map((mk) => (
              <option key={mk.kode_mk} value={mk.kode_mk}>
                {mk.kode_mk} - {mk.nama_mk}
              </option>
            ))}
          </select>
        </div>

        <div className="sa-toolbar-right">
          <div style={{ display: 'flex', background: '#f0f4f9', padding: '4px', borderRadius: '8px', border: '1px solid #D8DFE9', marginRight: '10px' }}>
            <button
              className={`sa-btn sa-btn-sm ${viewMode === 'matrix' ? 'sa-btn-primary' : 'sa-btn-ghost'}`}
              onClick={() => setViewMode('matrix')}
              style={{ border: 'none' }}
            >
              Matrix
            </button>
            <button
              className={`sa-btn sa-btn-sm ${viewMode === 'table' ? 'sa-btn-primary' : 'sa-btn-ghost'}`}
              onClick={() => setViewMode('table')}
              style={{ border: 'none' }}
            >
              Table
            </button>
          </div>
          <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)}>
            <span>➕</span>
            <span>Tambah Sub-CPMK</span>
          </button>
        </div>
      </div>

      {/* Grouped by Mata Kuliah */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div className="sa-empty">
            <p>⏳ Memuat data...</p>
          </div>
        ) : mkGroups.length === 0 ? (
          <div className="sa-empty">
            <p className="sa-empty-title">📋 Tidak ada sub-CPMK ditemukan</p>
            <p className="sa-empty-subtitle">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          mkGroups.map((group, groupIndex) => {
            // Calculate total bobot for this MK
            const totalBobot = group.items.reduce((sum, item) => sum + (item.bobot * 100), 0);
            const isComplete = Math.abs(totalBobot - 100) < 0.1; // Allow small floating point errors

            return (
              <div key={groupIndex} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* MK Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '16px 20px',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>{group.kode_mk}</div>
                      <div style={{ fontSize: '18px', fontWeight: '700' }}>{group.nama_mk}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', opacity: 0.9 }}>Total Bobot</div>
                        <div style={{ fontSize: '20px', fontWeight: '700' }}>{totalBobot.toFixed(1)}%</div>
                      </div>
                      <button
                        className="sa-btn sa-btn-sm"
                        onClick={() => setShowModal(true)}
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          color: 'white',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span>➕</span>
                        <span>Tambah Sub-CPMK</span>
                      </button>
                    </div>
                  </div>

                  {/* Warning if total bobot != 100% */}
                  {!isComplete && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 12px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      borderRadius: '8px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '500',
                      border: '1px solid #f87171'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>Peringatan: Total keseluruhan bobot Sub-CPMK untuk Mata Kuliah ini adalah {totalBobot.toFixed(1)}% (Seharusnya 100%)</span>
                    </div>
                  )}
                </div>

                {/* Sub-CPMK List */}
                <div style={{ padding: '16px 20px' }}>
                  {viewMode === 'table' ? (
                    /* CPL Groups within MK */
                    (() => {
                      const cplGroups = group.items.reduce((acc, item) => {
                        const cplKey = item.kode_cpl || 'unknown';
                        if (!acc[cplKey]) {
                          acc[cplKey] = {
                            kode_cpl: item.kode_cpl || '-',
                            items: []
                          };
                        }
                        acc[cplKey].items.push(item);
                        return acc;
                      }, {} as Record<string, { kode_cpl: string; items: SubCPMK[] }>);

                      return Object.values(cplGroups).map((cplGroup, cplIndex) => {
                        const cplBobot = cplGroup.items.reduce((sum, item) => sum + (item.bobot * 100), 0);

                        return (
                          <div key={cplIndex} style={{ marginBottom: cplIndex < Object.values(cplGroups).length - 1 ? '20px' : 0 }}>
                            {/* CPL Header */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 12px',
                              background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
                              borderRadius: '8px',
                              marginBottom: '12px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="badge badge-green" style={{ fontSize: '12px' }}>{cplGroup.kode_cpl}</span>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                  Bobot MK→CPL: {cplBobot.toFixed(1)}%
                                </span>
                              </div>
                            </div>

                            {/* Sub-CPMK Table */}
                            <table style={{ width: '100%', fontSize: '13px' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>KODE SUB-CPMK</th>
                                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>DESKRIPSI</th>
                                  <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>BOBOT</th>
                                  <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>% KONTRIBUSI</th>
                                  <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '12px' }}>AKSI</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cplGroup.items.map((item, itemIndex) => (
                                  <tr key={item.id} style={{ borderBottom: itemIndex < cplGroup.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                    <td style={{ padding: '12px 8px' }}>
                                      <span className="sa-badge sa-badge-primary" style={{ fontSize: '11px' }}>{item.kode_sub_cpmk}</span>
                                    </td>
                                    <td style={{ padding: '12px 8px', maxWidth: '300px' }}>{item.deskripsi}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                      <span className="sa-badge sa-badge-accent" style={{ fontSize: '11px' }}>{(item.bobot * 100).toFixed(2)}</span>
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                      <span style={{ fontWeight: '600' }}>{((item.bobot * 100 / cplBobot) * 100).toFixed(1)}%</span>
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                        <button
                                          onClick={() => handleEdit(item)}
                                          className="btn btn-secondary btn-sm"
                                          style={{ padding: '6px 10px', fontSize: '12px' }}
                                        >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                          </svg>
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDelete(item.id)}
                                          className="btn btn-sm"
                                          style={{ padding: '6px 10px', fontSize: '12px', backgroundColor: '#fdecea', color: '#e74c3c' }}
                                        >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
                        );
                      });
                    })()
                  ) : (
                    /* Matrix View */
                    (() => {
                      const mkCpls = Array.from(new Set(group.items.map(i => i.kode_cpl))).filter(Boolean) as string[];
                      mkCpls.sort();

                      const cplTotals = mkCpls.reduce((acc, cpl) => {
                        acc[cpl] = group.items.filter(i => i.kode_cpl === cpl).reduce((sum, item) => sum + Number(item.bobot), 0);
                        return acc;
                      }, {} as Record<string, number>);

                      const grandTotal = Object.values(cplTotals).reduce((sum, val) => sum + val, 0);

                      return (
                        <div className="sa-table-wrapper" style={{ margin: 0, overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                          <table className="sa-table" style={{ minWidth: 'max-content' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '14px 20px', fontWeight: '700', color: '#64748b', fontSize: '13px' }}>{group.kode_mk}</th>
                                {mkCpls.map(cpl => (
                                  <th key={cpl} style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '700', color: '#64748b', fontSize: '13px' }}>{cpl}</th>
                                ))}
                                <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '700', color: '#1e293b', fontSize: '13px', background: '#f1f5f9' }}>TOTAL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.items.map((item, idx) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>{item.kode_sub_cpmk}</td>
                                  {mkCpls.map(cpl => (
                                    <td key={cpl} style={{ padding: '14px 20px', textAlign: 'center', fontFamily: 'monospace', fontSize: '14px' }}>
                                      {item.kode_cpl === cpl ? Number(item.bobot).toFixed(4) : ''}
                                    </td>
                                  ))}
                                  <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '600', fontFamily: 'monospace', fontSize: '14px', background: '#f1f5f9' }}>
                                    {Number(item.bobot).toFixed(4)}
                                  </td>
                                </tr>
                              ))}
                              <tr style={{ background: '#ecfccb', borderTop: '2px solid #bef264' }}>
                                <td style={{ padding: '14px 20px', fontWeight: '700', color: '#3f6212', fontSize: '14px' }}>Total</td>
                                {mkCpls.map(cpl => (
                                  <td key={cpl} style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '700', fontFamily: 'monospace', fontSize: '14px', color: '#3f6212' }}>
                                    {cplTotals[cpl].toFixed(4)}
                                  </td>
                                ))}
                                <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '800', fontFamily: 'monospace', fontSize: '15px', color: '#166534', background: '#d9f99d' }}>
                                  {grandTotal.toFixed(4)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="sa-modal-overlay" onClick={handleModalClose}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">{editMode ? 'Edit Sub-CPMK' : 'Tambah Sub-CPMK'}</h2>
              <p className="sa-modal-subtitle">{editMode ? 'Ubah data sub-CPMK' : 'Isi form di bawah untuk menambahkan sub-CPMK baru'}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="sa-modal-body">
                <div className="sa-form-group">
                  <label className="sa-form-label">Kode Sub-CPMK <span style={{ color: '#e74c3c' }}>*</span></label>
                  <input
                    type="text"
                    value={formData.kode_sub_cpmk}
                    onChange={(e) => setFormData({ ...formData, kode_sub_cpmk: e.target.value })}
                    placeholder="Contoh: SCPL-01, SCPL-02"
                    className="sa-form-control"
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="sa-form-group">
                  <label className="sa-form-label">Deskripsi <span style={{ color: '#e74c3c' }}>*</span></label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Deskripsi sub-CPMK"
                    className="sa-form-control"
                    required
                    disabled={formLoading}
                    rows={3}
                    style={{ resize: 'vertical', minHeight: '60px' }}
                  />
                </div>

                <div className="sa-form-group">
                  <label className="sa-form-label">Mata Kuliah & CPL <span style={{ color: '#e74c3c' }}>*</span></label>
                  <select
                    value={formData.mk_cpl_id}
                    onChange={(e) => setFormData({ ...formData, mk_cpl_id: e.target.value })}
                    className="sa-form-control"
                    required
                    disabled={formLoading}
                  >
                    <option value="">Pilih Mata Kuliah & CPL</option>
                    {mkCplList.map((mkCpl) => {
                      const mk = mkList.find(m => m.id === String(mkCpl.mk_id));
                      const cpl = cplList.find(c => c.id === String(mkCpl.cpl_id));
                      return (
                        <option key={mkCpl.id} value={mkCpl.id}>
                          {mk ? `${mk.nama_mk} (${mk.kode_mk})` : `MK ${mkCpl.mk_id}`} → {cpl ? cpl.kode_cpl : `CPL ${mkCpl.cpl_id}`}
                        </option>
                      );
                    })}
                  </select>
                  <p className="sa-form-hint">Pilih pemetaan mata kuliah ke CPL yang sesuai</p>
                </div>

                <div className="sa-form-group">
                  <label className="sa-form-label">Bobot (%) <span style={{ color: '#e74c3c' }}>*</span></label>
                  <input
                    type="number"
                    value={formData.bobot}
                    onChange={(e) => setFormData({ ...formData, bobot: e.target.value })}
                    placeholder="Masukkan bobot 0-100"
                    className="sa-form-control"
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={formLoading}
                  />
                  <p className="sa-form-hint">Masukkan bobot dalam persen (0-100). Total bobot semua sub-CPMK dalam satu MK-CPL harus 100%</p>
                </div>
              </div>

              <div className="sa-modal-footer">
                <button type="button" onClick={handleModalClose} className="sa-btn sa-btn-ghost" disabled={formLoading}>
                  Batal
                </button>
                <button type="submit" className="sa-btn sa-btn-primary" disabled={formLoading}>
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
