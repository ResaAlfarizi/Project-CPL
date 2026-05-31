'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
  const [prodi, setProdi] = useState<Prodi | null>(null);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get mahasiswa profile to get prodi_id
        const profileRes = await mahasiswaApi.getMyProfile();
        const profile = profileRes.data || profileRes;
        
        if (profile && profile.prodi_id) {
          // Get prodi detail
          const prodiRes = await mahasiswaApi.getProdiById(profile.prodi_id);
          const prodiData = prodiRes.data || prodiRes;
          setProdi(prodiData);
          
          // Get CPL for this prodi
          const cplRes = await mahasiswaApi.getCPLByProdi(profile.prodi_id);
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
    return (
      cpl.kode_cpl.toLowerCase().includes(q) ||
      cpl.deskripsi.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (!prodi) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Data program studi tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Prodi Info Card */}
      <div className="card animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: '700',
            color: '#fff',
          }}>
            {prodi.kode_prodi}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '4px' }}>
              {prodi.nama_prodi}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Jenjang: <span style={{ fontWeight: '600', color: 'var(--eerie-black)' }}>{prodi.jenjang}</span>
            </p>
          </div>
        </div>
      </div>

      {/* CPL Section */}
      <div className="card animate-fade-in">
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '4px' }}>
            Capaian Pembelajaran Lulusan (CPL)
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Daftar CPL untuk program studi {prodi.nama_prodi}
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Cari CPL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px' }}
          />
          <svg style={{ width: '20px', height: '20px', color: '#9CA3AF', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* CPL List */}
        {filteredCpl.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
            {search ? 'Tidak ada CPL yang sesuai dengan pencarian' : 'Tidak ada CPL untuk program studi ini'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredCpl.map((cpl, idx) => (
              <div key={cpl.id} className="card-flat" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span className="badge badge-dark" style={{ flexShrink: 0 }}>
                    {cpl.kode_cpl}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--eerie-black)', lineHeight: '1.6' }}>
                      {cpl.deskripsi}
                    </p>
                    {!cpl.is_active && (
                      <span className="badge" style={{ marginTop: '8px', background: '#FEE2E2', color: '#991B1B', fontSize: '11px' }}>
                        Tidak Aktif
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredCpl.length > 0 && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Total CPL: <span style={{ fontWeight: '600', color: 'var(--eerie-black)' }}>{filteredCpl.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
