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
    <div className="sa-page">
      <ToastContainer />
      
      {/* Header */}
      <div className="sa-page-header">
        <h1 className="sa-page-title">Manajemen User</h1>
        <p className="sa-page-subtitle">
          Kelola pengguna dan hak akses sistem
          {currentUser && (
            <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}>
              (Login sebagai: {currentUser.role} - ID: {currentUser.id})
            </span>
          )}
        </p>
      </div>

      {/* Toolbar */}
      <div className="sa-toolbar">
        <div className="sa-toolbar-left">
          <div className="sa-search">
            <span className="sa-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sa-search-input"
            />
          </div>
        </div>
        <div className="sa-toolbar-right">
          <button className="sa-btn sa-btn-primary" onClick={() => setShowModal(true)}>
            <span>➕</span>
            <span>Tambah User</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="sa-card">
        {loading ? (
          <div className="sa-card-body" style={{ textAlign: 'center' }}>
            <div style={{ height: '20px', width: '200px', margin: '0 auto 12px', background: '#e5e7eb', borderRadius: '4px' }} />
            <div style={{ height: '16px', width: '300px', margin: '0 auto', background: '#e5e7eb', borderRadius: '4px' }} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty-icon">👥</div>
            <div className="sa-empty-title">Tidak ada user ditemukan</div>
            <div className="sa-empty-text">Coba ubah kata kunci pencarian</div>
          </div>
        ) : (
          <div className="sa-table-wrapper">
            <table className="sa-table">
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
                    <td className="sa-font-semibold">{user.email}</td>
                    <td>
                      <span className={`sa-badge ${
                        user.role === 'Admin Prodi' ? 'sa-badge-secondary' :
                        user.role === 'Dosen' ? 'sa-badge-success' :
                        user.role === 'Mahasiswa' ? 'sa-badge-accent' :
                        'sa-badge-primary'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="sa-table-actions">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="sa-btn sa-btn-sm sa-btn-secondary"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id, user.email)}
                          className="sa-btn sa-btn-sm sa-btn-danger"
                        >
                          <span>🗑️</span>
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="sa-modal-overlay" onClick={handleModalClose}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div className="sa-modal-title">
                <span>{editMode ? '✏️' : '➕'}</span>
                <span>{editMode ? 'Edit User' : 'Tambah User Baru'}</span>
              </div>
              <button className="sa-modal-close" onClick={handleModalClose}>×</button>
            </div>
            
            <div className="sa-modal-body">
              <p className="sa-text-muted sa-mb-24" style={{ fontSize: '14px' }}>
                {editMode 
                  ? 'Ubah data user (password tidak dapat diubah)' 
                  : 'Isi form di bawah untuk menambahkan user baru ke sistem'
                }
              </p>
              
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="sa-form-group">
                  <label className="sa-form-label required">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contoh@if.ac.id"
                    className="sa-form-control"
                    required
                    disabled={formLoading}
                  />
                </div>

                {/* Password - hanya tampil saat tambah */}
                {!editMode && (
                  <div className="sa-form-group">
                    <label className="sa-form-label required">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimal 6 karakter"
                      className="sa-form-control"
                      required
                      minLength={6}
                      disabled={formLoading}
                    />
                  </div>
                )}

                {/* Role */}
                <div className="sa-form-group">
                  <label className="sa-form-label required">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="sa-form-control"
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
                  <div className="sa-form-hint">
                    Pilih role sesuai dengan hak akses yang diinginkan
                  </div>
                </div>
              </form>
            </div>

            <div className="sa-modal-footer">
              <button 
                type="button"
                onClick={handleModalClose} 
                className="sa-btn sa-btn-ghost"
                disabled={formLoading}
              >
                Batal
              </button>
              <button 
                type="submit"
                onClick={handleSubmit}
                className="sa-btn sa-btn-primary"
                disabled={formLoading}
              >
                {formLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
