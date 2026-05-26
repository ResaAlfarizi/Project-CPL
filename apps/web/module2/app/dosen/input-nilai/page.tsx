'use client';

import { useEffect, useState } from 'react';
import ToastContainer, { showToast } from '@/components/Toast';
import { kelasApi, nilaiApi, enrollmentApi, subCpmkApi } from '@/lib/api';

interface Kelas {
  id: string;
  nama_kelas: string;
  nama_mk?: string;
  kode_mk?: string;
  mk_id?: string;
  tahun_akademik: string;
  semester_aktif: number;
}

interface NilaiItem {
  id: string;
  enrollment_id: string;
  sub_cpmk_id: string;
  nilai: number;
  nama_mahasiswa?: string;
  nim?: string;
  kode_sub_cpmk?: string;
  input_at?: string;
}

interface Enrollment {
  id: string;
  mahasiswa_id: string;
  nama_mahasiswa?: string;
  nim?: string;
}

interface SubCpmk {
  id: string;
  kode_sub_cpmk: string;
  deskripsi?: string;
}

export default function InputNilaiPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [nilaiList, setNilaiList] = useState<NilaiItem[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [subCpmks, setSubCpmks] = useState<SubCpmk[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNilai, setLoadingNilai] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for new input
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ enrollment_id: '', sub_cpmk_id: '', nilai: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editNilai, setEditNilai] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await kelasApi.getMyClasses();
        setKelasList(res.data || []);
      } catch { setKelasList([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedKelas) {
      setNilaiList([]);
      setEnrollments([]);
      setSubCpmks([]);
      return;
    }
    const loadKelasData = async () => {
      setLoadingNilai(true);
      try {
        const [nilaiRes, enrollRes] = await Promise.all([
          nilaiApi.getByKelas(selectedKelas).catch(() => ({ data: [] })),
          enrollmentApi.getByKelas(selectedKelas).catch(() => ({ data: [] })),
        ]);
        setNilaiList(nilaiRes.data || []);
        setEnrollments(enrollRes.data || []);

        // Load sub-cpmk for the MK of this kelas
        const kelas = kelasList.find(k => k.id === selectedKelas);
        if (kelas?.mk_id) {
          const subRes = await subCpmkApi.getByMk(kelas.mk_id).catch(() => ({ data: [] }));
          setSubCpmks(subRes.data || []);
        }
      } catch {
        setNilaiList([]);
      } finally {
        setLoadingNilai(false);
      }
    };
    loadKelasData();
  }, [selectedKelas, kelasList]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await nilaiApi.create({
        enrollment_id: formData.enrollment_id,
        sub_cpmk_id: formData.sub_cpmk_id,
        nilai: parseFloat(formData.nilai),
      });
      showToast('Nilai berhasil disimpan', 'success');
      setShowForm(false);
      setFormData({ enrollment_id: '', sub_cpmk_id: '', nilai: '' });
      // Reload
      const res = await nilaiApi.getByKelas(selectedKelas);
      setNilaiList(res.data || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      await nilaiApi.update(id, { nilai: parseFloat(editNilai) });
      showToast('Nilai berhasil diupdate', 'success');
      setEditId(null);
      const res = await nilaiApi.getByKelas(selectedKelas);
      setNilaiList(res.data || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal update', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectedKelasInfo = kelasList.find(k => k.id === selectedKelas);

  return (
    <>
      <ToastContainer />
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Input Nilai Sub-CPMK</h1>
        <p className="page-subtitle">Input dan edit nilai mahasiswa untuk kelas yang Anda ampu</p>
      </div>

      {/* Kelas Selector */}
      <div className="animate-fade-in stagger-1" style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--eerie-black)' }}>
          Pilih Kelas
        </label>
        {loading ? (
          <div className="skeleton" style={{ height: '42px', maxWidth: '400px' }} />
        ) : (
          <select
            className="select-field"
            style={{ maxWidth: '400px' }}
            value={selectedKelas}
            onChange={(e) => { setSelectedKelas(e.target.value); setShowForm(false); setEditId(null); }}
          >
            <option value="">-- Pilih Kelas --</option>
            {kelasList.map(k => (
              <option key={k.id} value={k.id}>
                {k.nama_mk || k.kode_mk || 'MK'} — {k.nama_kelas || 'Kelas'} ({k.tahun_akademik} Sem {k.semester_aktif})
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedKelas && (
        <>
          {/* Info & Action bar */}
          <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {selectedKelasInfo && (
                <>
                  <span className="badge badge-dark">{selectedKelasInfo.kode_mk}</span>
                  <span style={{ fontWeight: '600', color: 'var(--eerie-black)' }}>{selectedKelasInfo.nama_mk}</span>
                  <span className="badge badge-yellow">{selectedKelasInfo.nama_kelas}</span>
                </>
              )}
            </div>
            <button className="btn btn-accent" onClick={() => { setShowForm(!showForm); setEditId(null); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Input Nilai Baru
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="card animate-scale-in" style={{ marginBottom: '20px', borderLeft: '4px solid var(--vanilla)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Input Nilai Baru</h3>
              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Mahasiswa</label>
                    <select
                      className="select-field"
                      value={formData.enrollment_id}
                      onChange={(e) => setFormData({ ...formData, enrollment_id: e.target.value })}
                      required
                    >
                      <option value="">-- Pilih --</option>
                      {enrollments.map(en => (
                        <option key={en.id} value={en.id}>
                          {en.nim || ''} - {en.nama_mahasiswa || en.mahasiswa_id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Sub-CPMK</label>
                    <select
                      className="select-field"
                      value={formData.sub_cpmk_id}
                      onChange={(e) => setFormData({ ...formData, sub_cpmk_id: e.target.value })}
                      required
                    >
                      <option value="">-- Pilih --</option>
                      {subCpmks.map(sc => (
                        <option key={sc.id} value={sc.id}>{sc.kode_sub_cpmk}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Nilai (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className="input-field"
                      value={formData.nilai}
                      onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
                      placeholder="0 - 100"
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Batal</button>
                </div>
              </form>
            </div>
          )}

          {/* Nilai Table */}
          <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
            {loadingNilai ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 12px' }} />
                <div className="skeleton" style={{ width: '300px', height: '16px', margin: '0 auto' }} />
              </div>
            ) : nilaiList.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>Belum ada nilai</p>
                <p>Klik &quot;Input Nilai Baru&quot; untuk mulai menginput</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>NIM</th>
                    <th>Nama Mahasiswa</th>
                    <th>Sub-CPMK</th>
                    <th>Nilai</th>
                    <th>Tanggal Input</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {nilaiList.map((n, i) => (
                    <tr key={n.id}>
                      <td>{i + 1}</td>
                      <td><span className="badge badge-dark">{n.nim || '-'}</span></td>
                      <td style={{ fontWeight: '600' }}>{n.nama_mahasiswa || '-'}</td>
                      <td><span className="badge badge-blue">{n.kode_sub_cpmk || '-'}</span></td>
                      <td>
                        {editId === n.id ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            className="input-field"
                            style={{ width: '80px', padding: '4px 8px' }}
                            value={editNilai}
                            onChange={(e) => setEditNilai(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <span className={`badge ${n.nilai >= 70 ? 'badge-green' : n.nilai >= 55 ? 'badge-yellow' : 'badge-red'}`}>
                            {n.nilai}
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {n.input_at ? new Date(n.input_at).toLocaleDateString('id-ID', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        }) : new Date().toLocaleDateString('id-ID', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td>
                        {editId === n.id ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(n.id)} disabled={saving}>
                              {saving ? '...' : 'Simpan'}
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Batal</button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setEditId(n.id); setEditNilai(String(n.nilai)); setShowForm(false); }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </>
  );
}
