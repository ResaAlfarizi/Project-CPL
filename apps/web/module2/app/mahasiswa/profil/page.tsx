'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mahasiswaApi } from '@/lib/api';

interface MahasiswaProfile {
  id: string;
  nim: string;
  nama: string;
  email: string;
  angkatan: number;
  prodi_id: string;
  nama_prodi?: string;
  kode_prodi?: string;
  is_active: boolean;
  created_at?: string;
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
        console.error('Error fetching profile:', err);
        setError(err.message || 'Gagal memuat profil');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Profil Mahasiswa</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
          Informasi data pribadi dan akademik
        </p>
      </div>

      {/* Profile Card */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          {/* Avatar */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: '700',
            color: '#fff',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
          }}>
            {profile?.nama?.charAt(0).toUpperCase() || 'M'}
          </div>

          {/* Name & NIM */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              {profile?.nama || 'Mahasiswa'}
            </h3>
            <p style={{ fontSize: '16px', color: '#6B7280', marginTop: '4px' }}>
              NIM: {profile?.nim || '-'}
            </p>
          </div>

          {/* Info Grid */}
          <div style={{
            width: '100%',
            maxWidth: '600px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginTop: '16px',
          }}>
            {/* Email */}
            <div style={{
              padding: '16px',
              borderRadius: '10px',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg style={{ width: '20px', height: '20px', color: '#6366F1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Email</p>
                  <p style={{ fontSize: '14px', color: '#111827', fontWeight: '600', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.email || user?.email || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Program Studi */}
            <div style={{
              padding: '16px',
              borderRadius: '10px',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg style={{ width: '20px', height: '20px', color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Program Studi</p>
                  <p style={{ fontSize: '14px', color: '#111827', fontWeight: '600', marginTop: '2px' }}>
                    {profile?.nama_prodi || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Angkatan */}
            <div style={{
              padding: '16px',
              borderRadius: '10px',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg style={{ width: '20px', height: '20px', color: '#3B82F6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Angkatan</p>
                  <p style={{ fontSize: '14px', color: '#111827', fontWeight: '600', marginTop: '2px' }}>
                    {profile?.angkatan || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div style={{
              padding: '16px',
              borderRadius: '10px',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: profile?.is_active ? '#D1FAE5' : '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg style={{ width: '20px', height: '20px', color: profile?.is_active ? '#10B981' : '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Status</p>
                  <p style={{ fontSize: '14px', color: '#111827', fontWeight: '600', marginTop: '2px' }}>
                    {profile?.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
