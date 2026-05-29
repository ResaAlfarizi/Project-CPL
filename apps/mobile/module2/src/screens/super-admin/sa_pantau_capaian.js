import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME_COLOR = '#cdddf4'; 
const PRIMARY_DARK = '#24354a';

const INITIAL_DATA = [
  { id: '1', nama: 'Ahmad Fauzi', prodi: 'Sistem Informasi', nilai: 87.6, status: 'Excellence' },
  { id: '2', nama: 'Diana Putri', prodi: 'Teknik Arsitektur', nilai: 75.0, status: 'Satisfactory' },
];

export default function SAPantauCapaianScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.nama}</Text>
        <Text style={styles.cardSubtitle}>{item.prodi}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.scoreText}>{item.nilai}</Text>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} /></TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Agregat Capaian CPL</Text>
          <Text style={styles.headerSubtitle}>Laporan capaian mahasiswa lintas Fakultas</Text>
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
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  scoreText: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK },
  statusText: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#00796b' },
});