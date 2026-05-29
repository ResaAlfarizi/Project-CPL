import React, { useState } from 'react';
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
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME_PINK = '#f4d6d6'; 
const DARK_PINK = '#c98a8a'; 
const SUBMIT_PINK = '#b35c5c'; 
const CANCEL_PINK = '#ffebee';
const CANCEL_TEXT = '#c62828'; 

// DUMMY DATA - Ditambah angkatan untuk Mahasiswa
const INITIAL_DATA = [
  { id: '1', email: 'budi.santoso@uinsa.ac.id', nama: 'Budi Santoso', role: 'Dosen', entityId: '198001012005011001' },
  { id: '2', email: 'siti.rahma@uinsa.ac.id', nama: 'Siti Rahma', role: 'Dosen', entityId: '198502022010012002' },
  { id: '3', email: '09010624010@mhs.ac.id', nama: 'Ahmad Fauzi', role: 'Mahasiswa', entityId: '09010624010', angkatan: '2024' },
  { id: '4', email: '09010624011@mhs.ac.id', nama: 'Dewi Lestari', role: 'Mahasiswa', entityId: '09010624011', angkatan: '2024' },
];

export default function KelolaUserScreen({ navigation }) {
  const [users, setUsers] = useState(INITIAL_DATA);
  const [modalVisible, setModalVisible] = useState(false);
  
  // --- STATE UNTUK POP-UP DETAIL USER ---
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State Filter
  const [filterRole, setFilterRole] = useState('Semua');
  const roleOptions = ['Semua', 'Dosen', 'Mahasiswa'];

  // Form State
  const [nama, setNama] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [entityId, setEntityId] = useState('');
  const [roleMode, setRoleMode] = useState('Mahasiswa');
  const [angkatan, setAngkatan] = useState(''); // 👈 TAMBAHAN STATE ANGKATAN

  const [alertConfig, setAlertConfig] = useState({ visible: false, type: '', title: '', message: '' });

  const filteredUsers = users.filter(user => filterRole === 'Semua' || user.role === filterRole);

  const handleAddUser = () => {
    // 👈 VALIDASI DIPERBARUI: Angkatan wajib diisi JIKA role-nya Mahasiswa
    if (!nama || !email || !password || !entityId || (roleMode === 'Mahasiswa' && !angkatan)) {
      setAlertConfig({ 
        visible: true, 
        type: 'error', 
        title: 'Lengkapi Data! 🚨', 
        message: 'Pastikan semua data lengkap sebelum menambahkan akun baru.' 
      });
      return;
    }

    const newUser = { 
        id: Date.now().toString(), 
        email: email, 
        nama: nama, 
        role: roleMode,
        entityId: entityId,
        angkatan: roleMode === 'Mahasiswa' ? angkatan : null // Hanya simpan angkatan kalau Mahasiswa
    };
    setUsers([newUser, ...users]);
    closeModal();

    setTimeout(() => {
      setAlertConfig({ 
        visible: true, 
        type: 'success', 
        title: 'Berhasil!', 
        message: `Akun ${roleMode} baru berhasil ditambahkan ke sistem.` 
      });
    }, 300);
  };

  const closeModal = () => {
    setModalVisible(false);
    setNama(''); 
    setEmail(''); 
    setPassword(''); 
    setEntityId('');
    setAngkatan(''); // 👈 RESET ANGKATAN
    setRoleMode('Mahasiswa');
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
        <Text style={styles.avatarText}>{item.nama.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.nama}</Text>
        <Text style={styles.cardSubtitle}>{item.role} • {item.email}</Text>
      </View>
      <Ionicons name="information-circle-outline" size={24} color={DARK_PINK} />
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
          <Text style={styles.headerSubtitle}>Kelola Akun Pengguna Program Studi Sistem Informasi</Text>
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

      <FlatList 
        data={filteredUsers} 
        keyExtractor={item => item.id} 
        renderItem={renderItem} 
        contentContainerStyle={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Belum ada pengguna di role ini.</Text>
          </View>
        }
      />
      
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

              {/* PILIHAN ROLE (Dipindah ke atas agar jelas dari awal sedang mengisi form apa) */}
              <View style={styles.roleWrap}>
                {['Dosen', 'Mahasiswa'].map((r) => (
                  <TouchableOpacity 
                    key={r}
                    style={[styles.roleBtn, roleMode === r ? styles.roleActive : styles.roleInactive]} 
                    onPress={() => {
                      setRoleMode(r);
                      if (r === 'Dosen') setAngkatan(''); // Bersihkan angkatan jika ganti ke Dosen
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.roleText, roleMode === r && {color: '#FFF'}]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Nama Lengkap *" placeholderTextColor="#94A3B8" value={nama} onChangeText={setNama} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Alamat Email *" placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Kata Sandi *" placeholderTextColor="#94A3B8" secureTextEntry value={password} onChangeText={setPassword} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="finger-print-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder={roleMode === 'Dosen' ? "NIP *" : "NIM *"} placeholderTextColor="#94A3B8" value={entityId} onChangeText={setEntityId} keyboardType="number-pad" />
              </View>

              {/* 👈 INPUT ANGKATAN: MUNCUL HANYA JIKA ROLE = MAHASISWA */}
              {roleMode === 'Mahasiswa' && (
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
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
                      <Text style={[styles.avatarText, { fontSize: 26 }]}>{selectedUser.nama.charAt(0).toUpperCase()}</Text>
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
                  
                  {/* Info Pribadi */}
                  <View style={styles.detailRow}>
                    <Ionicons name="finger-print-outline" size={18} color="#64748B" />
                    <Text style={styles.detailLabel}>{selectedUser.role === 'Dosen' ? 'NIP' : 'NIM'}</Text>
                  </View>
                  <Text style={styles.detailValue}>{selectedUser.entityId || '-'}</Text>

                  {/* 👈 TAMPILKAN ANGKATAN DI POP-UP JIKA MAHASISWA */}
                  {selectedUser.role === 'Mahasiswa' && (
                    <>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={18} color="#64748B" />
                        <Text style={styles.detailLabel}>Angkatan</Text>
                      </View>
                      <Text style={styles.detailValue}>{selectedUser.angkatan || '-'}</Text>
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

                  {/* Tombol Tutup */}
                  <TouchableOpacity 
                    style={[styles.btnSubmitFit, { width: '100%', backgroundColor: SUBMIT_PINK, marginTop: 25 }]} 
                    onPress={() => setDetailVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnSubmitTextFit}>Tutup</Text>
                  </TouchableOpacity>
                </>
              )}

            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* MODAL CUSTOM ALERT */}
      <Modal visible={alertConfig.visible} animationType="fade" transparent onRequestClose={() => setAlertConfig({...alertConfig, visible: false})}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setAlertConfig({...alertConfig, visible: false})}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.alertBox}>
              <View style={[styles.alertIconWrap, { backgroundColor: alertConfig.type === 'success' ? '#e0f2f1' : '#ffebee' }]}>
                <Ionicons 
                  name={alertConfig.type === 'success' ? "checkmark-circle" : "warning"} 
                  size={45} 
                  color={alertConfig.type === 'success' ? '#00796b' : '#c62828'} 
                />
              </View>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              
              <TouchableOpacity 
                style={[styles.btnAlertOK, { backgroundColor: alertConfig.type === 'success' ? SUBMIT_PINK : '#c62828' }]} 
                onPress={() => setAlertConfig({...alertConfig, visible: false})} 
                activeOpacity={0.8}
              >
                <Text style={styles.btnAlertOKText}>Oke, Mengerti</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FA' },
  header: { backgroundColor: THEME_PINK, paddingTop: 50, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', elevation: 4 },
  backBtn: { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
  
  filterSection: { paddingTop: 20, paddingBottom: 5 },
  scrollWrapper: { paddingHorizontal: 24, gap: 10 },
  pill: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  pillActive: { backgroundColor: SUBMIT_PINK, borderColor: SUBMIT_PINK, elevation: 2 },
  pillText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '800' },

  listContainer: { padding: 24, paddingBottom: 100, paddingTop: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  cardAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: THEME_PINK, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: '#212121' },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: THEME_PINK, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { fontFamily: 'Urbanist-Regular', marginTop: 10, color: '#94A3B8', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'flex-end' },
  modalContentLucu: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingTop: 15, paddingBottom: 40, elevation: 20 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitleLucu: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: '#212121', textAlign: 'center', marginBottom: 25 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fcf3f3', borderRadius: 18, marginBottom: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#f4d6d6' },
  inputIcon: { marginRight: 10 },
  inputLucu: { flex: 1, paddingVertical: 15, fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121' },
  
  roleWrap: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 18, alignItems: 'center', borderWidth: 1 },
  roleActive: { backgroundColor: SUBMIT_PINK, borderColor: SUBMIT_PINK },
  roleInactive: { backgroundColor: '#fcf3f3', borderColor: THEME_PINK },
  roleText: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#64748B' },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  btnSubmitFit: { flex: 0.48, backgroundColor: SUBMIT_PINK, borderRadius: 20, paddingVertical: 14, alignItems: 'center', elevation: 3 },
  btnSubmitTextFit: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnCancelFit: { flex: 0.48, backgroundColor: CANCEL_PINK, borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelTextFit: { color: CANCEL_TEXT, fontFamily: 'Urbanist-Bold', fontSize: 15 },

  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2, marginTop: 16 },
  detailLabel: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B', marginLeft: 6 },
  detailValue: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#212121', marginLeft: 24 },

  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '80%', alignItems: 'center', elevation: 20 },
  alertIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  btnAlertOK: { borderRadius: 20, paddingVertical: 14, paddingHorizontal: 30, alignItems: 'center', elevation: 3 },
  btnAlertOKText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 16 }
});