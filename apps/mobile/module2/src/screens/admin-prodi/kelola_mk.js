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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mengambil fungsi fetch dasar dari api.js kamu
const API_BASE = 'http://192.168.18.81:3000/api/v1/m2'; 

const THEME_PINK = '#f4d6d6'; 
const DARK_PINK = '#c98a8a'; 
const SUBMIT_PINK = '#b35c5c'; 
const CANCEL_PINK = '#ffebee';
const CANCEL_TEXT = '#c62828'; 

const SEMESTER_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8'];

// DATA CADANGAN (Jika BE belum siap / error 404)
const DUMMY_MATA_KULIAH = [
  { id: '1', kode: 'SI-301', title: 'Pemrograman Mobile', sks: 3, kelas: 'A', semester: 4 },
  { id: '2', kode: 'SI-302', title: 'Desain Pengalaman Pengguna (UX)', sks: 3, kelas: 'B', semester: 4 },
  { id: '3', kode: 'SI-305', title: 'Analisis dan Desain Sistem', sks: 4, kelas: 'A', semester: 4 }
];

export default function KelolaMKScreen({ navigation }) {
  const [data, setData] = useState(DUMMY_MATA_KULIAH);
  const [isLoading, setIsLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [semesterModalVisible, setSemesterModalVisible] = useState(false); 
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMk, setSelectedMk] = useState(null);
  
  const [kode, setKode] = useState('');
  const [namaMk, setNamaMk] = useState('');
  const [sks, setSks] = useState(''); 
  const [kelas, setKelas] = useState(''); 
  const [semester, setSemester] = useState('1'); 

  const [alertConfig, setAlertConfig] = useState({ visible: false, type: '', title: '', message: '' });

  // Fungsi fetch global yang meniru standarisasi api.js kamu
  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = await AsyncStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!res.ok) throw new Error(`HTTP Error! Status: ${res.status}`);
    return await res.json();
  };

  // 📡 PROSES AMBIL DATA UTAMA
  const fetchMataKuliah = async () => {
    setIsLoading(true);
    try {
      // Menembak endpoint asli yang seharusnya ada di BE
      const res = await fetchWithAuth('/mata-kuliah'); 
      if (res && res.data) {
        setData(res.data); // Jika BE sukses merespons, pakai data asli BE
      }
    } catch (error) {
      console.log("📡 BE Belum Siap (404/Error). Menggunakan data lokal sementara.");
      setData(DUMMY_MATA_KULIAH); // Fallback otomatis ke data awal jika BE error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMataKuliah();
  }, []);

  const handleOpenDetail = (item) => {
    setSelectedMk(item);
    setDetailModalVisible(true);
  };

  const handleEditTrigger = () => {
    if (!selectedMk) return;
    setIsEditMode(true);
    setKode(selectedMk.kode);
    setNamaMk(selectedMk.title);
    setSks(String(selectedMk.sks));
    setKelas(selectedMk.kelas);
    setSemester(String(selectedMk.semester));
    
    setDetailModalVisible(false);
    setTimeout(() => {
      setModalVisible(true);
    }, 300);
  };

  // 💾 PROSES SIMPAN DATA KE BE
  const handleSave = async () => {
    if (!kode || !namaMk || !sks || !kelas || !semester) {
      setAlertConfig({ 
        visible: true, 
        type: 'error', 
        title: 'Lengkapi Data!', 
        message: 'Pastikan semua field telah terisi sebelum menyimpan.' 
      });
      return;
    }

    const payload = {
      kode: kode,
      title: namaMk,
      sks: parseInt(sks, 10),
      kelas: kelas.toUpperCase(),
      semester: parseInt(semester, 10)
    };

    setIsLoading(true);
    closeModal();

    try {
      if (isEditMode && selectedMk) {
        // PUT ke Backend
        await fetchWithAuth(`/mata-kuliah/${selectedMk.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setAlertConfig({ visible: true, type: 'success', title: 'Berhasil!', message: 'Mata kuliah berhasil diperbarui di server.' });
      } else {
        // POST ke Backend
        await fetchWithAuth('/mata-kuliah', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setAlertConfig({ visible: true, type: 'success', title: 'Berhasil!', message: 'Mata kuliah baru berhasil ditambah ke server.' });
      }
      await fetchMataKuliah();
    } catch (err) {
      setIsLoading(false);
      console.log("❌ Gagal push ke BE:", err.message);
      setAlertConfig({ 
        visible: true, 
        type: 'error', 
        title: 'Gagal ke Server!', 
        message: 'Rute simpan data tidak ditemukan di backend (404). Silakan hubungi tim BE.' 
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditMode(false);
    setSelectedMk(null);
    setKode(''); setNamaMk(''); setSks(''); setKelas(''); setSemester('1');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => handleOpenDetail(item)}>
      <View style={styles.cardAvatar}>
        <Text style={styles.avatarText}>{item.kode ? item.kode.slice(-2) : 'MK'}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.kode} - {item.title || item.nama}</Text>
        <Text style={styles.cardSubtitle}>
          SKS: {item.sks} • Semester {item.semester} • Kelas {item.kelas}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={DARK_PINK} />
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
          <Text style={styles.headerTitle}>Kelola Mata Kuliah</Text>
          <Text style={styles.headerSubtitle}>Manajemen data induk kurikulum program studi</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SUBMIT_PINK} />
          <Text style={styles.loadingText}>Memuat data dari server...</Text>
        </View>
      ) : (
        <FlatList 
          data={data} 
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContainer} 
          showsVerticalScrollIndicator={false} 
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => { setIsEditMode(false); setModalVisible(true); }} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#212121" />
      </TouchableOpacity>

      {/* MODAL DETAIL */}
      <Modal visible={detailModalVisible} animationType="fade" transparent onRequestClose={() => setDetailModalVisible(false)}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setDetailModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.detailBox}>
              {selectedMk && (
                <>
                  <View style={styles.detailHeaderWrap}>
                    <View style={[styles.detailBadgeKode, { backgroundColor: THEME_PINK }]}>
                      <Text style={styles.detailBadgeText}>{selectedMk.kode}</Text>
                    </View>
                    <Text style={styles.detailTitle}>{selectedMk.title || selectedMk.nama}</Text>
                  </View>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailInfoRow}>
                    <Text style={styles.detailInfoLabel}>Bobot SKS :</Text>
                    <Text style={styles.detailInfoValue}>{selectedMk.sks} SKS</Text>
                  </View>
                  <View style={styles.detailInfoRow}>
                    <Text style={styles.detailInfoLabel}>Kelas :</Text>
                    <Text style={styles.detailInfoValue}>Kelas {selectedMk.kelas}</Text>
                  </View>
                  <View style={styles.detailInfoRow}>
                    <Text style={styles.detailInfoLabel}>Semester :</Text>
                    <Text style={styles.detailInfoValue}>Semester {selectedMk.semester}</Text>
                  </View>
                  <TouchableOpacity style={styles.btnEditKecil} onPress={handleEditTrigger}>
                    <Text style={styles.btnEditTextKecil}> Edit </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* MODAL FORM TAMBAH/EDIT */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContentLucu}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitleLucu}>{isEditMode ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="pricetag-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Kode MK (Contoh: SI-102) *" value={kode} onChangeText={setKode} placeholderTextColor="#94A3B8" />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="book-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Nama Mata Kuliah *" value={namaMk} onChangeText={setNamaMk} placeholderTextColor="#94A3B8" />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="bar-chart-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Bobot SKS (Angka) *" value={sks} onChangeText={setSks} keyboardType="numeric" placeholderTextColor="#94A3B8" />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Kelas (Contoh: A, B, atau C) *" value={kelas} onChangeText={setKelas} placeholderTextColor="#94A3B8" autoCapitalize="characters" />
              </View>

              <TouchableOpacity style={styles.inputContainer} onPress={() => setSemesterModalVisible(true)} activeOpacity={0.8}>
                <Ionicons name="calendar-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
                <Text style={[styles.inputLucu, { paddingVertical: 18, color: semester ? '#212121' : '#94A3B8' }]}>
                  {semester ? `Pilihan Semester: Semester ${semester}` : 'Pilih Semester *'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={DARK_PINK} />
              </TouchableOpacity>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.btnCancelFit} onPress={closeModal}>
                  <Text style={styles.btnCancelTextFit}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSubmitFit} onPress={handleSave}>
                  <Text style={styles.btnSubmitTextFit}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* MODAL SEMESTER */}
      <Modal visible={semesterModalVisible} animationType="fade" transparent onRequestClose={() => setSemesterModalVisible(false)}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setSemesterModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.selectionBox}>
              <Text style={styles.selectionTitle}>Pilih Semester Akademik</Text>
              <View style={styles.detailDivider} />
              <FlatList
                data={SEMESTER_OPTIONS}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.selectionOption, semester === item && { backgroundColor: '#fcf3f3' }]} 
                    onPress={() => { setSemester(item); setSemesterModalVisible(false); }}
                  >
                    <Text style={[styles.selectionOptionText, semester === item && { fontFamily: 'Urbanist-Bold', color: SUBMIT_PINK }]}>
                      Semester {item}
                    </Text>
                    {semester === item && <Ionicons name="checkmark-circle" size={18} color={SUBMIT_PINK} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* ALERT NOTIFIKASI */}
      <Modal visible={alertConfig.visible} transparent animationType="fade" onRequestClose={() => setAlertConfig({ ...alertConfig, visible: false })}>
        <View style={styles.alertOverlay}>
          <View style={[styles.alertBox, { padding: 30, alignItems: 'center' }]}>
            <View style={[styles.alertIconWrap, { backgroundColor: alertConfig.type === 'success' ? '#e0f2f1' : '#ffebee' }]}>
              <Ionicons 
                name={alertConfig.type === 'success' ? "checkmark-circle" : "warning"} 
                size={45} 
                color={alertConfig.type === 'success' ? '#00796b' : '#c62828'} 
              />
            </View>
            <Text style={[styles.alertTitle, { textAlign: 'center' }]}>{alertConfig.title}</Text>
            <Text style={[styles.alertMessage, { textAlign: 'center' }]}>{alertConfig.message}</Text>
            <TouchableOpacity 
              style={[styles.btnAlertOK, { backgroundColor: alertConfig.type === 'success' ? SUBMIT_PINK : '#c62828' }]} 
              onPress={() => setAlertConfig({...alertConfig, visible: false})} 
              activeOpacity={0.8}
            >
              <Text style={styles.btnAlertOKText}>Oke, Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  
  listContainer: { padding: 24, paddingBottom: 100, paddingTop: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  cardAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: THEME_PINK, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121' },
  cardContent: { flex: 1, paddingRight: 8 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: THEME_PINK, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'flex-end' },
  modalContentLucu: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingTop: 15, paddingBottom: 40, elevation: 20 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitleLucu: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: '#212121', textAlign: 'center', marginBottom: 25 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fcf3f3', borderRadius: 18, marginBottom: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#f4d6d6' },
  inputIcon: { marginRight: 10 },
  inputLucu: { flex: 1, paddingVertical: 15, fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121' },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15 },
  btnSubmitFit: { flex: 0.48, backgroundColor: SUBMIT_PINK, borderRadius: 20, paddingVertical: 14, alignItems: 'center', elevation: 3 },
  btnSubmitTextFit: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnCancelFit: { flex: 0.48, backgroundColor: CANCEL_PINK, borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelTextFit: { color: CANCEL_TEXT, fontFamily: 'Urbanist-Bold', fontSize: 15 },

  detailBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 24, width: '85%', alignItems: 'flex-start', elevation: 20 },
  detailHeaderWrap: { alignItems: 'center', width: '100%' },
  detailBadgeKode: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 10 },
  detailBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#212121' },
  detailTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: '#212121', textAlign: 'center', marginBottom: 6 },
  detailDivider: { width: '100%', height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  detailInfoRow: { flexDirection: 'row', width: '100%', marginBottom: 10, paddingHorizontal: 4 },
  detailInfoLabel: { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#64748B', width: 95 },
  detailInfoValue: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#212121', flex: 1 },
  
  btnEditKecil: { backgroundColor: SUBMIT_PINK, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginTop: 15, alignSelf: 'flex-end', elevation: 2 },
  btnEditTextKecil: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 13 },

  selectionBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 24, width: '85%', maxHeight: '60%', elevation: 20 },
  selectionTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: '#212121', textAlign: 'center' },
  selectionOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, marginBottom: 4 },
  selectionOptionText: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121' },

  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '80%', elevation: 20 },
  alertIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10 },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', marginBottom: 25, lineHeight: 22 },
  
  btnAlertOK: { borderRadius: 20, paddingVertical: 14, paddingHorizontal: 30, alignItems: 'center', elevation: 3, alignSelf: 'center' },
  btnAlertOKText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 16 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#64748B', marginTop: 8 }
});