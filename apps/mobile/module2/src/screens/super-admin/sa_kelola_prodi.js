import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback,
  Keyboard, FlatList, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { prodiApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;
const PRIMARY_DARK = BASE.primary;
const PRIMARY_BLUE = BASE.primaryLight;
const DANGER = BASE.error;

const JENJANG_OPTIONS = ['D3', 'S1', 'S2', 'S3'];

const JENJANG_STYLE = {
  D3: { bg: '#dbeafe', color: '#1e3a8a' },
  S1: { bg: '#dbeafe', color: '#1e3a8a' },
  S2: { bg: '#dbeafe', color: '#1e3a8a' },
  S3: { bg: '#dbeafe', color: '#1e3a8a' },
};

// ─── CUSTOM ALERT MODAL ──────────────────────────────────────────────────────
function CustomAlert({ visible, type, title, message, onConfirm, onCancel, confirmText, cancelText }) {
  if (!visible) return null;

  const isSuccess  = type === 'success';
  const isDanger   = type === 'danger';
  const isError    = type === 'error';

  const iconName  = isSuccess ? 'checkmark-circle' : isDanger ? 'trash' : isError ? 'close-circle' : 'alert-circle';
  const iconColor = isSuccess ? '#16a34a'           : (isDanger || isError) ? DANGER : PRIMARY_BLUE;
  const iconBg    = isSuccess ? '#dcfce7'           : (isDanger || isError) ? '#fee2e2' : '#dbeafe';

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
                { backgroundColor: isSuccess ? '#16a34a' : (isDanger || isError) ? DANGER : PRIMARY_BLUE },
                !onCancel && { flex: 1 }
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
  overlay:         { flex: 1, backgroundColor: 'rgba(36,53,74,0.55)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  box:             { backgroundColor: '#FFF', borderRadius: 28, padding: 28, width: '100%', alignItems: 'center', elevation: 24 },
  iconCircle:      { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title:           { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 8 },
  message:         { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 4 },
  btnRow:          { flexDirection: 'row', gap: 12, marginTop: 22, width: '100%' },
  btnCancel:       { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  btnCancelText:   { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#64748B' },
  btnConfirm:      { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  btnConfirmText:  { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#FFF' },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function SAKelolaProdiScreen({ navigation }) {
  const [prodiData,   setProdiData]   = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenjang, setFilterJenjang] = useState('');

  // Detail modal
  const [detailVisible,  setDetailVisible]  = useState(false);
  const [selectedProdi,  setSelectedProdi]  = useState(null);

  // Edit modal
  const [editVisible, setEditVisible]   = useState(false);
  const [editId,      setEditId]        = useState(null);
  const [kodeProdi,   setKodeProdi]     = useState('');
  const [namaProdi,   setNamaProdi]     = useState('');
  const [jenjang,     setJenjang]       = useState('');

  // Add modal
  const [addVisible, setAddVisible]     = useState(false);
  const [addKode,    setAddKode]        = useState('');
  const [addNama,    setAddNama]        = useState('');
  const [addJenjang, setAddJenjang]     = useState('');

  // Picker jenjang
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerCtx,     setPickerCtx]     = useState('add');

  // Custom Alert state
  const [alert, setAlert] = useState({
    visible: false, type: 'info', title: '', message: '',
    onConfirm: null, onCancel: null, confirmText: '', cancelText: ''
  });

  const showAlert = (opts) => setAlert({ visible: true, ...opts });
  const hideAlert = () => setAlert(a => ({ ...a, visible: false }));

  // ─── FETCH ───────────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await prodiApi.getAll();
      setProdiData(res?.data || res || []);
    } catch {
      showAlert({
        type: 'info', title: 'Gagal Memuat',
        message: 'Tidak dapat terhubung ke server.',
        confirmText: 'OK', onConfirm: hideAlert
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── SUMMARY COUNTS ──────────────────────────────────────────────
  const summaryCounts = useMemo(() => {
    const counts = { D3: 0, S1: 0, S2: 0, S3: 0 };
    prodiData.forEach(p => {
      const j = p.jenjang?.toUpperCase();
      if (counts[j] !== undefined) counts[j]++;
    });
    return counts;
  }, [prodiData]);

  // ─── FILTER ──────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return prodiData.filter(p => {
      const matchSearch = !q ||
        (p.nama_prodi || '').toLowerCase().includes(q) ||
        (p.kode_prodi || '').toLowerCase().includes(q);
      const matchJenjang = !filterJenjang ||
        (p.jenjang || '').toUpperCase() === filterJenjang;
      return matchSearch && matchJenjang;
    });
  }, [prodiData, searchQuery, filterJenjang]);

  // ─── FORMAT DATE ─────────────────────────────────────────────────
  const formatDate = (val) => {
    if (!val) return '-';
    try {
      const d = new Date(val);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch { return '-'; }
  };

  // ─── OPEN DETAIL ─────────────────────────────────────────────────
  const openDetail = (item) => {
    setSelectedProdi(item);
    setDetailVisible(true);
  };

  // ─── OPEN EDIT ───────────────────────────────────────────────────
  const openEdit = () => {
    setDetailVisible(false);
    setEditId(selectedProdi.id || selectedProdi.id_prodi);
    setKodeProdi(selectedProdi.kode_prodi || '');
    setNamaProdi(selectedProdi.nama_prodi || '');
    setJenjang(selectedProdi.jenjang    || '');
    setTimeout(() => setEditVisible(true), 300);
  };

  // ─── DELETE ──────────────────────────────────────────────────────
  const handleDelete = () => {
    showAlert({
      type: 'danger',
      title: 'Hapus Program Studi',
      message: `Anda yakin ingin menghapus "${selectedProdi?.nama_prodi}" secara permanen?\n\nPastikan tidak ada CPL atau MK yang masih terhubung.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onCancel: hideAlert,
      onConfirm: async () => {
        hideAlert();
        try {
          await prodiApi.delete(selectedProdi.id || selectedProdi.id_prodi);
          setDetailVisible(false);
          fetchData();
          setTimeout(() => {
            showAlert({
              type: 'success',
              title: 'Berhasil Dihapus',
              message: `"${selectedProdi?.nama_prodi}" telah dihapus dari daftar program studi.`,
              confirmText: 'OK',
              onConfirm: hideAlert,
            });
          }, 350);
        } catch (e) {
          showAlert({
            type: 'info',
            title: 'Gagal Menghapus',
            message: e.message || 'Mungkin masih ada data yang terhubung.',
            confirmText: 'OK',
            onConfirm: hideAlert,
          });
        }
      }
    });
  };

  // ─── SUBMIT EDIT ─────────────────────────────────────────────────
  const handleSubmitEdit = async () => {
    if (!kodeProdi.trim() || !namaProdi.trim() || !jenjang) {
      showAlert({
        type: 'error', title: 'Data Tidak Lengkap',
        message: 'Harap isi semua kolom sebelum menyimpan perubahan.',
        confirmText: 'Mengerti', onConfirm: hideAlert,
      });
      return;
    }

    const tidakAda =
      kodeProdi.trim().toUpperCase() === (selectedProdi?.kode_prodi || '').toUpperCase() &&
      namaProdi.trim() === (selectedProdi?.nama_prodi || '') &&
      jenjang === (selectedProdi?.jenjang || '');

    if (tidakAda) {
      showAlert({
        type: 'error', title: 'Belum Ada Data yang Berubah',
        message: 'Tidak ada perubahan yang terdeteksi. Silakan ubah data terlebih dahulu sebelum menyimpan.',
        confirmText: 'Mengerti', onConfirm: hideAlert,
      });
      return;
    }
    try {
      await prodiApi.update(editId, {
        kode_prodi: kodeProdi.trim().toUpperCase(),
        nama_prodi: namaProdi.trim(),
        jenjang,
      });
      setEditVisible(false);
      fetchData();
      setTimeout(() => {
        showAlert({
          type: 'success',
          title: 'Perubahan Disimpan',
          message: `Data program studi "${namaProdi.trim()}" berhasil diperbarui.`,
          confirmText: 'OK',
          onConfirm: hideAlert,
        });
      }, 350);
    } catch (e) {
      showAlert({
        type: 'info', title: 'Gagal Menyimpan',
        message: e.message || 'Terjadi kesalahan saat menyimpan data.',
        confirmText: 'OK', onConfirm: hideAlert,
      });
    }
  };

  // ─── SUBMIT ADD ──────────────────────────────────────────────────
  const handleSubmitAdd = async () => {
    if (!addKode.trim() || !addNama.trim() || !addJenjang) {
      showAlert({
        type: 'error', title: 'Data Tidak Lengkap',
        message: 'Harap isi semua kolom sebelum menambahkan program studi.',
        confirmText: 'Mengerti', onConfirm: hideAlert,
      });
      return;
    }
    try {
      await prodiApi.create({
        kode_prodi: addKode.trim().toUpperCase(),
        nama_prodi: addNama.trim(),
        jenjang: addJenjang,
      });
      setAddVisible(false);
      setAddKode(''); setAddNama(''); setAddJenjang('');
      fetchData();
      setTimeout(() => {
        showAlert({
          type: 'success',
          title: 'Prodi Ditambahkan',
          message: `"${addNama.trim()}" berhasil ditambahkan ke daftar program studi.`,
          confirmText: 'OK',
          onConfirm: hideAlert,
        });
      }, 350);
    } catch (e) {
      showAlert({
        type: 'info', title: 'Gagal Menambahkan',
        message: e.message || 'Terjadi kesalahan saat menambahkan data.',
        confirmText: 'OK', onConfirm: hideAlert,
      });
    }
  };

  const openPicker = (ctx) => {
    Keyboard.dismiss();
    setPickerCtx(ctx);
    setPickerVisible(true);
  };

  const onPickJenjang = (val) => {
    if (pickerCtx === 'edit') setJenjang(val);
    else if (pickerCtx === 'filter') {
      setFilterJenjang(prev => prev === val ? '' : val);
      setPickerVisible(false);
      return;
    }
    else setAddJenjang(val);
    setPickerVisible(false);
  };

  // ─── RENDER ROW ──────────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    const jStyle = JENJANG_STYLE[item.jenjang?.toUpperCase()] || { bg: '#dbeafe', color: '#1e40af' };
    return (
      <View style={styles.tableRow}>
        <Text style={[styles.cell, styles.cellNo]}>{index + 1}</Text>

        <View style={[styles.cell, styles.cellKode]}>
          <View style={styles.kodeBadge}>
            <Text style={styles.kodeBadgeText} numberOfLines={1}>{item.kode_prodi || '-'}</Text>
          </View>
        </View>

        <Text style={[styles.cell, styles.cellNama]} numberOfLines={2}>
          {item.nama_prodi || '-'}
        </Text>

        <View style={[styles.cell, styles.cellJenjang]}>
          <View style={[styles.jenjangBadge, { backgroundColor: jStyle.bg }]}>
            <Text style={[styles.jenjangBadgeText, { color: jStyle.color }]}>{item.jenjang || '-'}</Text>
          </View>
        </View>

        <View style={[styles.cell, styles.cellDetail]}>
          <TouchableOpacity onPress={() => openDetail(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-forward" size={18} color={PRIMARY_BLUE} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── RENDER ──────────────────────────────────────────────────────
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
          <Text style={styles.headerTitle}>Program Studi</Text>
          <Text style={styles.headerSubtitle}>Kelola Data Program Studi</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_DARK} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, i) => (item.id || item.id_prodi || i).toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchData}
          ListHeaderComponent={
            <>
              {/* SUMMARY CARDS */}
              <View style={styles.summaryRow}>
                {JENJANG_OPTIONS.map(j => {
                  const js = JENJANG_STYLE[j];
                  return (
                    <View key={j} style={[styles.summaryCard, { backgroundColor: js.bg }]}>
                      <Text style={[styles.summaryCount, { color: js.color }]}>{summaryCounts[j]}</Text>
                      <Text style={[styles.summaryLabel, { color: js.color }]}>Prodi {j}</Text>
                    </View>
                  );
                })}
              </View>

              {/* SEARCH BAR + FILTER JENJANG */}
              <View style={styles.controlRow}>
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Cari nama atau kode prodi..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.filterBtn,
                    filterJenjang ? styles.filterBtnActive : null,
                  ]}
                  onPress={() => openPicker('filter')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="filter"
                    size={14}
                    color={filterJenjang ? '#FFF' : PRIMARY_BLUE}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.filterBtnText, filterJenjang && { color: '#FFF' }]}>
                    {filterJenjang || 'Jenjang'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="folder-open-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                {searchQuery || filterJenjang ? 'Tidak ada prodi yang cocok.' : 'Belum ada program studi terdaftar.'}
              </Text>
            </View>
          }
        />
      )}

      {/* ══════════════════════════════════════════════
          FLOATING BUTTON TAMBAH
      ══════════════════════════════════════════════ */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* ══════════════════════════════════════════════
          MODAL DETAIL PRODI
      ══════════════════════════════════════════════ */}
      <Modal visible={detailVisible} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.detailOverlay}>
          <TouchableWithoutFeedback onPress={() => setDetailVisible(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <View style={styles.detailBox}>
            <View style={styles.detailKodeBadge}>
              <Text style={styles.detailKodeText}>{selectedProdi?.kode_prodi || '-'}</Text>
            </View>

            <Text style={styles.detailNama}>{selectedProdi?.nama_prodi || '-'}</Text>

            <View style={styles.detailInfoRow}>
              <View style={[
                styles.jenjangBadge,
                { backgroundColor: (JENJANG_STYLE[selectedProdi?.jenjang?.toUpperCase()] || JENJANG_STYLE.S1).bg }
              ]}>
                <Text style={[
                  styles.jenjangBadgeText,
                  { color: (JENJANG_STYLE[selectedProdi?.jenjang?.toUpperCase()] || JENJANG_STYLE.S1).color }
                ]}>
                  {selectedProdi?.jenjang || '-'}
                </Text>
              </View>
              <Text style={styles.detailCreatedAt}>
                Dibuat: {formatDate(selectedProdi?.created_at || selectedProdi?.createdAt)}
              </Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailBtnRow}>
              <TouchableOpacity style={styles.detailBtnDelete} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.detailBtnText}>Hapus</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailBtnEdit} onPress={openEdit}>
                <Ionicons name="pencil-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.detailBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════
          MODAL EDIT PRODI (bottom sheet)
      ══════════════════════════════════════════════ */}
      <Modal visible={editVisible} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.sheetOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Edit Program Studi</Text>

            <Text style={styles.fieldLabel}>Kode Prodi</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="barcode-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contoh: IF, SI, TI"
                placeholderTextColor="#94A3B8"
                value={kodeProdi}
                onChangeText={setKodeProdi}
                autoCapitalize="characters"
              />
            </View>

            <Text style={styles.fieldLabel}>Nama Program Studi</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="business-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contoh: Teknik Informatika"
                placeholderTextColor="#94A3B8"
                value={namaProdi}
                onChangeText={setNamaProdi}
              />
            </View>

            <Text style={styles.fieldLabel}>Jenjang</Text>
            <TouchableOpacity style={styles.inputWrap} onPress={() => openPicker('edit')}>
              <Ionicons name="school-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
              <Text style={[styles.input, !jenjang && { color: '#94A3B8' }]}>
                {jenjang || 'Pilih Jenjang'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setEditVisible(false)}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmitEdit}>
                <Text style={styles.btnSubmitText}>Simpan Perubahan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════
          MODAL TAMBAH PRODI (bottom sheet)
      ══════════════════════════════════════════════ */}
      <Modal visible={addVisible} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.sheetOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Tambah Program Studi</Text>

            <Text style={styles.fieldLabel}>Kode Prodi</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="barcode-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contoh: IF, SI, TI"
                placeholderTextColor="#94A3B8"
                value={addKode}
                onChangeText={setAddKode}
                autoCapitalize="characters"
              />
            </View>

            <Text style={styles.fieldLabel}>Nama Program Studi</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="business-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contoh: Teknik Informatika"
                placeholderTextColor="#94A3B8"
                value={addNama}
                onChangeText={setAddNama}
              />
            </View>

            <Text style={styles.fieldLabel}>Jenjang</Text>
            <TouchableOpacity style={styles.inputWrap} onPress={() => openPicker('add')}>
              <Ionicons name="school-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
              <Text style={[styles.input, !addJenjang && { color: '#94A3B8' }]}>
                {addJenjang || 'Pilih Jenjang'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => { setAddVisible(false); setAddKode(''); setAddNama(''); setAddJenjang(''); }}
              >
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmitAdd}>
                <Text style={styles.btnSubmitText}>Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════
          MODAL PICKER JENJANG (shared)
      ══════════════════════════════════════════════ */}
      <Modal visible={pickerVisible} animationType="fade" transparent statusBarTranslucent>
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Pilih Jenjang</Text>
            {JENJANG_OPTIONS.map(j => {
              const js    = JENJANG_STYLE[j];
              const active = pickerCtx === 'edit' ? jenjang === j
                           : pickerCtx === 'filter' ? filterJenjang === j
                           : addJenjang === j;
              return (
                <TouchableOpacity
                  key={j}
                  style={[styles.pickerOption, active && { backgroundColor: '#f0f9ff' }]}
                  onPress={() => onPickJenjang(j)}
                >
                  <View style={[styles.jenjangBadge, { backgroundColor: js.bg }]}>
                    <Text style={[styles.jenjangBadgeText, { color: js.color }]}>{j}</Text>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={20} color={PRIMARY_BLUE} />}
                </TouchableOpacity>
              );
            })}
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

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F6F5FA' },
  centerContainer:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:      { marginTop: 10, fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#64748B' },

  // ── HEADER ──
  header:           { backgroundColor: THEME_COLOR, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  backBtn:          { padding: 8, marginRight: 12 },
  headerTextWrap:   { flex: 1 },
  headerTitle:      { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 2 },
  headerSubtitle:   { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },

  // ── LIST ──
  listContent:      { paddingHorizontal: 16, paddingBottom: 100 },

  // ── SUMMARY CARDS ──
  summaryRow:       { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 16 },
  summaryCard:      { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', elevation: 2 },
  summaryCount:     { fontFamily: 'Urbanist-Bold', fontSize: 26 },
  summaryLabel:     { fontFamily: 'Urbanist-Medium', fontSize: 11, marginTop: 2 },

  // ── CONTROL ROW ──
  controlRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  searchBox:        { flex: 3, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput:      { flex: 1, fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#212121', paddingVertical: 0 },
  filterBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  filterBtnActive:  { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE },
  filterBtnText:    { fontFamily: 'Urbanist-Bold', fontSize: 12, color: PRIMARY_BLUE },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_DARK,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: PRIMARY_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  // ── TABLE ──
  tableRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cell:             { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#212121' },
  cellNo:           { width: 24, textAlign: 'center', color: '#94A3B8', fontFamily: 'Urbanist-Bold' },
  cellKode:         { width: 52, alignItems: 'center', justifyContent: 'center' },
  cellNama:         { flex: 1, paddingHorizontal: 8, fontFamily: 'Urbanist-Medium', fontSize: 12 },
  cellJenjang:      { width: 46, alignItems: 'center' },
  cellDetail:       { width: 44, alignItems: 'center', justifyContent: 'center' },

  // ── BADGES ──
  kodeBadge:        { backgroundColor: THEME_COLOR, borderRadius: 20, paddingHorizontal: 6, paddingVertical: 4, minWidth: 36, alignItems: 'center' },
  kodeBadgeText:    { fontFamily: 'Urbanist-Bold', fontSize: 10, color: PRIMARY_DARK },
  jenjangBadge:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  jenjangBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10 },

  // ── EMPTY ──
  emptyWrap:        { alignItems: 'center', paddingTop: 50 },
  emptyText:        { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 10 },

  // ── MODAL DETAIL ──
  detailOverlay:    { flex: 1, backgroundColor: 'rgba(36,53,74,0.55)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  detailBox:        { backgroundColor: '#FFF', borderRadius: 32, padding: 28, width: '100%', alignItems: 'center', elevation: 20 },
  detailKodeBadge:  { backgroundColor: THEME_COLOR, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 14 },
  detailKodeText:   { fontFamily: 'Urbanist-Bold', fontSize: 16, color: PRIMARY_DARK },
  detailNama:       { fontFamily: 'Urbanist-Bold', fontSize: 20, color: '#212121', textAlign: 'center', marginBottom: 10 },
  detailInfoRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  detailCreatedAt:  { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#94A3B8' },
  detailDivider:    { width: '100%', height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
  detailBtnRow:     { flexDirection: 'row', gap: 12, width: '100%' },
  detailBtnDelete:  { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: DANGER, borderRadius: 20, paddingVertical: 14 },
  detailBtnEdit:    { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: PRIMARY_BLUE, borderRadius: 20, paddingVertical: 14 },
  detailBtnText:    { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#FFF' },

  // ── BOTTOM SHEET ──
  sheetOverlay:     { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'flex-end' },
  sheetContent:     { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingBottom: 40 },
  sheetHandle:      { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 16 },
  sheetTitle:       { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 20 },

  // ── FORM FIELDS ──
  fieldLabel:       { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  inputWrap:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, marginBottom: 16 },
  inputIcon:        { marginRight: 10 },
  input:            { flex: 1, paddingVertical: 14, fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121' },
  btnRow:           { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnCancel:        { flex: 1, backgroundColor: '#ffebee', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelText:    { color: DANGER, fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmit:        { flex: 1, backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  btnSubmitText:    { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },

  // ── PICKER ──
  pickerOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 32 },
  pickerBox:        { backgroundColor: '#FFF', borderRadius: 24, padding: 20 },
  pickerTitle:      { fontFamily: 'Urbanist-Bold', fontSize: 17, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 16 },
  pickerOption:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
});
