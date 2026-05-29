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

const THEME_COLOR = '#cad4ed'; 
const PRIMARY_BLUE = '#577590';

const INITIAL_DATA = [
  { id: '1', kode: 'CPL-01', prodi: 'Sistem Informasi', desc: 'Mampu menganalisis kebutuhan sistem bisnis dan IT' },
  { id: '2', kode: 'CPL-02', prodi: 'Sistem Informasi', desc: 'Mampu mengelola dan memodelkan data bisnis organisasi' },
  { id: '3', kode: 'CPL-03', prodi: 'Sistem Informasi', desc: 'Mampu merancang tata kelola teknologi informasi' },
  { id: '4', kode: 'CPL-04', prodi: 'Sistem Informasi', desc: 'Mampu memanajemen proyek pengembangan perangkat lunak' },
];

export default function KelolaCPLScreen({ navigation }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedCpl, setSelectedCpl] = useState(null);
  
  const [kode, setKode] = useState('');
  const [prodi, setProdi] = useState('Sistem Informasi'); 
  const [desc, setDesc] = useState('');

  // --- STATE UNTUK CUSTOM ALERT ---
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: '', title: '', message: '' });

  const handleAdd = () => {
    // Validasi Data Kosong
    if (!kode || !prodi || !desc) {
      setAlertConfig({ 
        visible: true, 
        type: 'error', 
        title: 'Lengkapi Data! 🚨', 
        message: 'Pastikan semua data lengkap sebelum menyimpan CPL baru.' 
      });
      return;
    }

    const newData = { 
      id: Date.now().toString(), 
      kode, 
      prodi, 
      desc 
    };
    setData([newData, ...data]);
    
    closeModal();

    setTimeout(() => {
      setAlertConfig({ 
        visible: true, 
        type: 'success', 
        title: 'Berhasil!', 
        message: 'Data CPL baru berhasil disimpan ke dalam sistem.' 
      });
    }, 300);
  };

  const closeModal = () => {
    setModalVisible(false);
    setKode(''); 
    setProdi('Sistem Informasi'); 
    setDesc('');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={() => {
        setSelectedCpl(item);
        setDetailVisible(true);
      }}
    >
      <View style={styles.cardAvatar}>
        <Text style={styles.avatarText}>SI</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.kode}</Text>
        
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {item.prodi} • {item.desc}
        </Text>
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
          <Text style={styles.headerTitle}>Program Studi & CPL</Text>
          <Text style={styles.headerSubtitle}>Kelola Matriks Capaian Program Studi Sistem Informasi</Text>
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

      {/* MODAL FORM TAMBAH CPL */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContentLucu}>
              <View style={styles.modalHandle} />
              
              <Text style={styles.modalTitleLucu}>Tambah CPL Baru</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="barcode-outline" size={20} color={PRIMARY_BLUE} style={styles.inputIcon} />
                <TextInput 
                  style={styles.inputLucu} 
                  placeholder="Kode CPL (Contoh: CPL-05)" 
                  placeholderTextColor="#94A3B8" 
                  value={kode} 
                  onChangeText={setKode} 
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="school-outline" size={20} color={PRIMARY_BLUE} style={styles.inputIcon} />
                <TextInput 
                  style={[styles.inputLucu, { color: '#64748B' }]}
                  placeholderTextColor="#94A3B8" 
                  value={prodi} 
                  onChangeText={setProdi}
                  editable={false} 
                />
              </View>
              
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons name="create-outline" size={20} color={PRIMARY_BLUE} style={[styles.inputIcon, {marginTop: 15}]} />
                <TextInput 
                  style={[styles.inputLucu, styles.textAreaLucu]} 
                  placeholder="Deskripsi CPL" 
                  placeholderTextColor="#94A3B8" 
                  value={desc} 
                  onChangeText={setDesc} 
                  multiline 
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.btnCancelFit} onPress={closeModal}>
                  <Text style={styles.btnCancelTextFit}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnSubmitFit} onPress={handleAdd}>
                  <Text style={styles.btnSubmitTextFit}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* MODAL CUSTOM ALERT (SUCCESS & ERROR) */}
      <Modal visible={alertConfig.visible} animationType="fade" transparent onRequestClose={() => setAlertConfig({...alertConfig, visible: false})}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setAlertConfig({...alertConfig, visible: false})}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.alertBox}>
              
              {/* Ikon Berubah Sesuai Tipe Alert */}
              <View style={[styles.alertIconWrap, { backgroundColor: alertConfig.type === 'success' ? '#e0f2f1' : '#ffebee' }]}>
                <Ionicons 
                  name={alertConfig.type === 'success' ? "checkmark-circle" : "warning"} 
                  size={45} 
                  color={alertConfig.type === 'success' ? '#00796b' : '#c62828'} 
                />
              </View>

              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              
              {/* Tombol Alert Fit Text */}
              <TouchableOpacity 
                style={[styles.btnAlertOK, { backgroundColor: alertConfig.type === 'success' ? PRIMARY_BLUE : '#c62828' }]} 
                onPress={() => setAlertConfig({...alertConfig, visible: false})} 
                activeOpacity={0.8}
              >
                <Text style={styles.btnAlertOKText}>Oke, Mengerti</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* --- MODAL POP-UP DETAIL CPL --- */}
      <Modal visible={detailVisible} animationType="fade" transparent onRequestClose={() => setDetailVisible(false)}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setDetailVisible(false)}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.alertBox, { alignItems: 'flex-start', padding: 24, width: '85%' }]}>
              
              {selectedCpl && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <View style={[styles.cardAvatar, { marginRight: 15 }]}>
                      <Text style={styles.avatarText}>SI</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{selectedCpl.kode}</Text>
                      <Text style={{ fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B' }}>
                        Program Studi {selectedCpl.prodi}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={{ fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#212121', marginBottom: 8 }}>
                    Deskripsi CPL:
                  </Text>
                  <Text style={{ fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#64748B', lineHeight: 22, marginBottom: 25 }}>
                    {selectedCpl.desc}
                  </Text>

                  <TouchableOpacity 
                    style={[styles.btnSubmitFit, { width: '100%', backgroundColor: PRIMARY_BLUE }]} 
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FA' },
  header: { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', alignItems: 'flex-start', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  backBtn: { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
  listContainer: { padding: 24, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3 },
  cardAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: '#212121' },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', lineHeight: 18, paddingRight: 10 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'flex-end' },
  modalContentLucu: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingTop: 15, paddingBottom: 40, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.15, shadowRadius: 10 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitleLucu: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_BLUE, textAlign: 'center', marginBottom: 25 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 18, marginBottom: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  textAreaContainer: { alignItems: 'flex-start' },
  inputIcon: { marginRight: 10 },
  inputLucu: { flex: 1, paddingVertical: 15, fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121' },
  textAreaLucu: { height: 100, textAlignVertical: 'top', paddingTop: 15 },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15 },
  btnCancelFit: { flex: 0.48, backgroundColor: '#ffebee', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelTextFit: { color: '#c62828', fontFamily: 'Urbanist-Regular', fontSize: 15, fontWeight: '700' },
  btnSubmitFit: { flex: 0.48, backgroundColor: PRIMARY_BLUE, borderRadius: 20, paddingVertical: 14, alignItems: 'center', elevation: 3, shadowColor: PRIMARY_BLUE, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  btnSubmitTextFit: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },

  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '80%', alignItems: 'center', elevation: 20 },
  alertIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  
  btnAlertOK: { borderRadius: 20, paddingVertical: 14, paddingHorizontal: 30, alignItems: 'center', elevation: 3 },
  btnAlertOKText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 16 }
});