import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME_COLOR = '#a3c1e5'; 
const PRIMARY_DARK = '#24354a';

const INITIAL_DATA = [
  { id: '1', kelas: 'SI-A 2024', mk: 'Analisis Sistem', dosen: 'Budi Santoso', status: 'Sudah Input' },
  { id: '2', kelas: 'AR-B 2024', mk: 'Studio Perancangan', dosen: 'Siti Rahma', status: 'Belum Input' },
];

export default function SAInputNilaiScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.kelas} • {item.mk}</Text>
        <Text style={styles.cardSubtitle}>Dosen: {item.dosen}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: item.status === 'Sudah Input' ? '#dcead7' : '#ffebee' }]}>
        <Text style={[styles.badgeText, { color: item.status === 'Sudah Input' ? '#2e7d32' : '#c62828' }]}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} /></TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Monitoring Input Nilai</Text>
          <Text style={styles.headerSubtitle}>Pantau kelengkapan formasi nilai Dosen</Text>
        </View>
      </View>
      <FlatList data={INITIAL_DATA} keyExtractor={item => item.id} renderItem={renderItem} contentContainerStyle={styles.listContainer} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FA' },
  header: { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row' },
  backBtn: { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
  listContainer: { padding: 24 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11 },
});