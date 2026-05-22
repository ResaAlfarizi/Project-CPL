'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  {
    section: 'Overview', items: [
      { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
    ]
  },
  {
    section: 'Master Data', items: [
      { href: '/prodi', icon: '🎓', label: 'Program Studi' },
      { href: '/cpl', icon: '🎯', label: 'CPL' },
      { href: '/dosen', icon: '👨‍🏫', label: 'Dosen' },
      { href: '/mahasiswa', icon: '👨‍🎓', label: 'Mahasiswa' },
    ]
  },
  {
    section: 'Kurikulum', items: [
      { href: '/matakuliah', icon: '📚', label: 'Mata Kuliah' },
      { href: '/mapping', icon: '🔗', label: 'Pemetaan MK–CPL' },
      { href: '/sub-cpmk', icon: '📋', label: 'Sub-CPMK' },
    ]
  },
  {
    section: 'Konfigurasi', items: [
      { href: '/threshold', icon: '⚙️', label: 'Threshold Status' },
    ]
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.name?.split(' ').slice(0, 2).map(n => n[0]).join('') || 'SA';

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <div className="sidebar-logo-text">
            CPL System
          </div>
        </div>
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href} className={`nav-item${active ? ' active' : ''}`}>
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-text">{item.label}</span>
                  {collapsed && <span className="nav-tooltip">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role || '—'}</div>
          </div>
        </div>
        {!collapsed && (
          <button
            onClick={() => window.location.reload()}
            className="btn btn-ghost w-full mt-8"
            style={{ fontSize: 16, justifyContent: 'center' }}
          >
             Keluar
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => window.location.reload()}
            title="Keluar"
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', width: '100%', padding: '8px', fontSize: 20, textAlign: 'center' }}
          >
          </button>
        )}
      </div>
    </aside>
  );
}
