'use client';

import { useEffect, useState } from 'react';
import { mahasiswaApi } from '@/lib/api';

interface Prodi {
  id: string;
  nama_prodi: string;
  kode_prodi: string;
  jenjang: string;
}

interface CPL {
  id: string;
  kode_cpl: string;
  deskripsi: string;
  prodi_id: string;
  is_active: boolean;
}

export default function ProgramStudiPage() {
  const [prodi, setProdi] = useState<Prodi | null>(null);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await mahasiswaApi.getMyProfile();
        const profile = profileRes.data || profileRes;

        if (profile?.prodi_id) {
          const [prodiRes, cplRes] = await Promise.all([
            mahasiswaApi.getProdiById(profile.prodi_id),
            mahasiswaApi.getCPLByProdi(profile.prodi_id),
          ]);
          setProdi(prodiRes.data || prodiRes);
          const cplData = Array.isArray(cplRes) ? cplRes : cplRes.data || [];
          setCplList(cplData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCpl = cplList.filter((cpl) => {
    const q = search.toLowerCase();
    return cpl.kode_cpl.toLowerCase().includes(q) || cpl.deskripsi.toLowerCase().includes(q);
  });

  return (
    <>
      {/* Page Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Program Studi & CPL</h1>
        <p className="page-subtitle">Informasi program studi dan Capaian Pembelajaran Lulusan</p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-xl)' }} />
          <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl)' }} />
        </div>
      ) : !prodi ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Data program studi tidak ditemukan</p>
        </div>
      ) : (
        <>
          {/* Prodi Info Card */}
          <div className="card animate-fade-in stagger-1" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #212121 0%, #374151 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '800',
              color: '#EFFDA3',
              letterSpacing: '0.04em',
              flexShrink: 0,
              textAlign: 'center',
              lineHeight: 1.2,
            }}>
              {prodi.kode_prodi}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Program Studi
              </p>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--eerie-black)', marginBottom: '8px', lineHeight: 1.2 }}>
                {prodi.nama_prodi}
              </h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-dark">{prodi.kode_prodi}</span>
                <span className="badge badge-blue">{prodi.jenjang}</span>
                <span className="badge badge-yellow">{cplList.length} CPL</span>
              </div>
            </div>
          </div>

          {/* CPL Section */}
          <div className="animate-slide-in-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-yellow">CPL</span>
                Capaian Pembelajaran Lulusan
              </h2>
              {/* Search */}
              <div style={{ maxWidth: '280px', flex: '0 1 280px' }}>
                <input
                  type="text"
                  placeholder="Cari CPL..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field"
                  style={{ background: '#fff' }}
                />
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {filteredCpl.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p style={{ fontWeight: '600', fontSize: '16px' }}>
                    {search ? 'Tidak ada hasil' : 'Belum ada CPL'}
                  </p>
                  <p>
                    {search ? `Tidak ditemukan CPL untuk "${search}"` : 'CPL untuk prodi ini belum tersedia'}
                  </p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Kode CPL</th>
                      <th>Deskripsi</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCpl.map((cpl, i) => (
                      <tr key={cpl.id}>
                        <td>{i + 1}</td>
                        <td><span className="badge badge-dark">{cpl.kode_cpl}</span></td>
                        <td style={{ fontSize: '14px', lineHeight: '1.6' }}>{cpl.deskripsi}</td>
                        <td>
                          <span className={`badge ${cpl.is_active ? 'badge-green' : 'badge-red'}`}>
                            {cpl.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
