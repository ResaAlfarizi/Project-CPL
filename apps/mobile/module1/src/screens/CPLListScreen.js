import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet,
  Modal, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CPLAPI } from '../api';
import { Colors, Radius, Shadows } from '../theme';
import SearchBar from '../components/SearchBar';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';

export default function CPLListScreen({ route, navigation }) {
  const { prodi_id, prodi_name, kode_prodi } = route.params || {};
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(null); // 'aktif' | 'nonaktif' | null
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // CRUD State
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: null, kode_cpl: '', deskripsi: '', prodi_id: prodi_id });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await CPLAPI.list();
      // Filter by prodi_id if provided
      const filtered = prodi_id ? (data || []).filter((c) => c.prodi_id === prodi_id) : (data || []);
      setList(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [prodi_id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSave = async () => {
    if (!form.kode_cpl || !form.deskripsi) {
      Alert.alert('Error', 'Kode dan Deskripsi CPL wajib diisi');
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await CPLAPI.update(form.id, form);
      } else {
        await CPLAPI.create({ ...form, prodi_id });
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
    Alert.alert('Hapus CPL', `Yakin ingin menghapus ${item.kode_cpl}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
          try {
            await CPLAPI.delete(item.id);
            load();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
      }}
    ]);
  };

  const searched = list.filter((c) => {
    const matchesSearch = c.kode_cpl.toLowerCase().includes(search.toLowerCase()) ||
                          c.deskripsi.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'aktif' ? c.is_active :
                          activeFilter === 'nonaktif' ? !c.is_active : true;
    return matchesSearch && matchesFilter;
  });

  const activeCount = list.filter((c) => c.is_active).length;
  const inactiveCount = list.filter((c) => !c.is_active).length;

  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <View style={styles.rowHeaderLeft}>
          <Badge variant="blue" mono>{item.kode_cpl}</Badge>
          <Badge variant={item.is_active ? 'green' : 'gray'}>
            {item.is_active ? '✅ Aktif' : '⭕ Nonaktif'}
          </Badge>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => { setForm(item); setModalVisible(true); }}>
            <Text style={{ fontSize: 16 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Text style={{ fontSize: 16 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.deskripsi}>{item.deskripsi}</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Prodi Info Banner */}
      {prodi_name && (
        <View style={styles.prodiBanner}>
          <Text style={styles.prodiBannerLabel}>Program Studi</Text>
          <Text style={styles.prodiBannerName}>{kode_prodi} — {prodi_name}</Text>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summaryRow}>
        <TouchableOpacity
          style={[styles.summaryChip, activeFilter === 'aktif' ? styles.summaryChipActive : { backgroundColor: '#f0f7ee' }]}
          activeOpacity={0.7}
          onPress={() => setActiveFilter(activeFilter === 'aktif' ? null : 'aktif')}
        >
          <Text style={[styles.summaryValue, activeFilter === 'aktif' && styles.summaryValueActive]}>{activeCount}</Text>
          <Text style={[styles.summaryLabel, activeFilter === 'aktif' && styles.summaryLabelActive]}>Aktif</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.summaryChip, activeFilter === 'nonaktif' ? styles.summaryChipActive : { backgroundColor: '#f0f4f9' }]}
          activeOpacity={0.7}
          onPress={() => setActiveFilter(activeFilter === 'nonaktif' ? null : 'nonaktif')}
        >
          <Text style={[styles.summaryValue, activeFilter === 'nonaktif' && styles.summaryValueActive]}>{inactiveCount}</Text>
          <Text style={[styles.summaryLabel, activeFilter === 'nonaktif' && styles.summaryLabelActive]}>Nonaktif</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.summaryChip, activeFilter === null ? styles.summaryChipActive : { backgroundColor: '#fef6ed' }]}
          activeOpacity={0.7}
          onPress={() => setActiveFilter(null)}
        >
          <Text style={[styles.summaryValue, activeFilter === null && styles.summaryValueActive]}>{list.length}</Text>
          <Text style={[styles.summaryLabel, activeFilter === null && styles.summaryLabelActive]}>Total</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Cari CPL..." />
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>🎯 {searched.length} CPL ditemukan</Text>
      </View>

      {/* Navigate to MK */}
      {prodi_id && (
        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MKList', { prodi_id, prodi_name, kode_prodi })}
        >
          <Text style={styles.navButtonText}>📚 Lihat Daftar Mata Kuliah →</Text>
        </TouchableOpacity>
      )}

      {/* List */}
      <FlatList
        data={searched}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={searched.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="🎯"
            title="Belum ada CPL"
            message="Belum ada Capaian Pembelajaran Lulusan untuk prodi ini"
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {prodi_id && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => { setForm({ id: null, kode_cpl: '', deskripsi: '', prodi_id }); setModalVisible(true); }}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{form.id ? 'Edit CPL' : 'Tambah CPL'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Kode CPL (Cth: CPL-01)"
              value={form.kode_cpl}
              onChangeText={t => setForm({...form, kode_cpl: t})}
            />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Deskripsi CPL"
              value={form.deskripsi}
              multiline
              onChangeText={t => setForm({...form, deskripsi: t})}
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
  prodiBanner: {
    backgroundColor: Colors.eerieBlack,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  prodiBannerLabel: {
    fontSize: 11,
    fontFamily: 'Urbanist_500Medium',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  prodiBannerName: {
    fontSize: 15,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.white,
    marginTop: 2,
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
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: 'Urbanist_800ExtraBold',
    color: Colors.eerieBlack,
  },
  summaryValueActive: {
    color: Colors.white,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: 'Urbanist_500Medium',
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
    paddingVertical: 10,
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
  navButton: {
    backgroundColor: Colors.vanilla,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: Radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.eerieBlack,
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
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowHeaderLeft: {
    flexDirection: 'row',
    gap: 6,
  },
  rowNumber: {
    fontSize: 12,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.textMuted,
  },
  deskripsi: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: '#4b5563',
    lineHeight: 20,
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
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 12, fontFamily: 'Urbanist_500Medium' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  btnCancel: { padding: 10 },
  btnSave: { backgroundColor: '#0066FF', padding: 10, borderRadius: 8, paddingHorizontal: 16, minWidth: 80, alignItems: 'center' },
});
