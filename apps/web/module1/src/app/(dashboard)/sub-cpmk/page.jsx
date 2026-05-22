'use client';
import { useState, useEffect } from 'react';
import { SubCpmkAPI, MkCplAPI, MKAPI, CPLAPI, ProdiAPI } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function SubCpmkPage() {
  const [prodi, setProdi] = useState([]);
  const [mk, setMk] = useState([]);
  const [cpl, setCpl] = useState([]);
  const [mkcpl, setMkcpl] = useState([]);
  const [subCpmkServer, setSubCpmkServer] = useState([]); // from server
  
  const [draftSubCpmk, setDraftSubCpmk] = useState({}); // mk_cpl_id -> array of subcpmks
  
  const [filterProdi, setFilterProdi] = useState('');
  const [filterMk, setFilterMk] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ mk_cpl_id: '', kode_sub_cpmk: '', deskripsi: '', bobot: '' });
  
  const [savingMkCplId, setSavingMkCplId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodiData, mkData, cplData, mkcplData, subData] = await Promise.all([
        ProdiAPI.list(), MKAPI.list(), CPLAPI.list(), MkCplAPI.listAll(), SubCpmkAPI.listAll()
      ]);
      setProdi(prodiData || []);
      setMk(mkData || []);
      setCpl(cplData || []);
      setMkcpl(mkcplData || []);
      
      const serverSubs = subData || [];
      setSubCpmkServer(serverSubs);
      
      const drafts = {};
      serverSubs.forEach(s => {
        if (!drafts[s.mk_cpl_id]) drafts[s.mk_cpl_id] = [];
        drafts[s.mk_cpl_id].push({ ...s });
      });
      setDraftSubCpmk(drafts);
    } catch (err) { toast(err.message, 'error'); }
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  const filteredMk = mk.filter(m => !filterProdi || m.prodi_id === filterProdi);
  const displayMk = filterMk ? filteredMk.filter(m => m.id === filterMk) : filteredMk;

  const getMkCpls = (mkId) => mkcpl.filter(m => m.mk_id === mkId);
  const getCplCode = (id) => cpl.find(c => c.id === id)?.kode_cpl || '—';
  
  const getTotalBobot = (mkcplId) => {
    const subs = draftSubCpmk[mkcplId] || [];
    return subs.reduce((a, s) => a + Number(s.bobot), 0);
  };

  const openAdd = (mkcplId = '') => {
    setEditData(null);
    setForm({ mk_cpl_id: mkcplId, kode_sub_cpmk: '', deskripsi: '', bobot: '' });
    setModal(true);
  };
  const openEdit = (mkcplId, index) => {
    const row = draftSubCpmk[mkcplId][index];
    setEditData({ mkcplId, index });
    setForm({ mk_cpl_id: row.mk_cpl_id, kode_sub_cpmk: row.kode_sub_cpmk, deskripsi: row.deskripsi || '', bobot: String(row.bobot) });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditData(null); };

  const handleSaveLocal = (e) => {
    e.preventDefault();
    const bobot = parseFloat(form.bobot);
    if (isNaN(bobot) || bobot <= 0 || bobot > 1) {
      toast('Bobot harus antara 0.0001 dan 1.0', 'error'); return;
    }
    
    setDraftSubCpmk(prev => {
      const updated = { ...prev };
      if (!updated[form.mk_cpl_id]) {
        updated[form.mk_cpl_id] = [];
      } else {
        updated[form.mk_cpl_id] = [...updated[form.mk_cpl_id]];
      }
      
      if (editData !== null) {
        updated[form.mk_cpl_id][editData.index] = { ...form, bobot };
      } else {
        updated[form.mk_cpl_id].push({ ...form, bobot, id: 'temp-' + Date.now() });
      }
      return updated;
    });
    
    closeModal();
  };

  const handleDeleteLocal = (mkcplId, index) => {
    setDraftSubCpmk(prev => {
      const updated = { ...prev };
      if (updated[mkcplId]) {
        updated[mkcplId] = [...updated[mkcplId]];
        updated[mkcplId].splice(index, 1);
      }
      return updated;
    });
  };
  
  const handleSaveToServer = async (mkcplId) => {
    const subCpmks = draftSubCpmk[mkcplId] || [];
    
    setSavingMkCplId(mkcplId);
    try {
      await SubCpmkAPI.saveBatch(mkcplId, subCpmks);
      toast('Sub-CPMK berhasil disimpan ke server!', 'success');
      loadData();
    } catch (err) {
      toast(err.message, 'error');
    }
    setSavingMkCplId(null);
  };

  const WeightBar = ({ mkcplId }) => {
    const total = getTotalBobot(mkcplId);
    const pct = Math.min(total * 100, 100);
    const over = total > 1.0001;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
          <span style={{ color: over ? '#e74c3c' : '#6b7280' }}>Σ bobot</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: over ? '#e74c3c' : (Math.abs(total - 1.0) <= 0.0001) ? '#27ae60' : '#212121' }}>
            {total > 0 ? total.toFixed(4) : '0.0000'} {(Math.abs(total - 1.0) <= 0.0001) && !over ? '✅' : over ? '⚠️' : ''}
          </span>
        </div>
        <div className="weight-bar">
          <div className={`weight-bar-fill${over ? ' over' : ''}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  const mkcplOptions = mkcpl.filter(m => {
    if (!filterMk) return filteredMk.some(mk2 => mk2.id === m.mk_id);
    return m.mk_id === filterMk;
  });

  return (
    <div>
      <div style={{ background: '#f0f4f9', border: '1px solid #D8DFE9', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13 }}>
        💡 <strong>Aturan:</strong> Pengisian bobot per CPL bebas (tidak wajib 1.0). Yang harus bernilai <strong>1.0</strong> adalah jumlah bobot dari <strong>keseluruhan Sub-CPMK dalam 1 Mata Kuliah</strong>.
      </div>

      <div className="toolbar" style={{ flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select className="filter-select" value={filterProdi} onChange={e => { setFilterProdi(e.target.value); setFilterMk(''); }}>
            <option value="">Semua Prodi</option>
            {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
          <select className="filter-select" value={filterMk} onChange={e => setFilterMk(e.target.value)}>
            <option value="">Semua MK</option>
            {filteredMk.map(m => <option key={m.id} value={m.id}>{m.kode_mk} – {m.nama_mk}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#f0f4f9', padding: 4, borderRadius: 8, border: '1px solid #D8DFE9' }}>
            <button className={`btn btn-sm ${viewMode === 'matrix' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('matrix')} style={{ border: 'none' }}>Matrix</button>
            <button className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('table')} style={{ border: 'none' }}>Table</button>
          </div>
          <button className="btn btn-primary" onClick={() => openAdd()} disabled={mkcpl.length === 0}>＋ Tambah Sub-CPMK</button>
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : displayMk.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">Belum ada Mata Kuliah</div>
            <div className="empty-state-text">Pastikan MK sudah dipetakan ke CPL terlebih dahulu</div>
            <a href="/mapping" className="btn btn-primary"> Ke Pemetaan MK–CPL</a>
          </div>
        </div>
      ) : (
        displayMk.map(m => {
          const mkCpls = getMkCpls(m.id);
          if (mkCpls.length === 0) return (
            <div key={m.id} className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <div>
                  <span className="badge badge-blue" style={{ fontFamily: 'monospace', marginRight: 8 }}>{m.kode_mk}</span>
                  <span style={{ fontWeight: 700 }}>{m.nama_mk}</span>
                </div>
              </div>
              <div style={{ padding: '16px 24px', color: '#9ca3af', fontSize: 13 }}>
                MK ini belum dipetakan ke CPL manapun. <a href="/mapping" style={{ color: '#2d5986' }}>Petakan sekarang →</a>
              </div>
            </div>
          );

          return (
            <div key={m.id} className="card" style={{ marginBottom: 20 }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>{m.kode_mk}</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{m.nama_mk}</span>
                  <span className="badge badge-gray">{m.sks} SKS · Sem {m.semester}</span>
                </div>
              </div>

              {/* WARNING BANNER */}
              {(() => {
                const mkTotal = mkCpls.reduce((s, mc) => s + getTotalBobot(mc.id), 0);
                if (mkTotal > 1.0001) {
                  return (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 16px', margin: '0 24px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>⚠️</span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          Peringatan: Total keseluruhan bobot Sub-CPMK untuk Mata Kuliah ini melebihi 1.00 ({mkTotal.toFixed(4)})
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {viewMode === 'matrix' ? (() => {
                const allSubCpmks = [];
                mkCpls.forEach(mc => {
                  const subs = draftSubCpmk[mc.id] || [];
                  subs.forEach(sub => allSubCpmks.push({ ...sub, cpl_id: mc.cpl_id }));
                });
                
                return (
                  <div className="table-wrapper" style={{ margin: '0', borderRadius: 0, border: 'none', borderTop: '1px solid #f3f4f6' }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ background: '#F6F5FA' }}>{m.kode_mk}</th>
                          {mkCpls.map(mc => (
                            <th key={mc.id} style={{ textAlign: 'center', background: '#F6F5FA' }}>{getCplCode(mc.cpl_id)}</th>
                          ))}
                          <th style={{ textAlign: 'center', background: '#EFFDA3', color: '#212121' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allSubCpmks.map((sub, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{sub.kode_sub_cpmk}</td>
                            {mkCpls.map(mc => (
                              <td key={mc.id} style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 14 }}>
                                {sub.cpl_id === mc.cpl_id ? Number(sub.bobot).toFixed(4) : null}
                              </td>
                            ))}
                            <td style={{ textAlign: 'center', fontWeight: 800, fontFamily: 'monospace', fontSize: 14, background: '#EFFDA3' }}>
                              {Number(sub.bobot).toFixed(4)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td style={{ fontWeight: 800, background: '#EFFDA3', color: '#212121' }}>Total</td>
                          {mkCpls.map(mc => {
                            const colTotal = getTotalBobot(mc.id);
                            return (
                              <td key={mc.id} style={{ textAlign: 'center', fontWeight: 800, fontFamily: 'monospace', fontSize: 14, background: '#EFFDA3', color: '#212121' }}>
                                {colTotal > 0 ? colTotal.toFixed(4) : '-'}
                              </td>
                            );
                          })}
                          <td style={{ textAlign: 'center', fontWeight: 800, fontFamily: 'monospace', fontSize: 14, background: '#EFFDA3', color: '#212121' }}>
                            {mkCpls.reduce((s, mc) => s + getTotalBobot(mc.id), 0).toFixed(4)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })() : mkCpls.map(mc => {
                const subList = draftSubCpmk[mc.id] || [];
                return (
                  <div key={mc.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    {/* MK-CPL Header */}
                    <div style={{ padding: '14px 24px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span className="badge badge-green" style={{ fontFamily: 'monospace' }}>{getCplCode(mc.cpl_id)}</span>
                          <span style={{ fontSize: 13, color: '#4b5563' }}>{cpl.find(c => c.id === mc.cpl_id)?.deskripsi?.slice(0, 70)}…</span>
                          <span style={{ fontSize: 12, color: '#9ca3af' }}>Bobot MK→CPL: <strong>{Number(mc.bobot).toFixed(4)}</strong></span>
                        </div>
                        <WeightBar mkcplId={mc.id} />
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openAdd(mc.id)}>＋ Tambah Sub-CPMK</button>
                        <button className="btn btn-sm btn-success" onClick={() => handleSaveToServer(mc.id)} disabled={savingMkCplId === mc.id}>
                          {savingMkCplId === mc.id ? '⏳ Menyimpan...' : '💾 Simpan ke Database'}
                        </button>
                      </div>
                    </div>

                    {/* Sub-CPMK Table */}
                    {subList.length === 0 ? (
                      <div style={{ padding: '12px 24px', color: '#9ca3af', fontSize: 13 }}>Belum ada Sub-CPMK untuk pasangan ini</div>
                    ) : (
                      <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
                        <table>
                          <thead><tr><th>Kode Sub-CPMK</th><th>Deskripsi</th><th>Bobot</th><th>% Kontribusi</th><th>Aksi</th></tr></thead>
                          <tbody>
                            {subList.map((sub, index) => (
                              <tr key={sub.id || index}>
                                <td><span className="badge badge-yellow" style={{ fontFamily: 'monospace' }}>{sub.kode_sub_cpmk}</span></td>
                                <td style={{ fontSize: 13 }}>{sub.deskripsi || <span style={{ color: '#9ca3af' }}>—</span>}</td>
                                <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{Number(sub.bobot).toFixed(4)}</span></td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 80, height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                                      <div style={{ width: `${Number(sub.bobot) * 100}%`, height: '100%', background: '#EFFDA3', borderRadius: 99 }} />
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{(Number(sub.bobot) * 100).toFixed(1)}%</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="table-actions">
                                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(mc.id, index)}>✏️ Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteLocal(mc.id, index)}>🗑️</button>
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
              })}
            </div>
          );
        })
      )}

      <Modal open={modal} onClose={closeModal} title={editData ? '✏️ Edit Sub-CPMK' : '➕ Tambah Sub-CPMK'}>
        <form onSubmit={handleSaveLocal}>
          <div className="form-group">
            <label className="form-label required">Pasangan MK–CPL</label>
            <select className="form-control" value={form.mk_cpl_id} onChange={e => setForm({...form, mk_cpl_id: e.target.value})} required disabled={!!editData}>
              <option value="">— Pilih MK–CPL —</option>
              {mkcplOptions.map(mc => {
                const mkObj = mk.find(m => m.id === mc.mk_id);
                const cplObj = cpl.find(c => c.id === mc.cpl_id);
                return <option key={mc.id} value={mc.id}>{mkObj?.nama_mk} ({mkObj?.kode_mk}) → {cplObj?.kode_cpl}</option>;
              })}
            </select>
            {form.mk_cpl_id && !editData && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                Sisa bobot tersedia: <strong style={{ color: '#27ae60' }}>{(1 - getTotalBobot(form.mk_cpl_id)).toFixed(4)}</strong>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label required">Kode Sub-CPMK</label>
            <input className="form-control" placeholder="Contoh: SUB-01" value={form.kode_sub_cpmk} onChange={e => setForm({...form, kode_sub_cpmk: e.target.value})} required maxLength={30} />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-control" rows={3} placeholder="Deskripsikan sub-capaian ini..." value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label required">Bobot Kontribusi</label>
            <input type="number" step="0.0001" min="0.0001" max="1" className="form-control" placeholder="Contoh: 0.5" value={form.bobot} onChange={e => setForm({...form, bobot: e.target.value})} required />
          </div>
          <div className="modal-footer" style={{ margin: '0 -24px -20px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Batal</button>
            <button type="submit" className="btn btn-primary">➕ Simpan Sub-CPMK</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
