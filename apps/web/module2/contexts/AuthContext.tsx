'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authStorage, DecodedToken } from '@/lib/auth';
import { authApi, LoginCredentials } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: DecodedToken | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token on mount
    const currentUser = authStorage.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      
      if (!response.access_token) {
        throw new Error('Token tidak diterima dari server');
      }
      
      // Store both access token and refresh token
      authStorage.setToken(response.access_token);
      authStorage.setRefreshToken(response.refresh_token);
      
      const decoded = authStorage.decodeToken(response.access_token);
      setUser(decoded);
      
      // Redirect based on role
      if (decoded?.role?.toLowerCase() === 'superadmin') {
        router.push('/superadmin');
      } else if (decoded?.role?.toLowerCase() === 'dosen') {
        router.push('/dosen');
      } else if (decoded?.role?.toLowerCase() === 'admin prodi' || decoded?.role?.toLowerCase() === 'admin_prodi') {
        router.push('/admin-prodi');
      } else if (decoded?.role?.toLowerCase() === 'mahasiswa') {
        router.push('/mahasiswa');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    const refreshToken = authStorage.getRefreshToken();
    
    // Call logout API if refresh token exists
    if (refreshToken) {
      authApi.logout(refreshToken).catch((error) => {
        console.error('Logout API error:', error);
      });
    }
    
    authStorage.removeToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
