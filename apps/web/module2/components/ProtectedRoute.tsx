'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Check role authorization
      if (allowedRoles && user) {
        // Normalize roles for comparison (case-insensitive)
        const normalizedUserRole = user.role.toLowerCase().trim();
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());
        
        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
          router.push('/unauthorized');
          return;
        }
      }

      setIsAuthorized(true);
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--alice-blue)',
            borderTopColor: 'var(--eerie-black)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Memuat...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated or not authorized
  if (!isAuthenticated || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
