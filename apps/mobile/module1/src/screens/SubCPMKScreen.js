import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet,
  TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, FlatList
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SubCpmkAPI, MkCplAPI, MKAPI, CPLAPI, ProdiAPI } from '../api';
import { Colors, Radius, Shadows } from '../theme';
import Badge from '../components/Badge';
import WeightBar from '../components/WeightBar';
import EmptyState from '../components/EmptyState';

export default function SubCPMKScreen({ route }) {
  const { mk_id } = route.params || {};
  const [mk, setMk] = useState([]);
  const [cpl, setCpl] = useState([]);
  const [prodi, setProdi] = useState([]);
  const [mkcpl, setMkcpl] = useState([]);
  const [subCpmk, setSubCpmk] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filterProdi, setFilterProdi] = useState('');
  const [filterMk, setFilterMk] = useState(mk_id || '');
  const [viewMode, setViewMode] = useState('table');

  const [prodiPickerVisible, setProdiPickerVisible] = useState(false);
  const [filterMkPickerVisible, setFilterMkPickerVisible] = useState(false);

  // Edit modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMkCpl, setActiveMkCpl] = useState(null);
  const [editSubs, setEditSubs] = useState([]);
  const editSubsRef = React.useRef([]); // ref agar handleSave selalu baca state terbaru
  const [saving, setSaving] = useState(false);

  // FAB: picker modal
  const [mkPickerVisible, setMkPickerVisible] = useState(false);
  const [cplPickerVisible, setCplPickerVisible] = useState(false);
  const [pickerSelectedMk, setPickerSelectedMk] = useState(null);

  const load = async () => {
    try {
      const [prodiData, mkData, cplData, mkcplData, subData] = await Promise.all([
        ProdiAPI.list(), MKAPI.list(), CPLAPI.list(), MkCplAPI.listAll(), SubCpmkAPI.listAll(),
      ]);
      setProdi(prodiData || []);
      setMk(mkData || []);
      setCpl(cplData || []);
      setMkcpl(mkcplData || []);
      setSubCpmk(subData || []);
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

  const openEdit = (mc) => {
    setActiveMkCpl(mc);
    const existing = getSubCpmks(mc.id).map(s => ({ ...s, bobot: String(s.bobot) }));
    const initial = existing.length > 0 ? existing : [{ kode_sub_cpmk: '', deskripsi: '', bobot: '' }];
    setEditSubs(initial);
    editSubsRef.current = initial;
    setModalVisible(true);
  };

  const handleAddRow = () => {
    setEditSubs(prev => {
      const next = [...prev, { kode_sub_cpmk: '', deskripsi: '', bobot: '' }];
      editSubsRef.current = next;
      return next;
    });
  };

  const handleUpdateRow = (index, field, value) => {
    setEditSubs(prev => {
      const next = prev.map((item, i) => i === index ? { ...item, [field]: value } : item);
      editSubsRef.current = next;
      return next;
    });
  };

  const handleRemoveRow = (index) => {
    setEditSubs(prev => {
      const next = prev.filter((_, i) => i !== index);
      editSubsRef.current = next;
      return next;
    });
  };

  const handleSaveSubCpmk = async () => {
    setSaving(true);
    try {
      const current = editSubsRef.current;
      const validSubs = current
        .filter(s => s.kode_sub_cpmk && s.bobot && parseFloat(s.bobot) > 0)
        .map(s => ({ ...s, bobot: parseFloat(s.bobot) }));

      if (validSubs.length === 0) {
        Alert.alert('Perhatian', 'Isi minimal satu Sub-CPMK dengan kode dan bobot lebih dari 0');
        setSaving(false);
        return;
      }
      await SubCpmkAPI.saveBatch(activeMkCpl.id, validSubs);
      setModalVisible(false);
      load();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubCpmk = (sub) => {
    Alert.alert(
      'Hapus Sub-CPMK',
      `Yakin hapus "${sub.kode_sub_cpmk}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: async () => {
          try { await SubCpmkAPI.delete(sub.id); load(); }
          catch (e) { Alert.alert('Error', e.message); }
        }}
      ]
    );
  };

  const handleFab = () => {
    if (filterMk) {
      const pairs = getMkCpls(filterMk);
      if (pairs.length === 0) {
        Alert.alert('Belum Ada Pemetaan', 'MK ini belum dipetakan ke CPL. Lakukan pemetaan MK–CPL terlebih dahulu.');
      } else {
        setPickerSelectedMk(mk.find(m => m.id === filterMk) || null);
        setCplPickerVisible(true);
      }
    } else {
      setMkPickerVisible(true);
    }
  };

  const filteredMkList = mk.filter(m => !filterProdi || m.prodi_id === filterProdi);
  const displayMk = filterMk ? filteredMkList.filter((m) => m.id === filterMk) : filteredMkList;

  const getMkCpls = (mkId) => mkcpl.filter((m) => m.mk_id === mkId);
  const getCplCode = (id) => cpl.find((c) => c.id === id)?.kode_cpl || '—';
  const getCplDesc = (id) => cpl.find((c) => c.id === id)?.deskripsi || '—';
  const getSubCpmks = (mkcplId) => subCpmk.filter((s) => s.mk_cpl_id === mkcplId);
  const getTotalBobot = (mkcplId) => getSubCpmks(mkcplId).reduce((a, s) => a + Number(s.bobot), 0);
  const getProdiName = (prodiId) => prodi.find(p => p.id === prodiId)?.nama_prodi || '';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 40 }}>📋</Text>
        <Text style={styles.loadingText}>Memuat Sub-CPMK...</Text>
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
            💡 <Text style={{ fontFamily: 'Urbanist_700Bold' }}>Aturan:</Text> Jumlah bobot keseluruhan Sub-CPMK dalam 1 Mata Kuliah harus bernilai <Text style={{ fontFamily: 'Urbanist_700Bold' }}>1.0</Text>
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

        {displayMk.length === 0 ? (
          <EmptyState icon="📋" title="Belum ada Mata Kuliah"
            message="Tambahkan mata kuliah terlebih dahulu" />
        ) : (
          displayMk.map((m) => {
            const mkCpls = getMkCpls(m.id);
            if (mkCpls.length === 0) {
              return (
                <View key={m.id} style={styles.mkCard}>
                  <View style={styles.mkHeader}>
                    <View style={styles.mkBadges}><Badge variant="blue" mono>{m.kode_mk}</Badge></View>
                    <Text style={styles.mkName}>{m.nama_mk}</Text>
                  </View>
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>MK ini belum dipetakan ke CPL manapun</Text>
                  </View>
                </View>
              );
            }

            const mkTotalSubBobot = mkCpls.reduce((s, mc) => s + getTotalBobot(mc.id), 0);
            
            return (
              <View key={m.id} style={styles.mkCard}>
                <View style={styles.mkHeader}>
                  <View style={styles.mkBadges}>
                    <Badge variant="blue" mono>{m.kode_mk}</Badge>
                    <Badge variant="gray">{m.sks} SKS · Sem {m.semester}</Badge>
                  </View>
                  <Text style={styles.mkName}>{m.nama_mk}</Text>
                </View>

                {mkTotalSubBobot > 1.0001 && (
                  <View style={styles.warningBanner}>
                    <Text style={styles.warningText}>
                      ⚠️ Total bobot Sub-CPMK melebihi 1.0 ({mkTotalSubBobot.toFixed(4)})
                    </Text>
                  </View>
                )}

                {viewMode === 'matrix' ? (() => {
                  const allSubCpmks = [];
                  mkCpls.forEach(mc => {
                    const subs = getSubCpmks(mc.id) || [];
                    subs.forEach(sub => allSubCpmks.push({ ...sub, cpl_id: mc.cpl_id }));
                  });
                  
                  return (
                    <View style={styles.matrixContainer}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                          {/* Header */}
                          <View style={styles.matrixRow}>
                            <View style={[styles.matrixCellHeader, { width: 100, backgroundColor: '#F6F5FA' }]}><Text style={styles.matrixHeaderText}>{m.kode_mk}</Text></View>
                            {mkCpls.map(mc => (
                              <View key={mc.id} style={[styles.matrixCellHeader, { width: 80, alignItems: 'center' }]}><Text style={styles.matrixHeaderText}>{getCplCode(mc.cpl_id)}</Text></View>
                            ))}
                            <View style={[styles.matrixCellHeader, { width: 80, alignItems: 'center', backgroundColor: '#EFFDA3' }]}><Text style={[styles.matrixHeaderText, {color: '#212121'}]}>Total</Text></View>
                          </View>
                          {/* Body */}
                          {allSubCpmks.map((sub, i) => (
                            <View key={i} style={styles.matrixRow}>
                              <View style={[styles.matrixCell, { width: 100 }]}>
                                <Text style={{fontWeight: '600', fontSize: 13, color: Colors.eerieBlack}}>{sub.kode_sub_cpmk}</Text>
                              </View>
                              {mkCpls.map(mc => (
                                <View key={mc.id} style={[styles.matrixCell, { width: 80, alignItems: 'center' }]}>
                                  <Text style={{fontFamily: 'monospace', fontSize: 13}}>
                                    {sub.cpl_id === mc.cpl_id ? Number(sub.bobot).toFixed(4) : '-'}
                                  </Text>
                                </View>
                              ))}
                              <View style={[styles.matrixCell, { width: 80, alignItems: 'center', backgroundColor: '#EFFDA3' }]}>
                                <Text style={{fontWeight: 'bold', fontFamily: 'monospace', fontSize: 13, color: '#212121'}}>
                                  {Number(sub.bobot).toFixed(4)}
                                </Text>
                              </View>
                            </View>
                          ))}
                          <View style={styles.matrixRow}>
                            <View style={[styles.matrixCell, { width: 100, backgroundColor: '#EFFDA3' }]}><Text style={{fontWeight: '800', color: '#212121'}}>Total</Text></View>
                            {mkCpls.map(mc => {
                              const colTotal = getTotalBobot(mc.id);
                              return (
                                <View key={mc.id} style={[styles.matrixCell, { width: 80, alignItems: 'center', backgroundColor: '#EFFDA3' }]}>
                                  <Text style={{fontWeight: '800', fontFamily: 'monospace', fontSize: 13, color: '#212121'}}>
                                    {colTotal > 0 ? colTotal.toFixed(4) : '-'}
                                  </Text>
                                </View>
                              );
                            })}
                            <View style={[styles.matrixCell, { width: 80, alignItems: 'center', backgroundColor: '#EFFDA3' }]}>
                              <Text style={{fontWeight: '800', fontFamily: 'monospace', fontSize: 13, color: '#212121'}}>
                                {mkTotalSubBobot.toFixed(4)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </ScrollView>
                    </View>
                  );
                })() : mkCpls.map((mc) => {
                  const subs = getSubCpmks(mc.id);
                  const totalBobot = getTotalBobot(mc.id);
                  return (
                    <View key={mc.id} style={styles.cplSection}>
                      <View style={styles.cplHeader}>
                        <View style={{ flex: 1 }}>
                          <View style={styles.cplBadgeRow}>
                            <Badge variant="green" mono>{getCplCode(mc.cpl_id)}</Badge>
                            <Text style={styles.cplBobotLabel}>
                              Bobot MK→CPL: <Text style={{ fontFamily: 'Urbanist_700Bold' }}>{Number(mc.bobot).toFixed(4)}</Text>
                            </Text>
                          </View>
                          <Text style={styles.cplDesc} numberOfLines={2}>
                            {getCplDesc(mc.cpl_id)?.slice(0, 80)}…
                          </Text>
                          <WeightBar total={totalBobot} label="Σ bobot Sub-CPMK" />
                        </View>
                        <TouchableOpacity onPress={() => openEdit(mc)}
                          style={{ padding: 8, backgroundColor: '#eafaf1', borderRadius: 8, alignSelf: 'center', marginLeft: 10 }}>
                          <Text style={{ fontSize: 13, fontWeight: 'bold' }}>✏️ Edit</Text>
                        </TouchableOpacity>
                      </View>

                      {subs.length === 0 ? (
                        <View style={styles.emptySubBox}>
                          <Text style={styles.emptyText}>Belum ada Sub-CPMK untuk pasangan ini</Text>
                        </View>
                      ) : (
                        <View style={styles.tableWrapper}>
                          <View style={styles.tableHeaderRow}>
                            <Text style={[styles.thText, { width: 70 }]}>Kode</Text>
                            <Text style={[styles.thText, { flex: 1 }]}>Deskripsi</Text>
                            <Text style={[styles.thText, { width: 60 }]}>Bobot</Text>
                            <Text style={[styles.thText, { width: 60, textAlign: 'right' }]}>%</Text>
                          </View>
                          {subs.map((sub, index) => (
                            <View key={sub.id || index} style={styles.tableRow}>
                              <View style={{ width: 70 }}>
                                <Badge variant="yellow" mono>{sub.kode_sub_cpmk}</Badge>
                              </View>
                              <View style={{ flex: 1, paddingRight: 10, justifyContent: 'center' }}>
                                <Text style={styles.subDesc} numberOfLines={2}>
                                  {sub.deskripsi || <Text style={{color: '#9ca3af'}}>—</Text>}
                                </Text>
                              </View>
                              <View style={{ width: 60, justifyContent: 'center' }}>
                                <Text style={styles.subBobot}>{Number(sub.bobot).toFixed(4)}</Text>
                                <TouchableOpacity onPress={() => handleDeleteSubCpmk(sub)}
                                  style={{ marginTop: 6, paddingVertical: 4, paddingHorizontal: 6, backgroundColor: '#fff1f2', borderRadius: 6, alignSelf: 'flex-start' }}>
                                  <Text style={{ fontSize: 11, color: '#e11d48', fontWeight: 'bold' }}>Hapus</Text>
                                </TouchableOpacity>
                              </View>
                              <View style={{ width: 60, alignItems: 'flex-end', justifyContent: 'center' }}>
                                <Text style={styles.subPct}>{(Number(sub.bobot) * 100).toFixed(1)}%</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
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

      {/* Modal Edit Sub-CPMK */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Edit Sub-CPMK</Text>
              {activeMkCpl && (
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  Pasangan {getCplCode(activeMkCpl.cpl_id)} — Bobot: {Number(activeMkCpl.bobot).toFixed(4)}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Tutup</Text>
            </TouchableOpacity>
          </View>

          {/* Petunjuk pengisian */}
          <View style={{ margin: 16, padding: 12, backgroundColor: '#fffbeb', borderRadius: 8, borderWidth: 1, borderColor: '#fde68a' }}>
            <Text style={{ fontSize: 12, color: '#92400e', lineHeight: 18 }}>
              💡 <Text style={{ fontWeight: 'bold' }}>Cara isi:</Text> Setiap Sub-CPMK memiliki <Text style={{ fontWeight: 'bold' }}>kode</Text> (singkat, cth: L1), <Text style={{ fontWeight: 'bold' }}>bobot</Text> (0.0–1.0), dan <Text style={{ fontWeight: 'bold' }}>deskripsi</Text> (opsional). Tekan "+ Tambah" untuk baris baru.
            </Text>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {editSubs.map((s, index) => (
              <View key={index} style={{ marginBottom: 16, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Sub-CPMK {index + 1}</Text>
                  <TouchableOpacity onPress={() => handleRemoveRow(index)}>
                    <Text style={{ color: 'red', fontWeight: '600' }}>🗑 Hapus</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.subInputLabel}>Kode Sub-CPMK <Text style={{ color: '#e53e3e' }}>*</Text></Text>
                <Text style={styles.subInputHint}>Kode singkat, contoh: L1, P2, A3</Text>
                <TextInput
                  style={styles.subInput}
                  placeholder="Contoh: L1"
                  value={s.kode_sub_cpmk}
                  onChangeText={t => handleUpdateRow(index, 'kode_sub_cpmk', t)}
                />

                <Text style={styles.subInputLabel}>Bobot <Text style={{ color: '#e53e3e' }}>*</Text></Text>
                <Text style={styles.subInputHint}>Nilai antara 0.0 – 1.0</Text>
                <TextInput
                  style={styles.subInput}
                  placeholder="Contoh: 0.25"
                  keyboardType="numeric"
                  value={s.bobot}
                  onChangeText={t => handleUpdateRow(index, 'bobot', t)}
                />

                <Text style={styles.subInputLabel}>Deskripsi</Text>
                <Text style={styles.subInputHint}>Uraian kemampuan yang harus dicapai (opsional)</Text>
                <TextInput
                  style={[styles.subInput, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="Tuliskan deskripsi sub-capaian..."
                  multiline
                  value={s.deskripsi}
                  onChangeText={t => handleUpdateRow(index, 'deskripsi', t)}
                />
              </View>
            ))}

            <TouchableOpacity
              style={{ padding: 14, alignItems: 'center', backgroundColor: '#f0f4f9', borderRadius: 8, marginBottom: 10 }}
              onPress={handleAddRow}>
              <Text style={{ fontWeight: 'bold', color: '#0066FF' }}>+ Tambah Sub-CPMK</Text>
            </TouchableOpacity>
            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={{ padding: 16, borderTopWidth: 1, borderColor: '#eee' }}>
            <TouchableOpacity
              style={{ backgroundColor: '#0066FF', padding: 16, borderRadius: 8, alignItems: 'center' }}
              onPress={handleSaveSubCpmk} disabled={saving}>
              {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Simpan Sub-CPMK</Text>}
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

      {/* Modal Pilih MK (saat FAB diklik tapi filterMk tidak ada) */}
      <Modal visible={mkPickerVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Pilih Mata Kuliah</Text>
            <TouchableOpacity onPress={() => setMkPickerVisible(false)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Batal</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, fontSize: 13, color: '#6b7280' }}>
            Pilih MK, lalu pilih pasangan CPL-nya untuk menambah Sub-CPMK
          </Text>
          <FlatList
            data={mk.filter(m => getMkCpls(m.id).length > 0)}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={
              <View style={{ padding: 30, alignItems: 'center' }}>
                <Text style={{ color: '#6b7280', textAlign: 'center' }}>
                  Belum ada MK yang dipetakan ke CPL.{'\n'}Lakukan pemetaan MK–CPL terlebih dahulu.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6' }}
                onPress={() => {
                  setPickerSelectedMk(item);
                  setMkPickerVisible(false);
                  setCplPickerVisible(true);
                }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{item.nama_mk}</Text>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {item.kode_mk} · {getMkCpls(item.id).length} pasangan CPL
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Modal Pilih CPL Pair */}
      <Modal visible={cplPickerVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Pilih Pasangan CPL</Text>
              {pickerSelectedMk && <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{pickerSelectedMk.kode_mk} — {pickerSelectedMk.nama_mk}</Text>}
            </View>
            <TouchableOpacity onPress={() => setCplPickerVisible(false)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Batal</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, fontSize: 13, color: '#6b7280' }}>
            Pilih pasangan MK–CPL untuk ditambahkan Sub-CPMK-nya
          </Text>
          <FlatList
            data={pickerSelectedMk ? getMkCpls(pickerSelectedMk.id) : []}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                onPress={() => { setCplPickerVisible(false); openEdit(item); }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{getCplCode(item.cpl_id)}</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }} numberOfLines={2}>
                    {getCplDesc(item.cpl_id)?.slice(0, 80)}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    Bobot: {Number(item.bobot).toFixed(4)} · {getSubCpmks(item.id).length} Sub-CPMK
                  </Text>
                </View>
                <Text style={{ fontSize: 20, color: '#9ca3af', marginLeft: 10 }}>›</Text>
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
  infoBanner: { backgroundColor: '#f0f4f9', borderRadius: Radius.sm, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: Colors.aliceBlue },
  infoText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: Colors.eerieBlack, lineHeight: 20 },
  warningBanner: { backgroundColor: '#fef2f2', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#fecaca' },
  warningText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: '#b91c1c' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, zIndex: 2 },
  filterRow: { flexDirection: 'row', gap: 8, flex: 1, paddingRight: 8 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flex: 1, justifyContent: 'space-between' },
  filterBtnText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: '#374151', flex: 1 },
  viewModeToggle: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 4 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleBtnText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: '#6b7280' },
  toggleBtnTextActive: { color: '#111827' },
  matrixContainer: { backgroundColor: '#fff', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  matrixRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.ghostWhite },
  matrixCellHeader: { padding: 12, backgroundColor: '#F6F5FA', borderRightWidth: 1, borderRightColor: Colors.ghostWhite, justifyContent: 'center' },
  matrixHeaderText: { fontSize: 12, fontFamily: 'Urbanist_700Bold', color: '#4b5563', textAlign: 'center' },
  matrixCell: { padding: 12, borderRightWidth: 1, borderRightColor: Colors.ghostWhite, justifyContent: 'center' },
  mkCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 16, ...Shadows.sm },
  mkHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.ghostWhite },
  mkBadges: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  mkName: { fontSize: 15, fontFamily: 'Urbanist_700Bold', color: Colors.eerieBlack },
  emptyBox: { padding: 20, alignItems: 'center' },
  emptySubBox: { paddingVertical: 14, paddingHorizontal: 16 },
  emptyText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: Colors.textMuted },
  cplSection: { borderTopWidth: 1, borderTopColor: Colors.ghostWhite },
  cplHeader: { padding: 16, backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: Colors.ghostWhite, flexDirection: 'row', justifyContent: 'space-between' },
  cplBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' },
  cplBobotLabel: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: Colors.textMuted },
  cplDesc: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: '#4b5563', lineHeight: 19, marginBottom: 8 },
  tableWrapper: { borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  thText: { fontSize: 12, fontFamily: 'Urbanist_700Bold', color: '#6b7280' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  subBobot: { fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', color: Colors.eerieBlack },
  subDesc: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: '#4b5563', lineHeight: 18 },
  subPct: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: Colors.textSecondary },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0066FF', alignItems: 'center', justifyContent: 'center', ...Shadows.md, zIndex: 10 },
  fabText: { color: 'white', fontSize: 32, lineHeight: 36, fontWeight: 'bold' },
  subInputLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 2 },
  subInputHint: { fontSize: 11, color: '#9ca3af', marginBottom: 6 },
  subInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 14 },
});
