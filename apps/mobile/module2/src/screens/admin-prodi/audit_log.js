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
import { auditLogApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, EmptyState } from '../../components';

// ✅ THEME ADMIN PRODI
const THEME = ROLE_THEMES.adminProdi;
const PRIMARY_BLUE = BASE.primaryLight;

export default function AuditLogScreen({ navigation }) {
  const [logData, setLogData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterWaktu, setFilterWaktu] = useState('Semua');
  const [filterRole, setFilterRole] = useState('Semua');
  
  const waktuOptions = ['Semua', 'Hari Ini', 'Kemarin', '7 Hari Terakhir'];
  const roleOptions = ['Semua', 'Admin', 'Dosen', 'Mahasiswa'];

  // ✅ MEMANGGIL DATA DARI BACKEND
  useEffect(() => {
    setIsLoading(true);
    auditLogApi.getAll()
      .then(res => {
        const extractedData = res && res.data ? res.data : (Array.isArray(res) ? res : []);
        setLogData(extractedData);
      })
      .catch(err => {
        console.error("Gagal menarik data audit log melalui api.js:", err);
        setLogData([]); 
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // ✅ LOGIKA FILTER DATA
  const filteredData = logData.filter(item => {
    // 1. Filter Berdasarkan Waktu
    const matchWaktu = filterWaktu === 'Semua' || (() => {
      const rawDate = item.time || item.waktu || item.created_at || item.timestamp;
      if (!rawDate) return false;
      if (rawDate === filterWaktu) return true; 

      try {
        const recordDate = new Date(rawDate);
        if (isNaN(recordDate.getTime())) return false;

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (filterWaktu === 'Hari Ini') return recordDate.toDateString() === today.toDateString();
        if (filterWaktu === 'Kemarin') return recordDate.toDateString() === yesterday.toDateString();
        if (filterWaktu === '7 Hari Terakhir') {
          const diffTime = Math.abs(today - recordDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        }
      } catch (e) { return false; }
      return false;
    })();

    // 2. Filter Berdasarkan Role (Sudah diperbaiki agar singkron jika data BE kosong)
    const rawRole = item.role || item.User?.role || item.role_name || item.user_role || '';
    const itemRole = rawRole ? rawRole.toLowerCase().trim() : 'admin'; // <-- Jika BE kosong, otomatis dianggap 'admin' agar bisa disaring tombol filter
    
    const targetRole = filterRole.toLowerCase();
    const matchRole = filterRole === 'Semua' || itemRole === targetRole;

    return matchWaktu && matchRole;
  });

  // ✅ LOGIKA RENDER KARTU (CARD) LOG
  const renderItem = ({ item }) => {
    // 1. Aktivitas default diubah menjadi 'Login'
    const actionText = item.action || item.activity || 'Login';
    
    // 2. Tampilan Role (Jika kosong dari BE, otomatis dicetak 'Admin')
    const rawRole = item.role || item.User?.role || item.role_name || item.user_role || '';
    const cleanRole = rawRole ? rawRole.toLowerCase().trim() : 'admin';
    const displayRole = cleanRole.charAt(0).toUpperCase() + cleanRole.slice(1);
    
    // 3. Menampilkan Nama Pengguna Asli (Bukan tulisan kata "user" statis lagi)
    const userText = item.user || item.username || item.User?.nama || item.User?.email || item.nama || 'User';
    
    // 4. Deteksi Deskripsi Aktivitas
    const descText = item.desc || item.description || item.details;
    
    // Format Waktu
    let timeText = item.time || item.waktu || item.created_at || item.timestamp || '-';
    if (timeText !== '-' && typeof timeText === 'string' && timeText.includes('T')) {
      try {
        timeText = new Date(timeText).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      } catch (e) {}
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardAvatar}>
          <Ionicons name="log-in-outline" size={24} color={PRIMARY_BLUE} />
        </View>
        <View style={styles.cardContent}>
          {/* Judul: Login • Admin / Dosen / Mahasiswa */}
          <Text style={styles.cardTitle}>{actionText} • {displayRole}</Text>
          
          {/* Jika deskripsi kosong/tidak ada dari backend, komponen ini langsung dihapus (tidak dirender) */}
          {descText ? <Text style={styles.cardSubtitle}>{descText}</Text> : null}
          
          <View style={styles.timeWrap}>
            <Ionicons name="calendar-outline" size={12} color="#A1A1AA" style={{marginRight: 4}} />
            {/* Memunculkan Nama User asli */}
            <Text style={styles.timeText}>{timeText} ({userText})</Text>
          </View>
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
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Audit Log</Text>
          <Text style={styles.headerSubtitle}>Log Aktivitas Masuk Pengguna Sistem</Text>
        </View>
      </View>

      {/* SECTION FILTER */}
      <View style={styles.filterSection}>
        {/* Filter Waktu */}
        <View style={styles.filterRow}>
          <Ionicons name="filter-outline" size={16} color="#64748B" style={styles.filterIcon} />
          <Text style={styles.filterLabel}>Filter Waktu</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollWrapper}>
          {waktuOptions.map((waktu, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.pill, filterWaktu === waktu && styles.pillActive]}
              onPress={() => setFilterWaktu(waktu)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, filterWaktu === waktu && styles.pillTextActive]}>{waktu}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ width: 24 }} />
        </ScrollView>

        {/* Filter Role */}
        <View style={[styles.filterRow, { marginTop: 12 }]}>
          <Ionicons name="people-outline" size={16} color="#64748B" style={styles.filterIcon} />
          <Text style={styles.filterLabel}>Filter Role</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollWrapper}>
          {roleOptions.map((role, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.pill, filterRole === role && styles.pillActive]}
              onPress={() => setFilterRole(role)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, filterRole === role && styles.pillTextActive]}>{role}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ width: 24 }} />
        </ScrollView>
      </View>

      {/* AREA UTAMA / LIST DATA */}
      {isLoading ? (
        <LoadingState message="Memuat riwayat login..." color={BASE.primary} />
      ) : (
        <FlatList 
          data={filteredData} 
          keyExtractor={item => item.id ? item.id.toString() : (item.audit_id ? item.audit_id.toString() : Math.random().toString())} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContainer} 
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState 
              icon="search-outline" 
              message="Tidak ada log aktivitas yang sesuai filter."
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
    elevation: 4,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5
  },
  backBtn: { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: BASE.textMain, marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: BASE.textMuted },
  
  filterSection: { paddingTop: 20, paddingBottom: 5 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 8 },
  filterIcon: { marginRight: 6 },
  filterLabel: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: BASE.textMuted },
  scrollWrapper: { paddingLeft: 24 },
  pill: { 
    backgroundColor: THEME.accent, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: BASE.border 
  },
  pillActive: { 
    backgroundColor: BASE.primary, 
    borderColor: BASE.primary, 
    elevation: 2,
    shadowColor: BASE.primary, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 3
  },
  pillText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textMuted },
  pillTextActive: { color: BASE.surface, fontWeight: '800' },

  listContainer: { padding: 24, paddingBottom: 40 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: BASE.surface, 
    padding: 16, 
    borderRadius: 24, 
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
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: BASE.textMain, marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: BASE.textMuted, marginBottom: 6, lineHeight: 18 },
  timeWrap: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: BASE.textMuted, fontStyle: 'italic' },
});