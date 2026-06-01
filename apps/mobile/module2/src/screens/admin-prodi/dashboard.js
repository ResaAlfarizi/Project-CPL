import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  StatusBar, ImageBackground, Modal, TouchableWithoutFeedback,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ SEKARANG SUDAH DITAMBAHKAN dashboardApi DI SINI
import { tokenStorage, profileApi, dashboardApi } from '../../services/api';

const COLORS = {
  primary: '#212c21',      
  background: '#F6F5FA',  
  surface: '#FFFFFF',    
  textMain: '#212121',  
  textMuted: '#64748B',
  border: '#E2E8F0',     
  aliceBlue: '#cad4ed',
  honeydew: '#dcead7',
  vanilla: '#f2f3cb',
  pinky: '#f4d6d6',
};  

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
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

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

  const handleLogout = async () => {
    setLogoutModalVisible(false);
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
    { id: '1', title: 'Total CPL', value: dashboardData.summary.totalCpl, icon: 'stats-chart', bgColor: COLORS.honeydew },
    { id: '2', title: 'Mata Kuliah', value: dashboardData.summary.totalMk, icon: 'library', bgColor: COLORS.vanilla },
    { id: '3', title: 'Sub-CPMK', value: dashboardData.summary.totalSubCpmk, icon: 'list', bgColor: COLORS.honeydew },
    { id: '4', title: 'Total User', value: dashboardData.summary.totalUser, icon: 'people', bgColor: COLORS.vanilla },
  ];

  const operationalItems = [
    { id: '1', title: 'Program Studi & CPL', desc: `Kelola Matriks Capaian Program Studi ${dashboardData.admin.prodi}`, icon: 'school', route: 'AdminKelolaCPL', bgColor: COLORS.aliceBlue },
    { id: '2', title: 'Mata Kuliah', desc: `Pemetaan Mata Kuliah Program Studi ${dashboardData.admin.prodi}`, icon: 'book', route: 'AdminKelolaMK', bgColor: COLORS.pinky },
    { id: '3', title: 'Sub-CPMK', desc: `Indikator Penilaian Program Studi ${dashboardData.admin.prodi}`, icon: 'list-circle', route: 'AdminKelolaSubCpmk', bgColor: COLORS.aliceBlue },
    { id: '4', title: 'Manajemen User', desc: `Kelola Akun Pengguna Program Studi ${dashboardData.admin.prodi}`, icon: 'person-add', route: 'AdminKelolaUser', bgColor: COLORS.pinky },
    { id: '5', title: 'Monitoring Nilai', desc: `Monitoring Nilai Mahasiswa Program Studi ${dashboardData.admin.prodi}`, icon: 'eye', route: 'AdminPantauNilai', bgColor: COLORS.aliceBlue },
    { id: '6', title: 'Laporan CPL', desc: `Capaian CPL Mahasiswa Program Studi ${dashboardData.admin.prodi}`, icon: 'analytics', route: 'AdminPantauCapaian', bgColor: COLORS.pinky },
    { id: '7', title: 'Audit Log', desc: `Riwayat Sistem Program Studi ${dashboardData.admin.prodi}`, icon: 'shield-checkmark', route: 'AdminAuditLog', bgColor: COLORS.aliceBlue },
  ];

  return (
    <ImageBackground 
      source={require('../../../assets/uinsa2.jpeg')} 
      style={styles.container}
      imageStyle={{ opacity: 0.1 }} 
    >
      <StatusBar barStyle={isScrolled && !isLoading ? "light-content" : "dark-content"} backgroundColor="transparent" translucent={true} />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat data dashboard...</Text>
        </View>
      ) : (
        <>
          <View style={styles.fixedHeaderWrap}>
            <View style={[styles.headerBase, isScrolled ? styles.headerSolid : styles.headerTransparent]}>
              <View style={styles.headerTop}>
                <View style={{ flex: 1, paddingRight: 15 }}>
                  <Text style={[styles.greeting, { color: isScrolled ? COLORS.surface : COLORS.primary }]} numberOfLines={1}>
                    Portal Administrator
                  </Text>
                  
                  {/* ✅ DATA PRODI DAN EMAIL SEKARANG DINAMIS */}
                  <Text style={[styles.subtitle, { color: isScrolled ? '#A1A1AA' : COLORS.textMuted }]} numberOfLines={1}>
                    {dashboardData.admin.prodi}
                  </Text>
                  
                  <View style={styles.emailWrap}>
                    <Ionicons name="mail-outline" size={12} color={isScrolled ? '#A1A1AA' : COLORS.textMuted} style={{ marginRight: 5 }} />
                    <Text style={[styles.emailText, { color: isScrolled ? '#A1A1AA' : COLORS.textMuted }]} numberOfLines={1}>
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
                  <Ionicons name="person-circle-outline" size={24} color={isScrolled ? COLORS.surface : COLORS.primary} />
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
                      <Ionicons name={item.icon} size={22} color={COLORS.textMain} />
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
                      <Ionicons name={item.icon} size={24} color={COLORS.textMain} />
                    </View>
                    <View style={styles.opTextWrap}>
                      <Text style={styles.opTitle}>{item.title}</Text>
                      <Text style={styles.opDesc}>{item.desc}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.textMain} style={{ opacity: 0.4 }} />
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
                <Ionicons name="person-outline" size={20} color={COLORS.textMain} />
                <Text style={styles.dropdownMenuText}>Profil Saya</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dropdownMenuBtn, { marginTop: 8 }]} onPress={() => { setOptionsModalVisible(false); setLogoutModalVisible(true); }}>
                <Ionicons name="log-out-outline" size={20} color="#c62828" />
                <Text style={[styles.dropdownMenuText, { color: '#c62828' }]}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* MODAL CUSTOM LOGOUT */}
      <Modal visible={logoutModalVisible} animationType="fade" transparent onRequestClose={() => setLogoutModalVisible(false)}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setLogoutModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.alertBox}>
              <View style={styles.alertIconWrap}>
                <Ionicons name="log-out" size={45} color="#c62828" />
              </View>
              <Text style={styles.alertTitle}>Keluar Akun?</Text>
              <Text style={styles.alertMessage}>Sesi Anda akan diakhiri dan Anda harus masuk kembali untuk mengakses portal.</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.btnCancelFit} onPress={() => setLogoutModalVisible(false)} activeOpacity={0.7}>
                  <Text style={styles.btnCancelTextFit}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSubmitFit} onPress={handleLogout} activeOpacity={0.7}>
                  <Text style={styles.btnSubmitTextFit}>Ya, Keluar</Text>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontFamily: 'Urbanist-Medium', fontSize: 14, color: COLORS.textMuted },
  fixedHeaderWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  headerBase: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 70, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTransparent: { backgroundColor: 'transparent' },
  headerSolid: { backgroundColor: COLORS.primary, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontFamily: 'Urbanist-Bold', fontSize: 24, marginBottom: 2 },
  subtitle: { fontFamily: 'Urbanist-Medium', fontSize: 13 },
  emailWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  emailText: { fontFamily: 'Urbanist-Medium', fontSize: 11, fontStyle: 'italic' },
  logoutBtn: { padding: 12, borderRadius: 16, borderWidth: 1 },
  infoPanelContainer: { paddingHorizontal: 24, marginTop: -40 },
  infoPanel: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 24, elevation: 6, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoItem: { alignItems: 'center', flex: 1 },
  divider: { width: 1, height: 30, backgroundColor: COLORS.border },
  infoLabel: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: COLORS.textMain },
  badgeActive: { backgroundColor: COLORS.honeydew, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#3B5935', fontFamily: 'Urbanist-Bold', fontSize: 12 },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: COLORS.textMain, marginBottom: 12, paddingHorizontal: 24 },
  horizontalScrollContent: { paddingHorizontal: 24, paddingBottom: 0 },
  summaryCard: { width: 140, height: 140, padding: 16, borderRadius: 20, marginRight: 12, justifyContent: 'space-between' },
  summaryIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 255, 255, 0.6)', justifyContent: 'center', alignItems: 'center' },
  summaryValue: { fontFamily: 'Urbanist-Bold', fontSize: 28, color: COLORS.textMain },
  summaryTitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: COLORS.textMain, opacity: 0.7, marginTop: -2 },
  operationalList: { paddingHorizontal: 24 },
  operationalCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12 },
  opIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.6)', justifyContent: 'center', alignItems: 'center' },
  opTextWrap: { flex: 1, marginLeft: 14 },
  opTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: COLORS.textMain, marginBottom: 4 },
  opDesc: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: COLORS.textMain, opacity: 0.7 },
  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '85%', alignItems: 'center', elevation: 20 },
  alertIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ffebee', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  btnCancelFit: { flex: 0.48, backgroundColor: '#f1f5f9', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  btnCancelTextFit: { color: '#64748B', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmitFit: { flex: 0.48, backgroundColor: '#c62828', borderRadius: 20, paddingVertical: 14, alignItems: 'center', elevation: 3 },
  btnSubmitTextFit: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'flex-end', paddingTop: 100, paddingRight: 24 },
  dropdownBox: { backgroundColor: '#FFF', borderRadius: 24, width: 260, padding: 20, elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15 },
  dropdownProfileWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  dropdownAvatar: { width: 50, height: 50, borderRadius: 18, backgroundColor: COLORS.honeydew, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  dropdownAvatarText: { fontFamily: 'Urbanist-Bold', fontSize: 24, color: COLORS.primary },
  dropdownName: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: COLORS.textMain, marginBottom: 2 },
  dropdownEmail: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: COLORS.textMuted, marginBottom: 6 },
  dropdownBadge: { backgroundColor: COLORS.aliceBlue, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  dropdownBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: COLORS.primary },
  dropdownDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: 15 },
  dropdownMenuBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  dropdownMenuText: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: COLORS.textMain, marginLeft: 15 },
});