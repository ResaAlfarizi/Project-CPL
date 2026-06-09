import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet,
  TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, FlatList
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MkCplAPI, MKAPI, CPLAPI, ProdiAPI } from '../api';
import { Colors, Radius, Shadows } from '../theme';
import Badge from '../components/Badge';
import WeightBar from '../components/WeightBar';
import EmptyState from '../components/EmptyState';

export default function MappingScreen({ route }) {
  const { mk_id } = route.params || {};
  const [mk, setMk] = useState([]);
  const [cpl, setCpl] = useState([]);
  const [prodi, setProdi] = useState([]);
  const [mkcpl, setMkcpl] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filterProdi, setFilterProdi] = useState('');
  const [filterMk, setFilterMk] = useState(mk_id || '');
  const [viewMode, setViewMode] = useState('table');

  const [prodiPickerVisible, setProdiPickerVisible] = useState(false);
  const [filterMkPickerVisible, setFilterMkPickerVisible] = useState(false);

  // Edit mapping state
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMk, setActiveMk] = useState(null);
  const [editWeights, setEditWeights] = useState([]);
  const editWeightsRef = React.useRef([]);
  const [saving, setSaving] = useState(false);

  // FAB: MK picker modal
  const [mkPickerVisible, setMkPickerVisible] = useState(false);

  const load = async () => {
    try {
      const [mkData, cplData, prodiData, mkcplData] = await Promise.all([
        MKAPI.list(), CPLAPI.list(), ProdiAPI.list(), MkCplAPI.listAll(),
      ]);
      setMk(mkData || []);
      setCpl(cplData || []);
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
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openEdit = (m) => {
    setActiveMk(m);
    const m_cpls = getMappings(m.id);
    const prodiCpls = cpl.filter(c => String(c.prodi_id) === String(m.prodi_id));
    const w = prodiCpls.map(c => {
      const existing = m_cpls.find(mc => String(mc.cpl_id) === String(c.id));
      return {
        cpl_id: c.id,
        kode_cpl: c.kode_cpl,
        deskripsi: c.deskripsi,
        bobot: existing ? String(existing.bobot) : '',
      };
    });
    setEditWeights(w);
    editWeightsRef.current = w;
    setModalVisible(true);
  };

  const handleFab = () => {
    if (filterMk) {
      const currentMk = mk.find(m => m.id === filterMk);
      if (currentMk) openEdit(currentMk);
    } else {
      setMkPickerVisible(true);
    }
  };

  const handleSaveMapping = async () => {
    setSaving(true);
    try {
      const current = editWeightsRef.current;
      const mappings = current
        .filter(item => {
          const b = parseFloat(item.bobot);
          return !isNaN(b) && b > 0;
        })
        .map(item => ({ cpl_id: item.cpl_id, bobot: parseFloat(item.bobot) }));

      if (mappings.length === 0) {
        Alert.alert('Perhatian', 'Isi minimal satu bobot CPL yang lebih dari 0');
        setSaving(false);
        return;
      }
      await MkCplAPI.saveBatch(activeMk.id, mappings);
      setModalVisible(false);
      load();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const getMappings = (mkId) => mkcpl.filter((m) => m.mk_id === mkId);
  const getCplCode = (id) => cpl.find((c) => c.id === id)?.kode_cpl || '—';
  const getCplDesc = (id) => cpl.find((c) => c.id === id)?.deskripsi || '—';
  const getMkTotal = (mkId) => getMappings(mkId).reduce((s, m) => s + Number(m.bobot), 0);
  const getProdiName = (prodiId) => prodi.find(p => p.id === prodiId)?.nama_prodi || '';

  const handleDeleteMapping = (map) => {
    Alert.alert(
      'Hapus Pemetaan',
      `Hapus pemetaan ${getCplCode(map.cpl_id)}?\nBobot ${Number(map.bobot).toFixed(4)} akan dihapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: async () => {
          try { await MkCplAPI.delete(map.id); load(); }
          catch (e) { Alert.alert('Error', e.message); }
        }}
      ]
    );
  };

  const filteredMkList = mk.filter(m => !filterProdi || m.prodi_id === filterProdi);
  const displayMk = filterMk ? filteredMkList.filter((m) => m.id === filterMk) : filteredMkList;

  // Determine CPLs to show in Matrix
  const matrixCpls = cpl.filter(c => !filterProdi || c.prodi_id === filterProdi).filter(c => {
    return displayMk.some(m => {
      const mappings = getMappings(m.id);
      return mappings.some(map => map.cpl_id === c.id && Number(map.bobot) > 0);
    });
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 40 }}>🔗</Text>
        <Text style={styles.loadingText}>Memuat pemetaan...</Text>
      </View>
    );
  }

  const overMk = displayMk.filter(m => getMkTotal(m.id) > 1.0001);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            💡 <Text style={{ fontFamily: 'Urbanist_700Bold' }}>Aturan:</Text> Total bobot semua CPL yang dipetakan ke satu MK harus = <Text style={{ fontFamily: 'Urbanist_700Bold' }}>1.0</Text>
          </Text>
        </View>

        {/* Toolbar & Filters */}
        <View style={styles.toolbar}>
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterBtn} onPress={() => setProdiPickerVisible(true)}>
              <Text style={styles.filterBtnText} numberOfLines={1}>
                {filterProdi ? (prodi.find(p => p.id === filterProdi)?.kode_prodi || 'Prodi') : 'Semua Prodi'}
              </Text>
              <Text style={{color: '#9ca3af', fontSize: 12}}>▼</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterMkPickerVisible(true)}>
              <Text style={styles.filterBtnText} numberOfLines={1}>
                {filterMk ? (mk.find(m => m.id === filterMk)?.kode_mk || 'MK') : 'Semua MK'}
              </Text>
              <Text style={{color: '#9ca3af', fontSize: 12}}>▼</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.viewModeToggle}>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'matrix' && styles.toggleBtnActive]}
              onPress={() => setViewMode('matrix')}>
              <Text style={[styles.toggleBtnText, viewMode === 'matrix' && styles.toggleBtnTextActive]}>Matrix</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'table' && styles.toggleBtnActive]}
              onPress={() => setViewMode('table')}>
              <Text style={[styles.toggleBtnText, viewMode === 'table' && styles.toggleBtnTextActive]}>Table</Text>
            </TouchableOpacity>
          </View>
        </View>

        {overMk.length > 0 && (
          <View style={styles.warningBanner}>
            <Text style={{fontSize: 16, marginRight: 8}}>⚠️</Text>
            <Text style={styles.warningText}>
              Peringatan: Total bobot Pemetaan MK–CPL melebihi 1.00 pada MK: {overMk.map(m => m.kode_mk).join(', ')}
            </Text>
          </View>
        )}

        {displayMk.length === 0 ? (
          <EmptyState icon="🔗" title="Belum ada Mata Kuliah"
            message="Tambahkan mata kuliah terlebih dahulu" />
        ) : viewMode === 'matrix' ? (
          <View style={styles.matrixContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Header */}
                <View style={styles.matrixRow}>
                  <View style={[styles.matrixCellHeader, { width: 150 }]}><Text style={styles.matrixHeaderText}>Mata Kuliah</Text></View>
                  {matrixCpls.map(c => (
                    <View key={c.id} style={[styles.matrixCellHeader, { width: 80, alignItems: 'center' }]}><Text style={styles.matrixHeaderText}>{c.kode_cpl}</Text></View>
                  ))}
                  <View style={[styles.matrixCellHeader, { width: 80, alignItems: 'center' }]}><Text style={styles.matrixHeaderText}>Total</Text></View>
                </View>
                {/* Body */}
                {displayMk.map(m => {
                  const mappings = getMappings(m.id);
                  const rowTotal = getMkTotal(m.id);
                  return (
                    <View key={m.id} style={styles.matrixRow}>
                      <View style={[styles.matrixCell, { width: 150 }]}>
                        <Text style={{fontWeight: 'bold', fontSize: 13, color: Colors.eerieBlack}}>{m.kode_mk}</Text>
                        <Text style={{fontSize: 11, color: '#6b7280'}} numberOfLines={1}>{m.nama_mk}</Text>
                      </View>
                      {matrixCpls.map(c => {
                        const map = mappings.find(x => x.cpl_id === c.id);
                        return (
                          <View key={c.id} style={[styles.matrixCell, { width: 80, alignItems: 'center' }]}>
                            <Text style={{fontFamily: 'monospace', fontSize: 13}}>{map ? Number(map.bobot).toFixed(4) : '-'}</Text>
                          </View>
                        );
                      })}
                      <View style={[styles.matrixCell, { width: 80, alignItems: 'center' }]}>
                        <Text style={{fontWeight: 'bold', fontFamily: 'monospace', fontSize: 13, color: Math.abs(rowTotal - 1) <= 0.0001 ? '#27ae60' : rowTotal > 0 ? '#e74c3c' : '#d1d5db'}}>
                          {rowTotal > 0 ? rowTotal.toFixed(4) : '-'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        ) : (
          displayMk.map((m) => {
            const mappings = getMappings(m.id);
            const total = getMkTotal(m.id);
            return (
              <View key={m.id} style={styles.mkCard}>
                <View style={styles.mkHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.mkHeaderBadges}>
                      <Badge variant="blue" mono>{m.kode_mk}</Badge>
                      <Badge variant="gray">{m.sks} SKS</Badge>
                      <Badge variant="gray">Sem {m.semester}</Badge>
                    </View>
                    <Text style={styles.mkName}>{m.nama_mk}</Text>
                  </View>
                  <TouchableOpacity onPress={() => openEdit(m)}
                    style={{ padding: 8, backgroundColor: '#f0f4f9', borderRadius: 8, alignSelf: 'flex-start' }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold' }}>✏️ Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.weightBarBox}>
                  <WeightBar total={total} label="Total bobot MK→CPL" />
                </View>

                {mappings.length === 0 ? (
                  <View style={styles.emptyMapping}>
                    <Text style={styles.emptyMappingText}>Belum ada CPL dipetakan ke MK ini</Text>
                  </View>
                ) : (
                  <View style={styles.tableWrapper}>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.thText, { flex: 1 }]}>CPL</Text>
                      <Text style={[styles.thText, { width: 80 }]}>Bobot</Text>
                      <Text style={[styles.thText, { width: 60, textAlign: 'right' }]}>%</Text>
                    </View>
                    {mappings.map((map, index) => (
                      <View key={map.id || index} style={styles.tableRow}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                            <Badge variant="green" mono>{getCplCode(map.cpl_id)}</Badge>
                          </View>
                          <Text style={styles.mapDesc} numberOfLines={2}>
                            {getCplDesc(map.cpl_id)}
                          </Text>
                        </View>
                        <View style={{ width: 80, justifyContent: 'center' }}>
                          <Text style={styles.mapBobot}>{Number(map.bobot).toFixed(4)}</Text>
                          <TouchableOpacity
                            onPress={() => handleDeleteMapping(map)}
                            style={{ marginTop: 6, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#fff1f2', borderRadius: 6, alignSelf: 'flex-start' }}>
                            <Text style={{ fontSize: 12, color: '#e11d48', fontWeight: 'bold' }}>Hapus</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{ width: 60, alignItems: 'flex-end', justifyContent: 'center' }}>
                          <Text style={styles.progressPct}>{(Number(map.bobot) * 100).toFixed(1)}%</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* FAB - selalu tampil */}
      <TouchableOpacity style={styles.fab} onPress={handleFab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal Edit Pemetaan */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Edit Pemetaan MK–CPL</Text>
              {activeMk && <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{activeMk.kode_mk} — {activeMk.nama_mk}</Text>}
            </View>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Tutup</Text>
            </TouchableOpacity>
          </View>

          {/* Petunjuk isian */}
          <View style={{ margin: 16, padding: 12, backgroundColor: '#f0f7ee', borderRadius: 8, borderWidth: 1, borderColor: '#d1fae5' }}>
            <Text style={{ fontSize: 12, color: '#065f46', lineHeight: 18 }}>
              💡 <Text style={{ fontWeight: 'bold' }}>Cara isi:</Text> Masukkan nilai bobot antara <Text style={{ fontWeight: 'bold' }}>0.0 – 1.0</Text> untuk setiap CPL yang terkait. Kosongkan jika MK tidak terkait. Total semua bobot harus = <Text style={{ fontWeight: 'bold' }}>1.0</Text>.
            </Text>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {editWeights.length > 0 ? editWeights.map(item => (
              <View key={String(item.cpl_id)} style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>{item.kode_cpl}</Text>
                <Text style={{ color: 'gray', marginBottom: 8, fontSize: 12, lineHeight: 17 }}>{item.deskripsi}</Text>

                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
                  Bobot MK → {item.kode_cpl} <Text style={{ color: '#6b7280', fontWeight: '400' }}>(0.0 – 1.0)</Text>
                </Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, fontSize: 14 }}
                  placeholder="Contoh: 0.3"
                  keyboardType="numeric"
                  value={item.bobot}
                  onChangeText={t => {
                    setEditWeights(prev => {
                      const next = prev.map(w =>
                        String(w.cpl_id) === String(item.cpl_id) ? { ...w, bobot: t } : w
                      );
                      editWeightsRef.current = next;
                      return next;
                    });
                  }}
                />
              </View>
            )) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#6b7280', textAlign: 'center' }}>
                  Belum ada CPL untuk prodi ini.{`\n`}Tambahkan CPL terlebih dahulu.
                </Text>
              </View>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={{ padding: 16, borderTopWidth: 1, borderColor: '#eee' }}>
            <TouchableOpacity
              style={{ backgroundColor: '#0066FF', padding: 16, borderRadius: 8, alignItems: 'center' }}
              onPress={handleSaveMapping} disabled={saving}>
              {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Simpan Pemetaan</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Filter Prodi */}
      <Modal visible={prodiPickerVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Pilih Prodi</Text>
            <TouchableOpacity onPress={() => setProdiPickerVisible(false)}><Text style={{ color: 'red', fontWeight: 'bold' }}>Batal</Text></TouchableOpacity>
          </View>
          <FlatList
            data={[{ id: '', nama_prodi: 'Semua Prodi' }, ...prodi]}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6' }}
                onPress={() => { setFilterProdi(item.id); setFilterMk(''); setProdiPickerVisible(false); }}>
                <Text style={{ fontSize: 15, color: filterProdi === item.id ? '#0066FF' : '#111827', fontWeight: filterProdi === item.id ? 'bold' : 'normal' }}>
                  {item.kode_prodi ? `${item.kode_prodi} - ${item.nama_prodi}` : item.nama_prodi}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Modal Filter MK */}
      <Modal visible={filterMkPickerVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Pilih Mata Kuliah</Text>
            <TouchableOpacity onPress={() => setFilterMkPickerVisible(false)}><Text style={{ color: 'red', fontWeight: 'bold' }}>Batal</Text></TouchableOpacity>
          </View>
          <FlatList
            data={[{ id: '', nama_mk: 'Semua Mata Kuliah' }, ...filteredMkList]}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6' }}
                onPress={() => { setFilterMk(item.id); setFilterMkPickerVisible(false); }}>
                <Text style={{ fontSize: 15, color: filterMk === item.id ? '#0066FF' : '#111827', fontWeight: filterMk === item.id ? 'bold' : 'normal' }}>
                  {item.kode_mk ? `${item.kode_mk} - ${item.nama_mk}` : item.nama_mk}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Modal Pilih MK (untuk FAB saat tidak ada filterMk) */}
      <Modal visible={mkPickerVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Pilih Mata Kuliah</Text>
            <TouchableOpacity onPress={() => setMkPickerVisible(false)}><Text style={{ color: 'red', fontWeight: 'bold' }}>Batal</Text></TouchableOpacity>
          </View>
          <FlatList
            data={mk}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6' }}
                onPress={() => { setMkPickerVisible(false); openEdit(item); }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{item.nama_mk}</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {item.kode_mk} · {item.sks} SKS · Sem {item.semester} · {getProdiName(item.prodi_id)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.screenBg },
  content: { padding: 16 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.screenBg, gap: 12 },
  loadingText: { fontSize: 15, fontFamily: 'Urbanist_500Medium', color: Colors.textSecondary },
  infoBanner: { backgroundColor: '#f0f7ee', borderRadius: Radius.sm, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: Colors.honeydew },
  infoText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: Colors.eerieBlack, lineHeight: 20 },
  warningBanner: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  warningText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: '#b91c1c', flex: 1 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, zIndex: 2 },
  filterRow: { flexDirection: 'row', gap: 8, flex: 1, paddingRight: 8 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flex: 1, justifyContent: 'space-between' },
  filterBtnText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: '#374151', flex: 1 },
  viewModeToggle: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 4 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleBtnText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: '#6b7280' },
  toggleBtnTextActive: { color: '#111827' },
  matrixContainer: { backgroundColor: '#fff', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  matrixRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.ghostWhite },
  matrixCellHeader: { padding: 12, backgroundColor: '#F6F5FA', borderRightWidth: 1, borderRightColor: Colors.ghostWhite, justifyContent: 'center' },
  matrixHeaderText: { fontSize: 12, fontFamily: 'Urbanist_700Bold', color: '#4b5563', textAlign: 'center' },
  matrixCell: { padding: 12, borderRightWidth: 1, borderRightColor: Colors.ghostWhite, justifyContent: 'center' },
  mkCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 16, ...Shadows.sm },
  mkHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.ghostWhite, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mkHeaderBadges: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  mkName: { fontSize: 15, fontFamily: 'Urbanist_700Bold', color: Colors.eerieBlack },
  weightBarBox: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: Colors.ghostWhite },
  emptyMapping: { padding: 20, alignItems: 'center' },
  emptyMappingText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: Colors.textMuted },
  tableWrapper: { borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  thText: { fontSize: 12, fontFamily: 'Urbanist_700Bold', color: '#6b7280' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  mapBobot: { fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', color: Colors.eerieBlack },
  mapDesc: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: '#4b5563', lineHeight: 18 },
  progressPct: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: Colors.textSecondary },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0066FF', alignItems: 'center', justifyContent: 'center', ...Shadows.md, zIndex: 10 },
  fabText: { color: 'white', fontSize: 32, lineHeight: 36, fontWeight: 'bold' },
});
