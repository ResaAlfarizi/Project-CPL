'use client';

import React, { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ToastContainer, { showToast } from '@/components/Toast';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load users from API
  useEffect(() => {
    loadUsers();
    loadAvailableRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAll();
      setUsers(response.data || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal memuat data user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      // Ambil role dari user yang sudah ada
      const response = await userApi.getAll();
      const roles = [...new Set(response.data.map((u: User) => u.role))];
      
      // Filter: Hapus "Superadmin" dari pilihan (Superadmin hanya 1)
      const filteredRoles = roles.filter(role => 
        role.toLowerCase() !== 'superadmin'
      );
      
      setAvailableRoles(filteredRoles);
      // Set default role ke role pertama yang tersedia
      if (filteredRoles.length > 0 && !formData.role) {
        setFormData(prev => ({ ...prev, role: filteredRoles[0] }));
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
      // Fallback ke role default (tanpa Superadmin)
      setAvailableRoles(['Dosen', 'Mahasiswa']);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    // Cek apakah user mencoba menghapus akun sendiri (berdasarkan ID)
    if (currentUser && id === currentUser.id) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri', 'error');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus user "${email}"?`)) return;
    
    try {
      await userApi.delete(id);
      showToast('User berhasil dihapus', 'success');
      loadUsers();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Gagal menghapus user', 'error');
    }
  };

  const handleEdit = (user: User) => {
    setEditMode(true);
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '', // Password kosong saat edit
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.email || !formData.role) {
      showToast('Email dan role wajib diisi', 'error');
      return;
    }

    // Validasi password hanya untuk mode tambah
    if (!editMode && !formData.password) {
      showToast('Password wajib diisi', 'error');
      return;
    }

    if (!editMode && formData.password.length < 6) {
      showToast('Password minimal 6 karakter', 'error');
      return;
    }

    try {
      setFormLoading(true);
      
      if (editMode && selectedUser) {
        // Update user (tanpa password)
        // Pastikan email dan role dikirim dengan benar
        await userApi.update(selectedUser.id, {
          email: formData.email.trim(),
          role: formData.role.trim(),
        });
        showToast('User berhasil diupdate', 'success');
      } else {
        // Create user
        await userApi.create({
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role.trim(),
        });
        showToast('User berhasil ditambahkan', 'success');
      }
      
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showToast(error instanceof Error ? error.message : 'Gagal menyimpan user', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: availableRoles[0] || '',
    });
    setEditMode(false);
    setSelectedUser(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  // Filter: exclude current logged-in user (berdasarkan ID) dan apply search
  const filteredUsers = users
    .filter(user => {
      // Jika tidak ada currentUser, tampilkan semua
      if (!currentUser || !currentUser.id) return true;
      
      // Bandingkan ID user dengan ID dari token
      // Return true jika ID TIDAK sama (artinya user ini akan ditampilkan)
      return String(user.id) !== currentUser.id;
    })
    .filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Manajemen User</h1>
        <p className="page-subtitle">
          Kelola pengguna dan hak akses sistem
          {currentUser && (
            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#9ca3af' }}>
              (Login sebagai: {currentUser.role} - ID: {currentUser.id})
            </span>
          )}
        </p>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Cari user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px' }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah User
        </button>
      </div>

      {/* Table */}
      <div className="card animate-fade-in stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '20px', width: '200px', margin: '0 auto 12px' }} />
            <div className="skeleton" style={{ height: '16px', width: '300px', margin: '0 auto' }} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p style={{ fontWeight: '600', fontSize: '16px' }}>Tidak ada user ditemukan</p>
            <p>Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Email</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: '600' }}>{user.email}</td>
                  <td>
                    <span className={`badge ${
                      user.role === 'Admin Prodi' ? 'badge-blue' :
                      user.role === 'Dosen' ? 'badge-green' :
                      user.role === 'Mahasiswa' ? 'badge-yellow' :
                      'badge-dark'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleEdit(user)}
                        className="btn btn-secondary btn-sm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, user.email)}
                        className="btn btn-sm" 
                        style={{ backgroundColor: '#fdecea', color: '#e74c3c' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              {editMode ? 'Edit User' : 'Tambah User Baru'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              {editMode 
                ? 'Ubah data user (password tidak dapat diubah)' 
                : 'Isi form di bawah untuk menambahkan user baru ke sistem'
              }
            </p>
            
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Email <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contoh@if.ac.id"
                  className="input-field"
                  required
                  disabled={formLoading}
                />
              </div>

              {/* Password - hanya tampil saat tambah */}
              {!editMode && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Password <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="input-field"
                    required
                    minLength={6}
                    disabled={formLoading}
                  />
                </div>
              )}

              {/* Role */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Role <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="select-field"
                  required
                  disabled={formLoading}
                >
                  <option value="">Pilih Role</option>
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Pilih role sesuai dengan hak akses yang diinginkan
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={handleModalClose} 
                  className="btn btn-ghost"
                  disabled={formLoading}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
