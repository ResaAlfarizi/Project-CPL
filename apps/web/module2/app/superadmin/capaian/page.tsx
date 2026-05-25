'use client';

import React, { useState } from 'react';

interface CapaianCPL {
  id: number;
  nim: string;
  namaMahasiswa: string;
  prodi: string;
  cpl: string;
  capaian: number;
  status: 'Tercapai' | 'Belum Tercapai' | 'Dalam Progress';
  semester: string;
}

export default function CapaianPage() {
  const [capaianList] = useState<CapaianCPL[]>([
    { id: 1, nim: '2021001', namaMahasiswa: 'Ahmad Fauzi', prodi: 'Teknik Informatika', cpl: 'CPL-1', capaian: 85, status: 'Tercapai', semester: 'Ganjil 2024/2025' },
    { id: 2, nim: '2021002', namaMahasiswa: 'Siti Nurhaliza', prodi: 'Sistem Informasi', cpl: 'CPL-2', capaian: 92, status: 'Tercapai', semester: 'Ganjil 2024/2025' },
    { id: 3, nim: '2021003', namaMahasiswa: 'Budi Santoso', prodi: 'Teknik Informatika', cpl: 'CPL-1', capaian: 65, status: 'Belum Tercapai', semester: 'Ganjil 2024/2025' },
    { id: 4, nim: '2021004', namaMahasiswa: 'Dewi Lestari', prodi: 'Sistem Informasi', cpl: 'CPL-3', capaian: 75, status: 'Dalam Progress', semester: 'Ganjil 2024/2025' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredCapaian = capaianList.filter(capaian =>
    capaian.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    capaian.namaMahasiswa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Capaian CPL Mahasiswa</h1>
        <p className="page-subtitle">Pantau capaian pembelajaran lulusan mahasiswa</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari mahasiswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Laporan
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Data
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredCapaian.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada data capaian ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIM</th>
                <th>Nama Mahasiswa</th>
                <th>Program Studi</th>
                <th>CPL</th>
                <th>Capaian (%)</th>
                <th>Status</th>
                <th>Semester</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCapaian.map((capaian, index) => (
                <tr key={capaian.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-dark">{capaian.nim}</span></td>
                  <td style={{ fontWeight: '600' }}>{capaian.namaMahasiswa}</td>
                  <td style={{ fontSize: '13px' }}>{capaian.prodi}</td>
                  <td><span className="badge badge-blue">{capaian.cpl}</span></td>
                  <td>
                    <span className={`badge ${capaian.capaian >= 80 ? 'badge-green' : capaian.capaian >= 70 ? 'badge-yellow' : 'badge-red'}`}>
                      {capaian.capaian}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      capaian.status === 'Tercapai' ? 'badge-green' :
                      capaian.status === 'Dalam Progress' ? 'badge-yellow' : 'badge-red'
                    }`}>
                      {capaian.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{capaian.semester}</td>
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
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Tambah Data Capaian</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>Form untuk menambah data capaian akan ditampilkan di sini.</p>
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
