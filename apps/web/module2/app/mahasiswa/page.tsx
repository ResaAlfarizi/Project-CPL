'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { mahasiswaApi } from '@/lib/api';

interface ProdiItem {
  id: string;
  kode_prodi: string;
  nama_prodi: string;
  jenjang: string;
}

export default function MahasiswaDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [prodi, setProdi] = useState<ProdiItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { 
      title: 'Capaian CPL', 
      desc: 'Progres capaian CPL saya', 
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: '#CFDECA', 
      target: '/mahasiswa/capaian' 
    },
    { 
      title: 'Mata Kuliah', 
      desc: 'Daftar mata kuliah aktif', 
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: '#EFF0A3', 
      target: '/mahasiswa/mata-kuliah' 
    },
    { 
      title: 'Program Studi', 
      desc: 'Info prodi & CPL', 
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: '#D8DFE9', 
      target: '/mahasiswa/program-studi' 
    },
    { 
      title: 'Sub-CPMK', 
      desc: 'Lihat sub-CPMK mata kuliah', 
      icon: (
        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: '#FFD8A8', 
      target: '/mahasiswa/sub-cpmk' 
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Banner */}
      <div className="animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(15,40,25,0.9) 0%, rgba(15,40,25,0.82) 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: '#fff',
      }}>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '4px' }}>
          Selamat Datang 👋
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '4px', letterSpacing: '-0.5px' }}>
          {user?.name || 'Mahasiswa'}
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
          Berikut ringkasan aktivitas Anda hari ini
        </p>
      </div>

      {/* Quick Access */}
      <div className="animate-fade-in">
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#212121', marginBottom: '16px' }}>
          Akses Cepat
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => router.push(action.target)}
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: `none`,
                borderLeft: `4px solid ${action.color}`,
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: action.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#212121',
                }}>
                  {action.icon}
                </div>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '12px',
                  background: '#F6F5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg style={{ width: '12px', height: '12px', color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#212121', marginBottom: '4px' }}>
                {action.title}
              </h3>
              <p style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
                {action.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Program Studi Saya */}
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#212121' }}>
            Program Studi Saya
          </h2>
          <button
            onClick={() => router.push('/mahasiswa/program-studi')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              color: '#64748B',
              cursor: 'pointer',
            }}
          >
            Lihat Detail
          </button>
        </div>

        {isLoading ? (
          <div className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
        ) : !prodi ? (
          <div style={{
            background: 'rgba(255,255,255,0.92)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>
              Data program studi tidak ditemukan
            </p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.92)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#212121', marginBottom: '8px' }}>
                {prodi.nama_prodi}
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#212121',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}>
                  {prodi.kode_prodi}
                </span>
                <span style={{
                  background: '#EFF0A3',
                  color: '#212121',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}>
                  {prodi.jenjang}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/mahasiswa/program-studi')}
              style={{
                background: '#212121',
                color: '#fff',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                padding: '10px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              Lihat CPL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
