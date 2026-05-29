'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function AdminProdiHeader({ onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState('Admin');
  const [userRole, setUserRole] = useState('Admin Prodi');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Fetch user profile to get full name
    const fetchUserProfile = async () => {
      try {
        const { profileApi } = await import('@/lib/api');
        const response = await profileApi.getMyProfile();
        const fullName = response.data.nama || response.data.email?.split('@')[0] || 'Admin';
        const prodiName = response.data.nama_prodi || '';
        const email = response.data.email || user?.email || '';
        
        setUserName(fullName);
        setUserRole(prodiName ? `Admin Prodi ${prodiName}` : 'Admin Prodi');
        setUserEmail(email);
      } catch (error) {
        // Fallback to email or default
        setUserName(user?.email?.split('@')[0] || 'Admin');
        setUserRole('Admin Prodi');
        setUserEmail(user?.email || '');
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <header
      style={{
        height: '72px',
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '1.5px solid #E5E7EB',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F9FAFB';
            e.currentTarget.style.borderColor = '#D1D5DB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div>
          <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', margin: 0 }}>
            Selamat datang kembali,
          </p>
          <p style={{ fontSize: '15px', color: '#212121', fontWeight: '700', margin: 0 }}>
            {userName} - {userRole}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              borderRadius: '12px',
              border: '1.5px solid #E5E7EB',
              background: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              if (!showDropdown) {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #EFFDA3 0%, #E5F195 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              👨‍💼
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#212121', margin: 0 }}>
                {userName}
              </p>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, fontWeight: '600' }}>
                {userRole}
              </p>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2"
              style={{
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '220px',
                background: '#fff',
                borderRadius: '12px',
                border: '1.5px solid #E5E7EB',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '8px',
                zIndex: 1000,
                animation: 'scaleIn 0.2s ease-out',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #F3F4F6',
                  marginBottom: '8px',
                }}
              >
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#212121', margin: '0 0 4px 0' }}>
                  {userEmail || user?.email || 'Email tidak tersedia'}
                </p>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>{userRole}</p>
              </div>

              <button
                onClick={() => {
                  router.push('/admin-prodi/profile');
                  setShowDropdown(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#212121',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profil Saya
              </button>

              <div style={{ height: '1px', background: '#F3F4F6', margin: '8px 0' }} />

              <button
                onClick={logout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#EF4444',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
}
