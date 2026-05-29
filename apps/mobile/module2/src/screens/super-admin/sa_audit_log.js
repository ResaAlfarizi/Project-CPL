import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME_COLOR = '#cdddf4'; 
const PRIMARY_DARK = '#24354a';

const INITIAL_DATA = [
  { id: '1', action: 'login_success', user: 'root.superadmin', ip: '192.168.1.10', time: 'Baru saja' },
  { id: '2', action: 'account_locked', user: 'admin.ar@prodi', ip: '114.120.10.2', time: '1 Jam lalu' },
  { id: '3', action: 'password_changed', user: 'dosen.budi', ip: '10.0.2.2', time: 'Kemarin' },
];

export default function SAAuditLogScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: item.action === 'account_locked' ? '#ffebee' : '#f1f5f9' }]}>
        <Ionicons name={item.action === 'account_locked' ? 'warning' : 'shield-checkmark'} size={20} color={item.action === 'account_locked' ? '#c62828' : PRIMARY_DARK} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.action.toUpperCase()}</Text>
        <Text style={styles.cardSubtitle}>{item.user} • {item.ip}</Text>
      </View>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} /></TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>System Audit Log</Text>
          <Text style={styles.headerSubtitle}>Riwayat otentikasi & keamanan sistem pusat</Text>
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
  iconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: PRIMARY_DARK, marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B' },
  timeText: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#94A3B8' },
});