'use client';
import { useState, useEffect } from 'react';
import { DosenAPI } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

const EMPTY = { nidn: '', nama: '' };

export default function DosenPage() {
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
      const data = await DosenAPI.list();
      setList(data || []);
    } catch (err) { toast(err.message, 'error'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = list.filter(d =>
    d.nidn.toLowerCase().includes(search.toLowerCase()) ||
    d.nama.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditData(null); setForm(EMPTY); setModal(true); };
  const openEdit = (row) => { setEditData(row); setForm({ nidn: row.nidn, nama: row.nama }); setModal(true); };
  const closeModal = () => { setModal(false); setEditData(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editData) { await DosenAPI.update(editData.id, form); toast('Data dosen diperbarui!', 'success'); }
      else { await DosenAPI.create(form); toast('Dosen berhasil ditambahkan!', 'success'); }
      load(); closeModal();
    } catch (err) { toast(err.message, 'error'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try { await DosenAPI.delete(del.id); toast('Dosen dihapus.', 'success'); load(); setDel(null); }
    catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div>
      <div className="toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Cari NIDN atau nama..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Tambah Dosen</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: '18px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#212121' }}>{list.length}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Total Dosen</div>
        </div>
        <div className="card" style={{ padding: '18px 20px', background: '#f0f4f9', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#2d5986' }}>{filtered.length}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Hasil Pencarian</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div><div className="card-title">👨‍🏫 Daftar Dosen</div><div className="card-subtitle">{filtered.length} dosen</div></div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍🏫</div>
            <div className="empty-state-title">Belum ada Dosen</div>
            <div className="empty-state-text">Daftarkan data dosen ke dalam sistem</div>
            <button className="btn btn-primary" onClick={openAdd}>＋ Tambah Dosen</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>NIDN</th><th>Nama Lengkap</th><th>Aksi</th></tr></thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td><span className="badge badge-blue" style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{row.nidn}</span></td>
                    <td style={{ fontWeight: 600 }}>{row.nama}</td>
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

      <Modal open={modal} onClose={closeModal} title={editData ? '✏️ Edit Dosen' : '➕ Tambah Dosen'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label required">NIDN</label>
            <input className="form-control" placeholder="Contoh: 0101019001" value={form.nidn} onChange={e => setForm({...form, nidn: e.target.value})} required maxLength={20} disabled={!!editData} />
            <div className="form-hint">NIDN tidak dapat diubah setelah disimpan</div>
          </div>
          <div className="form-group">
            <label className="form-label required">Nama Lengkap</label>
            <input className="form-control" placeholder="Contoh: Dr. Ahmad Fauzi, M.Kom" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required maxLength={150} />
          </div>
          <div className="modal-footer" style={{ margin: '0 -24px -20px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : editData ? '💾 Simpan' : '➕ Tambah'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="🗑️ Hapus Dosen">
        <p style={{ fontSize: 15 }}>Yakin ingin menghapus dosen <strong>{del?.nama}</strong> (NIDN: {del?.nidn})?</p>
        <div className="modal-footer" style={{ margin: '20px -24px -20px', padding: '16px 24px' }}>
          <button className="btn btn-ghost" onClick={() => setDel(null)}>Batal</button>
          <button className="btn btn-danger" onClick={handleDelete}>🗑️ Ya, Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
