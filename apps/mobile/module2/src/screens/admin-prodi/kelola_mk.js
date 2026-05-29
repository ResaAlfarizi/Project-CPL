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
  Keyboard 
} from 'react-native';
// ❌ Hapus import useNavigation
import { Ionicons } from '@expo/vector-icons';

const THEME_PINK = '#f4d6d6'; 
const DARK_PINK = '#c98a8a'; 
const SUBMIT_PINK = '#b35c5c'; 
const CANCEL_PINK = '#ffebee';
const CANCEL_TEXT = '#c62828'; 

const INITIAL_DATA = [
  { id: '1', kode: 'SI101', title: 'Analisis & Perancangan Sistem', sks: '3', semester: '3', info: 'SKS: 3 • Semester 3' },
  { id: '2', kode: 'SI201', title: 'Manajemen Basis Data Bisnis', sks: '3', semester: '4', info: 'SKS: 3 • Semester 4' },
  { id: '3', kode: 'SI301', title: 'Arsitektur Enterprise untuk Bisnis', sks: '3', semester: '5', info: 'SKS: 3 • Semester 5' },
  { id: '4', kode: 'SI401', title: 'Audit & Keamanan Sistem Informasi', sks: '3', semester: '6', info: 'SKS: 3 • Semester 6' },
];

const SEMESTER_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function KelolaMKScreen({ navigation }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [kode, setKode] = useState('');
  const [namaMk, setNamaMk] = useState('');
  const [sks, setSks] = useState(''); 
  const [semester, setSemester] = useState('1'); 
  const [semesterOpen, setSemesterOpen] = useState(false); 

  // --- STATE UNTUK CUSTOM ALERT ---
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: '', title: '', message: '' });

  const handleAdd = () => {
    // Validasi Data Kosong
    if (!kode || !namaMk || !sks || !semester) {
      setAlertConfig({ 
        visible: true, 
        type: 'error', 
        title: 'Lengkapi Data! 🚨', 
        message: 'Pastikan semua data lengkap sebelum menyimpan Mata Kuliah baru.' 
      });
      return;
    }

    setData([{ 
      id: Date.now().toString(), 
      kode, 
      title: namaMk, 
      sks, 
      semester, 
      info: `SKS: ${sks} • Semester ${semester}` 
    }, ...data]);
    
    closeModal();

    setTimeout(() => {
      setAlertConfig({ 
        visible: true, 
        type: 'success', 
        title: 'Berhasil!', 
        message: 'Data Mata Kuliah berhasil disimpan ke dalam sistem.' 
      });
    }, 300);
  };

  const closeModal = () => {
    setModalVisible(false);
    setKode(''); setNamaMk(''); setSks(''); setSemester('1'); setSemesterOpen(false);
  };

  // ✅ Ikon chevron-forward (>) sudah dihapus dari sini
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardAvatar}>
        <Text style={styles.avatarText}>{item.kode.slice(-2)}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.kode} - {item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.info}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.10 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.header}>
        {/* ✅ Tombol kembali diarahkan ke dashboard */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Mata Kuliah</Text>
          <Text style={styles.headerSubtitle}>Pemetaan Mata Kuliah Program Studi Sistem Informasi</Text>
        </View>
      </View>
      
      <FlatList 
        data={data} 
        keyExtractor={item => item.id} 
        renderItem={renderItem} 
        contentContainerStyle={styles.listContainer} 
        showsVerticalScrollIndicator={false} 
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#212121" />
      </TouchableOpacity>

      {/* MODAL FORM TAMBAH MK */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          
          {/* Background overlay untuk menutup modal form */}
          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); closeModal(); }}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContentLucu}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitleLucu}>Tambah Mata Kuliah</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="barcode-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
              <TextInput style={styles.inputLucu} placeholder="Kode MK (Contoh: SI303)" placeholderTextColor="#94A3B8" value={kode} onChangeText={setKode} />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="book-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
              <TextInput style={styles.inputLucu} placeholder="Nama Mata Kuliah" placeholderTextColor="#94A3B8" value={namaMk} onChangeText={setNamaMk} />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="hourglass-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
              <TextInput style={styles.inputLucu} placeholder="SKS (Contoh: 3)" placeholderTextColor="#94A3B8" value={sks} onChangeText={setSks} keyboardType="number-pad" />
            </View>

            {/* TRIGGER DROPDOWN SEMESTER */}
            <View style={{ marginBottom: 12 }}>
              <View style={styles.inputContainerDropdown}>
                <Ionicons name="add-circle-outline" size={20} color={DARK_PINK} style={styles.inputIcon} />
                <TouchableOpacity style={styles.dropdownTrigger} onPress={() => { Keyboard.dismiss(); setSemesterOpen(true); }}>
                  <Text style={styles.dropdownValue}>Semester {semester}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.buttonRow}>
              {/* FIX: Tombol Simetris 50:50 */}
              <TouchableOpacity style={styles.btnCancelFit} onPress={closeModal}>
                <Text style={styles.btnCancelTextFit}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmitFit} onPress={handleAdd}>
                <Text style={styles.btnSubmitTextFit}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* JURUS PAMUNGKAS: POP-UP PICKER SEMESTER */}
          {semesterOpen && (
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerBox}>
                <Text style={styles.pickerTitle}>Pilih Semester</Text>
                
                <FlatList
                  data={SEMESTER_OPTIONS}
                  keyExtractor={(item) => item.toString()}
                  showsVerticalScrollIndicator={true}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.pickerOption} 
                      onPress={() => { setSemester(item); setSemesterOpen(false); }}
                    >
                      <Text style={styles.pickerOptionText}>Semester {item}</Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity style={styles.pickerCloseBtnSmall} onPress={() => setSemesterOpen(false)}>
                  <Text style={styles.pickerCloseText}>Batal</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </Modal>

      {/* MODAL CUSTOM ALERT (SUCCESS & ERROR) */}
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
              
              {/* FIX: Tombol Alert Fit Text */}
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
  listContainer: { padding: 24, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  cardAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: THEME_PINK, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: '#212121' },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: THEME_PINK, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'flex-end' },
  modalContentLucu: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    padding: 24, 
    paddingTop: 15,
    paddingBottom: 40,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitleLucu: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: '#212121', textAlign: 'center', marginBottom: 25 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fcf3f3', borderRadius: 18, marginBottom: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#f4d6d6' },
  inputIcon: { marginRight: 10 },
  inputLucu: { flex: 1, paddingVertical: 15, fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121' },
  
  inputContainerDropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fcf3f3', borderRadius: 18, paddingHorizontal: 15, borderWidth: 1, borderColor: '#f4d6d6' },
  dropdownTrigger: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  dropdownValue: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121', flex: 1, marginRight: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15 },
  btnCancelFit: { flex: 0.48, backgroundColor: CANCEL_PINK, borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelTextFit: { color: CANCEL_TEXT, fontFamily: 'Urbanist-Regular', fontSize: 15, fontWeight: '700' },
  btnSubmitFit: { flex: 0.48, backgroundColor: SUBMIT_PINK, borderRadius: 20, paddingVertical: 14, alignItems: 'center', elevation: 3, shadowColor: SUBMIT_PINK, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  btnSubmitTextFit: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },

  // Pop-Up Picker Styles
  pickerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 24 },
  pickerBox: { backgroundColor: '#FFF', width: '100%', borderRadius: 24, maxHeight: '70%', padding: 20, elevation: 10 },
  pickerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: SUBMIT_PINK, textAlign: 'center', marginBottom: 15 },
  pickerOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#fcf3f3' },
  pickerOptionText: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121', textAlign: 'center' },
  pickerCloseBtnSmall: { marginTop: 15, paddingVertical: 10, paddingHorizontal: 30, backgroundColor: CANCEL_PINK, borderRadius: 16, alignSelf: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  pickerCloseText: { color: CANCEL_TEXT, fontFamily: 'Urbanist-Bold', fontSize: 14 },

  // --- STYLE CUSTOM ALERT ---
  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '80%', alignItems: 'center', elevation: 20 },
  alertIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  
  btnAlertOK: { borderRadius: 20, paddingVertical: 14, paddingHorizontal: 30, alignItems: 'center', elevation: 3 },
  btnAlertOKText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 16 }
});