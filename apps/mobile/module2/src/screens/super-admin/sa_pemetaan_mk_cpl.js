import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar,
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback,
  Keyboard, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mkCplApi, mkSaApi, cplApi, prodiApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;
const PRIMARY_DARK = BASE.primary;
const PRIMARY_BLUE = BASE.primaryLight;
const DANGER_COLOR = BASE.error;
const GREEN = BASE.success;

// ─────────────────────────────────────────────────────────────────
// CUSTOM ALERT (pola dari kode 2)
// ─────────────────────────────────────────────────────────────────
function CustomAlert({ visible, type, title, message, onConfirm, onCancel, confirmText, cancelText }) {
  if (!visible) return null;
  const isSuccess = type === 'success';
  const isDanger  = type === 'danger';
  const isError   = type === 'error';
  const iconName  = isSuccess ? 'checkmark-circle' : isDanger ? 'trash' : isError ? 'close-circle' : 'alert-circle';
  const iconColor = isSuccess ? GREEN : (isDanger || isError) ? DANGER_COLOR : PRIMARY_BLUE;
  const iconBg    = isSuccess ? '#dcfce7' : (isDanger || isError) ? '#fee2e2' : '#dbeafe';

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={alertStyles.overlay}>
        <View style={alertStyles.box}>
          <View style={[alertStyles.iconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={34} color={iconColor} />
          </View>
          <Text style={alertStyles.title}>{title}</Text>
          {!!message && <Text style={alertStyles.message}>{message}</Text>}
          <View style={alertStyles.btnRow}>
            {!!onCancel && (
              <TouchableOpacity style={alertStyles.btnCancel} onPress={onCancel}>
                <Text style={alertStyles.btnCancelText}>{cancelText || 'Batal'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                alertStyles.btnConfirm,
                { backgroundColor: isSuccess ? GREEN : (isDanger || isError) ? DANGER_COLOR : PRIMARY_BLUE },
                !onCancel && { flex: 1 },
              ]}
              onPress={onConfirm}
            >
              <Text style={alertStyles.btnConfirmText}>{confirmText || 'OK'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const alertStyles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(36,53,74,0.55)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  box:            { backgroundColor: '#FFF', borderRadius: 28, padding: 28, width: '100%', alignItems: 'center', elevation: 24 },
  iconCircle:     { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title:          { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 8 },
  message:        { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 4 },
  btnRow:         { flexDirection: 'row', gap: 12, marginTop: 22, width: '100%' },
  btnCancel:      { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  btnCancelText:  { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#64748B' },
  btnConfirm:     { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  btnConfirmText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#FFF' },
});

// ─────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────
export default function SAPemetaanMKCPLScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [mkCplData, setMkCplData] = useState([]);
  const [mkList,    setMkList]    = useState([]);
  const [cplList,   setCplList]   = useState([]);
  const [prodiList, setProdiList] = useState([]);

  // Filter
  const [filterProdi, setFilterProdi] = useState(null);
  const [filterMk,    setFilterMk]    = useState(null);
  const [viewMode,    setViewMode]    = useState('table'); // 'table' | 'matrix'

  // CPL yang tersedia di form
  const [formCplOptions, setFormCplOptions] = useState([]);

  // Modal
  const [modalVisible,  setModalVisible]  = useState(false);
  const [editId,        setEditId]        = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType,    setPickerType]    = useState('');

  // Detail Modal
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItem,    setDetailItem]    = useState(null);

  // Form state
  const [formMk,    setFormMk]    = useState(null);
  const [formCpl,   setFormCpl]   = useState(null);
  const [formBobot, setFormBobot] = useState('');
  const [formProdi, setFormProdi] = useState(null); // ← TAMBAH: prodi di form

  // Custom Alert state
  const [alert, setAlert] = useState({
    visible: false, type: 'info', title: '', message: '',
    onConfirm: null, onCancel: null, confirmText: '', cancelText: '',
  });
  const showAlert = (opts) => setAlert({ visible: true, ...opts });
  const hideAlert = () => setAlert(a => ({ ...a, visible: false }));

  // ─── FETCH ──────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resMkCpl, resMk, resCpl, resProdi] = await Promise.all([
        mkCplApi.getAll().catch(() => ({ data: [] })),
        mkSaApi.getAll().catch(()   => ({ data: [] })),
        cplApi.getAll().catch(()    => ({ data: [] })),
        prodiApi.getAll().catch(()  => ({ data: [] })),
      ]);
      setMkCplData(resMkCpl?.data || []);
      setMkList(resMk?.data       || []);
      setCplList(resCpl?.data     || []);
      setProdiList(resProdi?.data || []);
    } catch {
      showAlert({
        type: 'error', title: 'Gagal Memuat',
        message: 'Tidak dapat terhubung ke server.',
        confirmText: 'OK', onConfirm: hideAlert,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);
  useEffect(() => { setFilterMk(null); }, [filterProdi]);

  useEffect(() => {
    if (!formMk) { setFormCplOptions([]); setFormCpl(null); return; }
    const prodiId = formMk.prodi_id;
    if (!prodiId) { setFormCplOptions(cplList); return; }
    cplApi.getByProdi(prodiId)
      .then(res => setFormCplOptions(res?.data || []))
      .catch(() => {
        setFormCplOptions(cplList.filter(c => String(c.prodi_id) === String(prodiId)));
      });
    setFormCpl(null);
  }, [formMk, cplList]);

  // ─── HELPERS ────────────────────────────────────────────────────
  const totalBobotPerMk = useMemo(() => {
    const map = {};
    mkCplData.forEach(item => {
      const mkId = item.mk_id;
      map[mkId]  = (map[mkId] || 0) + (parseFloat(item.bobot) || 0);
    });
    return map;
  }, [mkCplData]);

  const filteredData = useMemo(() => {
    if (!filterMk) return mkCplData;
    return mkCplData.filter(item => String(item.mk_id) === String(filterMk.id));
  }, [mkCplData, filterMk]);

  const filteredMkList = useMemo(() => {
    if (!filterProdi) return mkList;
    return mkList.filter(mk => String(mk.prodi_id) === String(filterProdi.id));
  }, [mkList, filterProdi]);

  const selectedMkInfo = useMemo(() => {
    if (!filterMk) return null;
    return mkList.find(mk => String(mk.id) === String(filterMk.id));
  }, [filterMk, mkList]);

  const totalBobot   = filterMk ? (totalBobotPerMk[filterMk.id] || 0) : 0;
  const isBobotValid = Math.abs(totalBobot - 1.0) < 0.001;

  // ─── CRUD ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formMk || !formCpl || !formBobot) {
      showAlert({ type: 'error', title: 'Data Tidak Lengkap', message: 'Pilih MK, CPL, dan isi bobot.', confirmText: 'Mengerti', onConfirm: hideAlert });
      return;
    }
    const bobot = parseFloat(formBobot);
    if (isNaN(bobot) || bobot <= 0 || bobot > 1) {
      showAlert({ type: 'error', title: 'Bobot Tidak Valid', message: 'Bobot harus berupa angka desimal antara 0 dan 1 (contoh: 0.4)', confirmText: 'Mengerti', onConfirm: hideAlert });
      return;
    }
    const existingTotal = totalBobotPerMk[formMk.id] || 0;
    const editingBobot  = editId ? (parseFloat(mkCplData.find(m => m.id === editId)?.bobot) || 0) : 0;
    const newTotal      = existingTotal - editingBobot + bobot;
    if (newTotal > 1.0001) {
      showAlert({ type: 'error', title: 'Bobot Melebihi 1.0', message: `Total bobot setelah perubahan: ${newTotal.toFixed(4)}. Kurangi bobot agar total ≤ 1.0`, confirmText: 'Mengerti', onConfirm: hideAlert });
      return;
    }

    // Konfirmasi simpan (pola kode 2)
    showAlert({
      type: 'info',
      title: editId ? 'Simpan Perubahan?' : 'Tambah Pemetaan?',
      message: editId
        ? `Perubahan pemetaan ${formMk.kode_mk} → ${formCpl.kode_cpl} akan disimpan.`
        : `Pemetaan ${formMk.kode_mk} → ${formCpl.kode_cpl} dengan bobot ${bobot.toFixed(4)} akan ditambahkan.`,
      confirmText: editId ? 'Simpan' : 'Tambah',
      cancelText: 'Batal',
      onCancel: hideAlert,
      onConfirm: async () => {
        hideAlert();
        try {
          const payload = { mk_id: formMk.id, cpl_id: formCpl.id, bobot };
          if (editId) {
            await mkCplApi.update(editId, payload);
          } else {
            await mkCplApi.create(payload);
          }
          closeModal();
          await fetchAllData();
          setTimeout(() => showAlert({
            type: 'success',
            title: 'Berhasil Disimpan!',
            message: 'Pemetaan MK-CPL berhasil disimpan.',
            confirmText: 'OK', onConfirm: hideAlert,
          }), 300);
        } catch (err) {
          showAlert({ type: 'error', title: 'Gagal Simpan', message: err.message || 'Terjadi kesalahan server.', confirmText: 'OK', onConfirm: hideAlert });
        }
      },
    });
  };

  const handleDelete = (item) => {
    const mk  = mkList.find(m => String(m.id) === String(item.mk_id));
    const cpl = cplList.find(c => String(c.id) === String(item.cpl_id));
    showAlert({
      type: 'danger',
      title: 'Hapus Pemetaan',
      message: `Hapus pemetaan ${mk?.kode_mk || 'MK'} → ${cpl?.kode_cpl || 'CPL'} secara permanen?`,
      confirmText: 'Ya, Hapus', cancelText: 'Batal',
      onCancel: hideAlert,
      onConfirm: async () => {
        hideAlert();
        try {
          await mkCplApi.delete(item.id);
          setDetailVisible(false);
          await fetchAllData();
          setTimeout(() => showAlert({
            type: 'success', title: 'Berhasil Dihapus!',
            message: 'Pemetaan berhasil dihapus dari sistem.',
            confirmText: 'OK', onConfirm: hideAlert,
          }), 350);
        } catch (err) {
          showAlert({ type: 'error', title: 'Gagal Hapus', message: err.message, confirmText: 'OK', onConfirm: hideAlert });
        }
      },
    });
  };

  const openEditModal = (item) => {
    const mk  = mkList.find(m => String(m.id) === String(item.mk_id));
    const cpl = cplList.find(c => String(c.id) === String(item.cpl_id));
    const prodi = prodiList.find(p => String(p.id) === String(mk?.prodi_id));
    setEditId(item.id);
    setFormMk(mk ? { ...mk, label: `${mk.kode_mk} - ${mk.nama_mk}` } : null);
    setFormCpl(cpl ? { ...cpl, label: cpl.kode_cpl } : null);
    setFormBobot(String(item.bobot || ''));
    setFormProdi(prodi ? { ...prodi, label: `${prodi.kode_prodi} - ${prodi.nama_prodi}` } : null);
    setModalVisible(true);
  };

  const openAddModal = (prefillMk = null) => {
    setEditId(null);
    setFormCpl(null);
    setFormBobot('');
    if (prefillMk) {
      setFormMk({ ...prefillMk, label: `${prefillMk.kode_mk} - ${prefillMk.nama_mk}` });
      const prodi = prodiList.find(p => String(p.id) === String(prefillMk.prodi_id));
      setFormProdi(prodi ? { ...prodi, label: `${prodi.kode_prodi} - ${prodi.nama_prodi}` } : null);
    } else {
      setFormMk(null);
      setFormProdi(null);
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditId(null);
    setFormMk(null);
    setFormCpl(null);
    setFormBobot('');
    setFormProdi(null);
  };

  // ─── PICKER ─────────────────────────────────────────────────────
  const getPickerOptions = () => {
    switch (pickerType) {
      case 'prodi':
        return prodiList.map(p => ({ ...p, label: `${p.kode_prodi} - ${p.nama_prodi}` }));
      case 'filterMk':
        return filteredMkList.map(mk => ({ ...mk, label: `${mk.kode_mk} - ${mk.nama_mk}` }));
      case 'formProdi':
        return prodiList.map(p => ({ ...p, label: `${p.kode_prodi} - ${p.nama_prodi}` }));
      case 'formMk':
        // Filter MK berdasarkan prodi yang dipilih di form
        const baseMkList = formProdi
          ? mkList.filter(mk => String(mk.prodi_id) === String(formProdi.id))
          : mkList;
        return baseMkList.map(mk => ({ ...mk, label: `${mk.kode_mk} - ${mk.nama_mk}` }));
      case 'formCpl':
        return formCplOptions.map(cpl => ({ ...cpl, label: cpl.kode_cpl, desc: cpl.deskripsi }));
      default:
        return [];
    }
  };

  const handlePickerSelect = (item) => {
    setPickerVisible(false);
    if (pickerType === 'prodi')     { setFilterProdi(item); }
    else if (pickerType === 'filterMk') { setFilterMk(item); }
    else if (pickerType === 'formProdi') {
      setFormProdi(item);
      setFormMk(null);
      setFormCpl(null);
    }
    else if (pickerType === 'formMk')   { setFormMk(item); }
    else if (pickerType === 'formCpl')  { setFormCpl(item); }
  };

  // ─── RENDER — CARD ITEM (layout baru) ───────────────────────────
  //
  //  [ BADGE CPL ]  Kode CPL         Deskripsi CPL (truncated)
  //                 [======bobot bar======]  bobot   persen%    [>]
  //
  const renderTableItem = ({ item }) => {
    const mk    = mkList.find(m  => String(m.id)  === String(item.mk_id));
    const cpl   = cplList.find(c  => String(c.id)  === String(item.cpl_id));
    const prodi = prodiList.find(p => String(p.id) === String(mk?.prodi_id));

    const bobot  = parseFloat(item.bobot) || 0;
    const persen = (bobot * 100).toFixed(1);
    const kodeCpl = item.kode_cpl || cpl?.kode_cpl || 'CPL';
    const deskCpl = cpl?.deskripsi || '-';

    return (
      <View style={styles.card}>
        {/* Baris atas: Badge + Kode + Deskripsi */}
        <View style={styles.cardTopRow}>
          <View style={styles.cplBadge}>
            <Text style={styles.cplBadgeText}>{kodeCpl}</Text>
          </View>
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={styles.cardCplCode}>{kodeCpl}</Text>
            <Text style={styles.cardCplDesc} numberOfLines={2}>{deskCpl}</Text>
          </View>
        </View>

        {/* Baris bawah: bar + bobot + persen + chevron */}
        <View style={styles.cardBottomRow}>
          {/* Progress bar */}
          <View style={styles.barWrap}>
            <View style={[styles.barFill, { width: `${Math.min(bobot * 100, 100)}%` }]} />
          </View>

          {/* Bobot */}
          <Text style={styles.bobotVal}>{bobot.toFixed(4)}</Text>

          {/* Persen */}
          <View style={styles.persenBadge}>
            <Text style={styles.persenText}>{persen}%</Text>
          </View>

          {/* Chevron button */}
          <TouchableOpacity
            style={styles.chevronBtn}
            onPress={() => {
              setDetailItem({ ...item, mk, cpl, prodi, bobot, persen });
              setDetailVisible(true);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={20} color={PRIMARY_BLUE} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── MATRIX VIEW ────────────────────────────────────────────────
  const MatrixView = () => {
    const matrixMkList = filteredMkList.length > 0 ? filteredMkList : mkList;
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
    const flatCplList = Object.values(cplGrouped).flat();

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.matrixTitle}>Matrix Pemetaan MK-CPL</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.matrixCorner}>
                <Text style={styles.matrixHeaderText}>MATA KULIAH</Text>
              </View>
              {Object.entries(cplGrouped).map(([prodiKode, cpls]) => (
                <View key={prodiKode} style={[styles.matrixGroupHeader, { width: 80 * cpls.length }]}>
                  <Text style={styles.matrixGroupText}>CPL {prodiKode}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.matrixCorner, { height: 44 }]} />
              {flatCplList.map(cpl => (
                <View key={cpl.id} style={styles.matrixColHeader}>
                  <Text style={styles.matrixCplText}>{cpl.kode_cpl}</Text>
                </View>
              ))}
            </View>
            {matrixMkList.map(mk => (
              <View key={mk.id} style={{ flexDirection: 'row' }}>
                <View style={styles.matrixRowHeader}>
                  <Text style={styles.matrixMkText}>{mk.kode_mk}</Text>
                  <Text style={styles.matrixMkName} numberOfLines={1}>{mk.nama_mk}</Text>
                </View>
                {flatCplList.map(cpl => {
                  const mapping = mkCplData.find(
                    m => String(m.mk_id) === String(mk.id) && String(m.cpl_id) === String(cpl.id)
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

  // ─── MAIN RENDER ────────────────────────────────────────────────
  return (
    <ImageBackground
      source={require('../../../assets/uinsa2.jpeg')}
      style={styles.container}
      imageStyle={{ opacity: 0.1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Pemetaan MK-CPL</Text>
          <Text style={styles.headerSubtitle}>Petakan mata kuliah ke capaian pembelajaran lulusan</Text>
        </View>
      </View>

      {/* RULE BANNER */}
      <View style={styles.ruleBanner}>
        <Ionicons name="bulb" size={18} color="#166534" style={{ marginRight: 8 }} />
        <Text style={styles.ruleBannerText}>
          <Text style={{ fontFamily: 'Urbanist-Bold' }}>Aturan: </Text>
          Total bobot semua CPL yang dipetakan ke satu MK harus = 1.0
        </Text>
      </View>

      {/* CONTROL BAR ROW 1 */}
      <View style={styles.controlBarRow1}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'matrix' && styles.toggleActive]}
            onPress={() => setViewMode('matrix')}
          >
            <Text style={[styles.toggleText, viewMode === 'matrix' && styles.toggleActiveText]}>Matrix</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'table' && styles.toggleActive]}
            onPress={() => setViewMode('table')}
          >
            <Text style={[styles.toggleText, viewMode === 'table' && styles.toggleActiveText]}>Table</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal()}>
          <Ionicons name="add" size={18} color={PRIMARY_DARK} />
          <Text style={styles.addBtnText}>Tambah Pemetaan</Text>
        </TouchableOpacity>
      </View>

      {/* CONTROL BAR ROW 2 */}
      <View style={styles.controlBarRow2}>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => { setPickerType('prodi'); setPickerVisible(true); }}
        >
          <Ionicons name="business-outline" size={16} color={PRIMARY_BLUE} style={{ marginRight: 6 }} />
          <Text style={styles.filterBtnText} numberOfLines={1}>
            {filterProdi ? filterProdi.label.split(' - ')[0] : 'Semua Prodi'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={PRIMARY_BLUE} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => { setPickerType('filterMk'); setPickerVisible(true); }}
        >
          <Ionicons name="book-outline" size={16} color={PRIMARY_BLUE} style={{ marginRight: 6 }} />
          <Text style={styles.filterBtnText} numberOfLines={1}>
            {filterMk ? filterMk.label.split(' - ')[0] : 'Semua MK'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={PRIMARY_BLUE} />
        </TouchableOpacity>
      </View>

      {/* MK DETAIL BANNER */}
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
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickBtnCpl} onPress={() => openAddModal(selectedMkInfo)}>
              <Ionicons name="add" size={14} color={PRIMARY_DARK} />
              <Text style={styles.quickBtnCplText}>CPL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtnSimpan, !isBobotValid && styles.quickBtnDisabled]}
              onPress={() => {
                if (!isBobotValid) {
                  showAlert({ type: 'error', title: 'Bobot Belum Valid', message: `Total bobot saat ini ${totalBobot.toFixed(4)}. Pastikan total = 1.0 sebelum menyimpan.`, confirmText: 'Mengerti', onConfirm: hideAlert });
                  return;
                }
                showAlert({ type: 'success', title: 'Data Tersimpan', message: 'Pemetaan MK-CPL sudah tersimpan ke database.', confirmText: 'OK', onConfirm: hideAlert });
              }}
            >
              <Ionicons name="save" size={14} color="#FFF" />
              <Text style={styles.quickBtnSimpanText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* KONTEN UTAMA */}
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

      {/* ══ MODAL DETAIL ══ */}
      <Modal visible={detailVisible} animationType="fade" transparent>
        <View style={styles.detailOverlay}>
          <TouchableWithoutFeedback onPress={() => setDetailVisible(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.detailBox}>
            <Text style={styles.modalTitle}>Detail Pemetaan MK-CPL</Text>

            {detailItem && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4 }}>
                {/* Prodi */}
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelRow}>
                    <Ionicons name="business-outline" size={14} color={PRIMARY_BLUE} style={{ marginRight: 6 }} />
                    <Text style={styles.detailLabel}>Program Studi</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {detailItem.prodi?.kode_prodi || '-'} — {detailItem.prodi?.nama_prodi || '-'}
                  </Text>
                </View>

                {/* MK */}
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelRow}>
                    <Ionicons name="library-outline" size={14} color={PRIMARY_BLUE} style={{ marginRight: 6 }} />
                    <Text style={styles.detailLabel}>Mata Kuliah</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {detailItem.mk?.kode_mk || '-'} — {detailItem.mk?.nama_mk || '-'}
                  </Text>
                  <Text style={styles.detailMeta}>
                    {detailItem.mk?.sks || 0} SKS • Semester {detailItem.mk?.semester || '-'}
                  </Text>
                </View>

                {/* CPL */}
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelRow}>
                    <Ionicons name="analytics-outline" size={14} color={PRIMARY_BLUE} style={{ marginRight: 6 }} />
                    <Text style={styles.detailLabel}>CPL</Text>
                  </View>
                  <View style={styles.cplBadge}>
                    <Text style={styles.cplBadgeText}>{detailItem.cpl?.kode_cpl || '-'}</Text>
                  </View>
                  <Text style={[styles.detailValue, { marginTop: 6 }]}>
                    {detailItem.cpl?.deskripsi || '-'}
                  </Text>
                </View>

                {/* Bobot */}
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelRow}>
                    <Ionicons name="scale-outline" size={14} color={PRIMARY_BLUE} style={{ marginRight: 6 }} />
                    <Text style={styles.detailLabel}>Bobot & Kontribusi</Text>
                  </View>
                  <View style={styles.bobotDetailWrap}>
                    <View style={styles.bobotDetailBox}>
                      <Text style={styles.bobotDetailValue}>{detailItem.bobot?.toFixed(4) || '0.0000'}</Text>
                      <Text style={styles.bobotDetailSub}>Bobot</Text>
                    </View>
                    <View style={styles.bobotDetailBox}>
                      <Text style={styles.bobotDetailValue}>{detailItem.persen || '0'}%</Text>
                      <Text style={styles.bobotDetailSub}>Kontribusi</Text>
                    </View>
                  </View>
                  {/* Progress Bar */}
                  <View style={styles.detailBarWrap}>
                    <View style={[styles.detailBarFill, { width: `${detailItem.persen || 0}%` }]} />
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={styles.detailBtnDelete}
                    onPress={() => {
                      setDetailVisible(false);
                      setTimeout(() => handleDelete(detailItem), 300);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.detailBtnText}>Hapus</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.detailBtnEdit}
                    onPress={() => {
                      setDetailVisible(false);
                      setTimeout(() => openEditModal(detailItem), 300);
                    }}
                  >
                    <Ionicons name="pencil-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.detailBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ══ MODAL FORM (tambah / edit) ══ */}
      <Modal visible={modalVisible} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: 'rgba(36,53,74,0.5)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHandle} />
                  <Text style={styles.modalTitle}>
                    {editId ? 'Edit Pemetaan MK-CPL' : 'Tambah Pemetaan MK-CPL'}
                  </Text>

                  {/* Pilih Prodi */}
                  <Text style={styles.fieldLabel}>Program Studi</Text>
                  <TouchableOpacity
                    style={styles.inputDropdown}
                    onPress={() => { setPickerType('formProdi'); setPickerVisible(true); }}
                  >
                    <Ionicons name="business-outline" size={20} color={PRIMARY_BLUE} style={{ marginRight: 10 }} />
                    <Text style={[styles.dropdownValue, !formProdi && { color: '#94A3B8' }]} numberOfLines={1}>
                      {formProdi ? formProdi.label : 'Pilih Program Studi'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* Pilih MK */}
                  <Text style={styles.fieldLabel}>Mata Kuliah</Text>
                  <TouchableOpacity
                    style={[styles.inputDropdown, !formProdi && { opacity: 0.5 }]}
                    disabled={!formProdi}
                    onPress={() => { setPickerType('formMk'); setPickerVisible(true); }}
                  >
                    <Ionicons name="library-outline" size={20} color={PRIMARY_BLUE} style={{ marginRight: 10 }} />
                    <Text style={[styles.dropdownValue, !formMk && { color: '#94A3B8' }]} numberOfLines={1}>
                      {formMk ? formMk.label : formProdi ? 'Pilih Mata Kuliah' : 'Pilih Prodi terlebih dahulu'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* Pilih CPL */}
                  <Text style={styles.fieldLabel}>CPL</Text>
                  <TouchableOpacity
                    style={[styles.inputDropdown, !formMk && { opacity: 0.5 }]}
                    disabled={!formMk}
                    onPress={() => { setPickerType('formCpl'); setPickerVisible(true); }}
                  >
                    <Ionicons name="analytics-outline" size={20} color={PRIMARY_BLUE} style={{ marginRight: 10 }} />
                    <Text style={[styles.dropdownValue, !formCpl && { color: '#94A3B8' }]} numberOfLines={1}>
                      {formCpl ? formCpl.label : formMk ? 'Pilih CPL (sesuai prodi MK)' : 'Pilih MK terlebih dahulu'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* Input Bobot */}
                  <Text style={styles.fieldLabel}>Bobot</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="scale-outline" size={20} color={PRIMARY_BLUE} style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.inputBobot}
                      placeholder="Contoh: 0.4"
                      placeholderTextColor="#94A3B8"
                      value={formBobot}
                      onChangeText={setFormBobot}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <Text style={styles.bobotHint}>
                    Total bobot seluruh CPL dalam satu MK harus = 1.0
                    {formMk && (
                      `  |  Sisa: ${Math.max(0,
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
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ MODAL PICKER ══ */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>
              {pickerType === 'prodi' || pickerType === 'formProdi' ? 'Pilih Program Studi'
                : pickerType === 'filterMk' || pickerType === 'formMk' ? 'Pilih Mata Kuliah'
                : 'Pilih CPL'}
            </Text>

            {(pickerType === 'prodi' || pickerType === 'filterMk') && (
              <TouchableOpacity
                style={[styles.pickerOption, { backgroundColor: '#f8fafc' }]}
                onPress={() => {
                  setPickerVisible(false);
                  if (pickerType === 'prodi')    setFilterProdi(null);
                  if (pickerType === 'filterMk') setFilterMk(null);
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
                    <Text style={styles.pickerOptionDesc} numberOfLines={2}>{opt.desc}</Text>
                  )}
                </TouchableOpacity>
              ))}
              {getPickerOptions().length === 0 && (
                <Text style={[styles.pickerOptionText, { color: '#94A3B8', padding: 16 }]}>
                  Tidak ada data tersedia.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.pickerCloseBtn} onPress={() => setPickerVisible(false)}>
              <Text style={styles.pickerCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CUSTOM ALERT */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
      />
    </ImageBackground>
  );
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F6F5FA' },
  centerContainer:  { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header:           { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  backBtn:          { padding: 8, marginRight: 12 },
  headerTextWrap:   { flex: 1 },
  headerTitle:      { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 2 },
  headerSubtitle:   { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },

  // Rule banner
  ruleBanner:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', marginHorizontal: 20, marginTop: 12, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#bbf7d0' },
  ruleBannerText:   { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#166534', flex: 1 },

  // Control bars
  controlBarRow1:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 12 },
  viewToggle:       { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 3 },
  toggleBtn:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  toggleActive:     { backgroundColor: PRIMARY_DARK },
  toggleText:       { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#94A3B8' },
  toggleActiveText: { color: '#FFF' },
  addBtn:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, gap: 4, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  addBtnText:       { fontFamily: 'Urbanist-Bold', fontSize: 12, color: PRIMARY_DARK },
  controlBarRow2:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  filterBtn:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', flex: 1 },
  filterBtnText:    { fontFamily: 'Urbanist-Medium', fontSize: 12, color: PRIMARY_BLUE, flex: 1 },

  // MK detail banner
  mkDetailBanner:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 8, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1, gap: 8 },
  mkDetailTitle:       { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK },
  mkDetailSub:         { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', marginTop: 2 },
  bobotIndicator:      { alignItems: 'flex-end' },
  bobotIndicatorLabel: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#94A3B8' },
  bobotIndicatorValue: { fontFamily: 'Urbanist-Bold', fontSize: 16 },
  quickActions:        { flexDirection: 'row', gap: 6 },
  quickBtnCpl:         { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME_COLOR, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, gap: 3 },
  quickBtnCplText:     { fontFamily: 'Urbanist-Bold', fontSize: 12, color: PRIMARY_DARK },
  quickBtnSimpan:      { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_DARK, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, gap: 3 },
  quickBtnSimpanText:  { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#FFF' },
  quickBtnDisabled:    { backgroundColor: '#94A3B8' },

  // List
  listContainer:    { padding: 20, paddingBottom: 40 },

  // ── CARD baru ──
  card:             { backgroundColor: '#FFF', borderRadius: 20, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cardTopRow:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardCplCode:      { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK },
  cardCplDesc:      { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', lineHeight: 18, marginTop: 2 },
  cardBottomRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barWrap:          { flex: 1, height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  barFill:          { height: '100%', backgroundColor: PRIMARY_BLUE, borderRadius: 4 },
  bobotVal:         { fontFamily: 'Urbanist-Bold', fontSize: 12, color: PRIMARY_DARK, width: 52, textAlign: 'right' },
  persenBadge:      { backgroundColor: '#dbeafe', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  persenText:       { fontFamily: 'Urbanist-Bold', fontSize: 11, color: PRIMARY_BLUE },
  chevronBtn:       { padding: 4 },

  // CPL badge
  cplBadge:         { backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start' },
  cplBadgeText:     { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#065f46' },

  // Empty
  emptyWrap:        { alignItems: 'center', paddingTop: 50 },
  emptyText:        { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 12, textAlign: 'center', paddingHorizontal: 20 },

  // Matrix
  matrixTitle:      { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, marginBottom: 16 },
  matrixGroupHeader:{ height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: PRIMARY_DARK, borderWidth: 1, borderColor: '#E2E8F0' },
  matrixGroupText:  { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#FFF', textAlign: 'center' },
  matrixCorner:     { width: 110, height: 76, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#E2E8F0' },
  matrixHeaderText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#64748B', textAlign: 'center' },
  matrixColHeader:  { width: 80, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#E2E8F0' },
  matrixCplText:    { fontFamily: 'Urbanist-Bold', fontSize: 11, color: PRIMARY_BLUE, textAlign: 'center' },
  matrixRowHeader:  { width: 110, justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 4, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#f8fafc' },
  matrixMkText:     { fontFamily: 'Urbanist-Bold', fontSize: 11, color: PRIMARY_DARK },
  matrixMkName:     { fontFamily: 'Urbanist-Regular', fontSize: 10, color: '#64748B' },
  matrixCell:       { width: 80, height: 44, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  matrixCellFilled: { backgroundColor: '#dbeafe' },
  matrixCellText:   { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#1d4ed8' },

  // Modal shared — overlay tanpa background (ditangani KAV), content mepet bawah
  modalOverlay:     { flex: 1, justifyContent: 'flex-end' },
  modalContent:     { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, paddingTop: 12, paddingHorizontal: 24, paddingBottom: 28 },
  modalHandle:      { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitle:       { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 20 },

  // Detail modal — centered
  detailOverlay:    { flex: 1, backgroundColor: 'rgba(36,53,74,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  detailBox:        { backgroundColor: '#FFF', borderRadius: 28, padding: 24, width: '100%', elevation: 24, maxHeight: '85%' },

  // Detail modal rows
  detailRow:        { backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, marginBottom: 10 },
  detailLabelRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailLabel:      { fontFamily: 'Urbanist-Bold', fontSize: 11, color: PRIMARY_BLUE, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue:      { fontFamily: 'Urbanist-Medium', fontSize: 14, color: PRIMARY_DARK, lineHeight: 20 },
  detailMeta:       { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', marginTop: 4 },
  bobotDetailWrap:  { flexDirection: 'row', gap: 12, marginBottom: 10 },
  bobotDetailBox:   { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  bobotDetailValue: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK },
  bobotDetailSub:   { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#94A3B8', marginTop: 2 },
  detailBarWrap:    { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  detailBarFill:    { height: '100%', backgroundColor: PRIMARY_BLUE, borderRadius: 4 },
  detailActions:    { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 0 },
  detailBtnDelete:  { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: DANGER_COLOR, borderRadius: 20, paddingVertical: 14 },
  detailBtnEdit:    { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: PRIMARY_BLUE, borderRadius: 20, paddingVertical: 14 },
  detailBtnText:    { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#FFF' },

  // Form modal
  fieldLabel:       { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
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
  pickerOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  pickerBox:        { backgroundColor: '#FFF', borderRadius: 24, padding: 20, maxHeight: '70%' },
  pickerTitle:      { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 15 },
  pickerOption:     { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  pickerOptionText: { fontFamily: 'Urbanist-Medium', fontSize: 15, color: '#212121', textAlign: 'center' },
  pickerOptionDesc: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 2 },
  pickerCloseBtn:   { marginTop: 12, paddingVertical: 10, paddingHorizontal: 30, backgroundColor: '#ffebee', borderRadius: 16, alignSelf: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  pickerCloseText:  { color: DANGER_COLOR, fontFamily: 'Urbanist-Bold', fontSize: 14 },
});