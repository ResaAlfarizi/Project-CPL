'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import MahasiswaSidebar from '@/components/mahasiswa/MahasiswaSidebar';
import MahasiswaHeader from '@/components/mahasiswa/MahasiswaHeader';

export default function MahasiswaLayout({ children }: { children: React.ReactNode }) {
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

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role?.toLowerCase() !== 'mahasiswa') {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f9fafb',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTopColor: 'var(--eerie-black)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Memuat...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user || user.role?.toLowerCase() !== 'mahasiswa') {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <MahasiswaSidebar
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarCollapsed(true)}
      />

      <div
        style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? '0' : '270px',
          transition: 'margin-left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
        className="main-wrapper"
      >
        <MahasiswaHeader
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main
          style={{
            flex: 1,
            padding: '32px',
            minWidth: 0,
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
            padding: 24px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
