'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'green' | 'yellow' | 'blue' | 'dark';
  subtitle?: string;
}

const colorMap = {
  green: { bg: 'var(--honeydew)', text: '#2d5a2d' },
  yellow: { bg: 'var(--vanilla)', text: '#5a5a00' },
  blue: { bg: 'var(--alice-blue)', text: '#2d3a5a' },
  dark: { bg: 'var(--eerie-black)', text: '#fff' },
};

export default function StatsCard({ title, value, icon, color = 'blue', subtitle }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className="card animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: c.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: c.text,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px' }}>{title}</p>
        <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--eerie-black)', lineHeight: 1 }}>{value}</p>
        {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{subtitle}</p>}
      </div>
    </div>
  );
}
