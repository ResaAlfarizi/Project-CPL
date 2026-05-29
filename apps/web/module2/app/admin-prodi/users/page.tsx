'use client';

import React, { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ToastContainer, { showToast } from '@/components/Toast';

interface User {
  id: string;
  email: string;
  role: string;
  prodi_id?: string;
  nama_prodi?: string;
  nama?: string;
  identifier?: string; // NIDN for dosen, NIM for mahasiswa
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'dosen', // Default role untuk Admin Prodi
    nama: '',
    identifier: '', // NIDN for dosen, NIM for mahasiswa
  });
  const [formLoading, setFormLoading] = useState(false);

  // Available roles for Admin Prodi (tidak termasuk Superadmin dan Admin Prodi lain)
  const availableRoles = ['dosen', 'mahasiswa'];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAll();
      let allUsers = response.data || [];
      
      console.log('All users from API:', allUsers); // Debug log
      console.log('Current user:', currentUser); // Debug log
      
      // Filter: Hanya tampilkan Dosen dan Mahasiswa (tidak tampilkan Superadmin dan Admin Prodi lain)
      let filteredUsers = allUsers.filter((u: User) => 
        u.role === 'dosen' || u.role === 'mahasiswa'
      );
      
      console.log('After role filter:', filteredUsers); // Debug log
      
      // TIDAK filter by prodi_id - tampilkan semua Dosen dan Mahasiswa
      // Admin Prodi bisa melihat semua, tapi hanya bisa mengelola yang di prodi-nya
      
      console.log('Final filtered users:', filteredUsers); // Debug log
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error); // Debug log
      showToast(error instanceof Error ? error.message : 'Gagal memuat data user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    // Cek apakah user mencoba menghapus akun sendiri
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
      password: '',
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

    if (!editMode && !formData.password) {
      showToast('Password wajib diisi', 'error');
      return;
    }

    if (!editMode && formData.password.length < 6) {
      showToast('Password minimal 6 karakter', 'error');
      return;
    }

    // Validasi nama dan identifier untuk user baru
    if (!editMode) {
      if (!formData.nama) {
        showToast('Nama wajib diisi', 'error');
        return;
      }
      if (!formData.identifier) {
        const label = formData.role === 'dosen' ? 'NIDN' : 'NIM';
        showToast(`${label} wajib diisi`, 'error');
        return;
      }
    }

    try {
      setFormLoading(true);
      
      if (editMode && selectedUser) {
        // Update user
        await userApi.update(selectedUser.id, {
          email: formData.email.trim(),
          role: formData.role.trim(),
        });
        showToast('User berhasil diupdate', 'success');
      } else {
        // Create user dengan prodi_id dari admin prodi yang login
        const userProdiId = (currentUser as any)?.prodi_id;
        await userApi.create({
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role.trim(),
          prodi_id: userProdiId,
          nama: formData.nama.trim(),
          identifier: formData.identifier.trim(),
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
      role: 'dosen',
      nama: '',
      identifier: '',
    });
    setEditMode(false);
    setSelectedUser(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  // Filter users
  const filteredUsers = users
    .filter(user => currentUser && String(user.id) !== currentUser.id)
    .filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.nama && user.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.identifier && user.identifier.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Manajemen User</h1>
        <p className="page-subtitle">
          Kelola pengguna program studi Anda (Dosen & Mahasiswa)
        </p>
      </div>

      {/* Info Badge */}
      <div className="animate-fade-in stagger-1" style={{ 
        padding: '12px 16px', 
        backgroundColor: '#FFFBEB', 
        border: '1px solid #FDE68A', 
        borderRadius: '8px', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span style={{ fontSize: '13px', color: '#D97706', fontWeight: '500' }}>
          Anda hanya dapat mengelola user <strong>Dosen</strong> dan <strong>Mahasiswa</strong> di program studi Anda.
        </span>
      </div>

      {/* Toolbar */}
      <div className="animate-fade-in stagger-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
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
      <div className="card animate-fade-in stagger-3" style={{ padding: 0, overflow: 'hidden' }}>
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
            <p>Coba ubah kata kunci pencarian atau tambah user baru</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Email</th>
                <th>NIDN/NIM</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: '600' }}>{user.nama || '-'}</td>
                  <td style={{ fontSize: '13px' }}>{user.email}</td>
                  <td>
                    <span className="badge badge-dark" style={{ fontSize: '11px' }}>
                      {user.identifier || '-'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      user.role === 'dosen' ? 'badge-green' :
                      user.role === 'mahasiswa' ? 'badge-yellow' :
                      'badge-dark'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                : 'Isi form di bawah untuk menambahkan user baru ke program studi Anda'
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
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Role <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="select-field"
                  required
                  disabled={formLoading || editMode}
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Pilih role: Dosen atau Mahasiswa
                </p>
              </div>

              {/* Nama - hanya tampil saat tambah */}
              {!editMode && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Nama Lengkap <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder={formData.role === 'dosen' ? 'Contoh: Dr. Ahmad Wijaya, S.Kom., M.Kom.' : 'Contoh: Budi Santoso'}
                    className="input-field"
                    required
                    disabled={formLoading}
                  />
                </div>
              )}

              {/* NIDN/NIM - hanya tampil saat tambah */}
              {!editMode && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    {formData.role === 'dosen' ? 'NIDN' : 'NIM'} <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    placeholder={formData.role === 'dosen' ? 'Contoh: 0123456789' : 'Contoh: 2021001'}
                    className="input-field"
                    required
                    disabled={formLoading}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {formData.role === 'dosen' 
                      ? 'Nomor Induk Dosen Nasional (10 digit)' 
                      : 'Nomor Induk Mahasiswa'}
                  </p>
                </div>
              )}

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
