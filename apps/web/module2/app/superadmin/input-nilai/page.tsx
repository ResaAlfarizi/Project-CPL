'use client';

import React, { useState } from 'react';

interface NilaiSubCPMK {
  id: number;
  nim: string;
  namaMahasiswa: string;
  mataKuliah: string;
  subCPMK: string;
  nilai: number;
  semester: string;
  tanggalInput: string;
}

export default function InputNilaiPage() {
  const [nilaiList] = useState<NilaiSubCPMK[]>([
    { id: 1, nim: '2021001', namaMahasiswa: 'Ahmad Fauzi', mataKuliah: 'Pemrograman Web', subCPMK: 'CPMK-1.1', nilai: 85, semester: 'Ganjil 2024/2025', tanggalInput: '2024-03-15' },
    { id: 2, nim: '2021002', namaMahasiswa: 'Siti Nurhaliza', mataKuliah: 'Basis Data', subCPMK: 'CPMK-2.1', nilai: 90, semester: 'Ganjil 2024/2025', tanggalInput: '2024-03-16' },
    { id: 3, nim: '2021003', namaMahasiswa: 'Budi Santoso', mataKuliah: 'Pemrograman Web', subCPMK: 'CPMK-1.2', nilai: 78, semester: 'Ganjil 2024/2025', tanggalInput: '2024-03-17' },
    { id: 4, nim: '2021001', namaMahasiswa: 'Ahmad Fauzi', mataKuliah: 'Basis Data', subCPMK: 'CPMK-2.2', nilai: 88, semester: 'Ganjil 2024/2025', tanggalInput: '2024-03-18' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredNilai = nilaiList.filter(nilai =>
    nilai.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nilai.namaMahasiswa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Input Nilai Sub-CPMK</h1>
        <p className="page-subtitle">Kelola input nilai sub-CPMK mahasiswa</p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Cari mahasiswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ paddingLeft: '38px' }} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Input Nilai
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredNilai.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada data nilai ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIM</th>
                <th>Nama Mahasiswa</th>
                <th>Mata Kuliah</th>
                <th>Sub-CPMK</th>
                <th>Nilai</th>
                <th>Semester</th>
                <th>Tanggal Input</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredNilai.map((nilai, index) => (
                <tr key={nilai.id}>
                  <td>{index + 1}</td>
                  <td><span className="badge badge-dark">{nilai.nim}</span></td>
                  <td style={{ fontWeight: '600' }}>{nilai.namaMahasiswa}</td>
                  <td style={{ fontSize: '13px' }}>{nilai.mataKuliah}</td>
                  <td><span className="badge badge-blue">{nilai.subCPMK}</span></td>
                  <td>
                    <span className={`badge ${nilai.nilai >= 80 ? 'badge-green' : nilai.nilai >= 70 ? 'badge-yellow' : 'badge-red'}`}>
                      {nilai.nilai}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{nilai.semester}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{nilai.tanggalInput}</td>
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
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Input Nilai Baru</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>Form untuk menginput nilai akan ditampilkan di sini.</p>
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
