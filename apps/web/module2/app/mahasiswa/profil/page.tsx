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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-yellow-600">Profil tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{ background: '#FFF063', color: '#1a1a1a' }}
          >
            {profile.nama.charAt(0).toUpperCase()}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profile.nama}</h1>
            <p className="text-gray-600 mt-1">NIM: {profile.nim}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Mahasiswa Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informasi Pribadi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#E8F3FF' }}>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Informasi Pribadi</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
              <p className="text-gray-900 font-medium mt-1">{profile.nama}</p>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">NIM</label>
              <p className="text-gray-900 font-medium mt-1">{profile.nim}</p>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
              <p className="text-gray-900 font-medium mt-1">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Informasi Akademik */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#CFECCA' }}>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Informasi Akademik</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Program Studi</label>
              <p className="text-gray-900 font-medium mt-1">{profile.nama_prodi}</p>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode Prodi</label>
              <p className="text-gray-900 font-medium mt-1">{profile.kode_prodi}</p>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenjang</label>
              <p className="text-gray-900 font-medium mt-1">{profile.jenjang}</p>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Angkatan</label>
              <p className="text-gray-900 font-medium mt-1">{profile.angkatan}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#FFF063' }}>
            <svg className="w-5 h-5" style={{ color: '#1a1a1a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Statistik Akademik</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg" style={{ background: '#E8F3FF' }}>
            <p className="text-sm text-gray-600 mb-1">Total Kelas Diambil</p>
            <p className="text-3xl font-bold text-gray-900">{profile.total_kelas}</p>
          </div>
          
          <div className="p-4 rounded-lg" style={{ background: '#CFECCA' }}>
            <p className="text-sm text-gray-600 mb-1">Total Nilai Tersimpan</p>
            <p className="text-3xl font-bold text-gray-900">{profile.total_nilai}</p>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-900">Informasi</p>
            <p className="text-sm text-blue-700 mt-1">
              Data profil ini bersifat <strong>read-only</strong>. Jika ada perubahan data, silakan hubungi admin atau bagian akademik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
