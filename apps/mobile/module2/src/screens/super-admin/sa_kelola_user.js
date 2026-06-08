import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, 
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback, 
  Keyboard, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userApi, prodiApi, tokenStorage } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;
const PRIMARY_DARK = BASE.primary;
const PRIMARY_BLUE = BASE.primaryLight;
const DANGER_COLOR = BASE.error;
const SUCCESS_COLOR = BASE.success;

// Daftar nama role yang ditampilkan di UI (tanpa admin_prodi karena SA yang kelola)
const ROLE_OPTIONS = ['superadmin', 'dosen', 'mahasiswa'];

// ─── CUSTOM ALERT MODAL ──────────────────────────────────────────────────────
function CustomAlert({ visible, type, title, message, onConfirm, onCancel, confirmText, cancelText }) {
  if (!visible) return null;

  const isSuccess = type === 'success';
  const isDanger  = type === 'danger';
  const isError   = type === 'error';

  const iconName  = isSuccess ? 'checkmark-circle' : isDanger ? 'trash' : isError ? 'close-circle' : 'alert-circle';
  const iconColor = isSuccess ? SUCCESS_COLOR : (isDanger || isError) ? DANGER_COLOR : PRIMARY_BLUE;
  const iconBg    = isSuccess ? '#dcfce7' : (isDanger || isError) ? '#fee2e2' : '#dbeafe';

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={alertStyles.overlay}>
        <View style={alertStyles.box}>
          <View style={[alertStyles.iconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={34} color={iconColor} />
          </View>
          <Text style={alertStyles.title}>{title}</Text>
          {!!message && <Text style={alertStyles.message}>{message}</Text>}
          <View style={alertStyles.btnRow}>
            {!!onCancel && (
              <TouchableOpacity style={alertStyles.btnCancel} onPress={onCancel}>
                <Text style={alertStyles.btnCancelText}>{cancelText || 'Batal'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                alertStyles.btnConfirm,
                { backgroundColor: isSuccess ? SUCCESS_COLOR : (isDanger || isError) ? DANGER_COLOR : PRIMARY_BLUE },
                !onCancel && { flex: 1 }
              ]}
              onPress={onConfirm}
            >
              <Text style={alertStyles.btnConfirmText}>{confirmText || 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const alertStyles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(36,53,74,0.55)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  box:            { backgroundColor: '#FFF', borderRadius: 28, padding: 28, width: '100%', alignItems: 'center', elevation: 24 },
  iconCircle:     { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title:          { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 8 },
  message:        { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 4 },
  btnRow:         { flexDirection: 'row', gap: 12, marginTop: 22, width: '100%' },
  btnCancel:      { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  btnCancelText:  { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#64748B' },
  btnConfirm:     { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  btnConfirmText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#FFF' },
});

export default function SAKelolaUserScreen({ navigation }) {
  const [data, setData]               = useState([]);
  const [prodiList, setProdiList]     = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editId, setEditId]           = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('dosen');
  const [password, setPassword] = useState('');

  // Custom alert state
  const [alert, setAlert] = useState({
    visible: false, type: 'info', title: '', message: '',
    onConfirm: null, onCancel: null, confirmText: '', cancelText: ''
  });

  const showAlert = (opts) => setAlert({ visible: true, ...opts });
  const hideAlert = () => setAlert(a => ({ ...a, visible: false }));

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
    fetchProdi();
  }, []);

  const fetchProdi = async () => {
    try {
      const res = await prodiApi.getAll();
      const prodi = res?.data || res || [];
      console.log('📊 Prodi List:', prodi.length, 'items');
      setProdiList(prodi);
    } catch (e) {
      console.warn('⚠️ Gagal memuat daftar prodi:', e.message);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Fetching users...');
      const res = await userApi.getAll();
      const users = res?.data || res || [];
      console.log('✅ Fetched Users:', users.length, 'items');

      // Backend getAllUsers sudah JOIN nama_prodi dan entity_type sebagai role
      // Tidak perlu fetch tambahan per user
      const normalized = users.map((u) => ({
        ...u,
        id:         u.id,
        role:       u.role || u.entity_type || 'dosen',
        nama_prodi: u.nama_prodi || 'Umum',
      }));

      setData(normalized);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      showAlert({
        type: 'error',
        title: 'Gagal Memuat Data',
        message: 'Tidak dapat terhubung ke server.',
        confirmText: 'OK',
        onConfirm: hideAlert
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!email.trim()) {
      showAlert({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Email wajib diisi!',
        confirmText: 'OK',
        onConfirm: hideAlert
      });
      return;
    }
    if (!email.includes('@')) {
      showAlert({
        type: 'error',
        title: 'Format Email Salah',
        message: 'Format email tidak valid.',
        confirmText: 'OK',
        onConfirm: hideAlert
      });
      return;
    }
    if (!editId && !password.trim()) {
      showAlert({
        type: 'error',
        title: 'Password Diperlukan',
        message: 'Password wajib diisi untuk akun baru!',
        confirmText: 'OK',
        onConfirm: hideAlert
      });
      return;
    }
    if (!editId && password.trim().length < 6) {
      showAlert({
        type: 'error',
        title: 'Password Terlalu Pendek',
        message: 'Password minimal 6 karakter.',
        confirmText: 'OK',
        onConfirm: hideAlert
      });
      return;
    }

    // Kirim role sebagai string langsung — backend resolve role_id secara internal
    const payload = { email: email.trim(), role, password: password.trim() || undefined };

    // Hapus field password dari payload update jika tidak diisi (tidak ubah password)
    if (editId && !password.trim()) {
      delete payload.password;
    }

    try {
      setIsLoading(true);
      if (editId) {
        await userApi.update(editId, payload);
        
        setFormModalVisible(false);
        resetForm();
        fetchUsers();
        
        setTimeout(() => showAlert({
          type: 'success',
          title: 'Berhasil Diperbarui',
          message: `Akun "${email.trim()}" berhasil diperbarui.`,
          confirmText: 'OK',
          onConfirm: hideAlert
        }), 350);
      } else {
        // Backend createUser sudah membuat entitas dosen/mahasiswa dalam satu transaksi
        // Tidak perlu buat entitas terpisah setelah ini
        await userApi.create(payload);

        setFormModalVisible(false);
        resetForm();
        fetchUsers();
        
        setTimeout(() => showAlert({
          type: 'success',
          title: 'Akun Berhasil Dibuat',
          message: `Akun baru untuk "${email.trim()}" berhasil ditambahkan.`,
          confirmText: 'OK',
          onConfirm: hideAlert
        }), 350);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      showAlert({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: error.message || 'Terjadi kesalahan saat menyimpan data.',
        confirmText: 'OK',
        onConfirm: hideAlert
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id, emailUser) => {
    // FIX: Gunakan hanya `id` (bukan `id || user_id`) karena kolom PK di DB adalah `id`
    setDetailModalVisible(false);
    setTimeout(() => {
      showAlert({
        type: 'danger',
        title: 'Hapus Akun',
        message: `Hapus akun "${emailUser}" secara permanen?\n\nTindakan ini tidak dapat dibatalkan.`,
        confirmText: 'Ya, Hapus',
        cancelText: 'Batal',
        onCancel: hideAlert,
        onConfirm: async () => {
          hideAlert();
          try {
            await userApi.delete(id);
            fetchUsers();
            
            setTimeout(() => showAlert({
              type: 'success',
              title: 'Berhasil Dihapus',
              message: `Akun "${emailUser}" telah dihapus dari sistem.`,
              confirmText: 'OK',
              onConfirm: hideAlert
            }), 350);
          } catch (error) {
            showAlert({
              type: 'error',
              title: 'Gagal Menghapus',
              message: error.message || 'Gagal menghapus akun.',
              confirmText: 'OK',
              onConfirm: hideAlert
            });
          }
        }
      });
    }, 250);
  };

  const openEditModal = (user) => {
    setDetailModalVisible(false);
    setTimeout(() => {
      // FIX: Gunakan hanya user.id karena kolom PK di DB adalah `id`
      setEditId(user.id);
      setEmail(user.email || '');
      setRole(user.role || 'dosen');
      setFormModalVisible(true);
    }, 250);
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
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedUser(item);
        setDetailModalVisible(true);
      }}
      activeOpacity={0.82}
    >
      <View style={styles.cardAvatar}>
        <Ionicons name="person" size={24} color={PRIMARY_BLUE} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardEmail}>{item.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{item.role || 'dosen'}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.15 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Manajemen User</Text>
          <Text style={styles.headerSubtitle}>Kelola akun pengguna sistem</Text>
        </View>
      </View>

      {/* SEARCH BAR & ADD BUTTON */}
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
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => { 
            resetForm(); 
            setFormModalVisible(true); 
          }}
        >
          <Ionicons name="person-add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_BLUE} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      ) : (
        <FlatList 
          data={filteredData} 
          keyExtractor={(item) => item.id.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={fetchUsers}
          showsVerticalScrollIndicator={false}
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

      {/* MODAL DETAIL USER */}
      <Modal visible={detailModalVisible} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.detailOverlay}>
          <TouchableWithoutFeedback onPress={() => setDetailModalVisible(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.detailBox}>
            {selectedUser && (
              <>
                {/* Header: Avatar & Email */}
                <View style={styles.detailHeader}>
                  <View style={styles.detailAvatarLarge}>
                    <Ionicons name="person" size={32} color={PRIMARY_BLUE} />
                  </View>
                  <View style={styles.detailHeaderText}>
                    <Text style={styles.detailEmail}>{selectedUser.email}</Text>
                    <View style={styles.detailRoleBadge}>
                      <Text style={styles.detailRoleText}>{selectedUser.role || 'dosen'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailDivider} />

                {/* Info Detail */}
                <View style={styles.detailInfoSection}>
                  <View style={styles.detailInfoRow}>
                    <Ionicons name="business-outline" size={16} color={PRIMARY_BLUE} />
                    <Text style={styles.detailInfoLabel}>Program Studi:</Text>
                  </View>
                  <Text style={styles.detailInfoValue}>{selectedUser.nama_prodi || 'Umum'}</Text>
                </View>

                <View style={styles.detailInfoSection}>
                  <View style={styles.detailInfoRow}>
                    <Ionicons name="id-card-outline" size={16} color={PRIMARY_BLUE} />
                    <Text style={styles.detailInfoLabel}>User ID:</Text>
                  </View>
                  <Text style={styles.detailInfoValue}>{selectedUser.id}</Text>
                </View>

                <View style={styles.detailDivider} />

                {/* Action Buttons */}
                <View style={styles.detailBtnRow}>
                  <TouchableOpacity
                    style={styles.detailBtnHapus}
                    onPress={() => handleDelete(selectedUser.id, selectedUser.email)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.detailBtnText}>Hapus</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.detailBtnEdit} 
                    onPress={() => openEditModal(selectedUser)}
                  >
                    <Ionicons name="pencil-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.detailBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL TAMBAH / EDIT USER */}
      <Modal visible={formModalVisible} animationType="slide" transparent>
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
              <TouchableOpacity 
                style={styles.btnCancel} 
                onPress={() => { 
                  setFormModalVisible(false); 
                  resetForm(); 
                }}
              >
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleSave}>
                <Text style={styles.btnSubmitText}>{editId ? 'Simpan Perubahan' : 'Buat Akun'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CUSTOM ALERT */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
      />
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
  addBtn:          { width: 48, height: 48, borderRadius: 24, backgroundColor: PRIMARY_BLUE, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:     { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B', marginTop: 12 },
  
  listContainer:   { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  card:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  cardAvatar:      { width: 48, height: 48, borderRadius: 24, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardContent:     { flex: 1 },
  cardEmail:       { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#212121', marginBottom: 6 },
  roleBadge:       { alignSelf: 'flex-start', backgroundColor: PRIMARY_DARK, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  roleBadgeText:   { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#FFF', textTransform: 'uppercase' },
  
  emptyWrap:       { alignItems: 'center', paddingTop: 80 },
  emptyText:       { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 12, textAlign: 'center' },
  
  // Detail Modal
  detailOverlay:     { flex: 1, backgroundColor: 'rgba(36,53,74,0.55)', justifyContent: 'flex-end' },
  detailBox:         { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 28, paddingBottom: 40 },
  detailHeader:      { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  detailAvatarLarge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  detailHeaderText:  { flex: 1 },
  detailEmail:       { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, marginBottom: 8 },
  detailRoleBadge:   { alignSelf: 'flex-start', backgroundColor: PRIMARY_DARK, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 },
  detailRoleText:    { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#FFF', textTransform: 'uppercase' },
  detailDivider:     { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  detailInfoSection: { marginBottom: 14 },
  detailInfoRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  detailInfoLabel:   { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailInfoValue:   { fontFamily: 'Urbanist-Medium', fontSize: 14, color: PRIMARY_DARK },
  detailBtnRow:      { flexDirection: 'row', gap: 12, marginTop: 6 },
  detailBtnHapus:    { flex: 1, backgroundColor: DANGER_COLOR, borderRadius: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  detailBtnEdit:     { flex: 1, backgroundColor: PRIMARY_BLUE, borderRadius: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  detailBtnText:     { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#FFF' },
  
  // Form Modal
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
  btnCancel:       { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  btnCancelText:   { color: '#64748B', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmit:       { flex: 1, backgroundColor: PRIMARY_BLUE, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  btnSubmitText:   { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
});