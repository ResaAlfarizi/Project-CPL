'use client';

import React, { useState, useEffect } from 'react';
import { auditLogApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';

interface AuditLog {
  id: number;
  user_id: number;
  user_email?: string;
  user_name?: string;
  event_type: string;
  ip_address?: string;
  user_agent?: string;
  detail?: any;
  created_at: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogApi.getAll();
      setLogs(response.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat audit log', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      // Prepare CSV data
      const headers = ['No', 'Timestamp', 'Nama User', 'Email', 'Event Type', 'IP Address', 'Status'];
      const csvData = filteredLogs.map((log, index) => [
        index + 1,
        new Date(log.created_at).toLocaleString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        log.user_name || 'Unknown',
        log.user_email || `User ID: ${log.user_id}`,
        log.event_type,
        log.ip_address || '-',
        log.event_type.includes('success') || log.event_type === 'logout' || log.event_type === 'password_changed' 
          ? 'success' 
          : log.event_type.includes('failed') || log.event_type === 'account_locked'
          ? 'failed'
          : 'pending'
      ]);

      // Convert to CSV string
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Audit log berhasil diexport', 'success');
    } catch (error) {
      showToast('Gagal export audit log', 'error');
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = 
      (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.user_name && log.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterAction === 'all' || log.event_type === filterAction;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Audit Log</h1>
        <p className="page-subtitle">Pantau dan audit aktivitas sistem</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', maxWidth: '300px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Cari log..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
          </div>
          <select className="select-field" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} style={{ minWidth: '150px' }}>
            <option value="all">Semua Event</option>
            <option value="login_success">Login Success</option>
            <option value="login_failed">Login Failed</option>
            <option value="logout">Logout</option>
            <option value="token_refresh">Token Refresh</option>
            <option value="account_locked">Account Locked</option>
            <option value="password_reset_req">Password Reset Request</option>
            <option value="password_changed">Password Changed</option>
          </select>
        </div>
        <button className="btn btn-secondary" onClick={handleExport} disabled={filteredLogs.length === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada log ditemukan</p>
            <p>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Timestamp</th>
                <th>User</th>
                <th>Event</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={log.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString('id-ID', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>
                        {log.user_name || 'Unknown'}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {log.user_email || `User ID: ${log.user_id}`}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      log.event_type === 'login_success' ? 'badge-green' :
                      log.event_type === 'login_failed' ? 'badge-red' :
                      log.event_type === 'logout' ? 'badge-blue' :
                      log.event_type === 'token_refresh' ? 'badge-yellow' :
                      log.event_type === 'account_locked' ? 'badge-red' :
                      log.event_type === 'password_reset_req' ? 'badge-yellow' :
                      log.event_type === 'password_changed' ? 'badge-green' :
                      'badge-dark'
                    }`}>
                      {log.event_type}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                    {log.ip_address || '-'}
                  </td>
                  <td>
                    <span className={`badge ${
                      log.event_type.includes('success') || log.event_type === 'logout' || log.event_type === 'password_changed' 
                        ? 'badge-green' 
                        : log.event_type.includes('failed') || log.event_type === 'account_locked'
                        ? 'badge-red'
                        : 'badge-yellow'
                    }`}>
                      {log.event_type.includes('success') || log.event_type === 'logout' || log.event_type === 'password_changed' 
                        ? 'success' 
                        : log.event_type.includes('failed') || log.event_type === 'account_locked'
                        ? 'failed'
                        : 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
