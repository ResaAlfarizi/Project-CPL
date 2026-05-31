'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
  const [capaianList, setCapaianList] = useState<CapaianCPL[]>([]);
  const [capaianDetail, setCapaianDetail] = useState<CapaianDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await mahasiswaApi.getMyCapaian();
        console.log('Capaian response:', res);
        const data = Array.isArray(res) ? res : res.data || [];
        console.log('Capaian data:', data);
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
      {/* Header Card */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Capaian CPL Saya</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            Data capaian pembelajaran untuk {user?.name || 'Mahasiswa'}
          </p>
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
            const statusColor = getStatusColor(capaian.status_capaian);
            const nilai = Number(capaian.rata_rata_nilai) || 0;
            const progressColor = getProgressColor(nilai);
            const target = Number(capaian.nilai_minimum) || 75;
            
            return (
              <div key={`capaian-${capaian.cpl_id}-${idx}`} style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', background: '#1F2937', color: '#fff' }}>
                        {capaian.kode_cpl || '-'}
                      </span>
                      {capaian.status_capaian && (
                        <span 
                          style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', background: statusColor.bg, color: statusColor.text }}
                        >
                          {capaian.status_capaian}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', lineHeight: '1.5' }}>
                      {capaian.deskripsi_cpl || '-'}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                    <p style={{ fontSize: '32px', fontWeight: '700', color: '#111827', lineHeight: '1' }}>{nilai.toFixed(1)}%</p>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Target: {target}%</p>
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
                        width: `${Math.min(nilai, 100)}%`,
                        backgroundColor: progressColor
                      }}
                    />
                  </div>
                  <div 
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      background: '#6B7280',
                      left: `${Math.min(target, 100)}%`
                    }}
                    title={`Target: ${target}%`}
                  />
                </div>
                
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                  Nilai: <span style={{ fontWeight: '600', color: '#111827' }}>{nilai.toFixed(2)}</span>
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal/Section */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Detail Capaian per Mata Kuliah</h3>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>Rincian nilai dari setiap mata kuliah</p>
        </div>

        {detailLoading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid #9CA3AF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Memuat detail capaian...</span>
            </div>
          </div>
        ) : capaianDetail.length === 0 ? (
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
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CPL</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEMESTER</th>
                  <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NILAI</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {capaianDetail.map((detail, idx) => {
                  const statusColor = getStatusColor(detail.status);
                  const semester = `${detail.semester_aktif % 2 === 1 ? 'Ganjil' : 'Genap'} ${detail.tahun_akademik}`;
                  const nilai = Number(detail.nilai) || 0;
                  
                  return (
                    <tr key={`detail-${detail.kode_mk}-${detail.kode_cpl}-${idx}`} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#1F2937', color: '#fff' }}>
                          {detail.kode_mk || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827' }}>{detail.nama_mk || '-'}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#F3F4F6', color: '#374151' }}>
                          {detail.kode_cpl || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: '#E8F3FF', color: '#1E40AF' }}>
                          {semester}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        {nilai.toFixed(2)}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        {detail.status && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: statusColor.bg, color: statusColor.text }}>
                            {detail.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
