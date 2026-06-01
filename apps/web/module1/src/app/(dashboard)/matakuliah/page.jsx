'use client';
import { useState, useEffect } from 'react';
import { MKAPI, ProdiAPI, CPLAPI, MkCplAPI } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

const EMPTY = { prodi_id: '', kode_mk: '', nama_mk: '', sks: 3, semester: 1 };

export default function MatakuliahPage() {
  const [list, setList] = useState([]);
  const [prodi, setProdi] = useState([]);
  const [mkcpl, setMkcpl] = useState([]);
  const [filterProdi, setFilterProdi] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [del, setDel] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [mkData, prodiData, mkcplData] = await Promise.all([MKAPI.list(), ProdiAPI.list(), MkCplAPI.listAll()]);
      setList(mkData || []);
      setProdi(prodiData || []);
      setMkcpl(mkcplData || []);
    } catch (err) { toast(err.message, 'error'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const semList = [...new Set(list.map(m => m.semester))].sort((a,b) => a - b);
  const filtered = list.filter(m =>
    (!filterProdi || m.prodi_id === filterProdi) &&
    (!filterSem || String(m.semester) === filterSem) &&
    (m.kode_mk.toLowerCase().includes(search.toLowerCase()) || m.nama_mk.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setEditData(null); setForm({ ...EMPTY, prodi_id: filterProdi || (prodi[0]?.id || '') }); setModal(true); };
  const openEdit = (row) => { setEditData(row); setForm({ prodi_id: row.prodi_id, kode_mk: row.kode_mk, nama_mk: row.nama_mk, sks: row.sks, semester: row.semester }); setModal(true); };
  const closeModal = () => { setModal(false); setEditData(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editData) { await MKAPI.update(editData.id, form); toast('Mata Kuliah diperbarui!', 'success'); }
      else { await MKAPI.create(form); toast('Mata Kuliah ditambahkan!', 'success'); }
      load(); closeModal();
    } catch (err) { toast(err.message, 'error'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try { await MKAPI.delete(del.id); toast('Mata Kuliah dihapus.', 'success'); load(); setDel(null); }
    catch (err) { toast(err.message, 'error'); }
  };

  const getMkCplCount = (mkId) => mkcpl.filter(m => m.mk_id === mkId).length;
  const getProdiCode = (id) => prodi.find(p => p.id === id)?.kode_prodi || '—';
  const semColor = (s) => s <= 2 ? 'badge-blue' : s <= 4 ? 'badge-green' : s <= 6 ? 'badge-yellow' : 'badge-gray';

  return (
    <div>
      {prodi.length === 0 && (
        <div style={{ background: '#fef9e7', border: '1px solid #f9ca7a', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 14 }}>
          ⚠️ Belum ada Program Studi. <a href="/prodi" style={{ color: '#2d5986', fontWeight: 600 }}>Daftarkan dulu →</a>
        </div>
      )}
      <div className="toolbar" style={{ flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Cari kode atau nama MK..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterProdi} onChange={e => setFilterProdi(e.target.value)}>
            <option value="">Semua Prodi</option>
            {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
          <select className="filter-select" value={filterSem} onChange={e => setFilterSem(e.target.value)}>
            <option value="">Semua Semester</option>
            {semList.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openAdd} disabled={prodi.length === 0}>＋ Tambah MK</button>
      </div>

      {/* Summary by Semester */}
      {semList.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {semList.map(s => (
            <div key={s} className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: filterSem === String(s) ? '#D8DFE9' : '#fff' }}
              onClick={() => setFilterSem(filterSem === String(s) ? '' : String(s))}>
              <span style={{ fontWeight: 700 }}>Sem {s}</span>
              <span className={`badge ${semColor(s)}`}>{list.filter(m => m.semester === s).length} MK</span>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div><div className="card-title">📚 Daftar Mata Kuliah</div><div className="card-subtitle">{filtered.length} dari {list.length} mata kuliah</div></div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">Belum ada Mata Kuliah</div>
            <div className="empty-state-text">Tambahkan mata kuliah untuk program studi</div>
            <button className="btn btn-primary" onClick={openAdd} disabled={prodi.length === 0}>＋ Tambah MK</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th style={{ width: 110 }}>Kode MK</th>
                  <th style={{ minWidth: 200 }}>Nama Mata Kuliah</th>
                  <th style={{ width: 100 }}>Prodi</th>
                  <th style={{ width: 80 }}>SKS</th>
                  <th style={{ width: 100 }}>Semester</th>
                  <th style={{ width: 130 }}>CPL Terpetakan</th>
                  <th style={{ width: 140, textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td><span className="badge badge-blue" style={{ fontFamily: 'monospace', fontSize: 11, padding: '4px 8px' }}>{row.kode_mk}</span></td>
                    <td style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.nama_mk}>{row.nama_mk}</td>
                    <td style={{ fontSize: 12 }}>{getProdiCode(row.prodi_id)}</td>
                    <td><span className="badge badge-gray" style={{ fontSize: 11, padding: '4px 8px' }}>{row.sks} SKS</span></td>
                    <td><span className={`badge ${semColor(row.semester)}`} style={{ fontSize: 11, padding: '4px 8px' }}>Sem {row.semester}</span></td>
                    <td>
                      {getMkCplCount(row.id) > 0
                        ? <span className="badge badge-green" style={{ fontSize: 11, padding: '4px 8px' }}>{getMkCplCount(row.id)} CPL</span>
                        : <span className="badge badge-red" style={{ fontSize: 11, padding: '4px 8px' }}>Belum dipetakan</span>}
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(row)} style={{ fontSize: 11, padding: '4px 8px' }}>✏️ Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDel(row)} style={{ fontSize: 11, padding: '4px 8px' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={closeModal} title={editData ? '✏️ Edit Mata Kuliah' : '➕ Tambah Mata Kuliah'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label required">Program Studi</label>
            <select className="form-control" value={form.prodi_id} onChange={e => setForm({...form, prodi_id: e.target.value})} required>
              <option value="">— Pilih Prodi —</option>
              {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Kode MK</label>
              <input className="form-control" placeholder="Contoh: IF101" value={form.kode_mk} onChange={e => setForm({...form, kode_mk: e.target.value})} required maxLength={20} />
            </div>
            <div className="form-group">
              <label className="form-label required">SKS</label>
              <select className="form-control" value={form.sks} onChange={e => setForm({...form, sks: parseInt(e.target.value)})}>
                {[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s} SKS</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label required">Nama Mata Kuliah</label>
            <input className="form-control" placeholder="Contoh: Algoritma & Pemrograman" value={form.nama_mk} onChange={e => setForm({...form, nama_mk: e.target.value})} required maxLength={200} />
          </div>
          <div className="form-group">
            <label className="form-label required">Semester</label>
            <select className="form-control" value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value)})}>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
          <div className="modal-footer" style={{ margin: '0 -24px -20px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : editData ? '💾 Simpan' : '➕ Tambah'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="🗑️ Hapus Mata Kuliah">
        <p style={{ fontSize: 15 }}>Yakin ingin menghapus MK <strong>{del?.nama_mk}</strong>?</p>
        <p style={{ fontSize: 13, color: '#e74c3c', marginTop: 6 }}>⚠️ Semua pemetaan MK-CPL dan Sub-CPMK terkait juga akan dihapus!</p>
        <div className="modal-footer" style={{ margin: '20px -24px -20px', padding: '16px 24px' }}>
          <button className="btn btn-ghost" onClick={() => setDel(null)}>Batal</button>
          <button className="btn btn-danger" onClick={handleDelete}>🗑️ Ya, Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
