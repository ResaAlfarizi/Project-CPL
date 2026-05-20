'use client';
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 'admin-1',
    role: 'admin',
    name: 'Admin',
    prodi_id: null
  });

  return (
    <AuthContext.Provider value={{ user, loading: false, login: () => {}, logout: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
