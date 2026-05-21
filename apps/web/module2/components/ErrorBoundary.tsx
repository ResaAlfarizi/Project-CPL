'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#EF4444" 
              strokeWidth="1.5"
              style={{ margin: '0 auto 24px' }}
            >
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--eerie-black)',
              marginBottom: '12px'
            }}>
              Terjadi Kesalahan
            </h1>
            
            <p style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Maaf, terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman atau hubungi administrator jika masalah berlanjut.
            </p>

            {this.state.error && (
              <details style={{
                marginBottom: '24px',
                padding: '16px',
                background: '#FEF2F2',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                fontSize: '13px',
                color: '#991B1B'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '8px' }}>
                  Detail Error
                </summary>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
