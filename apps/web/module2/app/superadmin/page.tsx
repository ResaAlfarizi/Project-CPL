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
    <div className="sa-page">
      {/* Greeting */}
      <div className="sa-page-header">
        <h1 className="sa-page-title">
          Selamat Datang, {user?.nama || 'Superadmin'}! 👋
        </h1>
        <p className="sa-page-subtitle">
          Berikut ringkasan aktivitas Anda hari ini
        </p>
      </div>

      {/* Stats */}
      <div className="sa-stats-grid">
        {systemStats.map((stat, index) => (
          <Link
            key={index}
            href={stat.href}
            className="sa-stat-card"
            style={{ textDecoration: 'none' }}
          >
            <div className="sa-stat-icon">
              {stat.icon}
            </div>
            <div className="sa-stat-content">
              <div className="sa-stat-label">{stat.label}</div>
              <div className="sa-stat-value">{loading ? '...' : stat.value}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="sa-mb-24">
        <h2 className="sa-card-title sa-mb-16">Mulai Cepat</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {quickLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="sa-card"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
              }}
            >
              <div style={{ color: 'var(--sa-text)' }}>{link.icon}</div>
              <div>
                <div className="sa-font-bold" style={{ fontSize: '14px', marginBottom: '2px' }}>
                  {link.label}
                </div>
                <p className="sa-text-muted" style={{ fontSize: '12px', margin: 0 }}>{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="sa-card-title sa-mb-16">Aktivitas Terbaru</h2>
        <div className="sa-card">
          {loading ? (
            <div className="sa-card-body" style={{ textAlign: 'center' }}>
              <div style={{ height: '20px', width: '200px', margin: '0 auto 12px', background: '#e5e7eb', borderRadius: '4px' }} />
              <div style={{ height: '16px', width: '300px', margin: '0 auto', background: '#e5e7eb', borderRadius: '4px' }} />
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="sa-empty">
              <div className="sa-empty-icon">📋</div>
              <div className="sa-empty-title">Belum ada aktivitas</div>
              <div className="sa-empty-text">Aktivitas sistem akan muncul di sini</div>
            </div>
          ) : (
            <div className="sa-table-wrapper">
              <table className="sa-table">
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
                      <td className="sa-font-semibold">{activity.user}</td>
                      <td>
                        <div className="sa-flex sa-gap-8">
                          <span
                            className={`sa-badge ${
                              activity.type === 'create'
                                ? 'sa-badge-success'
                                : activity.type === 'update'
                                ? 'sa-badge-warning'
                                : activity.type === 'delete'
                                ? 'sa-badge-danger'
                                : 'sa-badge-secondary'
                            }`}
                          >
                            {activity.type === 'create'
                              ? 'SUCCESS'
                              : activity.type === 'update'
                              ? 'UPDATE'
                              : activity.type === 'delete'
                              ? 'FAILED'
                              : 'INFO'}
                          </span>
                          <span className="sa-text-muted" style={{ fontSize: '14px' }}>
                            {activity.action}
                          </span>
                        </div>
                      </td>
                      <td>{activity.resource}</td>
                      <td className="sa-text-muted">{activity.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
