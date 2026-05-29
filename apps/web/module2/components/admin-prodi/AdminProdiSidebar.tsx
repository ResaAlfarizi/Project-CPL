'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  collapsed: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export default function AdminProdiSidebar({ collapsed, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { 
      label: 'Dashboard', 
      href: '/admin-prodi', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      )
    },
    { 
      label: 'Program Studi & CPL', 
      href: '/admin-prodi/cpl', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      )
    },
    { 
      label: 'Mata Kuliah & Pemetaan', 
      href: '/admin-prodi/mata-kuliah', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      )
    },
    { 
      label: 'Sub-CPMK', 
      href: '/admin-prodi/sub-cpmk', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    },
    { 
      label: 'Input Nilai Sub-CPMK', 
      href: '/admin-prodi/input-nilai', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      )
    },
    { 
      label: 'Capaian CPL Mahasiswa', 
      href: '/admin-prodi/capaian', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    },
    { 
      label: 'Manajemen User', 
      href: '/admin-prodi/users', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    { 
      label: 'Audit Log', 
      href: '/admin-prodi/audit-log', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <line x1="12" y1="9" x2="8" y2="9"/>
        </svg>
      )
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin-prodi') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            display: 'none',
          }}
          onClick={onClose}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '270px',
          height: '100vh',
          background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)',
          position: 'fixed',
          left: collapsed ? '-270px' : '0',
          top: 0,
          transition: 'left 0.3s ease',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
        }}
        className="sidebar"
      >
        {/* Logo Section */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #EFFDA3 0%, #E5F195 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 253, 163, 0.3)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: '#fff',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Admin Prodi
              </h2>
              <p
                style={{
                  fontSize: '11px',
                  color: '#9CA3AF',
                  margin: 0,
                  fontWeight: '600',
                }}
              >
                Sistem CPL
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            padding: '20px 16px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="sidebar-nav-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  color: isActive(item.href) ? '#fff' : '#D1D5DB',
                  background: isActive(item.href)
                    ? 'linear-gradient(135deg, rgba(239, 253, 163, 0.15) 0%, rgba(229, 241, 149, 0.1) 100%)'
                    : 'transparent',
                  border: isActive(item.href) ? '1px solid rgba(239, 253, 163, 0.2)' : '1px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: isActive(item.href) ? '#EFFDA3' : '#9CA3AF' }}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer Info */}
        <div
          style={{
            padding: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 253, 163, 0.1) 0%, rgba(207, 227, 202, 0.1) 100%)',
              border: '1px solid rgba(239, 253, 163, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EFFDA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#EFFDA3',
                  margin: 0,
                }}
              >
                Info Akses
              </p>
            </div>
            <p
              style={{
                fontSize: '11px',
                color: '#D1D5DB',
                margin: 0,
                lineHeight: '1.5',
              }}
            >
              Anda memiliki akses penuh untuk mengelola data di program studi Anda.
            </p>
          </div>
        </div>
      </aside>

      <style jsx>{`
        @media (max-width: 1023px) {
          .mobile-overlay {
            display: block !important;
          }
        }

        .sidebar-nav-item:hover {
          background: rgba(55, 65, 81, 0.5) !important;
          color: #fff !important;
          transform: translateX(4px);
        }
      `}</style>
    </>
  );
}
