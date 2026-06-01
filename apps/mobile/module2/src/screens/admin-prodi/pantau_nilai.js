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

// ✅ IMPORT FUNGSI API TERSENTRALISASI
import { nilaiApi } from '../../services/api';

const THEME_COLOR = '#cad4ed'; 
const PRIMARY_BLUE = '#577590';
const INACTIVE_BG = '#f8fafc';

export default function PantauNilaiScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // ✅ Fungsi menarik data nilai mahasiswa
  const fetchNilaiMahasiswa = () => {
    setIsLoading(true);
    nilaiApi.getAll()
      .then(result => {
        const fetchedData = result && result.data && Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
        
        // 🌟 NORMALISASI DATA: Memetakan kolom database agar sesuai radar UI aplikasi
        const normalizedData = fetchedData.map(item => {
          // Ambil nilai tanggal mentah dari kolom input_at atau created_at database kamu
          const tanggalMentah = item.input_at || item.created_at || item.tanggal_input || item.tanggal || '-';

          return {
            ...item,
            id: item.id || item.nilai_id || Math.random().toString(),
            nama: item.nama || item.nama_mahasiswa || item.mahasiswa_nama || 'Mahasiswa',
            nim: item.nim || item.mahasiswa_nim || '-',
            nilai: item.nilai !== undefined ? item.nilai : (item.score || 0),
            
            // Penyelaras database mata kuliah
            mk: item.nama_mk || item.mk || item.mata_kuliah || item.matakuliah || 'Mata Kuliah',
            
            // Penyelaras database sub-cpmk (kode_sub_cpmk)
            subcpmk: item.kode_sub_cpmk || item.subcpmk || item.kode_subcpmk || item.sub_cpmk || item.kode || '-',
            
            // 🔥 Tanggal mentah dikirim ke fungsi helper agar terformat rapi
            tanggal_input: formatTanggal(tanggalMentah)
          };
        });

        setData(normalizedData);
      })
      .catch(error => {
        console.error("Gagal menarik data nilai:", error);
        setData([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_BLUE} />
          <Text style={styles.loadingText}>Memuat data nilai...</Text>
        </View>
      ) : (
        <FlatList 
          data={filteredData} 
          keyExtractor={(item, index) => index.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>Tidak ada data nilai ditemukan</Text>
            </View>
          }
        />
      )}
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
    elevation: 4 
  },
  backBtn: { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#577590' },
  
  filterSection: { paddingTop: 20, paddingBottom: 5 },
  filterLabel: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#212121', marginBottom: 8, paddingHorizontal: 24 },
  filterScroll: { paddingHorizontal: 24, gap: 8, paddingBottom: 4 },
  
  filterChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE, elevation: 2 },
  chipText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B' },
  chipTextActive: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontWeight: '800' },
  
  listContainer: { padding: 24, paddingBottom: 30, paddingTop: 10 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 16, 
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
  cardContent: { flex: 1, paddingRight: 8 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', marginBottom: 4 },
  nimText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#94A3B8' }, 
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B', marginBottom: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#94A3B8', marginLeft: 4 },
  badgeWrap: { backgroundColor: PRIMARY_BLUE, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  badgeText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#64748B', marginTop: 10 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 10 }
});