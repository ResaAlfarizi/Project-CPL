'use client';
import { useAuth } from '@/context/AuthContext';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', icon: '🏠' },
  '/prodi': { title: 'Program Studi', subtitle: 'Kelola data program studi', icon: '🎓' },
  '/cpl': { title: 'CPL', subtitle: 'Capaian Pembelajaran Lulusan', icon: '🎯' },
  '/dosen': { title: 'Dosen', subtitle: 'Manajemen data dosen', icon: '👨‍🏫' },
  '/mahasiswa': { title: 'Mahasiswa', subtitle: 'Manajemen data mahasiswa', icon: '👨‍🎓' },
  '/matakuliah': { title: 'Mata Kuliah', subtitle: 'Kelola mata kuliah prodi', icon: '📚' },
  '/mapping': { title: 'Pemetaan MK–CPL', subtitle: 'Kontribusi mata kuliah ke CPL', icon: '🔗' },
  '/sub-cpmk': { title: 'Sub-CPMK', subtitle: 'Definisi sub-capaian per MK–CPL', icon: '📋' },
  '/threshold': { title: 'Threshold Status', subtitle: 'Konfigurasi rentang nilai pencapaian', icon: '⚙️' },
};

export default function Topbar({ pathname }) {
  const { user } = useAuth();
  const info = PAGE_TITLES[pathname] || { title: 'CPL System', subtitle: '', icon: '📖' };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span style={{ fontSize: 22 }}>{info.icon}</span>
        <div>
          <div className="page-title">{info.title}</div>
          {info.subtitle && <div className="page-subtitle">{info.subtitle}</div>}
        </div>
      </div>
      <div className="topbar-right">
        <span className="topbar-badge">{user?.role?.toUpperCase()}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #D8DFE9, #CFDECA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#212121' }}>
          {user?.name?.split(' ').slice(0, 2).map(n => n[0]).join('') || 'SA'}
        </div>
      </div>
    </header>
  );
}
