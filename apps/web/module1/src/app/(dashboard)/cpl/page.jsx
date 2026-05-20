'use client';
import { useState, useEffect } from 'react';
import { CPLAPI, ProdiAPI } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

const EMPTY = { prodi_id: '', kode_cpl: '', deskripsi: '', is_active: true };

export default function CPLPage() {
  const [list, setList] = useState([]);
  const [prodi, setProdi] = useState([]);
  const [filterProdi, setFilterProdi] = useState('');
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
      const [cplData, prodiData] = await Promise.all([CPLAPI.list(), ProdiAPI.list()]);
      setList(cplData || []);
      setProdi(prodiData || []);
    } catch (err) {
      toast(err.message, 'error');
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = list.filter(c =>
    (!filterProdi || c.prodi_id === filterProdi) &&
    (c.kode_cpl.toLowerCase().includes(search.toLowerCase()) || c.deskripsi.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setEditData(null); setForm({ ...EMPTY, prodi_id: filterProdi || (prodi[0]?.id || '') }); setModal(true); };
  const openEdit = (row) => { setEditData(row); setForm({ prodi_id: row.prodi_id, kode_cpl: row.kode_cpl, deskripsi: row.deskripsi, is_active: row.is_active }); setModal(true); };
  const closeModal = () => { setModal(false); setEditData(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editData) { await CPLAPI.update(editData.id, form); toast('CPL berhasil diperbarui!', 'success'); }
      else { await CPLAPI.create(form); toast('CPL berhasil ditambahkan!', 'success'); }
      load(); closeModal();
    } catch (err) { toast(err.message, 'error'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try { await CPLAPI.delete(del.id); toast('CPL dihapus.', 'success'); load(); setDel(null); }
    catch (err) { toast(err.message, 'error'); }
  };

  const toggleActive = async (row) => {
    try {
      await CPLAPI.update(row.id, { is_active: !row.is_active });
      toast(`CPL ${row.kode_cpl} ${!row.is_active ? 'diaktifkan' : 'dinonaktifkan'}.`, 'info');
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const getProdiName = (id) => prodi.find(p => p.id === id)?.nama_prodi || '—';

  return (
    <div>
      {prodi.length === 0 && (
        <div style={{ background: '#fef9e7', border: '1px solid #f9ca7a', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 14 }}>
          ⚠️ Belum ada Program Studi. <a href="/prodi" style={{ color: '#2d5986', fontWeight: 600 }}>Daftarkan dulu →</a>
        </div>
      )}
      <div className="toolbar">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Cari CPL..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterProdi} onChange={e => setFilterProdi(e.target.value)}>
            <option value="">Semua Prodi</option>
            {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openAdd} disabled={prodi.length === 0}>＋ Tambah CPL</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div><div className="card-title">🎯 Daftar CPL</div><div className="card-subtitle">{filtered.length} dari {list.length} CPL terdaftar</div></div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <div className="empty-state-title">Belum ada CPL</div>
            <div className="empty-state-text">Tambahkan Capaian Pembelajaran Lulusan untuk prodi Anda</div>
            <button className="btn btn-primary" onClick={openAdd} disabled={prodi.length === 0}>＋ Tambah CPL</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Kode CPL</th><th>Deskripsi</th><th>Program Studi</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td><span className="badge badge-blue" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{row.kode_cpl}</span></td>
                    <td style={{ maxWidth: 360, fontSize: 13 }}>{row.deskripsi}</td>
                    <td><span style={{ fontSize: 13, color: '#4b5563' }}>{getProdiName(row.prodi_id)}</span></td>
                    <td>
                      <button onClick={() => toggleActive(row)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: row.is_active ? '#27ae60' : '#9ca3af' }}>
                        {row.is_active ? '✅ Aktif' : '⭕ Nonaktif'}
                      </button>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(row)}>✏️ Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDel(row)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={closeModal} title={editData ? '✏️ Edit CPL' : '➕ Tambah CPL'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label required">Program Studi</label>
            <select className="form-control" value={form.prodi_id} onChange={e => setForm({...form, prodi_id: e.target.value})} required>
              <option value="">— Pilih Prodi —</option>
              {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label required">Kode CPL</label>
            <input className="form-control" placeholder="Contoh: CPL-01" value={form.kode_cpl} onChange={e => setForm({...form, kode_cpl: e.target.value})} required maxLength={20} />
          </div>
          <div className="form-group">
            <label className="form-label required">Deskripsi CPL</label>
            <textarea className="form-control" rows={3} placeholder="Deskripsikan capaian pembelajaran..." value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} required />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} style={{ width: 16, height: 16 }} />
            <label htmlFor="is_active" style={{ fontSize: 14, cursor: 'pointer' }}>CPL aktif</label>
          </div>
          <div className="modal-footer" style={{ margin: '0 -24px -20px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : editData ? '💾 Simpan' : '➕ Tambah'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="🗑️ Hapus CPL">
        <p style={{ fontSize: 15 }}>Yakin ingin menghapus CPL <strong>{del?.kode_cpl}</strong>?</p>
        <p style={{ fontSize: 13, color: '#e74c3c', marginTop: 6 }}>⚠️ Semua pemetaan MK-CPL dan Sub-CPMK terkait juga akan dihapus!</p>
        <div className="modal-footer" style={{ margin: '20px -24px -20px', padding: '16px 24px' }}>
          <button className="btn btn-ghost" onClick={() => setDel(null)}>Batal</button>
          <button className="btn btn-danger" onClick={handleDelete}>🗑️ Ya, Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
