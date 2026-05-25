'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mahasiswaApi } from '@/lib/api';

interface CapaianCPL {
  id: number;
  kode_cpl?: string;
  nama_cpl?: string;
  nilai?: number;
  persentase?: number;
  status?: string;
  target?: number;
  [key: string]: unknown;
}

interface CapaianDetail {
  mk_id?: number;
  kode_mk?: string;
  nama_mk?: string;
  nilai?: number;
  semester?: string;
  [key: string]: unknown;
}

export default function CapaianPage() {
  const { user } = useAuth();
  const [capaianList, setCapaianList] = useState<CapaianCPL[]>([]);
  const [capaianDetail, setCapaianDetail] = useState<CapaianDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await mahasiswaApi.getMyCapaian();
        const data = Array.isArray(res) ? res : res.data || [];
        setCapaianList(data);
      } catch (error) {
        console.error('Error fetching capaian:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleShowDetail = async () => {
    setDetailLoading(true);
    try {
      const res = await mahasiswaApi.getMyCapaianDetail();
      const data = Array.isArray(res) ? res : res.data || [];
      setCapaianDetail(data);
      setShowDetail(true);
    } catch (error) {
      console.error('Error fetching detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'tercapai':
        return { bg: '#CFECCA', text: '#166534' };
      case 'belum tercapai':
        return { bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { bg: '#FFF063', text: '#854D0E' };
    }
  };

  const getProgressColor = (persentase?: number) => {
    if (!persentase) return '#E5E7EB';
    if (persentase >= 80) return '#10B981';
    if (persentase >= 60) return '#FFF063';
    return '#EF4444';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Card */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Capaian CPL Saya</h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
              Data capaian pembelajaran untuk {user?.name || 'Mahasiswa'}
            </p>
          </div>
          <button
            onClick={handleShowDetail}
            disabled={detailLoading}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              padding: '10px 16px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              fontWeight: '500', 
              background: '#E8F3FF', 
              color: '#1E40AF',
              border: 'none',
              cursor: detailLoading ? 'not-allowed' : 'pointer',
              opacity: detailLoading ? 0.5 : 1
            }}
          >
            {detailLoading ? (
              <>
                <div style={{ width: '12px', height: '12px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px' }}></div>
                Memuat...
              </>
            ) : (
              <>
                <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Lihat Detail
              </>
            )}
          </button>
        </div>
      </div>

      {/* Capaian CPL Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isLoading ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '48px 24px', textAlign: 'center', color: '#9CA3AF', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid #9CA3AF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span>Memuat data capaian...</span>
            </div>
          </div>
        ) : capaianList.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '48px 24px', textAlign: 'center', color: '#9CA3AF', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            Belum ada data capaian CPL
          </div>
        ) : (
          capaianList.map((capaian, idx) => {
            const statusColor = getStatusColor(capaian.status);
            const progressColor = getProgressColor(capaian.persentase);
            const persentase = capaian.persentase || 0;
            
            return (
              <div key={`capaian-${capaian.id}-${idx}`} style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', background: '#1F2937', color: '#fff' }}>
                        {capaian.kode_cpl || '-'}
                      </span>
                      {capaian.status && (
                        <span 
                          style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', background: statusColor.bg, color: statusColor.text }}
                        >
                          {capaian.status}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', lineHeight: '1.5' }}>
                      {capaian.nama_cpl || '-'}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                    <p style={{ fontSize: '32px', fontWeight: '700', color: '#111827', lineHeight: '1' }}>{persentase.toFixed(1)}%</p>
                    {capaian.target && (
                      <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Target: {capaian.target}%</p>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <div style={{ width: '100%', height: '12px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%',
                        borderRadius: '999px',
                        transition: 'width 0.5s ease',
                        width: `${Math.min(persentase, 100)}%`,
                        backgroundColor: progressColor
                      }}
                    />
                  </div>
                  {capaian.target && (
                    <div 
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        background: '#6B7280',
                        left: `${Math.min(capaian.target, 100)}%`
                      }}
                      title={`Target: ${capaian.target}%`}
                    />
                  )}
                </div>
                
                {capaian.nilai !== undefined && (
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>
                    Nilai: <span style={{ fontWeight: '600', color: '#111827' }}>{capaian.nilai.toFixed(2)}</span>
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal/Section */}
      {showDetail && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Detail Capaian per Mata Kuliah</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>Rincian nilai dari setiap mata kuliah</p>
            </div>
            <button
              onClick={() => setShowDetail(false)}
              style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {capaianDetail.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: '#9CA3AF' }}>
              Tidak ada detail capaian
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KODE MK</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MATA KULIAH</th>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEMESTER</th>
                    <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NILAI</th>
                  </tr>
                </thead>
                <tbody>
                  {capaianDetail.map((detail, idx) => (
                    <tr key={`detail-${detail.mk_id || idx}-${idx}`} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#1F2937', color: '#fff' }}>
                          {detail.kode_mk || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>{detail.nama_mk || '-'}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#E8F3FF', color: '#1E40AF' }}>
                          {detail.semester || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {detail.nilai !== undefined ? detail.nilai.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
