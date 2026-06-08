import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet,
  Modal, TextInput, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MKAPI, ProdiAPI, MkCplAPI } from '../api';
import { Colors, Radius, Shadows } from '../theme';
import SearchBar from '../components/SearchBar';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';

const semColor = (s) => s <= 2 ? 'blue' : s <= 4 ? 'green' : s <= 6 ? 'yellow' : 'gray';

export default function MKListScreen({ route, navigation }) {
  const { prodi_id, prodi_name, kode_prodi } = route.params || {};
  const [list, setList] = useState([]);
  const [prodi, setProdi] = useState([]);
  const [mkcpl, setMkcpl] = useState([]);
  const [search, setSearch] = useState('');
  const [activeSemester, setActiveSemester] = useState(null);
  const [activeProdi, setActiveProdi] = useState(null); // filter by prodi saat view global
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ id: null, kode_mk: '', nama_mk: '', sks: '3', semester: '1', prodi_id: prodi_id || null });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [mkData, prodiData, mkcplData] = await Promise.all([
        MKAPI.list(), ProdiAPI.list(), MkCplAPI.listAll(),
      ]);
      const allMk = mkData || [];
      setList(prodi_id ? allMk.filter((m) => m.prodi_id === prodi_id) : allMk);
      setProdi(prodiData || []);
      setMkcpl(mkcplData || []);
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

  const openAdd = () => {
    setForm({ id: null, kode_mk: '', nama_mk: '', sks: '3', semester: '1', prodi_id: prodi_id || null });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.kode_mk.trim() || !form.nama_mk.trim()) {
      Alert.alert('Error', 'Kode dan Nama MK wajib diisi');
      return;
    }
    if (!form.prodi_id) {
      Alert.alert('Error', 'Pilih Program Studi terlebih dahulu');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, sks: parseInt(form.sks) || 0, semester: parseInt(form.semester) || 0 };
      if (form.id) {
        await MKAPI.update(form.id, payload);
      } else {
        await MKAPI.create(payload);
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
    Alert.alert('Hapus MK', `Yakin ingin menghapus ${item.nama_mk}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
          try { await MKAPI.delete(item.id); load(); }
          catch (e) { Alert.alert('Error', e.message); }
      }}
    ]);
  };

  const searched = list.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch = m.kode_mk.toLowerCase().includes(q) || m.nama_mk.toLowerCase().includes(q);
    // Filter semester dipakai saat di dalam prodi, filter prodi saat view global
    const matchesSem = activeSemester ? m.semester === activeSemester : true;
    const matchesProdi = activeProdi ? String(m.prodi_id) === String(activeProdi) : true;
    return matchesSearch && matchesSem && matchesProdi;
  });

  const getMkCplCount = (mkId) => mkcpl.filter((m) => m.mk_id === mkId).length;
  const getProdiCode = (id) => prodi.find((p) => p.id === id)?.kode_prodi || '—';
  const semesters = [...new Set(list.map((m) => m.semester))].sort((a, b) => a - b);
  const selectedProdiName = prodi.find(p => p.id === form.prodi_id)?.nama_prodi || '';

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={() => navigation.navigate('MKDetail', {
        mk: item,
        prodi_name: prodi.find((p) => p.id === item.prodi_id)?.nama_prodi || '—',
        kode_prodi: getProdiCode(item.prodi_id),
      })}
    >
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{item.nama_mk}</Text>
          <View style={styles.rowMeta}>
            <Badge variant="blue" mono>{item.kode_mk}</Badge>
            <Badge variant="gray">{item.sks} SKS</Badge>
            <Badge variant={semColor(item.semester)}>Sem {item.semester}</Badge>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => {
            setForm({ ...item, sks: String(item.sks), semester: String(item.semester) });
            setModalVisible(true);
          }}>
            <Text style={{ fontSize: 16 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Text style={{ fontSize: 16 }}>🗑️</Text>
          </TouchableOpacity>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
      <View style={styles.rowBottom}>
        <Text style={styles.prodiLabel}>{getProdiCode(item.prodi_id)}</Text>
        {getMkCplCount(item.id) > 0
          ? <Badge variant="green">{getMkCplCount(item.id)} CPL</Badge>
          : <Badge variant="red">Belum dipetakan</Badge>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {prodi_name && (
        <View style={styles.prodiBanner}>
          <Text style={styles.prodiBannerLabel}>Program Studi</Text>
          <Text style={styles.prodiBannerName}>{kode_prodi} — {prodi_name}</Text>
        </View>
      )}

      {/* Filter Prodi — tampil saat view global (tanpa prodi_id dari params) */}
      {!prodi_id && prodi.length > 0 && (
        <View style={styles.prodiFilterRow}>
          {prodi.map((p) => {
            const isActive = String(activeProdi) === String(p.id);
            const count = list.filter(m => String(m.prodi_id) === String(p.id)).length;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.prodiFilterChip, isActive && styles.prodiFilterChipActive]}
                activeOpacity={0.7}
                onPress={() => setActiveProdi(isActive ? null : p.id)}>
                <Text style={[styles.prodiFilterLabel, isActive && styles.prodiFilterLabelActive]}>
                  {p.kode_prodi}
                </Text>
                <Text style={[styles.prodiFilterCount, isActive && styles.prodiFilterCountActive]}>
                  {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Filter Semester — tampil saat di dalam prodi tertentu */}
      {prodi_id && semesters.length > 0 && (
        <View style={styles.semRow}>
          {semesters.map((s) => {
            const isActive = activeSemester === s;
            return (
              <TouchableOpacity key={s} style={[styles.semChip, isActive && styles.semChipActive]}
                activeOpacity={0.7} onPress={() => setActiveSemester(isActive ? null : s)}>
                <Text style={[styles.semChipLabel, isActive && styles.semChipLabelActive]}>Sem {s}</Text>
                <Text style={[styles.semChipValue, isActive && styles.semChipValueActive]}>
                  {list.filter((m) => m.semester === s).length}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Cari mata kuliah..." />
      </View>
      <View style={styles.countRow}>
        <Text style={styles.countText}>📚 {searched.length} dari {list.length} mata kuliah</Text>
      </View>

      <FlatList
        data={searched}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={searched.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="📚" title="Belum ada Mata Kuliah"
            message="Tekan tombol + untuk menambah mata kuliah baru" />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* FAB - selalu tampil */}
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{form.id ? 'Edit MK' : 'Tambah MK'}</Text>

            {/* Prodi picker — hanya muncul jika tidak ada prodi_id dari navigasi */}
            {!prodi_id && (
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.inputLabel}>Program Studi <Text style={styles.required}>*</Text></Text>
                <Text style={styles.inputHint}>Pilih prodi pemilik mata kuliah ini</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 6 }}>
                    {prodi.map(p => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.prodiChip, form.prodi_id === p.id && styles.prodiChipActive]}
                        onPress={() => setForm({ ...form, prodi_id: p.id })}>
                        <Text style={[styles.prodiChipText, form.prodi_id === p.id && styles.prodiChipTextActive]}>
                          {p.kode_prodi}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                {form.prodi_id
                  ? <Text style={styles.prodiSelected}>✅ {selectedProdiName}</Text>
                  : <Text style={styles.prodiHint}>Belum ada prodi dipilih</Text>}
              </View>
            )}

            <Text style={styles.inputLabel}>Kode Mata Kuliah <Text style={styles.required}>*</Text></Text>
            <Text style={styles.inputHint}>Kode unik MK sesuai kurikulum, contoh: IF301</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: IF301"
              value={form.kode_mk}
              onChangeText={t => setForm({ ...form, kode_mk: t })}
            />

            <Text style={styles.inputLabel}>Nama Mata Kuliah <Text style={styles.required}>*</Text></Text>
            <Text style={styles.inputHint}>Nama lengkap mata kuliah</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Rekayasa Perangkat Lunak"
              value={form.nama_mk}
              onChangeText={t => setForm({ ...form, nama_mk: t })}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>SKS <Text style={styles.required}>*</Text></Text>
                <Text style={styles.inputHint}>Jumlah SKS (angka)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 3"
                  keyboardType="numeric"
                  value={form.sks}
                  onChangeText={t => setForm({ ...form, sks: t })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Semester <Text style={styles.required}>*</Text></Text>
                <Text style={styles.inputHint}>Semester ke- (angka)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 4"
                  keyboardType="numeric"
                  value={form.semester}
                  onChangeText={t => setForm({ ...form, semester: t })}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Simpan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.screenBg },
  prodiBanner: { backgroundColor: Colors.eerieBlack, paddingHorizontal: 16, paddingVertical: 14 },
  prodiBannerLabel: { fontSize: 11, fontFamily: 'Urbanist_500Medium', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 },
  prodiBannerName: { fontSize: 15, fontFamily: 'Urbanist_700Bold', color: Colors.white, marginTop: 2 },
  semRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, flexWrap: 'wrap' },
  semChip: { backgroundColor: Colors.white, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  semChipLabel: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: Colors.textSecondary },
  semChipValue: { fontSize: 14, fontFamily: 'Urbanist_800ExtraBold', color: Colors.eerieBlack },
  semChipActive: { backgroundColor: Colors.eerieBlack, borderColor: Colors.eerieBlack },
  semChipLabelActive: { color: 'rgba(255,255,255,0.8)' },
  semChipValueActive: { color: Colors.white },
  prodiFilterRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, flexWrap: 'wrap' },
  prodiFilterChip: { backgroundColor: Colors.white, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  prodiFilterChipActive: { backgroundColor: Colors.eerieBlack, borderColor: Colors.eerieBlack },
  prodiFilterLabel: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: Colors.textSecondary },
  prodiFilterLabelActive: { color: 'rgba(255,255,255,0.8)' },
  prodiFilterCount: { fontSize: 14, fontFamily: 'Urbanist_800ExtraBold', color: Colors.eerieBlack },
  prodiFilterCountActive: { color: Colors.white },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  countRow: { paddingHorizontal: 16, paddingBottom: 8 },
  countText: { fontSize: 13, fontFamily: 'Urbanist_500Medium', color: Colors.textSecondary },
  listContent: { paddingHorizontal: 16, paddingBottom: 90 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  row: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: 16, borderWidth: 1, borderColor: Colors.border, ...Shadows.sm },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start' },
  rowTitle: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: Colors.eerieBlack, marginBottom: 8 },
  rowMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chevron: { fontSize: 24, color: Colors.textMuted, fontWeight: '300', marginLeft: 8 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.ghostWhite },
  prodiLabel: { fontSize: 12, fontFamily: 'Urbanist_500Medium', color: Colors.textSecondary },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0066FF', alignItems: 'center', justifyContent: 'center', ...Shadows.md, zIndex: 10 },
  fabText: { color: 'white', fontSize: 32, lineHeight: 36, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 12, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontFamily: 'Urbanist_700Bold', marginBottom: 16 },
  inputLabel: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: Colors.eerieBlack, marginBottom: 2 },
  inputHint: { fontSize: 11, fontFamily: 'Urbanist_400Regular', color: Colors.textMuted, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, marginBottom: 14, fontFamily: 'Urbanist_500Medium', fontSize: 14 },
  required: { color: '#e53e3e' },
  prodiChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  prodiChipActive: { backgroundColor: Colors.eerieBlack, borderColor: Colors.eerieBlack },
  prodiChipText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: Colors.eerieBlack },
  prodiChipTextActive: { color: Colors.white },
  prodiSelected: { fontSize: 12, fontFamily: 'Urbanist_500Medium', color: '#16a34a', marginTop: 4 },
  prodiHint: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: Colors.textMuted, marginTop: 4 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  btnCancel: { padding: 10 },
  btnSave: { backgroundColor: '#0066FF', padding: 10, borderRadius: 8, paddingHorizontal: 16, minWidth: 80, alignItems: 'center' },
});
