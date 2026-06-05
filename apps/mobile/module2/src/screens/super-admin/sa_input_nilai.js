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
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { nilaiApi, prodiApi, kelasApi, cplApi, subCpmkApi, mkCplApi } from '../../services/api';

const THEME_COLOR = '#cad4ed'; 
const PRIMARY_BLUE = '#577590';
const DANGER_COLOR = '#ef4444';
const WARNING_COLOR = '#f59e0b';
const DISABLED_COLOR = '#F1F5F9';

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

  // 1. TARIK DATA AWAL (NILAI, PRODI, DAN MASTER MATKUL)
  useEffect(() => {
    fetchNilaiMahasiswa();
    fetchInitialData();
  }, []);

  const fetchNilaiMahasiswa = () => {
    setIsLoading(true);
    nilaiApi.getAll()
      .then(result => {
        const fetchedData = result?.data || result || [];
        const normalizedData = fetchedData.map(item => ({
          ...item,
          id: item.id || item.nilai_id || Math.random().toString(),
          nama: item.nama || item.nama_mahasiswa || 'Mahasiswa',
          nim: item.nim || item.mahasiswa_nim || '-',
          nilai: item.nilai !== undefined ? item.nilai : (item.score || 0),
          prodi: item.prodi || item.nama_prodi || 'Umum',
          mk: item.nama_mk || item.mk || item.mata_kuliah || 'Mata Kuliah',
          cpl: item.kode_cpl || item.cpl || '-',
          subcpmk: item.kode_sub_cpmk || item.subcpmk || item.kode_subcpmk || '-',
          tanggal_input: formatTanggal(item.input_at || item.created_at || item.tanggal)
        }));
        setData(normalizedData);
      })
      .catch(() => Alert.alert("Error", "Gagal mengambil data nilai dari server."))
      .finally(() => setIsLoading(false));
  };

  const fetchInitialData = async () => {
    try {
      const [resProdi, resKelas] = await Promise.all([
        prodiApi.getAll(),
        // Gunakan kelasApi.getAll() — endpoint /kelas yang sudah ada di api.js
        // (mahasiswaApi.getAllKelas() identik tapi sudah ada di kelasApi)
        kelasApi.getAll(),
      ]);
      
      const prodiData = resProdi?.data || resProdi || [];
      const kelasData = resKelas?.data || resKelas || [];
      
      setProdiList(prodiData.map(p => ({ id: p.id || p.prodi_id, label: p.nama_prodi || p.nama })));

      // Kelas join dengan MK: response dari /kelas memuat mk_id + nama_mk (sesuai view kelas JOIN mata_kuliah)
      setMasterMkList(kelasData.map(k => ({ 
        id: k.mk_id || k.id,           // gunakan mk_id agar sesuai foreign key di tabel kelas
        kelas_id: k.id,                // simpan kelas_id terpisah bila dibutuhkan
        label: k.nama_mk || k.mata_kuliah || k.mk || k.nama_kelas || '-',
        prodi_id: k.prodi_id,
      })));
    } catch (error) {
      console.error('Gagal menarik data awal:', error);
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
      setMkList(filteredMks);

    } else if (dropdownType === 'mk') {
      setSelectedMk(item);
      // Reset child filters (CPL, Sub-CPMK)
      setSelectedCpl(null); 
      setSelectedSub(null);
      setSubList([]);
      
      // Tarik CPL berdasarkan Matkul yang dipilih (Memanfaatkan tabel mk_cpl)
      try {
        const mkCplRes = await mkCplApi.getByMk(item.id);
        const mkCplData = mkCplRes?.data || mkCplRes || [];
        
        // mkCplData berisi baris dari tabel mk_cpl: { id (mk_cpl_id), cpl_id, kode_cpl, bobot, ... }
        // Simpan mk_cpl_id (= id) agar fetch sub_cpmk bisa gunakan getByMkCpl(mk_cpl_id)
        setCplList(mkCplData.map(c => ({ 
          id:         c.cpl_id || (c.cpl && c.cpl.id), 
          mk_cpl_id:  c.id,       // id baris mk_cpl — dibutuhkan untuk sub_cpmk
          label:      c.kode_cpl || (c.cpl && c.cpl.kode_cpl) || `CPL-${c.cpl_id}`,
        })));
      } catch (error) { 
        console.error('Gagal tarik CPL dari Matkul', error); 
      }

    } else if (dropdownType === 'cpl') {
      setSelectedCpl(item);
      // Reset child filter (Sub-CPMK)
      setSelectedSub(null);
      
      // Sub-CPMK di DB terhubung ke mk_cpl_id (bukan langsung cpl_id).
      // item.mk_cpl_id dikirim backend saat getByMk (kolom id dari tabel mk_cpl).
      const mkCplId = item.mk_cpl_id || item.id;
      try {
        const subRes = await subCpmkApi.getByMkCpl(mkCplId);
        const subData = subRes?.data || subRes || [];
        setSubList(subData.map(s => ({ 
          id: s.id || s.sub_cpmk_id, 
          label: s.kode_sub_cpmk || s.kode_subcpmk,
        })));
      } catch (error) { 
        console.error('Gagal tarik Sub-CPMK dari mk_cpl', error); 
      }

    } else if (dropdownType === 'sub') {
      setSelectedSub(item);
    }
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
    <View style={styles.card}>
      <View style={styles.cardAvatar}>
        <Ionicons name="document-text" size={24} color={PRIMARY_BLUE} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.nama} <Text style={styles.nimText}>• {item.nim}</Text></Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{item.mk} • {item.cpl} • {item.subcpmk}</Text>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-clear-outline" size={12} color="#94A3B8" />
          <Text style={styles.dateText}>Prodi {item.prodi} • Diinput: {item.tanggal_input}</Text>
        </View>
      </View>
      <View style={styles.actionContainer}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>{item.nilai}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => Alert.alert("Edit", "Fitur Edit")} style={styles.btnIcon}>
            <Ionicons name="create" size={18} color={WARNING_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Hapus", item.id)} style={styles.btnIcon}>
            <Ionicons name="trash" size={18} color={DANGER_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    width: 44, height: 44, borderRadius: 14, backgroundColor: THEME_COLOR, 
    justifyContent: 'center', alignItems: 'center', marginRight: 14 
  },
  cardContent: { flex: 1, paddingRight: 8 },
  cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: '#212121', marginBottom: 2 },
  nimText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#94A3B8' }, 
  cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#64748B', marginBottom: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#94A3B8', marginLeft: 4 },
  
  actionContainer: { alignItems: 'center', justifyContent: 'center' },
  badgeWrap: { backgroundColor: PRIMARY_BLUE, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  badgeText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 13 },
  actionButtons: { flexDirection: 'row', gap: 6 },
  btnIcon: { padding: 4 },

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
  emptyModalText: { textAlign: 'center', fontFamily: 'Urbanist-Medium', color: '#94A3B8', marginTop: 20 }
});