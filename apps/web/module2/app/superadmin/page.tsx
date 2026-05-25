'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SuperadminDashboard() {
  const { user } = useAuth();

  // System stats
  const systemStats = [
    { 
      label: 'Total Users', 
      value: '45', 
      change: '+5', 
      trend: 'up',
      color: 'yellow',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    { 
      label: 'Program Studi', 
      value: '12', 
      change: '+2', 
      trend: 'up',
      color: 'green',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/></svg>
    },
    { 
      label: 'Mata Kuliah', 
      value: '87', 
      change: '+8', 
      trend: 'up',
      color: 'blue',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    },
    { 
      label: 'Aktivitas', 
      value: '128', 
      change: '+23', 
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

  // Recent activities
  const recentActivities = [
    {
      user: 'Admin Prodi',
      action: 'Tambah mata kuliah',
      resource: 'Mata Kuliah',
      time: '5 menit lalu',
      type: 'create',
    },
    {
      user: 'Dosen A',
      action: 'Update nilai',
      resource: 'Input Nilai',
      time: '15 menit lalu',
      type: 'update',
    },
    {
      user: 'Superadmin',
      action: 'Hapus user',
      resource: 'Manajemen User',
      time: '1 jam lalu',
      type: 'delete',
    },
    {
      user: 'Admin Prodi',
      action: 'Lihat capaian',
      resource: 'Capaian CPL',
      time: '2 jam lalu',
      type: 'read',
    },
  ];

  return (
    <>
      {/* Greeting */}
      <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '6px' }}>
          Selamat Datang, {user?.username || 'Superadmin'}! 👋
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
                          ? 'CREATE'
                          : activity.type === 'update'
                          ? 'UPDATE'
                          : activity.type === 'delete'
                          ? 'DELETE'
                          : 'READ'}
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
        </div>
      </div>
    </>
  );
}
