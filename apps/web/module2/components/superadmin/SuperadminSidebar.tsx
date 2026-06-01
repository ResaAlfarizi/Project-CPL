'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileCheck,
  ClipboardList,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Target,
  UserCheck,
  UsersRound,
  Link as LinkIcon,
  Gauge,
  X
} from 'lucide-react';

interface SuperadminSidebarProps {
  collapsed: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/superadmin',
  },
  {
    section: 'MASTER DATA',
  },
  {
    icon: GraduationCap,
    label: 'Program Studi',
    href: '/superadmin/prodi',
  },
  {
    icon: Target,
    label: 'CPL',
    href: '/superadmin/cpl',
  },
  {
    icon: UserCheck,
    label: 'Dosen',
    href: '/superadmin/dosen',
  },
  {
    icon: UsersRound,
    label: 'Mahasiswa',
    href: '/superadmin/mahasiswa',
  },
  {
    icon: BookOpen,
    label: 'Mata Kuliah',
    href: '/superadmin/mata-kuliah-master',
  },
  {
    icon: LinkIcon,
    label: 'Pemetaan MK-CPL',
    href: '/superadmin/mapping',
  },
  {
    icon: FileCheck,
    label: 'Sub-CPMK',
    href: '/superadmin/sub-cpmk',
  },
  {
    icon: Gauge,
    label: 'Threshold',
    href: '/superadmin/threshold',
  },
  {
    section: 'OPERASIONAL',
  },
  {
    icon: Users,
    label: 'Manajemen User',
    href: '/superadmin/users',
  },
  {
    icon: ClipboardList,
    label: 'Input Nilai',
    href: '/superadmin/input-nilai',
  },
  {
    icon: TrendingUp,
    label: 'Monitoring CPL',
    href: '/superadmin/capaian',
  },
  {
    icon: FileText,
    label: 'Audit Log',
    href: '/superadmin/audit-log',
  },
  {
    section: 'PENGATURAN',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/superadmin/settings',
  },
];

export default function SuperadminSidebar({ collapsed, onClose }: SuperadminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay untuk mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: collapsed ? '-270px' : '0',
          width: '270px',
          height: '100vh',
          backgroundColor: '#212121',
          borderRight: '1px solid rgba(216, 223, 233, 0.1)',
          transition: 'left 0.3s ease',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Urbanist, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid rgba(216, 223, 233, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#CFDECA',
                marginBottom: '4px',
              }}
            >
              SUPERADMIN
            </h2>
            <p style={{ fontSize: '12px', color: '#D8DFE9', opacity: 0.7 }}>
              Panel Kontrol
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden"
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(216, 223, 233, 0.1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} color="#F6F5FA" />
          </button>
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map((item, index) => {
              // Section header
              if ('section' in item) {
                return (
                  <li key={`section-${index}`} style={{ marginTop: index === 0 ? '0' : '20px', marginBottom: '8px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#D8DFE9',
                      opacity: 0.5,
                      padding: '0 16px',
                      letterSpacing: '0.5px',
                    }}>
                      {item.section}
                    </div>
                  </li>
                );
              }

              // Menu item
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href} style={{ marginBottom: '4px' }}>
                  <Link
                    href={item.href!}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#212121' : '#F6F5FA',
                      backgroundColor: isActive ? '#EFFDA3' : 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(216, 223, 233, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(216, 223, 233, 0.1)',
          }}
        >
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(207, 222, 202, 0.1)',
              border: '1px solid rgba(207, 222, 202, 0.2)',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                color: '#CFDECA',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              🔒 Akses penuh ke semua fitur sistem
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
