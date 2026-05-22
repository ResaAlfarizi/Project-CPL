'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProdiAPI, CPLAPI, DosenAPI, MahasiswaAPI, MKAPI, MkCplAPI, SubCpmkAPI } from '@/lib/api';

const StatCard = ({ icon, label, value, color, bg, href }) => (
  <Link href={href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
    <div className="stat-card card" style={{ height: '100%', background: bg, borderColor: color, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(33,33,33,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      <div className="stat-icon" style={{ background: color }}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  </Link>
);

export default function DashboardPage() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    async function fetchStats() {
      try {
        const [prodi, cpl, dosen, mhs, mk, mkcpl, sub] = await Promise.all([
          ProdiAPI.list(), CPLAPI.list(), DosenAPI.list(),
          MahasiswaAPI.list(), MKAPI.list(), MkCplAPI.listAll(), SubCpmkAPI.listAll()
        ]);
        setStats({
          prodi: prodi?.length || 0,
          cpl: cpl?.length || 0,
          dosen: dosen?.length || 0,
          mhs: mhs?.length || 0,
          mk: mk?.length || 0,
          mkcpl: mkcpl?.length || 0,
          sub: sub?.length || 0
        });
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
      }
    }
    fetchStats();
  }, []);

  const CARDS = [
    { icon: '🎓', label: 'Program Studi', value: stats.prodi ?? '—', color: '#D8DFE9', bg: '#f0f4f9', href: '/prodi' },
    { icon: '🎯', label: 'CPL Terdaftar', value: stats.cpl ?? '—', color: '#CFDECA', bg: '#f0f7ee', href: '/cpl' },
    { icon: '👨‍🏫', label: 'Dosen', value: stats.dosen ?? '—', color: '#EFFDA3', bg: '#fdfef0', href: '/dosen' },
    { icon: '👨‍🎓', label: 'Mahasiswa', value: stats.mhs ?? '—', color: '#e8e4f7', bg: '#f5f3fd', href: '/mahasiswa' },
    { icon: '📚', label: 'Mata Kuliah', value: stats.mk ?? '—', color: '#fde8cc', bg: '#fef6ed', href: '/matakuliah' },
    { icon: '🔗', label: 'Pemetaan MK–CPL', value: stats.mkcpl ?? '—', color: '#cceeff', bg: '#eef9ff', href: '/mapping' },
    { icon: '📋', label: 'Sub-CPMK', value: stats.sub ?? '—', color: '#ffe0e0', bg: '#fff5f5', href: '/sub-cpmk' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 4 }}>Selamat Datang di CPL System 👋</h1>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {CARDS.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="dashboard-grid">
        {/* Quick Links */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div><div className="card-title">🚀 Mulai Cepat</div><div className="card-subtitle">Urutan setup sistem</div></div>
            </div>
          <div className="card-body" style={{ flex: 1 }}>
            {[
              { step: '①', label: 'Daftarkan Program Studi', href: '/prodi', done: (stats.prodi ?? 0) > 0 },
              { step: '②', label: 'Definisikan CPL per Prodi', href: '/cpl', done: (stats.cpl ?? 0) > 0 },
              { step: '③', label: 'Daftarkan Dosen & Mahasiswa', href: '/dosen', done: (stats.dosen ?? 0) > 0 },
              { step: '④', label: 'Tambah Mata Kuliah', href: '/matakuliah', done: (stats.mk ?? 0) > 0 },
              { step: '⑤', label: 'Petakan MK → CPL', href: '/mapping', done: (stats.mkcpl ?? 0) > 0 },
              { step: '⑥', label: 'Definisikan Sub-CPMK', href: '/sub-cpmk', done: (stats.sub ?? 0) > 0 },
              { step: '⑦', label: 'Atur Threshold Status', href: '/threshold', done: false },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', textDecoration: 'none', color: '#212121' }}>
                <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{item.step}</span>
                <span style={{ flex: 1, fontSize: 14 }}>{item.label}</span>
                <span style={{ fontSize: 16 }}>{item.done ? '✅' : '⭕'}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div><div className="card-title">ℹ️ Tentang Sistem</div><div className="card-subtitle">Modul 1 CPL Management</div></div>
          </div>
          <div className="card-body" style={{ flex: 1 }}>
            <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, marginBottom: 16 }}>
              Sistem ini digunakan untuk mengelola <strong>Capaian Pembelajaran Lulusan (CPL)</strong> secara terstruktur mulai dari pendaftaran program studi hingga pemetaan sub-CPMK ke mata kuliah.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Σ bobot MK→CPL', info: 'Total bobot semua CPL dalam satu MK = 1.0', color: '#CFDECA' },
                { label: 'Σ bobot Sub-CPMK', info: 'Total bobot Sub-CPMK per pasangan MK-CPL = 1.0', color: '#D8DFE9' },
                { label: 'Threshold', info: '5 level: Excellence → Not Competent', color: '#EFFDA3' },
              ].map(i => (
                <div key={i.label} style={{ background: i.color, borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{i.label}</div>
                  <div style={{ fontSize: 13 }}>{i.info}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
