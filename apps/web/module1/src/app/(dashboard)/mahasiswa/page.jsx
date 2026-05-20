'use client';
import { useState, useEffect } from 'react';
import { MahasiswaAPI, ProdiAPI } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

const EMPTY = { prodi_id: '', nim: '', nama: '', angkatan: new Date().getFullYear() };

export default function MahasiswaPage() {
  const [list, setList] = useState([]);
  const [prodi, setProdi] = useState([]);
  const [filterProdi, setFilterProdi] = useState('');
  const [filterAngkatan, setFilterAngkatan] = useState('');
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
      const [mhsData, prodiData] = await Promise.all([MahasiswaAPI.list(), ProdiAPI.list()]);
      setList(mhsData || []);
      setProdi(prodiData || []);
    } catch (err) { toast(err.message, 'error'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const angkatanList = [...new Set(list.map(m => m.angkatan))].sort((a,b) => b - a);
  const filtered = list.filter(m =>
    (!filterProdi || m.prodi_id === filterProdi) &&
    (!filterAngkatan || String(m.angkatan) === filterAngkatan) &&
    (m.nim.toLowerCase().includes(search.toLowerCase()) || m.nama.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setEditData(null); setForm({ ...EMPTY, prodi_id: filterProdi || (prodi[0]?.id || '') }); setModal(true); };
  const openEdit = (row) => { setEditData(row); setForm({ prodi_id: row.prodi_id, nim: row.nim, nama: row.nama, angkatan: row.angkatan }); setModal(true); };
  const closeModal = () => { setModal(false); setEditData(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const submitData = { ...form };
      if (!editData) submitData.email = `${form.nim}@student.ac.id`;
      if (editData) { await MahasiswaAPI.update(editData.id, submitData); toast('Data mahasiswa diperbarui!', 'success'); }
      else { await MahasiswaAPI.create(submitData); toast('Mahasiswa berhasil ditambahkan!', 'success'); }
      load(); closeModal();
    } catch (err) { toast(err.message, 'error'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try { await MahasiswaAPI.delete(del.id); toast('Mahasiswa dihapus.', 'success'); load(); setDel(null); }
    catch (err) { toast(err.message, 'error'); }
  };

  const getProdiName = (id) => prodi.find(p => p.id === id)?.nama_prodi || '—';
  const getProdiCode = (id) => prodi.find(p => p.id === id)?.kode_prodi || '—';

  const angkatanColors = (a) => {
    const colors = ['badge-blue','badge-green','badge-yellow','badge-gray'];
    return colors[a % colors.length];
  };

  return (
    <div>
      {prodi.length === 0 && (
        <div style={{ background: '#fef9e7', border: '1px solid #f9ca7a', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 14 }}>
          ⚠️ Belum ada Program Studi. <a href="/prodi" style={{ color: '#2d5986', fontWeight: 600 }}>Daftarkan dulu →</a>
        </div>
      )}
      <div className="toolbar" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Cari NIM atau nama..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterProdi} onChange={e => setFilterProdi(e.target.value)}>
            <option value="">Semua Prodi</option>
            {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
          <select className="filter-select" value={filterAngkatan} onChange={e => setFilterAngkatan(e.target.value)}>
            <option value="">Semua Angkatan</option>
            {angkatanList.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openAdd} disabled={prodi.length === 0}>＋ Tambah Mahasiswa</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div><div className="card-title">👨‍🎓 Daftar Mahasiswa</div><div className="card-subtitle">{filtered.length} dari {list.length} mahasiswa</div></div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍🎓</div>
            <div className="empty-state-title">Belum ada Mahasiswa</div>
            <div className="empty-state-text">Daftarkan mahasiswa ke dalam sistem</div>
            <button className="btn btn-primary" onClick={openAdd} disabled={prodi.length === 0}>＋ Tambah Mahasiswa</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>NIM</th><th>Nama</th><th>Program Studi</th><th>Angkatan</th><th>Aksi</th></tr></thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td><span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>{row.nim}</span></td>
                    <td style={{ fontWeight: 600 }}>{row.nama}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>{getProdiName(row.prodi_id)}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{getProdiCode(row.prodi_id)}</div>
                    </td>
                    <td><span className={`badge ${angkatanColors(row.angkatan)}`}>{row.angkatan}</span></td>
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

      <Modal open={modal} onClose={closeModal} title={editData ? '✏️ Edit Mahasiswa' : '➕ Tambah Mahasiswa'}>
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
              <label className="form-label required">NIM</label>
              <input className="form-control" placeholder="Contoh: 2023001001" value={form.nim} onChange={e => setForm({...form, nim: e.target.value})} required maxLength={20} disabled={!!editData} />
            </div>
            <div className="form-group">
              <label className="form-label required">Angkatan</label>
              <input type="number" className="form-control" placeholder="Contoh: 2023" value={form.angkatan} onChange={e => setForm({...form, angkatan: parseInt(e.target.value)})} required min={2000} max={2099} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label required">Nama Lengkap</label>
            <input className="form-control" placeholder="Contoh: Budi Santoso" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required maxLength={150} />
          </div>
          <div className="modal-footer" style={{ margin: '0 -24px -20px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : editData ? '💾 Simpan' : '➕ Tambah'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="🗑️ Hapus Mahasiswa">
        <p style={{ fontSize: 15 }}>Yakin ingin menghapus mahasiswa <strong>{del?.nama}</strong> (NIM: {del?.nim})?</p>
        <div className="modal-footer" style={{ margin: '20px -24px -20px', padding: '16px 24px' }}>
          <button className="btn btn-ghost" onClick={() => setDel(null)}>Batal</button>
          <button className="btn btn-danger" onClick={handleDelete}>🗑️ Ya, Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
