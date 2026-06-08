import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, 
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback, 
  Keyboard, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { thresholdApi, prodiApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;
const PRIMARY_DARK = BASE.primary;
const PRIMARY_BLUE = BASE.primaryLight;
const DANGER_COLOR = BASE.error;

// Konfigurasi predikat
const PREDIKAT_CONFIG = {
  Excellence:    { color: '#166534', bg: '#dcfce7', icon: 'trophy' },
  Satisfactory:  { color: '#1e3a5f', bg: '#dbeafe', icon: 'thumbs-up' },
  Competent:     { color: '#713f12', bg: '#fef9c3', icon: 'checkmark-circle' },
  Developing:    { color: '#7c2d12', bg: '#ffedd5', icon: 'trending-up' },
  'Not Competent': { color: '#7f1d1d', bg: '#fee2e2', icon: 'close-circle' },
};

const DEFAULT_THRESHOLDS = [
  { status: 'Excellence',    min: 85, max: 100 },
  { status: 'Satisfactory',  min: 70, max: 84.99 },
  { status: 'Competent',     min: 55, max: 69.99 },
  { status: 'Developing',    min: 40, max: 54.99 },
  { status: 'Not Competent', min: 0,  max: 39.99 },
];

export default function SAThresholdScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [prodiList, setProdiList] = useState([]);
  const [selectedProdi, setSelectedProdi] = useState(null);
  const [thresholdData, setThresholdData] = useState([]);
  const [allThresholdData, setAllThresholdData] = useState([]); // Data mentah dari API
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // Index item yang sedang diedit
  
  // Form state untuk inline edit
  const [editMin, setEditMin] = useState('');
  const [editMax, setEditMax] = useState('');

  const [alertConfig, setAlertConfig] = useState({ visible: false, type: '', title: '', message: '' });
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);

  useEffect(() => {
    loadProdi();
    loadAllThreshold();
  }, []);

  useEffect(() => {
    if (selectedProdi && allThresholdData.length > 0) {
      filterThresholdByProdi(selectedProdi.id);
    }
  }, [selectedProdi, allThresholdData]);

  const loadProdi = async () => {
    try {
      const res = await prodiApi.getAll();
      const list = res?.data || [];
      setProdiList(list);
      if (list.length > 0) setSelectedProdi(list[0]);
    } catch (err) {
      showAlert('error', 'Gagal', 'Tidak dapat memuat daftar prodi.');
    }
  };

  const loadAllThreshold = async () => {
    setIsLoading(true);
    try {
      const res = await thresholdApi.getAll();
      const data = res?.data || [];
      console.log('📊 All Threshold Data:', data);
      setAllThresholdData(data);
    } catch (err) {
      console.error('❌ Error loading threshold:', err);
      setAllThresholdData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterThresholdByProdi = (prodiId) => {
    const filtered = allThresholdData.filter(item => String(item.prodi_id) === String(prodiId));
    
    if (filtered.length === 0) {
      // Jika belum ada data, gunakan default dengan nilai 0-100
      const defaultData = DEFAULT_THRESHOLDS.map((d, i) => ({
        ...d,
        id: `default-${i}`,
        isDefault: true,
        status: d.status,
        nama_status: d.status,
        min_nilai: 0,
        max_nilai: 100,
        nilai_min: 0,
        nilai_max: 100
      }));
      setThresholdData(defaultData);
    } else {
      setThresholdData(filtered);
    }
  };

  const showAlert = (type, title, message) => setAlertConfig({ visible: true, type, title, message });

  const handleSaveAll = async () => {
    if (!selectedProdi) {
      showAlert('error', 'Pilih Prodi', 'Harap pilih program studi terlebih dahulu.');
      return;
    }

    // Validasi semua threshold
    for (const item of thresholdData) {
      const min = item.nilai_min ?? item.min_nilai ?? 0;
      const max = item.nilai_max ?? item.max_nilai ?? 100;
      
      if (min >= max) {
        showAlert('error', 'Nilai Tidak Valid', `Nilai min harus lebih kecil dari max pada status "${item.status || item.nama_status}"`);
        return;
      }
    }

    try {
      const payload = {
        prodi_id: selectedProdi.id,
        thresholds: thresholdData.map(item => ({
          nama_status: item.status || item.nama_status,
          nilai_min: parseFloat(item.nilai_min ?? item.min_nilai ?? 0),
          nilai_max: parseFloat(item.nilai_max ?? item.max_nilai ?? 100)
        }))
      };

      console.log('💾 Saving threshold:', payload);
      await thresholdApi.create(payload); // Backend menggunakan endpoint POST /threshold
      
      setEditingIndex(null);
      await loadAllThreshold();
      setTimeout(() => showAlert('success', 'Berhasil!', 'Threshold berhasil disimpan ke database.'), 300);
    } catch (err) {
      console.error('❌ Save error:', err);
      showAlert('error', 'Gagal Simpan', err.message || 'Terjadi kesalahan server.');
    }
  };

  const handleReset = () => {
    setResetConfirmVisible(true);
  };

  const confirmReset = () => {
    const resetData = DEFAULT_THRESHOLDS.map((d, i) => ({
      ...d,
      id: `default-${i}`,
      isDefault: true,
      status: d.status,
      nama_status: d.status,
      min_nilai: 0,
      max_nilai: 100,
      nilai_min: 0,
      nilai_max: 100
    }));
    setThresholdData(resetData);
    setEditingIndex(null);
    setResetConfirmVisible(false);
    showAlert('success', 'Direset!', 'Threshold dikembalikan ke default (0-100). Klik Simpan untuk menyimpan ke database.');
  };

  const handleEdit = (index) => {
    const item = thresholdData[index];
    setEditingIndex(index);
    setEditMin(String(item.nilai_min ?? item.min_nilai ?? 0));
    setEditMax(String(item.nilai_max ?? item.max_nilai ?? 100));
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditMin('');
    setEditMax('');
  };

  const handleApplyEdit = () => {
    const min = parseFloat(editMin);
    const max = parseFloat(editMax);

    if (isNaN(min) || isNaN(max)) {
      showAlert('error', 'Input Tidak Valid', 'Harap masukkan angka yang valid.');
      return;
    }

    if (min < 0 || max > 100 || min >= max) {
      showAlert('error', 'Nilai Tidak Valid', 'Nilai harus 0-100 dan min < max.');
      return;
    }

    const updatedData = [...thresholdData];
    updatedData[editingIndex] = {
      ...updatedData[editingIndex],
      nilai_min: min,
      min_nilai: min,
      nilai_max: max,
      max_nilai: max,
      isDefault: false // Tandai sudah dimodifikasi
    };

    setThresholdData(updatedData);
    setEditingIndex(null);
    setEditMin('');
    setEditMax('');
  };

  // Tampilan data
  const displayData = thresholdData.length > 0 ? thresholdData : DEFAULT_THRESHOLDS.map((d, i) => ({ 
    ...d, 
    id: `default-${i}`, 
    isDefault: true, 
    status: d.status,
    nama_status: d.status,
    min_nilai: 0, 
    max_nilai: 100,
    nilai_min: 0,
    nilai_max: 100
  }));

  const renderItem = ({ item, index }) => {
    const cfg = PREDIKAT_CONFIG[item.status || item.nama_status] || { color: '#64748B', bg: '#f1f5f9', icon: 'ellipse' };
    const isEditing = editingIndex === index;
    
    const minVal = isEditing ? parseFloat(editMin) || 0 : (item.nilai_min ?? item.min_nilai ?? 0);
    const maxVal = isEditing ? parseFloat(editMax) || 100 : (item.nilai_max ?? item.max_nilai ?? 100);
    
    // Hitung posisi dan lebar bar dalam skala 0-100
    const barLeftPosition = `${minVal}%`;
    const barWidth = `${maxVal - minVal}%`;

    return (
      <View style={[styles.card, isEditing && styles.cardEditing]}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={styles.cardNo}>{index + 1}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={14} color={cfg.color} style={{ marginRight: 5 }} />
              <Text style={[styles.statusText, { color: cfg.color }]}>{item.status || item.nama_status}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.btnEdit, isEditing && { backgroundColor: '#fef3c7' }]} 
            onPress={() => isEditing ? handleCancelEdit() : handleEdit(index)}
          >
            <Ionicons name={isEditing ? "close" : "pencil"} size={15} color={isEditing ? "#92400e" : "#0284c7"} />
          </TouchableOpacity>
        </View>

        {/* Inline Edit Form */}
        {isEditing && (
          <View style={styles.editForm}>
            <View style={styles.editInputRow}>
              <View style={styles.editInputWrap}>
                <Text style={styles.editLabel}>Min</Text>
                <TextInput
                  style={styles.editInput}
                  value={editMin}
                  onChangeText={setEditMin}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={styles.editInputWrap}>
                <Text style={styles.editLabel}>Max</Text>
                <TextInput
                  style={styles.editInput}
                  value={editMax}
                  onChangeText={setEditMax}
                  keyboardType="decimal-pad"
                  placeholder="100"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <TouchableOpacity style={styles.btnApply} onPress={handleApplyEdit}>
                <Ionicons name="checkmark" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bar dengan skala 0-100 penuh */}
        <View style={styles.rangeRow}>
          <View style={styles.rangeCell}>
            <Text style={styles.rangeCellLabel}>Min</Text>
            <Text style={styles.rangeCellValue}>{parseFloat(minVal).toFixed(2)}</Text>
          </View>
          
          {/* Bar Container dengan skala 0-100 */}
          <View style={styles.fullRangeBarWrap}>
            <View style={[styles.fullRangeBarFill, { 
              left: barLeftPosition, 
              width: barWidth, 
              backgroundColor: cfg.bg, 
              borderColor: cfg.color 
            }]} />
            {/* Grid lines untuk referensi visual */}
            <View style={styles.gridLine25} />
            <View style={styles.gridLine50} />
            <View style={styles.gridLine75} />
          </View>
          
          <View style={styles.rangeCell}>
            <Text style={styles.rangeCellLabel}>Maks</Text>
            <Text style={styles.rangeCellValue}>{parseFloat(maxVal).toFixed(2)}</Text>
          </View>
        </View>
        
        {/* Scale labels */}
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>0</Text>
          <Text style={styles.scaleLabel}>25</Text>
          <Text style={styles.scaleLabel}>50</Text>
          <Text style={styles.scaleLabel}>75</Text>
          <Text style={styles.scaleLabel}>100</Text>
        </View>
        
        <Text style={styles.rangeLabel}>{parseFloat(minVal).toFixed(2)} – {parseFloat(maxVal).toFixed(2)}</Text>
        {item.isDefault && <Text style={styles.defaultHint}>* Belum disimpan (default: 0-100)</Text>}
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
          <Text style={styles.headerTitle}>Threshold CPL</Text>
          <Text style={styles.headerSubtitle}>Konfigurasi Ambang Batas Nilai</Text>
        </View>
      </View>

      {/* CONTROL BAR */}
      <View style={styles.controlBar}>
        {/* Pilih Prodi */}
        <TouchableOpacity style={styles.prodiSelector} onPress={() => setPickerVisible(true)}>
          <Ionicons name="business-outline" size={18} color={PRIMARY_BLUE} style={{ marginRight: 8 }} />
          <Text style={styles.prodiSelectorText} numberOfLines={1}>
            {selectedProdi ? selectedProdi.nama_prodi : 'Pilih Prodi'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#94A3B8" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Ionicons name="refresh" size={16} color={DANGER_COLOR} />
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAll}>
            <Ionicons name="save" size={16} color="#FFF" />
            <Text style={styles.saveBtnText}>Simpan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_DARK} />
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item, i) => (item.id || i).toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={loadAllThreshold}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="options-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Tidak ada data threshold.</Text>
            </View>
          }
        />
      )}

      {/* MODAL PICKER PRODI */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setPickerVisible(false)}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Pilih Program Studi</Text>
            <ScrollView>
              {prodiList.map((prodi) => (
                <TouchableOpacity key={prodi.id} style={[styles.pickerOption, selectedProdi?.id === prodi.id && styles.pickerOptionActive]} onPress={() => { setSelectedProdi(prodi); setPickerVisible(false); setEditingIndex(null); }}>
                  <Text style={[styles.pickerOptionText, selectedProdi?.id === prodi.id && styles.pickerOptionTextActive]}>
                    {prodi.kode_prodi} - {prodi.nama_prodi}
                  </Text>
                  {selectedProdi?.id === prodi.id && <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.pickerCloseBtn} onPress={() => setPickerVisible(false)}>
              <Text style={styles.pickerCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL KONFIRMASI RESET */}
      <Modal visible={resetConfirmVisible} animationType="fade" transparent>
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[styles.alertIconWrap, { backgroundColor: '#fff3cd' }]}>
              <Ionicons name="refresh-circle" size={50} color="#f59e0b" />
            </View>
            <Text style={styles.alertTitle}>Reset ke Default?</Text>
            <Text style={styles.alertMessage}>
              Semua threshold akan dikembalikan ke nilai default (0-100) untuk semua kategori. Perubahan harus disimpan untuk efek permanen.
            </Text>
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity 
                style={[styles.btnConfirm, { backgroundColor: '#f1f5f9', flex: 1 }]} 
                onPress={() => setResetConfirmVisible(false)}
              >
                <Text style={[styles.btnConfirmText, { color: '#64748B' }]}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnConfirm, { backgroundColor: DANGER_COLOR, flex: 1 }]} 
                onPress={confirmReset}
              >
                <Ionicons name="refresh" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={[styles.btnConfirmText, { color: '#FFF' }]}>Ya, Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL ALERT */}
      <Modal visible={alertConfig.visible} animationType="fade" transparent>
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[styles.alertIconWrap, { backgroundColor: alertConfig.type === 'success' ? '#e0f2f1' : '#ffebee' }]}>
              <Ionicons name={alertConfig.type === 'success' ? 'checkmark-circle' : 'warning'} size={45} color={alertConfig.type === 'success' ? '#00796b' : DANGER_COLOR} />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity style={[styles.btnAlertOK, { backgroundColor: alertConfig.type === 'success' ? PRIMARY_BLUE : DANGER_COLOR }]} onPress={() => setAlertConfig({ ...alertConfig, visible: false })}>
              <Text style={styles.btnAlertOKText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FA' },
  header: { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  backBtn: { padding: 8, marginRight: 12 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 2 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
  controlBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  prodiSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  prodiSelectorText: { flex: 1, fontFamily: 'Urbanist-Bold', fontSize: 13, color: PRIMARY_DARK },
  resetBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffebee', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, gap: 4, borderWidth: 1, borderColor: '#ffcdd2' },
  resetBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: DANGER_COLOR },
  saveBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_DARK, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, gap: 4 },
  saveBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#FFF' },
  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dbeafe', marginHorizontal: 20, marginBottom: 8, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#bfdbfe' },
  infoBannerText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#1d4ed8', flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cardEditing: { borderColor: PRIMARY_BLUE, borderWidth: 2, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardNo: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#94A3B8', width: 24 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontFamily: 'Urbanist-Bold', fontSize: 13 },
  actionBtns: { flexDirection: 'row', gap: 8 },
  btnEdit: { padding: 8, backgroundColor: '#e0f2fe', borderRadius: 10 },
  btnDelete: { padding: 8, backgroundColor: '#ffebee', borderRadius: 10 },
  
  // Edit Form Inline Styles
  editForm: { marginBottom: 12, backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  editInputRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  editInputWrap: { flex: 1 },
  editLabel: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#64748B', marginBottom: 4, textTransform: 'uppercase' },
  editInput: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'Urbanist-Bold', fontSize: 14, borderWidth: 1, borderColor: '#cbd5e1', color: PRIMARY_DARK },
  btnApply: { backgroundColor: PRIMARY_DARK, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  rangeCell: { alignItems: 'center', width: 55 },
  rangeCellLabel: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#94A3B8' },
  rangeCellValue: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK },
  
  // Bar dengan skala 0-100 penuh
  fullRangeBarWrap: { 
    flex: 1, 
    height: 16, 
    backgroundColor: '#f1f5f9', 
    borderRadius: 8, 
    overflow: 'visible',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  fullRangeBarFill: { 
    position: 'absolute',
    height: '100%', 
    borderRadius: 6, 
    borderWidth: 2,
    top: -1,
    bottom: -1
  },
  gridLine25: { position: 'absolute', left: '25%', top: 0, bottom: 0, width: 1, backgroundColor: '#cbd5e1', opacity: 0.3 },
  gridLine50: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: '#cbd5e1', opacity: 0.5 },
  gridLine75: { position: 'absolute', left: '75%', top: 0, bottom: 0, width: 1, backgroundColor: '#cbd5e1', opacity: 0.3 },
  
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 60 },
  scaleLabel: { fontFamily: 'Urbanist-Regular', fontSize: 10, color: '#94A3B8' },
  
  rangeLabel: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4 },
  defaultHint: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#94A3B8', fontStyle: 'italic', marginTop: 4 },
  emptyWrap: { alignItems: 'center', paddingTop: 50 },
  emptyText: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 12 },
  
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  pickerBox: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, maxHeight: '60%' },
  pickerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 15 },
  pickerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  pickerOptionActive: { backgroundColor: '#f0f9ff' },
  pickerOptionText: { fontFamily: 'Urbanist-Medium', fontSize: 15, color: '#212121' },
  pickerOptionTextActive: { color: PRIMARY_BLUE, fontFamily: 'Urbanist-Bold' },
  pickerCloseBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 30, backgroundColor: '#ffebee', borderRadius: 16, alignSelf: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  pickerCloseText: { color: DANGER_COLOR, fontFamily: 'Urbanist-Bold', fontSize: 14 },
  alertOverlay: { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '80%', alignItems: 'center', elevation: 20 },
  alertIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  btnAlertOK: { borderRadius: 20, paddingVertical: 14, paddingHorizontal: 30, alignItems: 'center', elevation: 3 },
  btnAlertOKText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 16 },
  
  // Konfirmasi Reset Styles
  confirmButtonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  btnConfirm: { borderRadius: 18, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', elevation: 2 },
  btnConfirmText: { fontFamily: 'Urbanist-Bold', fontSize: 15 },
});