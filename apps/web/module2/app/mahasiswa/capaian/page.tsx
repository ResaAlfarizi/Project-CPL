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
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Capaian CPL Saya</h2>
            <p className="text-sm text-gray-500 mt-1">
              Data capaian pembelajaran untuk {user?.name || 'Mahasiswa'}
            </p>
          </div>
          <button
            onClick={handleShowDetail}
            disabled={detailLoading}
            className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50"
            style={{ background: '#E8F3FF', color: '#1E40AF' }}
          >
            {detailLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                Memuat...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Lihat Detail
              </>
            )}
          </button>
        </div>
      </div>

      {/* Capaian CPL Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
              <span>Memuat data capaian...</span>
            </div>
          </div>
        ) : capaianList.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400">
            Belum ada data capaian CPL
          </div>
        ) : (
          capaianList.map((capaian) => {
            const statusColor = getStatusColor(capaian.status);
            const progressColor = getProgressColor(capaian.persentase);
            const persentase = capaian.persentase || 0;
            
            return (
              <div key={capaian.id} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                        {capaian.kode_cpl || '-'}
                      </span>
                      {capaian.status && (
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          style={{ background: statusColor.bg, color: statusColor.text }}
                        >
                          {capaian.status}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {capaian.nama_cpl || '-'}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{persentase.toFixed(1)}%</p>
                    {capaian.target && (
                      <p className="text-xs text-gray-500">Target: {capaian.target}%</p>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(persentase, 100)}%`,
                        backgroundColor: progressColor
                      }}
                    />
                  </div>
                  {capaian.target && (
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                      style={{ left: `${Math.min(capaian.target, 100)}%` }}
                      title={`Target: ${capaian.target}%`}
                    />
                  )}
                </div>
                
                {capaian.nilai !== undefined && (
                  <p className="text-xs text-gray-500 mt-2">
                    Nilai: <span className="font-semibold text-gray-900">{capaian.nilai.toFixed(2)}</span>
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal/Section */}
      {showDetail && (
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Detail Capaian per Mata Kuliah</h3>
              <p className="text-sm text-gray-500">Rincian nilai dari setiap mata kuliah</p>
            </div>
            <button
              onClick={() => setShowDetail(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {capaianDetail.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              Tidak ada detail capaian
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">KODE MK</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">MATA KULIAH</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">SEMESTER</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">NILAI</th>
                  </tr>
                </thead>
                <tbody>
                  {capaianDetail.map((detail, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-900 text-white">
                          {detail.kode_mk || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{detail.nama_mk || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" style={{ background: '#E8F3FF', color: '#1E40AF' }}>
                          {detail.semester || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
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
