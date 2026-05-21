'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import ToastContainer from '@/components/Toast';
import { dashboardApi, kelasApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface DashboardData {
  total_kelas?: number;
  total_mahasiswa?: number;
  total_mk?: number;
  kelas?: Array<{
    id: string;
    nama_kelas: string;
    nama_mk: string;
    tahun_akademik: string;
    semester_aktif: number;
    jumlah_mahasiswa?: number;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardApi.getDosen();
        const apiData = res.data || res;
        
        // Extract data from statistik if available
        if (apiData.statistik) {
          setData({
            total_kelas: apiData.statistik.total_kelas,
            total_mahasiswa: apiData.statistik.total_mahasiswa,
            total_mk: apiData.statistik.total_mk,
            kelas: apiData.kelas || [],
          });
        } else {
          setData(apiData);
        }
      } catch {
        // fallback: try to load classes
        try {
          const kelasRes = await kelasApi.getMyClasses();
          const kelas = kelasRes.data || [];
          setData({ total_kelas: kelas.length, kelas, total_mahasiswa: 0, total_mk: 0 });
        } catch {
          setData({});
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quickLinks = [
    { label: 'Input Nilai', href: '/dosen/input-nilai', desc: 'Input & edit nilai Sub-CPMK mahasiswa', color: 'var(--vanilla)', icon: '✏️' },
    { label: 'Sub-CPMK', href: '/dosen/sub-cpmk', desc: 'Kelola Sub-CPMK mata kuliah', color: 'var(--honeydew)', icon: '📋' },
    { label: 'Capaian', href: '/dosen/capaian', desc: 'Lihat capaian CPL mahasiswa', color: 'var(--alice-blue)', icon: '📊' },
    { label: 'Program Studi', href: '/dosen/prodi', desc: 'Informasi program studi & CPL', color: '#fff', icon: '🏫' },
  ];

  return (
    <>
      <ToastContainer />
      {/* Greeting */}
      <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '6px' }}>
          Selamat Datang, {user?.nama || user?.role || 'Dosen'}! 👋
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
          Berikut ringkasan aktivitas Anda hari ini
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <StatsCard
            title="Kelas Diampu"
            value={data.total_kelas ?? data.kelas?.length ?? 0}
            color="yellow"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
          />
          <StatsCard
            title="Total Mahasiswa"
            value={data.total_mahasiswa ?? 0}
            color="green"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
          <StatsCard
            title="Mata Kuliah"
            value={data.total_mk ?? 0}
            color="blue"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
          />
        </div>
      )}

      {/* Quick Links */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '16px' }}>Akses Cepat</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {quickLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`card animate-fade-in stagger-${i+1}`}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                borderLeft: `4px solid ${link.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{link.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--eerie-black)' }}>{link.label}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Classes */}
      {data.kelas && data.kelas.length > 0 && (
        <div className="animate-fade-in">
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '16px' }}>Kelas Saya</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mata Kuliah</th>
                  <th>Kelas</th>
                  <th>Tahun Akademik</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {data.kelas.slice(0, 5).map((k) => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: '600' }}>{k.nama_mk || '-'}</td>
                    <td><span className="badge badge-blue">{k.nama_kelas || '-'}</span></td>
                    <td>{k.tahun_akademik}</td>
                    <td><span className="badge badge-yellow">Semester {k.semester_aktif}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
