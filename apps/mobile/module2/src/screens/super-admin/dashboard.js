import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  StatusBar, ImageBackground, Modal, TouchableWithoutFeedback, 
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { tokenStorage, dashboardApi, profileApi, auditLogApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, CustomAlert } from '../../components';

// ✅ THEME SUPERADMIN (Lavender/Light Blue)
const THEME = ROLE_THEMES.superadmin;

// ✅ Local color mapping untuk compatibility
const COLORS = {
  primary: BASE.primary,
  background: BASE.background,
  surface: BASE.surface,
  textMain: BASE.textMain,
  textMuted: BASE.textMuted,
  border: BASE.border,
  aliceBlue: THEME.primary,      // '#cdddf4'
  honeydew: '#dcead7',
  vanilla: '#f2f3cb',
  pinky: '#f4d6d6',
  danger: BASE.error,
};

export default function SuperAdminDashboardScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState('Portal Super Admin');
  const [adminEmail, setAdminEmail] = useState('Memuat email...'); 
  const [summary, setSummary] = useState({
    totalProdi: 0,      
    totalDosen: 0,    
    totalMahasiswa: 0,
    totalCPL: 0,        
    totalMK: 0,
    totalPemetaan: 0,
    totalSubCpmk: 0,
  });
  
  const [recentLogs, setRecentLogs] = useState([]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        try {
          const profileRes = await profileApi.getMyProfile(); 
          const profile = profileRes?.data || profileRes || {};
          setAdminName('Portal Super Admin');
          setAdminEmail(profile.email || 'superadmin@kampus.ac.id');
        } catch (profErr) {
          console.error("Gagal menarik profil super admin:", profErr);
        }

        try {
          const statsRes = await dashboardApi.getSuperAdmin();
          const statistik = statsRes?.data?.statistik || statsRes?.statistik || statsRes?.data || {};

          setSummary({
            totalProdi:     statistik.total_prodi      ?? 3,      
            totalDosen:     statistik.total_dosen      ?? 2,
            totalMahasiswa: statistik.total_mahasiswa  ?? 45,
            totalCPL:       statistik.total_cpl        ?? 9,        
            totalMK:        statistik.total_mk         ?? 9,
            totalPemetaan:  statistik.total_mk_cpl     ?? 27,
            totalSubCpmk:   statistik.total_sub_cpmk   ?? 81,
          });
        } catch (statErr) {
          console.warn("Gagal menarik statistik, gunakan fallback:", statErr.message);
          setSummary({
            totalProdi: 3, totalDosen: 2, totalMahasiswa: 45,
            totalCPL: 9, totalMK: 9, totalPemetaan: 27, totalSubCpmk: 81,
          });
        }

        try {
          const logRes = await auditLogApi.getAll();
          const logData = logRes?.data || logRes || [];
          const logs = Array.isArray(logData) ? logData : [];
          const mapped = logs.slice(0, 4).map((item, idx) => ({
            id:       item.id?.toString() || idx.toString(),
            user:     item.user_name  || item.email || item.user_email || 'Unknown',
            action:   item.event      || item.event_type || '-',
            resource: item.detail?.resource || item.user_agent || '-',
            status:   item.status
              || ((item.event_type?.includes('failed') || item.event_type?.includes('locked')) ? 'FAILED' : 'SUCCESS'),
          }));
          if (mapped.length > 0) setRecentLogs(mapped);
        } catch (logErr) {
          console.warn("Gagal menarik audit log untuk dashboard:", logErr.message);
        }

      } catch (error) {
        console.error("Kesalahan sistem saat memuat dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    try {
      const refreshToken = await tokenStorage.getRefresh();
      if (refreshToken) {
        const { authApi } = require('../../services/api');
        await authApi.logout(refreshToken).catch((err) => {
          console.log('Logout API error:', err.message);
        });
      }
      if (tokenStorage?.remove) await tokenStorage.remove();
    } catch (e) { console.error("Error removing token", e); }
    navigation.replace('Login');
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsScrolled(offsetY > 20);
  };

  const summaryItems = [
    { id: '1', title: 'Program Studi',  value: summary.totalProdi.toString(),     icon: 'business',     bgColor: COLORS.aliceBlue },
    { id: '2', title: 'CPL Terdaftar',  value: summary.totalCPL.toString(),       icon: 'analytics',    bgColor: COLORS.aliceBlue },
    { id: '3', title: 'Dosen',          value: summary.totalDosen.toString(),      icon: 'person',       bgColor: COLORS.aliceBlue },
    { id: '4', title: 'Mahasiswa',      value: summary.totalMahasiswa.toString(),  icon: 'people',       bgColor: COLORS.aliceBlue },
    { id: '5', title: 'Mata Kuliah',    value: summary.totalMK.toString(),         icon: 'library',      bgColor: COLORS.aliceBlue },
    { id: '6', title: 'Pemetaan MK-CPL',value: summary.totalPemetaan.toString(),   icon: 'git-network',  bgColor: COLORS.aliceBlue },
    { id: '7', title: 'Sub-CPMK',       value: summary.totalSubCpmk.toString(),    icon: 'list-circle',  bgColor: COLORS.aliceBlue },
  ];

  const menuItems = [
    { id: '1', title: 'Program Studi',    desc: 'Kelola data Program Studi',               icon: 'business',       route: 'SA_KelolaProdi' },
    { id: '2', title: 'Kelola CPL',    desc: 'Kelola data CPL Program Studi',               icon: 'business',       route: 'SA_KelolaCPL' },
    { id: '3', title: 'Dosen & Mahasiswa',desc: 'Daftarkan & kelola akun civitas',        icon: 'person-add',     route: 'SAMahasiswaDosen' },
    { id: '4', title: 'Mata Kuliah',      desc: 'Master data kurikulum MK',               icon: 'book',           route: 'SA_KelolaMK' },
    { id: '5', title: 'Pemetaan MK-CPL',  desc: 'Hubungkan MK dengan CPL & bobot',        icon: 'git-network',    route: 'SA_PemetaanMKCPL' },
    { id: '6', title: 'Sub-CPMK',         desc: 'Indikator detail per mata kuliah',        icon: 'list-circle',    route: 'SA_KelolaSubCPMK' },
    { id: '7', title: 'Threshold',         desc: 'Atur batas nilai ambang CPL',             icon: 'options',        route: 'SA_Threshold' },
    { id: '8', title: 'Pantau Capaian',   desc: 'Pantau dan Kelola Capaian Mahasiswa',       icon: 'analytics',      route: 'SA_PantauCapaian' },
    { id: '9', title: 'Pantau Nilai',   desc: 'Kelola dan Input Nilai Mahasiswa',       icon: 'analytics',      route: 'SA_InputNilai' },
    { id: '10', title: 'Manajemen User',    desc: 'Kelola hak akses & kredensial',            icon: 'shield-half',    route: 'SA_KelolaUser' },
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
          <Text style={styles.loadingText}>Memuat pusat kontrol superadmin...</Text>
        </View>
      ) : (
        <>
          {/* HEADER FIXED */}
          <View style={styles.fixedHeaderWrap}>
            <View style={[styles.headerBase, isScrolled ? styles.headerSolid : styles.headerTransparent]}>
              <View style={styles.headerTop}>
                <View style={{ flex: 1, paddingRight: 15 }}>
                  <Text style={[styles.greeting, { color: isScrolled ? COLORS.surface : COLORS.primary }]} numberOfLines={1}>
                    {adminName}
                  </Text>
                  <Text style={[styles.subtitle, { color: isScrolled ? '#A1A1AA' : COLORS.textMuted }]} numberOfLines={1}>
                    Administrator Pusat Universitas
                  </Text>
                  <View style={styles.emailWrap}>
                    <Ionicons name="mail-outline" size={12} color={isScrolled ? '#A1A1AA' : COLORS.textMuted} style={{ marginRight: 5 }} />
                    <Text style={[styles.emailText, { color: isScrolled ? '#A1A1AA' : COLORS.textMuted }]} numberOfLines={1}>
                      {adminEmail}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.logoutBtn, { 
                    borderColor: isScrolled ? 'rgba(255,255,255,0.2)' : 'rgba(36,53,74,0.1)',
                    backgroundColor: isScrolled ? 'rgba(255,255,255,0.1)' : 'rgba(36,53,74,0.05)'
                  }]} 
                  onPress={() => setOptionsModalVisible(true)} 
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-circle-outline" size={24} color={isScrolled ? COLORS.surface : COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* INFO PANEL STATUS */}
            <View style={styles.infoPanelContainer}>
              <View style={styles.infoPanel}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Scope Wilayah</Text>
                    <Text style={styles.infoValue}>Universitas</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Server Node</Text>
                    <Text style={styles.infoValue}>Production</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Sistem Keamanan</Text>
                    <View style={styles.badgeActive}>
                      <Text style={styles.badgeText}>Enforced</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* MAIN CONTENT */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            onScroll={handleScroll}
            scrollEventThrottle={16} 
          >
            <View style={{ height: 265 }} />

            {/* 1. RINGKASAN SISTEM GLOBAL */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Ringkasan Sistem Global</Text>
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

            {/* 2. MENU KELOLA UNIVERSITAS */}
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.menuMasterBtn}
                onPress={() => setMenuExpanded(!menuExpanded)}
                activeOpacity={0.85}
              >
                <View style={styles.menuMasterLeft}>
                  <View style={styles.menuMasterIconWrap}>
                    <Ionicons name="grid" size={26} color={COLORS.surface} />
                  </View>
                  <View>
                    <Text style={styles.menuMasterTitle}>Menu Kelola Universitas</Text>
                    <Text style={styles.menuMasterSubtitle}>
                      {menuExpanded ? 'Sembunyikan menu' : `${menuItems.length} fitur tersedia`}
                    </Text>
                  </View>
                </View>
                <View style={[styles.menuChevronWrap, menuExpanded && styles.menuChevronWrapActive]}>
                  <Ionicons 
                    name={menuExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={menuExpanded ? COLORS.surface : COLORS.primary} 
                  />
                </View>
              </TouchableOpacity>

              {menuExpanded && (
                <View style={styles.menuGrid}>
                  {menuItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuGridCard}
                      onPress={() => {
                        setMenuExpanded(false);
                        navigation.navigate(item.route);
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={styles.menuGridIconWrap}>
                        <Ionicons name={item.icon} size={22} color={COLORS.primary} />
                      </View>
                      <Text style={styles.menuGridTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={styles.menuGridDesc} numberOfLines={2}>{item.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {!menuExpanded && (
                <View style={styles.shortcutRow}>
                  {menuItems.slice(0, 4).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.shortcutCard}
                      onPress={() => navigation.navigate(item.route)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.shortcutIconWrap}>
                        <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                      </View>
                      <Text style={styles.shortcutLabel} numberOfLines={2}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* 3. AKTIVITAS TERBARU */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderWrap}>
                <Text style={styles.sectionTitleStyle}>Aktivitas Terbaru</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SA_AuditLog')} style={styles.seeAllBtn}>
                  <Text style={styles.seeAllText}>Lihat Semua</Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.logCard}>
                {recentLogs.length > 0 ? (
                  recentLogs.map((log, index) => {
                    const isLast = index === recentLogs.length - 1;
                    return (
                      <View key={log.id} style={[styles.logItemRow, isLast && styles.logItemRowLast]}>
                        {/* Ikon Status dengan Background Rounded */}
                        <View style={[
                          styles.logIconWrap, 
                          { backgroundColor: log.status === 'SUCCESS' ? COLORS.honeydew : COLORS.pinky }
                        ]}>
                          <Ionicons 
                            name={log.status === 'SUCCESS' ? "shield-checkmark-outline" : "warning-outline"} 
                            size={20} 
                            color={log.status === 'SUCCESS' ? '#3B5935' : COLORS.danger} 
                          />
                        </View>
                        
                        {/* Konten Log */}
                        <View style={styles.logContent}>
                          <Text style={styles.logTextMain} numberOfLines={2}>
                            <Text style={styles.logUser}>{log.user}</Text>
                            <Text style={styles.logAction}> {log.action}</Text>
                          </Text>
                          <View style={styles.logResourceWrap}>
                            <Ionicons name="folder-open-outline" size={12} color={COLORS.textMuted} style={{marginRight: 5}} />
                            <Text style={styles.logResource} numberOfLines={1}>
                              {log.resource}
                            </Text>
                          </View>
                        </View>

                        {/* Label Status Kecil di Kanan */}
                        <View style={[
                          styles.logStatusBadge, 
                          { backgroundColor: log.status === 'SUCCESS' ? 'rgba(220, 234, 215, 0.4)' : 'rgba(244, 214, 214, 0.4)' }
                        ]}>
                          <Text style={[
                            styles.logStatusText, 
                            { color: log.status === 'SUCCESS' ? '#3B5935' : COLORS.danger }
                          ]}>
                            {log.status === 'SUCCESS' ? 'Sukses' : 'Gagal'}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyLogWrap}>
                    <Ionicons name="receipt-outline" size={32} color={COLORS.border} />
                    <Text style={styles.emptyLogText}>Belum ada aktivitas tercatat.</Text>
                  </View>
                )}
              </View>
            </View>

          </ScrollView>
        </>
      )}

      {/* MODAL OPSI (muncul saat klik ikon profil) */}
      <Modal visible={optionsModalVisible} animationType="fade" transparent onRequestClose={() => setOptionsModalVisible(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setOptionsModalVisible(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.dropdownBox}>
              {/* Info user */}
              <View style={styles.dropdownProfileWrap}>
                <View style={styles.dropdownAvatar}>
                  <Ionicons name="shield-checkmark" size={24} color={COLORS.surface} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dropdownName} numberOfLines={1}>Portal Super Admin</Text>
                  <Text style={styles.dropdownEmail} numberOfLines={1}>{adminEmail}</Text>
                  <View style={styles.dropdownBadge}>
                    <Text style={styles.dropdownBadgeText}>Superadmin</Text>
                  </View>
                </View>
              </View>
              <View style={styles.dropdownDivider} />
              {/* Keluar */}
              <TouchableOpacity
                style={styles.dropdownMenuBtn}
                activeOpacity={0.7}
                onPress={() => {
                  setOptionsModalVisible(false);
                  setTimeout(() => setLogoutModalVisible(true), 200);
                }}
              >
                <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
                <Text style={[styles.dropdownMenuText, { color: COLORS.danger }]}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* MODAL KONFIRMASI LOGOUT */}
      <Modal visible={logoutModalVisible} animationType="fade" transparent onRequestClose={() => setLogoutModalVisible(false)}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setLogoutModalVisible(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.alertBox}>
              <View style={styles.alertIconWrap}>
                <Ionicons name="log-out" size={45} color={COLORS.danger} />
              </View>
              <Text style={styles.alertTitle}>Keluar Sesi?</Text>
              <Text style={styles.alertMessage}>Akses kontrol enkripsi superadmin akan dinonaktifkan sampai Anda melakukan autentikasi ulang.</Text>
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
  infoPanel: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 24, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoItem: { alignItems: 'center', flex: 1 },
  divider: { width: 1, height: 30, backgroundColor: COLORS.border },
  infoLabel: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: COLORS.textMain },
  badgeActive: { backgroundColor: COLORS.honeydew, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#3B5935', fontFamily: 'Urbanist-Bold', fontSize: 12 },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: COLORS.textMain, marginBottom: 12, paddingHorizontal: 24 },
  horizontalScrollContent: { paddingHorizontal: 24, paddingBottom: 5 },
  summaryCard: { width: 140, height: 140, padding: 16, borderRadius: 20, marginRight: 12, justifyContent: 'space-between' },
  summaryIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255, 255, 255, 0.6)', justifyContent: 'center', alignItems: 'center' },
  summaryValue: { fontFamily: 'Urbanist-Bold', fontSize: 28, color: COLORS.textMain },
  summaryTitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: COLORS.textMain, opacity: 0.7, marginTop: -2 },

  menuMasterBtn: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  menuMasterLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuMasterIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  menuMasterTitle: { fontFamily: 'Urbanist-Bold', fontSize: 17, color: COLORS.surface, marginBottom: 3 },
  menuMasterSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  menuChevronWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  menuChevronWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  menuGrid: {
    marginHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },
  menuGridCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  menuGridIconWrap: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: COLORS.aliceBlue,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  menuGridTitle: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: COLORS.textMain, marginBottom: 4 },
  menuGridDesc: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: COLORS.textMuted, lineHeight: 15 },

  shortcutRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
  },
  shortcutIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.aliceBlue,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  shortcutLabel: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: COLORS.textMain, textAlign: 'center', lineHeight: 13 },

  // ─── STYLE AKTIVITAS TERBARU (ESTETIK & COHESIVE) ───
  sectionHeaderWrap: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    marginBottom: 14,
  },
  sectionTitleStyle: {
    fontFamily: 'Urbanist-Bold', 
    fontSize: 18, 
    color: COLORS.textMain,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.aliceBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  seeAllText: { 
    fontFamily: 'Urbanist-Bold', 
    fontSize: 12, 
    color: COLORS.primary 
  },
  logCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  logItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)', 
  },
  logItemRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  logIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logContent: {
    flex: 1,
    marginRight: 10,
  },
  logTextMain: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    color: COLORS.textMain,
    lineHeight: 18,
    marginBottom: 4,
  },
  logUser: {
    fontFamily: 'Urbanist-Bold',
    color: COLORS.primary,
  },
  logAction: {
    color: COLORS.textMain,
  },
  logResourceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logResource: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
  logStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logStatusText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  emptyLogWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyLogText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
  },

  // MODAL LOGOUT STYLES
  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '85%', alignItems: 'center', elevation: 20 },
  alertIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ffebee', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  btnCancelFit: { flex: 0.48, backgroundColor: '#f1f5f9', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  btnCancelTextFit: { color: '#64748B', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmitFit: { flex: 0.48, backgroundColor: COLORS.danger, borderRadius: 20, paddingVertical: 14, alignItems: 'center', elevation: 3 },
  btnSubmitTextFit: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },

  // DROPDOWN MODAL (ikon profil kanan atas)
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 16,
  },
  dropdownBox: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    width: 240,
    overflow: 'hidden',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  dropdownProfileWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.primary,
  },
  dropdownAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownName: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: COLORS.surface,
    marginBottom: 2,
  },
  dropdownEmail: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  dropdownBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dropdownBadgeText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 10,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  dropdownDivider: { height: 1, backgroundColor: '#F1F5F9' },
  dropdownMenuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownMenuText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: COLORS.textMain,
  },
});