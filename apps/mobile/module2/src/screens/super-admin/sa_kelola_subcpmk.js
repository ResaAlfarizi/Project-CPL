import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME_COLOR = '#cdddf4'; 
const PRIMARY_DARK = '#24354a';

const INITIAL_DATA = [
  { id: '1', mk: 'Analisis & Perancangan Sistem', prodi: 'Sistem Informasi', kode: 'SCPL-01', bobot: '30%' },
  { id: '2', mk: 'Studio Perancangan Dasar', prodi: 'Teknik Arsitektur', kode: 'SCPL-02', bobot: '40%' },
];

export default function SAKelolaSubCpmkScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardProdi}>{item.prodi}</Text>
        <Text style={styles.cardTitle}>{item.kode} • {item.mk}</Text>
        <Text style={styles.cardSubtitle}>Bobot Capaian: {item.bobot}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} /></TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Indikator Sub-CPMK</Text>
          <Text style={styles.headerSubtitle}>Manajemen bobot nilai skala Universitas</Text>
        </View>
      </View>
      <FlatList data={INITIAL_DATA} keyExtractor={item => item.id} renderItem={renderItem} contentContainerStyle={styles.listContainer} />
      <TouchableOpacity style={styles.fab}><Ionicons name="add" size={28} color={PRIMARY_DARK} /></TouchableOpacity>
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
  listContainer: { padding: 24, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardContent: { flex: 1 },
  cardProdi: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#64748B', marginBottom: 2, textTransform: 'uppercase' },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});