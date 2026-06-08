import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, 
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback, 
  Keyboard, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userApi, prodiApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;
const PRIMARY_DARK = BASE.primary;
const PRIMARY_BLUE = BASE.primaryLight;
const DANGER_COLOR = BASE.error;

// Definisi hak akses per role
const HAK_AKSES_MAP = {
  superadmin: [
    { modul: 'Master Data (Prodi, MK, CPL, Sub-CPMK)', aksi: ['Baca', 'Tambah', 'Edit', 'Hapus'] },
    { modul: 'Pemetaan MK-CPL', aksi: ['Baca', 'Tambah', 'Edit', 'Hapus'] },
    { modul: 'Threshold', aksi: ['Baca', 'Tambah', 'Edit', 'Hapus', 'Reset'] },
    { modul: 'Manajemen User', aksi: ['Baca', 'Tambah', 'Edit', 'Hapus'] },
    { modul: 'Input Nilai', aksi: ['Baca', 'Tambah', 'Edit', 'Hapus'] },
    { modul: 'Monitoring CPL', aksi: ['Baca', 'Tambah Manual', 'Edit', 'Hapus'] },
    { modul: 'Audit Log', aksi: ['Baca', 'Export'] },
  ],
  dosen: [
    { modul: 'Kelas & Mata Kuliah', aksi: ['Baca'] },
    { modul: 'Input Nilai Mahasiswa', aksi: ['Baca', 'Tambah', 'Edit'] },
    { modul: 'Capaian CPL Kelas', aksi: ['Baca'] },
    { modul: 'Profil Dosen', aksi: ['Baca', 'Edit'] },
  ],
  mahasiswa: [
    { modul: 'Capaian CPL Pribadi', aksi: ['Baca'] },
    { modul: 'Nilai Mata Kuliah', aksi: ['Baca'] },
    { modul: 'Profil Mahasiswa', aksi: ['Baca', 'Edit'] },
  ],
};

const ROLE_COLORS = {
  superadmin: { bg: '#f4d6d6', color: PRIMARY_DARK, border: '#f9a8a8' },
  dosen:      { bg: '#dcf4d6', color: '#166534', border: '#a8f9b0' },
  mahasiswa:  { bg: '#d6e8f4', color: '#1d4ed8', border: '#a8d0f9' },
};

export default function SAHakUserScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('semua');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editRoleVisible, setEditRoleVisible] = useState(false);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resUser, resProdi] = await Promise.all([
        userApi.getAll().catch(() => ({ data: [] })),
        prodiApi.getAll().catch(() => ({ data: [] })),
      ]);
      setUserList(resUser?.data || []);
      setProdiList(resProdi?.data || []);
    } catch (err) {
      Alert.alert('Gagal', 'Tidak dapat memuat data pengguna.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!newRole || !selectedUser) return;

    try {
      // Kirim role sebagai string — backend updateUser resolve role_id secara internal
      await userApi.update(selectedUser.id, { email: selectedUser.email, role: newRole });
      setEditRoleVisible(false);
      setDetailVisible(false);
      fetchData();
      Alert.alert('Berhasil', `Role "${selectedUser.email}" berhasil diubah menjadi ${newRole}.`);
    } catch (err) {
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan.');
    }
  };

  const filteredUsers = userList.filter(u => {
    const matchSearch =
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.nama || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = selectedRole === 'semua' || (u.role || '') === selectedRole;
    return matchSearch && matchRole;
  });

  const getHakAkses = (role) => HAK_AKSES_MAP[role] || [];

  const renderUser = ({ item, index }) => {
    const rc = ROLE_COLORS[item.role] || { bg: '#f1f5f9', color: '#64748B', border: '#e2e8f0' };
    return (
      <TouchableOpacity style={styles.card} onPress={() => { setSelectedUser(item); setDetailVisible(true); }} activeOpacity={0.8}>
        <View style={styles.cardAvatar}>
          <Text style={styles.cardAvatarText}>{(item.email || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardEmail} numberOfLines={1}>{item.email || '-'}</Text>
          <Text style={styles.cardName}>{item.nama || '-'}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: rc.bg, borderColor: rc.border }]}>
          <Text style={[styles.roleBadgeText, { color: rc.color }]}>{item.role || '-'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Hak Akses User</Text>
          <Text style={styles.headerSubtitle}>Kelola otoritas & peran pengguna</Text>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari email atau nama..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* FILTER ROLE */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleFilterRow}>
        {['semua', 'superadmin', 'dosen', 'mahasiswa'].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleFilterBtn, selectedRole === r && styles.roleFilterActive]}
            onPress={() => setSelectedRole(r)}
          >
            <Text style={[styles.roleFilterText, selectedRole === r && styles.roleFilterTextActive]}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_DARK} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item, i) => (item.id || i).toString()}
          renderItem={renderUser}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={fetchData}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="shield-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Tidak ada user ditemukan.</Text>
            </View>
          }
        />
      )}

      {/* MODAL DETAIL HAK AKSES */}
      <Modal visible={detailVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setDetailVisible(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            {selectedUser && (
              <>
                {/* Info user */}
                <View style={styles.detailUserInfo}>
                  <View style={styles.detailAvatar}>
                    <Text style={styles.detailAvatarText}>{(selectedUser.email || 'U').charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailEmail}>{selectedUser.email}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLORS[selectedUser.role] || {}).bg || '#f1f5f9', borderColor: (ROLE_COLORS[selectedUser.role] || {}).border || '#e2e8f0', alignSelf: 'flex-start' }]}>
                      <Text style={[styles.roleBadgeText, { color: (ROLE_COLORS[selectedUser.role] || {}).color || '#64748B' }]}>{selectedUser.role}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.editRoleBtn} onPress={() => { setNewRole(selectedUser.role); setEditRoleVisible(true); }}>
                    <Ionicons name="pencil" size={16} color={PRIMARY_BLUE} />
                    <Text style={styles.editRoleBtnText}>Ubah Role</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* Daftar hak akses */}
                <Text style={styles.hakAksesTitle}>Hak Akses Berdasarkan Role</Text>
                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                  {getHakAkses(selectedUser.role).map((hak, i) => (
                    <View key={i} style={styles.hakAksesRow}>
                      <View style={styles.hakAksesModulWrap}>
                        <Ionicons name="shield-checkmark" size={14} color={PRIMARY_BLUE} style={{ marginRight: 8 }} />
                        <Text style={styles.hakAksesModul}>{hak.modul}</Text>
                      </View>
                      <View style={styles.hakAksesActions}>
                        {hak.aksi.map((a, j) => (
                          <View key={j} style={styles.aksiBadge}>
                            <Text style={styles.aksiBadgeText}>{a}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                  {getHakAkses(selectedUser.role).length === 0 && (
                    <Text style={styles.emptyText}>Tidak ada data hak akses untuk role ini.</Text>
                  )}
                </ScrollView>

                <TouchableOpacity style={styles.btnClose} onPress={() => setDetailVisible(false)}>
                  <Text style={styles.btnCloseText}>Tutup</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL UBAH ROLE */}
      <Modal visible={editRoleVisible} animationType="fade" transparent>
        <View style={styles.alertOverlay}>
          <TouchableWithoutFeedback onPress={() => setEditRoleVisible(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.alertBox}>
            <Ionicons name="shield-half" size={40} color={PRIMARY_DARK} style={{ marginBottom: 12 }} />
            <Text style={styles.alertTitle}>Ubah Role Pengguna</Text>
            <Text style={styles.alertMessage}>{selectedUser?.email}</Text>
            <View style={{ width: '100%', gap: 10, marginBottom: 20 }}>
              {['superadmin', 'dosen', 'mahasiswa'].map((r) => {
                const rc = ROLE_COLORS[r];
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleChoiceBtn, { backgroundColor: newRole === r ? rc.bg : '#f8fafc', borderColor: newRole === r ? rc.border : '#e2e8f0' }]}
                    onPress={() => setNewRole(r)}
                  >
                    <Ionicons name={newRole === r ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={newRole === r ? rc.color : '#94A3B8'} />
                    <Text style={[styles.roleChoiceBtnText, { color: newRole === r ? rc.color : '#94A3B8' }]}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setEditRoleVisible(false)}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleChangeRole}>
                <Text style={styles.btnSubmitText}>Simpan Role</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FA' },
  header: { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  backBtn: { padding: 8, marginRight: 12 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 2 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#212121' },
  roleFilterRow: { paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
  roleFilterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  roleFilterActive: { backgroundColor: PRIMARY_DARK, borderColor: PRIMARY_DARK },
  roleFilterText: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#64748B' },
  roleFilterTextActive: { color: '#FFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cardAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardAvatarText: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK },
  cardContent: { flex: 1 },
  cardEmail: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#212121' },
  cardName: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#94A3B8' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  roleBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11 },
  emptyWrap: { alignItems: 'center', paddingTop: 50 },
  emptyText: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 12, textAlign: 'center' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingBottom: 40, maxHeight: '85%' },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  detailUserInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailAvatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  detailAvatarText: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK },
  detailEmail: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#212121', marginBottom: 6 },
  editRoleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0f2fe', padding: 8, borderRadius: 10, gap: 4 },
  editRoleBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: PRIMARY_BLUE },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 16 },
  hakAksesTitle: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  hakAksesRow: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  hakAksesModulWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  hakAksesModul: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#212121', flex: 1 },
  hakAksesActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  aksiBadge: { backgroundColor: '#f0f9ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  aksiBadgeText: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: PRIMARY_BLUE },
  btnClose: { backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  btnCloseText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  // Alert modal
  alertOverlay: { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 28, width: '85%', alignItems: 'center', elevation: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, marginBottom: 4, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B', marginBottom: 16, textAlign: 'center' },
  roleChoiceBtn: { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 14, borderRadius: 16, borderWidth: 1.5, gap: 10 },
  roleChoiceBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 15 },
  buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  btnCancel: { flex: 1, backgroundColor: '#ffebee', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelText: { color: DANGER_COLOR, fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmit: { flex: 1, backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  btnSubmitText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
});