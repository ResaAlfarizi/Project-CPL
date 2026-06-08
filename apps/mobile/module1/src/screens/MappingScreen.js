import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet,
  TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator
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

  // CRUD State
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMk, setActiveMk] = useState(null);
  const [editWeights, setEditWeights] = useState({});
  const [saving, setSaving] = useState(false);

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
    const w = {};
    m_cpls.forEach(map => {
      w[map.cpl_id] = String(map.bobot);
    });
    setEditWeights(w);
    setModalVisible(true);
  };

  const handleSaveMapping = async () => {
    setSaving(true);
    try {
      const mappings = Object.keys(editWeights)
        .map(cpl_id => ({ cpl_id: parseInt(cpl_id), bobot: parseFloat(editWeights[cpl_id]) }))
        .filter(m => m.bobot > 0);
      
      await MkCplAPI.saveBatch(activeMk.id, mappings);
      setModalVisible(false);
      load();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  // Display MKs — if mk_id is provided, show only that MK; otherwise show all
  const displayMk = mk_id ? mk.filter((m) => m.id === mk_id) : mk;

  const getMappings = (mkId) => mkcpl.filter((m) => m.mk_id === mkId);
  const getCplCode = (id) => cpl.find((c) => c.id === id)?.kode_cpl || '—';
  const getCplDesc = (id) => cpl.find((c) => c.id === id)?.deskripsi || '—';
  const getMkTotal = (mkId) => getMappings(mkId).reduce((s, m) => s + Number(m.bobot), 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 40 }}>🔗</Text>
        <Text style={styles.loadingText}>Memuat pemetaan...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          💡 <Text style={{ fontFamily: 'Urbanist_700Bold' }}>Aturan:</Text> Total bobot semua CPL yang dipetakan ke satu MK harus = <Text style={{ fontFamily: 'Urbanist_700Bold' }}>1.0</Text>
        </Text>
      </View>

      {displayMk.length === 0 ? (
        <EmptyState
          icon="🔗"
          title="Belum ada Mata Kuliah"
          message="Belum ada data pemetaan MK-CPL"
        />
      ) : (
        displayMk.map((m) => {
          const mappings = getMappings(m.id);
          const total = getMkTotal(m.id);
          return (
            <View key={m.id} style={styles.mkCard}>
              {/* MK Header */}
              <View style={styles.mkHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.mkHeaderBadges}>
                    <Badge variant="blue" mono>{m.kode_mk}</Badge>
                    <Badge variant="gray">{m.sks} SKS</Badge>
                    <Badge variant="gray">Sem {m.semester}</Badge>
                  </View>
                  <Text style={styles.mkName}>{m.nama_mk}</Text>
                </View>
                <TouchableOpacity onPress={() => openEdit(m)} style={{ padding: 8, backgroundColor: '#f0f4f9', borderRadius: 8, alignSelf: 'flex-start' }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold' }}>✏️ Edit</Text>
                </TouchableOpacity>
              </View>

              {/* Weight Bar */}
              <View style={styles.weightBarBox}>
                <WeightBar total={total} label="Total bobot MK→CPL" />
              </View>

              {/* Mappings */}
              {mappings.length === 0 ? (
                <View style={styles.emptyMapping}>
                  <Text style={styles.emptyMappingText}>Belum ada CPL dipetakan ke MK ini</Text>
                </View>
              ) : (
                mappings.map((map, index) => (
                  <View key={map.id || index} style={styles.mapRow}>
                    <View style={styles.mapRowTop}>
                      <Badge variant="green" mono>{getCplCode(map.cpl_id)}</Badge>
                      <Text style={styles.mapBobot}>{Number(map.bobot).toFixed(4)}</Text>
                    </View>
                    <Text style={styles.mapDesc} numberOfLines={2}>
                      {getCplDesc(map.cpl_id)?.slice(0, 100)}
                    </Text>
                    {/* Progress bar */}
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

      <View style={{ height: 30 }} />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Edit Pemetaan: {activeMk?.kode_mk}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ color: 'red', fontWeight: 'bold' }}>Tutup</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {cpl.filter(c => c.prodi_id === activeMk?.prodi_id).map(c => (
              <View key={c.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{c.kode_cpl}</Text>
                <Text style={{ color: 'gray', marginBottom: 8, fontSize: 12 }}>{c.deskripsi}</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
                  placeholder="Bobot (0.0 - 1.0)"
                  keyboardType="numeric"
                  value={editWeights[c.id] || ''}
                  onChangeText={t => setEditWeights({...editWeights, [c.id]: t})}
                />
              </View>
            ))}
          </ScrollView>
          <View style={{ padding: 16, borderTopWidth: 1, borderColor: '#eee' }}>
             <TouchableOpacity style={{ backgroundColor: '#0066FF', padding: 16, borderRadius: 8, alignItems: 'center' }} onPress={handleSaveMapping} disabled={saving}>
                {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Simpan Pemetaan</Text>}
             </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.screenBg,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.textSecondary,
  },
  infoBanner: {
    backgroundColor: '#f0f7ee',
    borderRadius: Radius.sm,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.honeydew,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.eerieBlack,
    lineHeight: 20,
  },
  mkCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    ...Shadows.sm,
  },
  mkHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostWhite,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mkHeaderBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  mkName: {
    fontSize: 15,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
  },
  weightBarBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostWhite,
  },
  emptyMapping: {
    padding: 20,
    alignItems: 'center',
  },
  emptyMappingText: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textMuted,
  },
  mapRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostWhite,
  },
  mapRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  mapBobot: {
    fontSize: 15,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
    letterSpacing: 0.3,
  },
  mapDesc: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: '#4b5563',
    lineHeight: 19,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.ghostWhite,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.honeydew,
  },
  progressPct: {
    fontSize: 13,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textSecondary,
    width: 50,
    textAlign: 'right',
  },
});
