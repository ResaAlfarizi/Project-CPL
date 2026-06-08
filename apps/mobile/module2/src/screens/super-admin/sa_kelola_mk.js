import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar,
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback,
  Keyboard, ActivityIndicator, ScrollView, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mkSaApi, prodiApi, cplApi } from '../../services/api'; // Ditambahkan cplApi

// ─── Normalisasi: handle semua kemungkinan field dari BE ─────────────────────
function normalizeMk(item) {
  return {
    ...item,
    nama_mk  : item.nama_mk  || item.title || item.nama  || '',
    kode_mk  : item.kode_mk  || item.kode  || '',
    prodi_id : item.prodi_id || item.prodiId || '',
    sks      : item.sks ?? item.bobot_sks ?? 0,
    semester : item.semester ?? 0,
    // PERBAIKAN: Menghitung jumlah dari array cpl_ids atau cpls jika cpl_count dari database kosong
    cpl_count: item.cpl_count ?? item.total_cpl ?? item.jumlah_cpl ?? item.cpls?.length ?? item.cpl_ids?.length ?? 0,
  };
}

// ─── Ekstrak array dari berbagai bentuk response BE ──────────────────────────
function extractArray(res) {
  if (!res) return [];
  if (Array.isArray(res))           return res;
  if (Array.isArray(res.data))      return res.data;
  if (Array.isArray(res.result))    return res.result;
  if (typeof res.data === 'object' && res.data !== null) return Object.values(res.data);
  return [];
}

const { width: SW } = Dimensions.get('window');

import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;
const PRIMARY_DARK = BASE.primary;
const PRIMARY_BLUE = BASE.primaryLight;
const DANGER_COLOR = BASE.error;
const SUCCESS_COLOR = BASE.success;
const FAB_COLOR = THEME_COLOR;

// ─── CUSTOM ALERT MODAL (sama seperti CPL) ───────────────────────────────────
function CustomAlert({ visible, type, title, message, onConfirm, onCancel, confirmText, cancelText }) {
  if (!visible) return null;

  const isSuccess = type === 'success';
  const isDanger  = type === 'danger';
  const isError   = type === 'error';

  const iconName  = isSuccess ? 'checkmark-circle' : isDanger ? 'trash' : isError ? 'close-circle' : 'alert-circle';
  const iconColor = isSuccess ? '#16a34a' : (isDanger || isError) ? DANGER_COLOR : PRIMARY_BLUE;
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
                { backgroundColor: isSuccess ? '#16a34a' : (isDanger || isError) ? DANGER_COLOR : PRIMARY_BLUE },
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

// ─── Komponen utama ──────────────────────────────────────────────────────────
export default function SAKelolaMKScreen({ navigation }) {
  const [data, setData]           = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [cplList, setCplList]     = useState([]); // Ditambahkan state list CPL dari server
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  const [filterProdi, setFilterProdi]       = useState(null);
  const [filterSemester, setFilterSemester] = useState(null);
  const [pickerVisible, setPickerVisible]   = useState(false);
  const [pickerType, setPickerType]         = useState('');

  const [detailItem, setDetailItem]       = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const [formVisible, setFormVisible]     = useState(false);
  const [editId, setEditId]               = useState(null);
  const [formProdiId, setFormProdiId]     = useState('');
  const [formProdiName, setFormProdiName] = useState('');
  const [formKode, setFormKode]           = useState('');
  const [formNama, setFormNama]           = useState('');
  const [formSks, setFormSks]             = useState('');
  const [formSemester, setFormSemester]   = useState('');
  const [formCplIds, setFormCplIds]       = useState([]); // State penampung CPL terpilih

  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, id: null, nama: '' });
  
  // Custom alert (ganti Toast dengan CustomAlert seperti CPL)
  const [alert, setAlert] = useState({
    visible: false, type: 'info', title: '', message: '',
    onConfirm: null, onCancel: null, confirmText: '', cancelText: ''
  });

  const showAlert = (opts) => setAlert({ visible: true, ...opts });
  const hideAlert = () => setAlert(a => ({ ...a, visible: false }));

  useEffect(() => { fetchAll(); }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resMk, resProdi, resCpl] = await Promise.all([
        mkSaApi.getAll().catch(e => {
          console.log('❌ mkSaApi.getAll() error:', e?.message);
          return null;
        }),
        prodiApi.getAll().catch(e => {
          console.log('❌ prodiApi.getAll() error:', e?.message);
          return null;
        }),
        cplApi.getAll().catch(e => {
          console.log('❌ cplApi.getAll() error:', e?.message);
          return null;
        }),
      ]);

      if (resMk === null) {
        showAlert({
          type: 'error', title: 'Gagal Memuat MK',
          message: 'Cek console untuk detail error.',
          confirmText: 'OK', onConfirm: hideAlert,
        });
      } else {
        const arr = extractArray(resMk);
        setData(arr.map(normalizeMk));
      }

      if (resProdi !== null) {
        setProdiList(extractArray(resProdi));
      }

      if (resCpl !== null) {
        setCplList(extractArray(resCpl));
      }
    } catch (err) {
      showAlert({
        type: 'error', title: 'Koneksi Gagal',
        message: err.message || 'Tidak dapat terhubung ke server.',
        confirmText: 'OK', onConfirm: hideAlert,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Simpan ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formProdiId || !formKode || !formNama || !formSks || !formSemester) {
      showAlert({
        type: 'error', title: 'Form Tidak Lengkap',
        message: 'Harap isi semua kolom sebelum menyimpan.',
        confirmText: 'Mengerti', onConfirm: hideAlert,
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        prodi_id : formProdiId,
        kode_mk  : formKode.toUpperCase(),
        kode     : formKode.toUpperCase(),
        nama_mk  : formNama,
        title    : formNama,
        sks      : parseInt(formSks),
        semester : parseInt(formSemester),
        cpl_ids  : formCplIds, // Mengirimkan UUID asli string array ke Backend
      };

      console.log("Payload Siap Dikirim:", JSON.stringify(payload, null, 2));

      if (editId) {
        await mkSaApi.update(editId, payload);
      } else {
        await mkSaApi.create(payload);
      }

      setFormVisible(false);
      resetForm();
      fetchAll();
      
      const namaAksi = editId ? 'diperbarui' : 'ditambahkan';
      setTimeout(() => showAlert({
        type: 'success',
        title: editId ? 'Perubahan Disimpan' : 'MK Ditambahkan',
        message: `Mata kuliah "${payload.kode_mk}" berhasil ${namaAksi}.`,
        confirmText: 'OK', onConfirm: hideAlert,
      }), 350);
    } catch (err) {
      showAlert({
        type: 'error', title: 'Gagal Menyimpan',
        message: err.message || 'Terjadi kesalahan saat menyimpan data.',
        confirmText: 'OK', onConfirm: hideAlert,
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle Pilihan CPL (Checkbox handler)
  const toggleCplSelection = (id) => {
    if (formCplIds.includes(id)) {
      setFormCplIds(formCplIds.filter(item => item !== id));
    } else {
      setFormCplIds([...formCplIds, id]);
    }
  };

  // Filter list CPL berdasarkan program studi yang sedang dipilih di form
  const filteredCplsByProdi = cplList.filter(cpl => String(cpl.prodi_id) === String(formProdiId));

  // ── Hapus ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const { id, nama } = deleteConfirm;
    setDeleteConfirm({ visible: false, id: null, nama: '' });
    setDetailVisible(false);
    try {
      await mkSaApi.delete(id);
      fetchAll();
      setTimeout(() => showAlert({
        type: 'success',
        title: 'Berhasil Dihapus',
        message: `Mata kuliah "${nama}" telah dihapus dari daftar.`,
        confirmText: 'OK', onConfirm: hideAlert,
      }), 350);
    } catch (err) {
      showAlert({
        type: 'error', title: 'Gagal Menghapus',
        message: err.message || 'Terjadi kesalahan server.',
        confirmText: 'OK', onConfirm: hideAlert,
      });
    }
  };

  const openEditModal = async (item) => {
    setDetailVisible(false);
    
    // Fetch detail MK untuk mendapatkan cpl_ids yang lengkap
    try {
      const detailResponse = await mkSaApi.getById(item.id);
      const detailData = detailResponse?.data || detailResponse;
      
      setTimeout(() => {
        setEditId(detailData.id);
        setFormProdiId(detailData.prodi_id || '');
        const prodi = prodiList.find(p => String(p.id) === String(detailData.prodi_id));
        setFormProdiName(prodi?.nama_prodi || detailData.nama_prodi || '');
        setFormKode(detailData.kode_mk || '');
        setFormNama(detailData.nama_mk || '');
        setFormSks(String(detailData.sks || ''));
        setFormSemester(String(detailData.semester || ''));
        
        // Mengambil data relasi CPL yang sudah tersimpan sebelumnya saat edit
        const existingCplIds = detailData.cpl_ids || detailData.cpls?.map(c => c.id) || [];
        setFormCplIds(existingCplIds);
        
        setFormVisible(true);
      }, 250);
    } catch (err) {
      showAlert({
        type: 'error', title: 'Gagal Memuat Detail',
        message: err.message || 'Tidak dapat memuat data mata kuliah.',
        confirmText: 'OK', onConfirm: hideAlert,
      });
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormProdiId(''); setFormProdiName('');
    setFormKode('');    setFormNama('');
    setFormSks('');     setFormSemester('');
    setFormCplIds([]);
  };

  const getProdiKode = (prodiId) =>
    prodiList.find(p => String(p.id) === String(prodiId))?.kode_prodi || '-';

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredData = data.filter(item => {
    const matchProdi = !filterProdi || String(item.prodi_id) === String(filterProdi.id);
    const matchSem   = !filterSemester || String(item.semester) === String(filterSemester);
    return matchProdi && matchSem;
  });

  // ── Fungsi Singkatan/Inisial Profil Dinamis ───────────────────────────────
  const getInitials = (name) => {
    if (!name) return 'MK';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // ── Render kartu ──────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const cplCount = item.cpl_count ?? 0;
    const badgeText = getInitials(item.nama_mk);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={async () => {
          // Fetch detail untuk dapat data CPL lengkap
          try {
            const detailResponse = await mkSaApi.getById(item.id);
            const detailData = detailResponse?.data || detailResponse;
            setDetailItem(detailData);
            setDetailVisible(true);
          } catch (err) {
            // Fallback: gunakan data dari list jika fetch gagal
            setDetailItem(item);
            setDetailVisible(true);
          }
        }}
        activeOpacity={0.82}
      >
        <View style={styles.leftBadge}>
          <Text style={styles.leftBadgeText}>{badgeText}</Text>
        </View>
        <View style={styles.cardContentWrap}>
          <Text style={styles.cardNamaMain} numberOfLines={1}>{item.kode_mk} - {item.nama_mk}</Text>
          <Text style={styles.cardSubDetails}>SKS: {item.sks} · Semester {item.semester} · {cplCount} CPL</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </TouchableOpacity>
    );
  };

  // ─── JSX ─────────────────────────────────────────────────────────────────
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
          <Text style={styles.headerTitle}>Mata Kuliah</Text>
          <Text style={styles.headerSubtitle}>Pemetaan Mata Kuliah Program Studi Sistem Informasi</Text>
        </View>
      </View>

      {/* DAFTAR MATA KULIAH */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_DARK} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="book-outline" size={56} color="#cbd5e1" />
          <Text style={styles.emptyText}>Belum ada mata kuliah</Text>
          <Text style={styles.emptySubText}>Tekan tombol + untuk menambahkan data baru.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, i) => (item.id || i).toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchAll}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { resetForm(); setFormVisible(true); }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color={PRIMARY_DARK} />
      </TouchableOpacity>

      {/* MODAL DETAIL */}
      <Modal visible={detailVisible} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.detailOverlay}>
          <TouchableWithoutFeedback onPress={() => setDetailVisible(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.detailBox}>
            {detailItem && (
              <>
                {/* Kode badge */}
                <View style={styles.detailKodeBadge}>
                  <Text style={styles.detailKodeText}>{detailItem.kode_mk}</Text>
                </View>

                {/* Nama MK - Text biasa, tidak pakai ScrollView */}
                <Text style={styles.detailNama}>{detailItem.nama_mk}</Text>

                {/* Info chips: prodi, sks, semester */}
                <View style={styles.detailInfoRow}>
                  <View style={styles.detailProdiChip}>
                    <Ionicons name="business-outline" size={12} color={PRIMARY_BLUE} style={{ marginRight: 4 }} />
                    <Text style={styles.detailProdiText} numberOfLines={1}>{getProdiKode(detailItem.prodi_id)}</Text>
                  </View>
                  <View style={styles.detailInfoChip}>
                    <Text style={styles.detailInfoText}>{detailItem.sks} SKS</Text>
                  </View>
                  <View style={styles.detailInfoChip}>
                    <Text style={styles.detailInfoText}>Semester {detailItem.semester}</Text>
                  </View>
                </View>

                {/* Daftar CPL dalam ScrollView */}
                {detailItem.cpls && detailItem.cpls.length > 0 && (
                  <>
                    <Text style={styles.detailCplTitle}>Capaian Pembelajaran Terkait:</Text>
                    <ScrollView style={styles.detailCplScroll} showsVerticalScrollIndicator={false}>
                      {detailItem.cpls.map((cpl, idx) => (
                        <View key={idx} style={styles.detailCplItem}>
                          <Text style={styles.detailCplKode}>• {cpl.kode_cpl}</Text>
                          <Text style={styles.detailCplDesc}>{cpl.deskripsi}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </>
                )}

                <View style={styles.detailDivider} />

                {/* Aksi */}
                <View style={styles.detailBtnRow}>
                  <TouchableOpacity
                    style={styles.detailBtnHapus}
                    onPress={() => {
                      setDetailVisible(false);
                      setTimeout(() =>
                        setDeleteConfirm({ visible: true, id: detailItem.id, nama: detailItem.nama_mk }), 200);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.detailBtnText}>Hapus</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.detailBtnEdit} onPress={() => openEditModal(detailItem)}>
                    <Ionicons name="pencil-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.detailBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL FORM TAMBAH / EDIT */}
      <Modal visible={formVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editId ? 'Edit Mata Kuliah' : 'Tambah MK Baru'}</Text>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.inputDropdown}
                onPress={() => { Keyboard.dismiss(); setPickerType('formProdi'); setPickerVisible(true); }}
              >
                <Ionicons name="business-outline" size={18} color={PRIMARY_BLUE} style={{ marginRight: 10 }} />
                <Text style={[styles.dropdownValue, !formProdiName && { color: '#94A3B8' }]} numberOfLines={1}>
                  {formProdiName || 'Pilih Program Studi'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Kode MK (contoh: IF101)"
                placeholderTextColor="#94A3B8"
                value={formKode}
                onChangeText={setFormKode}
                autoCapitalize="characters"
              />
              <TextInput
                style={styles.input}
                placeholder="Nama Mata Kuliah"
                placeholderTextColor="#94A3B8"
                value={formNama}
                onChangeText={setFormNama}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="SKS"
                  placeholderTextColor="#94A3B8"
                  value={formSks}
                  onChangeText={setFormSks}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={[styles.inputDropdown, { flex: 1, marginBottom: 12 }]}
                  onPress={() => { Keyboard.dismiss(); setPickerType('formSemester'); setPickerVisible(true); }}
                >
                  <Text style={[styles.dropdownValue, !formSemester && { color: '#94A3B8' }]}>
                    {formSemester ? `Semester ${formSemester}` : 'Semester'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* PERBAIKAN SEKSI: CHECKBOX MULTI-SELECT CPL */}
              {formProdiId ? (
                <View style={styles.cplSection}>
                  <Text style={styles.cplSectionTitle}>Pilih Capaian Pembelajaran (CPL):</Text>
                  {filteredCplsByProdi.length === 0 ? (
                    <Text style={styles.cplEmptyText}>Belum ada data CPL untuk prodi ini.</Text>
                  ) : (
                    filteredCplsByProdi.map((cpl) => {
                      const isSelected = formCplIds.includes(cpl.id);
                      return (
                        <TouchableOpacity
                          key={cpl.id}
                          style={[styles.cplItemRow, isSelected && styles.cplItemRowSelected]}
                          onPress={() => toggleCplSelection(cpl.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isSelected ? "checkbox" : "square-outline"}
                            size={20}
                            color={isSelected ? SUCCESS_COLOR : PRIMARY_BLUE}
                          />
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.cplItemKode}>{cpl.kode_cpl || cpl.kode || 'CPL'}</Text>
                            <Text style={styles.cplItemDesc} numberOfLines={2}>{cpl.deskripsi || cpl.nama || ''}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              ) : (
                <Text style={styles.cplHintText}>Silakan pilih Program Studi terlebih dahulu untuk memuat daftar CPL.</Text>
              )}
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => { setFormVisible(false); resetForm(); }}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSubmit, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.btnSubmitText}>Simpan MK</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL PICKER */}
      <Modal visible={pickerVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setPickerVisible(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.pickerBox}>
              <Text style={styles.pickerTitle}>
                {pickerType === 'semester' || pickerType === 'formSemester' ? 'Pilih Semester' : 'Pilih Program Studi'}
              </Text>
              <ScrollView>
                {(pickerType === 'semester' || pickerType === 'formSemester')
                  ? [1,2,3,4,5,6,7,8].map(sem => (
                      <TouchableOpacity key={sem} style={styles.pickerOption}
                        onPress={() => {
                          if (pickerType === 'formSemester') setFormSemester(String(sem));
                          else setFilterSemester(sem);
                          setPickerVisible(false);
                        }}>
                        <Text style={styles.pickerOptionText}>Semester {sem}</Text>
                      </TouchableOpacity>
                    ))
                  : [
                      ...(pickerType === 'prodi'
                        ? [{ id: '__all__', kode_prodi: 'Semua', nama_prodi: 'Tampilkan Semua Prodi' }]
                        : []),
                      ...prodiList,
                    ].map(p => (
                      <TouchableOpacity key={p.id} style={styles.pickerOption}
                        onPress={() => {
                          if (pickerType === 'formProdi') {
                            setFormProdiId(p.id);
                            setFormProdiName(p.nama_prodi);
                            setFormCplIds([]); // Reset pilihan CPL ketika ganti Prodi
                          } else {
                            setFilterProdi(p.id === '__all__' ? null : p);
                          }
                          setPickerVisible(false);
                        }}>
                        <Text style={styles.pickerOptionText}>{p.kode_prodi} — {p.nama_prodi}</Text>
                      </TouchableOpacity>
                    ))
                }
              </ScrollView>
              <TouchableOpacity style={styles.pickerCloseBtn} onPress={() => setPickerVisible(false)}>
                <Text style={styles.pickerCloseText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS */}
      <Modal visible={deleteConfirm.visible} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="trash-outline" size={34} color={DANGER_COLOR} />
            </View>
            <Text style={styles.confirmTitle}>Hapus Mata Kuliah?</Text>
            <Text style={styles.confirmMsg}>
              <Text style={{ fontFamily: 'Urbanist-Bold', color: PRIMARY_DARK }}>"{deleteConfirm.nama}"</Text>
              {' '}akan dihapus permanen dari kurikulum.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 4 }}>
              <TouchableOpacity
                style={styles.confirmBtnCancel}
                onPress={() => setDeleteConfirm({ visible: false, id: null, nama: '' })}
              >
                <Text style={styles.confirmBtnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtnHapus} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={styles.confirmBtnHapusText}>Ya, Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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

// ─── Styles ───
const styles = StyleSheet.create({
  container : { flex: 1, backgroundColor: '#F6F5FA' },

  header         : { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 22, paddingHorizontal: 24, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  backBtn        : { padding: 8, marginRight: 12 },
  headerTextWrap : { flex: 1, marginLeft: 10 },
  headerTitle    : { fontFamily: 'Urbanist-Bold', fontSize: 24, color: PRIMARY_DARK, marginBottom: 2 },
  headerSubtitle : { fontFamily: 'Urbanist-Regular', fontSize: 14, color: PRIMARY_DARK, opacity: 0.7 },

  listContent : { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 100 },

  card      : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 10, elevation: 1.5, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  leftBadge : { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center' },
  leftBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK },
  cardContentWrap: { flex: 1, marginLeft: 12 },
  cardNamaMain : { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK, marginBottom: 2 },
  cardSubDetails: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: PRIMARY_BLUE },

  centerContainer : { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText     : { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#94A3B8', marginTop: 10 },
  emptyWrap       : { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText       : { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#94A3B8', marginTop: 14 },
  emptySubText    : { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#CBD5E1', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },

  fab : { position: 'absolute', bottom: 28, right: 22, width: 58, height: 58, borderRadius: 29, backgroundColor: FAB_COLOR, justifyContent: 'center', alignItems: 'center', elevation: 8 },

  detailOverlay   : { flex: 1, backgroundColor: 'rgba(36,53,74,0.55)', justifyContent: 'center', alignItems: 'center' },
  detailBox       : { backgroundColor: '#FFF', borderRadius: 28, padding: 28, width: SW * 0.84, maxHeight: '75%', alignItems: 'center', elevation: 20 },
  detailKodeBadge : { backgroundColor: '#dbeafe', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 14 },
  detailKodeText  : { fontFamily: 'Urbanist-Bold', fontSize: 16, color: PRIMARY_BLUE },
  detailNama      : { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#1E293B', textAlign: 'center', marginBottom: 16, paddingHorizontal: 8 },
  detailInfoRow   : { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16, width: '100%' },
  detailProdiChip : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  detailProdiText : { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#475569' },
  detailInfoChip  : { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  detailInfoText  : { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#475569' },
  
  // CPL List dalam detail
  detailCplTitle  : { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#1E293B', alignSelf: 'flex-start', marginBottom: 8 },
  detailCplScroll : { maxHeight: 150, width: '100%', marginBottom: 16 },
  detailCplItem   : { marginBottom: 10, paddingLeft: 4 },
  detailCplKode   : { fontFamily: 'Urbanist-Bold', fontSize: 13, color: PRIMARY_BLUE, marginBottom: 2 },
  detailCplDesc   : { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', lineHeight: 18 },
  
  detailDivider   : { width: '100%', height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },
  detailBtnRow    : { flexDirection: 'row', gap: 12, width: '100%' },
  detailBtnHapus  : { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: DANGER_COLOR, paddingVertical: 14, borderRadius: 18, gap: 6 },
  detailBtnEdit   : { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: PRIMARY_DARK, paddingVertical: 14, borderRadius: 18, gap: 6 },
  detailBtnText   : { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 14 },

  modalOverlay  : { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'flex-end' },
  modalContent  : { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingBottom: 40 },
  modalHandle   : { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitle    : { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 20 },
  inputDropdown : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 18, paddingHorizontal: 15, paddingVertical: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  dropdownValue : { flex: 1, fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#212121' },
  input         : { backgroundColor: '#f8fafc', borderRadius: 18, marginBottom: 12, paddingHorizontal: 15, paddingVertical: 14, fontFamily: 'Urbanist-Regular', fontSize: 14, borderWidth: 1, borderColor: '#e2e8f0', color: '#212121' },
  buttonRow     : { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnCancel     : { flex: 1, backgroundColor: '#ffebee', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelText : { color: DANGER_COLOR, fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmit     : { flex: 1, backgroundColor: PRIMARY_DARK, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  btnSubmitText : { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 14 },

  pickerOverlay    : { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  pickerBox        : { backgroundColor: '#FFF', borderRadius: 24, padding: 20, maxHeight: '60%' },
  pickerTitle      : { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 12 },
  
  pickerOption     : { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  pickerOptionText : { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#212121', textAlign: 'center' },
  
  pickerCloseBtn   : { marginTop: 12, paddingVertical: 10, paddingHorizontal: 30, backgroundColor: '#f1f5f9', borderRadius: 16, alignSelf: 'center' },
  pickerCloseText  : { color: '#64748B', fontFamily: 'Urbanist-Bold', fontSize: 13 },

  confirmOverlay       : { flex: 1, backgroundColor: 'rgba(36,53,74,0.55)', justifyContent: 'center', alignItems: 'center' },
  confirmBox           : { backgroundColor: '#FFF', borderRadius: 26, padding: 26, width: SW * 0.82, alignItems: 'center', elevation: 16 },
  confirmIconWrap      : { width: 68, height: 68, borderRadius: 34, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  confirmTitle         : { fontFamily: 'Urbanist-Bold', fontSize: 19, color: '#1E293B', marginBottom: 8 },
  confirmMsg           : { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  confirmBtnCancel     : { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 18, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  confirmBtnCancelText : { color: '#64748B', fontFamily: 'Urbanist-Bold', fontSize: 14 },
  confirmBtnHapus      : { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: DANGER_COLOR, borderRadius: 18, paddingVertical: 13, gap: 6 },
  confirmBtnHapusText  : { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 14 },

  // STYLES BARU UNTUK SEKSI CHECKBOX CPL
  cplSection: { marginTop: 10, marginBottom: 15 },
  cplSectionTitle: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#1E293B', marginBottom: 8 },
  cplEmptyText: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#94A3B8', style: 'italic', paddingVertical: 5 },
  cplHintText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, textAlign: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  cplItemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  cplItemRowSelected: { backgroundColor: '#f0fdf4', borderColor: SUCCESS_COLOR },
  cplItemKode: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#1E293B' },
  cplItemDesc: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', marginTop: 2 }
});