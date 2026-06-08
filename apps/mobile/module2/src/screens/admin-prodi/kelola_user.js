import React, { useState, useEffect } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  StatusBar, 
  ImageBackground, 
  Modal, 
  TextInput, 
  TouchableWithoutFeedback, 
  Keyboard,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ Import API & Theme
import { userApi, prodiApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, CustomAlert, EmptyState } from '../../components';

// ✅ THEME ADMIN PRODI
const THEME = ROLE_THEMES.adminProdi;
const PRIMARY_DARK = BASE.primary; 

export default function KelolaUserScreen({ navigation }) {
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [modalVisible, setModalVisible] = useState(false);
  
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [filterRole, setFilterRole] = useState('Semua');
  const roleOptions = ['Semua', 'Dosen', 'Mahasiswa'];

  const [nama, setNama] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [entityId, setEntityId] = useState('');
  const [roleMode, setRoleMode] = useState('Mahasiswa');
  const [angkatan, setAngkatan] = useState(''); 

  // ✅ STATE BARU UNTUK MENAMPUNG UUID PRODI YANG VALID DARI BACKEND
  const [selectedProdiId, setSelectedProdiId] = useState('');

  // ✅ State Alert - Using CustomAlert component
  const [alert, setAlert] = useState({ 
    visible: false, type: 'info', title: '', message: '', onConfirm: null 
  });

  // ✅ 1. PROSES GET DATA DENGAN MENYESUAIKAN VARIABEL 'identifier' DARI BE
  const fetchUsersData = () => {
    setLoading(true);
    userApi.getAll()
      .then(result => {
        const rawData = result && result.data && Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);

        console.log("=== DATA USER DARI BE ===", JSON.stringify(rawData, null, 2));

        const normalizedData = rawData.map(item => {
          const roleRaw = item.role || item.tipe || '';
          let roleClean = roleRaw;
          if (roleRaw.toLowerCase() === 'dosen') roleClean = 'Dosen';
          if (roleRaw.toLowerCase() === 'mahasiswa') roleClean = 'Mahasiswa';

          let idIdentitas = item.identifier || item.nim || item.nidn || item.nip || item.entityId;
          
          if (!idIdentitas || idIdentitas === '-') {
            if (item.mahasiswa && typeof item.mahasiswa === 'object') {
              idIdentitas = item.mahasiswa.nim || item.mahasiswa.identifier;
            } else if (item.dosen && typeof item.dosen === 'object') {
              idIdentitas = item.dosen.nidn || item.dosen.nip || item.dosen.identifier;
            }
          }

          let tahunAngkatan = item.angkatan || item.tahun_masuk;
          if (!tahunAngkatan || tahunAngkatan === '-') {
            if (item.mahasiswa && typeof item.mahasiswa === 'object') {
              tahunAngkatan = item.mahasiswa.angkatan || item.mahasiswa.tahun_masuk;
            }
          }

          return {
            ...item,
            id: item.id || Math.random().toString(),
            nama: item.nama || item.name || 'Pengguna',
            email: item.email || '-',
            role: roleClean,
            entityId: idIdentitas || '-',
            angkatan: tahunAngkatan || '-'
          };
        });

        const filteredDB = normalizedData.filter(user => user.role === 'Dosen' || user.role === 'Mahasiswa');
        setUsers(filteredDB);
      })
      .catch(error => {
        console.error("Gagal menarik data user:", error);
        setUsers([]); 
      })
      .finally(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 300);
      });
  };

  useEffect(() => {
    fetchUsersData();

    // ✅ OTOMATIS MENGAMBIL UUID PRODI YANG REAL SAAT HALAMAN DIBUKA
    if (prodiApi && typeof prodiApi.getAll === 'function') {
      prodiApi.getAll()
        .then(result => {
          const dataProdi = result && result.data ? result.data : result;
          if (Array.isArray(dataProdi) && dataProdi.length > 0) {
            // Ambil id (UUID) prodi pertama sebagai default prodi_id mahasiswa/dosen baru
            setSelectedProdiId(dataProdi[0].id);
            console.log("Berhasil mendapatkan UUID Prodi asli dari database:", dataProdi[0].id);
          }
        })
        .catch(err => {
          console.error("❌ Gagal mendapatkan UUID Prodi dari backend:", err);
        });
    }
  }, []);

  const filteredUsers = users.filter(user => filterRole === 'Semua' || user.role === filterRole);

  // ✅ 2. PROSES POST DATA SESUAI REQUEST BODY CONTROLLER BE (MENGGUNAKAN UUID REAL)
  const handleAddUser = () => {
    if (!nama || !email || !password || !entityId || (roleMode === 'Mahasiswa' && !angkatan)) {
      setAlert({ 
        visible: true, type: 'error', 
        title: 'Lengkapi Data!', 
        message: 'Pastikan semua data lengkap sebelum menyimpan Akun Baru.',
        onConfirm: () => setAlert({ ...alert, visible: false })
      });
      return;
    }

    // Antisipasi jika UUID prodi belum selesai di-load dari server saat klik simpan
    if (!selectedProdiId) {
      setAlert({
        visible: true, type: 'error', 
        title: 'Mohon Tunggu',
        message: 'Sistem sedang menghubungkan ke database Program Studi. Silakan coba simpan kembali dalam 2 detik.',
        onConfirm: () => setAlert({ ...alert, visible: false })
      });
      return;
    }

    // 🌟 SEKARANG PAYLOAD MENGGUNAKAN 'selectedProdiId' (UUID ASLI), BUKAN "1" LAGI
    const payload = { 
      email: email, 
      password: password,
      role: roleMode,
      nama: nama, 
      identifier: entityId,  
      prodi_id: selectedProdiId, // 🧠 Mengatasi error 500 invalid input syntax for type uuid
      angkatan: angkatan     
    };

    closeModal();
    setLoading(true);

    userApi.create(payload)
      .then(res => {
        console.log("=== BERHASIL SIMPAN KE BE ===", res);
        return fetchUsersData();
      }) 
      .then(() => {
        setTimeout(() => setAlert({ 
          visible: true, type: 'success', 
          title: 'Berhasil!', 
          message: `Akun ${roleMode} berhasil disimpan ke database.`,
          onConfirm: () => setAlert({ ...alert, visible: false })
        }), 300);
      })
      .catch(err => {
        console.error("=== GAGAL SIMPAN API ===", err);
        setLoading(false);
        setTimeout(() => setAlert({ 
          visible: true, type: 'error', 
          title: 'Gagal', 
          message: err.message || 'Gagal menambahkan akun ke database.',
          onConfirm: () => setAlert({ ...alert, visible: false })
        }), 300);
      });
  };

  const closeModal = () => {
    setModalVisible(false);
    setNama(''); setEmail(''); setPassword(''); 
    setEntityId(''); setAngkatan(''); setRoleMode('Mahasiswa');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={() => {
        setSelectedUser(item);
        setDetailVisible(true);
      }}
    >
      <View style={styles.cardAvatar}>
        <Text style={styles.avatarText}>{item.nama?.charAt(0).toUpperCase() || 'U'}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.nama}</Text>
        <Text style={styles.cardSubtitle}>{item.role} • {item.email}</Text>
      </View>
      <Ionicons name="information-circle-outline" size={24} color={PRIMARY_DARK} />
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.15 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Manajemen User</Text>
          <Text style={styles.headerSubtitle}>Kelola Akun Pengguna Program Studi</Text>
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollWrapper}>
          {roleOptions.map((role, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.pill, filterRole === role && styles.pillActive]}
              onPress={() => setFilterRole(role)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, filterRole === role && styles.pillTextActive]}>{role}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingState message="Memuat pengguna..." color={BASE.primary} />
      ) : (
        <FlatList 
          data={filteredUsers} 
          keyExtractor={item => item.id.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContainer} 
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState 
              icon="people-outline" 
              message="Belum ada pengguna di role ini."
            />
          }
        />
      )}
      
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Ionicons name="person-add" size={24} color="#212121" />
      </TouchableOpacity>

      {/* MODAL FORM TAMBAH USER */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContentLucu}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitleLucu}>Tambah Akun Baru</Text>

              {/* PILIHAN ROLE */}
              <View style={styles.roleWrap}>
                {['Dosen', 'Mahasiswa'].map((r) => (
                  <TouchableOpacity 
                    key={r}
                    style={[styles.roleBtn, roleMode === r ? styles.roleActive : styles.roleInactive]} 
                    onPress={() => {
                      setRoleMode(r);
                      if (r === 'Dosen') setAngkatan(''); 
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.roleText, roleMode === r && {color: '#FFF'}]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={PRIMARY_DARK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Nama Lengkap *" placeholderTextColor="#94A3B8" value={nama} onChangeText={setNama} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={PRIMARY_DARK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Alamat Email *" placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={PRIMARY_DARK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Kata Sandi *" placeholderTextColor="#94A3B8" secureTextEntry value={password} onChangeText={setPassword} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="finger-print-outline" size={20} color={PRIMARY_DARK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder={roleMode === 'Dosen' ? "NIDN / NIP *" : "NIM *"} placeholderTextColor="#94A3B8" value={entityId} onChangeText={setEntityId} keyboardType="number-pad" />
              </View>

              {roleMode === 'Mahasiswa' && (
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={20} color={PRIMARY_DARK} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.inputLucu} 
                    placeholder="Tahun Angkatan (Contoh: 2024) *" 
                    placeholderTextColor="#94A3B8" 
                    value={angkatan} 
                    onChangeText={setAngkatan} 
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.btnCancelFit} onPress={closeModal}>
                  <Text style={styles.btnCancelTextFit}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSubmitFit} onPress={handleAddUser}>
                  <Text style={styles.btnSubmitTextFit}>Simpan</Text>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* --- MODAL POP-UP DETAIL USER --- */}
      <Modal visible={detailVisible} animationType="fade" transparent onRequestClose={() => setDetailVisible(false)}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setDetailVisible(false)}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.alertBox, { alignItems: 'flex-start', padding: 24, width: '85%' }]}>
              
              {selectedUser && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <View style={[styles.cardAvatar, { marginRight: 15, width: 64, height: 64, borderRadius: 20 }]}>
                      <Text style={[styles.avatarText, { fontSize: 26 }]}>{selectedUser.nama?.charAt(0).toUpperCase() || 'U'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { fontSize: 18, marginBottom: 4 }]}>{selectedUser.nama}</Text>
                      <View style={[styles.roleBadge, { backgroundColor: '#fcf3f3' }]}>
                        <Text style={[styles.roleBadgeText, { color: SUBMIT_PINK }]}>
                          {selectedUser.role}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="finger-print-outline" size={18} color="#64748B" />
                    <Text style={styles.detailLabel}>{selectedUser.role === 'Dosen' ? 'NIDN / NIP' : 'NIM'}</Text>
                  </View>
                  <Text style={styles.detailValue}>{selectedUser.entityId}</Text>

                  {selectedUser.role === 'Mahasiswa' && (
                    <>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color="#64748B" />
                        <Text style={styles.detailLabel}>Angkatan</Text>
                      </View>
                      <Text style={styles.detailValue}>{selectedUser.angkatan}</Text>
                    </>
                  )}

                  <View style={styles.detailRow}>
                    <Ionicons name="mail-outline" size={18} color="#64748B" />
                    <Text style={styles.detailLabel}>Email</Text>
                  </View>
                  <Text style={styles.detailValue}>{selectedUser.email}</Text>

                  <View style={styles.detailRow}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#64748B" />
                    <Text style={styles.detailLabel}>Status Akun</Text>
                  </View>
                  <Text style={[styles.detailValue, { color: '#00796b' }]}>Aktif Terverifikasi</Text>
                </>
              )}

            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* ✅ CUSTOM ALERT */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        confirmText="Oke, Mengerti"
      />

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.background },
  header: { 
    backgroundColor: THEME.primary, 
    paddingTop: 50, 
    paddingBottom: 30, 
    paddingHorizontal: 24, 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32, 
    flexDirection: 'row', 
    elevation: 4 
  },
  backBtn: { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: BASE.textMain, marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: BASE.textMuted },
  
  filterSection: { paddingTop: 20, paddingBottom: 5 },
  scrollWrapper: { paddingHorizontal: 24, gap: 10 },
  pill: { backgroundColor: BASE.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: BASE.border },
  pillActive: { backgroundColor: BASE.primary, borderColor: BASE.primary, elevation: 2 },
  pillText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textMuted },
  pillTextActive: { color: BASE.surface, fontWeight: '800' },

  listContainer: { padding: 24, paddingBottom: 100, paddingTop: 10 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: BASE.surface, 
    padding: 16, 
    borderRadius: 24, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: BASE.border, 
    elevation: 2 
  },
  cardAvatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    backgroundColor: THEME.secondary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: BASE.textMain },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain, marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: BASE.textMuted },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    width: 60, 
    height: 60, 
    borderRadius: 20, 
    backgroundColor: THEME.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5 
  },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'flex-end' },
  modalContentLucu: { 
    backgroundColor: BASE.surface, 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    padding: 24, 
    paddingTop: 15, 
    paddingBottom: 40, 
    elevation: 20 
  },
  modalHandle: { width: 40, height: 5, backgroundColor: BASE.border, borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitleLucu: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: BASE.textMain, textAlign: 'center', marginBottom: 25 },
  
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: THEME.accent, 
    borderRadius: 18, 
    marginBottom: 12, 
    paddingHorizontal: 15, 
    borderWidth: 1, 
    borderColor: BASE.border 
  },
  inputIcon: { marginRight: 10 },
  inputLucu: { flex: 1, paddingVertical: 15, fontFamily: 'Urbanist-Regular', fontSize: 15, color: BASE.textMain },
  
  roleWrap: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 18, alignItems: 'center', borderWidth: 1 },
  roleActive: { backgroundColor: BASE.primary, borderColor: BASE.primary },
  roleInactive: { backgroundColor: THEME.accent, borderColor: THEME.secondary },
  roleText: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: BASE.textMuted },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  btnSubmitFit: { 
    flex: 0.48, 
    backgroundColor: BASE.primary, 
    borderRadius: 20, 
    paddingVertical: 14, 
    alignItems: 'center', 
    elevation: 3 
  },
  btnSubmitTextFit: { color: BASE.surface, fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnCancelFit: { 
    flex: 0.48, 
    backgroundColor: BASE.errorBg, 
    borderRadius: 20, 
    paddingVertical: 14, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: BASE.errorBorder 
  },
  btnCancelTextFit: { color: BASE.error, fontFamily: 'Urbanist-Bold', fontSize: 15 },

  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2, marginTop: 16 },
  detailLabel: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textMuted, marginLeft: 6 },
  detailValue: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: BASE.textMain, marginLeft: 24 },

  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
});