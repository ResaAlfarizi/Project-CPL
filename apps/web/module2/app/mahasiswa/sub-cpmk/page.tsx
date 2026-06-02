'use client';

import { useEffect, useState, useMemo } from 'react';
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

interface MKGroup {
  kode_mk: string;
  nama_mk: string;
  items: SubCpmk[];
}

export default function SubCpmkPage() {
  const [subCpmkList, setSubCpmkList] = useState<SubCpmk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  // Group by mata kuliah
  const groups = useMemo<MKGroup[]>(() => {
    const q = search.toLowerCase();
    const filtered = subCpmkList.filter((s) =>
      (s.kode_sub_cpmk || '').toLowerCase().includes(q) ||
      (s.nama_sub_cpmk || '').toLowerCase().includes(q) ||
      (s.deskripsi || '').toLowerCase().includes(q) ||
      (s.nama_mk || '').toLowerCase().includes(q) ||
      (s.kode_mk || '').toLowerCase().includes(q)
    );

    const map = new Map<string, MKGroup>();
    filtered.forEach((s) => {
      const key = s.kode_mk || s.nama_mk || 'Lainnya';
      if (!map.has(key)) {
        map.set(key, {
          kode_mk: s.kode_mk || '',
          nama_mk: s.nama_mk || 'Mata Kuliah Lainnya',
          items: [],
        });
      }
      map.get(key)!.items.push(s);
    });

    return Array.from(map.values());
  }, [subCpmkList, search]);

  const totalFiltered = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <>
      {/* Page Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Sub-CPMK</h1>
        <p className="page-subtitle">Daftar Sub-CPMK tiap mata kuliah yang Anda ikuti</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px' }} className="animate-fade-in">
        <svg
          style={{ width: '18px', height: '18px', color: '#9CA3AF', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Cari sub-CPMK, deskripsi, atau mata kuliah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '42px' }}
        />
      </div>

      {/* Loading */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="card animate-fade-in" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.25 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--eerie-black)', marginBottom: '6px' }}>
            {search ? 'Tidak ada hasil' : 'Belum ada Sub-CPMK'}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {search ? `Tidak ditemukan sub-CPMK untuk "${search}"` : 'Data sub-CPMK belum tersedia'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {groups.map((group, index) => {
            const totalBobot = group.items.reduce((sum, s) => sum + (s.bobot ?? 0), 0);

            return (
              <div
                key={group.kode_mk || group.nama_mk}
                className="card animate-fade-in"
                style={{ padding: 0, overflow: 'hidden', animationDelay: `${index * 0.08}s` }}
              >
                {/* Header Mata Kuliah */}
                <div style={{
                  padding: '20px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      {group.kode_mk && (
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          padding: '3px 10px',
                          background: 'rgba(255,255,255,0.15)',
                          borderRadius: '6px',
                          letterSpacing: '0.04em',
                        }}>
                          {group.kode_mk}
                        </span>
                      )}
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                        {group.items.length} sub-CPMK
                      </span>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0, lineHeight: 1.3 }}>
                      {group.nama_mk}
                    </h3>
                  </div>
                  {/* Total bobot */}
                  <div style={{
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    textAlign: 'right',
                  }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>Total Bobot</p>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#EFFDA3', lineHeight: 1 }}>
                      {(totalBobot * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Tabel sub-CPMK */}
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Kode</th>
                      <th>Deskripsi</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Bobot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((sub) => {
                      const bobot = sub.bobot ?? 0;
                      return (
                        <tr key={sub.id}>
                          <td>
                            <span className="badge badge-dark">
                              {sub.kode_sub_cpmk || sub.nama_sub_cpmk || `Sub-CPMK ${sub.id}`}
                            </span>
                          </td>
                          <td>
                            <p style={{ fontWeight: '600', color: 'var(--eerie-black)', marginBottom: sub.deskripsi ? '4px' : 0, fontSize: '14px' }}>
                              {sub.nama_sub_cpmk || sub.kode_sub_cpmk || `Sub-CPMK ${sub.id}`}
                            </p>
                            {sub.deskripsi && (
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                {sub.deskripsi}
                              </p>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{
                              display: 'inline-block',
                              background: '#FEF3C7',
                              color: '#92400E',
                              fontWeight: '700',
                              fontSize: '13px',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              border: '1px solid #FCD34D',
                            }}>
                              {(bobot * 100).toFixed(1)}%
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* Summary */}
          <div className="card animate-fade-in" style={{ padding: '16px 24px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Menampilkan{' '}
              <span style={{ fontWeight: '700', color: 'var(--eerie-black)' }}>{totalFiltered}</span>{' '}
              sub-CPMK dari{' '}
              <span style={{ fontWeight: '700', color: 'var(--eerie-black)' }}>{groups.length}</span>{' '}
              mata kuliah
            </p>
          </div>
        </div>
      )}
    </>
  );
}
