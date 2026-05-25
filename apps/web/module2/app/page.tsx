'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect based on role
        const role = user.role?.toLowerCase();
        if (role === 'superadmin') {
          router.push('/superadmin');
        } else if (role === 'dosen') {
          router.push('/dosen');
        } else if (role === 'admin' || role === 'admin_prodi') {
          router.push('/admin');
        } else if (role === 'mahasiswa') {
          router.push('/mahasiswa');
        } else {
          router.push('/login'); // Default fallback
        }
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--ghost-white)',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--alice-blue)',
        borderTop: '3px solid var(--eerie-black)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
