'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('cpl_user') : null;
    if (user) router.replace('/dashboard');
    else router.replace('/login');
  }, [router]);
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="animate-pulse" style={{ fontSize:32 }}>🎓</div>
    </div>
  );
}
