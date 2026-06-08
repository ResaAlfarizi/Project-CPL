import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity,
  Modal, FlatList, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ProdiAPI, ThresholdAPI } from '../api';
import { Colors, Radius, Shadows } from '../theme';

const DEFAULT_THRESHOLDS = [
  { nama_status: 'Excellence',    nilai_min: 85,    nilai_max: 100,   color: '#27ae60', bg: '#eafaf1', icon: '🏆' },
  { nama_status: 'Satisfactory',  nilai_min: 70,    nilai_max: 84.99, color: '#2980b9', bg: '#ebf5fb', icon: '✅' },
  { nama_status: 'Competent',     nilai_min: 55,    nilai_max: 69.99, color: '#f39c12', bg: '#fef9e7', icon: '📊' },
  { nama_status: 'Developing',    nilai_min: 40,    nilai_max: 54.99, color: '#e67e22', bg: '#fdf2e9', icon: '📈' },
  { nama_status: 'Not Competent', nilai_min: 0,     nilai_max: 39.99, color: '#e74c3c', bg: '#fdecea', icon: '❌' },
];

export default function ThresholdScreen() {
  const [prodi, setProdi] = useState([]);
  const [selectedProdi, setSelectedProdi] = useState(null);
  const [allThresholds, setAllThresholds] = useState([]);
  const [thresholds, setThresholds] = useState([]);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dropdown State
  const [pickerVisible, setPickerVisible] = useState(false);

  const loadData = async () => {
    try {
      const [prodiData, threshData] = await Promise.all([
        ProdiAPI.list(), ThresholdAPI.listAll()
      ]);
      setProdi(prodiData || []);
      setAllThresholds(threshData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!selectedProdi) return;
    const existing = allThresholds.filter(t => t.prodi_id === selectedProdi.id);
    if (existing.length > 0) {
      setThresholds(existing.map(t => ({ ...t, nilai_min: String(t.nilai_min), nilai_max: String(t.nilai_max) })));
    } else {
      setThresholds(DEFAULT_THRESHOLDS.map(t => ({ ...t, nilai_min: String(t.nilai_min), nilai_max: String(t.nilai_max) })));
    }
  }, [selectedProdi, allThresholds]);

  const handleChange = (idx, field, value) => {
    setThresholds(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS.map(t => ({ ...t, nilai_min: String(t.nilai_min), nilai_max: String(t.nilai_max) })));
    Alert.alert('Reset', 'Threshold direset ke nilai default.');
  };

  const validate = () => {
    for (const t of thresholds) {
      const min = parseFloat(t.nilai_min);
      const max = parseFloat(t.nilai_max);
      if (isNaN(min) || isNaN(max)) return `${t.nama_status}: Nilai tidak valid`;
      if (min > max) return `${t.nama_status}: nilai min tidak boleh > nilai max`;
      if (min < 0 || max > 100) return `${t.nama_status}: nilai harus antara 0–100`;
    }
    return null;
  };

  const handleSave = async () => {
    if (!selectedProdi) { Alert.alert('Peringatan', 'Pilih program studi dulu.'); return; }
    const err = validate();
    if (err) { Alert.alert('Error', err); return; }
    
    setSaving(true);
    try {
      const payload = thresholds.map(t => ({
        ...t,
        nilai_min: parseFloat(t.nilai_min),
        nilai_max: parseFloat(t.nilai_max)
      }));
      await ThresholdAPI.save(selectedProdi.id, payload);
      Alert.alert('Sukses', 'Threshold berhasil disimpan!');
      loadData();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.blue} />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            ℹ️ Threshold menentukan status pencapaian CPL mahasiswa berdasarkan nilai akhir. Setiap prodi dapat memiliki threshold berbeda.
          </Text>
        </View>

        <Text style={styles.label}>Pilih Program Studi:</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setPickerVisible(true)}>
          <Text style={styles.dropdownText}>
            {selectedProdi ? `${selectedProdi.kode_prodi} - ${selectedProdi.nama_prodi}` : '— Pilih Prodi —'}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        {selectedProdi && (
          <View style={{ marginTop: 20 }}>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnReset} onPress={handleReset}>
                <Text style={styles.btnResetText}>🔄 Reset Default</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="white" /> : <Text style={styles.btnSaveText}>💾 Simpan</Text>}
              </TouchableOpacity>
            </View>

            {thresholds.map((t, idx) => {
              const def = DEFAULT_THRESHOLDS.find(d => d.nama_status === t.nama_status) || DEFAULT_THRESHOLDS[idx] || {};
              return (
                <View key={t.nama_status || idx} style={[styles.card, { backgroundColor: def.bg, borderColor: def.color }]}>
                  <View style={styles.cardHeader}>
                    <Text style={{ fontSize: 24 }}>{def.icon}</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.cardTitle, { color: def.color }]}>{t.nama_status}</Text>
                      <Text style={styles.cardSubtitle}>Status pencapaian CPL</Text>
                    </View>
                  </View>
                  <View style={styles.inputRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Nilai Min</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={t.nilai_min}
                        onChangeText={val => handleChange(idx, 'nilai_min', val)}
                      />
                    </View>
                    <View style={{ width: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Nilai Max</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={t.nilai_max}
                        onChangeText={val => handleChange(idx, 'nilai_max', val)}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Prodi Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Program Studi</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text style={styles.modalClose}>Tutup</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={prodi}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedProdi(item);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{item.kode_prodi} - {item.nama_prodi}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.screenBg },
  content: { padding: 16 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15, fontFamily: 'Urbanist_500Medium', color: Colors.textSecondary },
  infoBanner: { backgroundColor: '#f0f4f9', padding: 14, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#D8DFE9' },
  infoText: { fontSize: 13, color: '#4b5563', lineHeight: 20 },
  label: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', marginBottom: 8, color: Colors.eerieBlack },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, ...Shadows.sm },
  dropdownText: { fontSize: 14, fontFamily: 'Urbanist_500Medium' },
  dropdownIcon: { fontSize: 12, color: 'gray' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 10 },
  btnReset: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', backgroundColor: 'white' },
  btnResetText: { fontFamily: 'Urbanist_600SemiBold', color: Colors.eerieBlack },
  btnSave: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: Colors.blue, alignItems: 'center' },
  btnSaveText: { fontFamily: 'Urbanist_700Bold', color: 'white' },
  card: { padding: 16, borderRadius: 12, borderWidth: 1.5, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontFamily: 'Urbanist_800ExtraBold' },
  cardSubtitle: { fontSize: 12, color: '#6b7280' },
  inputRow: { flexDirection: 'row' },
  inputLabel: { fontSize: 12, fontFamily: 'Urbanist_500Medium', marginBottom: 4, color: '#4b5563' },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontFamily: 'Urbanist_500Medium' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontFamily: 'Urbanist_700Bold' },
  modalClose: { color: 'red', fontWeight: 'bold' },
  pickerItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  pickerItemText: { fontSize: 14, fontFamily: 'Urbanist_500Medium' },
});
