'use client';

import React, { useState } from 'react';

interface ProdiCPL {
  id: number;
  kodeProdi: string;
  namaProdi: string;
  jumlahCPL: number;
  fakultas: string;
  status: 'active' | 'inactive';
}

export default function ProdiCPLPage() {
  const [items] = useState<ProdiCPL[]>([
    { id: 1, kodeProdi: 'TI', namaProdi: 'Teknik Informatika', jumlahCPL: 12, fakultas: 'Teknik', status: 'active' },
    { id: 2, kodeProdi: 'SI', namaProdi: 'Sistem Informasi', jumlahCPL: 10, fakultas: 'Teknik', status: 'active' },
    { id: 3, kodeProdi: 'TE', namaProdi: 'Teknik Elektro', jumlahCPL: 11, fakultas: 'Teknik', status: 'active' },
    { id: 4, kodeProdi: 'TM', namaProdi: 'Teknik Mesin', jumlahCPL: 9, fakultas: 'Teknik', status: 'inactive' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredItems = items.filter(item =>
    item.namaProdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kodeProdi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Program Studi & CPL</h1>
        <p className="page-subtitle">Kelola program studi dan capaian pembelajaran lulusan</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari program studi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah Program Studi
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada program studi ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Nama Program Studi</th>
                <th>Fakultas</th>
                <th>Jumlah CPL</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-dark">{item.kodeProdi}</span></td>
                  <td style={{ fontWeight: '600' }}>{item.namaProdi}</td>
                  <td>{item.fakultas}</td>
                  <td><span className="badge badge-blue">{item.jumlahCPL} CPL</span></td>
                  <td>
                    <span className={`badge ${item.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                      {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-accent btn-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        CPL
                      </button>
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
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Tambah Program Studi</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>Form untuk menambah program studi akan ditampilkan di sini.</p>
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
