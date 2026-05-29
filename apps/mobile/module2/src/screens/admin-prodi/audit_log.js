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
import { Ionicons } from '@expo/vector-icons';

const THEME_COLOR = '#cad4ed'; 
const PRIMARY_BLUE = '#577590';
const INACTIVE_BG = '#f8fafc';

const DUMMY_DATA = [
  { id: '1', user: 'admin.si@prodi.ac.id', role: 'Admin', action: 'INSERT_USER', desc: 'Menambahkan akun dosen.budi@prodi.ac.id', time: '10 menit yang lalu', waktu: 'Hari Ini' },
  { id: '2', user: 'dosen.budi@prodi.ac.id', role: 'Dosen', action: 'UPDATE_NILAI', desc: 'Mengubah nilai SCPL-01 Ahmad Fauzi', time: '2 jam yang lalu', waktu: 'Hari Ini' },
  { id: '3', user: 'admin.si@prodi.ac.id', role: 'Admin', action: 'DELETE_MK', desc: 'Menghapus mata kuliah lama (SI999)', time: 'Kemarin, 14:30', waktu: 'Kemarin' },
  { id: '4', user: '09010624010@mhs.ac.id', role: 'Mahasiswa', action: 'LOGIN', desc: 'Mahasiswa berhasil login ke sistem', time: 'Kemarin, 08:15', waktu: 'Kemarin' },
  { id: '5', user: 'admin.si@prodi.ac.id', role: 'Admin', action: 'UPDATE_CPL', desc: 'Memperbarui deskripsi CPL-02', time: '3 hari yang lalu', waktu: '7 Hari Terakhir' },
  { id: '6', user: 'dosen.siti@prodi.ac.id', role: 'Dosen', action: 'INSERT_NILAI', desc: 'Input nilai kelas Arsitektur Enterprise', time: '5 hari yang lalu', waktu: '7 Hari Terakhir' },
  { id: '7', user: '09010624011@mhs.ac.id', role: 'Mahasiswa', action: 'DOWNLOAD_KHS', desc: 'Mengunduh Laporan Nilai Mahasiswa', time: '6 hari yang lalu', waktu: '7 Hari Terakhir' },
];

export default function AuditLogScreen({ navigation }) {
  const [filterWaktu, setFilterWaktu] = useState('Semua');
  const [filterRole, setFilterRole] = useState('Semua');
  
  const waktuOptions = ['Semua', 'Hari Ini', 'Kemarin', '7 Hari Terakhir'];
  const roleOptions = ['Semua', 'Admin', 'Dosen', 'Mahasiswa'];

  const filteredData = DUMMY_DATA.filter(item => {
    const matchWaktu = filterWaktu === 'Semua' || item.waktu === filterWaktu;
    const matchRole = filterRole === 'Semua' || item.role === filterRole;
    return matchWaktu && matchRole;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardAvatar}>
        <Ionicons name="time-outline" size={24} color={PRIMARY_BLUE} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.action} • {item.user}</Text>
        <Text style={styles.cardSubtitle}>{item.desc}</Text>
        <View style={styles.timeWrap}>
          <Ionicons name="calendar-outline" size={12} color="#A1A1AA" style={{marginRight: 4}} />
          <Text style={styles.timeText}>{item.time} ({item.role})</Text>
        </View>
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
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Audit Log</Text>
          <Text style={styles.headerSubtitle}>Riwayat Sistem Program Studi Sistem Informasi</Text>
        </View>
      </View>

      <View style={styles.filterSection}>
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

      <FlatList 
        data={filteredData} 
        keyExtractor={item => item.id} 
        renderItem={renderItem} 
        contentContainerStyle={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Tidak ada log aktivitas yang sesuai filter.</Text>
          </View>
        }
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FA' },
  header: { 
    backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 30, paddingHorizontal: 24, 
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5
  },
  backBtn: { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
  
  filterSection: { paddingTop: 20, paddingBottom: 5 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 8 },
  filterIcon: { marginRight: 6 },
  filterLabel: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#64748B' },
  scrollWrapper: { paddingLeft: 24 },
  pill: { 
    backgroundColor: INACTIVE_BG, paddingHorizontal: 16, paddingVertical: 10, 
    borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' 
  },
  pillActive: { 
    backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE, elevation: 2,
    shadowColor: PRIMARY_BLUE, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3
  },
  pillText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '800' },

  listContainer: { padding: 24, paddingBottom: 40 },
  card: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, 
    borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3
  },
  cardAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', marginBottom: 6, lineHeight: 18 },
  timeWrap: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#A1A1AA', fontStyle: 'italic' },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { fontFamily: 'Urbanist-Regular', marginTop: 10, color: '#94A3B8', fontSize: 14 }
});