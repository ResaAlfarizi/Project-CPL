'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mahasiswaApi } from '@/lib/api';

interface MahasiswaProfile {
  nim: string;
  nama: string;
  email: string;
  angkatan: number;
  nama_prodi?: string;
}

export default function ProfilPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MahasiswaProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await mahasiswaApi.getMyProfile();
        setProfile(res.data || res);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat profil');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="skeleton" style={{ height: '60px', borderRadius: 'var(--radius-xl)', maxWidth: '300px' }} />
        <div className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-xl)' }} />
        <div className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-xl)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '16px' }}>
        <p style={{ color: '#991B1B', fontSize: '14px' }}>{error}</p>
      </div>
    );
  }

  const infoItems = [
    {
      label: 'Nama Lengkap',
      value: profile?.nama || '-',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      label: 'NIM',
      value: profile?.nim || '-',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
    {
      label: 'Email',
      value: profile?.email || user?.email || '-',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
    },
    {
      label: 'Angkatan',
      value: profile?.angkatan ? String(profile.angkatan) : '-',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          Profil Saya
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280' }}>
          Informasi pribadi dan data akademik Anda
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Profile Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '48px',
              fontWeight: '700',
              flexShrink: 0,
              boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
            }}>
              {profile?.nama?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                {profile?.nama || 'Mahasiswa'}
              </h2>
              <p style={{ fontSize: '15px', color: '#6b7280' }}>
                {profile?.nama_prodi || 'Program Studi'}
              </p>
            </div>
          </div>
        </div>

        {/* Detail Information */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
            Informasi Detail
          </h3>
          <div style={{ display: 'grid', gap: '20px' }}>
            {infoItems.map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
