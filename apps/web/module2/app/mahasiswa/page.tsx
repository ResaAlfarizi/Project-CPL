'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StatsCard from '@/components/StatsCard';
import Link from 'next/link';
import { mahasiswaApi } from '@/lib/api';

interface MahasiswaProfile {
  nama: string;
  prodi_id?: string;
}

interface KelasMahasiswa {
  id: string | number;
  nama_kelas?: string;
  nama_mk?: string;
  kode_mk?: string;
  tahun_akademik?: string;
  semester_aktif?: number;
}

interface StatsData {
  totalSubCpmk: number;
  totalKelas: number;
}

export default function MahasiswaDashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<MahasiswaProfile | null>(null);
  const [kelasList, setKelasList] = useState<KelasMahasiswa[]>([]);
  const [stats, setStats] = useState<StatsData>({ totalSubCpmk: 0, totalKelas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await mahasiswaApi.getMyProfile();
        setProfile(profileRes.data || profileRes);

        let kelas: KelasMahasiswa[] = [];
        try {
          const kelasRes = await mahasiswaApi.getMyKelas();
          kelas = Array.isArray(kelasRes) ? kelasRes : kelasRes.data || [];
          setKelasList(kelas);
        } catch {
          kelas = [];
        }

        let subCpmkCount = 0;
        try {
          const subRes = await mahasiswaApi.getAllSubCpmk();
          const subData = Array.isArray(subRes) ? subRes : subRes.data || [];
          subCpmkCount = subData.length;
        } catch {
          subCpmkCount = 0;
        }

        setStats({ totalSubCpmk: subCpmkCount, totalKelas: kelas.length });
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quickLinks = [
    { label: 'Capaian CPL',    href: '/mahasiswa/capaian',        desc: 'Lihat progres capaian CPL saya',        color: 'var(--honeydew)',  icon: '📊' },
    { label: 'Mata Kuliah',    href: '/mahasiswa/mata-kuliah',    desc: 'Daftar mata kuliah yang diikuti',       color: 'var(--vanilla)',   icon: '📚' },
    { label: 'Sub-CPMK',      href: '/mahasiswa/sub-cpmk',       desc: 'Lihat sub-CPMK tiap mata kuliah',      color: 'var(--alice-blue)', icon: '📋' },
    { label: 'Program Studi', href: '/mahasiswa/program-studi',  desc: 'Informasi program studi & CPL',        color: '#fff',             icon: '🏫' },
  ];

  return (
    <>
      {/* Greeting */}
      <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '6px' }}>
          Selamat Datang, {profile?.nama || user?.nama || user?.name || 'Mahasiswa'}! 👋
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
          Berikut ringkasan aktivitas akademik Anda
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <StatsCard
            title="Mata Kuliah Diikuti"
            value={stats.totalKelas}
            color="yellow"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            }
          />
          <StatsCard
            title="Total Sub-CPMK"
            value={stats.totalSubCpmk}
            color="green"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            }
          />
        </div>
      )}

      {/* Quick Links */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '16px' }}>
          Akses Cepat
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {quickLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`card animate-fade-in stagger-${i + 1}`}
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', borderLeft: `4px solid ${link.color}` }}
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

      {/* Kelas Saya */}
      {!loading && kelasList.length > 0 && (
        <div className="animate-fade-in">
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '16px' }}>
            Kelas Saya
          </h2>
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
                {kelasList.slice(0, 5).map((k) => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: '600' }}>{k.nama_mk || '-'}</td>
                    <td><span className="badge badge-blue">{k.nama_kelas || '-'}</span></td>
                    <td>{k.tahun_akademik || '-'}</td>
                    <td>
                      {k.semester_aktif
                        ? <span className="badge badge-yellow">Semester {k.semester_aktif}</span>
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && kelasList.length === 0 && (
        <div className="animate-fade-in">
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '16px' }}>
            Kelas Saya
          </h2>
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Belum terdaftar di kelas manapun
            </p>
          </div>
        </div>
      )}
    </>
  );
}
