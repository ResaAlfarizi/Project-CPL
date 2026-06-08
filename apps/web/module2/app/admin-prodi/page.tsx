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
  const [stats, setStats] = useState({
    total_cpl: 0,
    total_cpmk: 0,
    total_dosen: 0,
    total_mahasiswa: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');
  const [userRole, setUserRole] = useState('Admin Prodi');

  useEffect(() => {
    // Load stats from API
    const loadStats = async () => {
      try {
        setLoading(true);
        // Import API
        const { dashboardApi, userApi, cplApi, profileApi } = await import('@/lib/api');
        
        // Fetch user profile to get full name
        try {
          const profileRes = await profileApi.getMyProfile();
          const fullName = profileRes.data.nama || profileRes.data.email?.split('@')[0] || 'Admin';
          const prodiName = profileRes.data.nama_prodi || '';
          
          setUserName(fullName);
          setUserRole(prodiName ? `Admin Prodi ${prodiName}` : 'Admin Prodi');
        } catch {
          setUserName(user?.email?.split('@')[0] || 'Admin');
          setUserRole('Admin Prodi');
        }
        
        // Get dashboard data if available
        try {
          // Get user's prodi_id
          const profileRes = await profileApi.getMyProfile();
          const userProdiId = profileRes.data.prodi_id;
          
          console.log('Admin Prodi ID:', userProdiId);
          
          // Fetch all data in parallel
          const [usersRes, cplRes, subCpmkRes, mhsModul1Res] = await Promise.all([
            userApi.getAll().catch(() => ({ data: [] })),
            cplApi.getAll().catch(() => ({ data: [] })),
            (await import('@/lib/api')).subCpmkApi.getAll().catch(() => ({ data: [] })),
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/m1/mahasiswa`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            }).then(r => r.json()).catch(() => ({ data: [] })),
          ]);
          
          const users = usersRes.data || [];
          const allCpl = cplRes.data || [];
          const allSubCpmk = subCpmkRes.data || [];
          const allMahasiswa = mhsModul1Res.data || [];
          
          console.log('Total users:', users.length);
          console.log('Total CPL:', allCpl.length);
          console.log('Total Sub-CPMK:', allSubCpmk.length);
          console.log('Total Mahasiswa:', allMahasiswa.length);
          
          // Filter dosen by prodi_id (from users table where role='dosen')
          const dosenByProdi = userProdiId
            ? users.filter((u: any) => u.role === 'dosen' && String(u.prodi_id) === String(userProdiId))
            : users.filter((u: any) => u.role === 'dosen');
          
          console.log('Dosen by prodi:', dosenByProdi.length, dosenByProdi);
          
          // Filter CPL by prodi_id
          const cplByProdi = userProdiId 
            ? allCpl.filter((c: any) => String(c.prodi_id) === String(userProdiId))
            : allCpl;
          
          console.log('CPL by prodi:', cplByProdi.length, cplByProdi);
          
          // Filter mahasiswa by prodi_id
          const mhsByProdi = userProdiId
            ? allMahasiswa.filter((m: any) => String(m.prodi_id) === String(userProdiId))
            : allMahasiswa;
          
          console.log('Mahasiswa by prodi:', mhsByProdi.length, mhsByProdi);
          
          // Count CPMK (Sub-CPMK) - need to filter by CPL's prodi
          const cplIds = cplByProdi.map((c: any) => c.id);
          
          // Get all MK-CPL and count sub-cpmk
          let cpmkCount = 0;
          if (cplIds.length > 0) {
            const mkCplRes = await (await import('@/lib/api')).mkCplApi.getAll().catch(() => ({ data: [] }));
            const mkCplFiltered = (mkCplRes.data || []).filter((mc: any) => 
              cplIds.includes(mc.cpl_id)
            );
            const mkCplIds = mkCplFiltered.map((mc: any) => mc.id);
            cpmkCount = allSubCpmk.filter((sc: any) => mkCplIds.includes(sc.mk_cpl_id)).length;
            
            console.log('MK-CPL filtered:', mkCplFiltered.length);
            console.log('CPMK count:', cpmkCount);
          }
          
          setStats({
            total_cpl: cplByProdi.length,
            total_cpmk: cpmkCount,
            total_dosen: dosenByProdi.length,
            total_mahasiswa: mhsByProdi.length,
          });
        } catch (error) {
          console.error('Error in main stats fetch:', error);
          // Fallback: Get data from individual APIs
          try {
            const [usersRes, cplRes] = await Promise.all([
              userApi.getAll().catch(() => ({ data: [] })),
              cplApi.getAll().catch(() => ({ data: [] })),
            ]);
            
            const users = usersRes.data || [];
            const userProdiId = (user as any)?.prodi_id;
            const dosen = users.filter((u: any) => u.role === 'dosen' && (!userProdiId || String(u.prodi_id) === String(userProdiId)));
            const mahasiswa = users.filter((u: any) => u.role === 'mahasiswa' && (!userProdiId || String(u.prodi_id) === String(userProdiId)));
            
            // Filter CPL by prodi_id
            const allCpl = cplRes.data || [];
            const cplByProdi = userProdiId 
              ? allCpl.filter((c: any) => String(c.prodi_id) === String(userProdiId))
              : allCpl;
            
            console.log('Fallback stats - Dosen:', dosen.length, 'Mahasiswa:', mahasiswa.length, 'CPL:', cplByProdi.length);
            
            setStats({
              total_cpl: cplByProdi.length,
              total_cpmk: 0, // Will be calculated from CPMK API if needed
              total_dosen: dosen.length,
              total_mahasiswa: mahasiswa.length,
            });
          } catch (fallbackError) {
            console.error('Error in fallback stats fetch:', fallbackError);
          }
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();

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
  }, [user]);

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
      padding: '1px',
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
              Selamat datang, {userName}
            </p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '600', marginTop: '4px' }}>
              {userRole}
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
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card" style={{ padding: '24px' }}>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px', marginBottom: '12px' }} />
                <div className="skeleton" style={{ width: '80px', height: '16px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '60px', height: '32px' }} />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="card" style={{
              background: 'linear-gradient(135deg, #EFFDA3 0%, #E5F195 100%)',
              border: '1.5px solid #DBE787',
              padding: '24px',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
              <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600', marginBottom: '8px' }}>
                Total CPL
              </p>
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#212121' }}>{stats.total_cpl}</p>
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
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#212121' }}>{stats.total_cpmk}</p>
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
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#212121' }}>{stats.total_dosen}</p>
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
              <p style={{ fontSize: '32px', fontWeight: '800', color: '#212121' }}>{stats.total_mahasiswa}</p>
            </div>
          </>
        )}
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
