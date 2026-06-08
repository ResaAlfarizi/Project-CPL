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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ Import API & Theme
import { nilaiApi, profileApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, EmptyState } from '../../components';

// ✅ THEME ADMIN PRODI
const THEME = ROLE_THEMES.adminProdi;
const PRIMARY_BLUE = BASE.primaryLight;

export default function PantauNilaiScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminProdiId, setAdminProdiId] = useState(null);
  const [adminKodeProdi, setAdminKodeProdi] = useState(null); // ✅ Tambah state kode_prodi

  // State Filter
  const [filterMk, setFilterMk] = useState('Semua');
  const [filterSub, setFilterSub] = useState('Semua');

  // 🛠️ Fungsi Helper untuk Merapikan Tanggal super panjang dari PostgreSQL (input_at)
  const formatTanggal = (rawDate) => {
    if (!rawDate || rawDate === '-') return '-';
    try {
      const d = new Date(rawDate);
      // Jika format tanggal bawaan javascript tidak valid, kembalikan teks aslinya
      if (isNaN(d.getTime())) return rawDate; 
      
      const tgl = String(d.getDate()).padStart(2, '0');
      const bln = String(d.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari angka 0
      const thn = d.getFullYear();
      
      return `${tgl}-${bln}-${thn}`; // Hasil tampilan di aplikasi: 30-05-2026
    } catch (error) {
      return rawDate;
    }
  };

  // ✅ Fungsi menarik data nilai mahasiswa DENGAN FILTER PRODI_ID
  const fetchNilaiMahasiswa = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil profil admin untuk dapat prodi_id dan kode_prodi
      let currentProdiId = adminProdiId;
      let currentKodeProdi = adminKodeProdi;
      
      if (!currentProdiId || !currentKodeProdi) {
        const profile = await profileApi.getAdmin();
        currentProdiId = profile?.data?.prodi_id || profile?.prodi_id || profile?.data?.entity_id;
        currentKodeProdi = profile?.data?.kode_prodi || profile?.kode_prodi;
        
        setAdminProdiId(currentProdiId);
        setAdminKodeProdi(currentKodeProdi);
        
        console.log('Admin Profile:', { currentProdiId, currentKodeProdi });
      }
      
      // 2. Ambil data nilai dari backend (backend sudah auto-filter by prodi untuk Admin Prodi)
      const result = await nilaiApi.getAll();
      const fetchedData = result && result.data && Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
      
      console.log('Fetched Data Sample:', fetchedData[0]); // Debug
      
      // 3. 🌟 NORMALISASI DATA: Memetakan kolom database agar sesuai radar UI aplikasi
      const normalizedData = fetchedData.map(item => {
        const tanggalMentah = item.input_at || item.created_at || item.tanggal_input || item.tanggal || '-';
        
        // Ambil kode_mk dari data
        const kodeMk = item.kode_mk || '';

        return {
          ...item,
          id: item.id || item.nilai_id || Math.random().toString(),
          nama: item.nama || item.nama_mahasiswa || item.mahasiswa_nama || 'Mahasiswa',
          nim: item.nim || item.mahasiswa_nim || '-',
          nilai: item.nilai !== undefined ? item.nilai : (item.score || 0),
          
          // Penyelaras database mata kuliah
          kode_mk: kodeMk,
          mk: item.nama_mk || item.mk || item.mata_kuliah || item.matakuliah || 'Mata Kuliah',
          
          // Penyelaras database sub-cpmk (kode_sub_cpmk)
          subcpmk: item.kode_sub_cpmk || item.subcpmk || item.kode_subcpmk || item.sub_cpmk || item.kode || '-',
          
          // Tanggal
          tanggal_input: formatTanggal(tanggalMentah)
        };
      });

      // 4. ✅ FILTER TAMBAHAN: Pastikan hanya mata kuliah dengan kode sesuai prodi
      // Contoh: Admin IF hanya lihat kode_mk yang dimulai dengan "IF"
      const filteredByKodeProdi = currentKodeProdi 
        ? normalizedData.filter(item => {
            const kodeMk = item.kode_mk || '';
            return kodeMk.toUpperCase().startsWith(currentKodeProdi.toUpperCase());
          })
        : normalizedData;

      console.log('Filtered Data Count:', filteredByKodeProdi.length, 'dari', normalizedData.length);
      setData(filteredByKodeProdi);
    } catch (error) {
      console.error("Gagal menarik data nilai:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNilaiMahasiswa();
  }, []);

  // Pilihan Filter MK dari state data yang sudah dinormalisasi
  const mkOptions = ['Semua', ...new Set(data.map(item => item.mk))].filter(Boolean);
  
  // Pilihan Filter Sub-CPMK (Menyesuaikan MK yang dipilih)
  const subOptions = ['Semua', ...new Set(
    data
      .filter(item => filterMk === 'Semua' || item.mk === filterMk)
      .map(item => item.subcpmk)
  )].filter(Boolean).sort(); 

  // Logika Filter Data
  const filteredData = data.filter(item => {
    const matchMk = filterMk === 'Semua' || item.mk === filterMk;
    const matchSub = filterSub === 'Semua' || item.subcpmk === filterSub;
    return matchMk && matchSub;
  });

  const handleSelectMk = (mk) => {
    setFilterMk(mk);
    setFilterSub('Semua'); // Reset filter Sub-CPMK saat ganti Matkul
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardAvatar}>
        <Ionicons name="document-text" size={24} color={PRIMARY_BLUE} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.nama} <Text style={styles.nimText}>• {item.nim}</Text></Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{item.mk} • {item.subcpmk}</Text>
        
        <View style={styles.dateRow}>
          <Ionicons name="calendar-clear-outline" size={12} color="#94A3B8" />
          <Text style={styles.dateText}>Diinput: {item.tanggal_input}</Text>
        </View>
      </View>
      <View style={styles.badgeWrap}>
        <Text style={styles.badgeText}>{item.nilai}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.15 }} >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* HEADER BANNER BIRU MELENGKUNG */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Monitoring Nilai</Text>
          <Text style={styles.headerSubtitle}>Monitoring nilai Mahasiswa Program Studi</Text>
        </View>
      </View>

      {/* FILTER SECTION */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Mata Kuliah:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {mkOptions.map(mk => (
            <TouchableOpacity key={mk} style={[styles.filterChip, filterMk === mk && styles.filterChipActive]} onPress={() => handleSelectMk(mk)}>
              <Text style={[styles.chipText, filterMk === mk && styles.chipTextActive]}>{mk}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.filterLabel, { marginTop: 10 }]}>Sub-CPMK:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {subOptions.map(sub => (
            <TouchableOpacity key={sub} style={[styles.filterChip, filterSub === sub && styles.filterChipActive]} onPress={() => setFilterSub(sub)}>
              <Text style={[styles.chipText, filterSub === sub && styles.chipTextActive]}>{sub}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST DATA / LOADING BAR */}
      {isLoading ? (
        <LoadingState message="Memuat data nilai..." color={BASE.primary} />
      ) : (
        <FlatList 
          data={filteredData} 
          keyExtractor={(item, index) => index.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState 
              icon="sad-outline" 
              message="Tidak ada data nilai ditemukan"
            />
          }
        />
      )}
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
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: BASE.primary },
  
  filterSection: { paddingTop: 20, paddingBottom: 5 },
  filterLabel: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: BASE.textMain, marginBottom: 8, paddingHorizontal: 24 },
  filterScroll: { paddingHorizontal: 24, gap: 8, paddingBottom: 4 },
  
  filterChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: BASE.surface, borderWidth: 1, borderColor: BASE.border },
  filterChipActive: { backgroundColor: BASE.primary, borderColor: BASE.primary, elevation: 2 },
  chipText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textMuted },
  chipTextActive: { color: BASE.surface, fontFamily: 'Urbanist-Bold', fontWeight: '800' },
  
  listContainer: { padding: 24, paddingBottom: 30, paddingTop: 10 },
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
    shadowRadius: 3
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
  cardContent: { flex: 1, paddingRight: 8 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain, marginBottom: 4 },
  nimText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textMuted }, 
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: BASE.textMuted, marginBottom: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: BASE.textMuted, marginLeft: 4 },
  badgeWrap: { backgroundColor: BASE.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  badgeText: { color: BASE.surface, fontFamily: 'Urbanist-Bold', fontSize: 14 },
});