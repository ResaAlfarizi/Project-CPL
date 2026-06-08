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
import { cplApi, profileApi, mkCplApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, CustomAlert, EmptyState, PickerModal } from '../../components';

// ✅ THEME ADMIN PRODI
const THEME = ROLE_THEMES.adminProdi;
const PRIMARY_BLUE = BASE.primaryLight;

export default function KelolaCPLScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [mkOptions, setMkOptions] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ STATE UNTUK MENYIMPAN PRODI ADMIN SECARA DINAMIS
  const [currentProdiId, setCurrentProdiId] = useState('');
  const [adminProdiName, setAdminProdiName] = useState('Memuat Prodi...');
  
  // State Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [mkOpen, setMkOpen] = useState(false);
  
  // State Data Form
  const [selectedCpl, setSelectedCpl] = useState(null);
  const [editId, setEditId] = useState(null);
  const [kode, setKode] = useState('');
  const [selectedMk, setSelectedMk] = useState(null); 
  const [desc, setDesc] = useState('');

  // ✅ State Alert - Using CustomAlert component
  const [alert, setAlert] = useState({ 
    visible: false, type: 'info', title: '', message: '', onConfirm: null 
  });
  
  // State for Picker Modal
  const [pickerVisible, setPickerVisible] = useState(false);

  // ✅ FUNGSI UTAMA: Ambil Data & Perkawinan Data Super Aman (Bebas Bug Tipe Data)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil Profil Admin
      const profile = await profileApi.getAdmin();
      const prodiId = profile?.data?.prodi_id || profile?.data?.entity_id;
      const safeProdiId = prodiId || '00000000-0000-0000-0000-000000000000';
      
      const namaProdi = profile?.data?.nama_prodi || profile?.data?.prodi || profile?.prodi || profile?.nama_prodi || 'Program Studi Admin';
      
      setCurrentProdiId(safeProdiId);
      setAdminProdiName(namaProdi);
      
      // 2. Ambil Semua Data Mata Kuliah dari mkCplApi
      let rawMkData = [];
      const uniqueMataKuliah = [];
      const seenMkIds = new Set();
      
      try {
        const mkCplResult = await mkCplApi.getAll();
        rawMkData = mkCplResult && mkCplResult.data && Array.isArray(mkCplResult.data)
          ? mkCplResult.data
          : (Array.isArray(mkCplResult) ? mkCplResult : []);
        
        rawMkData.forEach(item => {
          const matchProdi = item.prodi_id ? item.prodi_id === safeProdiId : true; 
          const mkId = item.id_mk || item.mk_id || item.id || item.id_matakuliah;
          
          if (matchProdi && mkId && !seenMkIds.has(mkId.toString())) {
            seenMkIds.add(mkId.toString());
            uniqueMataKuliah.push({
              id: mkId,
              kode_mk: item.kode_mk || item.mk_kode || item.kode || '',
              nama_mk: item.nama_mk || item.mk_nama || item.nama || item.mk || 'Mata Kuliah Tanpa Nama'
            });
          }
        });
        setMkOptions(uniqueMataKuliah);
      } catch (mkErr) {
        console.error("Gagal memuat opsi Mata Kuliah:", mkErr);
      }

      // 3. Ambil Data CPL
      const result = await cplApi.getByProdi(safeProdiId);
      const extractedData = result && result.data && Array.isArray(result.data) 
        ? result.data 
        : (Array.isArray(result) ? result : []);
        
      // 🌟 ALGORITMA PENCORINGAN BARU: Melacak relasi lewat 3 jalur berbeda (Anti Gagal Grouping)
      const enrichedData = extractedData.map(cplItem => {
        const cplId = cplItem.id || cplItem.cpl_id || cplItem.id_cpl;
        const directMkId = cplItem.mk_id || cplItem.id_mk || cplItem.mata_kuliah_id || cplItem.id_matakuliah;
        
        // JALUR A: Cari kecocokan di tabel pivot mk-cpl berdasarkan cpl_id
        const foundInPivot = rawMkData.find(link => 
          (link.cpl_id && link.cpl_id == cplId) || 
          (link.id_cpl && link.id_cpl == cplId)
        );

        // JALUR B: Cari kecocokan langsung di master mata kuliah berdasarkan mk_id bawaan CPL
        const foundInMaster = uniqueMataKuliah.find(mk => mk.id == directMkId);

        // JALUR C: Cek jika data matkul dibungkus dalam objek relasi (nested object) oleh backend
        const nestedMk = cplItem.mata_kuliah || cplItem.mk || cplItem.mk_cpl || cplItem.MataKuliah;

        if (foundInPivot) {
          return {
            ...cplItem,
            nama_mk: foundInPivot.nama_mk || foundInPivot.mk_nama || foundInPivot.nama || (foundInMaster ? foundInMaster.nama_mk : undefined),
            kode_mk: foundInPivot.kode_mk || foundInPivot.mk_kode || foundInPivot.kode || (foundInMaster ? foundInMaster.kode_mk : undefined),
            mk_id: foundInPivot.mk_id || foundInPivot.id_mk || directMkId
          };
        } else if (foundInMaster) {
          return {
            ...cplItem,
            nama_mk: foundInMaster.nama_mk,
            kode_mk: foundInMaster.kode_mk,
            mk_id: foundInMaster.id
          };
        } else if (nestedMk) {
          return {
            ...cplItem,
            nama_mk: nestedMk.nama_mk || nestedMk.nama || nestedMk.mk_nama || nestedMk.nama_matakuliah,
            kode_mk: nestedMk.kode_mk || nestedMk.kode || nestedMk.mk_kode || nestedMk.kode_matakuliah,
            mk_id: nestedMk.id || nestedMk.mk_id || nestedMk.id_mk
          };
        }

        return cplItem; 
      });

      setData(enrichedData);

    } catch (error) {
      console.error("Gagal memuat data CPL:", error);
      setData([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ USEMEMO GROUPING TERPADU (MEMBENTUK SECTION LIST DENGAN AKURAT)
  const groupedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const groups = {};
    
    data.forEach(item => {
      let mkName = 'Mata Kuliah Umum / Belum Terikat';
      
      if (item.nama_mk) mkName = item.nama_mk;
      else if (item.mk_nama) mkName = item.mk_nama;
      else if (item.matakuliah) mkName = item.matakuliah;
      else if (item.mk) mkName = item.mk;
      else if (item.nama) mkName = item.nama;

      let mkCode = '';
      if (item.kode_mk) mkCode = item.kode_mk;
      else if (item.mk_kode) mkCode = item.mk_kode;
      else if (item.kode) mkCode = item.kode;

      const mkHeaderTitle = mkCode ? `${mkCode} - ${mkName}` : mkName;

      if (!groups[mkHeaderTitle]) {
        groups[mkHeaderTitle] = [];
      }
      groups[mkHeaderTitle].push(item);
    });
    
    return Object.keys(groups).map(key => ({
      title: key,
      data: groups[key]
    }));
  }, [data]);

  // ✅ FUNGSI SIMPAN & EDIT (DUAL PAYLOAD DATA AGAR BACKEND PASTI MENERIMA ID MATKUL)
  // ✅ FUNGSI SIMPAN & EDIT DENGAN SHOTGUN PAYLOAD (Anti Gagal Save)
  const handleSave = async () => {
    if (!kode || !desc) {
      setAlert({ 
        visible: true, type: 'error', 
        title: 'Lengkapi Data!', 
        message: 'Pastikan Kode dan Deskripsi CPL sudah diisi.',
        onConfirm: () => setAlert({ ...alert, visible: false })
      });
      return;
    }

    closeModal();
    setIsLoading(true);

    try {
      // Pastikan ID Mata Kuliah benar-benar tertangkap dari state
      const targetMkId = selectedMk ? (selectedMk.id || selectedMk.mk_id || selectedMk.id_mk) : null;
      
      // 🎯 SHOTGUN PAYLOAD: Kita kirimkan SEMUA kemungkinan nama field ke backend
      const payload = { 
        kode_cpl: kode, 
        kode: kode, // Cadangan
        prodi_id: currentProdiId, 
        deskripsi: desc,
        desc: desc, // Cadangan
        is_active: true,

        // --- VARIASI NAMA FIELD MATA KULIAH (Pasti salah satu nyangkut di Backend) ---
        mk_id: targetMkId,
        id_mk: targetMkId, 
        id_matakuliah: targetMkId,
        mata_kuliah_id: targetMkId,
        matakuliah_id: targetMkId,
        mata_kuliah: targetMkId,
        
        // --- JIKA BACKEND MENGGUNAKAN RELASI MANY-TO-MANY (ARRAY) ---
        mk_ids: targetMkId ? [targetMkId] : [],
        mata_kuliah_ids: targetMkId ? [targetMkId] : []
      };

      if (editId) {
        await cplApi.update(editId, payload);
        setAlert({ 
          visible: true, type: 'success', 
          title: 'Berhasil!', 
          message: 'Data CPL berhasil diperbarui.',
          onConfirm: () => setAlert({ ...alert, visible: false })
        });
      } else {
        await cplApi.create(payload);
        setAlert({ 
          visible: true, type: 'success', 
          title: 'Berhasil!', 
          message: 'Data CPL baru berhasil disimpan.',
          onConfirm: () => setAlert({ ...alert, visible: false })
        });
      }
      
      // Refresh data agar list terbaru langsung ditarik dari database
      fetchData();
    } catch (error) {
      setAlert({ 
        visible: true, type: 'error', 
        title: 'Gagal', 
        message: error.message || 'Terjadi kesalahan saat menyimpan data CPL.',
        onConfirm: () => setAlert({ ...alert, visible: false })
      });
      setIsLoading(false);
    }
  };

  const handleOpenEdit = () => {
    setDetailVisible(false); 
    setKode(selectedCpl.kode_cpl || selectedCpl.kode || '');
    setDesc(selectedCpl.deskripsi || selectedCpl.desc || '');
    setEditId(selectedCpl.id || selectedCpl.cpl_id);
    
    const currentMkId = selectedCpl.mk_id || selectedCpl.id_mk || selectedCpl.id_matakuliah;
    const currentMkName = selectedCpl.nama_mk || selectedCpl.mk_nama || selectedCpl.mk;
    const matchedMk = mkOptions.find(o => o.id == currentMkId || o.nama_mk === currentMkName);
    setSelectedMk(matchedMk || null);

    setTimeout(() => { setModalVisible(true); }, 300);
  };

  const closeModal = () => {
    setModalVisible(false);
    setKode(''); 
    setSelectedMk(null);
    setDesc('');
    setEditId(null);
    setPickerVisible(false);
  };

  const renderItem = ({ item }) => {
    const kodeText = item.kode_cpl || item.kode || 'CPL';
    const descText = item.deskripsi || item.desc || item.nama_cpl || 'Tidak ada deskripsi';
    
    let mkText = 'Mata Kuliah Umum';
    if (item.nama_mk) mkText = item.nama_mk;
    else if (item.mk_nama) mkText = item.mk_nama;
    else if (item.mk) mkText = item.mk;
    else if (item.nama) mkText = item.nama;

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => {
          setSelectedCpl({ ...item, kode: kodeText, desc: descText, mk: mkText });
          setDetailVisible(true);
        }}
      >
        <View style={styles.cardAvatar}>
          <Text style={styles.avatarText}>TI</Text> 
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{kodeText}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>{descText}</Text>
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
    <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.10 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Program Studi & CPL</Text>
          <Text style={styles.headerSubtitle}>Kelola Matriks Capaian Program Studi</Text>
        </View>
      </View>

      {isLoading ? (
        <LoadingState message="Memproses data CPL..." color={BASE.primary} />
      ) : (
        <SectionList 
          sections={groupedData} 
          keyExtractor={item => (item.id || item.cpl_id || Math.random()).toString()} 
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContainer} 
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <EmptyState 
              icon="folder-open-outline" 
              message="Belum ada data CPL."
            />
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#212121" />
      </TouchableOpacity>

      {/* MODAL FORM TAMBAH/EDIT CPL */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); closeModal(); }}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContentLucu}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitleLucu}>{editId ? 'Edit CPL' : 'Tambah CPL Baru'}</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="barcode-outline" size={20} color={BASE.primary} style={styles.inputIcon} />
              <TextInput 
                style={styles.inputLucu} 
                placeholder="Kode CPL (Contoh: CPL-05)" 
                placeholderTextColor={BASE.textMuted}
                value={kode} 
                onChangeText={setKode} 
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="school-outline" size={20} color={BASE.primary} style={styles.inputIcon} />
              <TextInput 
                style={[styles.inputLucu, { color: BASE.textMuted }]}
                placeholderTextColor={BASE.textMuted}
                value={adminProdiName} 
                editable={false} 
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <View style={styles.inputContainerDropdown}>
                <Ionicons name="library-outline" size={20} color={BASE.primary} style={styles.inputIcon} />
                <TouchableOpacity 
                  style={styles.dropdownTrigger} 
                  onPress={() => { Keyboard.dismiss(); setPickerVisible(true); }}
                >
                  <Text style={[styles.dropdownValue, !selectedMk && {color: BASE.textMuted}]} numberOfLines={1}>
                    {selectedMk ? `${selectedMk.kode_mk || ''} - ${selectedMk.nama_mk || ''}`.replace(/^- | -$/, '') : 'Pilih Mata Kuliah'}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={20} color={BASE.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="create-outline" size={20} color={BASE.primary} style={[styles.inputIcon, {marginTop: 15}]} />
              <TextInput 
                style={[styles.inputLucu, styles.textAreaLucu]} 
                placeholder="Deskripsi CPL" 
                placeholderTextColor={BASE.textMuted}
                value={desc} 
                onChangeText={setDesc} 
                multiline 
                numberOfLines={4}
              />
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

      {/* ✅ PICKER MODAL - MATA KULIAH */}
      <PickerModal
        visible={pickerVisible}
        title="Pilih Mata Kuliah"
        data={mkOptions.map(item => ({
          id: item.id || item.mk_id,
          label: `${item.kode_mk || ''} - ${item.nama_mk || ''}`.replace(/^- | -$/, ''),
          ...item
        }))}
        selectedId={selectedMk?.id || selectedMk?.mk_id}
        onSelect={(item) => {
          setSelectedMk(item);
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

      {/* --- MODAL POP-UP DETAIL CPL --- */}
      <Modal visible={detailVisible} animationType="fade" transparent onRequestClose={() => setDetailVisible(false)}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setDetailVisible(false)}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.detailBox}>
              <View style={styles.detailHeaderWrap}>
                <View style={styles.detailBadgeKode}>
                  <Text style={styles.detailBadgeText}>{selectedCpl?.kode}</Text>
                </View>
                <Text style={styles.detailTitle}>{selectedCpl?.mk}</Text>
              </View>
              
              <View style={styles.detailDivider} />
              
              <ScrollView style={styles.descScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.descLabel}>Deskripsi CPL :</Text>
                <Text style={styles.descText}>{selectedCpl?.desc}</Text>
              </ScrollView>
              
              <View style={styles.detailButtonRowSingle}>
                <TouchableOpacity 
                  style={[styles.btnSubmitFit, { flex: 0, paddingHorizontal: 25, paddingVertical: 10 }]} 
                  onPress={handleOpenEdit} 
                  activeOpacity={0.8}
                >
                  <Text style={[styles.btnSubmitTextFit, { fontSize: 14 }]}>Edit</Text>
                </TouchableOpacity>
              </View>
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
    alignItems: 'flex-start', 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
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
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 3 
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
  avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: BASE.textMain },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain, marginBottom: 4 },
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: BASE.textMuted, lineHeight: 18, paddingRight: 10 },
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
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5 
  },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'flex-end' },
  modalContentLucu: { 
    backgroundColor: BASE.surface, 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    padding: 24, 
    paddingTop: 15, 
    paddingBottom: 40, 
    elevation: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -5 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 10 
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
  textAreaContainer: { alignItems: 'flex-start' },
  inputIcon: { marginRight: 10 },
  inputLucu: { flex: 1, paddingVertical: 15, fontFamily: 'Urbanist-Regular', fontSize: 15, color: BASE.textMain },
  textAreaLucu: { height: 100, textAlignVertical: 'top', paddingTop: 15 },
  
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15 },
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
    elevation: 3, 
    shadowColor: BASE.primary, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 3 
  },
  btnSubmitTextFit: { color: BASE.surface, fontFamily: 'Urbanist-Bold', fontSize: 15 },

  detailBox: { 
    backgroundColor: BASE.surface, 
    borderRadius: 35, 
    padding: 24, 
    width: '85%', 
    maxHeight: '75%', 
    alignItems: 'center', 
    elevation: 20 
  },
  detailHeaderWrap: { alignItems: 'center', width: '100%' },
  detailBadgeKode: { backgroundColor: THEME.secondary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 10 },
  detailBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: BASE.textMain },
  detailTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: BASE.textMain, textAlign: 'center', marginBottom: 6 },
  detailDivider: { width: '100%', height: 1, backgroundColor: BASE.border, marginVertical: 16 },
  descScroll: { width: '100%', marginBottom: 10 },
  descLabel: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: BASE.textMain, marginBottom: 6 },
  descText: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: BASE.textMuted, lineHeight: 22, textAlign: 'justify' },
  detailButtonRowSingle: { width: '100%', alignItems: 'flex-end', marginTop: 10 },
});