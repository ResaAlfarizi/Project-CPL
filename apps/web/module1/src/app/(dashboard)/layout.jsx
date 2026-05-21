'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ToastContainer from '@/components/ui/Toast';

function DashboardShell({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    const observer = new MutationObserver(() => {
      setSidebarCollapsed(sidebar.classList.contains('collapsed'));
    });
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="animate-pulse" style={{ fontSize: 40 }}>🎓</div>
    </div>
  );
  if (!user) return null;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Topbar pathname={pathname} />
        <main className="page-content fade-in">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
