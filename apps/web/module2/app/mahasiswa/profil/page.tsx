'use client';

import { useEffect, useState } from 'react';
import { mahasiswaApi } from '@/lib/api';

interface MahasiswaProfile {
  id: string;
  nim: string;
  nama: string;
  email: string;
  prodi_id: string;
  nama_prodi: string;
  kode_prodi: string;
  jenjang: string;
  angkatan: number;
  total_kelas: number;
  total_nilai: number;
}

export default function ProfilMahasiswaPage() {
  const [profile, setProfile] = useState<MahasiswaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await mahasiswaApi.getMyProfile();
      console.log('Profile response:', response);
      setProfile(response.data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #1F2937', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', padding: '16px' }}>
        <p style={{ color: '#DC2626' }}>{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '12px', padding: '16px' }}>
        <p style={{ color: '#D97706' }}>Profil tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Card */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Avatar */}
          <div 
            style={{ 
              width: '96px', 
              height: '96px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '32px', 
              fontWeight: '700',
              background: '#FFF063', 
              color: '#1a1a1a' 
            }}
          >
            {profile.nama.charAt(0).toUpperCase()}
          </div>
          
          {/* Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{profile.nama}</h1>
            <p style={{ color: '#6B7280', marginTop: '4px', fontSize: '14px' }}>NIM: {profile.nim}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '500', background: '#D1FAE5', color: '#065F46' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', marginRight: '8px' }}></span>
                Mahasiswa Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 Kolom */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Informasi Pribadi */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E8F3FF' }}>
              <svg style={{ width: '20px', height: '20px', color: '#1E40AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Informasi Pribadi</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Lengkap</label>
              <p style={{ color: '#111827', fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{profile.nama}</p>
            </div>
            
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NIM</label>
              <p style={{ color: '#111827', fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{profile.nim}</p>
            </div>
            
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
              <p style={{ color: '#111827', fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Informasi Akademik */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#CFECCA' }}>
              <svg style={{ width: '20px', height: '20px', color: '#166534' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Informasi Akademik</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Program Studi</label>
              <p style={{ color: '#111827', fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{profile.nama_prodi}</p>
            </div>
            
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kode Prodi</label>
              <p style={{ color: '#111827', fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{profile.kode_prodi}</p>
            </div>
            
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jenjang</label>
              <p style={{ color: '#111827', fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{profile.jenjang}</p>
            </div>
            
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Angkatan</label>
              <p style={{ color: '#111827', fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{profile.angkatan}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF063' }}>
            <svg style={{ width: '20px', height: '20px', color: '#1a1a1a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Statistik Akademik</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '20px', borderRadius: '8px', background: '#E8F3FF' }}>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Total Kelas Diambil</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>{profile.total_kelas}</p>
          </div>
          
          <div style={{ padding: '20px', borderRadius: '8px', background: '#CFECCA' }}>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Total Nilai Tersimpan</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>{profile.total_nilai}</p>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <svg style={{ width: '20px', height: '20px', color: '#1E40AF', flexShrink: 0, marginTop: '2px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E3A8A' }}>Informasi</p>
            <p style={{ fontSize: '14px', color: '#1E40AF', marginTop: '4px' }}>
              Data profil ini bersifat <strong>read-only</strong>. Jika ada perubahan data, silakan hubungi admin atau bagian akademik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
