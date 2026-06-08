'use client';

import { useEffect, useState, useMemo } from 'react';
import { mahasiswaApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface SubCpmk {
  id: number;
  kode_sub_cpmk?: string;
  nama_sub_cpmk?: string;
  deskripsi?: string;
  mk_id?: number;
  nama_mk?: string;
  kode_mk?: string;
  bobot?: number;
  prodi_id?: string;
  kode_cpl?: string;
  deskripsi_cpl?: string;
  cpl_id?: string;
  bobot_mk_ke_cpl?: number;
  [key: string]: unknown;
}

interface CPLInMK {
  kode_cpl: string;
  deskripsi_cpl: string;
  bobot_mk_ke_cpl: number;
  subCpmkList: SubCpmk[];
}

interface MKGroup {
  kode_mk: string;
  nama_mk: string;
  cplGroups: CPLInMK[];
}

export default function SubCpmkPage() {
  const { user } = useAuth();
  const [subCpmkList, setSubCpmkList] = useState<SubCpmk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mahasiswaProdiId, setMahasiswaProdiId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMahasiswaProfile = async () => {
      try {
        // Ambil profil mahasiswa untuk mendapatkan prodi_id
        const profileRes = await mahasiswaApi.getMyProfile();
        const profileData = profileRes.data || profileRes;
        
        if (profileData?.prodi_id) {
          setMahasiswaProdiId(profileData.prodi_id);
        } else if (user?.prodi_id) {
          // Fallback ke prodi_id dari token jika ada
          setMahasiswaProdiId(user.prodi_id);
        }
      } catch (error) {
        console.error('Error fetching mahasiswa profile:', error);
        // Fallback ke prodi_id dari token jika gagal
        if (user?.prodi_id) {
          setMahasiswaProdiId(user.prodi_id);
        }
      }
    };

    fetchMahasiswaProfile();
  }, [user]);

  useEffect(() => {
    if (mahasiswaProdiId) {
      const fetchData = async () => {
        try {
          const res = await mahasiswaApi.getAllSubCpmk();
          const data = Array.isArray(res) ? res : res.data || [];
          
          // Filter hanya sub-CPMK dari prodi mahasiswa
          const filteredData = data.filter((s: SubCpmk) => s.prodi_id === mahasiswaProdiId);
          
          setSubCpmkList(filteredData);
        } catch (error) {
          console.error('Error fetching sub-cpmk:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [mahasiswaProdiId]);

  // Group by Mata Kuliah, then by CPL
  const groups = useMemo<MKGroup[]>(() => {
    const q = search.toLowerCase();
    const filtered = subCpmkList.filter((s) =>
      (s.kode_sub_cpmk || '').toLowerCase().includes(q) ||
      (s.nama_sub_cpmk || '').toLowerCase().includes(q) ||
      (s.deskripsi || '').toLowerCase().includes(q) ||
      (s.nama_mk || '').toLowerCase().includes(q) ||
      (s.kode_mk || '').toLowerCase().includes(q) ||
      (s.kode_cpl || '').toLowerCase().includes(q) ||
      (s.deskripsi_cpl || '').toLowerCase().includes(q)
    );

    // Group by MK first
    const mkMap = new Map<string, MKGroup>();
    
    filtered.forEach((s) => {
      const mkKey = s.kode_mk || 'Lainnya';
      
      if (!mkMap.has(mkKey)) {
        mkMap.set(mkKey, {
          kode_mk: s.kode_mk || '',
          nama_mk: s.nama_mk || 'Mata Kuliah Lainnya',
          cplGroups: [],
        });
      }
      
      const mkGroup = mkMap.get(mkKey)!;
      
      // Find or create CPL group within this MK
      const cplKey = s.kode_cpl || 'Lainnya';
      let cplGroup = mkGroup.cplGroups.find(cpl => cpl.kode_cpl === cplKey);
      
      if (!cplGroup) {
        cplGroup = {
          kode_cpl: s.kode_cpl || 'Lainnya',
          deskripsi_cpl: s.deskripsi_cpl || 'CPL Lainnya',
          bobot_mk_ke_cpl: Number(s.bobot_mk_ke_cpl) || 0,
          subCpmkList: [],
        };
        mkGroup.cplGroups.push(cplGroup);
      }
      
      cplGroup.subCpmkList.push(s);
    });

    // Sort CPL within each MK
    mkMap.forEach(mkGroup => {
      mkGroup.cplGroups.sort((a, b) => 
        (a.kode_cpl || '').localeCompare(b.kode_cpl || '')
      );
    });

    return Array.from(mkMap.values()).sort((a, b) => 
      (a.kode_mk || '').localeCompare(b.kode_mk || '')
    );
  }, [subCpmkList, search]);

  const totalFiltered = groups.reduce((sum, mk) => 
    sum + mk.cplGroups.reduce((cplSum, cpl) => cplSum + cpl.subCpmkList.length, 0), 0
  );

  return (
    <>
      {/* Page Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Sub-CPMK</h1>
        <p className="page-subtitle">Kelola Sub-CPMK untuk mata kuliah yang Anda ampu</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px' }} className="animate-fade-in">
        <svg
          style={{ width: '18px', height: '18px', color: '#9CA3AF', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Cari sub-CPMK, CPL, deskripsi, atau mata kuliah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '42px' }}
        />
      </div>

      {/* Loading */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="card animate-fade-in" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.25 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--eerie-black)', marginBottom: '6px' }}>
            {search ? 'Tidak ada hasil' : 'Belum ada Sub-CPMK'}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {search ? `Tidak ditemukan sub-CPMK untuk "${search}"` : 'Data sub-CPMK belum tersedia'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {groups.map((mkGroup, mkIndex) => {
            // Calculate total bobot for this MK
            const totalSubCpmkInMK = mkGroup.cplGroups.reduce((sum, cpl) => sum + cpl.subCpmkList.length, 0);
            const totalBobotMKtoCPL = mkGroup.cplGroups.reduce((sum, cpl) => sum + (Number(cpl.bobot_mk_ke_cpl) || 0), 0);

            return (
              <div
                key={mkGroup.kode_mk}
                className="card animate-fade-in"
                style={{ padding: 0, overflow: 'hidden', animationDelay: `${mkIndex * 0.06}s` }}
              >
                {/* Header Mata Kuliah */}
                <div style={{
                  padding: '20px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        padding: '4px 12px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        letterSpacing: '0.04em',
                      }}>
                        {mkGroup.kode_mk}
                      </span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                        {totalSubCpmkInMK} sub-CPMK • {mkGroup.cplGroups.length} CPL
                      </span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, lineHeight: 1.4 }}>
                      {mkGroup.nama_mk}
                    </h3>
                  </div>
                </div>

                {/* CPL Groups within MK */}
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {mkGroup.cplGroups.map((cplGroup, cplIndex) => {
                    const totalBobotSubCpmk = cplGroup.subCpmkList.reduce((sum, s) => sum + (Number(s.bobot) || 0), 0);
                    const bobotMKtoCPL = Number(cplGroup.bobot_mk_ke_cpl) || 0;
                    
                    // Check if total bobot is 100%
                    const isComplete = Math.abs(totalBobotSubCpmk - 1) < 0.001;

                    return (
                      <div key={`${mkGroup.kode_mk}-${cplGroup.kode_cpl}`} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        overflow: 'hidden',
                      }}>
                        {/* CPL Header */}
                        <div style={{
                          padding: '16px 20px',
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                          borderBottom: '1px solid #86efac',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span className="badge badge-green" style={{ fontSize: '12px', fontWeight: '700' }}>
                                {cplGroup.kode_cpl}
                              </span>
                              <span style={{ fontSize: '12px', color: '#059669' }}>
                                Bobot MK→CPL: {(bobotMKtoCPL * 100).toFixed(1)}%
                              </span>
                              <span className="badge" style={{ 
                                fontSize: '11px',
                                background: isComplete ? '#dcfce7' : '#fef3c7',
                                color: isComplete ? '#166534' : '#92400e',
                                border: `1px solid ${isComplete ? '#86efac' : '#fcd34d'}`
                              }}>
                                Σ bobot: {(totalBobotSubCpmk * 100).toFixed(1)}%
                              </span>
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', margin: 0, lineHeight: 1.3 }}>
                              {cplGroup.deskripsi_cpl}
                            </p>
                          </div>
                        </div>

                        {/* Warning jika total bobot bukan 100% */}
                        {!isComplete && (
                          <div style={{
                            padding: '10px 20px',
                            background: '#fef3c7',
                            borderBottom: '1px solid #fcd34d',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2">
                              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                              <line x1="12" y1="9" x2="12" y2="13"/>
                              <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            <span style={{ fontSize: '12px', color: '#92400e' }}>
                              Peringatan: Total keseluruhan bobot Sub-CPMK untuk Mata Kuliah ini melebihi 1.00 ({(totalBobotSubCpmk * 100).toFixed(1)}%)
                            </span>
                          </div>
                        )}

                        {/* Sub-CPMK Table */}
                        <table className="data-table" style={{ marginBottom: 0 }}>
                          <thead>
                            <tr>
                              <th style={{ width: '140px' }}>Kode Sub-CPMK</th>
                              <th>Deskripsi</th>
                              <th style={{ width: '100px', textAlign: 'center' }}>Bobot</th>
                              <th style={{ width: '120px', textAlign: 'center' }}>% Kontribusi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cplGroup.subCpmkList.map((sub, idx) => {
                              const bobot = Number(sub.bobot) || 0;
                              const kontribusi = bobot * 100;
                              
                              return (
                                <tr key={sub.id}>
                                  <td>
                                    <span className="badge badge-dark" style={{ fontWeight: '700' }}>
                                      {sub.kode_sub_cpmk || `SUB-${idx + 1}`}
                                    </span>
                                  </td>
                                  <td>
                                    <p style={{ fontWeight: '600', color: 'var(--eerie-black)', marginBottom: sub.deskripsi ? '4px' : 0, fontSize: '14px' }}>
                                      {sub.nama_sub_cpmk || sub.kode_sub_cpmk || `Sub-CPMK ${sub.id}`}
                                    </p>
                                    {sub.deskripsi && (
                                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                        {sub.deskripsi}
                                      </p>
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <div style={{
                                      display: 'inline-block',
                                      background: '#fef3c7',
                                      color: '#92400e',
                                      fontWeight: '700',
                                      fontSize: '13px',
                                      padding: '6px 14px',
                                      borderRadius: '8px',
                                      border: '1px solid #fcd34d',
                                    }}>
                                      {bobot.toFixed(4)}
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <div style={{
                                      display: 'inline-block',
                                      background: '#dcfce7',
                                      color: '#166534',
                                      fontWeight: '700',
                                      fontSize: '13px',
                                      padding: '6px 14px',
                                      borderRadius: '8px',
                                      border: '1px solid #86efac',
                                    }}>
                                      {kontribusi.toFixed(2)}%
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="card animate-fade-in" style={{ padding: '16px 24px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #93c5fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p style={{ fontSize: '14px', color: '#1e3a8a', margin: 0 }}>
                Menampilkan{' '}
                <span style={{ fontWeight: '700' }}>{totalFiltered}</span>{' '}
                sub-CPMK dari{' '}
                <span style={{ fontWeight: '700' }}>{groups.length}</span>{' '}
                mata kuliah
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
