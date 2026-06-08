import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet,
  Modal, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ProdiAPI } from '../api';
import { Colors, Radius, Shadows } from '../theme';
import SearchBar from '../components/SearchBar';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';

const JENJANG_VARIANT = { D3: 'gray', S1: 'blue', S2: 'green', S3: 'yellow' };

export default function ProdiListScreen({ navigation }) {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [activeJenjang, setActiveJenjang] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // CRUD State
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: null, kode_prodi: '', nama_prodi: '', jenjang: 'S1' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await ProdiAPI.list();
      setList(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSave = async () => {
    if (!form.kode_prodi || !form.nama_prodi) {
      Alert.alert('Error', 'Kode dan Nama Prodi wajib diisi');
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await ProdiAPI.update(form.id, form);
      } else {
        await ProdiAPI.create(form);
      }
      setModalVisible(false);
      load();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Hapus Prodi', `Yakin ingin menghapus ${item.nama_prodi}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
          try {
            await ProdiAPI.delete(item.id);
            load();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
      }}
    ]);
  };

  const filtered = list.filter((p) => {
    const matchesSearch = p.kode_prodi.toLowerCase().includes(search.toLowerCase()) ||
                          p.nama_prodi.toLowerCase().includes(search.toLowerCase());
    const matchesJenjang = activeJenjang ? p.jenjang === activeJenjang : true;
    return matchesSearch && matchesJenjang;
  });

  // Jenjang summary
  const jenjangCounts = ['D3', 'S1', 'S2', 'S3'].map((j) => ({
    label: j,
    count: list.filter((p) => p.jenjang === j).length,
  }));

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={() => navigation.navigate('CPLList', { prodi_id: item.id, prodi_name: item.nama_prodi, kode_prodi: item.kode_prodi })}
    >
      <View style={styles.rowLeft}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{item.nama_prodi}</Text>
          <View style={styles.rowMeta}>
            <Badge variant="blue" mono>{item.kode_prodi}</Badge>
            <Badge variant={JENJANG_VARIANT[item.jenjang] || 'gray'}>{item.jenjang}</Badge>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => { setForm(item); setModalVisible(true); }}>
          <Text style={{ fontSize: 18 }}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Text style={{ fontSize: 18 }}>🗑️</Text>
        </TouchableOpacity>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* Jenjang Summary */}
      <View style={styles.summaryRow}>
        {jenjangCounts.map((j) => {
          const isActive = activeJenjang === j.label;
          return (
            <TouchableOpacity 
              key={j.label} 
              style={[styles.summaryChip, isActive && styles.summaryChipActive]}
              activeOpacity={0.7}
              onPress={() => setActiveJenjang(isActive ? null : j.label)}
            >
              <Text style={[styles.summaryValue, isActive && styles.summaryValueActive]}>{j.count}</Text>
              <Text style={[styles.summaryLabel, isActive && styles.summaryLabelActive]}>{j.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cari prodi..."
        />
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>📋 {filtered.length} dari {list.length} prodi</Text>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="🎓"
            title="Belum ada Program Studi"
            message="Data program studi belum tersedia"
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => { setForm({ id: null, kode_prodi: '', nama_prodi: '', jenjang: 'S1' }); setModalVisible(true); }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{form.id ? 'Edit Prodi' : 'Tambah Prodi'}</Text>

            <Text style={styles.inputLabel}>Kode Program Studi <Text style={styles.required}>*</Text></Text>
            <Text style={styles.inputHint}>Kode singkat prodi, contoh: IF, DKV, TL</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: IF"
              value={form.kode_prodi}
              onChangeText={t => setForm({...form, kode_prodi: t})}
            />

            <Text style={styles.inputLabel}>Nama Program Studi <Text style={styles.required}>*</Text></Text>
            <Text style={styles.inputHint}>Nama lengkap program studi</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Teknik Informatika"
              value={form.nama_prodi}
              onChangeText={t => setForm({...form, nama_prodi: t})}
            />

            <Text style={styles.inputLabel}>Jenjang <Text style={styles.required}>*</Text></Text>
            <Text style={styles.inputHint}>Tingkat pendidikan: D3, S1, S2, atau S3</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: S1"
              value={form.jenjang}
              onChangeText={t => setForm({...form, jenjang: t})}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="white" /> : <Text style={{color: 'white', fontWeight: 'bold'}}>Simpan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  summaryChip: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
    ...Shadows.sm,
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: 'Urbanist_800ExtraBold',
    color: Colors.eerieBlack,
  },
  summaryValueActive: {
    color: Colors.white,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  summaryLabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  summaryChipActive: {
    backgroundColor: Colors.eerieBlack,
    borderColor: Colors.eerieBlack,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 13,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.aliceBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 13,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.textSecondary,
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.eerieBlack,
    marginBottom: 6,
  },
  rowMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textMuted,
    fontWeight: '300',
    marginLeft: 8,
  },
  separator: {
    height: 10,
  },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#0066FF',
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.md, zIndex: 10
  },
  fabText: { color: 'white', fontSize: 32, lineHeight: 36, fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontFamily: 'Urbanist_700Bold', marginBottom: 16 },
  inputLabel: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: '#111827', marginBottom: 2 },
  inputHint: { fontSize: 11, fontFamily: 'Urbanist_400Regular', color: '#9ca3af', marginBottom: 6 },
  required: { color: '#e53e3e' },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 14, fontFamily: 'Urbanist_500Medium', fontSize: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  btnCancel: { padding: 10 },
  btnSave: { backgroundColor: '#0066FF', padding: 10, borderRadius: 8, paddingHorizontal: 16, minWidth: 80, alignItems: 'center' },
});
