'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(email, password);
    if (result.ok) router.replace('/dashboard');
    else { setError(result.message); setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-box fade-in">
        <div className="login-logo">
          <div className="login-logo-icon">🎓</div>
          <div className="login-title">CPL Management</div>
          <div className="login-subtitle">Sistem Pengelolaan Capaian Pembelajaran Lulusan</div>
          <div style={{ marginTop: 8 }}>
            <span style={{ background: '#EFFDA3', color: '#212121', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>MODUL 1 – SETUP</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-control" placeholder="Masukkan email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label required" htmlFor="password">Password</label>
            <input id="password" type="password" className="form-control" placeholder="Masukkan password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {error && (
            <div style={{ background: '#fdecea', border: '1px solid #f5c6cb', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e74c3c', marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', height: 44 }} disabled={loading}>
            {loading ? '⏳ Masuk...' : '🔐 Masuk'}
          </button>
        </form>

        <div className="login-demo">
          <h4>Demo Credentials</h4>
          <div className="login-demo-item">
            <span>Superadmin</span>
            <span style={{ color: '#2d5986', fontWeight: 600 }}>superadmin@cpl.id</span>
          </div>
          <div className="login-demo-item">
            <span>Password</span>
            <span style={{ color: '#2d5986', fontWeight: 600 }}>admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
