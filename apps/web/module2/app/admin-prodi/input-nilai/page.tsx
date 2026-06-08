'use client';

import React, { useState, useEffect } from 'react';
import { nilaiApi, mataKuliahApi, cplApi } from '@/lib/api';
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

interface MataKuliah {
  id: string;
  kode_mk: string;
  nama_mk: string;
  prodi_id: string;
  sks: number;
  semester: number;
}

interface CPL {
  id: string;
  kode_cpl: string;
  deskripsi: string;
  prodi_id: string;
  is_active: boolean;
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
  const [mataKuliahProdi, setMataKuliahProdi] = useState<Set<string>>(new Set());
  const [cplProdi, setCplProdi] = useState<Set<string>>(new Set());
  const [expandedMK, setExpandedMK] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMataKuliahAndCPL();
  }, []);

  useEffect(() => {
    if (mataKuliahProdi.size > 0 || cplProdi.size > 0) {
      loadNilai();
    }
  }, [mataKuliahProdi, cplProdi]);

  const loadMataKuliahAndCPL = async () => {
    try {
      if (!user?.prodi_id) {
        setLoading(false);
        return;
      }

      // Load mata kuliah dari prodi
      const mkResponse = await mataKuliahApi.getAll();
      const mkData = mkResponse.data || [];
      const mkSet = new Set(
        mkData
          .filter((mk: MataKuliah) => mk.prodi_id === user.prodi_id)
          .map((mk: MataKuliah) => mk.kode_mk)
      );
      setMataKuliahProdi(mkSet);

      // Load CPL dari prodi
      const cplResponse = await cplApi.getByProdi(user.prodi_id);
      const cplData = cplResponse.data || [];
      const cplSet = new Set(
        cplData
          .filter((cpl: CPL) => cpl.prodi_id === user.prodi_id)
          .map((cpl: CPL) => cpl.kode_cpl)
      );
      setCplProdi(cplSet);
    } catch (error) {
      console.error('Error loading mata kuliah and CPL:', error);
      // Tetap lanjut untuk load nilai
      setLoading(false);
    }
  };

  const loadNilai = async () => {
    try {
      setLoading(true);
      const response = await nilaiApi.getAll();
      let data = response.data || [];
      
      // Filter data berdasarkan mata kuliah dan CPL dari prodi admin prodi yang login
      if (user?.prodi_id && (mataKuliahProdi.size > 0 || cplProdi.size > 0)) {
        data = data.filter((nilai: Nilai) => {
          // Filter berdasarkan mata kuliah
          const isMkFromProdi = nilai.kode_mk && mataKuliahProdi.has(nilai.kode_mk);
          // Filter berdasarkan CPL
          const isCplFromProdi = nilai.kode_cpl && cplProdi.has(nilai.kode_cpl);
          // Hanya tampilkan jika MK atau CPL dari prodi ini
          return isMkFromProdi || isCplFromProdi;
        });
      }
      
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

  const toggleMK = (kodeMK: string) => {
    setExpandedMK(prev => {
      const newSet = new Set(prev);
      if (newSet.has(kodeMK)) {
        newSet.delete(kodeMK);
      } else {
        newSet.add(kodeMK);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedMK(new Set(mataKuliahGroups.map(g => g.kode_mk)));
  };

  const collapseAll = () => {
    setExpandedMK(new Set());
  };

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

      {!loading && mataKuliahGroups.length > 0 && (
        <div className="animate-fade-in stagger-2" style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '16px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={expandAll}
            className="btn-secondary"
            style={{ 
              padding: '8px 16px', 
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Buka Semua
          </button>
          <button
            onClick={collapseAll}
            className="btn-secondary"
            style={{ 
              padding: '8px 16px', 
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            Tutup Semua
          </button>
        </div>
      )}

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mataKuliahGroups.map((group, index) => {
            // Calculate statistics
            const totalNilai = group.nilaiList.length;
            const avgNilai = totalNilai > 0 
              ? (group.nilaiList.reduce((sum, n) => sum + n.nilai, 0) / totalNilai).toFixed(1)
              : '0';
            const passCount = group.nilaiList.filter(n => n.nilai >= 70).length;
            const passRate = totalNilai > 0 ? ((passCount / totalNilai) * 100).toFixed(0) : '0';
            
            const isExpanded = expandedMK.has(group.kode_mk);
            
            return (
              <div key={group.kode_mk} className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden', animationDelay: `${index * 0.05}s` }}>
                {/* Header Mata Kuliah - Clickable */}
                <div 
                  onClick={() => toggleMK(group.kode_mk)}
                  style={{ 
                    padding: '16px 20px', 
                    background: isExpanded 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    {/* Expand/Collapse Icon */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      transition: 'transform 0.3s ease'
                    }}>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5"
                        style={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ 
                          fontSize: '13px', 
                          fontWeight: '700', 
                          padding: '4px 10px', 
                          background: 'rgba(255,255,255,0.25)', 
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
                      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{group.nama_mk}</h3>
                    </div>
                  </div>
                  
                  {/* Statistics */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', opacity: 0.85, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data</div>
                      <div style={{ fontSize: '18px', fontWeight: '700' }}>{totalNilai}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', opacity: 0.85, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rata-rata</div>
                      <div style={{ fontSize: '18px', fontWeight: '700' }}>{avgNilai}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', opacity: 0.85, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lulus</div>
                      <div style={{ fontSize: '18px', fontWeight: '700' }}>{passRate}%</div>
                    </div>
                  </div>
                </div>

                {/* Content - Collapsible */}
                <div style={{ 
                  maxHeight: isExpanded ? '2000px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease-in-out',
                  opacity: isExpanded ? 1 : 0,
                  transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
                  transitionProperty: 'max-height, opacity, transform'
                }}>
                  <div style={{ padding: '20px' }}>
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
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
