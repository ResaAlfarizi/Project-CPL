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
    <div className="sa-page">
      <ToastContainer />
      
      {/* Header */}
      <div className="sa-page-header">
        <h1 className="sa-page-title">Audit Log</h1>
        <p className="sa-page-subtitle">Pantau dan audit aktivitas sistem</p>
      </div>

      {/* Toolbar */}
      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <div className="sa-search">
            <span className="sa-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Cari log..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="sa-search-input"
            />
          </div>
          <select 
            className="sa-select" 
            value={filterAction} 
            onChange={(e) => setFilterAction(e.target.value)}
          >
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
        <div className="sa-toolbar-right">
          <button 
            className="sa-btn sa-btn-secondary" 
            onClick={handleExport} 
            disabled={filteredLogs.length === 0}
          >
            <span>📥</span>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="sa-card">
        {loading ? (
          <div className="sa-card-body" style={{ textAlign: 'center' }}>
            <div style={{ height: '20px', width: '200px', margin: '0 auto 12px', background: '#e5e7eb', borderRadius: '4px' }} />
            <div style={{ height: '16px', width: '300px', margin: '0 auto', background: '#e5e7eb', borderRadius: '4px' }} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty-icon">📋</div>
            <div className="sa-empty-title">Tidak ada log ditemukan</div>
            <div className="sa-empty-text">Coba ubah filter atau kata kunci pencarian</div>
          </div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
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
                        <span className="sa-font-semibold" style={{ fontSize: '13px' }}>
                          {log.user_name || 'Unknown'}
                        </span>
                        <span className="sa-text-muted" style={{ fontSize: '12px' }}>
                          {log.user_email || `User ID: ${log.user_id}`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`sa-badge ${
                        log.event_type === 'login_success' ? 'sa-badge-success' :
                        log.event_type === 'login_failed' ? 'sa-badge-danger' :
                        log.event_type === 'logout' ? 'sa-badge-secondary' :
                        log.event_type === 'token_refresh' ? 'sa-badge-warning' :
                        log.event_type === 'account_locked' ? 'sa-badge-danger' :
                        log.event_type === 'password_reset_req' ? 'sa-badge-warning' :
                        log.event_type === 'password_changed' ? 'sa-badge-success' :
                        'sa-badge-primary'
                      }`}>
                        {log.event_type}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                      {log.ip_address || '-'}
                    </td>
                    <td>
                      <span className={`sa-badge ${
                        log.event_type.includes('success') || log.event_type === 'logout' || log.event_type === 'password_changed' 
                          ? 'sa-badge-success' 
                          : log.event_type.includes('failed') || log.event_type === 'account_locked'
                          ? 'sa-badge-danger'
                          : 'sa-badge-warning'
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
          </div>
        )}
      </div>
    </div>
  );
}
