'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, auditLogApi } from '@/lib/api';

export default function SuperadminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProdi: 0,
    totalCpl: 0,
    totalDosen: 0,
    totalMahasiswa: 0,
    totalMk: 0,
    totalMkCpl: 0,
    totalSubCpmk: 0,
    totalActivities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Load data from database
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Fetch all data in parallel from modul 1 API
      const [usersRes, prodiRes, cplRes, dosenRes, mhsRes, mkRes, mkcplRes, subRes, auditRes] = await Promise.all([
        userApi.getAll().catch(() => ({ data: [] })),
        fetch('http://localhost:3000/api/v1/m1/prodi', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('http://localhost:3000/api/v1/m1/kurikulum/cpl', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('http://localhost:3000/api/v1/m1/dosen', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('http://localhost:3000/api/v1/m1/mahasiswa', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('http://localhost:3000/api/v1/m1/kurikulum/mk', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('http://localhost:3000/api/v1/m1/kurikulum/mapping', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('http://localhost:3000/api/v1/m1/kurikulum/sub-cpmk', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ data: [] })),
        auditLogApi.getAll().catch(() => ({ data: [] })),
      ]);

      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalProdi: prodiRes.data?.length || 0,
        totalCpl: cplRes.data?.length || 0,
        totalDosen: dosenRes.data?.length || 0,
        totalMahasiswa: mhsRes.data?.length || 0,
        totalMk: mkRes.data?.length || 0,
        totalMkCpl: mkcplRes.data?.length || 0,
        totalSubCpmk: subRes.data?.length || 0,
        totalActivities: auditRes.data?.length || 0,
      });

      // Get recent 4 activities from audit log
      const recent = (auditRes.data || [])
        .slice(0, 4)
        .map((log: any) => ({
          user: log.user_name || log.user_email || 'Unknown',
          action: log.event_type,
          resource: getResourceFromEvent(log.event_type),
          time: getTimeAgo(log.created_at),
          type: getActionType(log.event_type),
        }));
      
      setRecentActivities(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResourceFromEvent = (eventType: string) => {
    if (eventType.includes('login')) return 'Authentication';
    if (eventType.includes('logout')) return 'Authentication';
    if (eventType.includes('password')) return 'User Management';
    return 'System';
  };

  const getActionType = (eventType: string) => {
    if (eventType.includes('success') || eventType === 'password_changed') return 'create';
    if (eventType.includes('failed') || eventType === 'account_locked') return 'delete';
    if (eventType === 'logout') return 'update';
    return 'read';
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  };

  // System stats
  const systemStats = [
    { 
      label: 'Program Studi', 
      value: loading ? '...' : String(stats.totalProdi), 
      href: '/superadmin/prodi',
      color: 'blue',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/></svg>
    },
    { 
      label: 'CPL Terdaftar', 
      value: loading ? '...' : String(stats.totalCpl), 
      href: '/superadmin/cpl',
      color: 'green',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    },
    { 
      label: 'Dosen', 
      value: loading ? '...' : String(stats.totalDosen), 
      href: '/superadmin/dosen',
      color: 'yellow',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    },
    { 
      label: 'Mahasiswa', 
      value: loading ? '...' : String(stats.totalMahasiswa), 
      href: '/superadmin/mahasiswa',
      color: 'purple',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    { 
      label: 'Mata Kuliah', 
      value: loading ? '...' : String(stats.totalMk), 
      href: '/superadmin/mata-kuliah-master',
      color: 'orange',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    },
    { 
      label: 'Pemetaan MK-CPL', 
      value: loading ? '...' : String(stats.totalMkCpl), 
      href: '/superadmin/mapping',
      color: 'cyan',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
    },
    { 
      label: 'Sub-CPMK', 
      value: loading ? '...' : String(stats.totalSubCpmk), 
      href: '/superadmin/sub-cpmk',
      color: 'red',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
    },
  ];

  // Quick access links
  const quickLinks = [
    { label: 'Program Studi', href: '/superadmin/prodi', desc: 'Kelola program studi', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/></svg> },
    { label: 'CPL', href: '/superadmin/cpl', desc: 'Definisikan CPL per Prodi', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    { label: 'Dosen & Mahasiswa', href: '/superadmin/dosen', desc: 'Daftarkan Dosen & Mahasiswa', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: 'Mata Kuliah', href: '/superadmin/mata-kuliah-master', desc: 'Tambah Mata Kuliah', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
    { label: 'Pemetaan MK-CPL', href: '/superadmin/mapping', desc: 'Petakan MK → CPL', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg> },
    { label: 'Sub-CPMK', href: '/superadmin/sub-cpmk', desc: 'Definisikan Sub-CPMK', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg> },
    { label: 'Threshold', href: '/superadmin/threshold', desc: 'Atur Threshold Status', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg> },
    { label: 'Manajemen User', href: '/superadmin/users', desc: 'Kelola pengguna sistem', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  ];

  return (
    <>
      {/* Greeting */}
      <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '6px' }}>
          Selamat Datang, {user?.nama || 'Superadmin'}! 👋
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
          Berikut ringkasan aktivitas Anda hari ini
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {systemStats.map((stat, index) => (
          <Link
            key={index}
            href={stat.href}
            className={`card animate-fade-in stagger-${index + 1}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(33,33,33,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 
                  stat.color === 'blue' ? 'var(--alice-blue)' :
                  stat.color === 'green' ? 'var(--honeydew)' :
                  stat.color === 'yellow' ? 'var(--vanilla)' :
                  stat.color === 'purple' ? '#e8e4f7' :
                  stat.color === 'orange' ? '#fde8cc' :
                  stat.color === 'cyan' ? '#cceeff' :
                  stat.color === 'red' ? '#ffe0e0' :
                  'var(--alice-blue)',
                color: 'var(--eerie-black)',
                flexShrink: 0,
              }}
            >
              {stat.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {stat.label}
              </p>
              <span style={{ fontSize: '28px', fontWeight: '700', color: 'var(--eerie-black)' }}>
                {stat.value}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '16px' }}>
          Mulai Cepat
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {quickLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`card animate-fade-in stagger-${i + 1}`}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '16px',
              }}
            >
              <div style={{ color: 'var(--eerie-black)' }}>{link.icon}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '2px' }}>
                  {link.label}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="animate-fade-in">
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '16px' }}>
          Aktivitas Terbaru
        </h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
              <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <p style={{ fontWeight: '600', fontSize: '16px' }}>Belum ada aktivitas</p>
              <p>Aktivitas sistem akan muncul di sini</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Aksi</th>
                  <th>Resource</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '600' }}>{activity.user}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor:
                              activity.type === 'create'
                                ? 'var(--honeydew)'
                                : activity.type === 'update'
                                ? 'var(--vanilla)'
                                : activity.type === 'delete'
                                ? '#fde8e8'
                                : 'var(--alice-blue)',
                            color:
                              activity.type === 'create'
                                ? '#2d5a2d'
                                : activity.type === 'update'
                                ? '#5a5a00'
                                : activity.type === 'delete'
                                ? '#9b1c1c'
                                : '#2d3a5a',
                          }}
                        >
                          {activity.type === 'create'
                            ? 'SUCCESS'
                            : activity.type === 'update'
                            ? 'UPDATE'
                            : activity.type === 'delete'
                            ? 'FAILED'
                            : 'INFO'}
                        </span>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                          {activity.action}
                        </span>
                      </div>
                    </td>
                    <td>{activity.resource}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{activity.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
