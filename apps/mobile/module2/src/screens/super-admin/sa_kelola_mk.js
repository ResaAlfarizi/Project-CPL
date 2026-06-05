import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar,
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback,
  Keyboard, ActivityIndicator, ScrollView, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mkSaApi, prodiApi } from '../../services/api';


// ─── Normalisasi: handle semua kemungkinan field dari BE ─────────────────────
function normalizeMk(item) {
  return {
    ...item,
    nama_mk  : item.nama_mk  || item.title || item.nama  || '',
    kode_mk  : item.kode_mk  || item.kode  || '',
    prodi_id : item.prodi_id || item.prodiId || '',
    sks      : item.sks ?? item.bobot_sks ?? 0,
    semester : item.semester ?? 0,
    cpl_count: item.cpl_count ?? item.total_cpl ?? item.jumlah_cpl ?? 0,
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
const THEME_COLOR   = '#a3c1e5';
const PRIMARY_DARK  = '#24354a';
const PRIMARY_BLUE  = '#577590';
const DANGER_COLOR  = '#c62828';
const SUCCESS_COLOR = '#16a34a';

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ visible, type, title, message, onHide }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
      const t = setTimeout(onHide, 3200);
      return () => clearTimeout(t);
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  const isSuccess = type === 'success';
  const bg        = isSuccess ? '#dcfce7' : '#fee2e2';
  const border    = isSuccess ? SUCCESS_COLOR : DANGER_COLOR;
  const icon      = isSuccess ? 'checkmark-circle' : 'close-circle';
  const iconColor = isSuccess ? SUCCESS_COLOR : DANGER_COLOR;

  if (!visible) return null;

  return (
    <Animated.View style={[
      styles.toast,
      { backgroundColor: bg, borderLeftColor: border },
      {
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [-30, 0] }) }],
      },
    ]}>
      <Ionicons name={icon} size={26} color={iconColor} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={[styles.toastTitle, { color: border }]}>{title}</Text>
        {!!message && <Text style={styles.toastMsg}>{message}</Text>}
      </View>
      <TouchableOpacity onPress={onHide}>
        <Ionicons name="close" size={18} color="#94A3B8" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Komponen utama ──────────────────────────────────────────────────────────
export default function SAKelolaMKScreen({ navigation }) {
  const [data, setData]           = useState([]);
  const [prodiList, setProdiList] = useState([]);
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

  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, id: null, nama: '' });
  const [toast, setToast] = useState({ visible: false, type: '', title: '', message: '' });

  const showToast = (type, title, message = '') =>
    setToast({ visible: true, type, title, message });
  const hideToast = () => setToast(t => ({ ...t, visible: false }));

  useEffect(() => { fetchAll(); }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resMk, resProdi] = await Promise.all([
        mkSaApi.getAll().catch(e => {
          console.log('❌ mkSaApi.getAll() error:', e?.message);
          return null;
        }),
        prodiApi.getAll().catch(e => {
          console.log('❌ prodiApi.getAll() error:', e?.message);
          return null;
        }),
      ]);

      console.log('📦 resMk raw:', JSON.stringify(resMk)?.slice(0, 300));

      if (resMk === null) {
        showToast('error', 'Gagal memuat MK', 'Cek console untuk detail error.');
      } else {
        const arr = extractArray(resMk);
        console.log('📋 Jumlah MK:', arr.length, '| Contoh:', JSON.stringify(arr[0]));
        setData(arr.map(normalizeMk));
      }

      if (resProdi !== null) {
        setProdiList(extractArray(resProdi));
      }
    } catch (err) {
      console.log('❌ fetchAll catch:', err?.message);
      showToast('error', 'Koneksi gagal', err.message || 'Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  // ── Simpan ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formProdiId || !formKode || !formNama || !formSks || !formSemester) {
      showToast('error', 'Form tidak lengkap', 'Harap isi semua kolom.');
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
      };

      if (editId) {
        await mkSaApi.update(editId, payload);
      } else {
        await mkSaApi.create(payload);
      }

      showToast('success', editId ? 'Berhasil diperbarui' : 'MK ditambahkan',
        `${payload.kode_mk} berhasil disimpan.`);
      setFormVisible(false);
      resetForm();
      fetchAll();
    } catch (err) {
      showToast('error', 'Gagal menyimpan', err.message || 'Terjadi kesalahan server.');
    } finally {
      setSaving(false);
    }
  };

  // ── Hapus ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const { id, nama } = deleteConfirm;
    setDeleteConfirm({ visible: false, id: null, nama: '' });
    setDetailVisible(false);
    try {
      await mkSaApi.delete(id);
      fetchAll();
      showToast('success', 'MK dihapus', `"${nama}" berhasil dihapus.`);
    } catch (err) {
      showToast('error', 'Gagal menghapus', err.message || 'Terjadi kesalahan server.');
    }
  };

  const openEditModal = (item) => {
    setDetailVisible(false);
    setTimeout(() => {
      setEditId(item.id);
      setFormProdiId(item.prodi_id || '');
      const prodi = prodiList.find(p => String(p.id) === String(item.prodi_id));
      setFormProdiName(prodi?.nama_prodi || item.nama_prodi || '');
      setFormKode(item.kode_mk || '');
      setFormNama(item.nama_mk || '');
      setFormSks(String(item.sks || ''));
      setFormSemester(String(item.semester || ''));
      setFormVisible(true);
    }, 250);
  };

  const resetForm = () => {
    setEditId(null);
    setFormProdiId(''); setFormProdiName('');
    setFormKode('');    setFormNama('');
    setFormSks('');     setFormSemester('');
  };

  const getProdiKode = (prodiId) =>
    prodiList.find(p => String(p.id) === String(prodiId))?.kode_prodi || '-';

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredData = data.filter(item => {
    const matchProdi = !filterProdi || String(item.prodi_id) === String(filterProdi.id);
    const matchSem   = !filterSemester || String(item.semester) === String(filterSemester);
    return matchProdi && matchSem;
  });

  const semesterCounts = filteredData.reduce((acc, item) => {
    const sem = parseInt(item.semester);
    if (!isNaN(sem)) acc[sem] = (acc[sem] || 0) + 1;
    return acc;
  }, {});

  // ── Render baris ──────────────────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    const cplCount = item.cpl_count ?? 0;
    return (
      <View style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
        <Text style={[styles.cell, styles.cellNo]}>{index + 1}</Text>

        <View style={[styles.cell, styles.cellKode]}>
          <View style={styles.kodeBadge}>
            <Text style={styles.kodeText}>{item.kode_mk}</Text>
          </View>
        </View>

        <Text style={[styles.cell, styles.cellNama]} numberOfLines={2}>{item.nama_mk}</Text>

        <Text style={[styles.cell, styles.cellProdi]}>{getProdiKode(item.prodi_id)}</Text>

        <View style={[styles.cell, styles.cellSks]}>
          <View style={styles.sksBadge}>
            <Text style={styles.sksText}>{item.sks}</Text>
            <Text style={styles.sksLabel}>SKS</Text>
          </View>
        </View>

        <Text style={[styles.cell, styles.cellSem]}>Sem {item.semester}</Text>

        <View style={[styles.cell, styles.cellCpl]}>
          <View style={styles.cplBadge}>
            <Text style={styles.cplText}>{cplCount} CPL</Text>
          </View>
        </View>

        <View style={[styles.cell, styles.cellAksi]}>
          <TouchableOpacity
            style={styles.btnDetail}
            onPress={() => { setDetailItem(item); setDetailVisible(true); }}
          >
            <Ionicons name="chevron-forward" size={16} color={PRIMARY_BLUE} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── JSX ─────────────────────────────────────────────────────────────────
  return (
    <ImageBackground
      source={require('../../../assets/uinsa2.jpeg')}
      style={styles.container}
      imageStyle={{ opacity: 0.07 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.toastWrapper} pointerEvents="box-none">
        <Toast
          visible={toast.visible}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onHide={hideToast}
        />
      </View>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Mata Kuliah</Text>
          <Text style={styles.headerSubtitle}>Kelola kurikulum seluruh Program Studi</Text>
        </View>
      </View>

      {/* FILTER BAR */}
      <View style={styles.controlBar}>
        <TouchableOpacity
          style={[styles.filterBtn, filterProdi && styles.filterBtnActive]}
          onPress={() => { setPickerType('prodi'); setPickerVisible(true); }}
        >
          <Text style={[styles.filterBtnText, filterProdi && styles.filterBtnTextActive]} numberOfLines={1}>
            {filterProdi ? filterProdi.kode_prodi : 'Semua Prodi'}
          </Text>
          <Ionicons name="chevron-down" size={13} color={filterProdi ? '#fff' : PRIMARY_BLUE} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filterSemester && styles.filterBtnActive]}
          onPress={() => { setPickerType('semester'); setPickerVisible(true); }}
        >
          <Text style={[styles.filterBtnText, filterSemester && styles.filterBtnTextActive]}>
            {filterSemester ? `Semester ${filterSemester}` : 'Semua Semester'}
          </Text>
          <Ionicons name="chevron-down" size={13} color={filterSemester ? '#fff' : PRIMARY_BLUE} />
        </TouchableOpacity>

        {(filterProdi || filterSemester) && (
          <TouchableOpacity onPress={() => { setFilterProdi(null); setFilterSemester(null); }}>
            <Ionicons name="close-circle" size={22} color={DANGER_COLOR} />
          </TouchableOpacity>
        )}
      </View>

      {/* DISTRIBUSI SEMESTER */}
      {Object.keys(semesterCounts).length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.semDistRow}>
          {Object.entries(semesterCounts)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([sem, count]) => {
              const active = filterSemester === parseInt(sem);
              return (
                <TouchableOpacity
                  key={sem}
                  style={[styles.semPill, active && styles.semPillActive]}
                  onPress={() => setFilterSemester(active ? null : parseInt(sem))}
                >
                  <Text style={[styles.semPillText, active && { color: '#fff' }]}>
                    Sem {sem}{'  '}
                    <Text style={[styles.semPillCount, active && { color: '#c7e6ff' }]}>{count} MK</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      )}

      {/* HEADER DAFTAR */}
      <View style={styles.listHeaderWrap}>
        <Text style={styles.listHeaderTitle}>Daftar Mata Kuliah</Text>
        <Text style={styles.listHeaderSub}>{filteredData.length} dari {data.length} mata kuliah</Text>
      </View>

      {/* TABEL */}
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
        <View style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.tableWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ minWidth: SW - 24 }}>
                  <View style={styles.tableHead}>
                    <Text style={[styles.headCell, styles.cellNo]}>#</Text>
                    <Text style={[styles.headCell, styles.cellKode]}>KODE MK</Text>
                    <Text style={[styles.headCell, styles.cellNama]}>NAMA MATA KULIAH</Text>
                    <Text style={[styles.headCell, styles.cellProdi]}>PRODI</Text>
                    <Text style={[styles.headCell, styles.cellSks]}>SKS</Text>
                    <Text style={[styles.headCell, styles.cellSem]}>SEMESTER</Text>
                    <Text style={[styles.headCell, styles.cellCpl]}>CPL{'\n'}TERPETAKAN</Text>
                    <Text style={[styles.headCell, styles.cellAksi]}>AKSI</Text>
                  </View>
                  <FlatList
                    data={filteredData}
                    keyExtractor={(item, i) => (item.id || i).toString()}
                    renderItem={renderItem}
                    scrollEnabled={false}
                    refreshing={loading}
                    onRefresh={fetchAll}
                  />
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { resetForm(); setFormVisible(true); }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* MODAL DETAIL */}
      <Modal visible={detailVisible} animationType="fade" transparent>
        <TouchableOpacity style={styles.detailOverlay} activeOpacity={1} onPress={() => setDetailVisible(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.detailBox}>
              {detailItem && (
                <>
                  <View style={styles.detailKodeBadge}>
                    <Text style={styles.detailKodeText}>{detailItem.kode_mk}</Text>
                  </View>
                  <Text style={styles.detailNama}>{detailItem.nama_mk}</Text>
                  <View style={styles.detailInfoRow}>
                    <View style={styles.detailInfoChip}>
                      <Ionicons name="business-outline" size={14} color={PRIMARY_BLUE} />
                      <Text style={styles.detailInfoText}>{getProdiKode(detailItem.prodi_id)}</Text>
                    </View>
                    <View style={[styles.detailInfoChip, { backgroundColor: '#dbeafe' }]}>
                      <Text style={[styles.detailInfoText, { color: '#1d4ed8' }]}>{detailItem.sks} SKS</Text>
                    </View>
                    <View style={[styles.detailInfoChip, { backgroundColor: '#f0fdf4' }]}>
                      <Text style={[styles.detailInfoText, { color: SUCCESS_COLOR }]}>{detailItem.cpl_count ?? 0} CPL</Text>
                    </View>
                    <View style={[styles.detailInfoChip, { backgroundColor: '#fef9c3' }]}>
                      <Text style={[styles.detailInfoText, { color: '#854d0e' }]}>Sem {detailItem.semester}</Text>
                    </View>
                  </View>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailBtnRow}>
                    <TouchableOpacity
                      style={styles.detailBtnHapus}
                      onPress={() => {
                        setDetailVisible(false);
                        setTimeout(() =>
                          setDeleteConfirm({ visible: true, id: detailItem.id, nama: detailItem.nama_mk }), 200);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#fff" />
                      <Text style={styles.detailBtnText}>Hapus</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.detailBtnEdit} onPress={() => openEditModal(detailItem)}>
                      <Ionicons name="pencil-outline" size={18} color="#fff" />
                      <Text style={styles.detailBtnText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* MODAL FORM TAMBAH / EDIT */}
      <Modal visible={formVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editId ? 'Edit Mata Kuliah' : 'Tambah MK Baru'}</Text>

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
    </ImageBackground>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container : { flex: 1, backgroundColor: '#F6F5FA' },

  toastWrapper : { position: 'absolute', top: 58, left: 16, right: 16, zIndex: 999 },
  toast        : { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, borderLeftWidth: 5, elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8 },
  toastTitle   : { fontFamily: 'Urbanist-Bold', fontSize: 14 },
  toastMsg     : { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#475569', marginTop: 2 },

  header         : { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 22, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  backBtn        : { padding: 8, marginRight: 12 },
  headerTextWrap : { flex: 1 },
  headerTitle    : { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 2 },
  headerSubtitle : { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },

  controlBar         : { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6, gap: 8 },
  filterBtn          : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 22, borderWidth: 1, borderColor: '#E2E8F0', gap: 5, elevation: 1 },
  filterBtnActive    : { backgroundColor: PRIMARY_DARK, borderColor: PRIMARY_DARK },
  filterBtnText      : { fontFamily: 'Urbanist-Medium', fontSize: 12, color: PRIMARY_BLUE },
  filterBtnTextActive: { color: '#FFF' },

  semDistRow  : { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  semPill     : { backgroundColor: '#dbeafe', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#bfdbfe' },
  semPillActive : { backgroundColor: PRIMARY_DARK, borderColor: PRIMARY_DARK },
  semPillText   : { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#1d4ed8' },
  semPillCount  : { fontFamily: 'Urbanist-Regular', color: '#3b82f6' },

  listHeaderWrap  : { paddingHorizontal: 16, paddingBottom: 6 },
  listHeaderTitle : { fontFamily: 'Urbanist-Bold', fontSize: 16, color: PRIMARY_DARK },
  listHeaderSub   : { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#94A3B8', marginTop: 2 },

  tableWrapper : { marginHorizontal: 12, marginTop: 2, backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2, overflow: 'hidden' },
  tableHead    : { flexDirection: 'row', backgroundColor: PRIMARY_DARK, paddingVertical: 10, paddingHorizontal: 10 },
  headCell     : { fontFamily: 'Urbanist-Bold', fontSize: 9, color: '#94A3B8', letterSpacing: 0.4, textAlign: 'center' },
  tableRow     : { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10 },
  rowEven      : { backgroundColor: '#fff' },
  rowOdd       : { backgroundColor: '#F8FAFC' },
  cell         : { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#334155' },

  cellNo   : { width: 24, textAlign: 'center', color: '#CBD5E1', fontFamily: 'Urbanist-Bold', fontSize: 11 },
  cellKode : { width: 76 },
  cellNama : { flex: 1, minWidth: 140, paddingRight: 6, fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#1E293B' },
  cellProdi: { width: 44, textAlign: 'center', fontFamily: 'Urbanist-Bold', fontSize: 11, color: PRIMARY_BLUE },
  cellSks  : { width: 48, alignItems: 'center' },
  cellSem  : { width: 54, textAlign: 'center', fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#475569' },
  cellCpl  : { width: 72, alignItems: 'center' },
  cellAksi : { width: 38, alignItems: 'center' },

  kodeBadge : { backgroundColor: PRIMARY_DARK, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 },
  kodeText  : { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#FFF' },
  sksBadge  : { backgroundColor: '#dbeafe', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10, alignItems: 'center' },
  sksText   : { fontFamily: 'Urbanist-ExtraBold', fontSize: 11, color: '#1d4ed8', lineHeight: 13 },
  sksLabel  : { fontFamily: 'Urbanist-Regular', fontSize: 8, color: '#3b82f6', lineHeight: 10 },
  cplBadge  : { backgroundColor: '#dcfce7', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10 },
  cplText   : { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#166534' },
  btnDetail : { width: 28, height: 28, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },

  centerContainer : { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText     : { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#94A3B8', marginTop: 10 },
  emptyWrap       : { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText       : { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#94A3B8', marginTop: 14 },
  emptySubText    : { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#CBD5E1', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },

  fab : { position: 'absolute', bottom: 28, right: 22, width: 58, height: 58, borderRadius: 29, backgroundColor: PRIMARY_DARK, justifyContent: 'center', alignItems: 'center', elevation: 8 },

  detailOverlay   : { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  detailBox       : { backgroundColor: '#FFF', borderRadius: 28, padding: 28, width: SW * 0.84, alignItems: 'center', elevation: 20 },
  detailKodeBadge : { backgroundColor: '#dbeafe', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 14 },
  detailKodeText  : { fontFamily: 'Urbanist-Bold', fontSize: 16, color: PRIMARY_BLUE },
  detailNama      : { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#1E293B', textAlign: 'center', marginBottom: 16 },
  detailInfoRow   : { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 },
  detailInfoChip  : { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  detailInfoText  : { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#475569' },
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
  btnCancel     : { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  btnCancelText : { color: '#64748B', fontFamily: 'Urbanist-Bold', fontSize: 14 },
  btnSubmit     : { flex: 1, backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  btnSubmitText : { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 14 },

  pickerOverlay    : { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  pickerBox        : { backgroundColor: '#FFF', borderRadius: 24, padding: 20, maxHeight: '60%' },
  pickerTitle      : { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 12 },
  pickerOption     : { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  pickerOptionText : { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#212121', textAlign: 'center' },
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
});