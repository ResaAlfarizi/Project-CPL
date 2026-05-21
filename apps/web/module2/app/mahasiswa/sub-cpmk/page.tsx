'use client';

import { useEffect, useState } from 'react';
import { mahasiswaApi } from '@/lib/api';

interface SubCpmk {
  id: number;
  kode_sub_cpmk?: string;
  nama_sub_cpmk?: string;
  deskripsi?: string;
  mk_id?: number;
  nama_mk?: string;
  kode_mk?: string;
  bobot?: number;
  [key: string]: unknown;
}

export default function SubCpmkPage() {
  const [subCpmkList, setSubCpmkList] = useState<SubCpmk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await mahasiswaApi.getAllSubCpmk();
        const data = Array.isArray(res) ? res : res.data || [];
        setSubCpmkList(data);
      } catch (error) {
        console.error('Error fetching sub-cpmk:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = subCpmkList.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.kode_sub_cpmk || '').toLowerCase().includes(q) ||
      (s.nama_sub_cpmk || '').toLowerCase().includes(q) ||
      (s.nama_mk || '').toLowerCase().includes(q) ||
      (s.kode_mk || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari sub-CPMK atau mata kuliah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
              <span>Memuat data...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400">
            Tidak ada data Sub-CPMK
          </div>
        ) : (
          filtered.map((subCpmk) => (
            <div key={subCpmk.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                        {subCpmk.kode_sub_cpmk || '-'}
                      </span>
                      {subCpmk.nama_mk && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#E8F3FF', color: '#1E40AF' }}>
                          {subCpmk.kode_mk || subCpmk.nama_mk}
                        </span>
                      )}
                      {subCpmk.bobot && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#FFF063', color: '#854D0E' }}>
                          Bobot: {subCpmk.bobot}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {subCpmk.nama_sub_cpmk || '-'}
                    </h3>
                    {subCpmk.deskripsi && expandedId === subCpmk.id && (
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        {subCpmk.deskripsi}
                      </p>
                    )}
                  </div>
                  {subCpmk.deskripsi && (
                    <button
                      onClick={() => setExpandedId(expandedId === subCpmk.id ? null : subCpmk.id)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      <svg 
                        className={`w-5 h-5 transition-transform ${expandedId === subCpmk.id ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {!isLoading && filtered.length > 0 && (
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold text-gray-900">{filtered.length}</span> Sub-CPMK
          </p>
        </div>
      )}
    </div>
  );
}
