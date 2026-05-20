'use client';
import { useState, useEffect } from 'react';
import { ProdiAPI } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

const JENJANG = ['D3','S1','S2','S3'];
const EMPTY = { kode_prodi: '', nama_prodi: '', jenjang: 'S1' };

export default function ProdiPage() {
  const [list, setList] = useState([]);
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
      const data = await ProdiAPI.list();
      setList(data || []);
    } catch (err) {
      toast(err.message, 'error');
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = list.filter(p =>
    p.kode_prodi.toLowerCase().includes(search.toLowerCase()) ||
    p.nama_prodi.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditData(null); setForm(EMPTY); setModal(true); };
  const openEdit = (row) => { setEditData(row); setForm({ kode_prodi: row.kode_prodi, nama_prodi: row.nama_prodi, jenjang: row.jenjang }); setModal(true); };
  const closeModal = () => { setModal(false); setEditData(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editData) { await ProdiAPI.update(editData.id, form); toast('Program studi berhasil diperbarui!', 'success'); }
      else { await ProdiAPI.create(form); toast('Program studi berhasil ditambahkan!', 'success'); }
      load(); closeModal();
    } catch (err) { toast(err.message, 'error'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try { await ProdiAPI.delete(del.id); toast('Program studi dihapus.', 'success'); load(); setDel(null); }
    catch (err) { toast(err.message, 'error'); }
  };

  const JENJANG_COLOR = { D3: 'badge-gray', S1: 'badge-blue', S2: 'badge-green', S3: 'badge-yellow' };

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Cari prodi..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Tambah Prodi</button>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        {JENJANG.map(j => (
          <div key={j} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#D8DFE9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>{j}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{list.filter(p => p.jenjang === j).length}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Prodi {j}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div><div className="card-title">📋 Daftar Program Studi</div><div className="card-subtitle">{filtered.length} dari {list.length} prodi</div></div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <div className="empty-state-title">Belum ada Program Studi</div>
            <div className="empty-state-text">Mulai dengan menambahkan program studi pertama</div>
            <button className="btn btn-primary" onClick={openAdd}>＋ Tambah Sekarang</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Kode</th><th>Nama Program Studi</th><th>Jenjang</th><th>Dibuat</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td><span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>{row.kode_prodi}</span></td>
                    <td style={{ fontWeight: 600 }}>{row.nama_prodi}</td>
                    <td><span className={`badge ${JENJANG_COLOR[row.jenjang] || 'badge-gray'}`}>{row.jenjang}</span></td>
                    <td style={{ color: '#9ca3af', fontSize: 12 }}>{row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '—'}</td>
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

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={closeModal} title={editData ? '✏️ Edit Program Studi' : '➕ Tambah Program Studi'}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Kode Prodi</label>
              <input className="form-control" placeholder="Contoh: TI-S1" value={form.kode_prodi} onChange={e => setForm({...form, kode_prodi: e.target.value})} required maxLength={20} />
            </div>
            <div className="form-group">
              <label className="form-label required">Jenjang</label>
              <select className="form-control" value={form.jenjang} onChange={e => setForm({...form, jenjang: e.target.value})}>
                {JENJANG.map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label required">Nama Program Studi</label>
            <input className="form-control" placeholder="Contoh: Teknik Informatika" value={form.nama_prodi} onChange={e => setForm({...form, nama_prodi: e.target.value})} required maxLength={150} />
          </div>
          <div className="modal-footer" style={{ margin: '0 -24px -20px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : editData ? '💾 Simpan Perubahan' : '➕ Tambah'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!del} onClose={() => setDel(null)} title="🗑️ Hapus Program Studi">
        <p style={{ fontSize: 15, marginBottom: 8 }}>Yakin ingin menghapus prodi <strong>{del?.nama_prodi}</strong>?</p>
        <p style={{ fontSize: 13, color: '#e74c3c' }}>⚠️ Semua CPL, Mahasiswa, MK, dan data terkait akan ikut terhapus!</p>
        <div className="modal-footer" style={{ margin: '20px -24px -20px', padding: '16px 24px' }}>
          <button className="btn btn-ghost" onClick={() => setDel(null)}>Batal</button>
          <button className="btn btn-danger" onClick={handleDelete}>🗑️ Ya, Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
