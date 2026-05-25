'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuperadminHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function SuperadminHeader({ onToggleSidebar, sidebarCollapsed }: SuperadminHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header
      style={{
        height: '72px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        fontFamily: 'Urbanist, sans-serif',
      }}
    >
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F6F5FA';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
          }}
        >
          <Menu size={20} color="#212121" />
        </button>

        <div>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#212121',
              margin: 0,
            }}
          >
            Sistem Manajemen CPL
          </h1>
          <p
            style={{
              fontSize: '12px',
              color: '#6B7280',
              margin: 0,
            }}
          >
            Panel Superadmin
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* User Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '10px',
            backgroundColor: '#F6F5FA',
            border: '1px solid #E5E7EB',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#EFFDA3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={18} color="#212121" />
          </div>
          <div>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#212121',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {user?.username || 'Superadmin'}
            </p>
            <p
              style={{
                fontSize: '11px',
                color: '#6B7280',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {user?.role || 'SUPERADMIN'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#212121',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fde8e8';
            e.currentTarget.style.borderColor = '#f87171';
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#212121';
          }}
        >
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
}
