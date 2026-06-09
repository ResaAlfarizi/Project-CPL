'use client';
import { useState, useEffect } from 'react';
import { MkCplAPI, MKAPI, CPLAPI, ProdiAPI } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function MappingPage() {
  const [mk, setMk] = useState([]);
  const [cpl, setCpl] = useState([]);
  const [prodi, setProdi] = useState([]);
  const [mkcpl, setMkcpl] = useState([]);
  const [filterProdi, setFilterProdi] = useState('');
  const [filterMk, setFilterMk] = useState('');
  const [viewMode, setViewMode] = useState('table');
  
  const [draftMkcpl, setDraftMkcpl] = useState({}); // mk_id -> array of mappings
  
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null); // index of mapping in draft
  const [form, setForm] = useState({ mk_id: '', cpl_id: '', bobot: '' });
  
  const [savingMkId, setSavingMkId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [mkData, cplData, prodiData, mkcplData] = await Promise.all([
        MKAPI.list(), CPLAPI.list(), ProdiAPI.list(), MkCplAPI.listAll()
      ]);
      setMk(mkData || []);
      setCpl(cplData || []);
      setProdi(prodiData || []);
      
      const serverMappings = mkcplData || [];
      setMkcpl(serverMappings);
      
      // Initialize drafts
      const drafts = {};
      serverMappings.forEach(m => {
        if (!drafts[m.mk_id]) drafts[m.mk_id] = [];
        drafts[m.mk_id].push({ ...m });
      });
      setDraftMkcpl(drafts);
    } catch (err) { toast(err.message, 'error'); }
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  const filteredMk = mk.filter(m => !filterProdi || m.prodi_id === filterProdi);
  const displayMk = filterMk ? mk.filter(m => m.id === filterMk) : filteredMk;

  const availableCpl = (mkId, currentCplId = null) => {
    const m = mk.find(x => x.id === mkId);
    if (!m) return [];
    const mappings = draftMkcpl[mkId] || [];
    const mapped = mappings.map(x => x.cpl_id).filter(id => id !== currentCplId);
    return cpl.filter(c => c.prodi_id === m.prodi_id && !mapped.includes(c.id));
  };

  const getMkTotal = (mkId) => {
    const mappings = draftMkcpl[mkId] || [];
    return mappings.reduce((s, m) => s + Number(m.bobot), 0);
  };

  const openAdd = (mkId = '') => {
    setEditData(null);
    setForm({ mk_id: mkId || (filteredMk[0]?.id || ''), cpl_id: '', bobot: '' });
    setModal(true);
  };
  
  const openEdit = (mkId, index) => {
    const row = draftMkcpl[mkId][index];
    setEditData({ mkId, index });
    setForm({ mk_id: row.mk_id, cpl_id: row.cpl_id, bobot: String(row.bobot) });
    setModal(true);
  };
  
  const closeModal = () => { setModal(false); setEditData(null); };

  const handleSaveLocal = (e) => {
    e.preventDefault();
    const bobot = parseFloat(form.bobot);
    if (isNaN(bobot) || bobot <= 0 || bobot > 1) {
      toast('Bobot harus antara 0.0001 dan 1.0', 'error'); return;
    }
    
    setDraftMkcpl(prev => {
      const updated = { ...prev };
      if (!updated[form.mk_id]) {
        updated[form.mk_id] = [];
      } else {
        updated[form.mk_id] = [...updated[form.mk_id]];
      }
      
      if (editData !== null) {
        updated[form.mk_id][editData.index] = { ...form, bobot };
      } else {
        updated[form.mk_id].push({ ...form, bobot, id: 'temp-' + Date.now() });
      }
      return updated;
    });
    
    closeModal();
  };

  const handleDeleteLocal = (mkId, index) => {
    setDraftMkcpl(prev => {
      const updated = { ...prev };
      if (updated[mkId]) {
        updated[mkId] = [...updated[mkId]];
        updated[mkId].splice(index, 1);
      }
      return updated;
    });
  };

  const handleSaveToServer = async (mkId) => {
    const mappings = draftMkcpl[mkId] || [];
    const total = getMkTotal(mkId);
    
    if (mappings.length > 0 && Math.abs(total - 1.0) > 0.0001) {
      toast(`Total bobot saat ini ${total.toFixed(4)}. Harus tepat 1.0!`, 'error');
      return;
    }
    
    setSavingMkId(mkId);
    try {
      await MkCplAPI.saveBatch(mkId, mappings);
      toast('Pemetaan berhasil disimpan ke server!', 'success');
      loadData(); // reload from server
    } catch (err) {
      toast(err.message, 'error');
    }
    setSavingMkId(null);
  };

  const getMkInfo = (id) => mk.find(m => m.id === id);
  const getCplCode = (id) => cpl.find(c => c.id === id)?.kode_cpl || '—';

  const WeightBar = ({ mkId }) => {
    const total = getMkTotal(mkId);
    const pct = Math.min(total * 100, 100);
    const over = total > 1.0001;
    return (
      <div style={{ marginTop: 4 }}>
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

  const matrixCpls = cpl.filter(c => !filterProdi || c.prodi_id === filterProdi).filter(c => {
    return displayMk.some(m => {
      const mappings = draftMkcpl[m.id] || [];
      return mappings.some(map => map.cpl_id === c.id && Number(map.bobot) > 0);
    });
  });

  return (
    <div>
      <div style={{ background: '#f0f7ee', border: '1px solid #CFDECA', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13 }}>
        💡 <strong>Aturan:</strong> Total bobot semua CPL yang dipetakan ke satu MK harus = <strong>1.0</strong>. Tambahkan pemetaan, lalu klik <strong>Simpan ke Database</strong>.
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
          <button className="btn btn-primary" onClick={() => openAdd(filterMk)} disabled={mk.length === 0}>＋ Tambah Pemetaan</button>
        </div>
      </div>

      {/* WARNING BANNER */}
      {(() => {
        const overMk = displayMk.filter(m => {
          const total = (draftMkcpl[m.id] || []).reduce((s, map) => s + Number(map.bobot), 0);
          return total > 1.0001;
        });
        
        if (overMk.length > 0) {
          return (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 18px', marginBottom: 20, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, color: '#b91c1c' }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                Peringatan: Total bobot Pemetaan MK–CPL melebihi 1.00 pada Mata Kuliah: {overMk.map(m => m.kode_mk).join(', ')}
              </span>
            </div>
          );
        }
        return null;
      })()}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : displayMk.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔗</div>
            <div className="empty-state-title">Belum ada Mata Kuliah</div>
            <div className="empty-state-text">Tambahkan mata kuliah terlebih dahulu</div>
            <a href="/matakuliah" className="btn btn-primary">→ Ke Mata Kuliah</a>
          </div>
        </div>
      ) : viewMode === 'matrix' ? (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🧮 Matrix Pemetaan MK–CPL</div>
          </div>
          <div className="table-wrapper" style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <table style={{ minWidth: 'max-content' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', top: 0, left: 0, zIndex: 10, background: '#F6F5FA', boxShadow: 'inset -1px -1px 0 var(--alice-blue)' }}>Mata Kuliah</th>
                  {matrixCpls.map(c => (
                    <th key={c.id} style={{ textAlign: 'center', position: 'sticky', top: 0, background: '#F6F5FA', zIndex: 5, boxShadow: 'inset 0 -1px 0 var(--alice-blue)' }}>{c.kode_cpl}</th>
                  ))}
                  <th style={{ textAlign: 'center', position: 'sticky', top: 0, background: '#F6F5FA', zIndex: 5, boxShadow: 'inset 0 -1px 0 var(--alice-blue)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {displayMk.map(m => {
                  const mappings = draftMkcpl[m.id] || [];
                  const rowTotal = mappings.reduce((s, map) => s + Number(map.bobot), 0);
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 700, position: 'sticky', left: 0, background: '#fff', zIndex: 2, boxShadow: 'inset -1px 0 0 var(--alice-blue)' }}>
                        <div style={{ fontSize: 13 }}>{m.kode_mk}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{m.nama_mk}</div>
                      </td>
                      {matrixCpls.map(c => {
                        const map = mappings.find(x => x.cpl_id === c.id);
                        return (
                          <td key={c.id} style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 14 }}>
                            {map ? Number(map.bobot).toFixed(4) : null}
                          </td>
                        );
                      })}
                      <td style={{ textAlign: 'center', fontWeight: 800, fontFamily: 'monospace', fontSize: 14, color: Math.abs(rowTotal - 1) <= 0.0001 ? '#27ae60' : rowTotal > 0 ? '#e74c3c' : '#d1d5db' }}>
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
        displayMk.map(m => {
          const mappings = draftMkcpl[m.id] || [];
          return (
            <div key={m.id} className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>{m.kode_mk}</span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{m.nama_mk}</span>
                    <span className="badge badge-gray">{m.sks} SKS</span>
                    <span className="badge badge-gray">Sem {m.semester}</span>
                  </div>
                  <WeightBar mkId={m.id} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => openAdd(m.id)}>＋ CPL</button>
                  <button className="btn btn-sm btn-primary" onClick={() => handleSaveToServer(m.id)} disabled={savingMkId === m.id}>
                    {savingMkId === m.id ? '⏳ Menyimpan...' : '💾 Simpan ke Database'}
                  </button>
                </div>
              </div>
              
              {mappings.length === 0 ? (
                <div style={{ padding: '20px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  Belum ada CPL dipetakan ke MK ini
                </div>
              ) : (
                <div className="table-wrapper" style={{ margin: '0 0', borderRadius: 0, border: 'none', borderTop: '1px solid #f3f4f6' }}>
                  <table>
                    <thead><tr><th>Kode CPL</th><th>Deskripsi CPL</th><th>Bobot</th><th>% Kontribusi</th><th>Aksi</th></tr></thead>
                    <tbody>
                      {mappings.map((map, index) => (
                        <tr key={map.id || index}>
                          <td style={{ whiteSpace: 'nowrap' }}><span className="badge badge-green" style={{ fontFamily: 'monospace' }}>{getCplCode(map.cpl_id)}</span></td>
                          <td style={{ fontSize: 13 }}>{cpl.find(c => c.id === map.cpl_id)?.deskripsi?.slice(0, 80) || '—'}</td>
                          <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{Number(map.bobot).toFixed(4)}</span></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 80, height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ width: `${Number(map.bobot) * 100}%`, height: '100%', background: '#CFDECA', borderRadius: 99 }} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{(Number(map.bobot) * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="btn btn-sm btn-secondary" onClick={() => openEdit(m.id, index)}>✏️ Edit</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteLocal(m.id, index)}>🗑️</button>
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

      <Modal open={modal} onClose={closeModal} title={editData ? '✏️ Edit Pemetaan' : '➕ Tambah Pemetaan'}>
        <form onSubmit={handleSaveLocal}>
          <div className="form-group">
            <label className="form-label required">Mata Kuliah</label>
            <select className="form-control" value={form.mk_id} onChange={e => setForm({...form, mk_id: e.target.value, cpl_id: ''})} required disabled={!!editData}>
              <option value="">— Pilih MK —</option>
              {mk.map(m => <option key={m.id} value={m.id}>{m.kode_mk} – {m.nama_mk}</option>)}
            </select>
            {form.mk_id && !editData && (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 3 }}>Sisa bobot tersedia: <strong style={{ color: '#27ae60' }}>{(1 - getMkTotal(form.mk_id)).toFixed(4)}</strong></div>
                <WeightBar mkId={form.mk_id} />
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label required">CPL</label>
            {editData ? (
              <input className="form-control" value={getCplCode(form.cpl_id)} disabled />
            ) : (
              <select className="form-control" value={form.cpl_id} onChange={e => setForm({...form, cpl_id: e.target.value})} required>
                <option value="">— Pilih CPL —</option>
                {availableCpl(form.mk_id, form.cpl_id).map(c => <option key={c.id} value={c.id}>{c.kode_cpl} – {c.deskripsi.slice(0, 60)}</option>)}
              </select>
            )}
          </div>
          <div className="form-group">
            <label className="form-label required">Bobot Kontribusi</label>
            <input type="number" step="0.0001" min="0.0001" max="1" className="form-control" placeholder="Contoh: 0.6" value={form.bobot} onChange={e => setForm({...form, bobot: e.target.value})} required />
          </div>
          <div className="modal-footer" style={{ margin: '0 -24px -20px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Batal</button>
            <button type="submit" className="btn btn-primary">➕ Masukkan Draft</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
