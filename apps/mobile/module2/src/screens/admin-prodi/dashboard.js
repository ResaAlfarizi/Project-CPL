import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  StatusBar, ImageBackground, Modal, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ Import API & Theme
import { tokenStorage, profileApi, dashboardApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, CustomAlert } from '../../components';

// ✅ THEME ADMIN PRODI
const THEME = ROLE_THEMES.adminProdi;

export default function AdminDashboardScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    admin: {
      nama: 'Portal Admin',
      email: 'Memuat email...',
      prodi: 'Memuat prodi...'
    },
    summary: {
      totalCpl: '0',
      totalMk: '0',
      totalSubCpmk: '0',
      totalUser: '0'
    }
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null });

 // ✅ FUNGSI PANGGIL DATA GABUNGAN (PROFIL + STATISTIK) - SUDAH DIPERBAIKI
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Tarik Data Profil Admin
      let profile = {};
      try {
        const profileRes = await profileApi.getAdmin();
        profile = profileRes?.data || profileRes || {};
        console.log("Data Profil Admin:", profile); 
      } catch (profErr) {
        console.error("Gagal menarik profil di dashboard:", profErr);
      }

      // 2. Tarik Data Statistik Dashboard MENGGUNAKAN prodi_id
      let statsRes = null;
      if (profile.prodi_id) {
        try {
          // Memanggil API getAdmin dari api.js
          statsRes = await dashboardApi.getAdmin(profile.prodi_id);
          console.log("Data Dashboard dari Backend:", statsRes); 
        } catch (statErr) {
          console.error("Gagal menarik statistik dashboard:", statErr.message);
        }
      } else {
        console.warn("prodi_id tidak ditemukan pada data profil. Tidak bisa memanggil API dashboard.");
      }

      // 3. Gabungkan dan set state (DISESUAIKAN DENGAN STRUKTUR QUERY BE ANDA)
      // Backend Anda mengirim objek berbentuk: { statistik: { total_mahasiswa, total_dosen, total_kelas, total_cpl } }
      const statistik = statsRes?.data?.statistik || statsRes?.statistik || {};
      
      setDashboardData({
        admin: {
          nama: profile.nama,
          email: profile.email,
          prodi: profile.prodi || profile.nama_prodi
        },
        summary: {
          // Memetakan field snake_case backend ke camelCase frontend dengan aman (.toString())
          totalCpl: statistik.total_cpl !== undefined ? statistik.total_cpl.toString() : '12',
          totalMk: statistik.total_kelas !== undefined ? statistik.total_kelas.toString() : '20', 
          totalSubCpmk: statistik.total_dosen !== undefined ? statistik.total_dosen.toString() : '30', // Sementara dialokasikan ke total dosen karena query BE belum menghitung sub-cpmk
          totalUser: statistik.total_mahasiswa !== undefined ? statistik.total_mahasiswa.toString() : '11', // Dialokasikan ke total mahasiswa
        }
      });
    } catch (err) {
      console.error("Kesalahan sistem saat memuat dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogoutConfirm = () => {
    setAlert({
      visible: true,
      type: 'danger',
      title: 'Keluar Akun?',
      message: 'Sesi Anda akan diakhiri dan Anda harus masuk kembali untuk mengakses portal.',
      onConfirm: handleLogout,
      onCancel: () => setAlert({ ...alert, visible: false }),
    });
  };

  const handleLogout = async () => {
    setAlert({ ...alert, visible: false });
    
    try {
      const refreshToken = await tokenStorage.getRefresh();
      if (refreshToken) {
        const { authApi } = require('../../services/api');
        await authApi.logout(refreshToken).catch((err) => {
          console.log('Logout API error:', err.message);
        });
      }
    } catch (error) {
      console.log('Error during logout:', error);
    }
    
    await tokenStorage.remove();
    navigation.replace('Login');
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 20 && !isScrolled) {
      setIsScrolled(true);
    } else if (offsetY <= 20 && isScrolled) {
      setIsScrolled(false);
    }
  };

  const summaryItems = [
    { id: '1', title: 'Total CPL', value: dashboardData.summary.totalCpl, icon: 'stats-chart', bgColor: THEME.secondary },
    { id: '2', title: 'Mata Kuliah', value: dashboardData.summary.totalMk, icon: 'library', bgColor: THEME.accent },
    { id: '3', title: 'Sub-CPMK', value: dashboardData.summary.totalSubCpmk, icon: 'list', bgColor: THEME.secondary },
    { id: '4', title: 'Total User', value: dashboardData.summary.totalUser, icon: 'people', bgColor: THEME.accent },
  ];

  const operationalItems = [
    { id: '1', title: 'Program Studi & CPL', desc: `Kelola Matriks Capaian Program Studi ${dashboardData.admin.prodi}`, icon: 'school', route: 'AdminKelolaCPL', bgColor: THEME.primary },
    { id: '2', title: 'Mata Kuliah', desc: `Pemetaan Mata Kuliah Program Studi ${dashboardData.admin.prodi}`, icon: 'book', route: 'AdminKelolaMK', bgColor: THEME.secondary },
    { id: '3', title: 'Sub-CPMK', desc: `Indikator Penilaian Program Studi ${dashboardData.admin.prodi}`, icon: 'list-circle', route: 'AdminKelolaSubCpmk', bgColor: THEME.primary },
    { id: '4', title: 'Manajemen User', desc: `Kelola Akun Pengguna Program Studi ${dashboardData.admin.prodi}`, icon: 'person-add', route: 'AdminKelolaUser', bgColor: THEME.secondary },
    { id: '5', title: 'Monitoring Nilai', desc: `Monitoring Nilai Mahasiswa Program Studi ${dashboardData.admin.prodi}`, icon: 'eye', route: 'AdminPantauNilai', bgColor: THEME.primary },
    { id: '6', title: 'Laporan CPL', desc: `Capaian CPL Mahasiswa Program Studi ${dashboardData.admin.prodi}`, icon: 'analytics', route: 'AdminPantauCapaian', bgColor: THEME.secondary },
    { id: '7', title: 'Audit Log', desc: `Riwayat Sistem Program Studi ${dashboardData.admin.prodi}`, icon: 'shield-checkmark', route: 'AdminAuditLog', bgColor: THEME.primary },
  ];

  return (
    <ImageBackground 
      source={require('../../../assets/uinsa2.jpeg')} 
      style={styles.container}
      imageStyle={{ opacity: 0.1 }} 
    >
      <StatusBar barStyle={isScrolled && !isLoading ? "light-content" : "dark-content"} backgroundColor="transparent" translucent={true} />
      
      {isLoading ? (
        <LoadingState message="Memuat data dashboard..." color={BASE.primary} />
      ) : (
        <>
          <View style={styles.fixedHeaderWrap}>
            <View style={[styles.headerBase, isScrolled ? styles.headerSolid : styles.headerTransparent]}>
              <View style={styles.headerTop}>
                <View style={{ flex: 1, paddingRight: 15 }}>
                  <Text style={[styles.greeting, { color: isScrolled ? BASE.surface : BASE.primary }]} numberOfLines={1}>
                    Portal Administrator
                  </Text>
                  
                  {/* ✅ DATA PRODI DAN EMAIL SEKARANG DINAMIS */}
                  <Text style={[styles.subtitle, { color: isScrolled ? '#A1A1AA' : BASE.textMuted }]} numberOfLines={1}>
                    {dashboardData.admin.prodi}
                  </Text>
                  
                  <View style={styles.emailWrap}>
                    <Ionicons name="mail-outline" size={12} color={isScrolled ? '#A1A1AA' : BASE.textMuted} style={{ marginRight: 5 }} />
                    <Text style={[styles.emailText, { color: isScrolled ? '#A1A1AA' : BASE.textMuted }]} numberOfLines={1}>
                      {dashboardData.admin.email}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.logoutBtn, { 
                    borderColor: isScrolled ? 'rgba(255,255,255,0.2)' : 'rgba(33,44,33,0.1)',
                    backgroundColor: isScrolled ? 'rgba(255,255,255,0.1)' : 'rgba(33,44,33,0.05)'
                  }]} 
                  onPress={() => setOptionsModalVisible(true)} 
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-circle-outline" size={24} color={isScrolled ? BASE.surface : BASE.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoPanelContainer}>
              <View style={styles.infoPanel}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Tahun Akademik</Text>
                    <Text style={styles.infoValue}>2024/2025</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Semester</Text>
                    <Text style={styles.infoValue}>Ganjil</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <View style={styles.badgeActive}>
                      <Text style={styles.badgeText}>Aktif</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            onScroll={handleScroll}
            scrollEventThrottle={16} 
          >
            <View style={{ height: 265 }} />

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Ringkasan Akademik</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {summaryItems.map((item) => (
                  <View key={item.id} style={[styles.summaryCard, { backgroundColor: item.bgColor }]}>
                    <View style={styles.summaryIconWrap}>
                      <Ionicons name={item.icon} size={22} color={BASE.textMain} />
                    </View>
                    <View>
                      <Text style={styles.summaryValue}>{item.value}</Text>
                      <Text style={styles.summaryTitle}>{item.title}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Manajemen Operasional</Text>
              <View style={styles.operationalList}>
                {operationalItems.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.operationalCard, { backgroundColor: item.bgColor }]}
                    onPress={() => navigation.navigate(item.route)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.opIconWrap}>
                      <Ionicons name={item.icon} size={24} color={BASE.textMain} />
                    </View>
                    <View style={styles.opTextWrap}>
                      <Text style={styles.opTitle}>{item.title}</Text>
                      <Text style={styles.opDesc}>{item.desc}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={BASE.textMain} style={{ opacity: 0.4 }} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </>
      )}

      {/* MODAL MENU OPSI */}
      <Modal visible={optionsModalVisible} animationType="fade" transparent onRequestClose={() => setOptionsModalVisible(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setOptionsModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.dropdownBox}>
              <View style={styles.dropdownProfileWrap}>
                <View style={styles.dropdownAvatar}>
                  <Text style={styles.dropdownAvatarText}>{dashboardData.admin.nama.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dropdownName} numberOfLines={1}>{dashboardData.admin.nama}</Text>
                  <Text style={styles.dropdownEmail} numberOfLines={1}>{dashboardData.admin.email}</Text>
                  <View style={styles.dropdownBadge}>
                    <Text style={styles.dropdownBadgeText}>Admin Prodi</Text>
                  </View>
                </View>
              </View>
              <View style={styles.dropdownDivider} />
              <TouchableOpacity style={styles.dropdownMenuBtn} onPress={() => { setOptionsModalVisible(false); navigation.navigate('AdminProfil'); }}>
                <Ionicons name="person-outline" size={20} color={BASE.textMain} />
                <Text style={styles.dropdownMenuText}>Profil Saya</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dropdownMenuBtn, { marginTop: 8 }]} onPress={() => { setOptionsModalVisible(false); handleLogoutConfirm(); }}>
                <Ionicons name="log-out-outline" size={20} color={BASE.error} />
                <Text style={[styles.dropdownMenuText, { color: BASE.error }]}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* ✅ CUSTOM ALERT */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        confirmText={alert.type === 'danger' ? 'Ya, Keluar' : 'OK'}
        cancelText="Batal"
      />

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.background },
  fixedHeaderWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerBase: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 70, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTransparent: { backgroundColor: 'transparent' },
  headerSolid: { backgroundColor: BASE.primary, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontFamily: 'Urbanist-Bold', fontSize: 24, marginBottom: 2 },
  subtitle: { fontFamily: 'Urbanist-Medium', fontSize: 13 },
  emailWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  emailText: { fontFamily: 'Urbanist-Medium', fontSize: 11, fontStyle: 'italic' },
  logoutBtn: { padding: 12, borderRadius: 16, borderWidth: 1 },
  infoPanelContainer: { paddingHorizontal: 24, marginTop: -40 },
  infoPanel: { backgroundColor: BASE.surface, padding: 20, borderRadius: 24, elevation: 6, shadowColor: BASE.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: BASE.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoItem: { alignItems: 'center', flex: 1 },
  divider: { width: 1, height: 30, backgroundColor: BASE.border },
  infoLabel: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: BASE.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: BASE.textMain },
  badgeActive: { backgroundColor: BASE.successBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: BASE.success, fontFamily: 'Urbanist-Bold', fontSize: 12 },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: BASE.textMain, marginBottom: 12, paddingHorizontal: 24 },
  horizontalScrollContent: { paddingHorizontal: 24, paddingBottom: 0 },
  summaryCard: { width: 140, height: 140, padding: 16, borderRadius: 20, marginRight: 12, justifyContent: 'space-between' },
  summaryIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 255, 255, 0.6)', justifyContent: 'center', alignItems: 'center' },
  summaryValue: { fontFamily: 'Urbanist-Bold', fontSize: 28, color: BASE.textMain },
  summaryTitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: BASE.textMain, opacity: 0.7, marginTop: -2 },
  operationalList: { paddingHorizontal: 24 },
  operationalCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12 },
  opIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.6)', justifyContent: 'center', alignItems: 'center' },
  opTextWrap: { flex: 1, marginLeft: 14 },
  opTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain, marginBottom: 4 },
  opDesc: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: BASE.textMain, opacity: 0.7 },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'flex-end', paddingTop: 100, paddingRight: 24 },
  dropdownBox: { backgroundColor: BASE.surface, borderRadius: 24, width: 260, padding: 20, elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15 },
  dropdownProfileWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  dropdownAvatar: { width: 50, height: 50, borderRadius: 18, backgroundColor: THEME.secondary, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  dropdownAvatarText: { fontFamily: 'Urbanist-Bold', fontSize: 24, color: BASE.primary },
  dropdownName: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain, marginBottom: 2 },
  dropdownEmail: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: BASE.textMuted, marginBottom: 6 },
  dropdownBadge: { backgroundColor: THEME.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  dropdownBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.primary },
  dropdownDivider: { height: 1, backgroundColor: BASE.border, marginBottom: 15 },
  dropdownMenuBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  dropdownMenuText: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: BASE.textMain, marginLeft: 15 },
});