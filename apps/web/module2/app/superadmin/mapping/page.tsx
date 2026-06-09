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
    <div className="sa-page">
      <ToastContainer />

      <div className="sa-page-header">
        <h1 className="sa-page-title">Pemetaan MK-CPL</h1>
        <p className="sa-page-subtitle">Petakan mata kuliah ke capaian pembelajaran lulusan</p>
      </div>

      <div className="sa-alert" style={{ background: '#f0f7ee', border: '1px solid #CFDECA', marginBottom: '20px' }}>
        💡 <strong>Aturan:</strong> Total bobot semua CPL yang dipetakan ke satu MK harus = <strong>1.0</strong>. Tambahkan pemetaan, lalu klik <strong>Simpan ke Database</strong>.
      </div>

      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <select className="sa-form-control" value={filterProdi} onChange={e => { setFilterProdi(e.target.value); setFilterMk(''); }}>
            <option value="">Semua Prodi</option>
            {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
          <select className="sa-form-control" value={filterMk} onChange={e => setFilterMk(e.target.value)}>
            <option value="">Semua MK</option>
            {filteredMk.map(m => <option key={m.id} value={m.id}>{m.kode_mk} – {m.nama_mk}</option>)}
          </select>
        </div>
        <div className="sa-toolbar-right">
          <div style={{ display: 'flex', background: '#f0f4f9', padding: '4px', borderRadius: '8px', border: '1px solid #D8DFE9' }}>
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
          <button className="sa-btn sa-btn-primary" onClick={() => openAdd(filterMk)} disabled={mk.length === 0}>
            <span>➕</span>
            <span>Tambah Pemetaan</span>
          </button>
        </div>
      </div>

      {overMk.length > 0 && (
        <div className="sa-alert sa-alert-warning" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span style={{ fontWeight: '600', fontSize: '13px', lineHeight: '1.5' }}>
            Peringatan: Total bobot melebihi 1.00 pada MK: {overMk.map(m => m.kode_mk).join(', ')}
          </span>
        </div>
      )}

      {loading ? (
        <div className="sa-empty">
          <p>⏳ Memuat data...</p>
        </div>
      ) : displayMk.length === 0 ? (
        <div className="sa-card">
          <div className="sa-empty">
            <p className="sa-empty-title">🔗 Belum ada Mata Kuliah</p>
            <p className="sa-empty-subtitle">Tambahkan mata kuliah terlebih dahulu</p>
          </div>
        </div>
      ) : viewMode === 'matrix' ? (
        <div className="sa-card">
          <div className="sa-card-header">
            <div className="sa-card-title">Matrix Pemetaan MK–CPL</div>
          </div>
          <div className="sa-table-wrapper" style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <table className="sa-table" style={{ minWidth: 'max-content' }}>
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
            <div key={m.id} className="sa-card" style={{ marginBottom: '16px' }}>
              <div className="sa-card-header" style={{ padding: '16px 20px' }}>
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
                  <button className="sa-btn sa-btn-sm sa-btn-secondary" onClick={() => openAdd(m.id)} style={{ whiteSpace: 'nowrap' }}>
                    <span>➕</span>
                    <span>CPL</span>
                  </button>
                  <button className="sa-btn sa-btn-sm sa-btn-primary" onClick={() => handleSaveToServer(m.id)} disabled={savingMkId === m.id} style={{ whiteSpace: 'nowrap' }}>
                    <span>{savingMkId === m.id ? '⏳' : '💾'}</span>
                    <span>{savingMkId === m.id ? 'Menyimpan...' : 'Simpan'}</span>
                  </button>
                </div>
              </div>
              
              {mappings.length === 0 ? (
                <div style={{ padding: '16px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px', borderTop: '1px solid #f3f4f6' }}>
                  Belum ada CPL dipetakan ke MK ini
                </div>
              ) : (
                <div className="sa-table-wrapper" style={{ margin: '0', borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', borderTop: '1px solid #f3f4f6' }}>
                  <table className="sa-table">
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
                              <button className="sa-btn sa-btn-sm sa-btn-secondary" onClick={() => openEdit(m.id, index)} style={{ padding: '6px 10px' }}>
                                <span>✏️</span>
                                <span>Edit</span>
                              </button>
                              <button className="sa-btn sa-btn-sm sa-btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDeleteLocal(m.id, index)}>
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
          );
        })
      )}

      {showModal && (
        <div className="sa-modal-overlay" onClick={closeModal}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2 className="sa-modal-title">{editData ? 'Edit Pemetaan' : 'Tambah Pemetaan'}</h2>
              <p className="sa-modal-subtitle">{editData ? 'Ubah bobot pemetaan' : 'Petakan CPL ke mata kuliah'}</p>
            </div>

            <form onSubmit={handleSaveLocal}>
              <div className="sa-modal-body">
                <div className="sa-form-group">
                  <label className="sa-form-label">Mata Kuliah <span style={{ color: '#e74c3c' }}>*</span></label>
                  <select
                    className="sa-form-control"
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

                <div className="sa-form-group">
                  <label className="sa-form-label">CPL <span style={{ color: '#e74c3c' }}>*</span></label>
                  {editData ? (
                    <input className="sa-form-control" value={getCplCode(formData.cpl_id)} disabled />
                  ) : (
                    <select
                      className="sa-form-control"
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

                <div className="sa-form-group">
                  <label className="sa-form-label">Bobot Kontribusi <span style={{ color: '#e74c3c' }}>*</span></label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    max="1"
                    className="sa-form-control"
                    placeholder="Contoh: 0.6"
                    value={formData.bobot}
                    onChange={e => setFormData({ ...formData, bobot: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="sa-modal-footer">
                <button type="button" className="sa-btn sa-btn-ghost" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="sa-btn sa-btn-primary">
                  Masukkan Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
