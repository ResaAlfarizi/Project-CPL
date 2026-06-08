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
  const { mk_id, mk_name, kode_mk } = route.params || {};
  const [mk, setMk] = useState([]);
  const [cpl, setCpl] = useState([]);
  const [prodi, setProdi] = useState([]);
  const [mkcpl, setMkcpl] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit mapping state
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMk, setActiveMk] = useState(null);
  // editWeights: Array of { cpl_id, kode_cpl, deskripsi, bobot (string) }
  const [editWeights, setEditWeights] = useState([]);
  const editWeightsRef = React.useRef([]); // ref untuk baca state terbaru di handleSaveMapping
  const [saving, setSaving] = useState(false);

  // FAB: MK picker modal (digunakan saat tidak ada mk_id)
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
    // Ambil semua CPL milik prodi ini, gabungkan dengan bobot yang sudah ada
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

  // Handler FAB
  const handleFab = () => {
    if (mk_id) {
      // Konteks spesifik MK: langsung buka edit untuk MK itu
      const currentMk = mk.find(m => m.id === mk_id);
      if (currentMk) openEdit(currentMk);
    } else {
      // Tampilkan picker MK
      setMkPickerVisible(true);
    }
  };

  const handleSaveMapping = async () => {
    setSaving(true);
    try {
      // Baca dari ref agar selalu dapat nilai terbaru (tidak stale)
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

  const displayMk = mk_id ? mk.filter((m) => m.id === mk_id) : mk;
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 40 }}>🔗</Text>
        <Text style={styles.loadingText}>Memuat pemetaan...</Text>
      </View>
    );
  }

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

        {displayMk.length === 0 ? (
          <EmptyState icon="🔗" title="Belum ada Mata Kuliah"
            message="Tekan tombol + untuk memulai pemetaan MK–CPL" />
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
                  mappings.map((map, index) => (
                    <View key={map.id || index} style={styles.mapRow}>
                      <View style={styles.mapRowTop}>
                        <Badge variant="green" mono>{getCplCode(map.cpl_id)}</Badge>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <Text style={styles.mapBobot}>{Number(map.bobot).toFixed(4)}</Text>
                          <TouchableOpacity
                            onPress={() => handleDeleteMapping(map)}
                            style={{ padding: 6, backgroundColor: '#fff1f2', borderRadius: 6 }}>
                            <Text style={{ fontSize: 13 }}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.mapDesc} numberOfLines={2}>
                        {getCplDesc(map.cpl_id)?.slice(0, 100)}
                      </Text>
                      <View style={styles.progressRow}>
                        <View style={styles.progressTrack}>
                          <View style={[styles.progressFill, { width: `${Number(map.bobot) * 100}%` }]} />
                        </View>
                        <Text style={styles.progressPct}>{(Number(map.bobot) * 100).toFixed(1)}%</Text>
                      </View>
                    </View>
                  ))
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
              💡 <Text style={{ fontWeight: 'bold' }}>Cara isi:</Text> Masukkan nilai bobot antara <Text style={{ fontWeight: 'bold' }}>0.0 – 1.0</Text> untuk setiap CPL yang terkait. Kosongkan jika MK tidak terkait dengan CPL tersebut. Total semua bobot harus = <Text style={{ fontWeight: 'bold' }}>1.0</Text>.
            </Text>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {editWeights.length > 0 ? editWeights.map(item => (
              <View key={String(item.cpl_id)} style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>{item.kode_cpl}</Text>
                <Text style={{ color: 'gray', marginBottom: 8, fontSize: 12, lineHeight: 17 }}>{item.deskripsi}</Text>

                <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
                  Bobot MK → {item.kode_cpl} <Text style={{ color: '#6b7280', fontWeight: '400' }}>(0.0 – 1.0, kosongkan jika tidak terkait)</Text>
                </Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, fontSize: 14 }}
                  placeholder="Contoh: 0.3"
                  keyboardType="numeric"
                  value={item.bobot}
                  onChangeText={t => {
                    // Update array item dan sync ref sekaligus
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
                  Belum ada CPL untuk prodi ini.{`\n`}Tambahkan CPL terlebih dahulu di halaman Daftar CPL.
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

      {/* Modal Pilih MK (untuk FAB saat tidak ada mk_id) */}
      <Modal visible={mkPickerVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Pilih Mata Kuliah</Text>
            <TouchableOpacity onPress={() => setMkPickerVisible(false)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Batal</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, fontSize: 13, color: '#6b7280' }}>
            Pilih MK yang ingin dipetakan ke CPL
          </Text>
          <FlatList
            data={mk}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                onPress={() => { setMkPickerVisible(false); openEdit(item); }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{item.nama_mk}</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {item.kode_mk} · {item.sks} SKS · Sem {item.semester} · {getProdiName(item.prodi_id)}
                  </Text>
                </View>
                <View style={{ marginLeft: 12 }}>
                  {getMappings(item.id).length > 0
                    ? <Badge variant="green">{getMappings(item.id).length} CPL</Badge>
                    : <Badge variant="red">Belum dipetakan</Badge>}
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => null}
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
  mkCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 16, ...Shadows.sm },
  mkHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.ghostWhite, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mkHeaderBadges: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  mkName: { fontSize: 15, fontFamily: 'Urbanist_700Bold', color: Colors.eerieBlack },
  weightBarBox: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: Colors.ghostWhite },
  emptyMapping: { padding: 20, alignItems: 'center' },
  emptyMappingText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: Colors.textMuted },
  mapRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.ghostWhite },
  mapRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  mapBobot: { fontSize: 15, fontFamily: 'Urbanist_700Bold', color: Colors.eerieBlack, letterSpacing: 0.3 },
  mapDesc: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: '#4b5563', lineHeight: 19, marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: { flex: 1, height: 7, borderRadius: Radius.full, backgroundColor: Colors.ghostWhite, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radius.full, backgroundColor: Colors.honeydew },
  progressPct: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: Colors.textSecondary, width: 50, textAlign: 'right' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0066FF', alignItems: 'center', justifyContent: 'center', ...Shadows.md, zIndex: 10 },
  fabText: { color: 'white', fontSize: 32, lineHeight: 36, fontWeight: 'bold' },
});
