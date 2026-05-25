'use client';

import React, { useState } from 'react';

interface SubCPMK {
  id: number;
  kodeSubCPMK: string;
  deskripsi: string;
  mataKuliah: string;
  bobot: number;
}

export default function SubCPMKPage() {
  const [items] = useState<SubCPMK[]>([
    { id: 1, kodeSubCPMK: 'CPMK-1.1', deskripsi: 'Mahasiswa mampu memahami konsep dasar HTML', mataKuliah: 'Pemrograman Web', bobot: 20 },
    { id: 2, kodeSubCPMK: 'CPMK-1.2', deskripsi: 'Mahasiswa mampu membuat layout dengan CSS', mataKuliah: 'Pemrograman Web', bobot: 25 },
    { id: 3, kodeSubCPMK: 'CPMK-2.1', deskripsi: 'Mahasiswa mampu merancang database', mataKuliah: 'Basis Data', bobot: 30 },
    { id: 4, kodeSubCPMK: 'CPMK-2.2', deskripsi: 'Mahasiswa mampu menulis query SQL', mataKuliah: 'Basis Data', bobot: 25 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredItems = items.filter(item =>
    item.kodeSubCPMK.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Sub-CPMK</h1>
        <p className="page-subtitle">Kelola sub capaian pembelajaran mata kuliah</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari sub-CPMK..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah Sub-CPMK
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada sub-CPMK ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode Sub-CPMK</th>
                <th>Deskripsi</th>
                <th>Mata Kuliah</th>
                <th>Bobot (%)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-blue">{item.kodeSubCPMK}</span></td>
                  <td style={{ maxWidth: '300px' }}>{item.deskripsi}</td>
                  <td style={{ fontWeight: '600' }}>{item.mataKuliah}</td>
                  <td><span className="badge badge-yellow">{item.bobot}%</span></td>
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
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Tambah Sub-CPMK</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>Form untuk menambah sub-CPMK akan ditampilkan di sini.</p>
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
