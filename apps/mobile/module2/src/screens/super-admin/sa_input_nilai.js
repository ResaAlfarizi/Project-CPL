import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  StatusBar, 
  ImageBackground, 
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { nilaiApi, prodiApi, kelasApi, subCpmkApi, mkCplApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;
const PRIMARY_BLUE = BASE.primaryLight;
const PRIMARY_DARK = BASE.primary;
const DANGER_COLOR = BASE.error;
const WARNING_COLOR = BASE.warning;
const SUCCESS_COLOR = BASE.success;
const DISABLED_COLOR = BASE.borderLight;

// ─── CUSTOM ALERT MODAL ──────────────────────────────────────────────────────
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

export default function SAInputNilaiScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // -- STATE UNTUK PILIHAN FILTER (CASCADING) --
  const [selectedProdi, setSelectedProdi] = useState(null);
  const [selectedMk, setSelectedMk] = useState(null);
  const [selectedCpl, setSelectedCpl] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  // -- STATE UNTUK OPSI LIST DARI DATABASE --
  const [prodiList, setProdiList] = useState([]);
  const [masterMkList, setMasterMkList] = useState([]); // Simpan semua kelas
  const [mkList, setMkList] = useState([]); 
  const [cplList, setCplList] = useState([]);
  const [subList, setSubList] = useState([]);

  // -- MODAL STATE --
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownType, setDropdownType] = useState(null);

  // -- EDIT & DELETE MODAL STATE --
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editNilai, setEditNilai] = useState('');
  const [saving, setSaving] = useState(false);

  // -- CUSTOM ALERT STATE --
  const [alert, setAlert] = useState({
    visible: false, type: 'info', title: '', message: '',
    onConfirm: null, onCancel: null, confirmText: '', cancelText: ''
  });

  const showAlert = (opts) => setAlert({ visible: true, ...opts });
  const hideAlert = () => setAlert(a => ({ ...a, visible: false }));

  // 1. TARIK DATA AWAL (NILAI, PRODI, DAN MASTER MATKUL)
  useEffect(() => {
    const loadData = async () => {
      const mkListData = await fetchInitialData();  // Load kelas & prodi dulu
      fetchNilaiMahasiswa(mkListData);              // Pass mkListData untuk resolve prodi
    };
    loadData();
  }, []);

  const fetchNilaiMahasiswa = (mkListData = null) => {
    setIsLoading(true);
    
    // Gunakan mkListData yang dikirim atau fallback ke state
    const mkList = mkListData || masterMkList;
    
    nilaiApi.getAll()
      .then(result => {
        console.log('📊 Raw API Response:', JSON.stringify(result, null, 2));
        const fetchedData = result?.data || result || [];
        console.log('📊 Fetched Data Length:', fetchedData.length);
        
        const normalizedData = fetchedData.map(item => {
          // Resolve prodi dari mk_id dengan match ke masterMkList
          const mkInfo = mkList.find(mk => 
            (mk.raw?.kode_mk || '').toLowerCase() === (item.kode_mk || '').toLowerCase() ||
            (mk.raw?.nama_mk || '').toLowerCase() === (item.nama_mk || '').toLowerCase()
          );
          
          const namaProdi = mkInfo?.nama_prodi || item.nama_prodi || item.prodi || 'Umum';
          
          console.log(`🔍 Resolving prodi for ${item.nama_mk}: ${namaProdi} (found: ${!!mkInfo})`);
          
          return {
            ...item,
            id: item.id || item.nilai_id || Math.random().toString(),
            nama: item.nama || item.nama_mahasiswa || 'Mahasiswa',
            nim: item.nim || item.mahasiswa_nim || '-',
            nilai: item.nilai !== undefined ? item.nilai : (item.score || 0),
            prodi: namaProdi,
            mk: item.nama_mk || item.mk || item.mata_kuliah || 'Mata Kuliah',
            cpl: item.kode_cpl || item.cpl || '-',
            subcpmk: item.kode_sub_cpmk || item.subcpmk || item.kode_subcpmk || '-',
            tanggal_input: formatTanggal(item.input_at || item.created_at || item.tanggal)
          };
        });
        
        console.log('✅ Normalized Data:', normalizedData.length, 'items');
        console.log('📋 Sample with prodi:', JSON.stringify(normalizedData.slice(0, 2), null, 2));
        setData(normalizedData);
      })
      .catch((err) => {
        console.error('❌ Error fetching nilai:', err);
        showAlert({
          type: 'error',
          title: 'Gagal Memuat Data',
          message: 'Tidak dapat mengambil data nilai dari server.',
          confirmText: 'OK',
          onConfirm: hideAlert
        });
      })
      .finally(() => setIsLoading(false));
  };

  const fetchInitialData = async () => {
    try {
      const [resProdi, resKelas] = await Promise.all([
        prodiApi.getAll(),
        kelasApi.getAll(),
      ]);
      
      const prodiData = resProdi?.data || resProdi || [];
      const kelasData = resKelas?.data || resKelas || [];
      
      console.log('📚 Prodi Data:', prodiData.length, 'items');
      console.log('📚 Prodi Data Sample:', JSON.stringify(prodiData.slice(0, 2), null, 2));
      console.log('📚 Kelas Data Raw:', JSON.stringify(kelasData.slice(0, 2), null, 2));
      
      // Simpan prodi list dengan id dan label
      const prodiListMapped = prodiData.map(p => ({ 
        id: p.id || p.prodi_id, 
        label: p.nama_prodi || p.nama,
        nama_prodi: p.nama_prodi || p.nama  // Simpan juga untuk matching
      }));
      setProdiList(prodiListMapped);

      // Helper function untuk resolve prodi_id dari nama_prodi
      const getProdiIdByName = (namaProdi) => {
        const found = prodiListMapped.find(p => 
          (p.nama_prodi || '').toLowerCase() === (namaProdi || '').toLowerCase()
        );
        return found?.id || null;
      };

      // Kelas join dengan MK: response dari /kelas memuat mk_id + nama_mk
      const mappedMkList = kelasData.map(k => {
        const mkId = k.mk_id || k.mata_kuliah_id || k.id;
        // FIX: Jika prodi_id tidak ada, resolve dari nama_prodi
        const prodiId = k.prodi_id || getProdiIdByName(k.nama_prodi);
        
        console.log(`🔍 Kelas mapping: kelas_id=${k.id}, mk_id=${mkId}, prodi_id=${prodiId}, nama_prodi=${k.nama_prodi}, nama=${k.nama_mk || k.mata_kuliah || 'unknown'}`);
        
        return { 
          id: mkId,
          kelas_id: k.id,
          label: k.nama_mk || k.mata_kuliah || k.mk || k.nama_kelas || '-',
          prodi_id: prodiId,  // Gunakan resolved prodi_id
          nama_prodi: k.nama_prodi,
          raw: k  // Simpan raw data untuk debugging
        };
      });
      
      setMasterMkList(mappedMkList);
      console.log('✅ Master MK List:', mappedMkList.length, 'items');
      console.log('📋 Sample MK:', JSON.stringify(mappedMkList.slice(0, 2), null, 2));
      
      // Return mkList untuk digunakan di fetchNilaiMahasiswa
      return mappedMkList;
    } catch (error) {
      console.error('❌ Gagal menarik data awal:', error);
      showAlert({
        type: 'error',
        title: 'Gagal Memuat Filter',
        message: 'Tidak dapat memuat data filter dari server.',
        confirmText: 'OK',
        onConfirm: hideAlert
      });
      return [];
    }
  };

  const formatTanggal = (rawDate) => {
    if (!rawDate || rawDate === '-') return '-';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate; 
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    } catch (e) { return rawDate; }
  };

  // -- CASCADING LOGIC HANDLERS --
  const handleSelectDropdown = async (item) => {
    console.log('🎯 handleSelectDropdown called:', { type: dropdownType, item });
    setDropdownVisible(false);

    if (dropdownType === 'prodi') {
      setSelectedProdi(item);
      // Reset child filters
      setSelectedMk(null); 
      setSelectedCpl(null); 
      setSelectedSub(null);
      setCplList([]); 
      setSubList([]);
      
      // Munculkan Matkul yang HANYA ada di Prodi yang dipilih
      const filteredMks = masterMkList.filter(mk => String(mk.prodi_id) === String(item.id));
      console.log('📚 Filtered MK for prodi:', item.label, '→', filteredMks.length, 'items');
      setMkList(filteredMks);

    } else if (dropdownType === 'mk') {
      setSelectedMk(item);
      // Reset child filters (CPL, Sub-CPMK)
      setSelectedCpl(null); 
      setSelectedSub(null);
      setSubList([]);
      
      // Tarik CPL berdasarkan Matkul yang dipilih
      const mkId = item.id;
      console.log('🔄 Fetching CPL for MK:', { 
        mkId, 
        label: item.label, 
        kelas_id: item.kelas_id,
        raw_item: JSON.stringify(item, null, 2)
      });
      
      try {
        const mkCplRes = await mkCplApi.getByMk(mkId);
        console.log('📊 Raw MK-CPL Response:', JSON.stringify(mkCplRes, null, 2));
        
        const mkCplData = mkCplRes?.data || mkCplRes || [];
        console.log('📊 MK-CPL Data extracted:', mkCplData.length, 'items');
        
        if (mkCplData.length === 0) {
          showAlert({
            type: 'info',
            title: 'Tidak Ada CPL',
            message: `Mata kuliah "${item.label}" belum memiliki pemetaan CPL.`,
            confirmText: 'OK',
            onConfirm: hideAlert
          });
          return;
        }
        
        const cplItems = mkCplData.map(c => { 
          const cplId = c.cpl_id || (c.cpl && c.cpl.id);
          const mkCplId = c.id;
          const label = c.kode_cpl || (c.cpl && c.cpl.kode_cpl) || `CPL-${cplId}`;
          
          console.log(`  🔹 CPL mapping: cpl_id=${cplId}, mk_cpl_id=${mkCplId}, label=${label}`);
          
          return {
            id: cplId, 
            mk_cpl_id: mkCplId,
            label: label,
          };
        });
        
        console.log('✅ CPL List populated:', cplItems.length, 'items');
        setCplList(cplItems);
      } catch (error) { 
        console.error('❌ Gagal tarik CPL dari Matkul:', error);
        console.error('❌ Error details:', error.message, error.stack);
        showAlert({
          type: 'error',
          title: 'Gagal Memuat CPL',
          message: `Tidak dapat memuat data CPL: ${error.message}`,
          confirmText: 'OK',
          onConfirm: hideAlert
        });
      }

    } else if (dropdownType === 'cpl') {
      setSelectedCpl(item);
      // Reset child filter (Sub-CPMK)
      setSelectedSub(null);
      
      const mkCplId = item.mk_cpl_id || item.id;
      console.log('🔄 Fetching Sub-CPMK:', { 
        mkCplId, 
        cpl_id: item.id,
        label: item.label,
        raw_item: JSON.stringify(item, null, 2)
      });
      
      try {
        const subRes = await subCpmkApi.getByMkCpl(mkCplId);
        console.log('📊 Raw Sub-CPMK Response:', JSON.stringify(subRes, null, 2));
        
        const subData = subRes?.data || subRes || [];
        console.log('📊 Sub-CPMK Data extracted:', subData.length, 'items');
        
        if (subData.length === 0) {
          showAlert({
            type: 'info',
            title: 'Tidak Ada Sub-CPMK',
            message: `CPL "${item.label}" belum memiliki pemetaan Sub-CPMK.`,
            confirmText: 'OK',
            onConfirm: hideAlert
          });
          return;
        }
        
        const subItems = subData.map(s => { 
          const subId = s.id || s.sub_cpmk_id;
          const label = s.kode_sub_cpmk || s.kode_subcpmk || `SUB-${subId}`;
          
          console.log(`  🔹 Sub-CPMK mapping: id=${subId}, label=${label}`);
          
          return {
            id: subId, 
            label: label,
          };
        });
        
        console.log('✅ Sub-CPMK List populated:', subItems.length, 'items');
        setSubList(subItems);
      } catch (error) { 
        console.error('❌ Gagal tarik Sub-CPMK dari mk_cpl:', error);
        console.error('❌ Error details:', error.message, error.stack);
        showAlert({
          type: 'error',
          title: 'Gagal Memuat Sub-CPMK',
          message: `Tidak dapat memuat data Sub-CPMK: ${error.message}`,
          confirmText: 'OK',
          onConfirm: hideAlert
        });
      }

    } else if (dropdownType === 'sub') {
      setSelectedSub(item);
      console.log('✅ Sub-CPMK selected:', item.label);
    }
  };

  // -- EDIT & DELETE HANDLERS --
  const handleEditFromDetail = (item) => {
    setDetailModalVisible(false);
    setTimeout(() => {
      setEditItem(item);
      setEditNilai(String(item.nilai));
      setEditModalVisible(true);
    }, 300);
  };

  const handleSaveEdit = async () => {
    if (!editNilai.trim() || isNaN(parseFloat(editNilai))) {
      showAlert({
        type: 'error',
        title: 'Nilai Tidak Valid',
        message: 'Harap masukkan nilai yang valid (angka).',
        confirmText: 'OK',
        onConfirm: hideAlert
      });
      return;
    }

    setSaving(true);
    try {
      await nilaiApi.update(editItem.id, { nilai: parseFloat(editNilai) });
      
      setEditModalVisible(false);
      fetchNilaiMahasiswa();
      
      setTimeout(() => showAlert({
        type: 'success',
        title: 'Berhasil Diperbarui',
        message: `Nilai untuk ${editItem.nama} berhasil diperbarui.`,
        confirmText: 'OK',
        onConfirm: hideAlert
      }), 350);
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.message || 'Terjadi kesalahan saat menyimpan perubahan.',
        confirmText: 'OK',
        onConfirm: hideAlert
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    showAlert({
      type: 'danger',
      title: 'Hapus Data Nilai',
      message: `Anda yakin ingin menghapus nilai untuk ${item.nama} (${item.nim})?\n\nNilai: ${item.nilai}\nMK: ${item.mk}`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onCancel: hideAlert,
      onConfirm: async () => {
        hideAlert();
        try {
          await nilaiApi.delete(item.id);
          fetchNilaiMahasiswa();
          
          setTimeout(() => showAlert({
            type: 'success',
            title: 'Berhasil Dihapus',
            message: `Nilai untuk ${item.nama} telah dihapus dari daftar.`,
            confirmText: 'OK',
            onConfirm: hideAlert
          }), 350);
        } catch (err) {
          showAlert({
            type: 'error',
            title: 'Gagal Menghapus',
            message: err.message || 'Terjadi kesalahan saat menghapus data.',
            confirmText: 'OK',
            onConfirm: hideAlert
          });
        }
      }
    });
  };

  const resetAllFilters = () => {
    setSelectedProdi(null); setSelectedMk(null); setSelectedCpl(null); setSelectedSub(null);
  };

  // -- PENGAPLIKASIAN FILTER KE DATA LIST --
  const filteredData = data.filter(item => {
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || item.nim.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProdi = !selectedProdi || item.prodi === selectedProdi.label;
    const matchMk = !selectedMk || item.mk === selectedMk.label;
    const matchCpl = !selectedCpl || item.cpl === selectedCpl.label;
    const matchSub = !selectedSub || item.subcpmk === selectedSub.label;
    return matchSearch && matchProdi && matchMk && matchCpl && matchSub;
  });

  // -- RENDER HELPERS --
  const getActiveOptions = () => {
    if (dropdownType === 'prodi') return prodiList;
    if (dropdownType === 'mk') return mkList;
    if (dropdownType === 'cpl') return cplList;
    if (dropdownType === 'sub') return subList;
    return [];
  };

  const getActiveSelected = () => {
    if (dropdownType === 'prodi') return selectedProdi;
    if (dropdownType === 'mk') return selectedMk;
    if (dropdownType === 'cpl') return selectedCpl;
    if (dropdownType === 'sub') return selectedSub;
    return null;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setEditItem(item);
        setDetailModalVisible(true);
      }}
      activeOpacity={0.82}
    >
      <View style={styles.cardAvatar}>
        <Ionicons name="person" size={24} color={PRIMARY_BLUE} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.nama}</Text>
        <Text style={styles.cardNim}>NIM: {item.nim}</Text>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-clear-outline" size={12} color="#94A3B8" />
          <Text style={styles.dateText}>Diinput: {item.tanggal_input}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>{item.nilai}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CBD5E1" style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.15 }} >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Kelola Data Nilai</Text>
          <Text style={styles.headerSubtitle}>Superadmin: Filter berjenjang</Text>
        </View>
        {selectedProdi && (
          <TouchableOpacity onPress={resetAllFilters} style={styles.resetBtn}>
            <Ionicons name="refresh" size={20} color="#212121" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Cari Mahasiswa / NIM..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* CASCADING FILTER GRID (2x2) */}
        <View style={styles.filterGrid}>
          {/* Baris 1: Prodi & Matkul */}
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => { setDropdownType('prodi'); setDropdownVisible(true); }}>
              <Text style={styles.dropdownLabel}>1. Prodi</Text>
              <View style={styles.dropdownValueWrap}>
                <Text style={[styles.dropdownValue, !selectedProdi && styles.placeholderText]} numberOfLines={1}>
                  {selectedProdi ? selectedProdi.label : 'Pilih Prodi'}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#64748B" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.dropdownBtn, !selectedProdi && styles.dropdownBtnDisabled]} 
              disabled={!selectedProdi}
              onPress={() => { setDropdownType('mk'); setDropdownVisible(true); }}
            >
              <Text style={styles.dropdownLabel}>2. Mata Kuliah</Text>
              <View style={styles.dropdownValueWrap}>
                <Text style={[styles.dropdownValue, !selectedMk && styles.placeholderText]} numberOfLines={1}>
                  {selectedMk ? selectedMk.label : 'Pilih Matkul'}
                </Text>
                <Ionicons name={!selectedProdi ? "lock-closed" : "chevron-down"} size={12} color="#64748B" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Baris 2: CPL & Sub-CPMK */}
          <View style={styles.filterRow}>
             {/* TOMBOL CPL: Sekarang dikunci oleh selectedMk (Matkul), bukan Prodi */}
             <TouchableOpacity 
              style={[styles.dropdownBtn, !selectedMk && styles.dropdownBtnDisabled]} 
              disabled={!selectedMk}
              onPress={() => { setDropdownType('cpl'); setDropdownVisible(true); }}
            >
              <Text style={styles.dropdownLabel}>3. CPL</Text>
              <View style={styles.dropdownValueWrap}>
                <Text style={[styles.dropdownValue, !selectedCpl && styles.placeholderText]} numberOfLines={1}>
                  {selectedCpl ? selectedCpl.label : 'Pilih CPL'}
                </Text>
                {/* Ikon gembok mengikuti status Matkul */}
                <Ionicons name={!selectedMk ? "lock-closed" : "chevron-down"} size={12} color="#64748B" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.dropdownBtn, !selectedCpl && styles.dropdownBtnDisabled]} 
              disabled={!selectedCpl}
              onPress={() => { setDropdownType('sub'); setDropdownVisible(true); }}
            >
              <Text style={styles.dropdownLabel}>4. Sub-CPMK</Text>
              <View style={styles.dropdownValueWrap}>
                <Text style={[styles.dropdownValue, !selectedSub && styles.placeholderText]} numberOfLines={1}>
                  {selectedSub ? selectedSub.label : 'Pilih Sub'}
                </Text>
                {/* Ikon gembok mengikuti status CPL */}
                <Ionicons name={!selectedCpl ? "lock-closed" : "chevron-down"} size={12} color="#64748B" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_BLUE} />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      ) : (
        <FlatList 
          data={filteredData} 
          keyExtractor={(item) => item.id.toString()} 
          renderItem={renderItem} 
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>Data tidak ditemukan</Text>
            </View>
          }
        />
      )}

      {/* MODAL PILIHAN */}
      <Modal visible={dropdownVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Pilih {dropdownType === 'prodi' ? 'Prodi' : dropdownType === 'mk' ? 'Mata Kuliah' : dropdownType === 'cpl' ? 'CPL' : 'Sub-CPMK'}
            </Text>
            
            {getActiveOptions().length === 0 ? (
              <Text style={styles.emptyModalText}>Tidak ada opsi tersedia.</Text>
            ) : (
              <FlatList
                data={getActiveOptions()}
                keyExtractor={(item) => item.id.toString()}
                style={styles.modalList}
                renderItem={({ item }) => {
                  const isSelected = getActiveSelected()?.id === item.id;
                  return (
                    <TouchableOpacity style={styles.modalOption} onPress={() => handleSelectDropdown(item)}>
                      <Text style={[styles.modalOptionText, isSelected && styles.modalOptionActive]}>{item.label}</Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={PRIMARY_BLUE} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DETAIL NILAI */}
      <Modal visible={detailModalVisible} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.detailOverlay}>
          <TouchableWithoutFeedback onPress={() => setDetailModalVisible(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.detailBox}>
            {editItem && (
              <>
                {/* Header: Nama & NIM */}
                <View style={styles.detailHeader}>
                  <View style={styles.detailAvatarLarge}>
                    <Ionicons name="person" size={32} color={PRIMARY_BLUE} />
                  </View>
                  <View style={styles.detailHeaderText}>
                    <Text style={styles.detailNama}>{editItem.nama}</Text>
                    <Text style={styles.detailNim}>NIM: {editItem.nim}</Text>
                  </View>
                  <View style={styles.detailNilaiBadge}>
                    <Text style={styles.detailNilaiText}>{editItem.nilai}</Text>
                  </View>
                </View>

                <View style={styles.detailDivider} />

                {/* Info Detail */}
                <View style={styles.detailInfoSection}>
                  <View style={styles.detailInfoRow}>
                    <Ionicons name="book-outline" size={16} color={PRIMARY_BLUE} />
                    <Text style={styles.detailInfoLabel}>Mata Kuliah:</Text>
                  </View>
                  <Text style={styles.detailInfoValue}>{editItem.mk}</Text>
                </View>

                <View style={styles.detailInfoSection}>
                  <View style={styles.detailInfoRow}>
                    <Ionicons name="medal-outline" size={16} color={PRIMARY_BLUE} />
                    <Text style={styles.detailInfoLabel}>CPL:</Text>
                  </View>
                  <Text style={styles.detailInfoValue}>{editItem.cpl}</Text>
                </View>

                <View style={styles.detailInfoSection}>
                  <View style={styles.detailInfoRow}>
                    <Ionicons name="checkmark-done-outline" size={16} color={PRIMARY_BLUE} />
                    <Text style={styles.detailInfoLabel}>Sub-CPMK:</Text>
                  </View>
                  <Text style={styles.detailInfoValue}>{editItem.subcpmk}</Text>
                </View>

                <View style={styles.detailInfoSection}>
                  <View style={styles.detailInfoRow}>
                    <Ionicons name="business-outline" size={16} color={PRIMARY_BLUE} />
                    <Text style={styles.detailInfoLabel}>Program Studi:</Text>
                  </View>
                  <Text style={styles.detailInfoValue}>{editItem.prodi}</Text>
                </View>

                <View style={styles.detailInfoSection}>
                  <View style={styles.detailInfoRow}>
                    <Ionicons name="calendar-outline" size={16} color={PRIMARY_BLUE} />
                    <Text style={styles.detailInfoLabel}>Tanggal Input:</Text>
                  </View>
                  <Text style={styles.detailInfoValue}>{editItem.tanggal_input}</Text>
                </View>

                <View style={styles.detailDivider} />

                {/* Action Buttons */}
                <View style={styles.detailBtnRow}>
                  <TouchableOpacity 
                    style={styles.detailBtnDelete}
                    onPress={() => {
                      setDetailModalVisible(false);
                      setTimeout(() => handleDelete(editItem), 200);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.detailBtnText}>Hapus</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.detailBtnEdit} 
                    onPress={() => handleEditFromDetail(editItem)}
                  >
                    <Ionicons name="pencil-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.detailBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL EDIT NILAI */}
      <Modal visible={editModalVisible} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.sheetOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Edit Nilai Mahasiswa</Text>

            {editItem && (
              <>
                <View style={styles.editInfoBox}>
                  <Text style={styles.editInfoLabel}>Mahasiswa</Text>
                  <Text style={styles.editInfoValue}>{editItem.nama} • {editItem.nim}</Text>
                </View>

                <View style={styles.editInfoBox}>
                  <Text style={styles.editInfoLabel}>Mata Kuliah</Text>
                  <Text style={styles.editInfoValue}>{editItem.mk}</Text>
                </View>

                <View style={styles.editInfoBox}>
                  <Text style={styles.editInfoLabel}>CPL • Sub-CPMK</Text>
                  <Text style={styles.editInfoValue}>{editItem.cpl} • {editItem.subcpmk}</Text>
                </View>

                <Text style={styles.fieldLabel}>Nilai Baru</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="calculator-outline" size={18} color={PRIMARY_BLUE} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan nilai (0-100)"
                    placeholderTextColor="#94A3B8"
                    value={editNilai}
                    onChangeText={setEditNilai}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.btnRowEdit}>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.btnCancelText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btnSubmit, saving && { opacity: 0.6 }]}
                    onPress={handleSaveEdit}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.btnSubmitText}>Simpan Perubahan</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
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
  container: { flex: 1, backgroundColor: '#F6F5FA' },
  header: { 
    backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 24, paddingHorizontal: 24, 
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', alignItems: 'center', elevation: 4 
  },
  backBtn: { padding: 8, marginRight: 12 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 2 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#577590' },
  resetBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 12 },
  
  toolbar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0',
    marginBottom: 12, elevation: 1
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#212121' },

  /* CASCADING GRID STYLES */
  filterGrid: { gap: 8 },
  filterRow: { flexDirection: 'row', gap: 8 },
  dropdownBtn: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#E2E8F0', elevation: 1
  },
  dropdownBtnDisabled: { backgroundColor: DISABLED_COLOR, borderColor: '#CBD5E1', elevation: 0 },
  dropdownLabel: { fontFamily: 'Urbanist-Medium', fontSize: 10, color: '#94A3B8', marginBottom: 4 },
  dropdownValueWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownValue: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#212121', flex: 1 },
  placeholderText: { color: '#94A3B8', fontFamily: 'Urbanist-Medium' },

  listContainer: { padding: 20, paddingBottom: 30 },
  
  card: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    borderRadius: 20, padding: 14, marginBottom: 12, borderWidth: 1, 
    borderColor: '#E2E8F0', elevation: 2
  },
  cardAvatar: { 
    width: 48, height: 48, borderRadius: 24, backgroundColor: THEME_COLOR, 
    justifyContent: 'center', alignItems: 'center', marginRight: 14 
  },
  cardContent: { flex: 1, paddingRight: 8 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', marginBottom: 2 },
  cardNim: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B', marginBottom: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#94A3B8', marginLeft: 4 },
  
  rightSection: { alignItems: 'center', justifyContent: 'center' },
  badgeWrap: { backgroundColor: PRIMARY_BLUE, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 6 },
  badgeText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#64748B', marginTop: 10 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#94A3B8', marginTop: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' },
  modalTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: '#212121', marginBottom: 16, textAlign: 'center' },
  modalList: { marginTop: 8 },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalOptionText: { fontFamily: 'Urbanist-Medium', fontSize: 15, color: '#334155' },
  modalOptionActive: { color: PRIMARY_BLUE, fontFamily: 'Urbanist-Bold' },
  emptyModalText: { textAlign: 'center', fontFamily: 'Urbanist-Medium', color: '#94A3B8', marginTop: 20 },

  // ── DETAIL MODAL STYLES ──
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  detailBox: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, width: '100%', maxHeight: '80%', elevation: 24 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  detailAvatarLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  detailHeaderText: { flex: 1 },
  detailNama: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_DARK, marginBottom: 2 },
  detailNim: { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#64748B' },
  detailNilaiBadge: { backgroundColor: PRIMARY_BLUE, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  detailNilaiText: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: '#FFF' },
  
  detailDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  
  detailInfoSection: { marginBottom: 14 },
  detailInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detailInfoLabel: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#94A3B8', marginLeft: 6 },
  detailInfoValue: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK, marginLeft: 22 },
  
  detailBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  detailBtnDelete: { flex: 1, backgroundColor: DANGER_COLOR, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  detailBtnEdit: { flex: 1, backgroundColor: PRIMARY_BLUE, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  detailBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#FFF' },

  // ── EDIT MODAL STYLES ──
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_DARK, marginBottom: 20, textAlign: 'center' },
  
  editInfoBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  editInfoLabel: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#94A3B8', marginBottom: 4 },
  editInfoValue: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_DARK },
  
  fieldLabel: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B', marginBottom: 8, marginTop: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontFamily: 'Urbanist-Medium', fontSize: 14, color: PRIMARY_DARK, paddingVertical: 0 },
  
  btnRowEdit: { flexDirection: 'row', gap: 12, marginTop: 10 },
  btnCancel: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  btnCancelText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#64748B' },
  btnSubmit: { flex: 1, backgroundColor: PRIMARY_BLUE, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnSubmitText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#FFF' },
});