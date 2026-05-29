import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ImageBackground, Modal, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME_COLOR = '#a3c1e5'; 
const PRIMARY_DARK = '#24354a';

const INITIAL_DATA = [
  { id: '1', prodi: 'Sistem Informasi', kode: 'SI101', title: 'Analisis & Perancangan Sistem', sks: '3', semester: '3' },
  { id: '2', prodi: 'Teknik Arsitektur', kode: 'AR201', title: 'Studio Perancangan Dasar', sks: '4', semester: '2' },
];

export default function SAKelolaMKScreen({ navigation }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [modalVisible, setModalVisible] = useState(false);
  const [prodi, setProdi] = useState('');
  const [kode, setKode] = useState('');
  const [namaMk, setNamaMk] = useState('');
  const [sks, setSks] = useState('');
  
  const handleAdd = () => {
    setData([{ id: Date.now().toString(), prodi, kode, title: namaMk, sks, semester: '1' }, ...data]);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardAvatar}>
        <Text style={styles.avatarText}>{item.kode.slice(0, 2)}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardProdi}>{item.prodi}</Text>
        <Text style={styles.cardTitle}>{item.kode} - {item.title}</Text>
        <Text style={styles.cardSubtitle}>SKS: {item.sks} • Semester {item.semester}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} /></TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Mata Kuliah Global</Text>
          <Text style={styles.headerSubtitle}>Pemetaan MK seluruh Program Studi</Text>
        </View>
      </View>
      <FlatList data={data} keyExtractor={item => item.id} renderItem={renderItem} contentContainerStyle={styles.listContainer} />
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}><Ionicons name="add" size={28} color={PRIMARY_DARK} /></TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}><View style={StyleSheet.absoluteFillObject} /></TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Tambah MK Baru</Text>
            <TextInput style={styles.input} placeholder="Nama Prodi (cth: Sistem Informasi)" placeholderTextColor="#94A3B8" value={prodi} onChangeText={setProdi} />
            <TextInput style={styles.input} placeholder="Kode MK (cth: SI303)" placeholderTextColor="#94A3B8" value={kode} onChangeText={setKode} />
            <TextInput style={styles.input} placeholder="Nama Mata Kuliah" placeholderTextColor="#94A3B8" value={namaMk} onChangeText={setNamaMk} />
            <TextInput style={styles.input} placeholder="SKS (cth: 3)" placeholderTextColor="#94A3B8" value={sks} onChangeText={setSks} keyboardType="number-pad" />
            <TouchableOpacity style={[styles.btnSubmit, {marginTop: 15}]} onPress={handleAdd}><Text style={styles.btnSubmitText}>Simpan Mata Kuliah</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK },
  cardContent: { flex: 1, justifyContent: 'center' },
  cardProdi: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: PRIMARY_DARK, marginBottom: 2, backgroundColor: '#e2e8f0', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#212121' },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitle: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#f8fafc', borderRadius: 18, marginBottom: 12, paddingHorizontal: 15, paddingVertical: 15, fontFamily: 'Urbanist-Regular', fontSize: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  btnSubmit: { backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  btnSubmitText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
});