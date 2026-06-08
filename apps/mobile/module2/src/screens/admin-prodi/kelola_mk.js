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

// ✅ Import API & Theme
import { mkApi, profileApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, CustomAlert, EmptyState, PickerModal } from '../../components';

// ✅ THEME ADMIN PRODI
const THEME = ROLE_THEMES.adminProdi; 

const SEMESTER_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function KelolaMKScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ State untuk Admin Prodi
  const [adminProdiId, setAdminProdiId] = useState(null);

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

  // ✅ State Alert - Using CustomAlert component
  const [alert, setAlert] = useState({ 
    visible: false, type: 'info', title: '', message: '', onConfirm: null 
  });
  
  // State for Picker Modal
  const [semesterPickerVisible, setSemesterPickerVisible] = useState(false);

  // ✅ FETCH DATA DENGAN FILTER PRODI_ID (HANYA MK PRODI ADMIN INI)
  const fetchMataKuliah = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil profil admin untuk dapat prodi_id
      let currentProdiId = adminProdiId;
      if (!currentProdiId) {
        const profile = await profileApi.getAdmin();
        currentProdiId = profile?.data?.prodi_id || profile?.prodi_id || profile?.data?.entity_id;
        setAdminProdiId(currentProdiId);
      }
      
      // 2. Ambil SEMUA mata kuliah dari backend (akan difilter di frontend)
      const res = await mkApi.getAll();
      const allMK = res?.data || res || [];
      
      // 3. Filter hanya mata kuliah milik prodi admin ini
      const filteredMK = allMK.filter(mk => {
        const mkProdiId = mk.prodi_id || mk.prodiId;
        return String(mkProdiId) === String(currentProdiId);
      });
      
      // 4. Normalisasi data untuk consistency
      const normalized = filteredMK.map(mk => ({
        id: mk.id,
        kode: mk.kode_mk || mk.kode,
        title: mk.nama_mk || mk.nama || mk.title,
        nama: mk.nama_mk || mk.nama || mk.title,
        sks: mk.sks || 0,
        semester: mk.semester || 0,
        kelas: mk.kelas || '-',
        prodi_id: mk.prodi_id || mk.prodiId
      }));
      
      setData(normalized);
    } catch (error) {
      console.error("❌ Error fetching mata kuliah:", error.message);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Gagal Memuat Data',
        message: 'Tidak dapat mengambil data mata kuliah dari server.',
        onConfirm: () => setAlert({ ...alert, visible: false })
      });
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

  // 💾 PROSES SIMPAN DATA KE BE (DENGAN PRODI_ID)
  const handleSave = async () => {
    if (!kode || !namaMk || !sks || !kelas || !semester) {
      setAlert({ 
        visible: true, 
        type: 'error', 
        title: 'Lengkapi Data!', 
        message: 'Pastikan semua field telah terisi sebelum menyimpan.',
        onConfirm: () => setAlert({ ...alert, visible: false })
      });
      return;
    }

    if (!adminProdiId) {
      setAlert({ 
        visible: true, 
        type: 'error', 
        title: 'Error Sistem!', 
        message: 'Prodi ID tidak ditemukan. Silakan logout dan login kembali.',
        onConfirm: () => setAlert({ ...alert, visible: false })
      });
      return;
    }

    const payload = {
      prodi_id: adminProdiId, // ✅ TAMBAHKAN PRODI_ID
      kode_mk: kode.toUpperCase(),
      nama_mk: namaMk,
      sks: parseInt(sks, 10),
      semester: parseInt(semester, 10)
      // Catatan: kelas tidak disimpan di tabel mata_kuliah (ada di tabel kelas)
    };

    setIsLoading(true);
    closeModal();

    try {
      if (isEditMode && selectedMk) {
        await mkApi.update(selectedMk.id, payload);
        setAlert({ 
          visible: true, 
          type: 'success', 
          title: 'Berhasil!', 
          message: `Mata kuliah "${kode}" berhasil diperbarui.`,
          onConfirm: () => setAlert({ ...alert, visible: false })
        });
      } else {
        await mkApi.create(payload);
        setAlert({ 
          visible: true, 
          type: 'success', 
          title: 'Berhasil!', 
          message: `Mata kuliah "${kode}" berhasil ditambahkan.`,
          onConfirm: () => setAlert({ ...alert, visible: false })
        });
      }
      await fetchMataKuliah(); // Refresh data
    } catch (err) {
      setIsLoading(false);
      console.error("❌ Gagal menyimpan:", err.message);
      setAlert({ 
        visible: true, 
        type: 'error', 
        title: 'Gagal Menyimpan!', 
        message: err.message || 'Terjadi kesalahan saat menyimpan data ke server.',
        onConfirm: () => setAlert({ ...alert, visible: false })
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditMode(false);
    setSelectedMk(null);
    setKode(''); setNamaMk(''); setSks(''); setKelas(''); setSemester('1');
    setSemesterPickerVisible(false);
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
      <Ionicons name="chevron-forward" size={18} color={BASE.textMuted} />
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
        <LoadingState message="Memuat data dari server..." color={BASE.primary} />
      ) : (
        <FlatList 
          data={data} 
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContainer} 
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState 
              icon="folder-open-outline" 
              message="Belum ada data mata kuliah."
            />
          }
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
                    <View style={[styles.detailBadgeKode, { backgroundColor: THEME.secondary }]}>
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
                    <Text style={styles.btnEditTextKecil}>Edit</Text>
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
                <Ionicons name="pricetag-outline" size={20} color={BASE.primary} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Kode MK (Contoh: SI-102) *" value={kode} onChangeText={setKode} placeholderTextColor={BASE.textMuted} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="book-outline" size={20} color={BASE.primary} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Nama Mata Kuliah *" value={namaMk} onChangeText={setNamaMk} placeholderTextColor={BASE.textMuted} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="bar-chart-outline" size={20} color={BASE.primary} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Bobot SKS (Angka) *" value={sks} onChangeText={setSks} keyboardType="numeric" placeholderTextColor={BASE.textMuted} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color={BASE.primary} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Kelas (Contoh: A, B, atau C) *" value={kelas} onChangeText={setKelas} placeholderTextColor={BASE.textMuted} autoCapitalize="characters" />
              </View>

              <TouchableOpacity style={styles.inputContainer} onPress={() => setSemesterPickerVisible(true)} activeOpacity={0.8}>
                <Ionicons name="calendar-outline" size={20} color={BASE.primary} style={styles.inputIcon} />
                <Text style={[styles.inputLucu, { paddingVertical: 18, color: semester ? BASE.textMain : BASE.textMuted }]}>
                  {semester ? `Pilihan Semester: Semester ${semester}` : 'Pilih Semester *'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={BASE.textMuted} />
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

      {/* ✅ PICKER MODAL - SEMESTER */}
      <PickerModal
        visible={semesterPickerVisible}
        title="Pilih Semester Akademik"
        data={SEMESTER_OPTIONS.map(sem => ({
          id: sem,
          label: `Semester ${sem}`
        }))}
        selectedId={semester}
        onSelect={(item) => {
          setSemester(item.id);
          setSemesterPickerVisible(false);
        }}
        onClose={() => setSemesterPickerVisible(false)}
      />

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
  
  listContainer: { padding: 24, paddingBottom: 100, paddingTop: 20 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: BASE.surface, 
    borderRadius: 24, 
    padding: 16, 
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
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain },
  cardContent: { flex: 1, paddingRight: 8 },
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
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15 },
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

  detailBox: { 
    backgroundColor: BASE.surface, 
    borderRadius: 35, 
    padding: 24, 
    width: '85%', 
    alignItems: 'flex-start', 
    elevation: 20 
  },
  detailHeaderWrap: { alignItems: 'center', width: '100%' },
  detailBadgeKode: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 10 },
  detailBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: BASE.textMain },
  detailTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: BASE.textMain, textAlign: 'center', marginBottom: 6 },
  detailDivider: { width: '100%', height: 1, backgroundColor: BASE.border, marginVertical: 16 },
  detailInfoRow: { flexDirection: 'row', width: '100%', marginBottom: 10, paddingHorizontal: 4 },
  detailInfoLabel: { fontFamily: 'Urbanist-Medium', fontSize: 14, color: BASE.textMuted, width: 95 },
  detailInfoValue: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: BASE.textMain, flex: 1 },
  
  btnEditKecil: { 
    backgroundColor: BASE.primary, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 15, 
    alignSelf: 'flex-end', 
    elevation: 2 
  },
  btnEditTextKecil: { color: BASE.surface, fontFamily: 'Urbanist-Bold', fontSize: 13 },

  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
});