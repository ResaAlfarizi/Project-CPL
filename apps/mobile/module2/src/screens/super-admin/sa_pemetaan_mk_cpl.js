import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar,
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback,
  Keyboard, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mkCplApi, mkApi, cplApi, prodiApi } from '../../services/api';

const THEME_COLOR  = '#cdddf4';
const PRIMARY_DARK = '#24354a';
const PRIMARY_BLUE = '#577590';
const DANGER_COLOR = '#c62828';

export default function SAPemetaanMKCPLScreen({ navigation }) {
  const [isLoading, setIsLoading]   = useState(true);
  const [mkCplData, setMkCplData]   = useState([]);
  const [mkList,    setMkList]      = useState([]);
  const [cplList,   setCplList]     = useState([]);    // semua CPL (untuk matrix)
  const [prodiList, setProdiList]   = useState([]);

  // Filter
  const [filterProdi, setFilterProdi] = useState(null);
  const [filterMk,    setFilterMk]    = useState(null);
  const [viewMode,    setViewMode]    = useState('table'); // 'table' | 'matrix'

  // CPL yang tersedia di form (bergantung prodi MK yang dipilih)
  const [formCplOptions, setFormCplOptions] = useState([]);

  // Modal
  const [modalVisible,  setModalVisible]  = useState(false);
  const [editId,        setEditId]        = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType,    setPickerType]    = useState('');

  // Form state
  const [formMk,    setFormMk]    = useState(null);
  const [formCpl,   setFormCpl]   = useState(null);
  const [formBobot, setFormBobot] = useState('');

  // Alert
  const [alertConfig, setAlertConfig] = useState({
    visible: false, type: '', title: '', message: ''
  });

  // ─────────────────────────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resMkCpl, resMk, resCpl, resProdi] = await Promise.all([
        mkCplApi.getAll().catch(() => ({ data: [] })),
        mkApi.getAll().catch(()    => ({ data: [] })),
        cplApi.getAll().catch(()   => ({ data: [] })),
        prodiApi.getAll().catch(() => ({ data: [] })),
      ]);
      setMkCplData(resMkCpl?.data || []);
      setMkList(resMk?.data       || []);
      setCplList(resCpl?.data     || []);
      setProdiList(resProdi?.data || []);
    } catch {
      showAlert('error', 'Gagal Memuat', 'Tidak dapat terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Saat filter prodi berubah → reset filter MK
  useEffect(() => { setFilterMk(null); }, [filterProdi]);

  // Saat formMk dipilih → ambil CPL sesuai prodi MK tersebut
  useEffect(() => {
    if (!formMk) { setFormCplOptions([]); setFormCpl(null); return; }

    const prodiId = formMk.prodi_id;
    if (!prodiId) { setFormCplOptions(cplList); return; }

    // Gunakan getByProdi agar CPL yang ditampilkan sesuai prodi MK
    cplApi.getByProdi(prodiId)
      .then(res => setFormCplOptions(res?.data || []))
      .catch(() => {
        // fallback: filter lokal dari cplList
        setFormCplOptions(cplList.filter(c => String(c.prodi_id) === String(prodiId)));
      });
    setFormCpl(null);
  }, [formMk, cplList]);

  // ─────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────

  const showAlert = (type, title, message) =>
    setAlertConfig({ visible: true, type, title, message });

  // Hitung total bobot per mk_id dari mkCplData
  const totalBobotPerMk = useMemo(() => {
    const map = {};
    mkCplData.forEach(item => {
      const mkId = item.mk_id;
      map[mkId]  = (map[mkId] || 0) + (parseFloat(item.bobot) || 0);
    });
    return map;
  }, [mkCplData]);

  // Data tabel: filter berdasarkan MK yang dipilih
  const filteredData = useMemo(() => {
    if (!filterMk) return mkCplData;
    return mkCplData.filter(item => String(item.mk_id) === String(filterMk.id));
  }, [mkCplData, filterMk]);

  // Daftar MK: filter berdasarkan prodi yang dipilih
  const filteredMkList = useMemo(() => {
    if (!filterProdi) return mkList;
    return mkList.filter(mk => String(mk.prodi_id) === String(filterProdi.id));
  }, [mkList, filterProdi]);

  // Info MK yang sedang dipilih (untuk banner detail)
  const selectedMkInfo = useMemo(() => {
    if (!filterMk) return null;
    return mkList.find(mk => String(mk.id) === String(filterMk.id));
  }, [filterMk, mkList]);

  const totalBobot    = filterMk ? (totalBobotPerMk[filterMk.id] || 0) : 0;
  const isBobotValid  = Math.abs(totalBobot - 1.0) < 0.001;

  // ─────────────────────────────────────────────────────────────────
  // CRUD
  // ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formMk || !formCpl || !formBobot) {
      showAlert('error', 'Data Tidak Lengkap', 'Pilih MK, CPL, dan isi bobot.');
      return;
    }
    const bobot = parseFloat(formBobot);
    if (isNaN(bobot) || bobot <= 0 || bobot > 1) {
      showAlert('error', 'Bobot Tidak Valid',
        'Bobot harus berupa angka desimal antara 0 dan 1 (contoh: 0.4)');
      return;
    }

    // Validasi: pastikan total bobot tidak melebihi 1.0 setelah perubahan
    const existingTotal = totalBobotPerMk[formMk.id] || 0;
    const editingBobot  = editId
      ? (parseFloat(mkCplData.find(m => m.id === editId)?.bobot) || 0)
      : 0;
    const newTotal = existingTotal - editingBobot + bobot;

    if (newTotal > 1.0001) {
      showAlert('error', 'Bobot Melebihi 1.0',
        `Total bobot setelah perubahan: ${newTotal.toFixed(4)}. Kurangi bobot agar total ≤ 1.0`);
      return;
    }

    try {
      // Sesuai struktur tabel mk_cpl: { mk_id, cpl_id, bobot }
      const payload = { mk_id: formMk.id, cpl_id: formCpl.id, bobot };
      if (editId) {
        await mkCplApi.update(editId, payload);
      } else {
        await mkCplApi.create(payload);
      }
      closeModal();
      await fetchAllData();
      setTimeout(() =>
        showAlert('success', 'Berhasil!', 'Pemetaan MK-CPL berhasil disimpan.'), 300);
    } catch (err) {
      showAlert('error', 'Gagal Simpan', err.message || 'Terjadi kesalahan server.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Hapus Pemetaan', 'Yakin hapus pemetaan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya, Hapus', style: 'destructive',
        onPress: async () => {
          try {
            await mkCplApi.delete(id);
            await fetchAllData();
            setTimeout(() =>
              showAlert('success', 'Dihapus!', 'Pemetaan berhasil dihapus.'), 300);
          } catch (err) {
            showAlert('error', 'Gagal Hapus', err.message);
          }
        }
      }
    ]);
  };

  // Buka modal edit — isi form dari data existing
  const openEditModal = (item) => {
    const mk  = mkList.find(m => String(m.id) === String(item.mk_id));
    const cpl = cplList.find(c => String(c.id) === String(item.cpl_id));
    setEditId(item.id);
    setFormMk(mk   ? { ...mk,  label: `${mk.kode_mk} - ${mk.nama_mk}` }   : null);
    setFormCpl(cpl ? { ...cpl, label: cpl.kode_cpl }                        : null);
    setFormBobot(String(item.bobot || ''));
    setModalVisible(true);
  };

  // Buka modal tambah baru — opsional pre-fill MK dari filter
  const openAddModal = (prefillMk = null) => {
    setEditId(null);
    if (prefillMk) {
      setFormMk({ ...prefillMk, label: `${prefillMk.kode_mk} - ${prefillMk.nama_mk}` });
    } else {
      setFormMk(null);
    }
    setFormCpl(null);
    setFormBobot('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditId(null);
    setFormMk(null);
    setFormCpl(null);
    setFormBobot('');
  };

  // ─────────────────────────────────────────────────────────────────
  // PICKER
  // ─────────────────────────────────────────────────────────────────

  const getPickerOptions = () => {
    switch (pickerType) {
      case 'prodi':
        return prodiList.map(p => ({
          id: p.id, label: `${p.kode_prodi} - ${p.nama_prodi}`
        }));
      case 'filterMk':
        return filteredMkList.map(mk => ({
          id: mk.id, label: `${mk.kode_mk} - ${mk.nama_mk}`
        }));
      case 'formMk':
        // Saat tambah, boleh pilih semua MK
        return mkList.map(mk => ({
          ...mk, id: mk.id, label: `${mk.kode_mk} - ${mk.nama_mk}`
        }));
      case 'formCpl':
        // CPL sudah difilter berdasarkan prodi dari formMk
        return formCplOptions.map(cpl => ({
          ...cpl, id: cpl.id, label: cpl.kode_cpl, desc: cpl.deskripsi
        }));
      default:
        return [];
    }
  };

  const handlePickerSelect = (item) => {
    setPickerVisible(false);
    if (pickerType === 'prodi')    { setFilterProdi(item); }
    else if (pickerType === 'filterMk') { setFilterMk(item); }
    else if (pickerType === 'formMk')   { setFormMk(item); }
    else if (pickerType === 'formCpl')  { setFormCpl(item); }
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDER — TABLE ITEM
  // ─────────────────────────────────────────────────────────────────

  const renderTableItem = ({ item }) => {
    // Resolusi nama dari lookup lokal (API sudah join, atau fallback ke list)
    const cpl    = cplList.find(c => String(c.id) === String(item.cpl_id));
    const bobot  = parseFloat(item.bobot) || 0;
    const persen = (bobot * 100).toFixed(1);

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.cplBadge}>
            <Text style={styles.cplBadgeText}>
              {item.kode_cpl || cpl?.kode_cpl || 'CPL'}
            </Text>
          </View>
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={styles.cardDesc} numberOfLines={2}>
              {item.deskripsi_cpl || cpl?.deskripsi || '-'}
            </Text>
            <View style={styles.bobotRow}>
              <Text style={styles.bobotText}>{bobot.toFixed(4)}</Text>
              <View style={styles.progressBarWrap}>
                <View style={[styles.progressBarFill, { width: `${persen}%` }]} />
              </View>
              <Text style={styles.persenText}>{persen}%</Text>
            </View>
          </View>
        </View>
        <View style={styles.actionBtns}>
          <TouchableOpacity style={styles.btnEdit} onPress={() => openEditModal(item)}>
            <Ionicons name="pencil" size={15} color="#0284c7" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash" size={15} color={DANGER_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDER — MATRIX VIEW
  // Menampilkan MK (baris) × CPL (kolom) dengan grouping per prodi
  // ─────────────────────────────────────────────────────────────────

  const MatrixView = () => {
    // Saat matrix: tampilkan semua MK (atau filter prodi saja)
    const matrixMkList = filteredMkList.length > 0 ? filteredMkList : mkList;

    // Group CPL berdasarkan prodi untuk header kolom
    const cplGrouped = useMemo(() => {
      const groups = {};
      cplList.forEach(cpl => {
        const prodi = prodiList.find(p => String(p.id) === String(cpl.prodi_id));
        const key   = prodi?.kode_prodi || 'Lainnya';
        if (!groups[key]) groups[key] = [];
        groups[key].push(cpl);
      });
      return groups;
    }, []);

    // Flat list CPL berurutan sesuai grouping
    const flatCplList = Object.values(cplGrouped).flat();

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.matrixTitle}>Matrix Pemetaan MK-CPL</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            {/* ── Header baris 1: Grup prodi ── */}
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.matrixCorner}>
                <Text style={styles.matrixHeaderText}>MATA KULIAH</Text>
              </View>
              {Object.entries(cplGrouped).map(([prodiKode, cpls]) => (
                <View
                  key={prodiKode}
                  style={[styles.matrixGroupHeader, { width: 80 * cpls.length }]}
                >
                  <Text style={styles.matrixGroupText}>CPL {prodiKode}</Text>
                </View>
              ))}
            </View>

            {/* ── Header baris 2: Kode CPL individual ── */}
            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.matrixCorner, { height: 44 }]} />
              {flatCplList.map(cpl => (
                <View key={cpl.id} style={styles.matrixColHeader}>
                  <Text style={styles.matrixCplText}>{cpl.kode_cpl}</Text>
                </View>
              ))}
            </View>

            {/* ── Baris data MK ── */}
            {matrixMkList.map(mk => (
              <View key={mk.id} style={{ flexDirection: 'row' }}>
                <View style={styles.matrixRowHeader}>
                  <Text style={styles.matrixMkText}>{mk.kode_mk}</Text>
                  <Text style={styles.matrixMkName} numberOfLines={1}>{mk.nama_mk}</Text>
                </View>
                {flatCplList.map(cpl => {
                  const mapping = mkCplData.find(
                    m => String(m.mk_id) === String(mk.id) &&
                         String(m.cpl_id) === String(cpl.id)
                  );
                  return (
                    <View key={cpl.id} style={[styles.matrixCell, mapping && styles.matrixCellFilled]}>
                      {mapping && (
                        <Text style={styles.matrixCellText}>
                          {parseFloat(mapping.bobot).toFixed(4)}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    );
  };

  // ─────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────

  return (
    <ImageBackground
      source={require('../../../assets/uinsa2.jpeg')}
      style={styles.container}
      imageStyle={{ opacity: 0.1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Pemetaan MK-CPL</Text>
          <Text style={styles.headerSubtitle}>Petakan mata kuliah ke capaian pembelajaran lulusan</Text>
        </View>
      </View>

      {/* ── ATURAN BISNIS BANNER ── */}
      <View style={styles.ruleBanner}>
        <Ionicons name="bulb" size={18} color="#166534" style={{ marginRight: 8 }} />
        <Text style={styles.ruleBannerText}>
          <Text style={{ fontFamily: 'Urbanist-Bold' }}>Aturan: </Text>
          Total bobot semua CPL yang dipetakan ke satu MK harus = 1.0. Tambahkan pemetaan, lalu klik{' '}
          <Text style={{ fontFamily: 'Urbanist-Bold' }}>Simpan ke Database</Text>
        </Text>
      </View>

      {/* ── CONTROL BAR ── */}
      <View style={styles.controlBar}>
        {/* Filter Prodi */}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => { setPickerType('prodi'); setPickerVisible(true); }}
        >
          <Text style={styles.filterBtnText} numberOfLines={1}>
            {filterProdi ? filterProdi.label.split(' - ')[0] : 'Semua Prodi'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={PRIMARY_BLUE} />
        </TouchableOpacity>

        {/* Filter MK */}
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => { setPickerType('filterMk'); setPickerVisible(true); }}
        >
          <Text style={styles.filterBtnText} numberOfLines={1}>
            {filterMk ? filterMk.label.split(' - ')[0] : 'Semua MK'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={PRIMARY_BLUE} />
        </TouchableOpacity>

        {/* Toggle Matrix / Table */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'matrix' && styles.toggleActive]}
            onPress={() => setViewMode('matrix')}
          >
            <Text style={[styles.toggleText, viewMode === 'matrix' && styles.toggleActiveText]}>
              Matrix
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'table' && styles.toggleActive]}
            onPress={() => setViewMode('table')}
          >
            <Text style={[styles.toggleText, viewMode === 'table' && styles.toggleActiveText]}>
              Table
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tombol Tambah Pemetaan */}
        <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal()}>
          <Ionicons name="add" size={18} color={PRIMARY_DARK} />
          <Text style={styles.addBtnText}>Tambah Pemetaan</Text>
        </TouchableOpacity>
      </View>

      {/* ── DETAIL MK + INDIKATOR BOBOT + QUICK ACTIONS ── */}
      {filterMk && selectedMkInfo && viewMode === 'table' && (
        <View style={styles.mkDetailBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.mkDetailTitle}>
              {selectedMkInfo.kode_mk} - {selectedMkInfo.nama_mk}
            </Text>
            <Text style={styles.mkDetailSub}>
              {selectedMkInfo.sks} SKS • Sem {selectedMkInfo.semester}
            </Text>
          </View>

          {/* Kalkulator bobot otomatis */}
          <View style={styles.bobotIndicator}>
            <Text style={styles.bobotIndicatorLabel}>∑ bobot</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.bobotIndicatorValue,
                { color: isBobotValid ? '#166534' : DANGER_COLOR }
              ]}>
                {totalBobot.toFixed(4)}
              </Text>
              <Ionicons
                name={isBobotValid ? 'checkmark-circle' : 'warning'}
                size={16}
                color={isBobotValid ? '#166534' : DANGER_COLOR}
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>

          {/* Quick actions: + CPL & Simpan */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickBtnCpl}
              onPress={() => openAddModal(selectedMkInfo)}
            >
              <Ionicons name="add" size={14} color={PRIMARY_DARK} />
              <Text style={styles.quickBtnCplText}>CPL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtnSimpan, !isBobotValid && styles.quickBtnDisabled]}
              onPress={() => {
                if (!isBobotValid) {
                  showAlert('error', 'Bobot Belum Valid',
                    `Total bobot saat ini ${totalBobot.toFixed(4)}. Pastikan total = 1.0 sebelum menyimpan.`);
                  return;
                }
                showAlert('success', 'Data Tersimpan',
                  'Pemetaan MK-CPL sudah tersimpan ke database.');
              }}
            >
              <Ionicons name="save" size={14} color="#FFF" />
              <Text style={styles.quickBtnSimpanText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── KONTEN UTAMA ── */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_DARK} />
        </View>
      ) : viewMode === 'matrix' ? (
        <MatrixView />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, i) => (item.id || i).toString()}
          renderItem={renderTableItem}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={fetchAllData}
          ListHeaderComponent={
            filteredData.length > 0 && filterMk ? (
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>KODE CPL</Text>
                <Text style={[styles.tableHeaderText, { flex: 3 }]}>DESKRIPSI CPL</Text>
                <Text style={[styles.tableHeaderText, { width: 60 }]}>BOBOT</Text>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>% KONTRIBUSI</Text>
                <Text style={[styles.tableHeaderText, { width: 70 }]}>AKSI</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="git-network-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                {filterMk
                  ? 'Belum ada pemetaan untuk MK ini. Tekan + CPL untuk menambah.'
                  : 'Pilih Mata Kuliah untuk melihat pemetaan CPL-nya.'}
              </Text>
            </View>
          }
        />
      )}

      {/* ──────────────── MODAL FORM ──────────────── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editId ? 'Edit Pemetaan MK-CPL' : 'Tambah Pemetaan MK-CPL'}
            </Text>

            {/* Pilih MK */}
            <TouchableOpacity
              style={styles.inputDropdown}
              onPress={() => { setPickerType('formMk'); setPickerVisible(true); }}
            >
              <Ionicons name="library-outline" size={20} color={PRIMARY_BLUE} style={{ marginRight: 10 }} />
              <Text style={[styles.dropdownValue, !formMk && { color: '#94A3B8' }]} numberOfLines={1}>
                {formMk ? formMk.label : 'Pilih Mata Kuliah'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Pilih CPL — dinonaktifkan sampai MK dipilih */}
            <TouchableOpacity
              style={[styles.inputDropdown, !formMk && { opacity: 0.5 }]}
              disabled={!formMk}
              onPress={() => { setPickerType('formCpl'); setPickerVisible(true); }}
            >
              <Ionicons name="analytics-outline" size={20} color={PRIMARY_BLUE} style={{ marginRight: 10 }} />
              <Text style={[styles.dropdownValue, !formCpl && { color: '#94A3B8' }]} numberOfLines={1}>
                {formCpl ? formCpl.label : formMk ? 'Pilih CPL (sesuai prodi MK)' : 'Pilih CPL'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Input Bobot */}
            <View style={styles.inputRow}>
              <Ionicons name="scale-outline" size={20} color={PRIMARY_BLUE} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.inputBobot}
                placeholder="Bobot (contoh: 0.4)"
                placeholderTextColor="#94A3B8"
                value={formBobot}
                onChangeText={setFormBobot}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.bobotHint}>
              Total bobot seluruh CPL dalam satu MK harus = 1.0
              {formMk && (
                `  |  Sisa bobot tersedia: ${Math.max(0,
                  1 - (totalBobotPerMk[formMk.id] || 0) -
                  (editId ? (parseFloat(mkCplData.find(m => m.id === editId)?.bobot) || 0) : 0)
                ).toFixed(4)}`
              )}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={closeModal}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleSave}>
                <Ionicons name="save" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.btnSubmitText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ──────────────── MODAL PICKER ──────────────── */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>
              {pickerType === 'prodi'     ? 'Pilih Program Studi'
                : pickerType === 'filterMk' || pickerType === 'formMk' ? 'Pilih Mata Kuliah'
                : 'Pilih CPL'}
            </Text>

            {/* Opsi reset filter */}
            {(pickerType === 'prodi' || pickerType === 'filterMk') && (
              <TouchableOpacity
                style={[styles.pickerOption, { backgroundColor: '#f8fafc' }]}
                onPress={() => {
                  setPickerVisible(false);
                  if (pickerType === 'prodi')     setFilterProdi(null);
                  if (pickerType === 'filterMk')  setFilterMk(null);
                }}
              >
                <Text style={[styles.pickerOptionText, { color: PRIMARY_BLUE }]}>
                  — Semua {pickerType === 'prodi' ? 'Prodi' : 'MK'} —
                </Text>
              </TouchableOpacity>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
              {getPickerOptions().map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.pickerOption}
                  onPress={() => handlePickerSelect(opt)}
                >
                  <Text style={styles.pickerOptionText}>{opt.label}</Text>
                  {opt.desc && (
                    <Text style={styles.pickerOptionDesc} numberOfLines={2}>
                      {opt.desc}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
              {getPickerOptions().length === 0 && (
                <Text style={[styles.pickerOptionText, { color: '#94A3B8', padding: 16 }]}>
                  Tidak ada data tersedia.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.pickerCloseBtn}
              onPress={() => setPickerVisible(false)}
            >
              <Text style={styles.pickerCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ──────────────── MODAL ALERT ──────────────── */}
      <Modal visible={alertConfig.visible} animationType="fade" transparent>
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[
              styles.alertIconWrap,
              { backgroundColor: alertConfig.type === 'success' ? '#e0f2f1' : '#ffebee' }
            ]}>
              <Ionicons
                name={alertConfig.type === 'success' ? 'checkmark-circle' : 'warning'}
                size={45}
                color={alertConfig.type === 'success' ? '#00796b' : DANGER_COLOR}
              />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity
              style={[styles.btnAlertOK,
                { backgroundColor: alertConfig.type === 'success' ? PRIMARY_BLUE : DANGER_COLOR }
              ]}
              onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
            >
              <Text style={styles.btnAlertOKText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F6F5FA' },

  // Header
  header:            { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  backBtn:           { padding: 8, marginRight: 12 },
  headerTextWrap:    { flex: 1 },
  headerTitle:       { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 2 },
  headerSubtitle:    { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },

  // Banner aturan bisnis
  ruleBanner:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', marginHorizontal: 20, marginTop: 12, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#bbf7d0' },
  ruleBannerText:    { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#166534', flex: 1 },

  // Control bar
  controlBar:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterBtn:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 4, flex: 1 },
  filterBtnText:     { fontFamily: 'Urbanist-Medium', fontSize: 12, color: PRIMARY_BLUE, flex: 1 },
  viewToggle:        { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 3 },
  toggleBtn:         { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  toggleActive:      { backgroundColor: PRIMARY_DARK },
  toggleText:        { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#94A3B8' },
  toggleActiveText:  { color: '#FFF' },
  addBtn:            { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME_COLOR, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 4 },
  addBtnText:        { fontFamily: 'Urbanist-Bold', fontSize: 12, color: PRIMARY_DARK },

  // MK detail banner + quick actions
  mkDetailBanner:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 8, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1, gap: 8 },
  mkDetailTitle:        { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK },
  mkDetailSub:          { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', marginTop: 2 },
  bobotIndicator:       { alignItems: 'flex-end' },
  bobotIndicatorLabel:  { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#94A3B8' },
  bobotIndicatorValue:  { fontFamily: 'Urbanist-Bold', fontSize: 16 },
  quickActions:         { flexDirection: 'row', gap: 6 },
  quickBtnCpl:          { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME_COLOR, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, gap: 3 },
  quickBtnCplText:      { fontFamily: 'Urbanist-Bold', fontSize: 12, color: PRIMARY_DARK },
  quickBtnSimpan:       { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_DARK, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, gap: 3 },
  quickBtnSimpanText:   { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#FFF' },
  quickBtnDisabled:     { backgroundColor: '#94A3B8' },

  // Table header
  tableHeader:      { flexDirection: 'row', paddingHorizontal: 4, paddingBottom: 6, marginBottom: 4 },
  tableHeaderText:  { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Table card
  centerContainer:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer:    { padding: 20, paddingBottom: 40 },
  card:             { flexDirection: 'row', backgroundColor: '#FFF', padding: 14, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1, alignItems: 'center' },
  cardLeft:         { flex: 1, flexDirection: 'row', alignItems: 'center' },
  cplBadge:         { backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start' },
  cplBadgeText:     { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#065f46' },
  cardDesc:         { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', lineHeight: 18 },
  bobotRow:         { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  bobotText:        { fontFamily: 'Urbanist-Bold', fontSize: 13, color: PRIMARY_DARK, width: 55 },
  progressBarWrap:  { flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill:  { height: '100%', backgroundColor: THEME_COLOR, borderRadius: 3 },
  persenText:       { fontFamily: 'Urbanist-Bold', fontSize: 12, color: PRIMARY_BLUE, width: 40, textAlign: 'right' },
  actionBtns:       { flexDirection: 'row', gap: 6, marginLeft: 8 },
  btnEdit:          { padding: 8, backgroundColor: '#e0f2fe', borderRadius: 10 },
  btnDelete:        { padding: 8, backgroundColor: '#ffebee', borderRadius: 10 },
  emptyWrap:        { alignItems: 'center', paddingTop: 50 },
  emptyText:        { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 12, textAlign: 'center', paddingHorizontal: 20 },

  // Matrix
  matrixTitle:       { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, marginBottom: 16 },
  matrixGroupHeader: { height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: PRIMARY_DARK, borderWidth: 1, borderColor: '#E2E8F0' },
  matrixGroupText:   { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#FFF', textAlign: 'center' },
  matrixCorner:      { width: 110, height: 76, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#E2E8F0' },
  matrixHeaderText:  { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#64748B', textAlign: 'center' },
  matrixColHeader:   { width: 80, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#E2E8F0' },
  matrixCplText:     { fontFamily: 'Urbanist-Bold', fontSize: 11, color: PRIMARY_BLUE, textAlign: 'center' },
  matrixRowHeader:   { width: 110, justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 4, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#f8fafc' },
  matrixMkText:      { fontFamily: 'Urbanist-Bold', fontSize: 11, color: PRIMARY_DARK },
  matrixMkName:      { fontFamily: 'Urbanist-Regular', fontSize: 10, color: '#64748B' },
  matrixCell:        { width: 80, height: 44, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  matrixCellFilled:  { backgroundColor: '#dbeafe' },
  matrixCellText:    { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#1d4ed8' },

  // Modal
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'flex-end' },
  modalContent:     { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingBottom: 40 },
  modalHandle:      { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitle:       { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 20 },
  inputDropdown:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 18, paddingHorizontal: 15, paddingVertical: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  dropdownValue:    { flex: 1, fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121' },
  inputRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 18, paddingHorizontal: 15, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  inputBobot:       { flex: 1, paddingVertical: 14, fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121' },
  bobotHint:        { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#94A3B8', marginBottom: 16, paddingLeft: 4 },
  buttonRow:        { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnCancel:        { flex: 1, backgroundColor: '#ffebee', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelText:    { color: DANGER_COLOR, fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmit:        { flex: 1, backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnSubmitText:    { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },

  // Picker
  pickerOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  pickerBox:           { backgroundColor: '#FFF', borderRadius: 24, padding: 20, maxHeight: '70%' },
  pickerTitle:         { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 15 },
  pickerOption:        { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  pickerOptionText:    { fontFamily: 'Urbanist-Medium', fontSize: 15, color: '#212121', textAlign: 'center' },
  pickerOptionDesc:    { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 2 },
  pickerCloseBtn:      { marginTop: 12, paddingVertical: 10, paddingHorizontal: 30, backgroundColor: '#ffebee', borderRadius: 16, alignSelf: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  pickerCloseText:     { color: DANGER_COLOR, fontFamily: 'Urbanist-Bold', fontSize: 14 },

  // Alert
  alertOverlay:    { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox:        { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '80%', alignItems: 'center', elevation: 20 },
  alertIconWrap:   { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle:      { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10, textAlign: 'center' },
  alertMessage:    { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  btnAlertOK:      { borderRadius: 20, paddingVertical: 14, paddingHorizontal: 30, alignItems: 'center', elevation: 3 },
  btnAlertOKText:  { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 16 },
});