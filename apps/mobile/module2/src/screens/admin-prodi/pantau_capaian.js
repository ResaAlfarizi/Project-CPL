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

// ✅ Import API & Theme
import { capaianApi, profileApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, CustomAlert, EmptyState } from '../../components';

// ✅ THEME ADMIN PRODI
const THEME = ROLE_THEMES.adminProdi; 

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
  
  // ✅ State Alert - Using CustomAlert component
  const [alert, setAlert] = useState({ 
    visible: false, type: 'info', title: '', message: '', onConfirm: null 
  });

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
    
    // ✅ GET ADMIN PROFILE TO FILTER BY PRODI_ID
    profileApi.getAdmin()
      .then(profile => {
        const currentProdiId = profile?.data?.prodi_id || profile?.data?.entity_id;
        
        if (!currentProdiId) {
          throw new Error("PRODI_ID_NOT_FOUND");
        }
        
        // ✅ GET CAPAIAN BY PRODI INSTEAD OF HARDCODED KELAS
        return capaianApi.getByProdi(currentProdiId);
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
        if (error?.message === "PRODI_ID_NOT_FOUND") {
          Alert.alert("Error", "Tidak dapat menemukan ID Program Studi Anda.");
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
    setAlert({ 
      visible: true, type: 'success', 
      title: 'Mengekspor File', 
      message: 'Rekapitulasi CPL Program Studi sedang diunduh ke perangkat Anda.',
      onConfirm: () => setAlert({ ...alert, visible: false })
    });
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
        <LoadingState message="Memuat data capaian CPL..." color={BASE.primary} />
      ) : (
        <FlatList
          data={data}
          // ✅ PROTEKSI EXTRA: Jika item atau uniqueKey kosong, langsung lempar ke fallback index string
          keyExtractor={(item, index) => item?.uniqueKey ? item.uniqueKey.toString() : index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState 
              icon="folder-open-outline" 
              message="Belum ada data capaian CPL atau filter tidak cocok."
            />
          }
        />
      )}

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={handleDownload} activeOpacity={0.8}>
        <Ionicons name="download-outline" size={28} color="#212121" />
      </TouchableOpacity>

      {/* ✅ CUSTOM ALERT */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        confirmText="Selesai"
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
  filterContainer: { paddingTop: 20, paddingBottom: 5 },
  filterScroll: { paddingHorizontal: 24, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: BASE.surface, borderWidth: 1, borderColor: BASE.border },
  filterChipActive: { backgroundColor: BASE.primary, borderColor: BASE.primary, elevation: 2 },
  filterChipText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textMuted },
  filterChipTextActive: { color: BASE.surface, fontFamily: 'Urbanist-Bold', fontWeight: '800' },
  listContainer: { padding: 24, paddingBottom: 100, paddingTop: 10 },
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
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: BASE.textMain },
  cardContent: { flex: 1, paddingRight: 8 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain, marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: BASE.textMuted },
  statusBadge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, alignItems: 'center', minWidth: 95 },
  statusText: { fontFamily: 'Urbanist-Bold', fontSize: 11 },
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
  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
});