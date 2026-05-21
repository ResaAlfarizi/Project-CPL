'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mahasiswaApi } from '@/lib/api';

interface ProdiItem {
  id: number;
  kode_prodi?: string;
  nama_prodi?: string;
  jenjang?: string;
}

export default function MahasiswaDashboard() {
  const { user } = useAuth();
  const [prodiList, setProdiList] = useState<ProdiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodiRes = await mahasiswaApi.getAllProdi();
        const data = prodiRes;
        setProdiList(Array.isArray(data) ? data : data.data || []);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari program studi..."
          className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NO</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">KODE PRODI</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NAMA PROGRAM STUDI</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">JENJANG</th>
              <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    <span>Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : prodiList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  Tidak ada data program studi
                </td>
              </tr>
            ) : (
              prodiList.map((prodi, idx) => (
                <tr key={prodi.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                      {prodi.kode_prodi || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{prodi.nama_prodi || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#E8F3FF', color: '#1E40AF' }}>
                      {prodi.jenjang || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-colors" style={{ background: '#E8F3FF', color: '#1E40AF' }}>
                      Lihat CPL
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
