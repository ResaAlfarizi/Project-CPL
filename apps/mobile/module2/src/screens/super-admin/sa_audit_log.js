import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, 
  ImageBackground, Modal, TextInput, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auditLogApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;
const PRIMARY_DARK = BASE.primary;
const PRIMARY_BLUE = BASE.primaryLight;

const EVENT_FILTER_OPTIONS = ['Semua Event', 'login_success', 'login_failed', 'logout', 'create', 'update', 'delete'];

export default function SAAuditLogScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [logData, setLogData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('Semua Event');
  const [eventPickerVisible, setEventPickerVisible] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await auditLogApi.getAll();
      const data = res?.data || res || [];
      const raw = Array.isArray(data) ? data : [];

      // Normalisasi field: mapping kolom DB (event_type, created_at, user_id)
      // ke field yang dipakai UI (event, timestamp, user_name, user_email, status).
      // Backend idealnya JOIN auth_audit_log dengan users dan kembalikan user_email/user_name.
      const normalized = raw.map(item => ({
        ...item,
        user_name:  item.user_name  || item.email       || item.user_email || 'Unknown',
        user_email: item.user_email || item.email       || '-',
        event:      item.event      || item.event_type  || '-',
        timestamp:  item.timestamp  || item.created_at,
        status:     item.status     || (
          (item.event_type?.includes('failed') || item.event_type?.includes('locked'))
            ? 'failed'
            : 'success'
        ),
      }));

      setLogData(normalized);
    } catch (err) {
      // Fallback data demo
      setLogData([
        { id: '1', timestamp: new Date().toISOString(), user_name: 'Superadmin', user_email: 'superadmin@kampus.ac.id', event: 'login_success', ip_address: '::1', status: 'success' },
        { id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), user_name: 'Dr. Ahmad Fauzi', user_email: 'ahmad.fauzi@kampus.ac.id', event: 'update', ip_address: '192.168.1.10', status: 'success' },
        { id: '3', timestamp: new Date(Date.now() - 7200000).toISOString(), user_name: 'Dr. Siti Nurhaliza', user_email: 'siti.nurhaliza@kampus.ac.id', event: 'login_success', ip_address: '192.168.1.11', status: 'success' },
        { id: '4', timestamp: new Date(Date.now() - 10800000).toISOString(), user_name: 'Admin TI', user_email: 'admin.ti@kampus.ac.id', event: 'create', ip_address: '192.168.1.15', status: 'success' },
        { id: '5', timestamp: new Date(Date.now() - 14400000).toISOString(), user_name: 'Admin SI', user_email: 'admin.si@kampus.ac.id', event: 'delete', ip_address: '192.168.1.20', status: 'failed' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '-';
    try {
      const d = new Date(ts);
      const date = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
      const time = `${String(d.getHours()).padStart(2,'0')}.${String(d.getMinutes()).padStart(2,'0')}.${String(d.getSeconds()).padStart(2,'0')}`;
      return `${date}, ${time}`;
    } catch { return ts; }
  };

  const getEventBadgeStyle = (event, status) => {
    if (status === 'failed' || status === 'error') return { bg: '#fee2e2', color: '#7f1d1d' };
    if ((event || '').includes('login')) return { bg: '#dcfce7', color: '#166534' };
    if ((event || '').includes('delete')) return { bg: '#fee2e2', color: '#7f1d1d' };
    if ((event || '').includes('create')) return { bg: '#dbeafe', color: '#1d4ed8' };
    if ((event || '').includes('update')) return { bg: '#fef9c3', color: '#713f12' };
    return { bg: '#f1f5f9', color: '#64748B' };
  };

  const filteredData = useMemo(() => {
    return logData.filter(item => {
      const matchSearch =
        (item.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.event || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchEvent = selectedEvent === 'Semua Event' || (item.event || '').includes(selectedEvent);
      return matchSearch && matchEvent;
    });
  }, [logData, searchQuery, selectedEvent]);

  const handleExport = () => {
    Alert.alert(
      'Export Log',
      'Fitur export akan mengunduh data log dalam format CSV. Pastikan koneksi internet stabil.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Export CSV', onPress: () => Alert.alert('Info', 'Implementasi export CSV sesuaikan dengan library yang digunakan di proyek Anda (misal: react-native-fs atau share API).') }
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    const evStyle = getEventBadgeStyle(item.event, item.status);
    const statusStyle = item.status === 'success' ? { bg: '#dcfce7', color: '#166534' } : { bg: '#fee2e2', color: '#7f1d1d' };

    return (
      <View style={styles.card}>
        {/* Baris 1: No + Timestamp */}
        <View style={styles.cardTopRow}>
          <View style={styles.noBadge}>
            <Text style={styles.noText}>{index + 1}</Text>
          </View>
          <View style={styles.timestampWrap}>
            <Ionicons name="time-outline" size={12} color="#94A3B8" />
            <Text style={styles.timestampText}>{formatTimestamp(item.timestamp || item.created_at)}</Text>
          </View>
        </View>

        {/* Baris 2: User */}
        <View style={styles.userRow}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{(item.user_name || 'U').charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.user_name || 'Unknown'}</Text>
            <Text style={styles.userEmail}>{item.user_email || '-'}</Text>
          </View>
        </View>

        {/* Baris 3: Event + IP + Status */}
        <View style={styles.cardBottomRow}>
          <View style={[styles.eventBadge, { backgroundColor: evStyle.bg }]}>
            <Text style={[styles.eventBadgeText, { color: evStyle.color }]}>{item.event || '-'}</Text>
          </View>
          <View style={styles.ipWrap}>
            <Ionicons name="globe-outline" size={12} color="#94A3B8" />
            <Text style={styles.ipText}>{item.ip_address || '-'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>{item.status || '-'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Audit Log</Text>
          <Text style={styles.headerSubtitle}>Riwayat aktivitas sistem</Text>
        </View>
        {/* TOMBOL EXPORT */}
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Ionicons name="document-text" size={18} color={PRIMARY_BLUE} />
          <Text style={styles.exportBtnText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH + FILTER EVENT */}
      <View style={styles.controlRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari log..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.eventFilter} onPress={() => setEventPickerVisible(true)}>
          <Text style={styles.eventFilterText} numberOfLines={1}>
            {selectedEvent === 'Semua Event' ? 'Filter' : selectedEvent}
          </Text>
          <Ionicons name="chevron-down" size={14} color={PRIMARY_BLUE} />
        </TouchableOpacity>
      </View>

      {/* TABEL HEADER */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderCell, { flex: 0.3 }]}>NO</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>TIMESTAMP</Text>
        <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>USER</Text>
        <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>EVENT</Text>
        <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>IP ADDRESS</Text>
        <Text style={[styles.tableHeaderCell, { flex: 0.7 }]}>STATUS</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_DARK} />
          <Text style={styles.loadingText}>Memuat riwayat aktivitas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, i) => (item.id || i).toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={fetchLogs}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="document-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Tidak ada log ditemukan.</Text>
            </View>
          }
        />
      )}

      {/* MODAL PICKER EVENT */}
      <Modal visible={eventPickerVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setEventPickerVisible(false)}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Filter Event</Text>
            <ScrollView>
              {EVENT_FILTER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pickerOption, selectedEvent === opt && styles.pickerOptionActive]}
                  onPress={() => { setSelectedEvent(opt); setEventPickerVisible(false); }}
                >
                  <Text style={[styles.pickerOptionText, selectedEvent === opt && { color: PRIMARY_BLUE, fontFamily: 'Urbanist-Bold' }]}>{opt}</Text>
                  {selectedEvent === opt && <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.pickerCloseBtn} onPress={() => setEventPickerVisible(false)}>
              <Text style={styles.pickerCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FA' },
  header: { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  backBtn: { padding: 8, marginRight: 10 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 2 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 5, borderWidth: 1, borderColor: '#E2E8F0' },
  exportBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: PRIMARY_BLUE },
  controlRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#212121' },
  eventFilter: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  eventFilterText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: PRIMARY_BLUE },
  tableHeaderRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f8fafc', marginHorizontal: 0, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tableHeaderCell: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#64748B' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  noBadge: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  noText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#64748B' },
  timestampWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timestampText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B' },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userAvatar: { width: 34, height: 34, borderRadius: 10, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  userAvatarText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK },
  userName: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#212121' },
  userEmail: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#94A3B8' },
  cardBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  eventBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  eventBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11 },
  ipWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  ipText: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#64748B' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11 },
  emptyWrap: { alignItems: 'center', paddingTop: 50 },
  emptyText: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 12 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  pickerBox: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, maxHeight: '60%' },
  pickerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 15 },
  pickerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  pickerOptionActive: { backgroundColor: '#f0f9ff' },
  pickerOptionText: { fontFamily: 'Urbanist-Medium', fontSize: 15, color: '#212121' },
  pickerCloseBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 30, backgroundColor: '#ffebee', borderRadius: 16, alignSelf: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  pickerCloseText: { color: '#c62828', fontFamily: 'Urbanist-Bold', fontSize: 14 },
});