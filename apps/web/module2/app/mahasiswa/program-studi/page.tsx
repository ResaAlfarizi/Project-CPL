'use client';

import { useEffect, useState } from 'react';
import { mahasiswaApi } from '@/lib/api';

interface Prodi {
  id: number;
  nama_prodi?: string;
  kode_prodi?: string;
  jenjang?: string;
  [key: string]: unknown;
}

interface CPL {
  id: number;
  kode_cpl?: string;
  nama_cpl?: string;
  deskripsi?: string;
  prodi_id?: number;
  [key: string]: unknown;
}

export default function ProgramStudiPage() {
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<Prodi | null>(null);
  const [filteredCpl, setFilteredCpl] = useState<CPL[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cplLoading, setCplLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodiRes, cplRes] = await Promise.allSettled([
          mahasiswaApi.getAllProdi(),
          mahasiswaApi.getAllCPL(),
        ]);

        if (prodiRes.status === 'fulfilled') {
          const data = prodiRes.value;
          setProdiList(Array.isArray(data) ? data : data.data || []);
        }

        if (cplRes.status === 'fulfilled') {
          const data = cplRes.value;
          setCplList(Array.isArray(data) ? data : data.data || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectProdi = async (prodi: Prodi) => {
    setSelectedProdi(prodi);
    setCplLoading(true);
    try {
      const res = await mahasiswaApi.getCPLByProdi(prodi.id);
      const data = Array.isArray(res) ? res : res.data || [];
      setFilteredCpl(data);
    } catch {
      setFilteredCpl(cplList.filter((c) => c.prodi_id === prodi.id));
    } finally {
      setCplLoading(false);
    }
  };

  const filtered = prodiList.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.nama_prodi || '').toLowerCase().includes(q) ||
      (p.kode_prodi || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari program studi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  Tidak ada data program studi
                </td>
              </tr>
            ) : (
              filtered.map((prodi, idx) => (
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
                    <button 
                      onClick={() => handleSelectProdi(prodi)}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-colors hover:opacity-80" 
                      style={{ background: '#E8F3FF', color: '#1E40AF' }}
                    >
                      Lihat CPL
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CPL Modal/Section */}
      {selectedProdi && (
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">CPL - {selectedProdi.nama_prodi}</h3>
              <p className="text-sm text-gray-500">Daftar Capaian Pembelajaran Lulusan</p>
            </div>
            <button
              onClick={() => setSelectedProdi(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {cplLoading ? (
            <div className="py-8 text-center text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                <span>Memuat CPL...</span>
              </div>
            </div>
          ) : filteredCpl.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              Tidak ada CPL untuk program studi ini
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCpl.map((cpl, idx) => (
                <div key={cpl.id || idx} className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-900 text-white flex-shrink-0">
                      {cpl.kode_cpl || `CPL-${idx + 1}`}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{cpl.nama_cpl || '-'}</p>
                      {cpl.deskripsi && (
                        <p className="text-xs text-gray-500 mt-1">{cpl.deskripsi}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
