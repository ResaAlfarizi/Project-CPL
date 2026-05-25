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
      } catch (error) {
        console.error('Error fetching prodi:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Greeting */}
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '6px' }}>
          Selamat Datang, Mahasiswa! 👋
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
          Berikut ringkasan aktivitas Anda hari ini
        </p>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Cari program studi..."
          style={{ 
            width: '100%', 
            padding: '12px 12px 12px 40px', 
            borderRadius: '12px', 
            border: '1px solid #E5E7EB', 
            outline: 'none',
            background: '#fff', 
            fontSize: '14px' 
          }}
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
                <th>NO</th>
                <th>KODE PRODI</th>
                <th>NAMA PROGRAM STUDI</th>
                <th>JENJANG</th>
                <th style={{ textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {prodiList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
                    Tidak ada data program studi
                  </td>
                </tr>
              ) : (
                prodiList.map((prodi, idx) => (
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
                      <button className="btn btn-secondary btn-sm">
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
    </div>
  );
}
