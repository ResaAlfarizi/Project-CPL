'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';

interface AdminProdiProfile {
  id: string;
  nama: string;
  email: string;
  prodi: string;
  role: string;
}

export default function AdminProdiProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdminProdiProfile | null>(null);
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
        nama: response.data.nama || response.data.email?.split('@')[0] || 'Admin',
        email: response.data.email,
        prodi: response.data.nama_prodi || 'Program Studi',
        role: response.data.role || 'Admin Prodi',
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
          Informasi pribadi dan data akun Anda
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
                background: 'linear-gradient(135deg, #EFFDA3 0%, #E5F195 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                flexShrink: 0,
                boxShadow: '0 10px 25px rgba(239, 253, 163, 0.3)',
              }}>
                👨‍💼
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                  {profile?.nama || 'Admin Program Studi'}
                </h2>
                <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '16px' }}>
                  {profile?.prodi || 'Program Studi'}
                </p>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #EFFDA3 0%, #E5F195 100%)',
                    border: '1.5px solid #DBE787',
                  }}>
                    <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>
                      Role
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#212121' }}>
                      {profile?.role || 'Admin Prodi'}
                    </p>
                  </div>

                  <div style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #CFE3CA 0%, #BDD9B6 100%)',
                    border: '1.5px solid #A8CFA0',
                  }}>
                    <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>
                      Status
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#212121' }}>
                      ✓ Aktif
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
                    {profile?.role || 'Admin Prodi'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        {/* Info Banner */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
          borderRadius: '16px',
          border: '1.5px solid #93C5FD',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(30, 64, 175, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
          }}>
            ℹ️
          </div>
          <div>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '700', 
              color: '#1E40AF',
              marginBottom: '4px',
            }}>
              Profil Read-Only
            </p>
            <p style={{ 
              fontSize: '13px', 
              color: '#1E40AF',
              lineHeight: '1.6',
            }}>
              Halaman profil ini hanya untuk melihat informasi. Untuk mengubah data, silakan hubungi Super Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
