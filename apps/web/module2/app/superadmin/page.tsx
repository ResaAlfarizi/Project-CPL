'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, prodiApi, kelasApi, auditLogApi } from '@/lib/api';

export default function SuperadminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProdi: 0,
    totalKelas: 0,
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
      
      // Fetch all data in parallel
      const [usersRes, prodiRes, kelasRes, auditRes] = await Promise.all([
        userApi.getAll().catch(() => ({ data: [] })),
        prodiApi.getAll().catch(() => ({ data: [] })),
        kelasApi.getAll().catch(() => ({ data: [] })),
        auditLogApi.getAll().catch(() => ({ data: [] })),
      ]);

      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalProdi: prodiRes.data?.length || 0,
        totalKelas: kelasRes.data?.length || 0,
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
      label: 'Total Users', 
      value: loading ? '...' : String(stats.totalUsers), 
      change: '', 
      trend: 'up',
      color: 'yellow',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    { 
      label: 'Program Studi', 
      value: loading ? '...' : String(stats.totalProdi), 
      change: '', 
      trend: 'up',
      color: 'green',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/></svg>
    },
    { 
      label: 'Mata Kuliah', 
      value: loading ? '...' : String(stats.totalKelas), 
      change: '', 
      trend: 'up',
      color: 'blue',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    },
    { 
      label: 'Aktivitas', 
      value: loading ? '...' : String(stats.totalActivities), 
      change: '', 
      trend: 'up',
      color: 'green',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    },
  ];

  // Quick access links
  const quickLinks = [
    { label: 'Program Studi & CPL', href: '/superadmin/prodi-cpl', desc: 'Kelola program studi', color: 'var(--vanilla)', icon: '🎓' },
    { label: 'Manajemen User', href: '/superadmin/users', desc: 'Kelola pengguna sistem', color: 'var(--honeydew)', icon: '👥' },
    { label: 'Audit Log', href: '/superadmin/audit-log', desc: 'Pantau aktivitas sistem', color: 'var(--alice-blue)', icon: '📄' },
    { label: 'Pengaturan', href: '/superadmin/settings', desc: 'Konfigurasi sistem', color: '#fff', icon: '⚙️' },
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {systemStats.map((stat, index) => (
          <div
            key={index}
            className={`card animate-fade-in stagger-${index + 1}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
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
                backgroundColor: stat.color === 'yellow' ? 'var(--vanilla)' : stat.color === 'green' ? 'var(--honeydew)' : 'var(--alice-blue)',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: '700', color: 'var(--eerie-black)' }}>
                  {stat.value}
                </span>
                {stat.change && (
                  <span
                    className="badge"
                    style={{
                      backgroundColor: stat.trend === 'up' ? 'var(--honeydew)' : '#fde8e8',
                      color: stat.trend === 'up' ? '#2d5a2d' : '#9b1c1c',
                      fontSize: '11px',
                    }}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '16px' }}>
          Akses Cepat
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {quickLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`card animate-fade-in stagger-${i + 1}`}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                borderLeft: `4px solid ${link.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{link.icon}</span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--eerie-black)' }}>
                  {link.label}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{link.desc}</p>
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
