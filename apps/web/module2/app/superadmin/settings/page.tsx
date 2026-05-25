'use client';

import React, { useState } from 'react';

interface SystemConfig {
  id: number;
  kategori: string;
  namaConfig: string;
  nilai: string;
  deskripsi: string;
  terakhirDiubah: string;
}

export default function SettingsPage() {
  const [configs] = useState<SystemConfig[]>([
    { id: 1, kategori: 'Sistem', namaConfig: 'Nama Aplikasi', nilai: 'CPL Management System', deskripsi: 'Nama aplikasi yang ditampilkan', terakhirDiubah: '2024-03-15' },
    { id: 2, kategori: 'Sistem', namaConfig: 'Tahun Akademik Aktif', nilai: '2024/2025', deskripsi: 'Tahun akademik yang sedang berjalan', terakhirDiubah: '2024-03-10' },
    { id: 3, kategori: 'Threshold', namaConfig: 'Batas Minimal CPL', nilai: '70', deskripsi: 'Nilai minimal untuk CPL tercapai (%)', terakhirDiubah: '2024-02-20' },
    { id: 4, kategori: 'Threshold', namaConfig: 'Batas Minimal Sub-CPMK', nilai: '65', deskripsi: 'Nilai minimal untuk Sub-CPMK tercapai (%)', terakhirDiubah: '2024-02-20' },
    { id: 5, kategori: 'Email', namaConfig: 'SMTP Server', nilai: 'smtp.gmail.com', deskripsi: 'Server SMTP untuk pengiriman email', terakhirDiubah: '2024-01-15' },
    { id: 6, kategori: 'Email', namaConfig: 'SMTP Port', nilai: '587', deskripsi: 'Port SMTP server', terakhirDiubah: '2024-01-15' },
  ]);

  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [showModal, setShowModal] = useState(false);

  const kategoris = ['Semua', 'Sistem', 'Threshold', 'Email'];

  const filteredConfigs = selectedKategori === 'Semua' 
    ? configs 
    : configs.filter(c => c.kategori === selectedKategori);

  return (
    <>
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Pengaturan Sistem</h1>
        <p className="page-subtitle">Konfigurasi dan pengaturan sistem aplikasi</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '4px' }}>
            Filter:
          </span>
          {kategoris.map((kategori) => (
            <button
              key={kategori}
              onClick={() => setSelectedKategori(kategori)}
              className={`badge ${selectedKategori === kategori ? 'badge-dark' : ''}`}
              style={{
                cursor: 'pointer',
                padding: '6px 14px',
                backgroundColor: selectedKategori === kategori ? 'var(--eerie-black)' : '#f3f4f6',
                color: selectedKategori === kategori ? '#fff' : '#6b7280',
                border: 'none',
              }}
            >
              {kategori}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah Konfigurasi
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredConfigs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H5m13.2 5.2l-4.2-4.2m0-6l4.2-4.2"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada konfigurasi ditemukan</p>
            <p>Coba ubah filter kategori</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kategori</th>
                <th>Nama Konfigurasi</th>
                <th>Nilai</th>
                <th>Deskripsi</th>
                <th>Terakhir Diubah</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredConfigs.map((config, index) => (
                <tr key={config.id}>
                  <td>{index + 1}</td>
                  <td>
                    <span className={`badge ${
                      config.kategori === 'Sistem' ? 'badge-blue' :
                      config.kategori === 'Threshold' ? 'badge-yellow' : 'badge-green'
                    }`}>
                      {config.kategori}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>{config.namaConfig}</td>
                  <td>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      backgroundColor: '#f3f4f6', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}>
                      {config.nilai}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{config.deskripsi}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{config.terakhirDiubah}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button className="btn btn-sm" style={{ backgroundColor: '#fdecea', color: '#e74c3c' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Tambah Konfigurasi Baru</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>Form untuk menambah konfigurasi akan ditampilkan di sini.</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">Batal</button>
              <button onClick={() => setShowModal(false)} className="btn btn-primary">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
