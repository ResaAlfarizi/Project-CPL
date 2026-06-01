'use client';

import React, { useState, useEffect } from 'react';
import ToastContainer, { showToast } from '@/components/Toast';

interface Prodi {
  id: string;
  kode_prodi: string;
  nama_prodi: string;
}

interface Threshold {
  id?: string;
  prodi_id?: string;
  nama_status: string;
  nilai_min: number;
  nilai_max: number;
  color?: string;
  bg?: string;
  icon?: string;
}

const DEFAULT_THRESHOLDS: Threshold[] = [
  { nama_status: 'Excellence', nilai_min: 85, nilai_max: 100, color: '#27ae60', bg: '#eafaf1', icon: '🏆' },
  { nama_status: 'Satisfactory', nilai_min: 70, nilai_max: 84.99, color: '#2980b9', bg: '#ebf5fb', icon: '✅' },
  { nama_status: 'Competent', nilai_min: 55, nilai_max: 69.99, color: '#f39c12', bg: '#fef9e7', icon: '📊' },
  { nama_status: 'Developing', nilai_min: 40, nilai_max: 54.99, color: '#e67e22', bg: '#fdf2e9', icon: '📈' },
  { nama_status: 'Not Competent', nilai_min: 0, nilai_max: 39.99, color: '#e74c3c', bg: '#fdecea', icon: '❌' },
];

export default function ThresholdPage() {
  const [prodi, setProdi] = useState<Prodi[]>([]);
  const [selectedProdi, setSelectedProdi] = useState('');
  const [allThresholds, setAllThresholds] = useState<Threshold[]>([]);
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const [prodiRes, threshRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/m1/prodi', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/v1/m1/threshold', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const prodiData = await prodiRes.json();
      const threshData = await threshRes.json();

      setProdi(prodiData.data || []);
      setAllThresholds(threshData.data || []);
      setSelectedProdi(prev => prev || '');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedProdi) return;
    const existing = allThresholds.filter(t => t.prodi_id === selectedProdi);
    if (existing.length > 0) {
      setThresholds(existing.map(t => ({ ...t, nilai_min: Number(t.nilai_min), nilai_max: Number(t.nilai_max) })));
    } else {
      setThresholds(DEFAULT_THRESHOLDS.map(t => ({ ...t })));
    }
  }, [selectedProdi, allThresholds]);

  const handleChange = (idx: number, field: 'nilai_min' | 'nilai_max', value: string) => {
    setThresholds(prev => prev.map((t, i) => i === idx ? { ...t, [field]: parseFloat(value) || 0 } : t));
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS.map(t => ({ ...t })));
    showToast('Threshold direset ke nilai default.', 'info');
  };

  const validate = () => {
    for (const t of thresholds) {
      if (t.nilai_min > t.nilai_max) return `${t.nama_status}: nilai_min tidak boleh > nilai_max`;
      if (t.nilai_min < 0 || t.nilai_max > 100) return `${t.nama_status}: nilai harus antara 0–100`;
    }
    return null;
  };

  const handleSave = async () => {
    if (!selectedProdi) {
      showToast('Pilih program studi dulu.', 'warning');
      return;
    }
    const err = validate();
    if (err) {
      showToast(err, 'error');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/m1/threshold/${selectedProdi}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ thresholds }),
      });

      if (!response.ok) throw new Error('Gagal menyimpan threshold');

      showToast('Threshold berhasil disimpan!', 'success');
      loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan threshold', 'error');
    }
    setSaving(false);
  };

  const getProdiName = (id: string) => prodi.find(p => p.id === id)?.nama_prodi || '';

  return (
    <>
      <ToastContainer />

      <div className="page-header animate-fade-in">
        <h1 className="page-title">Threshold Status CPL</h1>
        <p className="page-subtitle">Atur batas nilai untuk status pencapaian CPL</p>
      </div>

      {prodi.length === 0 && (
        <div className="animate-fade-in stagger-1" style={{ background: '#fef9e7', border: '1px solid #f9ca7a', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', fontSize: '14px' }}>
          ⚠️ Belum ada Program Studi. Daftarkan dulu di menu Program Studi.
        </div>
      )}

      <div className="animate-fade-in stagger-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', marginRight: '10px' }}>Program Studi:</label>
          <select className="select-field" value={selectedProdi} onChange={e => setSelectedProdi(e.target.value)} style={{ minWidth: '280px' }}>
            <option value="">— Pilih Prodi —</option>
            {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={handleReset}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Reset Default
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !selectedProdi}>
            {saving ? '⏳ Menyimpan...' : '💾 Simpan Threshold'}
          </button>
        </div>
      </div>

      <div className="animate-fade-in stagger-2" style={{ background: '#f0f4f9', border: '1px solid var(--color-alice-blue)', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ fontWeight: '700', marginBottom: '6px' }}>ℹ️ Tentang Threshold Status CPL</div>
        <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.7' }}>
          Threshold menentukan status pencapaian CPL mahasiswa berdasarkan nilai akhir. Setiap prodi dapat memiliki threshold berbeda.
          Nilai yang dimasukkan harus dalam rentang <strong>0 – 100</strong> dan pastikan tidak ada rentang yang tumpang tindih.
        </p>
      </div>

      {selectedProdi && (
        <>
          <div className="card animate-fade-in stagger-3" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Konfigurasi Threshold</div>
                <div className="card-subtitle">{getProdiName(selectedProdi)}</div>
              </div>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {thresholds.map((t, idx) => {
                const def = DEFAULT_THRESHOLDS.find(d => d.nama_status === t.nama_status) || DEFAULT_THRESHOLDS[idx] || {};
                return (
                  <div key={t.nama_status || idx} style={{ background: def.bg || '#f9f9f9', border: `1.5px solid ${def.color || '#ddd'}`, borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '24px' }}>{def.icon || '📊'}</span>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '16px', color: def.color }}>{t.nama_status}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Status pencapaian CPL</div>
                      </div>
                      <div style={{ marginLeft: 'auto', background: def.color, color: '#fff', borderRadius: '99px', padding: '4px 14px', fontSize: '13px', fontWeight: '700' }}>
                        {t.nilai_min} – {t.nilai_max}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Nilai Minimum</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          className="input-field"
                          value={t.nilai_min}
                          onChange={e => handleChange(idx, 'nilai_min', e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Nilai Maksimum</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          className="input-field"
                          value={t.nilai_max}
                          onChange={e => handleChange(idx, 'nilai_max', e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{
                          marginLeft: `${t.nilai_min}%`,
                          width: `${Math.max(0, t.nilai_max - t.nilai_min)}%`,
                          height: '100%',
                          background: def.color,
                          borderRadius: '99px',
                          transition: 'all 0.3s'
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>
                        <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card animate-fade-in stagger-4">
            <div className="card-header">
              <div className="card-title">Preview Threshold</div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Nilai Minimum</th>
                    <th>Nilai Maksimum</th>
                    <th>Rentang</th>
                  </tr>
                </thead>
                <tbody>
                  {thresholds.map((t, idx) => {
                    const def = DEFAULT_THRESHOLDS.find(d => d.nama_status === t.nama_status) || {};
                    return (
                      <tr key={idx}>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: def.bg, color: def.color, padding: '4px 12px', borderRadius: '99px', fontWeight: '700', fontSize: '13px' }}>
                            {def.icon} {t.nama_status}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{t.nilai_min}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{t.nilai_max}</td>
                        <td>
                          <div style={{ width: '200px', height: '10px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ marginLeft: `${t.nilai_min / 100 * 100}%`, width: `${Math.max(0, (t.nilai_max - t.nilai_min))}%`, height: '100%', background: def.color || 'var(--color-alice-blue)', borderRadius: '99px' }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
