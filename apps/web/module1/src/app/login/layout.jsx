'use client';
import { AuthProvider } from '@/context/AuthContext';
import ToastContainer from '@/components/ui/Toast';

export default function LoginLayout({ children }) {
  return (
    <AuthProvider>
      {children}
      <ToastContainer />
    </AuthProvider>
  );
}
