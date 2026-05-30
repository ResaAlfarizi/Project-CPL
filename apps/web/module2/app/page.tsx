'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect based on role
        const role = user.role?.toLowerCase();
        if (role === 'superadmin') {
          router.push('/superadmin');
        } else if (role === 'dosen') {
          router.push('/dosen');
        } else if (role === 'admin prodi' || role === 'admin_prodi') {
          router.push('/admin-prodi');
        } else if (role === 'mahasiswa') {
          router.push('/mahasiswa');
        } else {
          router.push('/login');
        }
      } else {
        // Show landing page for non-authenticated users
        setShowLanding(true);
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !showLanding) {
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

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Sistem Capaian Pembelajaran Lulusan
            </h1>
            <p className="hero-subtitle">
              Platform terintegrasi untuk monitoring dan evaluasi capaian pembelajaran mahasiswa
            </p>
            <div className="hero-buttons">
              <Link href="/login" className="btn btn-primary">
                Masuk ke Sistem
              </Link>
              <a href="#features" className="btn btn-secondary">
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-card">
              <div className="card-icon">📊</div>
              <h3>Monitoring Real-time</h3>
              <p>Pantau capaian pembelajaran secara langsung</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Fitur Unggulan</h2>
          <p className="section-subtitle">
            Sistem yang dirancang untuk memudahkan pengelolaan capaian pembelajaran
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👨‍🎓</div>
              <h3>Portal Mahasiswa</h3>
              <p>Akses informasi capaian CPL, nilai, dan progres pembelajaran Anda</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👨‍🏫</div>
              <h3>Portal Dosen</h3>
              <p>Kelola mata kuliah, input nilai, dan pantau capaian mahasiswa</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏫</div>
              <h3>Admin Prodi</h3>
              <p>Manajemen program studi, kurikulum, dan monitoring CPL</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>Super Admin</h3>
              <p>Kontrol penuh sistem, manajemen user, dan konfigurasi</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Dashboard Analitik</h3>
              <p>Visualisasi data dan laporan capaian pembelajaran</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Keamanan Terjamin</h3>
              <p>Sistem autentikasi dan otorisasi berbasis role</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">4</div>
              <div className="stat-label">Portal Berbeda</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Terintegrasi</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Akses Online</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Real-time</div>
              <div className="stat-label">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Siap Memulai?</h2>
          <p>Masuk ke sistem untuk mengakses portal sesuai role Anda</p>
          <Link href="/login" className="btn btn-primary btn-large">
            Masuk Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Sistem CPL. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: var(--ghost-white);
        }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #0f2819 0%, #1a3d2a 100%);
          color: white;
          padding: 80px 20px;
          min-height: 600px;
          display: flex;
          align-items: center;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 40px;
          opacity: 0.9;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .btn-primary {
          background: var(--vanilla);
          color: var(--eerie-black);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 240, 163, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background: white;
          color: var(--eerie-black);
        }

        .btn-large {
          padding: 18px 48px;
          font-size: 1.125rem;
        }

        .hero-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .card-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .hero-card h3 {
          font-size: 1.5rem;
          margin-bottom: 12px;
        }

        .hero-card p {
          opacity: 0.9;
        }

        /* Features Section */
        .features {
          padding: 100px 20px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 16px;
          color: var(--eerie-black);
        }

        .section-subtitle {
          text-align: center;
          font-size: 1.125rem;
          color: #64748B;
          margin-bottom: 60px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .feature-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid #E5E7EB;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--eerie-black);
        }

        .feature-card p {
          color: #64748B;
          line-height: 1.6;
        }

        /* Stats Section */
        .stats {
          background: var(--eerie-black);
          color: white;
          padding: 80px 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
          text-align: center;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          color: var(--vanilla);
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 1.125rem;
          opacity: 0.9;
        }

        /* CTA Section */
        .cta {
          padding: 100px 20px;
          text-align: center;
          background: linear-gradient(135deg, var(--alice-blue) 0%, var(--honeydew) 100%);
        }

        .cta h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 16px;
          color: var(--eerie-black);
        }

        .cta p {
          font-size: 1.125rem;
          color: #64748B;
          margin-bottom: 40px;
        }

        /* Footer */
        .footer {
          background: var(--eerie-black);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }

        .footer p {
          opacity: 0.7;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}
