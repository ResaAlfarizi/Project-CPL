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
      
      if (!response.token) {
        throw new Error('Token tidak diterima dari server');
      }
      
      authStorage.setToken(response.token);
      const decoded = authStorage.decodeToken(response.token);
      setUser(decoded);
      
      // Redirect based on role
      if (decoded.role?.toLowerCase() === 'superadmin') {
        router.push('/superadmin');
      } else if (decoded.role?.toLowerCase() === 'dosen') {
        router.push('/dosen');
      } else if (decoded?.role?.toLowerCase() === 'admin' || decoded?.role?.toLowerCase() === 'admin_prodi') {
        router.push('/admin');
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
