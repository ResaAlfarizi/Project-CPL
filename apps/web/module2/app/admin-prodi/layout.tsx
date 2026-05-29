'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminProdiSidebar from '@/components/admin-prodi/AdminProdiSidebar';
import AdminProdiHeader from '@/components/admin-prodi/AdminProdiHeader';

export default function AdminProdiLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen to resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role?.toLowerCase() !== 'admin prodi' && user.role?.toLowerCase() !== 'admin_prodi') {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--ghost-white)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              border: '4px solid #E5E7EB',
              borderTopColor: '#212121',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#6B7280', fontSize: '14px', fontWeight: '600' }}>Memuat...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!user || (user.role?.toLowerCase() !== 'admin prodi' && user.role?.toLowerCase() !== 'admin_prodi')) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--ghost-white)' }}>
      <AdminProdiSidebar collapsed={sidebarCollapsed} onClose={() => setSidebarCollapsed(true)} />

      <div
        style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? '0' : '270px',
          transition: 'margin-left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
        }}
        className="main-wrapper"
      >
        <AdminProdiHeader
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main
          style={{
            flex: 1,
            padding: '32px',
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
          className="main-content"
        >
          {children}
        </main>
      </div>

      <style jsx>{`
        @media (max-width: 1023px) {
          .main-wrapper {
            margin-left: 0 !important;
          }
          .main-content {
            padding: 20px !important;
          }
        }
        
        @media (max-width: 640px) {
          .main-content {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
