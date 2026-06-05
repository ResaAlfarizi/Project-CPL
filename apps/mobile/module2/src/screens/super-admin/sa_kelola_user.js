import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, 
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback, 
  Keyboard, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userApi, rolesApi, dosenApi, mahasiswaApi, tokenStorage } from '../../services/api';

const THEME_COLOR = '#a3c1e5'; 
const PRIMARY_DARK = '#24354a';
const DANGER_COLOR = '#c62828';

// Daftar nama role yang ditampilkan di UI (tanpa admin_prodi karena SA yang kelola)
const ROLE_OPTIONS = ['superadmin', 'dosen', 'mahasiswa'];

export default function SAKelolaUserScreen({ navigation }) {
  const [data, setData]               = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId]           = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');

  // Form state — role disimpan sebagai nama string untuk keperluan UI,
  // dikonversi ke role_id saat dikirim ke API.
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('dosen');
  const [password, setPassword] = useState('');

  // roleMap: { nama_role → role_id } diambil dari API agar tidak hardcode UUID
  const [roleMap, setRoleMap] = useState({});

  // ─── Ambil token/session ID superadmin ───
  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await tokenStorage.get();
        if (token) {
          // Decode JWT payload untuk ambil ID (base64url)
          const base64Payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64Payload));
          setCurrentUserId(payload.id || payload.userId || payload.sub || '—');
        }
      } catch (e) {
        setCurrentUserId('—');
      }
    };
    loadSession();
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await rolesApi.getAll();
      const roles = res?.data || res || [];
      // Bangun map { nama_role → id } dari response API
      const map = {};
      roles.forEach(r => {
        if (r.nama_role && r.id) map[r.nama_role] = r.id;
      });
      setRoleMap(map);
    } catch (e) {
      console.warn('Gagal memuat daftar roles:', e.message);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userApi.getAll();
      const users = res?.data || res || [];
      // Normalisasi: pastikan setiap item punya field `role` sebagai string
      // (backend mungkin mengembalikan role_id atau nested object roles.nama_role)
      const normalized = users.map(u => ({
        ...u,
        id:   u.id,           // kolom PK di DB adalah `id` (UUID), tidak ada user_id
        role: u.roles?.nama_role || u.role || u.nama_role || 'dosen',
      }));
      setData(normalized);
    } catch (error) {
      Alert.alert('Gagal Memuat', 'Tidak dapat terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!email.trim()) {
      Alert.alert('Validasi', 'Email wajib diisi!');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Validasi', 'Format email tidak valid.');
      return;
    }
    if (!editId && !password.trim()) {
      Alert.alert('Validasi', 'Password wajib diisi untuk akun baru!');
      return;
    }
    if (!editId && password.trim().length < 6) {
      Alert.alert('Validasi', 'Password minimal 6 karakter.');
      return;
    }

    // Resolusi role_id dari roleMap (hasil fetch rolesApi.getAll())
    // Fallback ke nama role string jika roleMap belum terisi (backend yang resolve)
    const roleId = roleMap[role];
    const payload = roleId
      ? { email: email.trim(), role_id: roleId, password: password.trim() || undefined }
      : { email: email.trim(), role, password: password.trim() || undefined };

    // Hapus field password dari payload update jika tidak diisi (tidak ubah password)
    if (editId && !password.trim()) {
      delete payload.password;
    }

    try {
      setIsLoading(true);
      if (editId) {
        await userApi.update(editId, payload);
        Alert.alert('Berhasil', 'Akun berhasil diperbarui.');
      } else {
        // Buat user di tabel users terlebih dahulu
        const createRes = await userApi.create(payload);
        const newUserId = createRes?.data?.id || createRes?.id;

        // Jika role dosen atau mahasiswa, buat entitas terkait agar tidak orphan
        if (newUserId) {
          try {
            if (role === 'dosen') {
              await dosenApi.create({ user_id: newUserId, nama: email.trim().split('@')[0], nip: '' });
            } else if (role === 'mahasiswa') {
              await mahasiswaApi.create({ user_id: newUserId, nama: email.trim().split('@')[0], nim: '' });
            }
          } catch (entityErr) {
            // Entitas gagal dibuat — tampilkan peringatan tapi tidak rollback user
            console.warn('Gagal membuat entitas terkait:', entityErr.message);
            Alert.alert(
              'Perhatian',
              `Akun berhasil dibuat, namun data entitas ${role} gagal diinisialisasi. Lengkapi profil ${role} secara manual.\n\n(${entityErr.message})`
            );
            setModalVisible(false);
            resetForm();
            fetchUsers();
            return;
          }
        }

        Alert.alert('Berhasil', 'Akun baru berhasil dibuat.');
      }
      setModalVisible(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id, emailUser) => {
    // FIX: Gunakan hanya `id` (bukan `id || user_id`) karena kolom PK di DB adalah `id`
    Alert.alert(
      'Hapus Akun',
      `Hapus akun "${emailUser}" secara permanen?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Hapus', style: 'destructive',
          onPress: async () => {
            try {
              await userApi.delete(id);
              fetchUsers();
            } catch (error) {
              Alert.alert('Gagal', error.message || 'Gagal menghapus akun.');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (user) => {
    // FIX: Gunakan hanya user.id karena kolom PK di DB adalah `id`
    setEditId(user.id);
    setEmail(user.email || '');
    setRole(user.role || 'dosen');
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditId(null);
    setEmail('');
    setRole('dosen');
    setPassword('');
  };

  const filteredData = data.filter(item =>
    (item.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.role  || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.cardNoBadge}>
        <Text style={styles.cardNoText}>{index + 1}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardEmail}>{item.email}</Text>
        <View style={styles.roleBadge}>
          {/* Tampilkan nama role (string), bukan role_id */}
          <Text style={styles.roleBadgeText}>{item.role || 'dosen'}</Text>
        </View>
      </View>
      <View style={styles.actionBtns}>
        <TouchableOpacity style={styles.btnEdit} onPress={() => openEditModal(item)}>
          <Ionicons name="pencil" size={16} color="#0284c7" />
        </TouchableOpacity>
        {/* FIX: Gunakan item.id saja, hapus fallback item.user_id */}
        <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item.id, item.email)}>
          <Ionicons name="trash" size={16} color={DANGER_COLOR} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Manajemen User</Text>
          <Text style={styles.headerSubtitle}>
            Login sebagai: superadmin — ID: {currentUserId}
          </Text>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari email atau role..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
          <Ionicons name="person-add" size={18} color={PRIMARY_DARK} />
          <Text style={styles.addBtnText}>Tambah User</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_DARK} />
        </View>
      ) : (
        <FlatList 
          data={filteredData} 
          keyExtractor={(item) => item.id.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={fetchUsers}
          ListHeaderComponent={
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 0.3 }]}>NO</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>EMAIL</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>ROLE</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.6 }]}>AKSI</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="people-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Tidak ada user yang cocok.' : 'Belum ada user terdaftar.'}
              </Text>
            </View>
          }
        />
      )}

      {/* MODAL TAMBAH / EDIT USER */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editId ? 'Edit Akun User' : 'Registrasi Pengguna Baru'}</Text>

            {/* ROLE SELECTOR */}
            <Text style={styles.fieldLabel}>Hak Akses (Role)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {ROLE_OPTIONS.map((r) => (
                <TouchableOpacity 
                  key={r} 
                  style={[styles.roleBtn, role === r ? styles.roleActive : styles.roleInactive]} 
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.roleText, role === r && { color: '#FFF' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Email pengguna" 
              placeholderTextColor="#94A3B8" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.fieldLabel}>{editId ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}</Text>
            <TextInput 
              style={styles.input} 
              placeholder={editId ? 'Biarkan kosong jika tidak diubah' : 'Minimal 6 karakter'} 
              placeholderTextColor="#94A3B8" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => { setModalVisible(false); resetForm(); }}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleSave}>
                <Text style={styles.btnSubmitText}>{editId ? 'Simpan Perubahan' : 'Buat Akun'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F6F5FA' },
  header:          { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', alignItems: 'center' },
  backBtn:         { padding: 8, marginRight: 12 },
  headerTextWrap:  { flex: 1 },
  headerTitle:     { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 2 },
  headerSubtitle:  { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#64748B' },
  searchWrap:      { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 10, alignItems: 'center' },
  searchBox:       { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput:     { flex: 1, paddingVertical: 10, fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#212121' },
  addBtn:          { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME_COLOR, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, gap: 6 },
  addBtnText:      { fontFamily: 'Urbanist-Bold', fontSize: 13, color: PRIMARY_DARK },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer:   { paddingHorizontal: 20, paddingBottom: 40 },
  tableHeader:     { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f1f5f9', borderRadius: 12, marginBottom: 8 },
  tableHeaderCell: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase' },
  card:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 20, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cardNoBadge:     { width: 30, alignItems: 'center' },
  cardNoText:      { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#94A3B8' },
  cardContent:     { flex: 1, paddingHorizontal: 10 },
  cardEmail:       { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#212121', marginBottom: 4 },
  roleBadge:       { alignSelf: 'flex-start', backgroundColor: PRIMARY_DARK, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  roleBadgeText:   { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#FFF' },
  actionBtns:      { flexDirection: 'row', gap: 8 },
  btnEdit:         { padding: 8, backgroundColor: '#e0f2fe', borderRadius: 10 },
  btnDelete:       { padding: 8, backgroundColor: '#ffebee', borderRadius: 10 },
  emptyWrap:       { alignItems: 'center', paddingTop: 50 },
  emptyText:       { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 12 },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'flex-end' },
  modalContent:    { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingBottom: 40 },
  modalHandle:     { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitle:      { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 20 },
  fieldLabel:      { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  roleBtn:         { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 18, borderWidth: 1, marginRight: 10 },
  roleActive:      { backgroundColor: PRIMARY_DARK, borderColor: PRIMARY_DARK },
  roleInactive:    { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  roleText:        { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#64748B' },
  input:           { backgroundColor: '#f8fafc', borderRadius: 18, marginBottom: 16, paddingHorizontal: 15, paddingVertical: 14, fontFamily: 'Urbanist-Regular', fontSize: 15, borderWidth: 1, borderColor: '#e2e8f0', color: '#212121' },
  buttonRow:       { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnCancel:       { flex: 1, backgroundColor: '#ffebee', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelText:   { color: DANGER_COLOR, fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmit:       { flex: 1, backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  btnSubmitText:   { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
});