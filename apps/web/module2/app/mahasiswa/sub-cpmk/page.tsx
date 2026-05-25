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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Cari sub-CPMK atau mata kuliah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '40px' }}
        />
        <svg style={{ width: '20px', height: '20px', color: '#9CA3AF', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Tidak ada data Sub-CPMK
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((subCpmk) => (
            <div key={subCpmk.id} className="card animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span className="badge badge-dark">
                      {subCpmk.kode_sub_cpmk || '-'}
                    </span>
                    {subCpmk.nama_mk && (
                      <span className="badge badge-blue">
                        {subCpmk.kode_mk || subCpmk.nama_mk}
                      </span>
                    )}
                    {subCpmk.bobot && (
                      <span className="badge badge-yellow">
                        Bobot: {subCpmk.bobot}%
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--eerie-black)', marginBottom: '4px', lineHeight: '1.6' }}>
                    {subCpmk.nama_sub_cpmk || '-'}
                  </h3>
                  {subCpmk.deskripsi && expandedId === subCpmk.id && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6' }}>
                      {subCpmk.deskripsi}
                    </p>
                  )}
                </div>
                {subCpmk.deskripsi && (
                  <button
                    onClick={() => setExpandedId(expandedId === subCpmk.id ? null : subCpmk.id)}
                    className="btn-ghost"
                    style={{ 
                      padding: '4px', 
                      flexShrink: 0,
                      transition: 'transform 0.2s',
                      transform: expandedId === subCpmk.id ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {!isLoading && filtered.length > 0 && (
        <div className="card animate-fade-in">
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Menampilkan <span style={{ fontWeight: '600', color: 'var(--eerie-black)' }}>{filtered.length}</span> Sub-CPMK
          </p>
        </div>
      )}
    </div>
  );
}
