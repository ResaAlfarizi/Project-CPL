'use client';
import { useState, useEffect } from 'react';
import { ThresholdAPI, ProdiAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const DEFAULT_THRESHOLDS = [
  { nama_status: 'Excellence',    nilai_min: 85,    nilai_max: 100,   color: '#27ae60', bg: '#eafaf1', icon: '🏆' },
  { nama_status: 'Satisfactory',  nilai_min: 70,    nilai_max: 84.99, color: '#2980b9', bg: '#ebf5fb', icon: '✅' },
  { nama_status: 'Competent',     nilai_min: 55,    nilai_max: 69.99, color: '#f39c12', bg: '#fef9e7', icon: '📊' },
  { nama_status: 'Developing',    nilai_min: 40,    nilai_max: 54.99, color: '#e67e22', bg: '#fdf2e9', icon: '📈' },
  { nama_status: 'Not Competent', nilai_min: 0,     nilai_max: 39.99, color: '#e74c3c', bg: '#fdecea', icon: '❌' },
];

export default function ThresholdPage() {
  const [prodi, setProdi] = useState([]);
  const [selectedProdi, setSelectedProdi] = useState('');
  const [allThresholds, setAllThresholds] = useState([]);
  const [thresholds, setThresholds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodiData, threshData] = await Promise.all([ProdiAPI.list(), ThresholdAPI.listAll()]);
      setProdi(prodiData || []);
      setAllThresholds(threshData || []);
      setSelectedProdi(prev => prev || '');
    } catch (err) { toast(err.message, 'error'); }
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!selectedProdi) return;
    const existing = allThresholds.filter(t => t.prodi_id === selectedProdi);
    if (existing.length > 0) {
      setThresholds(existing.map(t => ({ ...t, nilai_min: Number(t.nilai_min), nilai_max: Number(t.nilai_max) })));
    } else {
      setThresholds(DEFAULT_THRESHOLDS.map(t => ({ ...t })));
    }
  }, [selectedProdi, allThresholds]);

  const handleChange = (idx, field, value) => {
    setThresholds(prev => prev.map((t, i) => i === idx ? { ...t, [field]: parseFloat(value) || 0 } : t));
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS.map(t => ({ ...t })));
    toast('Threshold direset ke nilai default.', 'info');
  };

  const validate = () => {
    for (const t of thresholds) {
      if (t.nilai_min > t.nilai_max) return `${t.nama_status}: nilai_min tidak boleh > nilai_max`;
      if (t.nilai_min < 0 || t.nilai_max > 100) return `${t.nama_status}: nilai harus antara 0–100`;
    }
    return null;
  };

  const handleSave = async () => {
    if (!selectedProdi) { toast('Pilih program studi dulu.', 'warning'); return; }
    const err = validate();
    if (err) { toast(err, 'error'); return; }
    setSaving(true);
    try {
      await ThresholdAPI.save(selectedProdi, thresholds);
      toast('Threshold berhasil disimpan!', 'success');
      loadData();
    } catch (e) { toast(e.message, 'error'); }
    setSaving(false);
  };

  const getProdiName = (id) => prodi.find(p => p.id === id)?.nama_prodi || '';

  const statusInfo = DEFAULT_THRESHOLDS.find(d => d.nama_status);

  return (
    <div>
      {prodi.length === 0 && (
        <div style={{ background: '#fef9e7', border: '1px solid #f9ca7a', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 14 }}>
          ⚠️ Belum ada Program Studi. <a href="/prodi" style={{ color: '#2d5986', fontWeight: 600 }}>Daftarkan dulu →</a>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, marginRight: 10 }}>Program Studi:</label>
          <select className="filter-select" value={selectedProdi} onChange={e => setSelectedProdi(e.target.value)} style={{ minWidth: 280 }}>
            <option value="">— Pilih Prodi —</option>
            {prodi.map(p => <option key={p.id} value={p.id}>{p.kode_prodi} – {p.nama_prodi}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={handleReset}>🔄 Reset Default</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !selectedProdi}>
            {saving ? '⏳ Menyimpan...' : '💾 Simpan Threshold'}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: '#f0f4f9', border: '1px solid #D8DFE9', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>ℹ️ Tentang Threshold Status CPL</div>
        <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.7 }}>
          Threshold menentukan status pencapaian CPL mahasiswa berdasarkan nilai akhir. Setiap prodi dapat memiliki threshold berbeda.
          Nilai yang dimasukkan harus dalam rentang <strong>0 – 100</strong> dan pastikan tidak ada rentang yang tumpang tindih.
        </p>
      </div>

      {/* Threshold Cards */}
      {selectedProdi && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div>
                <div className="card-title">⚙️ Konfigurasi Threshold</div>
                <div className="card-subtitle">{getProdiName(selectedProdi)}</div>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {thresholds.map((t, idx) => {
                const def = DEFAULT_THRESHOLDS.find(d => d.nama_status === t.nama_status) || DEFAULT_THRESHOLDS[idx] || {};
                return (
                  <div key={t.nama_status || idx} style={{ background: def.bg || '#f9f9f9', border: `1.5px solid ${def.color || '#ddd'}`, borderRadius: 12, padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: 24 }}>{def.icon || '📊'}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: def.color }}>{t.nama_status}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Status pencapaian CPL</div>
                      </div>
                      <div style={{ marginLeft: 'auto', background: def.color, color: '#fff', borderRadius: 99, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>
                        {t.nilai_min} – {t.nilai_max}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Nilai Minimum</label>
                        <input
                          type="number" step="0.01" min="0" max="100"
                          className="form-control"
                          value={t.nilai_min}
                          onChange={e => handleChange(idx, 'nilai_min', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Nilai Maksimum</label>
                        <input
                          type="number" step="0.01" min="0" max="100"
                          className="form-control"
                          value={t.nilai_max}
                          onChange={e => handleChange(idx, 'nilai_max', e.target.value)}
                        />
                      </div>
                    </div>
                    {/* Visual bar */}
                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          marginLeft: `${t.nilai_min}%`,
                          width: `${Math.max(0, t.nilai_max - t.nilai_min)}%`,
                          height: '100%',
                          background: def.color,
                          borderRadius: 99,
                          transition: 'all 0.3s'
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                        <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">👁️ Preview Threshold</div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Status</th><th>Nilai Minimum</th><th>Nilai Maksimum</th><th>Rentang</th></tr>
                </thead>
                <tbody>
                  {thresholds.map((t, idx) => {
                    const def = DEFAULT_THRESHOLDS.find(d => d.nama_status === t.nama_status) || {};
                    return (
                      <tr key={idx}>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: def.bg, color: def.color, padding: '4px 12px', borderRadius: 99, fontWeight: 700, fontSize: 13 }}>
                            {def.icon} {t.nama_status}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.nilai_min}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.nilai_max}</td>
                        <td>
                          <div style={{ width: 200, height: 10, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ marginLeft: `${t.nilai_min / 100 * 100}%`, width: `${Math.max(0, (t.nilai_max - t.nilai_min))}%`, height: '100%', background: def.color || '#D8DFE9', borderRadius: 99 }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
