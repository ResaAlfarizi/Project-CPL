import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ImageBackground, Modal, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME_COLOR = '#a3c1e5'; 
const PRIMARY_DARK = '#24354a';

const INITIAL_DATA = [
  { id: '1', nama: 'Budi Santoso', role: 'Admin Prodi', scope: 'Sistem Informasi' },
  { id: '2', nama: 'System Root', role: 'Superadmin', scope: 'Global Access' },
  { id: '3', nama: 'Siti Rahma', role: 'Dosen', scope: 'Teknik Arsitektur' },
];

export default function SAKelolaUserScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [role, setRole] = useState('Admin Prodi');

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardAvatar}>
        <Ionicons name={item.role === 'Superadmin' ? 'shield-checkmark' : 'person'} size={20} color={PRIMARY_DARK} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.nama}</Text>
        <Text style={styles.cardSubtitle}>{item.role} • {item.scope}</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} /></TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Manajemen User Global</Text>
          <Text style={styles.headerSubtitle}>Kelola akses Superadmin, Admin Prodi, dll.</Text>
        </View>
      </View>

      <FlatList data={INITIAL_DATA} keyExtractor={item => item.id} renderItem={renderItem} contentContainerStyle={styles.listContainer} />
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}><Ionicons name="person-add" size={24} color={PRIMARY_DARK} /></TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}><View style={StyleSheet.absoluteFillObject} /></TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Registrasi Pengguna Baru</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                {['Superadmin', 'Admin Prodi', 'Dosen', 'Mahasiswa'].map((r) => (
                  <TouchableOpacity key={r} style={[styles.roleBtn, role === r ? styles.roleActive : styles.roleInactive]} onPress={() => setRole(r)}>
                    <Text style={[styles.roleText, role === r && {color: '#FFF'}]}>{r}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#94A3B8" />
            <TextInput style={styles.input} placeholder="Nama Lengkap" placeholderTextColor="#94A3B8" />
            
            {/* Hanya tampil jika bukan superadmin */}
            {role !== 'Superadmin' && (
              <TextInput style={styles.input} placeholder="Keterikatan Prodi (ID Prodi)" placeholderTextColor="#94A3B8" />
            )}

            <TouchableOpacity style={styles.btnSubmit} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnSubmitText}>Buat Akun</Text>
            </TouchableOpacity>
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#212121', marginBottom: 2 },
  cardSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitle: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 20 },
  roleBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, borderWidth: 1, marginRight: 10 },
  roleActive: { backgroundColor: PRIMARY_DARK, borderColor: PRIMARY_DARK },
  roleInactive: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  roleText: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#64748B' },
  input: { backgroundColor: '#f8fafc', borderRadius: 18, marginBottom: 12, paddingHorizontal: 15, paddingVertical: 15, fontFamily: 'Urbanist-Regular', fontSize: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  btnSubmit: { backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  btnSubmitText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
});