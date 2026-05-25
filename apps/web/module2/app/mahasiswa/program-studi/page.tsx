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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Cari program studi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '40px' }}
        />
        <svg style={{ width: '20px', height: '20px', color: '#9CA3AF', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />
      ) : (
        <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>NO</th>
                <th>KODE PRODI</th>
                <th>NAMA PROGRAM STUDI</th>
                <th>JENJANG</th>
                <th style={{ textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
                    Tidak ada data program studi
                  </td>
                </tr>
              ) : (
                filtered.map((prodi, idx) => (
                  <tr key={prodi.id}>
                    <td style={{ fontWeight: '500' }}>{idx + 1}</td>
                    <td>
                      <span className="badge badge-dark">{prodi.kode_prodi || '-'}</span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{prodi.nama_prodi || '-'}</td>
                    <td>
                      <span className="badge badge-blue">{prodi.jenjang || '-'}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleSelectProdi(prodi)}
                        className="btn btn-secondary btn-sm"
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
      )}

      {/* CPL Section */}
      {selectedProdi && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '4px' }}>
                CPL - {selectedProdi.nama_prodi}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Daftar Capaian Pembelajaran Lulusan
              </p>
            </div>
            <button
              onClick={() => setSelectedProdi(null)}
              className="btn-ghost"
              style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {cplLoading ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <div className="skeleton" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Memuat CPL...</span>
              </div>
            </div>
          ) : filteredCpl.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Tidak ada CPL untuk program studi ini
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredCpl.map((cpl, idx) => (
                <div key={cpl.id || idx} className="card-flat" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span className="badge badge-dark" style={{ flexShrink: 0 }}>
                      {cpl.kode_cpl || `CPL-${idx + 1}`}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--eerie-black)', marginBottom: '4px' }}>
                        {cpl.nama_cpl || '-'}
                      </p>
                      {cpl.deskripsi && (
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                          {cpl.deskripsi}
                        </p>
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
