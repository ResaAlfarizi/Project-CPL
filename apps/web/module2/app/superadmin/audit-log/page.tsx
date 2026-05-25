'use client';

import React, { useState } from 'react';

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  resource: string;
  details: string;
  ipAddress: string;
}

export default function AuditLogPage() {
  const [logs] = useState<AuditLog[]>([
    { id: 1, timestamp: '2024-05-25 14:30:15', user: 'admin_prodi', action: 'CREATE', resource: 'Mata Kuliah', details: 'Menambahkan mata kuliah "Pemrograman Web"', ipAddress: '192.168.1.100' },
    { id: 2, timestamp: '2024-05-25 14:15:42', user: 'dosen_a', action: 'UPDATE', resource: 'Input Nilai', details: 'Mengupdate nilai Sub-CPMK mahasiswa 001', ipAddress: '192.168.1.105' },
    { id: 3, timestamp: '2024-05-25 13:45:20', user: 'superadmin', action: 'DELETE', resource: 'Manajemen User', details: 'Menghapus user "user_inactive"', ipAddress: '192.168.1.1' },
    { id: 4, timestamp: '2024-05-25 13:20:10', user: 'admin_prodi', action: 'READ', resource: 'Capaian CPL', details: 'Melihat capaian CPL mahasiswa angkatan 2023', ipAddress: '192.168.1.100' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterAction === 'all' || log.action === filterAction;
    return matchSearch && matchFilter;
  });

  return (
    <>
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
            <option value="all">Semua Aksi</option>
            <option value="CREATE">CREATE</option>
            <option value="READ">READ</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <button className="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredLogs.length === 0 ? (
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
                <th>Aksi</th>
                <th>Resource</th>
                <th>Detail</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={log.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                  <td style={{ fontWeight: '600' }}>{log.user}</td>
                  <td>
                    <span className={`badge ${
                      log.action === 'CREATE' ? 'badge-green' :
                      log.action === 'UPDATE' ? 'badge-yellow' :
                      log.action === 'DELETE' ? 'badge-red' : 'badge-blue'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.resource}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{log.details}</td>
                  <td style={{ fontSize: '13px', fontFamily: 'monospace' }}>{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
