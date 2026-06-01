'use client';

import React, { useState, useEffect } from 'react';
import ToastContainer, { showToast } from '@/components/Toast';

interface MataKuliah {
  id: string;
  prodi_id: string;
  kode_mk: string;
  nama_mk: string;
  sks: number;
  semester: number;
}

interface CPL {
  id: string;
  prodi_id: string;
  kode_cpl: string;
  deskripsi: string;
}

interface Prodi {
  id: string;
  kode_prodi: string;
  nama_prodi: string;
}

interface MkCpl {
  id?: string;
  mk_id: string;
  cpl_id: string;
  bobot: number;
}

export default function MappingPage() {
  const [mk, setMk] = useState<MataKuliah[]>([]);
  const [cpl, setCpl] = useState<CPL[]>([]);
  const [prodi, setProdi] = useState<Prodi[]>([]);
  const [mkcpl, setMkcpl] = useState<MkCpl[]>([]);
  const [filterProdi, setFilterProdi] = useState('');
  const [filterMk, setFilterMk] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  
  const [draftMkcpl, setDraftMkcpl] = useState<Record<string, MkCpl[]>>({});
  
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<{ mkId: string; index: number } | null>(null);
  const [formData, setFormData] = useState({ mk_id: '', cpl_id: '', bobot: '' });
  
  const [savingMkId, setSavingMkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const [mkRes, cplRes, prodiRes, mkcplRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/m1/kurikulum/mk', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/v1/m1/kurikulum/cpl', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/v1/m1/prodi', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/v1/m1/kurikulum/mapping', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const mkData = await mkRes.json();
      const cplData = await cplRes.json();
      const prodiData = await prodiRes.json();
      const mkcplData = await mkcplRes.json();

      setMk(mkData.data || []);
      setCpl(cplData.data || []);
      setProdi(prodiData.data || []);
      
      const serverMappings = mkcplData.data || [];
      setMkcpl(serverMappings);
      
      const drafts: Record<string, MkCpl[]> = {};
      serverMappings.forEach((m: MkCpl) => {
        if (!drafts[m.mk_id]) drafts[m.mk_id] = [];
        drafts[m.mk_id].push({ ...m });
      });
      setDraftMkcpl(drafts);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredMk = mk.filter(m => !filterProdi || m.prodi_id === filterProdi);
  const displayMk = filterMk ? mk.filter(m => m.id === filterMk) : filteredMk;

  const availableCpl = (mkId: string, currentCplId: string | null = null) => {
    const m = mk.find(x => x.id === mkId);
    if (!m) return [];
    const mappings = draftMkcpl[mkId] || [];
    const mapped = mappings.map(x => x.cpl_id).filter(id => id !== currentCplId);
    return cpl.filter(c => c.prodi_id === m.prodi_id && !mapped.includes(c.id));
  };

  const getMkTotal = (mkId: string) => {
    const mappings = draftMkcpl[mkId] || [];
    return mappings.reduce((s, m) => s + Number(m.bobot), 0);
  };

  const openAdd = (mkId = '') => {
    setEditData(null);
    setFormData({ mk_id: mkId || (filteredMk[0]?.id || ''), cpl_id: '', bobot: '' });
    setShowModal(true);
  };
  
  const openEdit = (mkId: string, index: number) => {
    const row = draftMkcpl[mkId][index];
    setEditData({ mkId, index });
    setFormData({ mk_id: row.mk_id, cpl_id: row.cpl_id, bobot: String(row.bobot) });
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setEditData(null);
  };

  const handleSaveLocal = (e: React.FormEvent) => {
    e.preventDefault();
    const bobot = parseFloat(formData.bobot);
    if (isNaN(bobot) || bobot <= 0 || bobot > 1) {
      showToast('Bobot harus antara 0.0001 dan 1.0', 'error');
      return;
    }
    
    setDraftMkcpl(prev => {
      const updated = { ...prev };
      if (!updated[formData.mk_id]) {
        updated[formData.mk_id] = [];
      } else {
        updated[formData.mk_id] = [...updated[formData.mk_id]];
      }
      
      if (editData !== null) {
        updated[formData.mk_id][editData.index] = { ...formData, bobot };
      } else {
        updated[formData.mk_id].push({ ...formData, bobot, id: 'temp-' + Date.now() });
      }
      return updated;
    });
    
    closeModal();
  };

  const handleDeleteLocal = (mkId: string, index: number) => {
    setDraftMkcpl(prev => {
      const updated = { ...prev };
      if (updated[mkId]) {
        updated[mkId] = [...updated[mkId]];
        updated[mkId].splice(index, 1);
      }
      return updated;
    });
  };

  const handleSaveToServer = async (mkId: string) => {
    const mappings = draftMkcpl[mkId] || [];
    const total = getMkTotal(mkId);
    
    if (mappings.length > 0 && Math.abs(total - 1.0) > 0.0001) {
      showToast(`Total bobot saat ini ${total.toFixed(4)}. Harus tepat 1.0!`, 'error');
      return;
    }
    
    setSavingMkId(mkId);
    try {
      const response = await fetch('http://localhost:3000/api/v1/m1/kurikulum/mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ mk_id: mkId, mappings }),
      });

      if (!response.ok) throw new Error('Gagal menyimpan pemetaan');

      showToast('Pemetaan berhasil disimpan ke server!', 'success');
      loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan pemetaan', 'error');
    }
    setSavingMkId(null);
  };

  const getMkInfo = (id: string) => mk.find(m => m.id === id);
  const getCplCode = (id: string) => cpl.find(c => c.id === id)?.kode_cpl || '—';

  const WeightBar = ({ mkId }: { mkId: string }) => {
    const total = getMkTotal(mkId);
    const pct = Math.min(total * 100, 100);
    const over = total > 1.0001;
    return (
      <div style={{ marginTop: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
          <span style={{ color: over ? '#e74c3c' : '#6b7280' }}>Σ bobot</span>
          <span style={{ fontWeight: '700', fontSize: '14px', color: over ? '#e74c3c' : (Math.abs(total - 1.0) <= 0.0001) ? '#27ae60' : '#212121' }}>
            {total > 0 ? total.toFixed(4) : '0.0000'} {(Math.abs(total - 1.0) <= 0.0001) && !over ? '✅' : over ? '⚠️' : ''}
          </span>
        </div>
        <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: over ? '#e74c3c' : 'var(--color-honeydew)', borderRadius: '99px', transition: 'width 0.3s' }} />
        </div>
      </div>
    );
  };

  const matrixCpls = cpl.filter(c => !filterProdi || c.prodi_id === filterProdi).filter(c => {
    return displayMk.some(m => {
      const mappings = draftMkcpl[m.id] || [];
      return mappings.some(map => map.cpl_id === c.id && Number(map.bobot) > 0);
    });
  });

  const overMk = displayMk.filter(m => {
    const total = (draftMkcpl[m.id] || []).reduce((s, map) => s + Number(map.bobot), 0);
    return total > 1.0001;
  });

  return (
    <>
      <ToastContainer />

      <div className="page-header animate-fade-in">
        <h1 className="page-title">Pemetaan MK-CPL</h1>
        <p className="page-subtitle">Petakan mata kuliah ke capaian pembelajaran lulusan</p>
      </div>

      <div className="animate-fade-in stagger-1" style={{ background: '#f0f7ee', border: '1px solid #CFDECA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' }}>
        💡 <strong>Aturan:</strong> Total bobot semua CPL yang dipetakan ke satu MK harus = <strong>1.0</strong>. Tambahkan pemetaan, lalu klik <strong>Simpan ke Database</strong>.
      </div>

      <div className="animate-fade-in stagger-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select className="select-field" value={filterProdi} onChange={e => { setFilterProdi(e.target.value); setFilterMk(''); }}>
            <option value="">Semua Prodi</option>
            {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
          <select className="select-field" value={filterMk} onChange={e => setFilterMk(e.target.value)}>
            <option value="">Semua MK</option>
            {filteredMk.map(m => <option key={m.id} value={m.id}>{m.kode_mk} – {m.nama_mk}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#f0f4f9', padding: '4px', borderRadius: '8px', border: '1px solid var(--color-alice-blue)' }}>
            <button
              className={`btn btn-sm ${viewMode === 'matrix' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('matrix')}
              style={{ border: 'none' }}
            >
              Matrix
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('table')}
              style={{ border: 'none' }}
            >
              Table
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => openAdd(filterMk)} disabled={mk.length === 0}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Pemetaan
          </button>
        </div>
      </div>

      {overMk.length > 0 && (
        <div className="animate-fade-in stagger-3" style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 16px', marginBottom: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c' }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span style={{ fontWeight: '600', fontSize: '13px', lineHeight: '1.5' }}>
            Peringatan: Total bobot melebihi 1.00 pada MK: {overMk.map(m => m.kode_mk).join(', ')}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : displayMk.length === 0 ? (
        <div className="card animate-fade-in stagger-4">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Belum ada Mata Kuliah</p>
            <p>Tambahkan mata kuliah terlebih dahulu</p>
          </div>
        </div>
      ) : viewMode === 'matrix' ? (
        <div className="card animate-fade-in stagger-4">
          <div className="card-header">
            <div className="card-title">Matrix Pemetaan MK–CPL</div>
          </div>
          <div className="table-wrapper" style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <table style={{ minWidth: 'max-content' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', top: 0, left: 0, zIndex: 10, background: 'var(--color-ghost-white)', boxShadow: 'inset -1px -1px 0 var(--color-alice-blue)' }}>Mata Kuliah</th>
                  {matrixCpls.map(c => (
                    <th key={c.id} style={{ textAlign: 'center', position: 'sticky', top: 0, background: 'var(--color-ghost-white)', zIndex: 5, boxShadow: 'inset 0 -1px 0 var(--color-alice-blue)' }}>{c.kode_cpl}</th>
                  ))}
                  <th style={{ textAlign: 'center', position: 'sticky', top: 0, background: 'var(--color-ghost-white)', zIndex: 5, boxShadow: 'inset 0 -1px 0 var(--color-alice-blue)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {displayMk.map(m => {
                  const mappings = draftMkcpl[m.id] || [];
                  const rowTotal = mappings.reduce((s, map) => s + Number(map.bobot), 0);
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: '700', position: 'sticky', left: 0, background: '#fff', zIndex: 2, boxShadow: 'inset -1px 0 0 var(--color-alice-blue)' }}>
                        <div style={{ fontSize: '13px' }}>{m.kode_mk}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{m.nama_mk}</div>
                      </td>
                      {matrixCpls.map(c => {
                        const map = mappings.find(x => x.cpl_id === c.id);
                        return (
                          <td key={c.id} style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '14px' }}>
                            {map ? Number(map.bobot).toFixed(4) : null}
                          </td>
                        );
                      })}
                      <td style={{ textAlign: 'center', fontWeight: '800', fontFamily: 'monospace', fontSize: '14px', color: Math.abs(rowTotal - 1) <= 0.0001 ? '#27ae60' : rowTotal > 0 ? '#e74c3c' : '#d1d5db' }}>
                        {rowTotal > 0 ? rowTotal.toFixed(4) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        displayMk.map((m, idx) => {
          const mappings = draftMkcpl[m.id] || [];
          return (
            <div key={m.id} className="card animate-fade-in" style={{ marginBottom: '16px', animationDelay: `${idx * 0.05}s` }}>
              <div className="card-header" style={{ padding: '16px 20px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: '11px', padding: '4px 8px' }}>{m.kode_mk}</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{m.nama_mk}</span>
                    <span className="badge badge-gray" style={{ fontSize: '11px', padding: '4px 8px' }}>{m.sks} SKS</span>
                    <span className="badge badge-gray" style={{ fontSize: '11px', padding: '4px 8px' }}>Sem {m.semester}</span>
                  </div>
                  <WeightBar mkId={m.id} />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => openAdd(m.id)} style={{ whiteSpace: 'nowrap' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    CPL
                  </button>
                  <button className="btn btn-sm btn-primary" onClick={() => handleSaveToServer(m.id)} disabled={savingMkId === m.id} style={{ whiteSpace: 'nowrap' }}>
                    {savingMkId === m.id ? '⏳ Menyimpan...' : '💾 Simpan'}
                  </button>
                </div>
              </div>
              
              {mappings.length === 0 ? (
                <div style={{ padding: '16px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px', borderTop: '1px solid #f3f4f6' }}>
                  Belum ada CPL dipetakan ke MK ini
                </div>
              ) : (
                <div className="table-wrapper" style={{ margin: '0', borderRadius: '0', border: 'none', borderTop: '1px solid #f3f4f6' }}>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ padding: '10px 12px', fontSize: '12px' }}>Kode CPL</th>
                        <th style={{ padding: '10px 12px', fontSize: '12px' }}>Deskripsi CPL</th>
                        <th style={{ padding: '10px 12px', fontSize: '12px' }}>Bobot</th>
                        <th style={{ padding: '10px 12px', fontSize: '12px' }}>% Kontribusi</th>
                        <th style={{ width: '140px', textAlign: 'center', padding: '10px 12px', fontSize: '12px' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings.map((map, index) => (
                        <tr key={map.id || index}>
                          <td style={{ whiteSpace: 'nowrap', padding: '10px 12px' }}>
                            <span className="badge badge-green" style={{ fontFamily: 'monospace', fontSize: '11px', padding: '4px 8px' }}>{getCplCode(map.cpl_id)}</span>
                          </td>
                          <td style={{ fontSize: '13px', padding: '10px 12px' }}>{cpl.find(c => c.id === map.cpl_id)?.deskripsi?.slice(0, 80) || '—'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '13px' }}>{Number(map.bobot).toFixed(4)}</span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '60px', height: '6px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{ width: `${Number(map.bobot) * 100}%`, height: '100%', background: 'var(--color-honeydew)', borderRadius: '99px' }} />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: '600', minWidth: '45px' }}>{(Number(map.bobot) * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button className="btn btn-sm btn-secondary" onClick={() => openEdit(m.id, index)} style={{ padding: '6px 10px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                              </button>
                              <button className="btn btn-sm" style={{ backgroundColor: '#fdecea', color: '#e74c3c', padding: '6px 10px' }} onClick={() => handleDeleteLocal(m.id, index)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
              )}
            </div>
          );
        })
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              {editData ? 'Edit Pemetaan' : 'Tambah Pemetaan'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editData ? 'Ubah bobot pemetaan' : 'Petakan CPL ke mata kuliah'}
            </p>

            <form onSubmit={handleSaveLocal}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Mata Kuliah <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  className="select-field"
                  value={formData.mk_id}
                  onChange={e => setFormData({ ...formData, mk_id: e.target.value, cpl_id: '' })}
                  required
                  disabled={!!editData}
                >
                  <option value="">— Pilih MK —</option>
                  {mk.map(m => <option key={m.id} value={m.id}>{m.kode_mk} – {m.nama_mk}</option>)}
                </select>
                {formData.mk_id && !editData && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>
                      Sisa bobot tersedia: <strong style={{ color: '#27ae60' }}>{(1 - getMkTotal(formData.mk_id)).toFixed(4)}</strong>
                    </div>
                    <WeightBar mkId={formData.mk_id} />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  CPL <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                {editData ? (
                  <input className="input-field" value={getCplCode(formData.cpl_id)} disabled />
                ) : (
                  <select
                    className="select-field"
                    value={formData.cpl_id}
                    onChange={e => setFormData({ ...formData, cpl_id: e.target.value })}
                    required
                  >
                    <option value="">— Pilih CPL —</option>
                    {availableCpl(formData.mk_id, formData.cpl_id).map(c => (
                      <option key={c.id} value={c.id}>{c.kode_cpl} – {c.deskripsi.slice(0, 60)}</option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Bobot Kontribusi <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  max="1"
                  className="input-field"
                  placeholder="Contoh: 0.6"
                  value={formData.bobot}
                  onChange={e => setFormData({ ...formData, bobot: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Masukkan Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
