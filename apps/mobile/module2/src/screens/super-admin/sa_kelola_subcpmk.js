import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  StatusBar, 
  ImageBackground, 
  Modal, 
  TextInput, 
  TouchableWithoutFeedback, 
  Keyboard,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1. IMPORT DISESUAIKAN 100% DENGAN api.js KAMU
import { subCpmkApi, prodiApi, cplApi, mkCplApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;
const THEME_COLOR = THEME.primary;
const PRIMARY_BLUE = BASE.primaryLight;
const CANCEL_BG = BASE.errorBg;
const CANCEL_TEXT = BASE.error; 

export default function SAKelolaSubCpmkScreen({ navigation }) {
  // --- STATE DATA API ---
  const [data, setData] = useState([]); 
  const [prodiList, setProdiList] = useState([]);
  const [cplList, setCplList] = useState([]);
  const [mkCplList, setMkCplList] = useState([]); // Pengganti MK List
  
  const [loading, setLoading] = useState(true); 
  const [refreshing, setRefreshing] = useState(false);

  // --- STATE FILTER DI ATAS ---
  const [filterProdi, setFilterProdi] = useState(null);
  const [filterMk, setFilterMk] = useState(null);
  const [filterCpl, setFilterCpl] = useState(null);

  // --- STATE MODAL & FORM (R/W/D) ---
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedSubCpmk, setSelectedSubCpmk] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: '', title: '', message: '' });
  
  const [editId, setEditId] = useState(null); 
  const [kode, setKode] = useState('');
  const [desc, setDesc] = useState('');
  const [bobot, setBobot] = useState('');
  
  // State Form Dropdown
  const [formProdi, setFormProdi] = useState(null);
  const [formMk, setFormMk] = useState(null);
  const [formCpl, setFormCpl] = useState(null);

  const [pickerConfig, setPickerConfig] = useState({ visible: false, type: '', context: '' });

  // --- FETCH DATA DARI DATABASE ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resSub, resProdi, resCpl, resMkCpl] = await Promise.all([
        subCpmkApi.getAll().catch(() => []),
        prodiApi.getAll().catch(() => []),
        cplApi.getAll().catch(() => []),
        mkCplApi.getAll().catch(() => [])
      ]);

      console.log('📦 Response Sub-CPMK:', resSub);
      console.log('📦 Response Prodi:', resProdi);
      console.log('📦 Response CPL:', resCpl);
      console.log('📦 Response MK-CPL:', resMkCpl);
      console.log('📊 Sample MK-CPL item:', resMkCpl?.data?.[0] || resMkCpl?.[0]);

      const subData = resSub?.data || (Array.isArray(resSub) ? resSub : []);
      const prodiData = resProdi?.data || (Array.isArray(resProdi) ? resProdi : []);
      const cplData = resCpl?.data || (Array.isArray(resCpl) ? resCpl : []);
      const mkCplData = resMkCpl?.data || (Array.isArray(resMkCpl) ? resMkCpl : []);

      console.log('✅ Parsed Sub-CPMK:', subData.length, 'items');
      console.log('✅ Parsed Prodi:', prodiData.length, 'items');
      console.log('✅ Parsed CPL:', cplData.length, 'items');
      console.log('✅ Parsed MK-CPL:', mkCplData.length, 'items');
      console.log('📊 Sample MK-CPL Item:', mkCplData[0]); // ← TAMBAH INI

      setData(subData);
      setProdiList(prodiData);
      setCplList(cplData);
      setMkCplList(mkCplData);
    } catch (error) {
      console.error("❌ Gagal sinkronisasi data API:", error);
      setAlertConfig({ visible: true, type: 'error', title: 'Gagal Memuat!', message: 'Tidak dapat terhubung ke server database.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const formatBobotDisplay = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0%';
    return num <= 1 ? `${Math.round(num * 100)}%` : `${num}%`;
  };

  // --- LOGIC EXTRACT MATKUL & CPL DARI RELASI MK_CPL ---
  const getPickerOptions = () => {
    const { type, context } = pickerConfig;
    
    // 1. Opsi Prodi diambil murni dari master Prodi
    if (type === 'prodi') return prodiList;

    // 2. Opsi Matkul diekstrak otomatis dari relasi mkCplList
    if (type === 'mk') {
      const prodiId = context === 'filter' ? filterProdi?.id : formProdi?.id;
      const filteredMkCpl = prodiId 
        ? mkCplList.filter(item => String(item.id_prodi) === String(prodiId) || String(item.prodi_id) === String(prodiId))
        : mkCplList;

      const uniqueMk = [];
      const mkSet = new Set();
      filteredMkCpl.forEach(item => {
        const mkId = item.id_mk || item.mk_id;
        if (mkId && !mkSet.has(mkId)) {
          mkSet.add(mkId);
          uniqueMk.push({ id: mkId, nama: item.nama_mk || item.mk || 'Mata Kuliah' });
        }
      });
      return uniqueMk;
    }

    // 3. Opsi CPL memunculkan item mk_cpl yang spesifik milik MK yang dipilih
    if (type === 'cpl') {
      const mkId = context === 'filter' ? filterMk?.id : formMk?.id;
      return mkId ? mkCplList.filter(item => String(item.id_mk || item.mk_id) === String(mkId)) : mkCplList;
    }

    return [];
  };

  const handleSelectPicker = (item) => {
    const { type, context } = pickerConfig;
    if (context === 'filter') {
      if (type === 'prodi') { setFilterProdi(item); setFilterMk(null); setFilterCpl(null); }
      if (type === 'mk') { setFilterMk(item); setFilterCpl(null); }
      if (type === 'cpl') setFilterCpl(item);
    } else {
      if (type === 'prodi') { setFormProdi(item); setFormMk(null); setFormCpl(null); }
      if (type === 'mk') { setFormMk(item); setFormCpl(null); }
      if (type === 'cpl') setFormCpl(item);
    }
    setPickerConfig({ visible: false, type: '', context: '' });
  };

  // --- FILTER DATA ---
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterProdi && String(item.id_prodi || item.prodi_id) !== String(filterProdi.id)) return false;
      if (filterMk && String(item.id_mk || item.mk_id) !== String(filterMk.id)) return false;
      if (filterCpl && String(item.mk_cpl_id) !== String(filterCpl.id)) return false;      
      return true;
    });
  }, [data, filterProdi, filterMk, filterCpl]);

  // --- CRUD OPERATIONS ---
  const handleSave = () => {
    if (!kode || !desc || !bobot || !formProdi || !formMk || !formCpl) {
      setAlertConfig({ visible: true, type: 'error', title: 'Lengkapi Data!', message: 'Pastikan semua kolom dan hierarki pilihan terisi.' });
      return;
    }

    let parsedBobot = parseFloat(bobot.replace('%', ''));
    let dbBobot = parsedBobot > 1 ? parsedBobot / 100 : parsedBobot;

    if (editId && selectedSubCpmk) {
      const isKodeSama = String(selectedSubCpmk.kode_sub_cpmk || selectedSubCpmk.kode || '').trim() === String(kode).trim();
      const isDescSama = String(selectedSubCpmk.deskripsi || '').trim() === String(desc).trim();
      const isMkCplSama = String(selectedSubCpmk.mk_cpl_id || '') === String(formCpl.id || '');
      const rawOriginalBobot = parseFloat(selectedSubCpmk.bobot) || 0;
      const normalizedOriginalBobot = rawOriginalBobot > 1 ? rawOriginalBobot / 100 : rawOriginalBobot;
      const isBobotSama = Math.abs(normalizedOriginalBobot - dbBobot) < 0.0001;

      if (isKodeSama && isDescSama && isBobotSama && isMkCplSama) {
        setAlertConfig({ visible: true, type: 'error', title: 'Tidak Ada Perubahan!', message: 'Kamu belum mengubah data apa pun.' });
        return; 
      }
    }

    // Payload dikirim menggunakan id dari formCpl (yang merupakan ID dari relasi mk_cpl)
    const payload = { 
      kode_sub_cpmk: kode,               
      kode: kode,                        
      deskripsi: desc,                   
      bobot: dbBobot,                    
      mk_cpl_id: formCpl.id 
    };

    closeModal();
    setLoading(true); 

    const apiCall = editId 
      ? (subCpmkApi.update ? subCpmkApi.update(editId, payload) : Promise.reject("Fungsi update belum ada"))
      : (subCpmkApi.create ? subCpmkApi.create(payload) : Promise.reject("Fungsi create belum ada"));

    apiCall
      .then(() => fetchAllData())
      .then(() => {
        setTimeout(() => setAlertConfig({ visible: true, type: 'success', title: 'Berhasil!', message: 'Data Sub-CPMK berhasil disimpan ke database.' }), 300);
      })
      .catch(error => {
        console.warn("API Error:", error);
        setTimeout(() => setAlertConfig({ visible: true, type: 'error', title: 'Terjadi Masalah', message: 'Gagal terhubung dengan server database.' }), 300);
        setLoading(false);
      });
  };

  const handleDelete = () => {
    setDetailVisible(false);
    
    // Validasi apakah api.js kamu sudah punya fungsi delete untuk subCpmkApi
    if (!subCpmkApi.delete) {
      setTimeout(() => setAlertConfig({ visible: true, type: 'error', title: 'Fungsi Belum Ada!', message: 'Tolong tambahkan "delete" pada subCpmkApi di file api.js kamu terlebih dahulu.' }), 300);
      return;
    }

    setLoading(true);
    subCpmkApi.delete(selectedSubCpmk.id)
      .then(() => {
        fetchAllData();
        setTimeout(() => setAlertConfig({ visible: true, type: 'success', title: 'Terhapus!', message: 'Data Sub-CPMK berhasil dihapus dari sistem.' }), 300);
      })
      .catch(error => {
        console.error("Delete Error:", error);
        setTimeout(() => setAlertConfig({ visible: true, type: 'error', title: 'Gagal Hapus', message: 'Terjadi masalah saat menghapus data di server.' }), 300);
        setLoading(false);
      });
  };

  const closeModal = () => {
    setModalVisible(false);
    setKode(''); setDesc(''); setBobot(''); 
    setFormProdi(null); setFormMk(null); setFormCpl(null);
    setEditId(null); 
  };

  const handleOpenEdit = () => {
    setDetailVisible(false); 
    setKode(selectedSubCpmk.kode_sub_cpmk || selectedSubCpmk.kode);
    setDesc(selectedSubCpmk.deskripsi);
    
    let rawNum = parseFloat(selectedSubCpmk.bobot);
    let formBobot = rawNum <= 1 ? (rawNum * 100).toString() : rawNum.toString();
    setBobot(formBobot); 
    
    // Auto populate dari database
    setFormProdi(prodiList.find(p => String(p.id) === String(selectedSubCpmk.id_prodi || selectedSubCpmk.prodi_id)));
    
    // Merekonstruksi MK List sementara untuk set formMk
    const mkIdMatch = selectedSubCpmk.id_mk || selectedSubCpmk.mk_id;
    setFormMk({ id: mkIdMatch, nama: selectedSubCpmk.mk || selectedSubCpmk.nama_mk });
    
    // Set CPL dari mkCplList
    setFormCpl(mkCplList.find(c => String(c.id) === String(selectedSubCpmk.mk_cpl_id)));
    
    setEditId(selectedSubCpmk.id);
    setTimeout(() => { setModalVisible(true); }, 300);
  };

  const renderItem = ({ item }) => {
    const kodeText = item.kode_sub_cpmk || item.kode || 'SUB-CPMK';
    const prodiText = item.nama_prodi || item.prodi || 'Prodi';
    const mkText = item.nama_mk || item.mk || 'MK';
    const cplText = item.kode_cpl || item.cpl || 'CPL';
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => { setSelectedSubCpmk(item); setDetailVisible(true); }}
      >
        <View style={styles.cardLeft}>
          {/* Header: Prodi - Matkul - CPL */}
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardProdiMk} numberOfLines={1}>
              {prodiText} - {mkText} - {cplText}
            </Text>
            <View style={styles.bobotBadge}>
              <Text style={styles.bobotText}>{formatBobotDisplay(item.bobot)}</Text>
            </View>
          </View>
          
          {/* Kode Sub-CPMK */}
          <Text style={styles.cardKode}>{kodeText}</Text>
          
          {/* Deskripsi */}
          <Text style={styles.cardDesc} numberOfLines={2}>{item.deskripsi || 'Tidak ada deskripsi'}</Text>
        </View>
        
        {/* Chevron Button */}
        <View style={styles.cardChevron}>
          <Ionicons name="chevron-forward" size={24} color={PRIMARY_BLUE} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.15 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Superadmin Sub-CPMK</Text>
          <Text style={styles.headerSubtitle}>Kelola Indikator Semua Program Studi</Text>
        </View>
      </View>

      {/* FILTER SECTION (CASCADING) */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter Berdasarkan:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24 }}>
          
          <TouchableOpacity style={[styles.filterChip, filterProdi && styles.filterChipActive]} onPress={() => setPickerConfig({ visible: true, type: 'prodi', context: 'filter' })}>
            <Text style={[styles.filterChipText, filterProdi && styles.filterChipTextActive]}>{filterProdi ? filterProdi.nama : 'Pilih Prodi'}</Text>
            <Ionicons name="chevron-down" size={16} color={filterProdi ? '#FFF' : PRIMARY_BLUE} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterChip, filterMk && styles.filterChipActive, !filterProdi && {opacity: 0.5}]} 
            disabled={!filterProdi}
            onPress={() => setPickerConfig({ visible: true, type: 'mk', context: 'filter' })}
          >
            <Text style={[styles.filterChipText, filterMk && styles.filterChipTextActive]}>{filterMk ? filterMk.nama : 'Pilih Matkul'}</Text>
            <Ionicons name="chevron-down" size={16} color={filterMk ? '#FFF' : PRIMARY_BLUE} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, filterCpl && styles.filterChipActive, !filterMk && {opacity: 0.5}]} 
            disabled={!filterMk}
            onPress={() => setPickerConfig({ visible: true, type: 'cpl', context: 'filter' })}
          >
            <Text style={[styles.filterChipText, filterCpl && styles.filterChipTextActive]}>{filterCpl ? (filterCpl.kode_cpl || filterCpl.cpl) : 'Pilih CPL'}</Text>
            <Ionicons name="chevron-down" size={16} color={filterCpl ? '#FFF' : PRIMARY_BLUE} />
          </TouchableOpacity>

          {(filterProdi || filterMk || filterCpl) && (
            <TouchableOpacity style={styles.filterClear} onPress={() => { setFilterProdi(null); setFilterMk(null); setFilterCpl(null); }}>
              <Ionicons name="close-circle" size={20} color={CANCEL_TEXT} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
      
      {/* LIST DATA */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_BLUE} />
          <Text style={styles.loadingText}>Menghubungkan ke Server...</Text>
        </View>
      ) : (
        <FlatList 
          data={filteredData} 
          keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()} 
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer} 
          showsVerticalScrollIndicator={false} 
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 50}}>
               <Ionicons name="folder-open-outline" size={48} color="#cbd5e1" />
               <Text style={{color: '#94A3B8', fontFamily: 'Urbanist-Regular', marginTop: 10}}>Tidak ada data sesuai filter dari Database.</Text>
            </View>
          }
        />
      )}
      
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#212121" />
      </TouchableOpacity>

      {/* MODAL FORM (ADD/EDIT) */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContentLucu}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitleLucu}>{editId ? 'Edit Sub-CPMK' : 'Tambah Sub-CPMK'}</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              
              <View style={styles.inputContainerDropdown}>
                <Ionicons name="business-outline" size={20} color={PRIMARY_BLUE} style={styles.inputIcon} />
                <TouchableOpacity style={styles.dropdownTrigger} onPress={() => { Keyboard.dismiss(); setPickerConfig({visible: true, type: 'prodi', context: 'form'}); }}>
                  <Text style={[styles.dropdownValue, !formProdi && {color: '#94A3B8'}]} numberOfLines={1}>
                    {formProdi ? (formProdi.nama_prodi || formProdi.nama) : 'Pilih Program Studi'}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainerDropdown, !formProdi && {opacity: 0.6, backgroundColor: '#e2e8f0'}]}>
                <Ionicons name="library-outline" size={20} color={PRIMARY_BLUE} style={styles.inputIcon} />
                <TouchableOpacity style={styles.dropdownTrigger} disabled={!formProdi} onPress={() => { Keyboard.dismiss(); setPickerConfig({visible: true, type: 'mk', context: 'form'}); }}>
                  <Text style={[styles.dropdownValue, !formMk && {color: '#94A3B8'}]} numberOfLines={1}>
                    {formMk ? (formMk.nama || formMk.nama_mk) : 'Pilih Mata Kuliah'}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainerDropdown, !formMk && {opacity: 0.6, backgroundColor: '#e2e8f0'}]}>
                <Ionicons name="bookmark-outline" size={20} color={PRIMARY_BLUE} style={styles.inputIcon} />
                <TouchableOpacity style={styles.dropdownTrigger} disabled={!formMk} onPress={() => { Keyboard.dismiss(); setPickerConfig({visible: true, type: 'cpl', context: 'form'}); }}>
                  <Text style={[styles.dropdownValue, !formCpl && {color: '#94A3B8'}]} numberOfLines={1}>
                    {formCpl ? (formCpl.kode_cpl || formCpl.cpl || formCpl.nama) : 'Pilih CPL'}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="barcode-outline" size={20} color={PRIMARY_BLUE} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Kode Sub-CPMK (Contoh: SCPL-01)" placeholderTextColor="#94A3B8" value={kode} onChangeText={setKode} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="pie-chart-outline" size={20} color={PRIMARY_BLUE} style={styles.inputIcon} />
                <TextInput style={styles.inputLucu} placeholder="Bobot Penilaian (Contoh: 30)" placeholderTextColor="#94A3B8" value={bobot} onChangeText={setBobot} keyboardType="number-pad" />
                <Text style={{ fontFamily: 'Urbanist-Regular', fontSize: 16, color: '#64748B', marginLeft: 10 }}>%</Text>
              </View>

              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons name="create-outline" size={20} color={PRIMARY_BLUE} style={[styles.inputIcon, {marginTop: 15}]} />
                <TextInput style={[styles.inputLucu, styles.textAreaLucu]} placeholder="Deskripsi Indikator" placeholderTextColor="#94A3B8" value={desc} onChangeText={setDesc} multiline numberOfLines={3} />
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.btnCancelFit} onPress={closeModal}>
                  <Text style={styles.btnCancelTextFit}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSubmitFit} onPress={handleSave}>
                  <Text style={styles.btnSubmitTextFit}>Simpan Database</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL PICKER REUSABLE */}
      <Modal visible={pickerConfig.visible} animationType="fade" transparent onRequestClose={() => setPickerConfig({ visible: false, type: '', context: '' })}>
        <TouchableOpacity 
          style={styles.pickerOverlay} 
          activeOpacity={1} 
          onPress={() => setPickerConfig({ visible: false, type: '', context: '' })}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.pickerBox}>
              <Text style={styles.pickerTitle}>
                {pickerConfig.type === 'prodi' ? 'Pilih Program Studi' : 
                 pickerConfig.type === 'mk' ? 'Pilih Mata Kuliah' : 
                 'Pilih CPL'}
              </Text>
              <FlatList
                data={getPickerOptions()} 
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) => {
                  const displayText = item.nama_prodi || item.nama || item.kode_cpl || item.cpl || item.kode || 'Data';
                  console.log('📋 Rendering picker item:', displayText, item);
                  
                  return (
                    <TouchableOpacity style={styles.pickerOption} onPress={() => handleSelectPicker(item)}>
                      <Text style={styles.pickerOptionText}>{displayText}</Text>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={<Text style={{textAlign: 'center', marginVertical: 20, color: '#94A3B8', fontFamily: 'Urbanist-Regular'}}>Data tidak tersedia.</Text>}
              />
              <TouchableOpacity 
                style={styles.pickerCloseBtnSmall} 
                onPress={() => setPickerConfig({ visible: false, type: '', context: '' })}
              >
                <Text style={styles.pickerCloseText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* MODAL ALERT */}
      <Modal visible={alertConfig.visible} animationType="fade" transparent onRequestClose={() => setAlertConfig({...alertConfig, visible: false})}>
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={[styles.alertIconWrap, { backgroundColor: alertConfig.type === 'success' ? '#e0f2f1' : '#ffebee' }]}>
              <Ionicons name={alertConfig.type === 'success' ? "checkmark-circle" : "warning"} size={45} color={alertConfig.type === 'success' ? '#00796b' : '#c62828'} />
            </View>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity style={[styles.btnAlertOK, { backgroundColor: alertConfig.type === 'success' ? PRIMARY_BLUE : '#c62828' }]} onPress={() => setAlertConfig({...alertConfig, visible: false})}>
              <Text style={styles.btnAlertOKText}>Oke, Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DETAIL (DENGAN TOMBOL EDIT & DELETE) */}
      <Modal visible={detailVisible} animationType="fade" transparent onRequestClose={() => setDetailVisible(false)}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setDetailVisible(false)}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.detailBox}>
              {selectedSubCpmk && (
                <>
                  <View style={styles.detailHeaderWrap}>
                    <View style={styles.detailBadgeKode}>
                      <Text style={styles.detailBadgeText}>{selectedSubCpmk.kode_sub_cpmk || selectedSubCpmk.kode}</Text>
                    </View>
                    <Text style={{ fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#64748B', textAlign: 'center', textTransform: 'uppercase' }}>
                      {selectedSubCpmk.prodi || selectedSubCpmk.nama_prodi}
                    </Text>
                    <Text style={{ fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#212121', textAlign: 'center', marginBottom: 8, marginTop: 4 }}>
                      {selectedSubCpmk.mk || selectedSubCpmk.nama_mk} ({selectedSubCpmk.cpl || selectedSubCpmk.kode_cpl})
                    </Text>
                    <View style={styles.detailBadgeBobot}>
                      <Text style={styles.detailBadgeBobotText}>Bobot: {formatBobotDisplay(selectedSubCpmk.bobot)}</Text>
                    </View>
                  </View>
                  <View style={styles.detailDivider} />
                  <ScrollView style={styles.descScroll} showsVerticalScrollIndicator={false}>
                    <Text style={styles.descLabel}>Deskripsi Indikator :</Text>
                    <Text style={styles.descText}>{selectedSubCpmk.deskripsi}</Text>
                  </ScrollView>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.btnCancelFit, { flex: 0.48 }]} onPress={handleDelete} activeOpacity={0.8}>
                      <Text style={[styles.btnCancelTextFit, { fontSize: 14 }]}>Hapus DB</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btnSubmitFit, { flex: 0.48 }]} onPress={handleOpenEdit} activeOpacity={0.8}>
                      <Text style={[styles.btnSubmitTextFit, { fontSize: 14 }]}>Edit Data</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F5FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontFamily: 'Urbanist-Medium', fontSize: 14, color: PRIMARY_BLUE },
  header: { backgroundColor: THEME_COLOR, paddingTop: 50, paddingBottom: 25, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', elevation: 4 },
  backBtn: { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
  
  filterSection: { paddingHorizontal: 24, marginTop: 15 },
  filterLabel: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: PRIMARY_BLUE, marginBottom: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: PRIMARY_BLUE, marginRight: 10 },
  filterChipActive: { backgroundColor: PRIMARY_BLUE },
  filterChipText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: PRIMARY_BLUE, marginRight: 6 },
  filterChipTextActive: { color: '#FFF' },
  filterClear: { padding: 8, justifyContent: 'center' },

  listContainer: { padding: 24, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  
  // New Card Layout Styles
  cardLeft: { flex: 1, paddingRight: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardProdiMk: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: PRIMARY_BLUE, flex: 1, marginRight: 8 },
  bobotBadge: { backgroundColor: '#e0f2f1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  bobotText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#00796b', textAlign: 'center' },
  cardKode: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#212121', marginBottom: 6 },
  cardDesc: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B', lineHeight: 18 },
  cardChevron: { paddingLeft: 8, justifyContent: 'center', alignItems: 'center' },
  
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 20, backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'flex-end' },
  modalContentLucu: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingTop: 15, paddingBottom: 40, elevation: 20, maxHeight: '85%' },
  modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitleLucu: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_BLUE, textAlign: 'center', marginBottom: 20 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 18, marginBottom: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  inputIcon: { marginRight: 10 },
  inputLucu: { flex: 1, paddingVertical: 15, fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121' },
  textAreaContainer: { alignItems: 'flex-start' },
  textAreaLucu: { height: 90, textAlignVertical: 'top', paddingTop: 15 },
  
  inputContainerDropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 18, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  dropdownTrigger: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  dropdownValue: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121', flex: 1, marginRight: 10 },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, width: '100%' },
  btnCancelFit: { flex: 0.48, backgroundColor: CANCEL_BG, borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  btnCancelTextFit: { color: CANCEL_TEXT, fontFamily: 'Urbanist-Regular', fontSize: 15, fontWeight: '700' },
  btnSubmitFit: { flex: 0.48, backgroundColor: PRIMARY_BLUE, borderRadius: 20, paddingVertical: 14, alignItems: 'center', elevation: 3 },
  btnSubmitTextFit: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  pickerBox: { backgroundColor: '#FFF', width: '100%', borderRadius: 24, maxHeight: '70%', padding: 20, elevation: 10 },
  pickerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: PRIMARY_BLUE, textAlign: 'center', marginBottom: 15 },
  pickerOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  pickerOptionText: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#212121', textAlign: 'center' },
  pickerCloseBtnSmall: { marginTop: 15, paddingVertical: 10, paddingHorizontal: 30, backgroundColor: CANCEL_BG, borderRadius: 16, alignSelf: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  pickerCloseText: { color: CANCEL_TEXT, fontFamily: 'Urbanist-Bold', fontSize: 14 },
  
  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '80%', alignItems: 'center', elevation: 20 },
  alertIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  btnAlertOK: { borderRadius: 20, paddingVertical: 14, paddingHorizontal: 30, alignItems: 'center', elevation: 3 },
  btnAlertOKText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 16 },
  
  detailBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 24, width: '85%', maxHeight: '80%', alignItems: 'center', elevation: 20 },
  detailHeaderWrap: { alignItems: 'center', width: '100%' },
  detailBadgeKode: { backgroundColor: THEME_COLOR, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 10 },
  detailBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121' },
  detailBadgeBobot: { backgroundColor: '#e0f2f1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 4 },
  detailBadgeBobotText: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#00796b' },
  detailDivider: { width: '100%', height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  descScroll: { width: '100%', marginBottom: 10 },
  descLabel: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#212121', marginBottom: 6 },
  descText: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#64748B', lineHeight: 22, textAlign: 'justify' }
});