'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AccessRight {
  id: number;
  fitur: string;
  deskripsi: string;
  akses: 'R/W' | 'R';
  keterangan?: string;
  icon: string;
}

export default function AdminProdiDashboard() {
  const { user } = useAuth();
  const [accessRights, setAccessRights] = useState<AccessRight[]>([]);

  useEffect(() => {
    // Data dummy hak akses Admin Prodi
    const dummyAccessRights: AccessRight[] = [
      {
        id: 1,
        fitur: 'Kelola CPL',
        deskripsi: 'Mengelola Capaian Pembelajaran Lulusan',
        akses: 'R/W',
        icon: '📚',
      },
      {
        id: 2,
        fitur: 'Kelola CPMK',
        deskripsi: 'Mengelola Capaian Pembelajaran Mata Kuliah',
        akses: 'R/W',
        icon: '📖',
      },
      {
        id: 3,
        fitur: 'Kelola Sub-CPMK',
        deskripsi: 'Mengelola Sub Capaian Pembelajaran Mata Kuliah',
        akses: 'R/W',
        icon: '📝',
      },
      {
        id: 4,
        fitur: 'Lihat Capaian Mahasiswa',
        deskripsi: 'Melihat capaian pembelajaran mahasiswa',
        akses: 'R',
        icon: '📊',
      },
      {
        id: 5,
        fitur: 'Kelola Mata Kuliah',
        deskripsi: 'Mengelola data mata kuliah',
        akses: 'R/W',
        icon: '📚',
      },
      {
        id: 6,
        fitur: 'Kelola Dosen',
        deskripsi: 'Mengelola data dosen di program studi',
        akses: 'R/W',
        keterangan: 'prodi sendiri',
        icon: '👨‍🏫',
      },
      {
        id: 7,
        fitur: 'Lihat Mahasiswa',
        deskripsi: 'Melihat data mahasiswa di program studi',
        akses: 'R',
        keterangan: 'prodi sendiri',
        icon: '👨‍🎓',
      },
    ];

    setAccessRights(dummyAccessRights);
  }, []);

  const getAccessBadgeStyle = (akses: 'R/W' | 'R') => {
    if (akses === 'R/W') {
      return {
        background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
        color: '#065F46',
        border: '1.5px solid #6EE7B7',
      };
    }
    return {
      background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
      color: '#1E40AF',
      border: '1.5px solid #93C5FD',
    };
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--ghost-white)',
      padding: '32px',
    }}>
      {/* Header Section */}
      <div className="page-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #212121 0%, #333333 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}>
            👨‍💼
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: '4px' }}>
              Dashboard Admin Prodi
            </h1>
            <p className="page-subtitle">
              Selamat datang, {user?.email || 'Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="animate-fade-in stagger-1" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, #EFFDA3 0%, #E5F195 100%)',
          border: '1.5px solid #DBE787',
          padding: '24px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
          <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600', marginBottom: '8px' }}>
            Total CPL
          </p>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#212121' }}>12</p>
        </div>

        <div className="card" style={{
          background: 'linear-gradient(135deg, #CFE3CA 0%, #BDD9B6 100%)',
          border: '1.5px solid #A8CFA0',
          padding: '24px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📖</div>
          <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600', marginBottom: '8px' }}>
            Total CPMK
          </p>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#212121' }}>48</p>
        </div>

        <div className="card" style={{
          background: 'linear-gradient(135deg, #E4EAEF 0%, #D5DDE5 100%)',
          border: '1.5px solid #C6D0DB',
          padding: '24px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>👨‍🏫</div>
          <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600', marginBottom: '8px' }}>
            Total Dosen
          </p>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#212121' }}>24</p>
        </div>

        <div className="card" style={{
          background: 'linear-gradient(135deg, #F7F5FA 0%, #EBE9F0 100%)',
          border: '1.5px solid #DDD9E6',
          padding: '24px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>👨‍🎓</div>
          <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600', marginBottom: '8px' }}>
            Total Mahasiswa
          </p>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#212121' }}>320</p>
        </div>
      </div>

      {/* Access Rights Section */}
      <div className="animate-fade-in stagger-2">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#212121',
              marginBottom: '4px',
            }}>
              Hak Akses Fitur
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
              Daftar fitur yang dapat Anda akses sebagai Admin Prodi
            </p>
          </div>
        </div>

        {/* Access Rights Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}>
          {accessRights.map((item, index) => (
            <div
              key={item.id}
              className="card animate-slide-in-up"
              style={{
                padding: '24px',
                animationDelay: `${index * 0.1}s`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative corner */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: item.akses === 'R/W' 
                  ? 'linear-gradient(135deg, rgba(207, 227, 202, 0.3) 0%, rgba(189, 217, 182, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(228, 234, 239, 0.3) 0%, rgba(213, 221, 229, 0.2) 100%)',
                borderRadius: '0 0 0 80px',
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative' }}>
                {/* Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: item.akses === 'R/W'
                    ? 'linear-gradient(135deg, #CFE3CA 0%, #BDD9B6 100%)'
                    : 'linear-gradient(135deg, #E4EAEF 0%, #D5DDE5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}>
                  {item.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    marginBottom: '8px',
                  }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '700', 
                      color: '#212121',
                      margin: 0,
                    }}>
                      {item.fitur}
                    </h3>
                  </div>

                  <p style={{ 
                    fontSize: '13px', 
                    color: '#6B7280',
                    marginBottom: '12px',
                    lineHeight: '1.5',
                  }}>
                    {item.deskripsi}
                  </p>

                  {/* Access Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      className="badge"
                      style={{
                        ...getAccessBadgeStyle(item.akses),
                        fontSize: '11px',
                        fontWeight: '800',
                        letterSpacing: '0.05em',
                        padding: '6px 12px',
                      }}
                    >
                      {item.akses === 'R/W' ? '✏️ FULL ACCESS' : '👁️ READ ONLY'}
                    </span>

                    {item.keterangan && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#6B7280',
                        background: '#F3F4F6',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                      }}>
                        📍 {item.keterangan}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="animate-fade-in stagger-3" style={{
        marginTop: '32px',
        padding: '24px',
        background: 'linear-gradient(135deg, #EFFDA3 0%, #E5F195 100%)',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px solid #DBE787',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(33, 33, 33, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0,
        }}>
          💡
        </div>
        <div>
          <p style={{ 
            fontSize: '14px', 
            fontWeight: '700', 
            color: '#212121',
            marginBottom: '4px',
          }}>
            Informasi Penting
          </p>
          <p style={{ 
            fontSize: '13px', 
            color: '#6B7280',
            lineHeight: '1.6',
          }}>
            Sebagai Admin Prodi, Anda memiliki akses penuh untuk mengelola data akademik di program studi Anda. 
            Beberapa fitur dibatasi hanya untuk data program studi yang Anda kelola.
          </p>
        </div>
      </div>
    </div>
  );
}
