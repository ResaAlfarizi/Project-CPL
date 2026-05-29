'use client';

import React, { useState, useEffect } from 'react';
import { nilaiApi } from '@/lib/api';
import ToastContainer, { showToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';

interface Nilai {
  id: string;
  enrollment_id: string;
  sub_cpmk_id: number;
  nilai: number;
  nim?: string;
  nama_mahasiswa?: string;
  kode_sub_cpmk?: string;
  kode_mk?: string;
  nama_mk?: string;
  sks?: number;
  semester?: number;
  kode_cpl?: string;
  tahun_akademik?: string;
  semester_aktif?: number;
  input_at?: string;
}

interface MataKuliahGroup {
  kode_mk: string;
  nama_mk: string;
  sks?: number;
  semester?: number;
  nilaiList: Nilai[];
}

export default function InputNilaiPage() {
  const { user } = useAuth();
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNilai();
  }, []);

  const loadNilai = async () => {
    try {
      setLoading(true);
      const response = await nilaiApi.getAll();
      let data = response.data || [];
      setNilaiList(data);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data nilai', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Group by mata kuliah
  const mataKuliahGroups: MataKuliahGroup[] = [];
  const mkMap = new Map<string, MataKuliahGroup>();

  nilaiList.forEach(nilai => {
    if (nilai.kode_mk) {
      if (!mkMap.has(nilai.kode_mk)) {
        mkMap.set(nilai.kode_mk, {
          kode_mk: nilai.kode_mk,
          nama_mk: nilai.nama_mk || '',
          sks: nilai.sks,
          semester: nilai.semester,
          nilaiList: [],
        });
      }
      mkMap.get(nilai.kode_mk)!.nilaiList.push(nilai);
    }
  });

  mkMap.forEach(group => mataKuliahGroups.push(group));

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Input Nilai Sub-CPMK</h1>
        <p className="page-subtitle">Lihat data input nilai sub-CPMK mahasiswa (Read Only)</p>
      </div>

      {/* Info Badge */}
      <div className="animate-fade-in stagger-1" style={{ 
        padding: '12px 16px', 
        backgroundColor: '#EFF6FF', 
        border: '1px solid #BFDBFE', 
        borderRadius: '8px', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span style={{ fontSize: '13px', color: '#1E40AF', fontWeight: '500' }}>
          Anda memiliki akses <strong>Read Only</strong> untuk melihat data nilai. Untuk mengedit, hubungi Dosen atau Superadmin.
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 12px' }} />
          <div className="skeleton" style={{ width: '300px', height: '16px', margin: '0 auto' }} />
        </div>
      ) : mataKuliahGroups.length === 0 ? (
        <div className="card animate-fade-in" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Tidak ada data nilai</p>
          <p style={{ color: 'var(--text-secondary)' }}>Belum ada nilai yang diinput untuk program studi Anda</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {mataKuliahGroups.map((group, index) => {
            // Calculate statistics
            const totalNilai = group.nilaiList.length;
            const avgNilai = totalNilai > 0 
              ? (group.nilaiList.reduce((sum, n) => sum + n.nilai, 0) / totalNilai).toFixed(1)
              : '0';
            const passCount = group.nilaiList.filter(n => n.nilai >= 70).length;
            const passRate = totalNilai > 0 ? ((passCount / totalNilai) * 100).toFixed(0) : '0';
            
            return (
              <div key={group.kode_mk} className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden', animationDelay: `${index * 0.1}s` }}>
                {/* Header Mata Kuliah */}
                <div style={{ 
                  padding: '20px 24px', 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: '700', 
                        padding: '4px 10px', 
                        background: 'rgba(255,255,255,0.2)', 
                        borderRadius: '6px' 
                      }}>
                        {group.kode_mk}
                      </span>
                      {group.sks && (
                        <span style={{ fontSize: '12px', opacity: 0.9 }}>{group.sks} SKS</span>
                      )}
                      {group.semester && (
                        <span style={{ fontSize: '12px', opacity: 0.9 }}>Sem {group.semester}</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{group.nama_mk}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>Total Nilai</div>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>{totalNilai}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>Rata-rata</div>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>{avgNilai}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>Lulus</div>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>{passRate}%</div>
                    </div>
                  </div>
                </div>

                {/* Nilai Table */}
                <div style={{ padding: '24px' }}>
                  <table className="data-table" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>No</th>
                        <th style={{ width: '120px' }}>NIM</th>
                        <th>Nama Mahasiswa</th>
                        <th style={{ width: '120px' }}>Sub-CPMK</th>
                        <th style={{ width: '100px' }}>CPL</th>
                        <th style={{ width: '80px' }}>Nilai</th>
                        <th style={{ width: '120px' }}>Tanggal Input</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.nilaiList.map((nilai, idx) => (
                        <tr key={nilai.id}>
                          <td>{idx + 1}</td>
                          <td><span className="badge badge-dark">{nilai.nim || '-'}</span></td>
                          <td style={{ fontWeight: '600', fontSize: '13px' }}>{nilai.nama_mahasiswa || '-'}</td>
                          <td><span className="badge badge-blue">{nilai.kode_sub_cpmk || '-'}</span></td>
                          <td><span className="badge badge-green">{nilai.kode_cpl || '-'}</span></td>
                          <td>
                            <span className={`badge ${nilai.nilai >= 80 ? 'badge-green' : nilai.nilai >= 70 ? 'badge-yellow' : 'badge-red'}`}>
                              {nilai.nilai}
                            </span>
                          </td>
                          <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {nilai.input_at ? new Date(nilai.input_at).toLocaleDateString('id-ID', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
