import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ImageBackground, Modal, TextInput, TouchableWithoutFeedback,
  Keyboard, FlatList, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dosenApi, mahasiswaApi, prodiApi, userApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;
const PRIMARY_DARK = BASE.primary;
const PRIMARY_BLUE = BASE.primaryLight;
const DANGER = BASE.error;
const GREEN = BASE.success;

// ─── Helper ──────────────────────────────────────────────────────────────────
const getProdiId = (p) => p?.id ?? p?.id_prodi ?? null;

// ─── CUSTOM ALERT ─────────────────────────────────────────────────────────────
function CustomAlert({ visible, type, title, message, onConfirm, onCancel, confirmText, cancelText }) {
  if (!visible) return null;
  const isSuccess = type === 'success';
  const isDanger  = type === 'danger';
  const isError   = type === 'error';
  const iconName  = isSuccess ? 'checkmark-circle' : isDanger ? 'trash' : isError ? 'close-circle' : 'alert-circle';
  const iconColor = isSuccess ? GREEN : (isDanger || isError) ? DANGER : PRIMARY_BLUE;
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
              style={[alertStyles.btnConfirm, { backgroundColor: isSuccess ? GREEN : (isDanger || isError) ? DANGER : PRIMARY_BLUE }, !onCancel && { flex: 1 }]}
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

// ─── ROLE TOGGLE ─────────────────────────────────────────────────────────────
function RoleToggle({ value, onChange }) {
  return (
    <View style={roleStyles.wrap}>
      <TouchableOpacity
        style={[roleStyles.btn, value === 'dosen' && roleStyles.btnActive]}
        onPress={() => onChange('dosen')}
      >
        <Ionicons name="school" size={16} color={value === 'dosen' ? '#FFF' : PRIMARY_BLUE} style={{ marginRight: 6 }} />
        <Text style={[roleStyles.btnText, value === 'dosen' && roleStyles.btnTextActive]}>Dosen</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[roleStyles.btn, value === 'mahasiswa' && roleStyles.btnActiveMhs]}
        onPress={() => onChange('mahasiswa')}
      >
        <Ionicons name="people" size={16} color={value === 'mahasiswa' ? '#FFF' : GREEN} style={{ marginRight: 6 }} />
        <Text style={[roleStyles.btnText, value === 'mahasiswa' && roleStyles.btnTextActive]}>Mahasiswa</Text>
      </TouchableOpacity>
    </View>
  );
}
const roleStyles = StyleSheet.create({
  wrap:             { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 20, padding: 4, marginBottom: 20 },
  btn:              { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 16 },
  btnActive:        { backgroundColor: PRIMARY_BLUE, elevation: 2 },
  btnActiveMhs:     { backgroundColor: GREEN, elevation: 2 },
  btnText:          { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#64748B' },
  btnTextActive:    { color: '#FFF' },
});

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function SAKelolapenggunaScreen({ navigation }) {
  // ── Data ──
  const [dosenData,    setDosenData]    = useState([]);
  const [mhsData,      setMhsData]      = useState([]);
  const [prodiList,    setProdiList]    = useState([]);
  const [allMhsM1Data, setAllMhsM1Data] = useState([]); // ✅ Simpan semua data mahasiswa M1 untuk angkatan
  const [isLoading,    setIsLoading]    = useState(true);

  // ── Filter / search ──
  const [searchQuery,      setSearchQuery]      = useState('');
  const [filterRole,       setFilterRole]       = useState('semua'); // 'semua' | 'dosen' | 'mahasiswa'
  const [filterProdi,      setFilterProdi]      = useState(null);   // object prodi
  const [filterAngkatan,   setFilterAngkatan]   = useState('');

  // ── Picker modals ──
  const [prodiPickerVisible,    setProdiPickerVisible]    = useState(false);
  const [angkatanPickerVisible, setAngkatanPickerVisible] = useState(false);

  // ── Detail modal ──
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedItem,  setSelectedItem]  = useState(null); // { ...data, _role: 'dosen'|'mahasiswa' }

  // ── Form modal ──
  const [formVisible, setFormVisible] = useState(false);
  const [editItem,    setEditItem]    = useState(null);
  const [formRole,    setFormRole]    = useState('dosen');

  // Form fields — Dosen
  const [fNIDN,       setFNIDN]       = useState('');
  const [fNamaDosen,  setFNamaDosen]  = useState('');
  const [fEmailDosen, setFEmailDosen] = useState('');
  const [fProdiDosen, setFProdiDosen] = useState(null); // Tambah prodi untuk dosen

  // Form fields — Mahasiswa
  const [fNIM,       setFNIM]       = useState('');
  const [fNamaMhs,   setFNamaMhs]   = useState('');
  const [fEmailMhs,  setFEmailMhs]  = useState('');
  const [fProdiId,   setFProdiId]   = useState(null);
  const [fAngkatan,  setFAngkatan]  = useState('');

  // Picker di dalam form
  const [formProdiPickerVisible,    setFormProdiPickerVisible]    = useState(false);
  const [formProdiDosenPickerVisible, setFormProdiDosenPickerVisible] = useState(false); // Tambah picker prodi dosen
  const [formAngkatanPickerVisible, setFormAngkatanPickerVisible] = useState(false);

  // ── Alert ──
  const [alert, setAlert] = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null, onCancel: null, confirmText: '', cancelText: '' });
  const showAlert = (opts) => setAlert({ visible: true, ...opts });
  const hideAlert = () => setAlert(a => ({ ...a, visible: false }));

  // ─── FETCH ─────────────────────────────────────────────────────────
const fetchAll = async () => {
  setIsLoading(true);
  try {
      // ✅ STRATEGI HYBRID:
      // - Ambil users dari M2 (untuk email)
      // - Ambil mahasiswa dari M1 (untuk angkatan)
      // - Ambil prodi dari M1
      const [resUsers, resMahasiswa, resProdi] = await Promise.all([
        userApi.getAll(),       // Module 2: JOIN untuk email
        mahasiswaApi.getAll(),  // Module 1: Untuk angkatan
        prodiApi.getAll(),      // Module 1: List prodi
      ]);
      
      console.log('📦 Response Users (M2):', resUsers);
      console.log('📦 Response Mahasiswa (M1):', resMahasiswa);
      
      // Extract users data
      const usersData = resUsers?.data || resUsers || [];
      const mhsM1Data = resMahasiswa?.data || resMahasiswa || [];
      
      // ✅ Simpan semua data mahasiswa M1 untuk filter angkatan
      setAllMhsM1Data(mhsM1Data);
      
      // Parse DOSEN dari users M2
      const dosenList = usersData
        .filter(u => u.role === 'dosen')
        .map(u => ({
          id: u.entity_id,        // ID dari tabel dosen
          id_dosen: u.entity_id,  // Alias untuk compatibility
          nidn: u.identifier,      // NIDN
          nama: u.nama,            // Nama dosen
          nama_dosen: u.nama,      // Alias
          email: u.email,          // ✅ Email dari users table
          prodi_id: u.prodi_id,    // Prodi ID
          _role: 'dosen',
          _user_id: u.id           // ID di tabel users
        }));
      
      // Parse MAHASISWA: merge M2 (email) + M1 (angkatan)
      const mhsList = usersData
        .filter(u => u.role === 'mahasiswa')
        .map(u => {
          // Cari data lengkap dari M1 berdasarkan entity_id
          const mhsDetail = mhsM1Data.find(m => m.id === u.entity_id);
          
          return {
            id: u.entity_id,        // ID dari tabel mahasiswa
            id_mahasiswa: u.entity_id, // Alias
            nim: u.identifier,       // NIM
            nama: u.nama,            // Nama mahasiswa
            nama_mahasiswa: u.nama,  // Alias
            email: u.email,          // ✅ Email dari users M2
            prodi_id: u.prodi_id,    // Prodi ID
            id_prodi: u.prodi_id,    // Alias
            angkatan: mhsDetail?.angkatan || '(tidak tersedia)', // ✅ Angkatan dari M1
            _role: 'mahasiswa',
            _user_id: u.id           // ID di tabel users
          };
        });
      
      console.log('✅ Parsed Dosen:', dosenList.length, 'items');
      console.log('✅ Parsed Mahasiswa:', mhsList.length, 'items');
      console.log('📊 Sample Dosen:', dosenList[0]);
      console.log('📊 Sample Mahasiswa:', mhsList[0]);
      
      setDosenData(dosenList);
      setMhsData(mhsList);
      setProdiList(resProdi?.data || resProdi || []);
    } catch (error) {
      console.error('❌ fetchAll error:', error);
      showAlert({ type: 'info', title: 'Gagal Memuat', message: error.message || 'Tidak dapat terhubung ke server.', confirmText: 'OK', onConfirm: hideAlert });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ─── COMBINED + FILTER ──────────────────────────────────────────
  const combined = useMemo(() => {
    let list = [];
    if (filterRole === 'semua' || filterRole === 'dosen')     list = [...list, ...dosenData];
    if (filterRole === 'semua' || filterRole === 'mahasiswa') list = [...list, ...mhsData];
    return list;
  }, [dosenData, mhsData, filterRole]);

  const filteredData = useMemo(() => {
    let list = combined;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(item => {
        if (item._role === 'dosen') {
          return (item.nidn || '').toLowerCase().includes(q) || (item.nama || item.nama_dosen || '').toLowerCase().includes(q);
        }
        return (item.nim || '').toLowerCase().includes(q) || (item.nama || item.nama_mahasiswa || '').toLowerCase().includes(q);
      });
    }
    if (filterProdi) {
      const pid = getProdiId(filterProdi);
      list = list.filter(item => item._role === 'mahasiswa' && (item.prodi_id === pid || item.id_prodi === pid));
    }
    if (filterAngkatan) {
      list = list.filter(item => item._role === 'mahasiswa' && String(item.angkatan) === filterAngkatan);
    }
    return list;
  }, [combined, searchQuery, filterProdi, filterAngkatan]);

  // Angkatan: Generate fixed range 2018-2026 (tidak dari database)
  const angkatanList = useMemo(() => {
    // Generate array dari 2026 sampai 2018 (descending)
    return Array.from({ length: 9 }, (_, i) => String(2026 - i));
    // Hasil: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018']
  }, []);

  // ─── HELPERS ───────────────────────────────────────────────────
  const getProdiNama = (id) => prodiList.find(p => p.id === id || p.id_prodi === id)?.nama_prodi || '-';
  const getProdiKode = (id) => prodiList.find(p => p.id === id || p.id_prodi === id)?.kode_prodi || '-';

  const getName  = (item) => item.nama || item.nama_dosen || item.nama_mahasiswa || '-';
  const getIdKey = (item) => item._role === 'dosen' ? (item.nidn || '-') : (item.nim || '-');
  const getEmail = (item) => item.email || '-';

  // ─── DETAIL ────────────────────────────────────────────────────
  const openDetail = (item) => { setSelectedItem(item); setDetailVisible(true); };

  // ─── DELETE ────────────────────────────────────────────────────
  const handleDelete = (item) => {
    const label = item._role === 'dosen' ? 'Dosen' : 'Mahasiswa';
    const name  = getName(item);
    showAlert({
      type: 'danger',
      title: `Hapus ${label}`,
      message: `Hapus "${name}" secara permanen dari sistem?\n\nData audit log terkait juga akan dihapus.`,
      confirmText: 'Ya, Hapus', cancelText: 'Batal',
      onCancel: hideAlert,
      onConfirm: async () => {
        hideAlert();
        try {
          const entityId = item.id || item.id_dosen || item.id_mahasiswa;
          const userId = item._user_id;
          
          console.log(`🗑️ Deleting ${label} with CASCADE:`, { entityId, userId });
          
          // ✅ CASCADE DELETE - URUTAN PENTING:
          
          // 1. HAPUS AUDIT LOG TERLEBIH DAHULU (foreign key constraint)
          if (userId) {
            try {
              console.log('🗑️ Step 1: Deleting audit logs for user_id:', userId);
              await userApi.deleteAuditLogs(userId);
              console.log('✅ Audit logs deleted successfully');
            } catch (auditErr) {
              console.warn('⚠️ Audit log delete warning (continuing):', auditErr.message);
              // Lanjutkan delete meskipun audit log gagal dihapus
              // Ini untuk backward compatibility jika endpoint belum tersedia
            }
          }
          
          // 2. Hapus dari tabel dosen/mahasiswa (Module 1)
          console.log(`🗑️ Step 2: Deleting ${item._role} entity:`, entityId);
          if (item._role === 'dosen') {
            await dosenApi.delete(entityId);
            console.log('✅ Dosen entity deleted');
          } else {
            await mahasiswaApi.delete(entityId);
            console.log('✅ Mahasiswa entity deleted');
          }
          
          // 3. Hapus dari tabel users (Module 2) - TERAKHIR
          if (userId) {
            console.log('🗑️ Step 3: Deleting user:', userId);
            await userApi.delete(userId);
            console.log('✅ User deleted');
          }
          
          setDetailVisible(false);
          fetchAll();
          setTimeout(() => showAlert({
            type: 'success', 
            title: 'Berhasil Dihapus',
            message: `"${name}" dan semua data terkait telah dihapus dari sistem.`,
            confirmText: 'OK', 
            onConfirm: hideAlert,
          }), 350);
        } catch (e) {
          console.error('❌ Delete error:', e);
          showAlert({ 
            type: 'error', 
            title: 'Gagal Menghapus', 
            message: e.message || 'Terjadi kesalahan saat menghapus data. Pastikan tidak ada data yang masih berelasi.', 
            confirmText: 'OK', 
            onConfirm: hideAlert 
          });
        }
      }
    });
  };

  // ─── OPEN FORM ─────────────────────────────────────────────────
  const openAdd = () => {
    setEditItem(null);
    setFormRole('dosen');
    resetFormFields();
    setFormVisible(true);
  };

  const openEdit = (item) => {
    setDetailVisible(false);
    setEditItem(item);
    setFormRole(item._role);
    if (item._role === 'dosen') {
      setFNIDN(item.nidn || '');
      setFNamaDosen(item.nama || item.nama_dosen || '');
      setFEmailDosen(item.email || '');
      setFProdiDosen(item.prodi_id || null); // Load prodi dosen
    } else {
      setFNIM(item.nim || '');
      setFNamaMhs(item.nama || item.nama_mahasiswa || '');
      setFEmailMhs(item.email || '');
      setFProdiId(item.prodi_id || item.id_prodi || null);
      setFAngkatan(String(item.angkatan || ''));
    }
    setTimeout(() => setFormVisible(true), 300);
  };

  const resetFormFields = () => {
    setFNIDN(''); setFNamaDosen(''); setFEmailDosen(''); setFProdiDosen(null);
    setFNIM(''); setFNamaMhs(''); setFEmailMhs(''); setFProdiId(null); setFAngkatan('');
  };

  // ─── SUBMIT FORM ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (formRole === 'dosen') {
      if (!fNIDN.trim() || !fNamaDosen.trim() || !fEmailDosen.trim() || !fProdiDosen) {
        return showAlert({ type: 'error', title: 'Data Tidak Lengkap', message: 'Harap isi semua kolom dosen termasuk Program Studi.', confirmText: 'Mengerti', onConfirm: hideAlert });
      }
      try {
        const payload = { 
          nidn: fNIDN.trim(), 
          nama: fNamaDosen.trim(), 
          email: fEmailDosen.trim(),
          prodi_id: fProdiDosen // Backend butuh prodi_id untuk create user
        };
        console.log('📤 Dosen Payload:', payload);
        
        if (editItem) {
          // Update hanya mengirim nidn dan nama (tidak ada email/prodi_id)
          await dosenApi.update(editItem.id || editItem.id_dosen, {
            nidn: payload.nidn,
            nama: payload.nama
          });
        } else {
          await dosenApi.create(payload);
        }
      } catch (e) {
        console.error('❌ Error submit dosen:', e);
        return showAlert({ type: 'info', title: 'Gagal Menyimpan', message: e.message || 'Terjadi kesalahan.', confirmText: 'OK', onConfirm: hideAlert });
      }
    } else {
      if (!fNIM.trim() || !fNamaMhs.trim() || !fEmailMhs.trim() || !fProdiId || !fAngkatan.trim()) {
        return showAlert({ type: 'error', title: 'Data Tidak Lengkap', message: 'Harap isi semua kolom mahasiswa.', confirmText: 'Mengerti', onConfirm: hideAlert });
      }
      try {
        const payload = { 
          nim: fNIM.trim(), 
          nama: fNamaMhs.trim(), 
          email: fEmailMhs.trim(), 
          prodi_id: fProdiId, 
          angkatan: fAngkatan.trim() 
        };
        console.log('📤 Mahasiswa Payload:', payload);
        
        if (editItem) {
          await mahasiswaApi.update(editItem.id || editItem.id_mahasiswa, payload);
        } else {
          await mahasiswaApi.create(payload);
        }
      } catch (e) {
        console.error('❌ Error submit mahasiswa:', e);
        return showAlert({ type: 'info', title: 'Gagal Menyimpan', message: e.message || 'Terjadi kesalahan.', confirmText: 'OK', onConfirm: hideAlert });
      }
    }
    setFormVisible(false);
    fetchAll();
    const label = formRole === 'dosen' ? 'Dosen' : 'Mahasiswa';
    const namaAksi = editItem ? 'diperbarui' : 'ditambahkan';
    setTimeout(() => showAlert({
      type: 'success',
      title: editItem ? 'Perubahan Disimpan' : `${label} Ditambahkan`,
      message: `Data ${label.toLowerCase()} berhasil ${namaAksi}.`,
      confirmText: 'OK', onConfirm: hideAlert,
    }), 350);
  };

  // ─── STATS ─────────────────────────────────────────────────────
  const totalDosen = dosenData.length;
  const totalMhs   = mhsData.length;
  const totalHasil = filteredData.length;

  // ─── RENDER ROW ────────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    const isDosen = item._role === 'dosen';
    const idKey   = getIdKey(item);
    const email   = getEmail(item);
    const name    = getName(item);

    return (
      <View style={styles.tableRow}>
        {/* No */}
        <Text style={styles.cellNo}>{index + 1}</Text>

        {/* Role Badge */}
        <View style={[styles.rolePill, isDosen ? styles.rolePillDosen : styles.rolePillMhs]}>
          <Ionicons name={isDosen ? 'school' : 'person'} size={10} color={isDosen ? PRIMARY_BLUE : GREEN} />
        </View>

        {/* ID (NIDN / NIM) */}
        <View style={styles.cellIdWrap}>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText} numberOfLines={1}>{idKey}</Text>
          </View>
        </View>

        {/* Nama + Email */}
        <View style={styles.cellInfo}>
          <Text style={styles.cellName} numberOfLines={1}>{name}</Text>
          <Text style={styles.cellEmail} numberOfLines={1}>{email}</Text>
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

  // Form prodi nama
  const formProdiNama = prodiList.find(p => p.id === fProdiId || p.id_prodi === fProdiId)?.nama_prodi || null;

  // ─── RENDER ────────────────────────────────────────────────────
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
          <Text style={styles.headerTitle}>Pengguna</Text>
          <Text style={styles.headerSubtitle}>Kelola Dosen & Mahasiswa</Text>
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
          keyExtractor={(item, i) => `${item._role}-${item.id || item.id_dosen || item.id_mahasiswa || i}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchAll}
          ListHeaderComponent={
            <>
              {/* STATS CARDS */}
              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="school" size={20} color={PRIMARY_BLUE} style={{ marginBottom: 4 }} />
                  <Text style={[styles.statCount, { color: PRIMARY_BLUE }]}>{totalDosen}</Text>
                  <Text style={[styles.statLabel, { color: PRIMARY_BLUE }]}>Total Dosen</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="people" size={20} color={GREEN} style={{ marginBottom: 4 }} />
                  <Text style={[styles.statCount, { color: GREEN }]}>{totalMhs}</Text>
                  <Text style={[styles.statLabel, { color: GREEN }]}>Total Mahasiswa</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#fef9c3' }]}>
                  <Ionicons name="filter" size={20} color="#92400e" style={{ marginBottom: 4 }} />
                  <Text style={[styles.statCount, { color: '#92400e' }]}>{totalHasil}</Text>
                  <Text style={[styles.statLabel, { color: '#92400e' }]}>Hasil Filter</Text>
                </View>
              </View>

              {/* ROLE FILTER TABS */}
              <View style={styles.tabRow}>
                {[
                  { key: 'semua',     label: 'Semua',     icon: 'apps' },
                  { key: 'dosen',     label: 'Dosen',     icon: 'school' },
                  { key: 'mahasiswa', label: 'Mahasiswa', icon: 'people' },
                ].map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.tabBtn, filterRole === t.key && styles.tabBtnActive]}
                    onPress={() => { setFilterRole(t.key); setFilterProdi(null); setFilterAngkatan(''); }}
                  >
                    <Ionicons name={t.icon} size={13} color={filterRole === t.key ? '#FFF' : '#64748B'} style={{ marginRight: 4 }} />
                    <Text style={[styles.tabBtnText, filterRole === t.key && styles.tabBtnTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* SEARCH */}
              <View style={styles.searchBox}>
                <Ionicons name="search" size={15} color="#94A3B8" style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={filterRole === 'dosen' ? 'Cari NIDN atau nama...' : filterRole === 'mahasiswa' ? 'Cari NIM atau nama...' : 'Cari NIDN, NIM atau nama...'}
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

              {/* EXTRA FILTER — hanya tampil jika tab mahasiswa atau semua */}
              {(filterRole === 'mahasiswa' || filterRole === 'semua') && (
                <View style={styles.extraFilterRow}>
                  {/* Filter Prodi */}
                  <TouchableOpacity style={styles.extraFilterBtn} onPress={() => setProdiPickerVisible(true)}>
                    <Ionicons name="business-outline" size={13} color={filterProdi ? PRIMARY_BLUE : '#94A3B8'} style={{ marginRight: 4 }} />
                    <Text style={[styles.extraFilterText, filterProdi && { color: PRIMARY_BLUE }]} numberOfLines={1}>
                      {filterProdi ? (filterProdi.kode_prodi || filterProdi.nama_prodi) : 'Semua Prodi'}
                    </Text>
                    <Ionicons name="chevron-down" size={12} color="#94A3B8" style={{ marginLeft: 2 }} />
                  </TouchableOpacity>

                  {/* Filter Angkatan */}
                  <TouchableOpacity style={styles.extraFilterBtn} onPress={() => setAngkatanPickerVisible(true)}>
                    <Ionicons name="calendar-outline" size={13} color={filterAngkatan ? PRIMARY_BLUE : '#94A3B8'} style={{ marginRight: 4 }} />
                    <Text style={[styles.extraFilterText, filterAngkatan && { color: PRIMARY_BLUE }]}>
                      {filterAngkatan || 'Semua Angkatan'}
                    </Text>
                    <Ionicons name="chevron-down" size={12} color="#94A3B8" style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>
              )}

              {/* TABLE HEADER */}
              <View style={styles.tableHeader}>
                <Text style={[styles.thText, styles.thNo]}>#</Text>
                <View style={styles.thRoleSpace} />
                <Text style={[styles.thText, styles.thId]}>NIDN / NIM</Text>
                <Text style={[styles.thText, styles.thInfo]}>Nama & Email</Text>
                <View style={styles.thChevron} />
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="people-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Tidak ada data yang cocok.' : 'Belum ada data pengguna.'}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* ══ PICKER FILTER PRODI ══ */}
      <Modal visible={prodiPickerVisible} animationType="fade" transparent statusBarTranslucent>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setProdiPickerVisible(false)}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Filter Program Studi</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.pickerOption, !filterProdi && styles.pickerOptionActive]}
                onPress={() => { setFilterProdi(null); setProdiPickerVisible(false); }}
              >
                <Text style={[styles.pickerOptionText, !filterProdi && { color: PRIMARY_BLUE, fontFamily: 'Urbanist-Bold' }]}>Semua Prodi</Text>
                {!filterProdi && <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />}
              </TouchableOpacity>
              {prodiList.map(p => {
                const pid = getProdiId(p);
                const active = getProdiId(filterProdi) === pid;
                return (
                  <TouchableOpacity
                    key={pid}
                    style={[styles.pickerOption, active && styles.pickerOptionActive]}
                    onPress={() => { setFilterProdi(p); setProdiPickerVisible(false); }}
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

      {/* ══ PICKER FILTER ANGKATAN ══ */}
      <Modal visible={angkatanPickerVisible} animationType="fade" transparent statusBarTranslucent>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setAngkatanPickerVisible(false)}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Filter Angkatan</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.pickerOption, !filterAngkatan && styles.pickerOptionActive]}
                onPress={() => { setFilterAngkatan(''); setAngkatanPickerVisible(false); }}
              >
                <Text style={[styles.pickerOptionText, !filterAngkatan && { color: PRIMARY_BLUE, fontFamily: 'Urbanist-Bold' }]}>Semua Angkatan</Text>
                {!filterAngkatan && <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />}
              </TouchableOpacity>
              {angkatanList.map(a => {
                const active = filterAngkatan === a;
                return (
                  <TouchableOpacity
                    key={a}
                    style={[styles.pickerOption, active && styles.pickerOptionActive]}
                    onPress={() => { setFilterAngkatan(a); setAngkatanPickerVisible(false); }}
                  >
                    <Text style={[styles.pickerOptionText, active && { color: PRIMARY_BLUE, fontFamily: 'Urbanist-Bold' }]}>{a}</Text>
                    {active && <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ══ DETAIL MODAL ══ */}
      <Modal visible={detailVisible} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.detailOverlay}>
          <TouchableWithoutFeedback onPress={() => setDetailVisible(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          {selectedItem && (
            <View style={styles.detailBox}>
              {/* Role chip */}
              <View style={[styles.detailRoleChip, selectedItem._role === 'dosen' ? styles.detailRoleChipDosen : styles.detailRoleChipMhs]}>
                <Ionicons name={selectedItem._role === 'dosen' ? 'school' : 'people'} size={13} color={selectedItem._role === 'dosen' ? PRIMARY_BLUE : GREEN} style={{ marginRight: 5 }} />
                <Text style={[styles.detailRoleChipText, { color: selectedItem._role === 'dosen' ? PRIMARY_BLUE : GREEN }]}>
                  {selectedItem._role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                </Text>
              </View>

              {/* ID Badge */}
              <View style={styles.detailIdBadge}>
                <Text style={styles.detailIdText}>{getIdKey(selectedItem)}</Text>
              </View>

              {/* Nama */}
              <Text style={styles.detailNama}>{getName(selectedItem)}</Text>

              {/* Email */}
              <View style={styles.detailInfoChip}>
                <Ionicons name="mail-outline" size={13} color="#64748B" style={{ marginRight: 5 }} />
                <Text style={styles.detailInfoChipText}>{getEmail(selectedItem)}</Text>
              </View>

              {/* Extra info untuk Dosen - tampilkan prodi */}
              {selectedItem._role === 'dosen' && selectedItem.prodi_id && (
                <View style={styles.detailInfoChip}>
                  <Ionicons name="business-outline" size={13} color="#64748B" style={{ marginRight: 5 }} />
                  <Text style={styles.detailInfoChipText}>
                    {getProdiNama(selectedItem.prodi_id)} ({getProdiKode(selectedItem.prodi_id)})
                  </Text>
                </View>
              )}

              {/* Extra info untuk Mahasiswa */}
              {selectedItem._role === 'mahasiswa' && (
                <View style={styles.detailMhsRow}>
                  <View style={styles.detailInfoChip}>
                    <Ionicons name="business-outline" size={13} color="#64748B" style={{ marginRight: 5 }} />
                    <Text style={styles.detailInfoChipText}>
                      {getProdiNama(selectedItem.prodi_id || selectedItem.id_prodi)} ({getProdiKode(selectedItem.prodi_id || selectedItem.id_prodi)})
                    </Text>
                  </View>
                  <View style={styles.angkatanBadge}>
                    <Text style={styles.angkatanBadgeText}>Angkatan {selectedItem.angkatan || '-'}</Text>
                  </View>
                </View>
              )}

              <View style={styles.detailDivider} />

              <View style={styles.detailBtnRow}>
                <TouchableOpacity style={styles.detailBtnDelete} onPress={() => handleDelete(selectedItem)}>
                  <Ionicons name="trash-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.detailBtnText}>Hapus</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailBtnEdit} onPress={() => openEdit(selectedItem)}>
                  <Ionicons name="pencil-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.detailBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* ══ FORM MODAL (bottom sheet) ══ */}
      <Modal visible={formVisible} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.sheetOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{editItem ? 'Edit Data' : 'Tambah Pengguna'}</Text>

            {/* Role Toggle — hanya saat tambah baru */}
            {!editItem && <RoleToggle value={formRole} onChange={(r) => { setFormRole(r); resetFormFields(); }} />}
            {!!editItem && (
              <View style={[styles.editRoleBadge, formRole === 'dosen' ? { backgroundColor: '#dbeafe' } : { backgroundColor: '#dcfce7' }]}>
                <Ionicons name={formRole === 'dosen' ? 'school' : 'people'} size={14} color={formRole === 'dosen' ? PRIMARY_BLUE : GREEN} style={{ marginRight: 6 }} />
                <Text style={[styles.editRoleBadgeText, { color: formRole === 'dosen' ? PRIMARY_BLUE : GREEN }]}>
                  {formRole === 'dosen' ? 'Dosen' : 'Mahasiswa'}
                </Text>
              </View>
            )}

            {/* ── FORM DOSEN ── */}
            {formRole === 'dosen' && (
              <>
                <Text style={styles.fieldLabel}>NIDN</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="barcode-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Contoh: NIDN00001" placeholderTextColor="#94A3B8" value={fNIDN} onChangeText={setFNIDN} />
                </View>

                <Text style={styles.fieldLabel}>Nama Lengkap</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Contoh: Dr. Ahmad Fauzi, M.Kom" placeholderTextColor="#94A3B8" value={fNamaDosen} onChangeText={setFNamaDosen} />
                </View>

                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="email@institusi.ac.id" placeholderTextColor="#94A3B8" value={fEmailDosen} onChangeText={setFEmailDosen} keyboardType="email-address" autoCapitalize="none" />
                </View>

                <Text style={styles.fieldLabel}>Program Studi</Text>
                <TouchableOpacity style={styles.inputWrap} onPress={() => { Keyboard.dismiss(); setFormProdiDosenPickerVisible(true); }}>
                  <Ionicons name="business-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
                  <Text style={[styles.input, !fProdiDosen && { color: '#94A3B8' }]}>
                    {fProdiDosen ? (prodiList.find(p => p.id === fProdiDosen || p.id_prodi === fProdiDosen)?.nama_prodi || 'Pilih Program Studi') : 'Pilih Program Studi'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </>
            )}

            {/* ── FORM MAHASISWA ── */}
            {formRole === 'mahasiswa' && (
              <>
                <Text style={styles.fieldLabel}>NIM</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="barcode-outline" size={18} color={GREEN} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Contoh: IF2023001" placeholderTextColor="#94A3B8" value={fNIM} onChangeText={setFNIM} autoCapitalize="characters" />
                </View>

                <Text style={styles.fieldLabel}>Nama Lengkap</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={GREEN} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="Contoh: Agus Salim" placeholderTextColor="#94A3B8" value={fNamaMhs} onChangeText={setFNamaMhs} />
                </View>

                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color={GREEN} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="email@mahasiswa.ac.id" placeholderTextColor="#94A3B8" value={fEmailMhs} onChangeText={setFEmailMhs} keyboardType="email-address" autoCapitalize="none" />
                </View>

                <Text style={styles.fieldLabel}>Program Studi</Text>
                <TouchableOpacity style={styles.inputWrap} onPress={() => { Keyboard.dismiss(); setFormProdiPickerVisible(true); }}>
                  <Ionicons name="business-outline" size={18} color={GREEN} style={styles.inputIcon} />
                  <Text style={[styles.input, !formProdiNama && { color: '#94A3B8' }]}>{formProdiNama || 'Pilih Program Studi'}</Text>
                  <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                </TouchableOpacity>

                <Text style={styles.fieldLabel}>Angkatan</Text>
                <TouchableOpacity style={styles.inputWrap} onPress={() => { Keyboard.dismiss(); setFormAngkatanPickerVisible(true); }}>
                  <Ionicons name="calendar-outline" size={18} color={GREEN} style={styles.inputIcon} />
                  <Text style={[styles.input, !fAngkatan && { color: '#94A3B8' }]}>{fAngkatan || 'Pilih Angkatan'}</Text>
                  <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setFormVisible(false)}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSubmit, formRole === 'mahasiswa' && { backgroundColor: GREEN }]} onPress={handleSubmit}>
                <Text style={styles.btnSubmitText}>{editItem ? 'Simpan Perubahan' : 'Tambah'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══ PICKER PRODI DOSEN DALAM FORM ══ */}
      <Modal visible={formProdiDosenPickerVisible} animationType="fade" transparent statusBarTranslucent>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setFormProdiDosenPickerVisible(false)}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Pilih Program Studi Dosen</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {prodiList.map(p => {
                const pid = getProdiId(p);
                const active = fProdiDosen === pid;
                return (
                  <TouchableOpacity
                    key={pid}
                    style={[styles.pickerOption, active && styles.pickerOptionActive]}
                    onPress={() => { setFProdiDosen(pid); setFormProdiDosenPickerVisible(false); }}
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

      {/* ══ PICKER PRODI DALAM FORM ══ */}
      <Modal visible={formProdiPickerVisible} animationType="fade" transparent statusBarTranslucent>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setFormProdiPickerVisible(false)}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Pilih Program Studi</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {prodiList.map(p => {
                const pid = getProdiId(p);
                const active = fProdiId === pid;
                return (
                  <TouchableOpacity
                    key={pid}
                    style={[styles.pickerOption, active && styles.pickerOptionActive]}
                    onPress={() => { setFProdiId(pid); setFormProdiPickerVisible(false); }}
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

      {/* ══ PICKER ANGKATAN DALAM FORM ══ */}
      <Modal visible={formAngkatanPickerVisible} animationType="fade" transparent statusBarTranslucent>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setFormAngkatanPickerVisible(false)}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Pilih Angkatan</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Opsi angkatan dinamis dari data + fallback 5 tahun terakhir */}
              {(angkatanList.length > 0
                ? angkatanList
                : Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i))
              ).map(a => {
                const active = fAngkatan === a;
                return (
                  <TouchableOpacity
                    key={a}
                    style={[styles.pickerOption, active && styles.pickerOptionActive]}
                    onPress={() => { setFAngkatan(a); setFormAngkatanPickerVisible(false); }}
                  >
                    <Text style={[styles.pickerOptionText, active && { color: PRIMARY_BLUE, fontFamily: 'Urbanist-Bold' }]}>{a}</Text>
                    {active && <Ionicons name="checkmark-circle" size={18} color={PRIMARY_BLUE} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CUSTOM ALERT */}
      <CustomAlert
        visible={alert.visible} type={alert.type} title={alert.title} message={alert.message}
        confirmText={alert.confirmText} cancelText={alert.cancelText}
        onConfirm={alert.onConfirm} onCancel={alert.onCancel}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F6F5FA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:     { marginTop: 10, fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#64748B' },

  // ── HEADER ──
  header:          { backgroundColor: THEME_COLOR, paddingTop: 52, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  backBtn:         { padding: 8, marginRight: 12 },
  headerTextWrap:  { flex: 1 },
  headerTitle:     { fontFamily: 'Urbanist-Bold', fontSize: 22, color: PRIMARY_DARK, marginBottom: 2 },
  headerSubtitle:  { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },

  // ── LIST ──
  listContent:     { paddingHorizontal: 16, paddingBottom: 100 },

  // ── STATS ──
  statsRow:        { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 16 },
  statCard:        { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', elevation: 2 },
  statCount:       { fontFamily: 'Urbanist-Bold', fontSize: 24 },
  statLabel:       { fontFamily: 'Urbanist-Medium', fontSize: 10, marginTop: 2, textAlign: 'center' },

  // ── TABS ──
  tabRow:          { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tabBtn:          { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingVertical: 9, borderWidth: 1, borderColor: '#E2E8F0' },
  tabBtnActive:    { backgroundColor: PRIMARY_DARK, borderColor: PRIMARY_DARK },
  tabBtnText:      { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#64748B' },
  tabBtnTextActive:{ color: '#FFF' },

  // ── SEARCH ──
  searchBox:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  searchInput:     { flex: 1, fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#212121', paddingVertical: 0 },

  // ── EXTRA FILTER ──
  extraFilterRow:  { flexDirection: 'row', gap: 8, marginBottom: 14 },
  extraFilterBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: '#E2E8F0' },
  extraFilterText: { flex: 1, fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#94A3B8' },

  // ── TABLE HEADER ──
  tableHeader:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, marginBottom: 4 },
  thText:          { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  thNo:            { width: 24, textAlign: 'center' },
  thRoleSpace:     { width: 26 },
  thId:            { width: 90 },
  thInfo:          { flex: 1, paddingHorizontal: 8 },
  thChevron:       { width: 28 },

  // ── TABLE ROW ──
  tableRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cellNo:          { width: 24, textAlign: 'center', fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#94A3B8' },
  rolePill:        { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  rolePillDosen:   { backgroundColor: '#dbeafe' },
  rolePillMhs:     { backgroundColor: '#dcfce7' },
  cellIdWrap:      { width: 90 },
  idBadge:         { backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 4, alignSelf: 'flex-start' },
  idBadgeText:     { fontFamily: 'Urbanist-Bold', fontSize: 9, color: '#FFF' },
  cellInfo:        { flex: 1, paddingHorizontal: 8 },
  cellName:        { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#212121', marginBottom: 2 },
  cellEmail:       { fontFamily: 'Urbanist-Regular', fontSize: 10, color: '#94A3B8' },
  cellChevron:     { width: 28, alignItems: 'center', justifyContent: 'center' },

  // ── EMPTY ──
  emptyWrap:       { alignItems: 'center', paddingTop: 50 },
  emptyText:       { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 10 },

  // ── FAB ──
  fab: { position: 'absolute', bottom: 28, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: PRIMARY_DARK, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: PRIMARY_DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },

  // ── DETAIL MODAL ──
  detailOverlay:       { flex: 1, backgroundColor: 'rgba(36,53,74,0.55)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  detailBox:           { backgroundColor: '#FFF', borderRadius: 32, padding: 28, width: '100%', alignItems: 'center', elevation: 20 },
  detailRoleChip:      { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12 },
  detailRoleChipDosen: { backgroundColor: '#dbeafe' },
  detailRoleChipMhs:   { backgroundColor: '#dcfce7' },
  detailRoleChipText:  { fontFamily: 'Urbanist-Bold', fontSize: 12 },
  detailIdBadge:       { backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7, marginBottom: 10 },
  detailIdText:        { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#FFF' },
  detailNama:          { fontFamily: 'Urbanist-Bold', fontSize: 18, color: '#212121', textAlign: 'center', marginBottom: 10 },
  detailInfoChip:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 6 },
  detailInfoChipText:  { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B' },
  detailMhsRow:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 4 },
  angkatanBadge:       { backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  angkatanBadgeText:   { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#475569' },
  detailDivider:       { width: '100%', height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
  detailBtnRow:        { flexDirection: 'row', gap: 12, width: '100%' },
  detailBtnDelete:     { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: DANGER, borderRadius: 20, paddingVertical: 14 },
  detailBtnEdit:       { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: PRIMARY_BLUE, borderRadius: 20, paddingVertical: 14 },
  detailBtnText:       { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#FFF' },

  // ── BOTTOM SHEET ──
  sheetOverlay:    { flex: 1, backgroundColor: 'rgba(36,53,74,0.5)', justifyContent: 'flex-end' },
  sheetContent:    { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingBottom: 40 },
  sheetHandle:     { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 16 },
  sheetTitle:      { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 20 },

  // ── EDIT ROLE BADGE ──
  editRoleBadge:     { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 20 },
  editRoleBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 14 },

  // ── FORM FIELDS ──
  fieldLabel:      { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  inputWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, marginBottom: 16 },
  inputIcon:       { marginRight: 10 },
  input:           { flex: 1, paddingVertical: 14, fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#212121' },

  // ── BUTTONS ──
  btnRow:          { flexDirection: 'row', gap: 12, marginTop: 4 },
  btnCancel:       { flex: 1, backgroundColor: '#ffebee', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelText:   { color: DANGER, fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmit:       { flex: 1, backgroundColor: PRIMARY_DARK, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  btnSubmitText:   { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },

  // ── PICKER ──
  pickerOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 32 },
  pickerBox:          { backgroundColor: '#FFF', borderRadius: 24, padding: 20, maxHeight: '65%' },
  pickerTitle:        { fontFamily: 'Urbanist-Bold', fontSize: 17, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 14 },
  pickerOption:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  pickerOptionActive: { backgroundColor: '#f0f9ff' },
  pickerOptionText:   { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#212121', flex: 1, marginRight: 8 },
});