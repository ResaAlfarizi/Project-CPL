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
      const response = await fetch(`http://localhost:3000/api/v1/m1/threshold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ prodi_id: selectedProdi, thresholds }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal menyimpan threshold');
      }

      showToast('Threshold berhasil disimpan!', 'success');
      loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan threshold', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedProdi) {
      showToast('Pilih program studi dulu.', 'warning');
      return;
    }
    const existing = allThresholds.filter(t => t.prodi_id === selectedProdi);
    if (existing.length === 0) {
      showToast('Tidak ada threshold yang tersimpan untuk prodi ini.', 'warning');
      return;
    }
    if (!confirm('Hapus semua threshold untuk prodi ini? Aksi ini tidak dapat dibatalkan.')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3000/api/v1/m1/threshold/${selectedProdi}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Gagal menghapus threshold');
      }
      showToast('Threshold berhasil dihapus!', 'success');
      loadData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus threshold', 'error');
    }
  };

  const getProdiName = (id: string) => prodi.find(p => p.id === id)?.nama_prodi || '';

  return (
    <div className="sa-page">
      <ToastContainer />

      <div className="sa-page-header">
        <h1 className="sa-page-title">Threshold Status CPL</h1>
        <p className="sa-page-subtitle">Atur batas nilai untuk status pencapaian CPL</p>
      </div>

      {prodi.length === 0 && (
        <div className="sa-alert sa-alert-warning">
          ⚠️ Belum ada Program Studi. Daftarkan dulu di menu Program Studi.
        </div>
      )}

      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <label style={{ fontSize: '13px', fontWeight: '600', marginRight: '10px' }}>Program Studi:</label>
          <select className="sa-form-control" value={selectedProdi} onChange={e => setSelectedProdi(e.target.value)} style={{ minWidth: '280px' }}>
            <option value="">— Pilih Prodi —</option>
            {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
        </div>
        <div className="sa-toolbar-right">
          <button className="sa-btn sa-btn-ghost" onClick={handleReset}>
            <span>🔄</span>
            <span>Reset Default</span>
          </button>
          <button
            className="sa-btn"
            onClick={handleDelete}
            disabled={!selectedProdi || !allThresholds.some(t => t.prodi_id === selectedProdi)}
            style={{ background: '#fdecea', color: '#c0392b', border: '1px solid #f1948a' }}
          >
            <span>🗑️</span>
            <span>Hapus Threshold</span>
          </button>
          <button className="sa-btn sa-btn-primary" onClick={handleSave} disabled={saving || !selectedProdi}>
            <span>{saving ? '⏳' : '💾'}</span>
            <span>{saving ? 'Menyimpan...' : 'Simpan Threshold'}</span>
          </button>
        </div>
      </div>

      <div className="sa-alert" style={{ background: '#f0f4f9', border: '1px solid #D8DFE9', marginBottom: '24px' }}>
        <div style={{ fontWeight: '700', marginBottom: '6px' }}>ℹ️ Tentang Threshold Status CPL</div>
        <p style={{ fontSize: '13px', lineHeight: '1.7' }}>
          Threshold menentukan status pencapaian CPL mahasiswa berdasarkan nilai akhir. Setiap prodi dapat memiliki threshold berbeda.
          Nilai yang dimasukkan harus dalam rentang <strong>0 – 100</strong> dan pastikan tidak ada rentang yang tumpang tindih.
        </p>
      </div>

      {selectedProdi && (
        <>
          <div className="sa-card" style={{ marginBottom: '20px' }}>
            <div className="sa-card-header">
              <div>
                <div className="sa-card-title">Konfigurasi Threshold</div>
                <div className="sa-card-subtitle">{getProdiName(selectedProdi)}</div>
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

          <div className="sa-card">
            <div className="sa-card-header">
              <div className="sa-card-title">Preview Threshold</div>
            </div>
            <div className="sa-table-wrapper">
              <table className="sa-table">
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
    </div>
  );
}
