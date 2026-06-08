import React, { useState, useEffect } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  StatusBar, 
  ImageBackground, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ Import API & Theme
import { capaianApi, profileApi, mahasiswaApi } from '../../services/api';
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

  // ✅ Helper: Get status berdasarkan nilai
  const getDynamicStatus = (nilaiAngka) => {
    const num = Number(nilaiAngka) || 0;
    if (num >= 85) return { label: 'Excellence', color: '#2E7D32', bg: '#E8F5E9' }; 
    if (num >= 70) return { label: 'Satisfactory', color: '#1565C0', bg: '#E3F2FD' }; 
    if (num >= 55) return { label: 'Competent', color: '#F57F17', bg: '#FFF3E0' }; 
    if (num >= 40) return { label: 'Developing', color: '#F9A825', bg: '#FFFDE7' }; 
    return { label: 'Not Competent', color: '#C62828', bg: '#FFEBEE' }; 
  };

  // ✅ Fetch data capaian CPL mahasiswa
  const fetchLaporanCPL = async () => {
    setIsLoading(true);
    
    try {
      // 1. Get admin profile untuk ambil prodi_id
      const profile = await profileApi.getAdmin();
      const currentProdiId = profile?.data?.prodi_id || profile?.data?.entity_id;
      
      if (!currentProdiId) {
        throw new Error("PRODI_ID_NOT_FOUND");
      }
      
      // 2. Get mahasiswa by prodi
      const mhsResult = await mahasiswaApi.getAll();
      const allMahasiswa = mhsResult?.data || [];
      const mahasiswaList = allMahasiswa.filter(m => 
        String(m.prodi_id) === String(currentProdiId)
      );
      
      if (mahasiswaList.length === 0) {
        Alert.alert("Info", "Tidak ada mahasiswa di program studi ini.");
        setMasterData([]);
        setData([]);
        return;
      }
      
      // 3. Get capaian untuk setiap mahasiswa
      const allCapaian = [];
      
      for (const mhs of mahasiswaList) {
        try {
          const capaianResult = await capaianApi.getByMahasiswaId(mhs.id);
          const capaianMhs = capaianResult?.data || [];
          
          capaianMhs.forEach(c => {
            const nilai = parseFloat(c.rata_rata_nilai || c.nilai_cpl_total || 0);
            
            allCapaian.push({
              mahasiswa_id: mhs.id,
              nim: mhs.nim,
              nama_mahasiswa: mhs.nama,
              cpl_id: c.cpl_id,
              kode_cpl: c.kode_cpl,
              nilai_cpl_total: nilai,
              status_capaian: c.status_capaian || getDynamicStatus(nilai).label,
            });
          });
        } catch (err) {
          console.error(`Error fetching capaian for ${mhs.nim}:`, err);
        }
      }
      
      // 4. Normalize data dengan unique key
      const normalizedData = allCapaian.map((item, index) => ({
        ...item,
        uniqueKey: `${item.mahasiswa_id}-${item.cpl_id}-${index}`,
        nama: item.nama_mahasiswa,
        nim: item.nim,
        nilai: item.nilai_cpl_total,
      }));
      
      setMasterData(normalizedData);
      setData(normalizedData);
      
    } catch (error) {
      console.error("Gagal mengambil data laporan CPL:", error);
      
      if (error?.message === "PRODI_ID_NOT_FOUND") {
        Alert.alert("Error", "Tidak dapat menemukan ID Program Studi Anda.");
      } else if (error?.message?.includes('401') || error?.message?.includes('kadaluarsa')) {
        Alert.alert("Sesi Berakhir", "Sesi Anda telah habis. Silakan login kembali.");
      } else {
        Alert.alert("Gagal", "Tidak dapat mengambil data capaian CPL dari server.");
      }
      
      setMasterData([]);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Effect: Load data saat mount
  useEffect(() => {
    fetchLaporanCPL();
  }, []);

  // ✅ Effect: Filter data berdasarkan status
  useEffect(() => {
    if (activeFilter === 'ALL') {
      setData(masterData);
    } else {
      const filtered = masterData.filter(item => {
        const statusLabel = getDynamicStatus(item.nilai).label;
        return statusLabel === activeFilter;
      });
      setData(filtered);
    }
  }, [activeFilter, masterData]);

  // ✅ Handler: Download/Export
  const handleDownload = () => {
    setAlert({ 
      visible: true, 
      type: 'success', 
      title: 'Mengekspor File', 
      message: 'Rekapitulasi CPL Program Studi sedang diunduh ke perangkat Anda.',
      onConfirm: () => setAlert({ ...alert, visible: false })
    });
  };

  // ✅ Render: Stats summary card
  const renderStatsCard = (icon, value, label) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={BASE.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </View>
  );

  // ✅ Render: List item card
  const renderItem = ({ item }) => {
    const statusStyle = getDynamicStatus(item.nilai);
    const progressWidth = Math.min(item.nilai, 100);
    
    return (
      <View style={styles.card}>
        {/* Avatar */}
        <View style={styles.cardAvatar}>
          <Text style={styles.avatarText}>
            {item.nama?.charAt(0).toUpperCase() || 'M'}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.nama}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            NIM: {item.nim} • <Text style={styles.cplText}>{item.kode_cpl}</Text>
          </Text>
          
          {/* Progress Bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progressWidth}%`,
                    backgroundColor: statusStyle.color
                  }
                ]} 
              />
            </View>
            <Text style={styles.scoreText}>{item.nilai.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[
          styles.statusBadge, 
          { 
            borderColor: statusStyle.color, 
            backgroundColor: statusStyle.bg 
          }
        ]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {statusStyle.label}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('../../../assets/uinsa2.jpeg')} 
      style={styles.container} 
      imageStyle={{ opacity: 0.15 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* ========== HEADER ========== */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Laporan Capaian CPL</Text>
          <Text style={styles.headerSubtitle}>Capaian CPL Mahasiswa Program Studi</Text>
        </View>
      </View>

      {/* ========== FILTER CHIPS ========== */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_OPTIONS.map(opt => (
            <TouchableOpacity 
              key={opt.key} 
              style={[
                styles.filterChip, 
                activeFilter === opt.key && styles.filterChipActive
              ]} 
              onPress={() => setActiveFilter(opt.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterChipText, 
                activeFilter === opt.key && styles.filterChipTextActive
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ========== STATS SUMMARY ========== */}
      {!isLoading && masterData.length > 0 && (
        <View style={styles.statsContainer}>
          {renderStatsCard(
            'document-text-outline', 
            masterData.length, 
            'Total Data'
          )}
          {renderStatsCard(
            'people-outline', 
            new Set(masterData.map(c => c.mahasiswa_id)).size, 
            'Mhs'
          )}
          {renderStatsCard(
            'school-outline', 
            new Set(masterData.map(c => c.cpl_id)).size, 
            'CPL Unik'
          )}
          {renderStatsCard(
            'trending-up-outline', 
            `${(masterData.reduce((sum, c) => sum + c.nilai, 0) / masterData.length).toFixed(1)}%`, 
            'Rata-rata'
          )}
        </View>
      )}

      {/* ========== DATA LIST ========== */}
      {isLoading ? (
        <LoadingState message="Memuat data capaian CPL..." color={BASE.primary} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item?.uniqueKey || index.toString()}
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

      {/* ========== FLOATING ACTION BUTTON ========== */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleDownload} 
        activeOpacity={0.8}
      >
        <Ionicons name="download-outline" size={28} color="#212121" />
      </TouchableOpacity>

      {/* ========== CUSTOM ALERT ========== */}
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
  // ========== Container ==========
  container: { 
    flex: 1, 
    backgroundColor: BASE.background 
  },

  // ========== Header ==========
  header: { 
    backgroundColor: THEME.primary, 
    paddingTop: 50, 
    paddingBottom: 30, 
    paddingHorizontal: 24, 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32, 
    flexDirection: 'row', 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backBtn: { 
    padding: 8, 
    marginRight: 12 
  },
  headerTextWrap: { 
    flex: 1 
  },
  headerTitle: { 
    fontFamily: 'Urbanist-Bold', 
    fontSize: 22, 
    color: BASE.textMain, 
    marginBottom: 4 
  },
  headerSubtitle: { 
    fontFamily: 'Urbanist-Regular', 
    fontSize: 13, 
    color: BASE.textMuted 
  },

  // ========== Filter Chips ==========
  filterContainer: { 
    paddingTop: 20, 
    paddingBottom: 10 
  },
  filterScroll: { 
    paddingHorizontal: 24, 
    gap: 8 
  },
  filterChip: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    backgroundColor: BASE.surface, 
    borderWidth: 1, 
    borderColor: BASE.border 
  },
  filterChipActive: { 
    backgroundColor: BASE.primary, 
    borderColor: BASE.primary, 
    elevation: 2 
  },
  filterChipText: { 
    fontFamily: 'Urbanist-Medium', 
    fontSize: 13, 
    color: BASE.textMuted 
  },
  filterChipTextActive: { 
    color: BASE.surface, 
    fontFamily: 'Urbanist-Bold', 
    fontWeight: '800' 
  },

  // ========== Stats Cards ==========
  statsContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    gap: 8,
    flexWrap: 'wrap',
  },
  statCard: { 
    flex: 1, 
    minWidth: 80,
    backgroundColor: BASE.surface, 
    borderRadius: 16, 
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1, 
    borderColor: BASE.border, 
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    minHeight: 95,
  },
  statValue: { 
    fontFamily: 'Urbanist-Bold', 
    fontSize: 22, 
    color: BASE.textMain, 
    marginTop: 6,
    marginBottom: 4,
  },
  statLabel: { 
    fontFamily: 'Urbanist-Regular', 
    fontSize: 9.5, 
    color: BASE.textMuted, 
    textAlign: 'center',
    lineHeight: 12,
    paddingHorizontal: 4,
  },

  // ========== List ==========
  listContainer: { 
    padding: 24, 
    paddingBottom: 100, 
    paddingTop: 12 
  },

  // ========== Card Item ==========
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: BASE.surface, 
    borderRadius: 24, 
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: BASE.border, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardAvatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    backgroundColor: THEME.secondary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 14 
  },
  avatarText: { 
    fontFamily: 'Urbanist-Bold', 
    fontSize: 20, 
    color: BASE.textMain 
  },

  // ========== Card Content ==========
  cardContent: { 
    flex: 1, 
    paddingRight: 8 
  },
  cardTitle: { 
    fontFamily: 'Urbanist-Bold', 
    fontSize: 16, 
    color: BASE.textMain, 
    marginBottom: 4 
  },
  cardSubtitle: { 
    fontFamily: 'Urbanist-Regular', 
    fontSize: 12, 
    color: BASE.textMuted, 
    marginBottom: 8 
  },
  cplText: {
    fontFamily: 'Urbanist-Bold', 
    color: BASE.primary,
  },

  // ========== Progress Bar ==========
  progressWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  progressBar: { 
    flex: 1, 
    height: 8, 
    backgroundColor: BASE.border, 
    borderRadius: 4, 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 4 
  },
  scoreText: { 
    fontFamily: 'Urbanist-Bold', 
    fontSize: 12, 
    color: BASE.textMain, 
    minWidth: 50, 
    textAlign: 'right' 
  },

  // ========== Status Badge ==========
  statusBadge: { 
    borderWidth: 1, 
    paddingHorizontal: 10, 
    paddingVertical: 8, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    minWidth: 100,
    maxWidth: 100,
  },
  statusText: { 
    fontFamily: 'Urbanist-Bold', 
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },

  // ========== FAB ==========
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
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
});