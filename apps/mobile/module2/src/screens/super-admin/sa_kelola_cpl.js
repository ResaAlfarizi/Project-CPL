import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback,
  Keyboard, FlatList, ActivityIndicator, ScrollView, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cplApi, prodiApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;  // '#cdddf4'
const PRIMARY_DARK = BASE.primary;
const PRIMARY_BLUE = BASE.primaryLight;
const DANGER = BASE.error;

// Helper: ambil ID prodi secara konsisten
const getProdiId = (p) => p?.id ?? p?.id_prodi ?? null;

// ─── CUSTOM ALERT MODAL ──────────────────────────────────────────────────────
function CustomAlert({ visible, type, title, message, onConfirm, onCancel, confirmText, cancelText }) {
  if (!visible) return null;

  const isSuccess = type === 'success';
  const isDanger  = type === 'danger';
  const isError   = type === 'error';

  const iconName  = isSuccess ? 'checkmark-circle' : isDanger ? 'trash' : isError ? 'close-circle' : 'alert-circle';
  const iconColor = isSuccess ? '#16a34a' : (isDanger || isError) ? DANGER : PRIMARY_BLUE;
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

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function SAKelolaCPLScreen({ navigation }) {
  const [cplData,       setCplData]       = useState([]);
  const [prodiList,     setProdiList]     = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [selectedProdi, setSelectedProdi] = useState(null); // simpan object prodi lengkap

  // Picker prodi filter
  const [pickerVisible, setPickerVisible] = useState(false);

  // Detail modal
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedCpl,   setSelectedCpl]   = useState(null);

  // Form modal (add & edit)
  const [formVisible,   setFormVisible]   = useState(false);
  const [editItem,      setEditItem]       = useState(null);
  const [formKode,      setFormKode]       = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formProdiId,   setFormProdiId]   = useState(null);
  const [formAktif,     setFormAktif]     = useState(true);

  // Picker prodi di dalam form
  const [formPickerVisible, setFormPickerVisible] = useState(false);

  // Custom alert
  const [alert, setAlert] = useState({
    visible: false, type: 'info', title: '', message: '',
    onConfirm: null, onCancel: null, confirmText: '', cancelText: ''
  });

  const showAlert = (opts) => setAlert({ visible: true, ...opts });
  const hideAlert = () => setAlert(a => ({ ...a, visible: false }));

  // ─── FETCH ───────────────────────────────────────────────────────
  const fetchProdi = async () => {
    try {
      const res = await prodiApi.getAll();
      setProdiList(res?.data || res || []);
    } catch { /* silent */ }
  };

  const fetchCpl = async () => {
    setIsLoading(true);
    try {
      const prodiId = getProdiId(selectedProdi);
      const res = prodiId
        ? await cplApi.getByProdi(prodiId)
        : await cplApi.getAll();
      setCplData(res?.data || res || []);
    } catch {
      showAlert({
        type: 'info', title: 'Gagal Memuat',
        message: 'Tidak dapat terhubung ke server.',
        confirmText: 'OK', onConfirm: hideAlert,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProdi(); }, []);
  useEffect(() => { fetchCpl(); }, [selectedProdi]);

  // ─── FILTER ──────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return cplData;
    return cplData.filter(c =>
      (c.kode_cpl   || '').toLowerCase().includes(q) ||
      (c.deskripsi  || '').toLowerCase().includes(q)
    );
  }, [cplData, searchQuery]);

  // ─── OPEN DETAIL ─────────────────────────────────────────────────
  const openDetail = (item) => {
    setSelectedCpl(item);
    setDetailVisible(true);
  };

  // ─── OPEN EDIT dari detail ────────────────────────────────────────
  const openEditFromDetail = () => {
    setDetailVisible(false);
    setTimeout(() => openEdit(selectedCpl), 300);
  };

  // ─── OPEN FORM ADD ───────────────────────────────────────────────
  const openAdd = () => {
    setEditItem(null);
    setFormKode('');
    setFormDeskripsi('');
    setFormProdiId(getProdiId(selectedProdi));
    setFormAktif(true);
    setFormVisible(true);
  };

  // ─── OPEN FORM EDIT ──────────────────────────────────────────────
  const openEdit = (item) => {
    setEditItem(item);
    setFormKode(item.kode_cpl      || '');
    setFormDeskripsi(item.deskripsi || '');
    setFormProdiId(item.prodi_id   || item.id_prodi || null);
    setFormAktif(item.is_aktif !== undefined ? !!item.is_aktif : true);
    setFormVisible(true);
  };

  // ─── DELETE ──────────────────────────────────────────────────────
  const handleDelete = (item) => {
    showAlert({
      type: 'danger',
      title: 'Hapus CPL',
      message: `Anda yakin ingin menghapus "${item.kode_cpl}" secara permanen?\n\nPastikan CPL ini tidak sedang dipetakan ke mata kuliah manapun.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onCancel: hideAlert,
      onConfirm: async () => {
        hideAlert();
        try {
          await cplApi.delete(item.id || item.id_cpl);
          setDetailVisible(false);
          fetchCpl();
          setTimeout(() => showAlert({
            type: 'success',
            title: 'Berhasil Dihapus',
            message: `CPL "${item.kode_cpl}" telah dihapus dari daftar.`,
            confirmText: 'OK', onConfirm: hideAlert,
          }), 350);
        } catch (e) {
          showAlert({
            type: 'info', title: 'Gagal Menghapus',
            message: e.message || 'Mungkin CPL masih terhubung ke mata kuliah.',
            confirmText: 'OK', onConfirm: hideAlert,
          });
        }
      }
    });
  };

  // ─── SUBMIT FORM ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formKode.trim() || !formDeskripsi.trim() || !formProdiId) {
      showAlert({
        type: 'error', title: 'Data Tidak Lengkap',
        message: 'Harap isi semua kolom sebelum menyimpan CPL.',
        confirmText: 'Mengerti', onConfirm: hideAlert,
      });
      return;
    }

    if (editItem) {
      const tidakAda =
        formKode.trim().toUpperCase() === (editItem.kode_cpl || '').toUpperCase() &&
        formDeskripsi.trim() === (editItem.deskripsi || '') &&
        formProdiId === (editItem.prodi_id || editItem.id_prodi) &&
        formAktif === (editItem.is_aktif !== undefined ? !!editItem.is_aktif : true);

      if (tidakAda) {
        showAlert({
          type: 'error', title: 'Belum Ada Data yang Berubah',
          message: 'Tidak ada perubahan yang terdeteksi. Silakan ubah data terlebih dahulu.',
          confirmText: 'Mengerti', onConfirm: hideAlert,
        });
        return;
      }
    }

    try {
      const payload = {
        kode_cpl:  formKode.trim().toUpperCase(),
        deskripsi: formDeskripsi.trim(),
        prodi_id:  formProdiId,
        is_aktif:  formAktif,
      };
      if (editItem) {
        await cplApi.update(editItem.id || editItem.id_cpl, payload);
      } else {
        await cplApi.create(payload);
      }
      setFormVisible(false);
      fetchCpl();
      const namaAksi = editItem ? 'diperbarui' : 'ditambahkan';
      setTimeout(() => showAlert({
        type: 'success',
        title: editItem ? 'Perubahan Disimpan' : 'CPL Ditambahkan',
        message: `CPL "${formKode.trim().toUpperCase()}" berhasil ${namaAksi}.`,
        confirmText: 'OK', onConfirm: hideAlert,
      }), 350);
    } catch (e) {
      showAlert({
        type: 'info', title: 'Gagal Menyimpan',
        message: e.message || 'Terjadi kesalahan saat menyimpan data.',
        confirmText: 'OK', onConfirm: hideAlert,
      });
    }
  };

  // Helper: nama prodi dari id
  const getProdiNama = (prodiId) => {
    const found = prodiList.find(p => p.id === prodiId || p.id_prodi === prodiId);
    return found ? (found.nama_prodi || '-') : '-';
  };

  // ─── RENDER ROW ──────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const aktif     = item.is_aktif !== undefined ? !!item.is_aktif : true;
    const namaProdi = item.nama_prodi || getProdiNama(item.prodi_id || item.id_prodi);

    return (
      <View style={styles.tableRow}>
        {/* Kode CPL */}
        <View style={styles.cellKode}>
          <View style={styles.kodeBadge}>
            <Text style={styles.kodeBadgeText} numberOfLines={1}>{item.kode_cpl || '-'}</Text>
          </View>
        </View>

        {/* Deskripsi */}
        <Text style={styles.cellDeskripsi} numberOfLines={2}>
          {item.deskripsi || '-'}
        </Text>

        {/* Program Studi */}
        <Text style={styles.cellProdi} numberOfLines={2}>
          {namaProdi}
        </Text>

        {/* Status */}
        <View style={styles.cellStatus}>
          {aktif
            ? <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            : <Ionicons name="close-circle"     size={20} color="#94A3B8" />
          }
        </View>

        {/* Chevron */}
        <TouchableOpacity
          style={styles.cellChevron}
          onPress={() => openDetail(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-forward" size={18} color={PRIMARY_BLUE} />
        </TouchableOpacity>
      </View>
    );
  };

  // Nama prodi yang dipilih di form
  const formProdiNama = prodiList.find(p =>
    p.id === formProdiId || p.id_prodi === formProdiId
  )?.nama_prodi || null;

  // Label filter prodi — gunakan kode_prodi jika ada
  const filterLabel = selectedProdi
    ? (selectedProdi.kode_prodi || selectedProdi.nama_prodi || 'Prodi')
    : 'Semua';

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
          <Text style={styles.headerTitle}>Kelola CPL</Text>
          <Text style={styles.headerSubtitle}>Capaian Pembelajaran Lulusan</Text>
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
          keyExtractor={(item, i) => (item.id || item.id_cpl || i).toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchCpl}
          ListHeaderComponent={
            <>
              {/* SEARCH + FILTER PRODI (75/25, tanpa tombol Tambah) */}
              <View style={styles.controlRow}>
                {/* Search — 75% */}
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={15} color="#94A3B8" style={{ marginRight: 6 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Cari CPL..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={15} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Filter Prodi — 25% */}
                <TouchableOpacity style={styles.filterBtn} onPress={() => setPickerVisible(true)}>
                  <Ionicons name="filter" size={14} color={PRIMARY_BLUE} style={{ marginRight: 3 }} />
                  <Text style={styles.filterBtnText} numberOfLines={1}>
                    {filterLabel}
                  </Text>
                  <Ionicons name="chevron-down" size={12} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Tidak ada CPL yang cocok.' : 'Belum ada CPL terdaftar.'}
              </Text>
            </View>
          }
        />
      )}

      {/* ══════════════════════════════════════════════
          FLOATING BUTTON TAMBAH
      ══════════════════════════════════════════════ */}
      <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* ══════════════════════════════════════════════
          MODAL PICKER FILTER PRODI
          FIX: bandingkan dengan getProdiId() agar konsisten
      ══════════════════════════════════════════════ */}
      <Modal visible={pickerVisible} animationType="fade" transparent statusBarTranslucent>
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Filter Program Studi</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Semua Prodi */}
              {(() => {
                const active = selectedProdi === null;
                return (
                  <TouchableOpacity
                    style={[styles.pickerOption, active && styles.pickerOptionActive]}
                    onPress={() => { setSelectedProdi(null); setPickerVisible(false); }}
                  >
                    <Text style={[styles.pickerOptionText, active && { color: PRIMARY_BLUE, fontFamily: 'Urbanist-Bold' }]}>
                      Semua Prodi
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />}
                  </TouchableOpacity>
                );
              })()}

              {prodiList.map(p => {
                const pid    = getProdiId(p);
                const active = getProdiId(selectedProdi) === pid;
                return (
                  <TouchableOpacity
                    key={pid}
                    style={[styles.pickerOption, active && styles.pickerOptionActive]}
                    onPress={() => { setSelectedProdi(p); setPickerVisible(false); }}
                  >
                    <Text style={[styles.pickerOptionText, active && { color: PRIMARY_BLUE, fontFamily: 'Urbanist-Bold' }]}>
                      {p.kode_prodi} — {p.nama_prodi}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ══════════════════════════════════════════════
          MODAL DETAIL CPL
      ══════════════════════════════════════════════ */}
      <Modal visible={detailVisible} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.detailOverlay}>
          <TouchableWithoutFeedback onPress={() => setDetailVisible(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.detailBox}>
            {/* Kode badge */}
            <View style={styles.detailKodeBadge}>
              <Text style={styles.detailKodeText}>{selectedCpl?.kode_cpl || '-'}</Text>
            </View>

            {/* Deskripsi */}
            <Text style={styles.detailDeskripsi}>{selectedCpl?.deskripsi || '-'}</Text>

            {/* Info row: prodi + status */}
            <View style={styles.detailInfoRow}>
              <View style={styles.detailProdiChip}>
                <Ionicons name="business-outline" size={12} color={PRIMARY_BLUE} style={{ marginRight: 4 }} />
                <Text style={styles.detailProdiText} numberOfLines={1}>
                  {selectedCpl?.nama_prodi || getProdiNama(selectedCpl?.prodi_id || selectedCpl?.id_prodi)}
                </Text>
              </View>
              {(selectedCpl?.is_aktif !== undefined ? !!selectedCpl.is_aktif : true)
                ? <View style={styles.statusChipAktif}>
                    <Ionicons name="checkmark-circle" size={12} color="#16a34a" style={{ marginRight: 3 }} />
                    <Text style={styles.statusChipTextAktif}>Aktif</Text>
                  </View>
                : <View style={styles.statusChipNonaktif}>
                    <Ionicons name="close-circle" size={12} color="#94A3B8" style={{ marginRight: 3 }} />
                    <Text style={styles.statusChipTextNonaktif}>Tidak Aktif</Text>
                  </View>
              }
            </View>

            <View style={styles.detailDivider} />

            {/* Aksi */}
            <View style={styles.detailBtnRow}>
              <TouchableOpacity style={styles.detailBtnDelete} onPress={() => handleDelete(selectedCpl)}>
                <Ionicons name="trash-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.detailBtnText}>Hapus</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailBtnEdit} onPress={openEditFromDetail}>
                <Ionicons name="pencil-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.detailBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════
          MODAL FORM TAMBAH / EDIT CPL (bottom sheet)
      ══════════════════════════════════════════════ */}
      <Modal visible={formVisible} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.sheetOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{editItem ? 'Edit CPL' : 'Tambah CPL'}</Text>

            {/* Kode CPL */}
            <Text style={styles.fieldLabel}>Kode CPL</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="barcode-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contoh: CPL-IF-01"
                placeholderTextColor="#94A3B8"
                value={formKode}
                onChangeText={setFormKode}
                autoCapitalize="characters"
              />
            </View>

            {/* Deskripsi */}
            <Text style={styles.fieldLabel}>Deskripsi</Text>
            <View style={[styles.inputWrap, { alignItems: 'flex-start', paddingVertical: 10 }]}>
              <Ionicons name="document-text-outline" size={18} color={PRIMARY_BLUE} style={[styles.inputIcon, { marginTop: 2 }]} />
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                placeholder="Deskripsi kompetensi yang harus dicapai..."
                placeholderTextColor="#94A3B8"
                value={formDeskripsi}
                onChangeText={setFormDeskripsi}
                multiline
              />
            </View>

            {/* Program Studi */}
            <Text style={styles.fieldLabel}>Program Studi</Text>
            <TouchableOpacity style={styles.inputWrap} onPress={() => { Keyboard.dismiss(); setFormPickerVisible(true); }}>
              <Ionicons name="business-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
              <Text style={[styles.input, !formProdiNama && { color: '#94A3B8' }]}>
                {formProdiNama || 'Pilih Program Studi'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Status Aktif */}
            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.switchRow}>
              <View style={styles.inputWrap2}>
                <Ionicons
                  name={formAktif ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={formAktif ? '#16a34a' : '#94A3B8'}
                  style={styles.inputIcon}
                />
                <Text style={[styles.switchLabel, { color: formAktif ? '#16a34a' : '#94A3B8' }]}>
                  {formAktif ? 'Aktif' : 'Tidak Aktif'}
                </Text>
              </View>
              <Switch
                value={formAktif}
                onValueChange={setFormAktif}
                trackColor={{ false: '#E2E8F0', true: '#bbf7d0' }}
                thumbColor={formAktif ? '#16a34a' : '#94A3B8'}
              />
            </View>

            {/* Tombol */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setFormVisible(false)}
              >
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit}>
                <Text style={styles.btnSubmitText}>
                  {editItem ? 'Simpan Perubahan' : 'Tambah CPL'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════
          MODAL PICKER PRODI DI DALAM FORM
          FIX: gunakan getProdiId() untuk bandingkan
      ══════════════════════════════════════════════ */}
      <Modal visible={formPickerVisible} animationType="fade" transparent statusBarTranslucent>
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setFormPickerVisible(false)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Pilih Program Studi</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {prodiList.map(p => {
                const pid    = getProdiId(p);
                const active = formProdiId === pid;
                return (
                  <TouchableOpacity
                    key={pid}
                    style={[styles.pickerOption, active && styles.pickerOptionActive]}
                    onPress={() => { setFormProdiId(pid); setFormPickerVisible(false); }}
                  >
                    <Text style={[styles.pickerOptionText, active && { color: PRIMARY_BLUE, fontFamily: 'Urbanist-Bold' }]}>
                      {p.kode_prodi} — {p.nama_prodi}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ══════════════════════════════════════════════
          CUSTOM ALERT
      ══════════════════════════════════════════════ */}
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
  listContent:      { paddingHorizontal: 16, paddingBottom: 100 }, // extra bottom agar FAB tidak nutup item terakhir

  // ── CONTROL ROW (75/25) ──
  controlRow:       { flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 14, alignItems: 'center' },
  searchBox:        { flex: 3, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput:      { flex: 1, fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#212121', paddingVertical: 0 },
  filterBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 8, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 2 },
  filterBtnText:    { fontFamily: 'Urbanist-Bold', fontSize: 11, color: PRIMARY_BLUE, flexShrink: 1 },

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

  // ── TABLE ROW ──
  tableRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },

  cellKode:         { width: 72, alignItems: 'center', justifyContent: 'center' },
  cellDeskripsi:    { flex: 1, paddingHorizontal: 8, fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#475569', lineHeight: 16 },
  cellProdi:        { width: 70, fontFamily: 'Urbanist-Regular', fontSize: 10, color: '#64748B', textAlign: 'center' },
  cellStatus:       { width: 36, alignItems: 'center' },
  cellChevron:      { width: 28, alignItems: 'center', justifyContent: 'center' },

  // ── BADGES ──
  kodeBadge:        { backgroundColor: '#dbeafe', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 4, alignItems: 'center' },
  kodeBadgeText:    { fontFamily: 'Urbanist-Bold', fontSize: 9, color: '#1d4ed8' },

  // ── EMPTY ──
  emptyWrap:        { alignItems: 'center', paddingTop: 50 },
  emptyText:        { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 10 },

  // ── MODAL DETAIL ──
  detailOverlay:    { flex: 1, backgroundColor: 'rgba(36,53,74,0.55)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  detailBox:        { backgroundColor: '#FFF', borderRadius: 32, padding: 28, width: '100%', alignItems: 'center', elevation: 20 },
  detailKodeBadge:  { backgroundColor: '#dbeafe', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 14 },
  detailKodeText:   { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#1d4ed8' },
  detailDeskripsi:  { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#212121', textAlign: 'center', lineHeight: 22, marginBottom: 14 },
  detailInfoRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  detailProdiChip:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  detailProdiText:  { fontFamily: 'Urbanist-Medium', fontSize: 12, color: PRIMARY_BLUE, maxWidth: 140 },
  statusChipAktif:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  statusChipTextAktif:  { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#16a34a' },
  statusChipNonaktif:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  statusChipTextNonaktif: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#94A3B8' },
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
  fieldLabel:       { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  inputWrap:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, marginBottom: 16 },
  inputIcon:        { marginRight: 10 },
  input:            { flex: 1, paddingVertical: 14, fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#212121' },

  // ── SWITCH STATUS ──
  switchRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  inputWrap2:       { flexDirection: 'row', alignItems: 'center' },
  switchLabel:      { fontFamily: 'Urbanist-Bold', fontSize: 14 },

  // ── BUTTONS ──
  btnRow:           { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnCancel:        { flex: 1, backgroundColor: '#ffebee', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelText:    { color: DANGER, fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmit:        { flex: 1, backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  btnSubmitText:    { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },

  // ── PICKER ──
  pickerOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 32 },
  pickerBox:        { backgroundColor: '#FFF', borderRadius: 24, padding: 20, maxHeight: '65%' },
  pickerTitle:      { fontFamily: 'Urbanist-Bold', fontSize: 17, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 14 },
  pickerOption:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  pickerOptionActive: { backgroundColor: '#f0f9ff' },
  pickerOptionText: { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#212121', flex: 1, marginRight: 8 },
});
