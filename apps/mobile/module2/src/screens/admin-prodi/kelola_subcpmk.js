import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SectionList,
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

// ✅ Import API & Theme
import { subCpmkApi, mkCplApi, profileApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, CustomAlert, EmptyState, PickerModal } from '../../components';

// ✅ THEME ADMIN PRODI
const THEME = ROLE_THEMES.adminProdi;
const PRIMARY_BLUE = BASE.primaryLight; 

export default function KelolaSubCpmkScreen({ navigation }) {
  const [data, setData] = useState([]); 
  const [mkOptions, setMkOptions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [adminProdiId, setAdminProdiId] = useState(null); 
  const [modalVisible, setModalVisible] = useState(false);
  
  const [editId, setEditId] = useState(null); 
  const [kode, setKode] = useState('');
  const [desc, setDesc] = useState('');
  const [bobot, setBobot] = useState('');
  const [selectedMkCplObj, setSelectedMkCplObj] = useState(null); 
  
  const [pickerVisible, setPickerVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedSubCpmk, setSelectedSubCpmk] = useState(null);
  
  // ✅ State Alert - Using CustomAlert component
  const [alert, setAlert] = useState({ 
    visible: false, type: 'info', title: '', message: '', onConfirm: null 
  });

  const getMkCplKey = (item) => {
    const mk = item.nama_mk || 'Mata Kuliah';
    const cpl = item.kode_cpl || 'CPL';
    return `${mk} - ${cpl}`;
  };

  const fetchSubCpmkData = async () => {
    setLoading(true);
    try {
      // ✅ GET ADMIN PRODI PROFILE FIRST
      const profile = await profileApi.getAdmin();
      const currentProdiId = profile?.data?.prodi_id || profile?.data?.entity_id;
      setAdminProdiId(currentProdiId);

      const resSub = await subCpmkApi.getAll();
      const extractedSub = resSub && resSub.data && Array.isArray(resSub.data) ? resSub.data : (Array.isArray(resSub) ? resSub : []);
      
      // ✅ FILTER BY PRODI_ID (only show Sub-CPMK from Admin's prodi)
      const filteredSub = currentProdiId 
        ? extractedSub.filter(item => {
            const itemProdiId = item.prodi_id || item.mk_prodi_id;
            return String(itemProdiId) === String(currentProdiId);
          })
        : extractedSub;
      
      setData(filteredSub);

      const resMkCpl = await mkCplApi.getAll();
      const extractedMkCpl = resMkCpl && resMkCpl.data && Array.isArray(resMkCpl.data) ? resMkCpl.data : (Array.isArray(resMkCpl) ? resMkCpl : []);
      
      // ✅ FILTER MK-CPL OPTIONS BY PRODI_ID
      const filteredMkCpl = currentProdiId
        ? extractedMkCpl.filter(item => {
            const itemProdiId = item.prodi_id || item.mk_prodi_id;
            return String(itemProdiId) === String(currentProdiId);
          })
        : extractedMkCpl;
      
      setMkOptions(filteredMkCpl);
    } catch (error) {
      console.error("Gagal sinkronisasi data API:", error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchSubCpmkData();
  }, []);

  const formatBobotDisplay = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0%';
    return num <= 1 ? `${Math.round(num * 100)}%` : `${num}%`;
  };

  const groupedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const groups = {};
    data.forEach(item => {
      const groupKey = getMkCplKey(item);
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });
    
    return Object.keys(groups).map(key => ({ title: key, data: groups[key] }));
  }, [data]);

  const handleSave = () => {
    // 1. Validasi Form Kosong
    if (!kode || !desc || !bobot || !selectedMkCplObj) {
      setAlert({ 
        visible: true, type: 'error', 
        title: 'Lengkapi Data!', 
        message: 'Pastikan kode, deskripsi, bobot, & MK-CPL terisi.',
        onConfirm: () => setAlert({ ...alert, visible: false })
      });
      return;
    }

    let parsedBobot = parseFloat(bobot.replace('%', ''));
    let dbBobot = parsedBobot > 1 ? parsedBobot / 100 : parsedBobot;

    // 2. 🔥 VALIDASI PERUBAHAN (DIRTY CHECKING SUPER KETAT & AMAN DARI NULL)
    if (editId && selectedSubCpmk) {
      // Ubah semua ke format teks (String) murni agar kebal terhadap perbandingan Null vs "" atau Angka vs Teks
      const originalKode = String(selectedSubCpmk.kode_sub_cpmk || '').trim();
      const currentKode = String(kode || '').trim();
      const isKodeSama = originalKode === currentKode;

      const originalDesc = String(selectedSubCpmk.deskripsi || '').trim();
      const currentDesc = String(desc || '').trim();
      const isDescSama = originalDesc === currentDesc;

      const originalMkCplId = String(selectedSubCpmk.mk_cpl_id || '');
      const currentMkCplId = String(selectedMkCplObj.id || '');
      const isMkCplSama = originalMkCplId === currentMkCplId;

      // Bobot dikalkulasi khusus secara matematika
      const rawOriginalBobot = parseFloat(selectedSubCpmk.bobot) || 0;
      const normalizedOriginalBobot = rawOriginalBobot > 1 ? rawOriginalBobot / 100 : rawOriginalBobot;
      const isBobotSama = Math.abs(normalizedOriginalBobot - dbBobot) < 0.0001; // Toleransi nol-koma matematika

      // Jika tidak ada satu pun field yang berubah dari data awalnya, tampilkan warning!
      if (isKodeSama && isDescSama && isBobotSama && isMkCplSama) {
        setAlert({ 
          visible: true, 
          type: 'error', // Warna merah sebagai peringatan pop-up
          title: 'Tidak Ada Perubahan!', 
          message: 'Kamu belum mengubah data apa pun. Silakan ubah isi formulir terlebih dahulu.',
          onConfirm: () => setAlert({ ...alert, visible: false })
        });
        return; // Hentikan fungsi di sini, JANGAN lanjut ke API
      }
    }

    const payload = { 
      kode_sub_cpmk: kode,               
      kode: kode,                        
      deskripsi: desc,                   
      bobot: dbBobot,                    
      mk_cpl_id: selectedMkCplObj.id     
    };

    closeModal();
    setLoading(true); 

    const apiCall = editId 
      ? (subCpmkApi.update ? subCpmkApi.update(editId, payload) : Promise.reject("Fungsi update belum ada"))
      : (subCpmkApi.create ? subCpmkApi.create(payload) : Promise.reject("Fungsi create belum ada"));

    apiCall
      .then(() => fetchSubCpmkData())
      .then(() => {
        setTimeout(() => setAlert({ 
          visible: true, type: 'success', 
          title: 'Berhasil!', 
          message: 'Data Sub-CPMK berhasil disimpan ke database.',
          onConfirm: () => setAlert({ ...alert, visible: false })
        }), 300);
      })
      .catch(error => {
        console.warn("API Error:", error);
        
        const fallbackItem = { 
          id: editId || Date.now().toString(), 
          ...payload,
          nama_mk: selectedMkCplObj.nama_mk || 'Mata Kuliah', 
          kode_cpl: selectedMkCplObj.kode_cpl || 'CPL' 
        };

        if (editId) {
          setData(data.map(item => item.id === editId ? fallbackItem : item));
        } else {
          setData([fallbackItem, ...data]);
        }
        
        setTimeout(() => setAlert({ 
          visible: true, type: 'error', 
          title: 'Terjadi Masalah', 
          message: 'Gagal terhubung dengan server database.',
          onConfirm: () => setAlert({ ...alert, visible: false })
        }), 300);
      })
      .finally(() => setLoading(false));
  };

  const closeModal = () => {
    setModalVisible(false);
    setKode(''); setDesc(''); setBobot(''); 
    setSelectedMkCplObj(null); setPickerVisible(false);
    setEditId(null); 
  };

  const handleOpenEdit = () => {
    setDetailVisible(false); 
    
    setKode(selectedSubCpmk.kode_sub_cpmk);
    setDesc(selectedSubCpmk.deskripsi);
    
    let rawNum = parseFloat(selectedSubCpmk.bobot);
    let formBobot = rawNum <= 1 ? (rawNum * 100).toString() : rawNum.toString();
    setBobot(formBobot); 

    const matchedOption = mkOptions.find(opt => opt.id === selectedSubCpmk.mk_cpl_id);
    setSelectedMkCplObj(matchedOption || { id: selectedSubCpmk.mk_cpl_id, nama_mk: selectedSubCpmk.nama_mk, kode_cpl: selectedSubCpmk.kode_cpl });
    
    setEditId(selectedSubCpmk.id);
    
    setTimeout(() => { setModalVisible(true); }, 300);
  };

  const renderItem = ({ item }) => {
    const kodeText = item.kode_sub_cpmk || 'SUB-CPMK';
    const descText = item.deskripsi || 'Tidak ada deskripsi';
    const rawBobot = item.bobot || 0;
    const bobotText = formatBobotDisplay(rawBobot);

    const avatarLabel = kodeText.replace(/[^0-9]/g, '').slice(0,2) || kodeText.slice(0,2);

    return (
      <TouchableOpacity 
        style={styles.card} activeOpacity={0.7}
        onPress={() => {
          setSelectedSubCpmk(item);
          setDetailVisible(true);
        }}
      >
        <View style={styles.cardAvatar}>
          <Text style={styles.avatarText}>{avatarLabel}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{kodeText}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>Bobot: {bobotText} | {descText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>
        <Ionicons name="book" size={16} color={PRIMARY_BLUE} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.15 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Sub-CPMK</Text>
          <Text style={styles.headerSubtitle}>Indikator Penilaian Program Studi</Text>
        </View>
      </View>
      
      {loading ? (
        <LoadingState message="Memuat Data Sub-CPMK..." color={BASE.primary} />
      ) : (
        <SectionList 
          sections={groupedData} 
          keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()} 
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContainer} 
          showsVerticalScrollIndicator={false} 
          stickySectionHeadersEnabled={false} 
          ListEmptyComponent={
            <EmptyState 
              icon="folder-open-outline" 
              message="Belum ada data Sub-CPMK."
            />
          }
        />
      )}
      
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#212121" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); closeModal(); }}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContentLucu}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitleLucu}>{editId ? 'Edit Sub-CPMK' : 'Tambah Sub-CPMK'}</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="barcode-outline" size={20} color={BASE.primary} style={styles.inputIcon} />
              <TextInput style={styles.inputLucu} placeholder="Kode Sub-CPMK (Contoh: SCPL-01)" placeholderTextColor={BASE.textMuted} value={kode} onChangeText={setKode} />
            </View>

            <View style={{ marginBottom: 12 }}>
              <View style={styles.inputContainerDropdown}>
                <Ionicons name="library-outline" size={20} color={BASE.primary} style={styles.inputIcon} />
                <TouchableOpacity style={styles.dropdownTrigger} onPress={() => { Keyboard.dismiss(); setPickerVisible(true); }}>
                  <Text style={[styles.dropdownValue, !selectedMkCplObj && {color: BASE.textMuted}]} numberOfLines={1}>
                    {selectedMkCplObj ? `${selectedMkCplObj.nama_mk || selectedMkCplObj.nama} - ${selectedMkCplObj.kode_cpl || selectedMkCplObj.cpl}` : 'Pilih Mata Kuliah & CPL'}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color={BASE.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="pie-chart-outline" size={20} color={BASE.primary} style={styles.inputIcon} />
              <TextInput style={styles.inputLucu} placeholder="Bobot Penilaian (Contoh: 30)" placeholderTextColor={BASE.textMuted} value={bobot} onChangeText={setBobot} keyboardType="number-pad" />
              <Text style={{ fontFamily: 'Urbanist-Regular', fontSize: 16, color: BASE.textMuted, marginLeft: 10 }}>%</Text>
            </View>

            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="create-outline" size={20} color={BASE.primary} style={[styles.inputIcon, {marginTop: 15}]} />
              <TextInput style={[styles.inputLucu, styles.textAreaLucu]} placeholder="Deskripsi Indikator" placeholderTextColor={BASE.textMuted} value={desc} onChangeText={setDesc} multiline numberOfLines={3} />
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnCancelFit} onPress={closeModal}>
                <Text style={styles.btnCancelTextFit}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSubmitFit} onPress={handleSave}>
                <Text style={styles.btnSubmitTextFit}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ PICKER MODAL - MK & CPL */}
      <PickerModal
        visible={pickerVisible}
        title="Pilih Mata Kuliah & CPL"
        data={mkOptions.map(item => ({
          id: item.id,
          label: `${item.nama_mk || item.nama || 'Mata Kuliah'} - ${item.kode_cpl || item.cpl || 'CPL'}`,
          ...item
        }))}
        selectedId={selectedMkCplObj?.id}
        onSelect={(item) => {
          setSelectedMkCplObj(item);
          setPickerVisible(false);
        }}
        onClose={() => setPickerVisible(false)}
        searchable={true}
        searchPlaceholder="Cari mata kuliah..."
      />

      {/* ✅ CUSTOM ALERT */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        confirmText="Oke, Mengerti"
      />

      <Modal visible={detailVisible} animationType="fade" transparent onRequestClose={() => setDetailVisible(false)}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setDetailVisible(false)}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.detailBox}>
              {selectedSubCpmk && (
                <>
                  <View style={styles.detailHeaderWrap}>
                    <View style={styles.detailBadgeKode}>
                      <Text style={styles.detailBadgeText}>{selectedSubCpmk.kode_sub_cpmk}</Text>
                    </View>
                    <Text style={{ fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 8, marginTop: 8 }}>
                      {getMkCplKey(selectedSubCpmk)}
                    </Text>
                    <View style={styles.detailBadgeBobot}>
                      <Text style={styles.detailBadgeBobotText}>Bobot Penilaian: {formatBobotDisplay(selectedSubCpmk.bobot)}</Text>
                    </View>
                  </View>
                  <View style={styles.detailDivider} />
                  <ScrollView style={styles.descScroll} showsVerticalScrollIndicator={false}>
                    <Text style={styles.descLabel}>Deskripsi Indikator :</Text>
                    <Text style={styles.descText}>{selectedSubCpmk.deskripsi}</Text>
                  </ScrollView>
                  <View style={styles.detailButtonRowSingle}>
                    <TouchableOpacity style={[styles.btnSubmitFit, { flex: 0, paddingHorizontal: 25, paddingVertical: 10 }]} onPress={handleOpenEdit} activeOpacity={0.8}>
                      <Text style={[styles.btnSubmitTextFit, { fontSize: 14 }]}>Edit</Text>
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
  container: { flex: 1, backgroundColor: BASE.background },
  header: { 
    backgroundColor: THEME.primary, 
    paddingTop: 50, 
    paddingBottom: 30, 
    paddingHorizontal: 24, 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32, 
    flexDirection: 'row', 
    elevation: 4 
  },
  backBtn: { padding: 8, marginRight: 12, marginTop: -2 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: BASE.textMain, marginBottom: 4 },
  headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: BASE.textMuted },
  listContainer: { padding: 24, paddingBottom: 100 },
  
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 15, 
    marginBottom: 12, 
    paddingBottom: 8, 
    borderBottomWidth: 1.5, 
    borderBottomColor: THEME.primary 
  },
  sectionIconWrap: { backgroundColor: THEME.accent, padding: 6, borderRadius: 8, marginRight: 10 },
  sectionTitle: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: BASE.primary, flex: 1, lineHeight: 20 },
  
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: BASE.surface, 
    padding: 16, 
    borderRadius: 24, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: BASE.border, 
    elevation: 2 
  },
  cardAvatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    backgroundColor: THEME.secondary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: BASE.primary, marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: BASE.textMuted, paddingRight: 10, lineHeight: 18 },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    width: 60, 
    height: 60, 
    borderRadius: 20, 
    backgroundColor: THEME.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5 
  },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'flex-end' },
  modalContentLucu: { 
    backgroundColor: BASE.surface, 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    padding: 24, 
    paddingTop: 15, 
    paddingBottom: 40, 
    elevation: 20 
  },
  modalHandle: { width: 40, height: 5, backgroundColor: BASE.border, borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
  modalTitleLucu: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: BASE.primary, textAlign: 'center', marginBottom: 25 },
  
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: THEME.accent, 
    borderRadius: 18, 
    marginBottom: 12, 
    paddingHorizontal: 15, 
    borderWidth: 1, 
    borderColor: BASE.border 
  },
  inputIcon: { marginRight: 10 },
  inputLucu: { flex: 1, paddingVertical: 15, fontFamily: 'Urbanist-Regular', fontSize: 15, color: BASE.textMain },
  textAreaContainer: { alignItems: 'flex-start' },
  textAreaLucu: { height: 90, textAlignVertical: 'top', paddingTop: 15 },
  
  inputContainerDropdown: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: THEME.accent, 
    borderRadius: 18, 
    paddingHorizontal: 15, 
    borderWidth: 1, 
    borderColor: BASE.border 
  },
  dropdownTrigger: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  dropdownValue: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: BASE.textMain, flex: 1, marginRight: 10 },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  btnCancelFit: { 
    flex: 0.48, 
    backgroundColor: BASE.errorBg, 
    borderRadius: 20, 
    paddingVertical: 14, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: BASE.errorBorder 
  },
  btnCancelTextFit: { color: BASE.error, fontFamily: 'Urbanist-Regular', fontSize: 15, fontWeight: '700' },
  btnSubmitFit: { 
    flex: 0.48, 
    backgroundColor: BASE.primary, 
    borderRadius: 20, 
    paddingVertical: 14, 
    alignItems: 'center', 
    elevation: 3 
  },
  btnSubmitTextFit: { color: BASE.surface, fontFamily: 'Urbanist-Bold', fontSize: 15 },
  
  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
  
  detailBox: { 
    backgroundColor: BASE.surface, 
    borderRadius: 35, 
    padding: 24, 
    width: '85%', 
    maxHeight: '80%', 
    alignItems: 'center', 
    elevation: 20 
  },
  detailHeaderWrap: { alignItems: 'center', width: '100%' },
  detailBadgeKode: { backgroundColor: THEME.secondary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 10 },
  detailBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain },
  detailBadgeBobot: { backgroundColor: BASE.successBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 4 },
  detailBadgeBobotText: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: BASE.success },
  detailDivider: { width: '100%', height: 1, backgroundColor: BASE.border, marginVertical: 16 },
  descScroll: { width: '100%', marginBottom: 10 },
  descLabel: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: BASE.textMain, marginBottom: 6 },
  descText: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: BASE.textMuted, lineHeight: 22, textAlign: 'justify' },
  detailButtonRowSingle: { width: '100%', alignItems: 'flex-end', marginTop: 10 }
});