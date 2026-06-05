'use client';

import { useEffect, useState } from 'react';
import { mahasiswaApi } from '@/lib/api';

interface CapaianCPL {
  cpl_id: string;
  kode_cpl: string;
  deskripsi_cpl: string;
  rata_rata_nilai: number;
  nilai_minimum?: number;
  status_capaian?: string;
}

interface CapaianDetail {
  kode_mk: string;
  nama_mk: string;
  tahun_akademik: string;
  semester_aktif: number;
  kode_cpl: string;
  deskripsi_cpl: string;
  nilai: number;
  nilai_minimum?: number;
  status?: string;
}

export default function CapaianPage() {
  const [capaianList, setCapaianList] = useState<CapaianCPL[]>([]);
  const [capaianDetail, setCapaianDetail] = useState<CapaianDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await mahasiswaApi.getMyCapaian();
        const data = Array.isArray(res) ? res : res.data || [];
        setCapaianList(data);
      } catch (error) {
        console.error('Error fetching capaian:', error);
        setCapaianList([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await mahasiswaApi.getMyCapaianDetail();
        const data = Array.isArray(res) ? res : res.data || [];
        setCapaianDetail(data);
      } catch (error) {
        console.error('Error fetching detail:', error);
        setCapaianDetail([]);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'tercapai':
      case 'sangat baik':
        return { bg: '#D1FAE5', text: '#10B981' };
      case 'belum tercapai':
      case 'kurang':
        return { bg: '#FEE2E2', text: '#EF4444' };
      case 'baik':
        return { bg: '#DBEAFE', text: '#3B82F6' };
      case 'cukup':
        return { bg: '#FEF3C7', text: '#F59E0B' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getProgressColor = (nilai?: number) => {
    if (!nilai) return '#E5E7EB';
    if (nilai >= 80) return '#10B981';
    if (nilai >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Capaian CPL Saya</h1>
        <p className="page-subtitle">Data capaian pembelajaran lulusan berdasarkan nilai yang telah diinput</p>
      </div>

      {/* Capaian CPL Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-xl)' }} />
            ))}
          </div>
        ) : capaianList.length === 0 ? (
          <div className="card animate-fade-in" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.25 }}>
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <p style={{ fontWeight: '700', fontSize: '16px', color: 'var(--eerie-black)', marginBottom: '6px' }}>Belum ada data capaian CPL</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Data akan muncul setelah nilai diinput oleh dosen</p>
          </div>
        ) : (
          capaianList.map((capaian, idx) => {
            const statusColor = getStatusColor(capaian.status_capaian);
            const nilai = Number(capaian.rata_rata_nilai) || 0;
            const progressColor = getProgressColor(nilai);
            const target = Number(capaian.nilai_minimum) || 75;

            return (
              <div key={`capaian-${capaian.cpl_id}-${idx}`} className="card animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span className="badge badge-dark">{capaian.kode_cpl || '-'}</span>
                      {capaian.status_capaian && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: statusColor.bg, color: statusColor.text }}>
                          {capaian.status_capaian}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--eerie-black)', lineHeight: '1.5' }}>
                      {capaian.deskripsi_cpl || '-'}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--eerie-black)', lineHeight: 1 }}>{nilai.toFixed(1)}%</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Target: {target}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <div style={{ width: '100%', height: '10px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '999px',
                      transition: 'width 0.5s ease',
                      width: `${Math.min(nilai, 100)}%`,
                      backgroundColor: progressColor,
                    }} />
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: '#9CA3AF',
                    left: `${Math.min(target, 100)}%`,
                  }} title={`Target: ${target}%`} />
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Nilai: <span style={{ fontWeight: '600', color: 'var(--eerie-black)' }}>{nilai.toFixed(2)}</span>
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Detail per Mata Kuliah */}
      <div className="animate-fade-in">
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--eerie-black)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-yellow">Detail</span>
          Capaian per Mata Kuliah
        </h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {detailLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto 12px' }} />
              <div className="skeleton" style={{ width: '300px', height: '16px', margin: '0 auto' }} />
            </div>
          ) : capaianDetail.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada detail capaian</p>
              <p>Data akan muncul setelah nilai diinput oleh dosen</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kode MK</th>
                  <th>Mata Kuliah</th>
                  <th>CPL</th>
                  <th>Semester</th>
                  <th style={{ textAlign: 'right' }}>Nilai</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {capaianDetail.map((detail, idx) => {
                  const statusColor = getStatusColor(detail.status);
                  const semester = `${detail.semester_aktif % 2 === 1 ? 'Ganjil' : 'Genap'} ${detail.tahun_akademik}`;
                  const nilai = Number(detail.nilai) || 0;
                  return (
                    <tr key={`detail-${detail.kode_mk}-${detail.kode_cpl}-${idx}`}>
                      <td>{idx + 1}</td>
                      <td><span className="badge badge-dark">{detail.kode_mk || '-'}</span></td>
                      <td style={{ fontWeight: '600' }}>{detail.nama_mk || '-'}</td>
                      <td><span className="badge badge-blue">{detail.kode_cpl || '-'}</span></td>
                      <td><span className="badge badge-yellow">{semester}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: '700', fontSize: '15px' }}>{nilai.toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        {detail.status ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: statusColor.bg, color: statusColor.text }}>
                            {detail.status}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
