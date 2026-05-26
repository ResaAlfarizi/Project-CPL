'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';

interface DosenProfile {
  id: string;
  nidn: string;
  nama: string;
  email: string;
  prodi: string;
  total_kelas: number;
  total_mahasiswa: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DosenProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Import API
      const { profileApi } = await import('@/lib/api');
      const response = await profileApi.getMyProfile();
      
      setProfile({
        id: response.data.id,
        nidn: response.data.nidn,
        nama: response.data.nama,
        email: response.data.email,
        prodi: response.data.nama_prodi,
        total_kelas: parseInt(response.data.total_kelas) || 0,
        total_mahasiswa: parseInt(response.data.total_mahasiswa) || 0,
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat profil');
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

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
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
              {/* Avatar */}
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
                {profile?.nama?.charAt(0).toUpperCase() || 'D'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                  {profile?.nama || 'Nama Dosen'}
                </h2>
                <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '16px' }}>
                  {profile?.prodi || 'Program Studi'}
                </p>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                  }}>
                    <p style={{ fontSize: '12px', color: '#15803d', fontWeight: '600', marginBottom: '4px' }}>
                      Total Kelas
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#15803d' }}>
                      {profile?.total_kelas || 0}
                    </p>
                  </div>

                  <div style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                  }}>
                    <p style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>
                      Total Mahasiswa
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>
                      {profile?.total_mahasiswa || 0}
                    </p>
                  </div>
                </div>
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Nama Lengkap</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                    {profile?.nama || '-'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>NIDN</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                    {profile?.nidn || '-'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Email</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                    {profile?.email || '-'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Program Studi</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                    {profile?.prodi || '-'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Role</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                    {user?.role || 'Dosen'}
                  </p>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
