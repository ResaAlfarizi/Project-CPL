'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Default sidebar terbuka di desktop, tertutup di mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['dosen', 'Dosen']}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onClose={() => setSidebarCollapsed(true)} 
        />
        
        <div style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? '0' : '270px',
          transition: 'margin-left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
          className="main-wrapper"
        >
          <Header 
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
            sidebarCollapsed={sidebarCollapsed}
          />
          
          <main style={{
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
    </ProtectedRoute>
  );
}
