'use client';
import { useState, useCallback } from 'react';

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

let toastId = 0;
let globalAddToast = null;

export function useToast() {
  const toast = useCallback((message, type = 'info', duration = 3500) => {
    if (globalAddToast) globalAddToast({ id: ++toastId, message, type, duration });
  }, []);
  return { toast };
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  globalAddToast = (t) => {
    setToasts(prev => [...prev, t]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), t.duration);
  };

  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{ICONS[t.type]}</span>
          <span className="toast-message">{t.message}</span>
          <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>✕</button>
        </div>
      ))}
    </div>
  );
}
