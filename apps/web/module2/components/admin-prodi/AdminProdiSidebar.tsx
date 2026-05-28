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
  icon: string;
  badge?: string;
  badgeColor?: string;
}

export default function AdminProdiSidebar({ collapsed, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', href: '/admin-prodi', icon: '🏠' },
    { label: 'Kelola CPL', href: '/admin-prodi/cpl', icon: '📚', badge: 'R/W', badgeColor: 'green' },
    { label: 'Kelola CPMK', href: '/admin-prodi/cpmk', icon: '📖', badge: 'R/W', badgeColor: 'green' },
    { label: 'Kelola Sub-CPMK', href: '/admin-prodi/sub-cpmk', icon: '📝', badge: 'R/W', badgeColor: 'green' },
    { label: 'Capaian Mahasiswa', href: '/admin-prodi/capaian', icon: '📊', badge: 'R', badgeColor: 'blue' },
    { label: 'Mata Kuliah', href: '/admin-prodi/mata-kuliah', icon: '📚', badge: 'R/W', badgeColor: 'green' },
    { label: 'Kelola Dosen', href: '/admin-prodi/dosen', icon: '👨‍🏫', badge: 'R/W', badgeColor: 'green' },
    { label: 'Data Mahasiswa', href: '/admin-prodi/mahasiswa', icon: '👨‍🎓', badge: 'R', badgeColor: 'blue' },
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
                fontSize: '22px',
                boxShadow: '0 4px 12px rgba(239, 253, 163, 0.3)',
              }}
            >
              👨‍💼
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
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.05em',
                      background:
                        item.badgeColor === 'green'
                          ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
                          : 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
                      color: item.badgeColor === 'green' ? '#065F46' : '#1E40AF',
                      border: item.badgeColor === 'green' ? '1px solid #6EE7B7' : '1px solid #93C5FD',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
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
              <span style={{ fontSize: '16px' }}>💡</span>
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
