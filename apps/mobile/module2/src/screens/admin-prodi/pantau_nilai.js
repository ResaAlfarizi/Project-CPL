import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  StatusBar, 
  ImageBackground, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
// ❌ Hapus import useNavigation
import { Ionicons } from '@expo/vector-icons';

const THEME_COLOR = '#cad4ed'; 
const PRIMARY_BLUE = '#577590';
const INACTIVE_BG = '#f8fafc';

const DUMMY_DATA = [
  { id: '1', nama: 'Ahmad Fauzi', mk: 'Analisis & Perancangan Sistem', subcpmk: 'SCPL-01', nilai: 85 },
  { id: '2', nama: 'Ahmad Fauzi', mk: 'Analisis & Perancangan Sistem', subcpmk: 'SCPL-02', nilai: 90 },
  { id: '3', nama: 'Dewi Lestari', mk: 'Analisis & Perancangan Sistem', subcpmk: 'SCPL-01', nilai: 78 },
  { id: '4', nama: 'Dewi Lestari', mk: 'Analisis & Perancangan Sistem', subcpmk: 'SCPL-03', nilai: 88 },
  { id: '5', nama: 'Budi Santoso', mk: 'Analisis & Perancangan Sistem', subcpmk: 'SCPL-02', nilai: 92 },

  // MK: Manajemen Basis Data Bisnis
  { id: '6', nama: 'Budi Santoso', mk: 'Manajemen Basis Data Bisnis', subcpmk: 'SCPL-01', nilai: 88 },
  { id: '7', nama: 'Budi Santoso', mk: 'Manajemen Basis Data Bisnis', subcpmk: 'SCPL-02', nilai: 95 },
  { id: '8', nama: 'Siti Rahma', mk: 'Manajemen Basis Data Bisnis', subcpmk: 'SCPL-01', nilai: 80 },
  { id: '9', nama: 'Reza Rahadian', mk: 'Manajemen Basis Data Bisnis', subcpmk: 'SCPL-02', nilai: 75 },

  // MK: Arsitektur Enterprise
  { id: '10', nama: 'Siti Rahma', mk: 'Arsitektur Enterprise', subcpmk: 'SCPL-01', nilai: 85 },
  { id: '11', nama: 'Reza Rahadian', mk: 'Arsitektur Enterprise', subcpmk: 'SCPL-01', nilai: 82 },
  { id: '12', nama: 'Putri Marino', mk: 'Arsitektur Enterprise', subcpmk: 'SCPL-02', nilai: 90 },

  // MK: Audit & Keamanan SI
  { id: '13', nama: 'Ahmad Fauzi', mk: 'Audit & Keamanan SI', subcpmk: 'SCPL-01', nilai: 91 },
  { id: '14', nama: 'Dewi Lestari', mk: 'Audit & Keamanan SI', subcpmk: 'SCPL-03', nilai: 87 },
  { id: '15', nama: 'Putri Marino', mk: 'Audit & Keamanan SI', subcpmk: 'SCPL-04', nilai: 89 },
];

export default function PantauNilaiScreen({ navigation }) {
  // State Filter
  const [filterMk, setFilterMk] = useState('Semua');
  const [filterSub, setFilterSub] = useState('Semua');

  // Mengambil daftar unik untuk Pilihan Filter MK
  const mkOptions = ['Semua', ...new Set(DUMMY_DATA.map(item => item.mk))];
  
  // Mengambil daftar unik untuk Pilihan Filter Sub-CPMK (Menyesuaikan MK yang dipilih)
  const subOptions = ['Semua', ...new Set(
    DUMMY_DATA
      .filter(item => filterMk === 'Semua' || item.mk === filterMk)
      .map(item => item.subcpmk)
  )].sort(); // Ditambah sort agar urut dari SCPL-01 sampai 04

  // Logika Filter Data
  const filteredData = DUMMY_DATA.filter(item => {
    const matchMk = filterMk === 'Semua' || item.mk === filterMk;
    const matchSub = filterSub === 'Semua' || item.subcpmk === filterSub;
    return matchMk && matchSub;
  });

  // Fungsi ganti filter MK (otomatis mereset Sub-CPMK)
  const handleSelectMk = (mk) => {
    setFilterMk(mk);
    setFilterSub('Semua');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardAvatar}>
        <Ionicons name="document-text" size={24} color={PRIMARY_BLUE} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.nama} • {item.subcpmk}</Text>
        <Text style={styles.cardSubtitle}>MK: {item.mk}</Text>
      </View>
      <View style={styles.badgeWrap}>
        <Text style={styles.badgeText}>{item.nilai}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground 
      source={require('../../../assets/uinsa2.jpeg')} 
      style={styles.container} 
      imageStyle={{ opacity: 0.15 }} 
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* HEADER */}
      <View style={styles.header}>
        {/* ✅ Tombol kembali diarahkan ke dashboard */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Monitoring Nilai</Text>
          <Text style={styles.headerSubtitle}>Monitoring nilai Mahasiswa Program Studi Sistem Informasi</Text>
        </View>
      </View>

      {/* FILTER SECTION LUCU (CHUBBY PILLS) */}
      <View style={styles.filterSection}>
        
        {/* Filter Mata Kuliah */}
        <View style={styles.filterRow}>
          <Ionicons name="library-outline" size={16} color="#64748B" style={styles.filterIcon} />
          <Text style={styles.filterLabel}>Mata Kuliah</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollWrapper}>
          {mkOptions.map((mk, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.pill, filterMk === mk && styles.pillActive]}
              onPress={() => handleSelectMk(mk)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, filterMk === mk && styles.pillTextActive]}>{mk}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ width: 24 }} />
        </ScrollView>

        {/* Filter Sub-CPMK */}
        <View style={[styles.filterRow, { marginTop: 12 }]}>
          <Ionicons name="pie-chart-outline" size={16} color="#64748B" style={styles.filterIcon} />
          <Text style={styles.filterLabel}>Sub-CPMK</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollWrapper}>
          {subOptions.map((sub, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.pill, filterSub === sub && styles.pillActive]}
              onPress={() => setFilterSub(sub)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, filterSub === sub && styles.pillTextActive]}>{sub}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ width: 24 }} />
        </ScrollView>
      </View>

      {/* LIST DATA */}
      <FlatList 
        data={filteredData} 
        keyExtractor={item => item.id} 
        renderItem={renderItem} 
        contentContainerStyle={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Tidak ada data nilai yang sesuai filter.</Text>
          </View>
        }
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FA' },
  header: { 
    backgroundColor: THEME_COLOR, 
    paddingTop: 50, 
    paddingBottom: 30, 
    paddingHorizontal: 24, 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32, 
    flexDirection: 'row', 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  backBtn: { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
  
  filterSection: {
    paddingTop: 20,
    paddingBottom: 5,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterLabel: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: '#64748B',
  },
  scrollWrapper: {
    paddingLeft: 24,
  },
  pill: {
    backgroundColor: INACTIVE_BG,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20, 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillActive: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
    elevation: 2,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pillText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  pillTextActive: {
    color: '#FFFFFF', 
    fontWeight: '800',
  },

  listContainer: { padding: 24, paddingBottom: 40 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 24, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3
  },
  cardAvatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    backgroundColor: THEME_COLOR, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  badgeWrap: { backgroundColor: PRIMARY_BLUE, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  badgeText: { fontFamily: 'Urbanist-Bold', color: '#FFF', fontSize: 14 },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontFamily: 'Urbanist-Regular',
    marginTop: 10,
    color: '#94A3B8',
    fontSize: 14,
  }
});