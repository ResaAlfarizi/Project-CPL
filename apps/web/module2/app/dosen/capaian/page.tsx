'use client';

import { useEffect, useState } from 'react';
import { kelasApi, capaianApi } from '@/lib/api';

interface Kelas {
  id: string;
  nama_kelas: string;
  nama_mk?: string;
  kode_mk?: string;
  tahun_akademik: string;
  semester_aktif: number;
}

interface CapaianItem {
  id?: string;
  mahasiswa_id?: string;
  nim?: string;
  nama_mahasiswa?: string;
  cpl_id?: string;
  kode_cpl?: string;
  deskripsi_cpl?: string;
  nilai_capaian?: number;
  status?: string;
  enrollment_id?: string;
  mk_cpl_id?: string;
}

export default function CapaianPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [capaianList, setCapaianList] = useState<CapaianItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCapaian, setLoadingCapaian] = useState(false);
  const [search, setSearch] = useState('');

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
    if (!selectedKelas) { setCapaianList([]); return; }
    const loadCapaian = async () => {
      setLoadingCapaian(true);
      try {
        const res = await capaianApi.getByKelas(selectedKelas);
        setCapaianList(res.data || []);
      } catch { setCapaianList([]); }
      finally { setLoadingCapaian(false); }
    };
    loadCapaian();
  }, [selectedKelas]);

  const getStatusClass = (status?: string) => {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('excellence')) return 'status-excellence';
    if (s.includes('satisfactory')) return 'status-satisfactory';
    if (s.includes('competent') && !s.includes('not')) return 'status-competent';
    if (s.includes('developing')) return 'status-developing';
    return 'status-not-competent';
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return 'badge-blue';
    const s = status.toLowerCase();
    if (s.includes('excellence')) return 'badge-green';
    if (s.includes('satisfactory')) return 'badge-blue';
    if (s.includes('competent') && !s.includes('not')) return 'badge-yellow';
    if (s.includes('developing')) return 'badge-red';
    return 'badge-red';
  };

  const filtered = capaianList.filter(c =>
    (c.nama_mahasiswa || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.nim || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.kode_cpl || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedKelasInfo = kelasList.find(k => k.id === selectedKelas);

  // Summary stats
  const totalStudents = new Set(
    filtered
      .map(c => c.mahasiswa_id || c.enrollment_id)
      .filter(id => id != null && id !== undefined && id !== '')
  ).size;
  
  // Calculate average only from valid numbers
  const validNilai = filtered
    .map(c => c.nilai_capaian)
    .filter(n => n != null && !isNaN(n) && n !== undefined);
  
  const avgNilai = validNilai.length > 0
    ? (validNilai.reduce((sum, n) => sum + Number(n), 0) / validNilai.length).toFixed(1)
    : '0';
  
  const excellenceCount = filtered.filter(c => (c.status || '').toLowerCase().includes('excellence')).length;

  return (
    <>
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Capaian CPL Mahasiswa</h1>
        <p className="page-subtitle">Lihat capaian CPL mahasiswa untuk kelas yang Anda ampu (hanya baca)</p>
      </div>

      {/* Kelas selector */}
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
            onChange={(e) => setSelectedKelas(e.target.value)}
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
          {/* Info bar */}
          <div className="animate-fade-in" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            {selectedKelasInfo && (
              <>
                <span className="badge badge-dark">{selectedKelasInfo.kode_mk}</span>
                <span style={{ fontWeight: '600', color: 'var(--eerie-black)' }}>{selectedKelasInfo.nama_mk}</span>
                <span className="badge badge-yellow">{selectedKelasInfo.nama_kelas}</span>
              </>
            )}
          </div>

          {/* Summary cards */}
          <div className="animate-fade-in stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div className="card-flat" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Mahasiswa</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--eerie-black)' }}>{totalStudents}</p>
            </div>
            <div className="card-flat" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rata-rata Nilai</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--eerie-black)' }}>{avgNilai}</p>
            </div>
            <div className="card-flat" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Excellence</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{excellenceCount}</p>
            </div>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '16px', maxWidth: '320px' }}>
            <input
              type="text"
              placeholder="Cari mahasiswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ background: '#fff' }}
            />
          </div>

          {/* Table */}
          <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
            {loadingCapaian ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 12px' }} />
                <div className="skeleton" style={{ width: '300px', height: '16px', margin: '0 auto' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>Belum ada data capaian</p>
                <p>Data capaian CPL akan muncul setelah nilai diinput dan dihitung</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>NIM</th>
                    <th>Nama Mahasiswa</th>
                    <th>Kode CPL</th>
                    <th>Nilai Capaian</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id || `${c.mahasiswa_id}-${c.cpl_id}-${i}`}>
                      <td>{i + 1}</td>
                      <td><span className="badge badge-dark">{c.nim || '-'}</span></td>
                      <td style={{ fontWeight: '600' }}>{c.nama_mahasiswa || '-'}</td>
                      <td><span className="badge badge-blue">{c.kode_cpl || '-'}</span></td>
                      <td>
                        <span style={{ fontWeight: '700', fontSize: '16px' }} className={getStatusClass(c.status)}>
                          {c.nilai_capaian != null ? Number(c.nilai_capaian).toFixed(1) : '-'}
                        </span>
                      </td>
                      <td>
                        {c.status ? (
                          <span className={`badge ${getStatusBadge(c.status)}`}>{c.status}</span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>—</span>
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
