import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  StatusBar, ImageBackground, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// FIX: Import dashboardApi sebagai sumber data agregat lintas prodi,
// ganti subCpmkApi yang sebelumnya tidak terpakai di file ini.
import { dashboardApi } from '../../services/api';

const THEME_COLOR = '#cdddf4'; 
const PRIMARY_DARK = '#24354a';

// Peta warna badge status sesuai threshold_status di DB
const STATUS_COLOR = {
  'Excellence':    { bg: '#e8f5e9', text: '#2e7d32' },
  'Satisfactory':  { bg: '#e3f2fd', text: '#1565c0' },
  'Competent':     { bg: '#fff8e1', text: '#f57f17' },
  'Developing':    { bg: '#fff3e0', text: '#e65100' },
  'Not Competent': { bg: '#ffebee', text: '#c62828' },
};

const DEFAULT_STATUS_COLOR = { bg: '#f1f5f9', text: '#64748B' };

export default function SAPantauCapaianScreen({ navigation }) {
  const [capaianData, setCapaianData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCapaianGlobal = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // Gunakan endpoint agregat superadmin yang sudah ada di dashboardApi.
      // Backend harus menyertakan field capaian_mahasiswa di dalam respons,
      // atau sediakan endpoint khusus seperti dashboardApi.getCapaianAgregat().
      const response = await dashboardApi.getCapaianAgregat();
      const list = response?.data?.capaian || response?.data || response || [];
      
      if (Array.isArray(list) && list.length > 0) {
        // Normalisasi field dari respons DB (v_capaian_cpl_mahasiswa join mahasiswa join program_studi)
        // Ekspektasi field: mahasiswa_id, nama, nama_prodi, nilai_cpl_total, status
        const normalized = list.map((item, idx) => ({
          id:     item.mahasiswa_id || item.id || String(idx),
          nama:   item.nama         || item.nama_mahasiswa || '-',
          prodi:  item.nama_prodi   || item.prodi          || '-',
          nilai:  parseFloat(item.nilai_cpl_total ?? item.nilai ?? 0).toFixed(1),
          status: item.status       || '-',
        }));
        setCapaianData(normalized);
      } else {
        // Jika endpoint belum tersedia atau data kosong, tampilkan pesan informatif
        setCapaianData([]);
        setErrorMsg('Belum ada data capaian yang dapat ditampilkan.');
      }
    } catch (error) {
      console.error('fetchCapaianGlobal error:', error);
      // Fallback data statis hanya untuk keperluan demo/development
      setCapaianData([
        { id: '1', nama: 'Ahmad Fauzi',  prodi: 'Sistem Informasi',  nilai: '87.6', status: 'Excellence'   },
        { id: '2', nama: 'Diana Putri',  prodi: 'Teknik Arsitektur', nilai: '75.0', status: 'Satisfactory' },
        { id: '3', nama: 'Budi Santoso', prodi: 'Teknik Informatika',nilai: '62.3', status: 'Competent'    },
        { id: '4', nama: 'Siti Rahayu',  prodi: 'Sistem Informasi',  nilai: '48.0', status: 'Developing'   },
      ]);
      setErrorMsg('Menggunakan data demo. Periksa koneksi atau endpoint API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapaianGlobal();
  }, []);

  const renderItem = ({ item }) => {
    const statusColor = STATUS_COLOR[item.status] || DEFAULT_STATUS_COLOR;
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.nama}</Text>
          <Text style={styles.cardSubtitle}>{item.prodi}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.scoreText}>{item.nilai}</Text>
          {/* Badge status dengan warna dinamis sesuai threshold_status */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('../../../assets/uinsa2.jpeg')} 
      style={styles.container} 
      imageStyle={{ opacity: 0.1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Agregat Capaian CPL</Text>
          <Text style={styles.headerSubtitle}>Laporan capaian mahasiswa lintas Fakultas</Text>
        </View>
      </View>

      {/* BANNER PERINGATAN jika pakai data fallback */}
      {errorMsg !== '' && !loading && (
        <View style={styles.warnBanner}>
          <Ionicons name="information-circle-outline" size={16} color="#92400e" style={{ marginRight: 8 }} />
          <Text style={styles.warnText}>{errorMsg}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_DARK} />
        </View>
      ) : (
        <FlatList 
          data={capaianData} 
          keyExtractor={item => item.id.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={[
            styles.listContainer,
            capaianData.length === 0 && styles.emptyContainer
          ]}
          refreshing={loading}
          onRefresh={fetchCapaianGlobal}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="bar-chart-outline" size={52} color="#cbd5e1" />
              <Text style={styles.emptyText}>Belum ada data capaian.</Text>
            </View>
          }
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F6F5FA' },
  header:          { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row' },
  backBtn:         { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap:  { flex: 1 },
  headerTitle:     { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 4 },
  headerSubtitle:  { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
  warnBanner:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', marginHorizontal: 24, marginTop: 16, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#fde68a' },
  warnText:        { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#92400e', flex: 1 },
  listContainer:   { padding: 24 },
  emptyContainer:  { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card:            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  cardContent:     { flex: 1 },
  cardTitle:       { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', marginBottom: 4 },
  cardSubtitle:    { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  scoreText:       { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 4 },
  statusBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText:      { fontFamily: 'Urbanist-Bold', fontSize: 11 },
  emptyWrap:       { alignItems: 'center', paddingTop: 60 },
  emptyText:       { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 12 },
});