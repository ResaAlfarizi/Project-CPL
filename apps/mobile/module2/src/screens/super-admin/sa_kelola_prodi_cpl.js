import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ImageBackground, Modal, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME_COLOR = '#cdddf4'; 
const PRIMARY_DARK = '#24354a';

const INITIAL_DATA = [
  { id: '1', type: 'PRODI', nama: 'S1 Sistem Informasi', kode: 'SI', desc: 'Fakultas Sains dan Teknologi' },
  { id: '2', type: 'CPL', nama: 'CPL-01', kode: 'SI', desc: 'Mampu menganalisis kebutuhan sistem bisnis dan IT' },
  { id: '3', type: 'PRODI', nama: 'S1 Arsitektur', kode: 'AR', desc: 'Fakultas Sains dan Teknologi' },
];

export default function SAKelolaProdiCPLScreen({ navigation }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipeForm, setTipeForm] = useState('PRODI');
  const [nama, setNama] = useState('');
  const [kode, setKode] = useState('');
  const [desc, setDesc] = useState('');
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: '', title: '', message: '' });

  const handleAdd = () => {
    if (!nama || !kode || !desc) {
      setAlertConfig({ visible: true, type: 'error', title: 'Data Belum Lengkap', message: 'Semua kolom wajib diisi.' });
      return;
    }
    setData([{ id: Date.now().toString(), type: tipeForm, nama, kode, desc }, ...data]);
    setModalVisible(false);
    setNama(''); setKode(''); setDesc('');
    setTimeout(() => setAlertConfig({ visible: true, type: 'success', title: 'Berhasil!', message: `Data ${tipeForm} berhasil ditambahkan.` }), 300);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.cardAvatar, { backgroundColor: item.type === 'PRODI' ? PRIMARY_DARK : THEME_COLOR }]}>
        <Text style={[styles.avatarText, { color: item.type === 'PRODI' ? '#FFF' : PRIMARY_DARK }]}>{item.type === 'PRODI' ? 'P' : 'C'}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.kode} - {item.nama}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>{item.desc}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Program Studi & CPL</Text>
          <Text style={styles.headerSubtitle}>Kelola Master Data Prodi & Capaian Lulusan</Text>
        </View>
      </View>

      <FlatList data={data} keyExtractor={item => item.id} renderItem={renderItem} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false} />
      
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}><Ionicons name="add" size={28} color={PRIMARY_DARK} /></TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}><View style={StyleSheet.absoluteFillObject} /></TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Tambah Data Master</Text>
            
            <View style={styles.roleWrap}>
                {['PRODI', 'CPL'].map((r) => (
                  <TouchableOpacity key={r} style={[styles.roleBtn, tipeForm === r ? styles.roleActive : styles.roleInactive]} onPress={() => setTipeForm(r)}>
                    <Text style={[styles.roleText, tipeForm === r && {color: '#FFF'}]}>{r}</Text>
                  </TouchableOpacity>
                ))}
            </View>

            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder={tipeForm === 'PRODI' ? "Kode Prodi (cth: SI)" : "Kode Prodi Terkait (cth: SI)"} placeholderTextColor="#94A3B8" value={kode} onChangeText={setKode} />
            </View>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder={tipeForm === 'PRODI' ? "Nama Program Studi" : "Kode CPL (cth: CPL-01)"} placeholderTextColor="#94A3B8" value={nama} onChangeText={setNama} />
            </View>
            <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start' }]}>
              <TextInput style={[styles.input, { paddingTop: 15 }]} placeholder="Deskripsi" placeholderTextColor="#94A3B8" value={desc} onChangeText={setDesc} multiline />
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}><Text style={styles.btnCancelText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleAdd}><Text style={styles.btnSubmitText}>Simpan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={alertConfig.visible} animationType="fade" transparent>
        <View style={styles.alertOverlay}>
            <View style={styles.alertBox}>
              <Ionicons name={alertConfig.type === 'success' ? "checkmark-circle" : "warning"} size={60} color={alertConfig.type === 'success' ? '#00796b' : '#c62828'} />
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity style={[styles.btnSubmit, { width: '100%', backgroundColor: PRIMARY_DARK }]} onPress={() => setAlertConfig({...alertConfig, visible: false})}>
                <Text style={styles.btnSubmitText}>Mengerti</Text>
              </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FA' },
  header: { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', elevation: 4 },
  backBtn: { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
  listContainer: { padding: 24, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  cardAvatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 20 },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(36, 53, 74, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitle: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 20 },
  roleWrap: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 18, alignItems: 'center', borderWidth: 1 },
  roleActive: { backgroundColor: PRIMARY_DARK, borderColor: PRIMARY_DARK },
  roleInactive: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  roleText: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#64748B' },
  inputContainer: { backgroundColor: '#f8fafc', borderRadius: 18, marginBottom: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  input: { flex: 1, paddingVertical: 15, fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  btnCancel: { flex: 0.48, backgroundColor: '#ffebee', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelText: { color: '#c62828', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmit: { flex: 0.48, backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  btnSubmitText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  alertOverlay: { flex: 1, backgroundColor: 'rgba(36, 53, 74, 0.6)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '80%', alignItems: 'center', elevation: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginTop: 15, marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 25 },
});