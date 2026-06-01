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
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ IMPORT FUNGSI API TERSENTRALISASI
import { capaianApi, mahasiswaApi } from '../../services/api';

const THEME_PINK = '#f4d6d6'; 
const SUBMIT_PINK = '#b35c5c'; 

const FILTER_OPTIONS = [
  { key: 'ALL', label: 'Semua' },
  { key: 'Excellence', label: 'Excellence' },
  { key: 'Satisfactory', label: 'Satisfactory' },
  { key: 'Competent', label: 'Competent' },
  { key: 'Developing', label: 'Developing' },
  { key: 'Not Competent', label: 'Not Competent' }
];

export default function LaporanCPLScreen({ navigation }) {
  const [masterData, setMasterData] = useState([]); 
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); 
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: '', title: '', message: '' });

  const getDynamicStatus = (nilaiAngka) => {
    const num = Number(nilaiAngka) || 0;
    if (num >= 85) return { label: 'Excellence', color: '#2E7D32', bg: '#e8f5e9' }; 
    if (num >= 70) return { label: 'Satisfactory', color: '#1565C0', bg: '#e3f2fd' }; 
    if (num >= 55) return { color: '#F57F17', bg: '#fff3e0', label: 'Competent' }; 
    if (num >= 40) return { label: 'Developing', color: '#F9A825', bg: '#fffde7' }; 
    return { label: 'Not Competent', color: '#C62828', bg: '#ffebee' }; 
  };

  const fetchLaporanCPL = () => {
    setIsLoading(true);
    
    mahasiswaApi.getAllKelas()
      .then(kelasResult => {
        const daftarKelas = kelasResult?.data && Array.isArray(kelasResult.data) 
          ? kelasResult.data 
          : (Array.isArray(kelasResult) ? kelasResult : []);
        
        if (daftarKelas.length === 0) {
          throw new Error("KELAS_KOSONG");
        }

        // Cari kelas fffffff1 yang ada datanya
        const kelasTarget = daftarKelas.find(k => (k.id === 'fffffff1-ffff-ffff-ffff-fffffffffff1' || k.kelas_id === 'fffffff1-ffff-ffff-ffff-fffffffffff1'));
        
        const targetKelasId = kelasTarget 
          ? (kelasTarget.id || kelasTarget.kelas_id)
          : (daftarKelas[0].id || daftarKelas[0].kelas_id);

        return capaianApi.getByKelas(targetKelasId);
      })
      .then(result => {
        let rawData = [];
        if (result && result.data && Array.isArray(result.data)) {
          rawData = result.data;
        } else if (result && Array.isArray(result)) {
          rawData = result;
        } else if (result && result.capaian && Array.isArray(result.capaian)) {
          rawData = result.capaian;
        }

        // ✅ PERBAIKAN TOTAL: Pengaman pembuatan ID unik agar bebas dari undefined
        const normalizedData = rawData.map((item, index) => {
          const nilaiAngka = item.nilai !== undefined 
            ? item.nilai 
            : (item.nilai_capaian !== undefined ? item.nilai_capaian : (item.score || item.capaian || 0));

          // Solusi berlapis: ambil id apa saja yang eksis, gabungkan dengan index sebagai pertahanan terakhir
          const baseId = item.id || item.capaian_id || item.enrollment_id || item.mk_cpl_id || 'row';
          const uniqueId = `${baseId}-${index}-${Math.random().toString(36).substr(2, 4)}`;

          return {
            ...item,
            uniqueKey: uniqueId, // Diperkuat agar dijamin string valid
            nama: item.nama || item.nama_mahasiswa || item.mahasiswa_nama || item.mahasiswa?.nama || 'Mahasiswa',
            nim: item.nim || item.mahasiswa_nim || item.mahasiswa?.nim || '-',
            nilai: Number(nilaiAngka)
          };
        });
        
        setMasterData(normalizedData);
        setData(normalizedData);
      })
      .catch(error => {
        console.error("Gagal mengambil data laporan CPL:", error);
        if (error?.message === "KELAS_KOSONG") {
          Alert.alert("Info", "Belum ada data kelas yang terdaftar.");
        } else {
          const errorMsg = error?.message || error?.toString() || "";
          if (errorMsg.includes('kadaluarsa') || errorMsg.includes('401')) {
            Alert.alert("Sesi Berakhir", "Sesi Anda telah habis. Silakan login kembali.");
          } else {
            Alert.alert("Gagal", "Tidak dapat mengambil data capaian CPL dari server.");
          }
        }
        setMasterData([]);
        setData([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchLaporanCPL();
  }, []);

  useEffect(() => {
    if (activeFilter === 'ALL') {
      setData(masterData);
    } else {
      const filtered = masterData.filter(item => {
        const statusLabel = getDynamicStatus(item.nilai).label;
        return statusLabel.toLowerCase() === activeFilter.toLowerCase();
      });
      setData(filtered);
    }
  }, [activeFilter, masterData]);

  const handleDownload = () => {
    setAlertConfig({ visible: true, type: 'download', title: 'Mengekspor File', message: 'Rekapitulasi CPL Program Studi sedang diunduh ke perangkat Anda.' });
  };

  const renderItem = ({ item }) => {
    const statusStyle = getDynamicStatus(item.nilai);
    return (
      <View style={styles.card}>
        <View style={styles.cardAvatar}>
          <Text style={styles.avatarText}>{item.nama?.charAt(0).toUpperCase() || 'U'}</Text>
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

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.15 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* HEADER PINK MELENGKUNG */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Laporan Capaian CPL</Text>
          <Text style={styles.headerSubtitle}>Capaian CPL Mahasiswa Program Studi</Text>
        </View>
      </View>

      {/* FILTER BUTTONS */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTER_OPTIONS.map(opt => (
            <TouchableOpacity key={opt.key} style={[styles.filterChip, activeFilter === opt.key && styles.filterChipActive]} onPress={() => setActiveFilter(opt.key)}>
              <Text style={[styles.filterChipText, activeFilter === opt.key && styles.filterChipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST DATA */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SUBMIT_PINK} />
          <Text style={styles.loadingText}>Memuat data capaian CPL...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          // ✅ PROTEKSI EXTRA: Jika item atau uniqueKey kosong, langsung lempar ke fallback index string
          keyExtractor={(item, index) => item?.uniqueKey ? item.uniqueKey.toString() : index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Belum ada data capaian CPL atau filter tidak cocok.</Text>
            </View>
          }
        />
      )}

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={handleDownload} activeOpacity={0.8}>
        <Ionicons name="download-outline" size={28} color="#212121" />
      </TouchableOpacity>

      {/* EXPORT POPUP MODAL */}
      <Modal visible={alertConfig.visible} transparent animationType="fade" onRequestClose={() => setAlertConfig({ ...alertConfig, visible: false })}>
        <TouchableWithoutFeedback onPress={() => setAlertConfig({ ...alertConfig, visible: false })}>
          <View style={styles.alertOverlay}>
            <View style={styles.alertBox}>
              <View style={[styles.alertIconWrap, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="checkmark-circle" size={48} color="#2e7d32" />
              </View>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              
              <TouchableOpacity 
                style={styles.btnAlertOK} 
                onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
                activeOpacity={0.8}
              >
                <Text style={styles.btnAlertOKText}>Selesai</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
  filterContainer: { paddingTop: 20, paddingBottom: 5 },
  filterScroll: { paddingHorizontal: 24, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: SUBMIT_PINK, borderColor: SUBMIT_PINK, elevation: 2 },
  filterChipText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B' },
  filterChipTextActive: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontWeight: '800' },
  listContainer: { padding: 24, paddingBottom: 100, paddingTop: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  cardAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: THEME_PINK, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: '#212121' },
  cardContent: { flex: 1, paddingRight: 8 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  statusBadge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, alignItems: 'center', minWidth: 95 },
  statusText: { fontFamily: 'Urbanist-Bold', fontSize: 11 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#64748B', marginTop: 10 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 10 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: THEME_PINK, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '85%', alignItems: 'center', elevation: 20 },
  alertIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  btnAlertOK: { backgroundColor: SUBMIT_PINK, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 35, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', elevation: 3, marginTop: 15 },
  btnAlertOKText: { color: '#FFFFFF', fontFamily: 'Urbanist-Bold', fontSize: 16 }
});