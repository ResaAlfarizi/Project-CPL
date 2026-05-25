'use client';

import React from 'react';

export default function CapaianPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{
            color: '#212121',
            fontFamily: 'Urbanist, sans-serif',
          }}
        >
          Capaian CPL Mahasiswa
        </h1>
        <p
          className="text-base"
          style={{
            color: '#6B7280',
            fontFamily: 'Urbanist, sans-serif',
          }}
        >
          Pantau capaian pembelajaran lulusan mahasiswa
        </p>
      </div>

      {/* Content */}
      <div
        className="p-8 rounded-xl text-center"
        style={{
          backgroundColor: '#fff',
          border: '1px solid #E5E7EB',
        }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: '#F6F5FA' }}
        >
          <span style={{ fontSize: '32px' }}>📈</span>
        </div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: '#212121', fontFamily: 'Urbanist, sans-serif' }}
        >
          Halaman Capaian CPL Mahasiswa
        </h3>
        <p
          className="text-sm"
          style={{ color: '#6B7280', fontFamily: 'Urbanist, sans-serif' }}
        >
          Fitur ini akan segera tersedia
        </p>
      </div>
    </div>
  );
}
