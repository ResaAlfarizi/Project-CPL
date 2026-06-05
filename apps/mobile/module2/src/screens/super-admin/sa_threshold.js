import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, 
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback, 
  Keyboard, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { thresholdApi, prodiApi } from '../../services/api';

const THEME_COLOR = '#cdddf4'; 
const PRIMARY_DARK = '#24354a';
const PRIMARY_BLUE = '#577590';
const DANGER_COLOR = '#c62828';

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
  const [pickerVisible, setPickerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Form state
  const [formStatus, setFormStatus] = useState('');
  const [formMin, setFormMin] = useState('');
  const [formMax, setFormMax] = useState('');

  const [alertConfig, setAlertConfig] = useState({ visible: false, type: '', title: '', message: '' });

  useEffect(() => {
    loadProdi();
  }, []);

  useEffect(() => {
    if (selectedProdi) loadThreshold(selectedProdi.id);
  }, [selectedProdi]);

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

  const loadThreshold = async (prodiId) => {
    setIsLoading(true);
    try {
      const res = await thresholdApi.getByProdi(prodiId);
      const data = res?.data || [];
      setThresholdData(data);
    } catch (err) {
      // Tampilkan default jika belum ada konfigurasi
      setThresholdData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type, title, message) => setAlertConfig({ visible: true, type, title, message });

  const handleSave = async () => {
    if (!formStatus || !formMin || !formMax || !selectedProdi) {
      showAlert('error', 'Data Tidak Lengkap', 'Harap isi semua kolom.');
      return;
    }
    const min = parseFloat(formMin);
    const max = parseFloat(formMax);
    if (isNaN(min) || isNaN(max) || min < 0 || max > 100 || min >= max) {
      showAlert('error', 'Nilai Tidak Valid', 'Nilai harus antara 0-100 dan min < maks.');
      return;
    }
    try {
      const payload = { 
        prodi_id: selectedProdi.id, 
        nama_status: formStatus,
        nilai_min: min,
        nilai_max: max
      };      
      if (editItem) {
        await thresholdApi.update(editItem.id, payload);
      } else {
        await thresholdApi.create(payload);
      }
      setModalVisible(false);
      resetForm();
      loadThreshold(selectedProdi.id);
      setTimeout(() => showAlert('success', 'Berhasil!', 'Threshold berhasil disimpan.'), 300);
    } catch (err) {
      showAlert('error', 'Gagal Simpan', err.message || 'Terjadi kesalahan server.');
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Hapus Threshold', `Hapus threshold "${item.status}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya, Hapus', style: 'destructive',
        onPress: async () => {
          try {
            await thresholdApi.delete(item.id);
            loadThreshold(selectedProdi.id);
          } catch (err) {
            showAlert('error', 'Gagal', err.message);
          }
        }
      }
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset Default', 'Kembalikan ke pengaturan threshold standar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya, Reset',
        onPress: async () => {
          try {
            await thresholdApi.resetDefault(selectedProdi.id);
            loadThreshold(selectedProdi.id);
            showAlert('success', 'Direset!', 'Threshold berhasil dikembalikan ke default.');
          } catch (err) {
            showAlert('error', 'Gagal', err.message);
          }
        }
      }
    ]);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormStatus(item.status);
    setFormMin(String(item.nilai_min ?? item.min_nilai ?? ''));
    setFormMax(String(item.nilai_max ?? item.max_nilai ?? ''));
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditItem(null);
    setFormStatus('');
    setFormMin('');
    setFormMax('');
  };

  // Tampilan data (gabungan DB + default jika kosong)
  const displayData = thresholdData.length > 0 ? thresholdData : DEFAULT_THRESHOLDS.map((d, i) => ({ ...d, id: `default-${i}`, isDefault: true, min_nilai: d.min, max_nilai: d.max }));

  const renderItem = ({ item, index }) => {
    const cfg = PREDIKAT_CONFIG[item.status] || { color: '#64748B', bg: '#f1f5f9', icon: 'ellipse' };
    const minVal = item.min_nilai ?? item.min ?? 0;
    const maxVal = item.max_nilai ?? item.max ?? 100;
    const rangeWidth = `${maxVal - minVal}%`;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={styles.cardNo}>{index + 1}</Text>
            <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={14} color={cfg.color} style={{ marginRight: 5 }} />
              <Text style={[styles.statusText, { color: cfg.color }]}>{item.status}</Text>
            </View>
          </View>
          {!item.isDefault && (
            <View style={styles.actionBtns}>
              <TouchableOpacity style={styles.btnEdit} onPress={() => openEditModal(item)}>
                <Ionicons name="pencil" size={15} color="#0284c7" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item)}>
                <Ionicons name="trash" size={15} color={DANGER_COLOR} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.rangeRow}>
          <View style={styles.rangeCell}>
            <Text style={styles.rangeCellLabel}>Min</Text>
            <Text style={styles.rangeCellValue}>{parseFloat(minVal).toFixed(2)}</Text>
          </View>
          <View style={styles.rangeBarWrap}>
            <View style={[styles.rangeBarFill, { width: rangeWidth, backgroundColor: cfg.bg, borderColor: cfg.color }]} />
          </View>
          <View style={styles.rangeCell}>
            <Text style={styles.rangeCellLabel}>Maks</Text>
            <Text style={styles.rangeCellValue}>{parseFloat(maxVal).toFixed(2)}</Text>
          </View>
        </View>
        <Text style={styles.rangeLabel}>{parseFloat(minVal).toFixed(2)} – {parseFloat(maxVal).toFixed(2)}</Text>
        {item.isDefault && <Text style={styles.defaultHint}>* Tampilan default (belum disimpan)</Text>}
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
          <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
            <Ionicons name="add" size={16} color={PRIMARY_DARK} />
            <Text style={styles.addBtnText}>Tambah</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* INFO BANNER */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={18} color="#1d4ed8" style={{ marginRight: 8 }} />
        <Text style={styles.infoBannerText}>Nilai harus 0–100 dan antar rentang tidak boleh tumpang tindih (overlapping).</Text>
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
          onRefresh={() => selectedProdi && loadThreshold(selectedProdi.id)}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="options-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Belum ada konfigurasi threshold.</Text>
            </View>
          }
        />
      )}

      {/* MODAL FORM */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editItem ? 'Edit Threshold' : 'Tambah Threshold'}</Text>

            {/* Pilih Status/Predikat */}
            <Text style={styles.fieldLabel}>Status / Predikat</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {Object.keys(PREDIKAT_CONFIG).map((s) => {
                const cfg = PREDIKAT_CONFIG[s];
                return (
                  <TouchableOpacity 
                    key={s} 
                    style={[styles.predikatBtn, { backgroundColor: formStatus === s ? cfg.bg : '#f1f5f9', borderColor: formStatus === s ? cfg.color : '#e2e8f0' }]} 
                    onPress={() => setFormStatus(s)}
                  >
                    <Text style={[styles.predikatBtnText, { color: formStatus === s ? cfg.color : '#94A3B8' }]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.fieldLabel}>Nilai Minimum</Text>
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.input} 
                placeholder="Contoh: 70" 
                placeholderTextColor="#94A3B8" 
                value={formMin} 
                onChangeText={setFormMin} 
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.fieldLabel}>Nilai Maksimum</Text>
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.input} 
                placeholder="Contoh: 84.99" 
                placeholderTextColor="#94A3B8" 
                value={formMax} 
                onChangeText={setFormMax} 
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => { setModalVisible(false); resetForm(); }}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleSave}>
                <Ionicons name="save" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.btnSubmitText}>Simpan Threshold</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL PICKER PRODI */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setPickerVisible(false)}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Pilih Program Studi</Text>
            <ScrollView>
              {prodiList.map((prodi) => (
                <TouchableOpacity key={prodi.id} style={[styles.pickerOption, selectedProdi?.id === prodi.id && styles.pickerOptionActive]} onPress={() => { setSelectedProdi(prodi); setPickerVisible(false); }}>
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
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME_COLOR, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, gap: 4 },
  addBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: PRIMARY_DARK },
  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dbeafe', marginHorizontal: 20, marginBottom: 8, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#bfdbfe' },
  infoBannerText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#1d4ed8', flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardNo: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#94A3B8', width: 24 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontFamily: 'Urbanist-Bold', fontSize: 13 },
  actionBtns: { flexDirection: 'row', gap: 8 },
  btnEdit: { padding: 8, backgroundColor: '#e0f2fe', borderRadius: 10 },
  btnDelete: { padding: 8, backgroundColor: '#ffebee', borderRadius: 10 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rangeCell: { alignItems: 'center', width: 55 },
  rangeCellLabel: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#94A3B8' },
  rangeCellValue: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK },
  rangeBarWrap: { flex: 1, height: 12, backgroundColor: '#f1f5f9', borderRadius: 6, overflow: 'hidden' },
  rangeBarFill: { height: '100%', borderRadius: 6, borderWidth: 1 },
  rangeLabel: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 8 },
  defaultHint: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#94A3B8', fontStyle: 'italic', marginTop: 4 },
  emptyWrap: { alignItems: 'center', paddingTop: 50 },
  emptyText: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitle: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 20 },
  fieldLabel: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  predikatBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, borderWidth: 1.5, marginRight: 10 },
  predikatBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 12 },
  inputRow: { marginBottom: 16 },
  input: { backgroundColor: '#f8fafc', borderRadius: 18, paddingHorizontal: 15, paddingVertical: 14, fontFamily: 'Urbanist-Regular', fontSize: 15, borderWidth: 1, borderColor: '#e2e8f0', color: '#212121' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnCancel: { flex: 1, backgroundColor: '#ffebee', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelText: { color: DANGER_COLOR, fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmit: { flex: 1, backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnSubmitText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
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
});
