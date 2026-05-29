import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  StatusBar, 
  ImageBackground, 
  TouchableOpacity, 
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME_PINK = '#f4d6d6'; 
const DARK_PINK = '#c98a8a'; 
const SUBMIT_PINK = '#b35c5c'; 

// DUMMY DATA (Hanya berisi Nilai Angka murni. Status akan dihitung otomatis oleh UI)
const INITIAL_DATA = [
  { id: '1', nama: 'Ahmad Fauzi', nim: '220001', nilai: 87.6 },
  { id: '2', nama: 'Dewi Lestari', nim: '220002', nilai: 80.0 },
  { id: '3', nama: 'Rizky Maulana', nim: '220003', nilai: 65.5 },
  { id: '4', nama: 'Budi Santoso', nim: '220004', nilai: 50.0 },
  { id: '5', nama: 'Siti Rahma', nim: '220005', nilai: 35.0 },
];

export default function LaporanCPLScreen({ navigation }) {
  const [data, setData] = useState([]);
  
  const [threshold, setThreshold] = useState(60); 
  const [tempThreshold, setTempThreshold] = useState('60');
  const [settingModalVisible, setSettingModalVisible] = useState(false);
  
  const [sortMode, setSortMode] = useState('NIM'); 
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: '', title: '', message: '' });

  useEffect(() => {
    let sorted = [...INITIAL_DATA];
    if (sortMode === 'Ranking') {
      sorted.sort((a, b) => b.nilai - a.nilai);
    } else {
      sorted.sort((a, b) => a.nim.localeCompare(b.nim));
    }
    setData(sorted);
  }, [sortMode]);

  // ✅ LOGIKA DINAMIS: Status & Warna berubah otomatis tergantung input Threshold Admin!
  const getDynamicStatus = (nilaiAngka) => {
    if (nilaiAngka < threshold) {
      return { label: 'Not Competent', color: '#C62828', bg: '#ffebee' }; // Merah (Gagal)
    } 
    if (nilaiAngka >= threshold + 25) {
      return { label: 'Excellence', color: '#2E7D32', bg: '#e8f5e9' }; // Hijau (Sangat Baik)
    } 
    if (nilaiAngka >= threshold + 10) {
      return { label: 'Satisfactory', color: '#1565C0', bg: '#e3f2fd' }; // Biru (Baik)
    }
    // Jika nilainya pas-pasan (di atas threshold sedikit)
    return { label: 'Competent', color: '#F57F17', bg: '#fff3e0' }; // Oranye (Cukup)
  };

  const handleSaveThreshold = () => {
    const num = parseInt(tempThreshold);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setThreshold(num);
      setSettingModalVisible(false);
      
      setTimeout(() => {
        setAlertConfig({ visible: true, type: 'success', title: 'Standar Diperbarui!', message: 'Batas kelulusan berhasil diubah. Data mahasiswa otomatis disesuaikan.' });
      }, 300);
    } else {
      setAlertConfig({ visible: true, type: 'error', title: 'Input Tidak Valid! 🚨', message: 'Mohon masukkan angka yang benar antara 0 hingga 100.' });
    }
  };

  const handleDownload = () => {
    setAlertConfig({ visible: true, type: 'download', title: 'Mengekspor File', message: 'Rekapitulasi CPL Program Studi sedang diunduh ke perangkat Anda.' });
  };

  const renderItem = ({ item, index }) => {
    // Panggil fungsi dinamis di sini agar merespons setiap perubahan
    const statusStyle = getDynamicStatus(item.nilai);
    const isRankingMode = sortMode === 'Ranking';
    const isFirstPlace = isRankingMode && index === 0;

    return (
      <View style={[styles.card, isFirstPlace && { borderColor: '#FFD700', borderWidth: 2 }]}>
        <View style={[styles.cardAvatar, isFirstPlace && { backgroundColor: '#FFD700' }]}>
          {isRankingMode ? (
             <Text style={[styles.avatarText, isFirstPlace && { color: '#FFF' }]}>#{index + 1}</Text>
          ) : (
             <Text style={styles.avatarText}>{item.nama.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.nama}</Text>
          <Text style={styles.cardSubtitle}>NIM: {item.nim} • Score: <Text style={{fontWeight: '800', color: '#212121'}}>{item.nilai}</Text></Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: statusStyle.color, backgroundColor: statusStyle.bg }]}>
           <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
        </View>
      </View>
    );
  };

  const currentAlertStyle = () => {
    if (alertConfig.type === 'error') return { icon: 'warning', color: '#c62828', bg: '#ffebee' };
    if (alertConfig.type === 'success') return { icon: 'checkmark-circle', color: '#00796b', bg: '#e0f2f1' };
    return { icon: 'cloud-download', color: SUBMIT_PINK, bg: '#fcf3f3' }; 
  };
  const alertStyles = currentAlertStyle();

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.15 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Laporan CPL</Text>
          <Text style={styles.headerSubtitle}>Capaian CPL Mahasiswa Program Studi Sistem Informasi</Text>
        </View>
      </View>

      <View style={styles.thresholdPanel}>
        <View>
          <Text style={styles.thresholdLabel}>Batas Minimal Skor Lulus Program Studi</Text>
          <Text style={styles.thresholdValue}>Minimal Score: {threshold}</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingBtn} 
          onPress={() => { setTempThreshold(threshold.toString()); setSettingModalVisible(true); }}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={20} color="#FFF" />
          <Text style={styles.settingBtnText}>Atur</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {sortMode === 'Ranking' ? 'Peringkat Mahasiswa' : 'Daftar Mahasiswa'}
        </Text>
        
        <View style={styles.sortToggleWrap}>
          <TouchableOpacity 
            style={[styles.sortBtn, sortMode === 'NIM' && styles.sortBtnActive]} 
            onPress={() => setSortMode('NIM')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sortBtnText, sortMode === 'NIM' && styles.sortBtnTextActive]}>Urut NIM</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortBtn, sortMode === 'Ranking' && styles.sortBtnActive]} 
            onPress={() => setSortMode('Ranking')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sortBtnText, sortMode === 'Ranking' && styles.sortBtnTextActive]}>Ranking</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList 
        data={data} 
        keyExtractor={item => item.id} 
        renderItem={renderItem} 
        contentContainerStyle={styles.listContainer} 
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity style={styles.fab} onPress={handleDownload} activeOpacity={0.8}>
        <Ionicons name="document-text" size={24} color="#212121" />
      </TouchableOpacity>

      <Modal visible={settingModalVisible} animationType="slide" transparent onRequestClose={() => setSettingModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSettingModalVisible(false)}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContentLucu}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitleLucu}>Ubah Standar Lulus</Text>
              <Text style={styles.modalDesc}>Atur ulang batas minimal nilai kelulusan CPL untuk program studi ini.</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="stats-chart" size={20} color={DARK_PINK} style={styles.inputIcon} />
                <TextInput 
                  style={styles.inputLucu} 
                  placeholder="Masukkan angka (0-100)" 
                  placeholderTextColor="#94A3B8" 
                  value={tempThreshold} 
                  onChangeText={setTempThreshold}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.btnCancelFit} onPress={() => setSettingModalVisible(false)}>
                  <Text style={styles.btnCancelTextFit}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSubmitFit} onPress={handleSaveThreshold}>
                  <Text style={styles.btnSubmitTextFit}>Simpan Standard</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* MODAL CUSTOM ALERT */}
      <Modal visible={alertConfig.visible} animationType="fade" transparent onRequestClose={() => setAlertConfig({...alertConfig, visible: false})}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setAlertConfig({...alertConfig, visible: false})}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.alertBox}>
              <View style={[styles.alertIconWrap, { backgroundColor: alertStyles.bg }]}>
                <Ionicons name={alertStyles.icon} size={45} color={alertStyles.color} />
              </View>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity style={[styles.btnAlertOK, { backgroundColor: alertStyles.color }]} onPress={() => setAlertConfig({...alertConfig, visible: false})} activeOpacity={0.8}>
                <Text style={styles.btnAlertOKText}>Oke, Mengerti!</Text>
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

  thresholdPanel: {
    marginHorizontal: 24, marginTop: 20, backgroundColor: '#FFF', padding: 16, borderRadius: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: THEME_PINK, elevation: 2,
  },
  thresholdLabel: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', marginBottom: 4 },
  thresholdValue: { fontFamily: 'Urbanist-Bold', fontSize: 15, fontWeight: '800', color: '#212121' },
  settingBtn: { backgroundColor: SUBMIT_PINK, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  settingBtnText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 13, marginLeft: 6 },

  listHeader: { paddingHorizontal: 26, marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', flex: 1 },
  sortToggleWrap: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  sortBtnActive: { backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: {width: 0, height: 1} },
  sortBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#94A3B8' },
  sortBtnTextActive: { color: SUBMIT_PINK, fontWeight: '800' },

  listContainer: { padding: 24, paddingBottom: 100, paddingTop: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cardAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: THEME_PINK, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121' },
  cardContent: { flex: 1, paddingRight: 10 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  statusBadge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, minWidth: 100, alignItems: 'center' },
  statusText: { fontFamily: 'Urbanist-Bold', fontSize: 11},
  
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: THEME_PINK, justifyContent: 'center', alignItems: 'center', elevation: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'flex-end' },
  modalContentLucu: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingTop: 15, paddingBottom: 40, elevation: 20 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitleLucu: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: '#212121', textAlign: 'center', marginBottom: 6 },
  modalDesc: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20, lineHeight: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fcf3f3', borderRadius: 18, marginBottom: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#f4d6d6' },
  inputIcon: { marginRight: 10 },
  inputLucu: { flex: 1, paddingVertical: 15, fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121' },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  btnSubmitFit: { flex: 0.48, backgroundColor: SUBMIT_PINK, borderRadius: 20, paddingVertical: 14, alignItems: 'center', elevation: 3 },
  btnSubmitTextFit: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnCancelFit: { flex: 0.48, backgroundColor: '#ffebee', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelTextFit: { color: '#c62828', fontFamily: 'Urbanist-Bold', fontSize: 15},

  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '85%', alignItems: 'center', elevation: 20 },
  alertIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  btnAlertOK: { borderRadius: 20, paddingVertical: 14, paddingHorizontal: 30, alignItems: 'center', elevation: 3 },
  btnAlertOKText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 16 }
});