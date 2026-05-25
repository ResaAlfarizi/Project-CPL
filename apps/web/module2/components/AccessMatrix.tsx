'use client';

import React from 'react';

// Mock data untuk hak akses
interface AccessRight {
  read: boolean;
  write: boolean;
  delete: boolean;
}

interface ResourceAccess {
  resource: string;
  superadmin: AccessRight;
}

const mockAccessData: ResourceAccess[] = [
  {
    resource: 'Program Studi & CPL',
    superadmin: { read: true, write: true, delete: true }
  },
  {
    resource: 'Mata Kuliah & Pemetaan',
    superadmin: { read: true, write: true, delete: true }
  },
  {
    resource: 'Sub-CPMK',
    superadmin: { read: true, write: true, delete: true }
  },
  {
    resource: 'Input Nilai Sub-CPMK',
    superadmin: { read: true, write: true, delete: true }
  },
  {
    resource: 'Capaian CPL Mahasiswa',
    superadmin: { read: true, write: true, delete: true }
  },
  {
    resource: 'Manajemen User',
    superadmin: { read: true, write: true, delete: true }
  },
  {
    resource: 'Audit Log',
    superadmin: { read: true, write: false, delete: false }
  }
];

// Komponen Badge untuk menampilkan hak akses
const AccessBadge: React.FC<{ access: AccessRight }> = ({ access }) => {
  const permissions: string[] = [];
  if (access.read) permissions.push('R');
  if (access.write) permissions.push('W');
  if (access.delete) permissions.push('D');

  return (
    <div className="inline-flex items-center gap-1.5">
      {permissions.map((perm, idx) => (
        <span
          key={idx}
          className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
          style={{
            backgroundColor: 'rgba(239, 253, 163, 0.15)',
            color: '#EFFDA3',
            border: '1px solid rgba(239, 253, 163, 0.3)',
            fontFamily: 'Urbanist, sans-serif'
          }}
        >
          {perm}
        </span>
      ))}
    </div>
  );
};

// Komponen utama Matrix Hak Akses
export default function AccessMatrix() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#212121' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              color: '#CFDECA',
              fontFamily: 'Urbanist, sans-serif'
            }}
          >
            Matrix Hak Akses per Role
          </h1>
          <p
            className="text-base"
            style={{
              color: '#D8DFE9',
              fontFamily: 'Urbanist, sans-serif'
            }}
          >
            Kelola dan pantau hak akses untuk setiap role dalam sistem
          </p>
        </div>

        {/* Table Container */}
        <div
          className="rounded-2xl overflow-hidden animate-slide-in-up"
          style={{
            backgroundColor: '#2a2a2a',
            border: '1px solid rgba(216, 223, 233, 0.1)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr style={{ backgroundColor: '#1a1a1a' }}>
                  <th
                    className="text-left px-6 py-4 font-bold text-sm uppercase tracking-wider"
                    style={{
                      color: '#F6F5FA',
                      fontFamily: 'Urbanist, sans-serif',
                      borderBottom: '2px solid rgba(207, 222, 202, 0.2)'
                    }}
                  >
                    Resource
                  </th>
                  <th
                    className="text-center px-6 py-4 font-bold text-sm uppercase tracking-wider"
                    style={{
                      color: '#F6F5FA',
                      fontFamily: 'Urbanist, sans-serif',
                      borderBottom: '2px solid rgba(207, 222, 202, 0.2)'
                    }}
                  >
                    Superadmin
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {mockAccessData.map((item, index) => (
                  <tr
                    key={index}
                    className="transition-all duration-200 hover:bg-opacity-50"
                    style={{
                      borderBottom: index < mockAccessData.length - 1 
                        ? '1px solid rgba(216, 223, 233, 0.08)' 
                        : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(207, 222, 202, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td
                      className="px-6 py-5 font-medium"
                      style={{
                        color: '#F6F5FA',
                        fontFamily: 'Urbanist, sans-serif',
                        fontSize: '15px'
                      }}
                    >
                      {item.resource}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <AccessBadge access={item.superadmin} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div
          className="mt-6 p-4 rounded-xl animate-fade-in stagger-1"
          style={{
            backgroundColor: 'rgba(42, 42, 42, 0.5)',
            border: '1px solid rgba(216, 223, 233, 0.1)'
          }}
        >
          <div className="flex items-center gap-6 justify-center flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(239, 253, 163, 0.15)',
                  color: '#EFFDA3',
                  border: '1px solid rgba(239, 253, 163, 0.3)'
                }}
              >
                R
              </span>
              <span style={{ color: '#D8DFE9', fontSize: '13px', fontFamily: 'Urbanist, sans-serif' }}>
                Read (Baca)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(239, 253, 163, 0.15)',
                  color: '#EFFDA3',
                  border: '1px solid rgba(239, 253, 163, 0.3)'
                }}
              >
                W
              </span>
              <span style={{ color: '#D8DFE9', fontSize: '13px', fontFamily: 'Urbanist, sans-serif' }}>
                Write (Tulis)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(239, 253, 163, 0.15)',
                  color: '#EFFDA3',
                  border: '1px solid rgba(239, 253, 163, 0.3)'
                }}
              >
                D
              </span>
              <span style={{ color: '#D8DFE9', fontSize: '13px', fontFamily: 'Urbanist, sans-serif' }}>
                Delete (Hapus)
              </span>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-4 text-center animate-fade-in stagger-2">
          <p
            className="text-sm"
            style={{
              color: 'rgba(216, 223, 233, 0.6)',
              fontFamily: 'Urbanist, sans-serif'
            }}
          >
            💡 Hak akses dapat dikonfigurasi melalui sistem manajemen role
          </p>
        </div>
      </div>
    </div>
  );
}
