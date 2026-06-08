import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  StatusBar, ImageBackground, ActivityIndicator, TextInput,
  Modal, ScrollView, Dimensions, TouchableWithoutFeedback,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler'; 
import { capaianApi, prodiApi, mahasiswaApi, cplApi } from '../../services/api';

const { width: SW } = Dimensions.get('window');

import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;
const PRIMARY_DARK = BASE.primary;
const PRIMARY_BLUE = BASE.primaryLight;
const DANGER_COLOR = BASE.error;
const SUCCESS_COLOR = BASE.success;

const STATUS_COLOR = {
  'Excellence':    { bg: '#e8f5e9', text: '#2e7d32' },
  'Satisfactory':  { bg: '#e3f2fd', text: '#1565c0' },
  'Competent':     { bg: '#fff8e1', text: '#f57f17' },
  'Developing':    { bg: '#fff3e0', text: '#e65100' },
  'Not Competent': { bg: '#ffebee', text: '#c62828' },
  'Tercapai':      { bg: '#e8f5e9', text: '#2e7d32' },
  'Belum Tercapai':{ bg: '#ffebee', text: '#c62828' },
};

const DEFAULT_STATUS_COLOR = { bg: '#f1f5f9', text: '#64748B' };

// ─── CUSTOM ALERT MODAL ───────────────────────────────────────────────────
function CustomAlert({ visible, type, title, message, onConfirm, onCancel, confirmText, cancelText }) {
  if (!visible) return null;

  const isSuccess = type === 'success';
  const isDanger  = type === 'danger';
  const isError   = type === 'error';

  const iconName  = isSuccess ? 'checkmark-circle' : isDanger ? 'trash' : isError ? 'close-circle' : 'alert-circle';
  const iconColor = isSuccess ? SUCCESS_COLOR : (isDanger || isError) ? DANGER_COLOR : PRIMARY_BLUE;
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
                { backgroundColor: isSuccess ? SUCCESS_COLOR : (isDanger || isError) ? DANGER_COLOR : PRIMARY_BLUE },
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
  box:            { backgroundColor: '#FFF', borderRadius: 28, padding: 28, width: '100%', alignItems: 'center' },
  iconCircle:     { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title:          { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, textAlign: 'center', marginBottom: 8 },
  message:        { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 4 },
  btnRow:         { flexDirection: 'row', gap: 12, marginTop: 22, width: '100%' },
  btnCancel:      { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  btnCancelText:  { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#64748B' },
  btnConfirm:     { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  btnConfirmText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#FFF' },
});

export default function SAPantauCapaianScreen({ navigation }) {
  const [capaianData, setCapaianData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [prodiList, setProdiList] = useState([]);
  const [selectedProdi, setSelectedProdi] = useState({ id: 'all', nama_prodi: 'Semua Program Studi' });
  const [showDropdown, setShowDropdown] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [formData, setFormData] = useState({ 
    id: null, 
    original_mahasiswa_id: '', 
    original_cpl_id: '', 
    nilai_cpl_total: '', 
    tahun_akademik: '2024/2025' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ State untuk dropdown di modal
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [cplList, setCplList] = useState([]);
  const [showMahasiswaDropdown, setShowMahasiswaDropdown] = useState(false);
  const [showCplDropdown, setShowCplDropdown] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
  const [selectedCpl, setSelectedCpl] = useState(null);

  const [alert, setAlert] = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null, onCancel: null, confirmText: '', cancelText: '' });
  const showAlert = (opts) => setAlert({ visible: true, ...opts });
  const hideAlert = () => setAlert(a => ({ ...a, visible: false }));

  const fetchCapaianGlobal = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await capaianApi.getAll();
      const list = response?.data || response || [];
      
      console.log('🔍 Raw data dari API:', list.slice(0, 2)); // Debug: lihat raw data
      
      if (Array.isArray(list) && list.length > 0) {
        const normalized = list.map((item, idx) => ({
          id:           item.id || item.mahasiswa_id || String(idx),
          mahasiswa_id: item.mahasiswa_id || '-',
          nim:          item.nim || '-',
          nama:         item.nama_mahasiswa || item.nama || '-',
          prodi:        item.nama_prodi || item.prodi || '-',
          cpl:          item.kode_cpl || '-',
          sub_cpmk:     item.sub_cpmk_list || '-',
          nilai:        parseFloat(item.nilai_cpl_total ?? item.nilai ?? 0).toFixed(1),
          status:       item.status || '-',
          tanggal:      formatTanggal(item.tanggal_input || item.calculated_at),
          tahun_akademik: item.tahun_akademik || '-',
        }));
        
        console.log('🔍 Normalized data sample:', normalized.slice(0, 2)); // Debug: lihat normalized data
        setCapaianData(normalized);
      } else {
        setCapaianData([]);
      }
    } catch (error) {
      console.error('❌ fetchCapaianGlobal error:', error);
      setErrorMsg(error.message || 'Gagal mengambil data.');
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (rawDate) => {
    if (!rawDate || rawDate === '-') return '-';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate;
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    } catch (e) {
      return rawDate;
    }
  };

  const fetchProdiList = async () => {
    try {
      const response = await prodiApi.getAll();
      const list = response?.data || response || [];
      if (Array.isArray(list)) {
        setProdiList([{ id: 'all', nama_prodi: 'Semua Program Studi' }, ...list]);
      }
    } catch (error) {
      console.error('Gagal mengambil data prodi:', error);
    }
  };

  // ✅ Fetch data mahasiswa dan CPL untuk dropdown
  const fetchMahasiswaList = async () => {
    try {
      const response = await mahasiswaApi.getAll();
      const list = response?.data || response || [];
      if (Array.isArray(list)) {
        setMahasiswaList(list);
      }
    } catch (error) {
      console.error('Gagal mengambil data mahasiswa:', error);
    }
  };

  const fetchCplList = async () => {
    try {
      const response = await cplApi.getAll();
      const list = response?.data || response || [];
      if (Array.isArray(list)) {
        setCplList(list);
      }
    } catch (error) {
      console.error('Gagal mengambil data CPL:', error);
    }
  };

  useEffect(() => {
    fetchCapaianGlobal();
    fetchProdiList();
    fetchMahasiswaList();
    fetchCplList();
  }, []);

  const filteredData = capaianData.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchSearch = (
      item.nim.toLowerCase().includes(query) ||
      item.nama.toLowerCase().includes(query) ||
      item.cpl.toLowerCase().includes(query) ||
      item.sub_cpmk.toLowerCase().includes(query)
    );
    const matchProdi = selectedProdi.id === 'all' || item.prodi.toLowerCase() === selectedProdi.nama_prodi.toLowerCase();
    return matchSearch && matchProdi;
  });

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ 
      id: null, 
      original_mahasiswa_id: '', 
      original_cpl_id: '', 
      nilai_cpl_total: '', 
      tahun_akademik: '2024/2025' 
    });
    setSelectedMahasiswa(null);
    setSelectedCpl(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    
    console.log('🔍 Debug openEditModal item:', item);
    
    // Cari mahasiswa yang sesuai
    const mhs = mahasiswaList.find(m => m.nim === item.nim);
    setSelectedMahasiswa(mhs);
    
    console.log('🔍 Found mahasiswa:', mhs);
    
    // Cari CPL yang sesuai
    const cpl = cplList.find(c => c.kode_cpl === item.cpl);
    setSelectedCpl(cpl);
    
    console.log('🔍 Found CPL:', cpl);
    
    // ✅ Store original values for comparison in handleSaveSubmit
    // CRITICAL FIX: Store the ORIGINAL values from the item, not from the selected dropdown
    const originalFormData = {
      id: item.id,
      original_mahasiswa_id: item.nim, // Store ORIGINAL NIM 
      original_cpl_id: item.cpl,       // Store ORIGINAL kode_cpl
      nilai_cpl_total: item.nilai.toString(),
      tahun_akademik: item.tahun_akademik,
    };
    
    setFormData(originalFormData);
    
    console.log('🔍 FormData set to:', originalFormData);
    
    setShowModal(true);
  };

  const handleSaveSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validasi
      if (!selectedMahasiswa || !selectedCpl || !formData.nilai_cpl_total) {
        showAlert({
          type: 'error',
          title: 'Data Tidak Lengkap',
          message: 'Harap pilih mahasiswa, CPL, dan masukkan nilai.',
          confirmText: 'OK',
          onConfirm: hideAlert
        });
        setIsSubmitting(false);
        return;
      }

      const nilai = parseFloat(formData.nilai_cpl_total);
      if (isNaN(nilai) || nilai < 0 || nilai > 100) {
        showAlert({
          type: 'error',
          title: 'Nilai Tidak Valid',
          message: 'Nilai harus antara 0-100.',
          confirmText: 'OK',
          onConfirm: hideAlert
        });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        mahasiswa_id: selectedMahasiswa.nim || selectedMahasiswa.id,
        cpl_id: selectedCpl.kode_cpl || selectedCpl.id,
        nilai_cpl_total: nilai,
        tahun_akademik: formData.tahun_akademik
      };

      console.log('📤 HandleSave Debug:', {
        modalMode,
        payload,
        selectedMahasiswa,
        selectedCpl,
        formData
      });

      if (modalMode === 'add') {
        console.log('📤 Creating new capaian:', payload);
        await capaianApi.create(payload); 
      } else {
        // ✅ Untuk edit: Cek apakah mahasiswa/CPL berubah
        const originalMahasiswa = formData.original_mahasiswa_id; // NIM asli
        const originalCpl = formData.original_cpl_id; // CPL asli
        const newMahasiswa = selectedMahasiswa.nim || selectedMahasiswa.id;
        const newCpl = selectedCpl.kode_cpl || selectedCpl.id;
        
        console.log('🔍 Edit comparison:', {
          original: { mahasiswa: originalMahasiswa, cpl: originalCpl },
          new: { mahasiswa: newMahasiswa, cpl: newCpl }
        });
        
        if (originalMahasiswa !== newMahasiswa || originalCpl !== newCpl) {
          // Jika mahasiswa/CPL berubah, hapus yang lama dan buat yang baru
          console.log('🔄 Mahasiswa/CPL changed, delete old and create new');
          try {
            console.log('🗑️ Deleting old record:', originalMahasiswa, originalCpl);
            await capaianApi.delete(originalMahasiswa, originalCpl);
            console.log('✅ Delete successful, now creating new record');
          } catch (deleteError) {
            console.warn('⚠️ Delete old record failed (might not exist):', deleteError.message);
            // Lanjutkan ke create, karena mungkin record lama sudah tidak ada
          }
          console.log('🔄 Creating new record:', payload);
          await capaianApi.create(payload);
        } else {
          // Jika tidak berubah, update biasa
          console.log('✅ Same mahasiswa/CPL, normal update');
          console.log('📝 Updating existing record:', originalMahasiswa, originalCpl, 'with payload:', payload);
          await capaianApi.update(originalMahasiswa, originalCpl, payload);
        }
      }

      setShowModal(false);
      
      showAlert({
        type: 'success', 
        title: 'Berhasil', 
        message: 'Data capaian berhasil disimpan.', 
        confirmText: 'OK', 
        onConfirm: hideAlert
      });

      fetchCapaianGlobal();

    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      showAlert({
        type: 'error', 
        title: 'Gagal', 
        message: error.message || 'Terjadi kesalahan saat menyimpan data.', 
        confirmText: 'Tutup', 
        onConfirm: hideAlert
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (item) => {
    showAlert({
      type: 'danger', 
      title: 'Hapus Capaian?',
      message: `Yakin ingin menghapus capaian ${item.cpl} untuk ${item.nama}?`,
      confirmText: 'Ya, Hapus', 
      cancelText: 'Batal',
      onCancel: hideAlert,
      onConfirm: async () => {
        hideAlert();
        setLoading(true);
        
        try {
          // ✅ FIX: Gunakan NIM dan kode CPL untuk delete
          await capaianApi.delete(item.nim, item.cpl);
          
          // ✅ FIX: Memfilter state berdasarkan kombinasi nim & cpl agar data langsung hilang dari layar
          const newData = capaianData.filter(d => !(d.nim === item.nim && d.cpl === item.cpl));
          setCapaianData(newData);
          
          setTimeout(() => {
            showAlert({
              type: 'success',
              title: 'Berhasil Dihapus',
              message: `Data capaian ${item.cpl} berhasil dihapus.`,
              confirmText: 'OK',
              onConfirm: hideAlert
            });
          }, 500); 

        } catch (error) {
          console.error("Gagal menghapus:", error);
          showAlert({
            type: 'error',
            title: 'Gagal Hapus',
            message: 'Data gagal dihapus dari server.',
            confirmText: 'Tutup',
            onConfirm: hideAlert
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const renderStatCard = (title, value) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const renderHeaderComponent = () => {
    const total = filteredData.length;
    const mhsUnik = new Set(filteredData.map(n => n.nim)).size;
    const cplUnik = new Set(filteredData.map(n => n.cpl)).size;
    const rata = total > 0 ? (filteredData.reduce((acc, curr) => acc + parseFloat(curr.nilai), 0) / total).toFixed(1) : '0';

    return (
      <View style={styles.listHeaderContainer}>
        {errorMsg ? (
          <View style={styles.warnBanner}>
            <Ionicons name="information-circle-outline" size={16} color="#92400e" style={{ marginRight: 8 }} />
            <Text style={styles.warnText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.controlSection}>
          <TouchableOpacity 
            style={styles.dropdownInput} 
            activeOpacity={0.8}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.dropdownText} numberOfLines={1}>{selectedProdi.nama_prodi}</Text>
            <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={18} color={PRIMARY_DARK} />
          </TouchableOpacity>

          {showDropdown ? (
            <View style={styles.dropdownListContainer}>
              {prodiList.map((prodi) => (
                <TouchableOpacity 
                  key={prodi.id.toString()} 
                  style={styles.dropdownItem}
                  onPress={() => { setSelectedProdi(prodi); setShowDropdown(false); }}
                >
                  <Text style={[styles.dropdownItemText, selectedProdi.id === prodi.id && styles.dropdownItemTextActive]}>
                    {prodi.nama_prodi}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" />
              <TextInput 
                style={styles.searchInput}
                placeholder="Cari NIM, nama, CPL, Sub-CPMK..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.addButton} activeOpacity={0.9} onPress={openAddModal}>
            <Ionicons name="add-circle-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Tambah Capaian Manual</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            {renderStatCard('Total Data', total)}
            {renderStatCard('Mahasiswa Unik', mhsUnik)}
            {renderStatCard('CPL Unik', cplUnik)}
            {renderStatCard('Rata-rata Nilai', rata)}
          </View>
        </View>

        <Text style={styles.listSectionTitle}>Daftar Capaian Mahasiswa</Text>
        <Text style={styles.listSectionHint}>NIM • Nama • Sub-CPMK • CPL • Nilai • Tanggal Input</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const statusKey = Object.keys(STATUS_COLOR).find(
      key => key.toLowerCase() === item.status.toLowerCase()
    );
    const statusColor = statusKey ? STATUS_COLOR[statusKey] : DEFAULT_STATUS_COLOR;

    const renderRightActions = () => {
      return (
        <TouchableOpacity style={styles.deleteSwipeBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={24} color="#FFF" />
          <Text style={styles.deleteSwipeText}>Hapus</Text>
        </TouchableOpacity>
      );
    };

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.card}
          onPress={() => openEditModal(item)}
        >
          {/* Header: NIM, Nama, CPL */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.studentNim}>{item.nim}</Text>
              <Text style={styles.studentName}>{item.nama}</Text>
            </View>
            <View style={styles.badgeCPL}>
              <Text style={styles.badgeCPLText}>{item.cpl}</Text>
            </View>
          </View>

          {/* Body: Sub-CPMK, Nilai, Status */}
          <View style={styles.cardBody}>
            <View style={styles.bodyLeft}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sub-CPMK:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{item.sub_cpmk}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Prodi:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{item.prodi}</Text>
              </View>
            </View>
            <View style={styles.bodyRight}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                <Text style={[styles.statusText, { color: statusColor.text }]}>
                  {item.status}
                </Text>
              </View>
              <Text style={styles.nilaiText}>{item.nilai}</Text>
            </View>
          </View>

          {/* Footer: Tanggal Input dan Action Icon */}
          <View style={styles.cardFooter}>
            <Text style={styles.tanggalText}>
              <Ionicons name="calendar-outline" size={12} color="#94A3B8" /> {item.tanggal}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.05 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_DARK} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Monitoring CPL</Text>
          <Text style={styles.headerSubtitle}>Pantau capaian pembelajaran lulusan</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_DARK} />
        </View>
      ) : (
        <FlatList 
          data={filteredData} 
          keyExtractor={(item, index) => `${item.id}_${item.cpl}_${index}`} 
          renderItem={renderItem} 
          ListHeaderComponent={renderHeaderComponent}
          contentContainerStyle={[styles.listContainer, filteredData.length === 0 && styles.emptyContainer]}
          refreshing={loading}
          onRefresh={fetchCapaianGlobal}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="folder-open-outline" size={52} color="#cbd5e1" />
              <Text style={styles.emptyText}>Belum ada data capaian yang sesuai.</Text>
            </View>
          }
        />
      )}

      {/* MODAL EDIT / TAMBAH */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide" 
        statusBarTranslucent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContent}>
            <View style={styles.modalDragIndicator} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'add' ? 'Tambah Capaian Baru' : 'Edit Capaian Mahasiswa'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeModalBtn}>
                <Ionicons name="close-circle" size={26} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* MAHASISWA DROPDOWN */}
              <Text style={styles.inputLabel}>Pilih Mahasiswa</Text>
              <TouchableOpacity 
                style={styles.modalDropdown}
                onPress={() => setShowMahasiswaDropdown(!showMahasiswaDropdown)}
              >
                <Text style={[styles.modalDropdownText, !selectedMahasiswa && styles.placeholderText]}>
                  {selectedMahasiswa ? `${selectedMahasiswa.nim} - ${selectedMahasiswa.nama}` : 'Pilih Mahasiswa...'}
                </Text>
                <Ionicons name={showMahasiswaDropdown ? "chevron-up" : "chevron-down"} size={18} color="#94A3B8" />
              </TouchableOpacity>

              {showMahasiswaDropdown && (
                <View style={styles.dropdownList}>
                  <FlatList
                    data={mahasiswaList}
                    keyExtractor={(item) => item.id?.toString() || item.nim}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.dropdownListItem}
                        onPress={() => {
                          setSelectedMahasiswa(item);
                          setShowMahasiswaDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownListItemText,
                          selectedMahasiswa?.id === item.id && styles.dropdownListItemActive
                        ]}>
                          {item.nim} - {item.nama}
                        </Text>
                        {selectedMahasiswa?.id === item.id && (
                          <Ionicons name="checkmark" size={18} color="#577590" />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}

              {/* CPL DROPDOWN */}
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Pilih CPL</Text>
              <TouchableOpacity 
                style={styles.modalDropdown}
                onPress={() => setShowCplDropdown(!showCplDropdown)}
              >
                <Text style={[styles.modalDropdownText, !selectedCpl && styles.placeholderText]}>
                  {selectedCpl ? `${selectedCpl.kode_cpl}` : 'Pilih CPL...'}
                </Text>
                <Ionicons name={showCplDropdown ? "chevron-up" : "chevron-down"} size={18} color="#94A3B8" />
              </TouchableOpacity>

              {showCplDropdown && (
                <View style={styles.dropdownList}>
                  <FlatList
                    data={cplList}
                    keyExtractor={(item) => item.id?.toString() || item.kode_cpl}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.dropdownListItem}
                        onPress={() => {
                          setSelectedCpl(item);
                          setShowCplDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownListItemText,
                          selectedCpl?.id === item.id && styles.dropdownListItemActive
                        ]}>
                          {item.kode_cpl} - {item.deskripsi}
                        </Text>
                        {selectedCpl?.id === item.id && (
                          <Ionicons name="checkmark" size={18} color="#577590" />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}

              {/* NILAI INPUT */}
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Nilai Capaian (0-100)</Text>
              <TextInput 
                style={styles.modalInput}
                placeholder="Masukkan Nilai"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={formData.nilai_cpl_total}
                onChangeText={(text) => setFormData({...formData, nilai_cpl_total: text})}
              />

              {/* TAHUN AKADEMIK INPUT */}
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Tahun Akademik</Text>
              <TextInput 
                style={styles.modalInput}
                placeholder="Contoh: 2024/2025"
                placeholderTextColor="#94A3B8"
                value={formData.tahun_akademik}
                onChangeText={(text) => setFormData({...formData, tahun_akademik: text})}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.btnSave} onPress={handleSaveSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.btnSaveText}>{modalMode === 'add' ? 'Simpan Data' : 'Simpan Perubahan'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* RENDER CUSTOM ALERT */}
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

// ─── STYLES ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: THEME_COLOR, paddingTop: 55, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  backBtn: { padding: 8, marginRight: 12, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 12 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, marginBottom: 2 },
  headerSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#475569' },
  
  listContainer: { padding: 16, paddingBottom: 30 }, 
  listHeaderContainer: { marginBottom: 4, zIndex: 5 }, 
  warnBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#fde68a', marginBottom: 16 },
  warnText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#92400e', flex: 1 },
  
  controlSection: { marginBottom: 16, zIndex: 10 },
  dropdownInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, zIndex: 10 },
  dropdownText: { fontFamily: 'Urbanist-SemiBold', fontSize: 13, color: PRIMARY_DARK, flex: 1 },
  
  dropdownListContainer: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, marginTop: -6, marginBottom: 10, paddingVertical: 4 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 14 },
  dropdownItemText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#475569' },
  dropdownItemTextActive: { fontFamily: 'Urbanist-Bold', color: PRIMARY_DARK },
  actionRow: { flexDirection: 'row', marginBottom: 10, zIndex: 1 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontFamily: 'Urbanist-Medium', fontSize: 13, color: PRIMARY_DARK },
  addButton: { backgroundColor: PRIMARY_DARK, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 12, paddingVertical: 12 },
  addButtonText: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#FFF' },
  
  statsSection: { marginBottom: 16, zIndex: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: '#FFF', padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  statTitle: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#64748B', marginBottom: 4 },
  statValue: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK },
  listSectionTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: PRIMARY_DARK, marginLeft: 2 },
  listSectionHint: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#94A3B8', marginLeft: 2, marginBottom: 10 },
  
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerLeft: { flex: 1 },
  badgeCPL: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  badgeCPLText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#475569' },
  
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  bodyLeft: { flex: 1, paddingRight: 12 },
  bodyRight: { alignItems: 'flex-end', gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoLabel: { fontFamily: 'Urbanist-SemiBold', fontSize: 11, color: '#64748B', marginRight: 6, minWidth: 70 },
  infoValue: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#1E293B', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginBottom: 4 },
  statusText: { fontFamily: 'Urbanist-Bold', fontSize: 10 },
  nilaiText: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: PRIMARY_DARK },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  tanggalText: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#94A3B8' },
  
  studentName: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK, marginBottom: 4 },
  studentNim: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B' },
  
  deleteSwipeBtn: { backgroundColor: DANGER_COLOR, justifyContent: 'center', alignItems: 'center', width: 75, borderRadius: 16, marginBottom: 10, marginLeft: 10 },
  deleteSwipeText: { fontFamily: 'Urbanist-Bold', color: '#FFF', fontSize: 10, marginTop: 4 },

  emptyContainer: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { alignItems: 'center', paddingTop: 30 },
  emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#94A3B8', marginTop: 10 },

  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(36,53,74,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    paddingHorizontal: 24, 
    paddingTop: 16, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    width: '100%', 
    maxHeight: '90%',
    margin: 0,
    elevation: 20,
  },
  
  modalDragIndicator: { width: 45, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK },
  closeModalBtn: { padding: 4 },
  modalBody: { marginBottom: 10 },
  inputLabel: { fontFamily: 'Urbanist-SemiBold', fontSize: 13, color: '#475569', marginBottom: 8 },
  
  // ✅ Styles untuk dropdown di modal
  modalDropdown: { 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalDropdownText: { 
    fontFamily: 'Urbanist-Medium', 
    fontSize: 14, 
    color: PRIMARY_DARK,
    flex: 1
  },
  placeholderText: {
    color: '#94A3B8'
  },
  dropdownList: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 200,
    overflow: 'hidden'
  },
  dropdownListItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  dropdownListItemText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 13,
    color: '#475569',
    flex: 1
  },
  dropdownListItemActive: {
    fontFamily: 'Urbanist-Bold',
    color: PRIMARY_DARK
  },
  
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Urbanist-Medium', fontSize: 14, color: PRIMARY_DARK, marginBottom: 16 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  btnCancel: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#F1F5F9' },
  btnCancelText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#64748B' },
  btnSave: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: PRIMARY_DARK },
  btnSaveText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#FFF' },
});