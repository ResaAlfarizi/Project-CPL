'use client';

import { useEffect, useState } from 'react';
import { mahasiswaApi } from '@/lib/api';

interface Kelas {
  id: number;
  kode_mk?: string;
  nama_mk?: string;
  nama_kelas?: string;
  semester?: string;
  tahun_ajaran?: string;
  sks?: number;
  dosen_pengampu?: string;
  [key: string]: unknown;
}

export default function MataKuliahPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await mahasiswaApi.getAllKelas();
        const data = Array.isArray(res) ? res : res.data || [];
        setKelasList(data);
      } catch (error) {
        console.error('Error fetching kelas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = kelasList.filter((k) => {
    const q = search.toLowerCase();
    const matchSearch = 
      (k.nama_mk || '').toLowerCase().includes(q) ||
      (k.kode_mk || '').toLowerCase().includes(q) ||
      (k.nama_kelas || '').toLowerCase().includes(q);
    
    const matchSemester = selectedSemester === 'all' || k.semester === selectedSemester;
    
    return matchSearch && matchSemester;
  });

  const semesters = Array.from(new Set(kelasList.map(k => k.semester).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari mata kuliah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="all">Semua Semester</option>
          {semesters.map((sem) => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NO</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">KODE MK</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NAMA MATA KULIAH</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">KELAS</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKS</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SEMESTER</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">DOSEN</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    <span>Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  Tidak ada data mata kuliah
                </td>
              </tr>
            ) : (
              filtered.map((kelas, idx) => (
                <tr key={kelas.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                      {kelas.kode_mk || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{kelas.nama_mk || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#CFECCA', color: '#166534' }}>
                      {kelas.nama_kelas || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{kelas.sks || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#E8F3FF', color: '#1E40AF' }}>
                      {kelas.semester || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{kelas.dosen_pengampu || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {!isLoading && filtered.length > 0 && (
        <div className="bg-white rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold text-gray-900">{filtered.length}</span> mata kuliah
          </p>
          <p className="text-xs text-gray-500">
            Total SKS: <span className="font-semibold text-gray-900">
              {filtered.reduce((sum, k) => sum + (k.sks || 0), 0)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
