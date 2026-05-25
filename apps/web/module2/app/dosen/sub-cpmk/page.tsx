'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import ToastContainer, { showToast } from '@/components/Toast';
import { subCpmkApi, kelasApi, mkCplApi } from '@/lib/api';

interface SubCpmk {
  id: string;
  kode_sub_cpmk: string;
  deskripsi: string;
  bobot: number;
  mk_cpl_id: string;
  kode_mk?: string;
  nama_mk?: string;
  kode_cpl?: string;
}

interface MkCpl {
  id: string;
  mk_id: string;
  cpl_id: string;
  bobot: number;
  kode_mk: string;
  nama_mk: string;
  kode_cpl: string;
  deskripsi_cpl?: string;
}

interface Kelas {
  id: string;
  mk_id: string;
  nama_mk?: string;
  kode_mk?: string;
  nama_kelas?: string;
}

export default function SubCpmkPage() {
  const [subCpmkList, setSubCpmkList] = useState<SubCpmk[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mkCplList, setMkCplList] = useState<MkCpl[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SubCpmk | null>(null);
  const [formData, setFormData] = useState({ mk_cpl_id: '', kode_sub_cpmk: '', deskripsi: '', bobot: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, kelasRes, mkCplRes] = await Promise.all([
        subCpmkApi.getMySubCpmk(), // Changed from getAll() to getMySubCpmk()
        kelasApi.getMyClasses(),
        mkCplApi.getMyMkCpl(),
      ]);
      setSubCpmkList(subRes.data || []);
      setKelasList(kelasRes.data || []);
      setMkCplList(mkCplRes.data || []);
    } catch {
      setSubCpmkList([]);
      setKelasList([]);
      setMkCplList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = subCpmkList.filter(s =>
    (s.kode_sub_cpmk || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.deskripsi || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.nama_mk || '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditItem(null);
    setFormData({ mk_cpl_id: '', kode_sub_cpmk: '', deskripsi: '', bobot: '' });
    setShowModal(true);
  };

  const openEdit = (item: SubCpmk) => {
    setEditItem(item);
    setFormData({
      mk_cpl_id: item.mk_cpl_id,
      kode_sub_cpmk: item.kode_sub_cpmk,
      deskripsi: item.deskripsi || '',
      bobot: String(item.bobot),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        mk_cpl_id: formData.mk_cpl_id,
        kode_sub_cpmk: formData.kode_sub_cpmk,
        deskripsi: formData.deskripsi,
        bobot: parseFloat(formData.bobot),
      };
      if (editItem) {
        await subCpmkApi.update(editItem.id, payload);
        showToast('Sub-CPMK berhasil diupdate', 'success');
      } else {
        await subCpmkApi.create(payload);
        showToast('Sub-CPMK berhasil ditambahkan', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Sub-CPMK</h1>
        <p className="page-subtitle">Kelola Sub-CPMK untuk mata kuliah yang Anda ampu</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Cari Sub-CPMK..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ background: '#fff', maxWidth: '320px' }}
        />
        <button className="btn btn-accent" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah Sub-CPMK
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ width: '300px', height: '16px', margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Belum ada Sub-CPMK</p>
            <p>Klik tombol "Tambah Sub-CPMK" untuk menambahkan</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Deskripsi</th>
                <th>Bobot</th>
                <th>Mata Kuliah</th>
                <th>CPL</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td><span className="badge badge-dark">{s.kode_sub_cpmk}</span></td>
                  <td style={{ maxWidth: '300px' }}>{s.deskripsi || '-'}</td>
                  <td><span className="badge badge-yellow">{(s.bobot * 100).toFixed(1)}%</span></td>
                  <td>{s.nama_mk || s.kode_mk || '-'}</td>
                  <td><span className="badge badge-blue">{s.kode_cpl || '-'}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Sub-CPMK' : 'Tambah Sub-CPMK'}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Mata Kuliah → CPL <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                className="select-field"
                value={formData.mk_cpl_id}
                onChange={(e) => setFormData({ ...formData, mk_cpl_id: e.target.value })}
                required
              >
                <option value="">-- Pilih MK dan CPL --</option>
                {mkCplList.map((mc) => (
                  <option key={mc.id} value={mc.id}>
                    {mc.nama_mk} ({mc.kode_mk}) → {mc.kode_cpl} (Bobot: {(mc.bobot * 100).toFixed(0)}%)
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {editItem ? '⚠️ Mengubah MK-CPL akan memindahkan Sub-CPMK ke pemetaan yang berbeda' : 'Pilih pemetaan Mata Kuliah ke CPL yang sesuai'}
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Kode Sub-CPMK <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                className="input-field"
                value={formData.kode_sub_cpmk}
                onChange={(e) => setFormData({ ...formData, kode_sub_cpmk: e.target.value })}
                placeholder="Contoh: SCPL-01"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Deskripsi</label>
              <textarea
                className="input-field"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Deskripsi sub-CPMK"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Bobot (0-1) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="1"
                className="input-field"
                value={formData.bobot}
                onChange={(e) => setFormData({ ...formData, bobot: e.target.value })}
                placeholder="Contoh: 0.25 (25%)"
                required
              />
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                ⚠️ Total bobot semua Sub-CPMK untuk MK-CPL yang sama harus = 1.0 (100%)
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editItem ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
