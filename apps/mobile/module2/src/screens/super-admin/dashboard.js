import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  StatusBar, ImageBackground, Modal, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#24354a',      
  background: '#F6F5FA',  
  surface: '#FFFFFF',    
  textMain: '#212121',  
  textMuted: '#64748B',
  border: '#E2E8F0',     
  blueSoft: '#a3c1e5',  
  blueStrong: '#cdddf4',
  honeydew: '#dcead7',     
  vanilla: '#f2f3cb',      
  danger: '#c62828'
};

const DB_SUMMARY = {
  totalProdi: 12,      
  totalUsers: 3450,    
  totalCPL: 184,       
  totalMK: 420,        
  serverStatus: 'Online',
  lastBackup: '02:00 AM'
};

export default function SuperAdminDashboardScreen({ navigation }) {
  const [adminEmail] = useState('root.superadmin@sistemcpl.ac.id'); 
  const [isScrolled, setIsScrolled] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsScrolled(offsetY > 20);
  };

  const handleLogout = () => {
    setLogoutModalVisible(false);
    navigation.replace('Login');
  };

  // ✅ RINGKASAN: Selang-seling Hijau dan Kuning
  const summaryItems = [
    { id: '1', title: 'Program Studi', value: DB_SUMMARY.totalProdi, icon: 'business', bgColor: COLORS.honeydew },
    { id: '2', title: 'Total User', value: '3.4K', icon: 'people', bgColor: COLORS.vanilla },
    { id: '3', title: 'Total CPL', value: DB_SUMMARY.totalCPL, icon: 'analytics', bgColor: COLORS.honeydew },
    { id: '4', title: 'Total Mata Kuliah', value: DB_SUMMARY.totalMK, icon: 'library', bgColor: COLORS.vanilla },
  ];

  // ✅ OPERASIONAL: Selang-seling Biru Strong dan Biru Soft
  const operationalItems = [
    { id: '1', title: 'Program Studi & CPL', desc: 'Kelola data master Fakultas, Prodi dan Capaian Lulusan', icon: 'business-outline', route: 'SA_KelolaProdiCPL', bgColor: COLORS.blueStrong },
    { id: '2', title: 'Mata Kuliah & Pemetaan', desc: 'Kelola daftar Mata Kuliah dan pemetaannya terhadap CPL', icon: 'library-outline', route: 'SA_KelolaMK', bgColor: COLORS.blueSoft },
    { id: '3', title: 'Sub-CPMK', desc: 'Kelola indikator penilaian Sub-CPMK', icon: 'list-circle-outline', route: 'SA_KelolaSubCPMK', bgColor: COLORS.blueStrong },
    { id: '4', title: 'Input Nilai Sub-CPMK', desc: 'Manajemen formasi dan hasil input nilai mahasiswa', icon: 'create-outline', route: 'SA_InputNilai', bgColor: COLORS.blueSoft },
    { id: '5', title: 'Capaian CPL Mahasiswa', desc: 'Monitoring agregat nilai dan laporan capaian CPL', icon: 'bar-chart-outline', route: 'SA_PantauCapaian', bgColor: COLORS.blueStrong },
    { id: '6', title: 'Manajemen User', desc: 'Kelola hak akses otentikasi Dosen, Mahasiswa & Admin', icon: 'people-outline', route: 'SA_KelolaUser', bgColor: COLORS.blueSoft },
    { id: '7', title: 'Audit Log', desc: 'Log aktivitas sistem dan riwayat keamanan', icon: 'terminal-outline', route: 'SA_AuditLog', bgColor: COLORS.blueStrong },
  ];

  return (
    <ImageBackground 
      source={require('../../../assets/uinsa2.jpeg')} 
      style={styles.container}
      imageStyle={{ opacity: 0.1 }} 
    >
      <StatusBar barStyle={isScrolled ? "light-content" : "dark-content"} backgroundColor="transparent" translucent={true} />
      
      <View style={styles.fixedHeaderWrap}>
        <View style={[styles.headerBase, isScrolled ? styles.headerSolid : styles.headerTransparent]}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1, paddingRight: 15 }}>
              <Text style={[styles.greeting, { color: isScrolled ? COLORS.surface : COLORS.primary }]} numberOfLines={1}>
                Portal Superadmin
              </Text>
              <Text style={[styles.subtitle, { color: isScrolled ? '#A1A1AA' : COLORS.textMuted }]} numberOfLines={1}>
                Sistem Pusat Pengelolaan CPL
              </Text>
              
              <View style={styles.emailWrap}>
                <Ionicons name="key-outline" size={12} color={isScrolled ? '#A1A1AA' : COLORS.textMuted} style={{ marginRight: 5 }} />
                <Text style={[styles.emailText, { color: isScrolled ? '#A1A1AA' : COLORS.textMuted }]} numberOfLines={1}>
                  {adminEmail}
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
              <Ionicons name="finger-print" size={24} color={isScrolled ? COLORS.surface : COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoPanelContainer}>
          <View style={styles.infoPanel}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Database</Text>
                <Text style={styles.infoValue}>PostgreSQL</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Auto-Backup</Text>
                <Text style={styles.infoValue}>{DB_SUMMARY.lastBackup}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Server</Text>
                <View style={styles.badgeActive}>
                  <View style={styles.dotActive} />
                  <Text style={styles.badgeText}>{DB_SUMMARY.serverStatus}</Text>
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

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Kontrol Penuh Sistem</Text>
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
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMain} style={{ opacity: 0.4 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={optionsModalVisible} animationType="fade" transparent onRequestClose={() => setOptionsModalVisible(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setOptionsModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.dropdownBox}>
              <View style={styles.dropdownProfileWrap}>
                <View style={styles.dropdownAvatar}>
                  <Ionicons name="planet" size={28} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dropdownName}>Root Access</Text>
                  <Text style={styles.dropdownEmail}>{adminEmail}</Text>
                  <View style={styles.dropdownBadge}>
                    <Text style={styles.dropdownBadgeText}>Superadmin</Text>
                  </View>
                </View>
              </View>

              <View style={styles.dropdownDivider} />

              <TouchableOpacity 
                style={styles.dropdownMenuBtn}
                onPress={() => { setOptionsModalVisible(false); navigation.navigate('SA_Profil'); }}
             >
                <Ionicons name="person-outline" size={20} color={COLORS.textMain} />
                <Text style={styles.dropdownMenuText}>Profil Saya</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.dropdownMenuBtn, { marginTop: 8 }]} 
                onPress={() => { setOptionsModalVisible(false); setLogoutModalVisible(true); }}
              >
                <Ionicons name="power-outline" size={20} color={COLORS.danger} />
                <Text style={[styles.dropdownMenuText, { color: COLORS.danger }]}>Tutup Sesi (Logout)</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      <Modal visible={logoutModalVisible} animationType="fade" transparent onRequestClose={() => setLogoutModalVisible(false)}>
        <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setLogoutModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.alertBox}>
              <View style={styles.alertIconWrap}>
                <Ionicons name="power" size={45} color={COLORS.danger} />
              </View>

              <Text style={styles.alertTitle}>Akhiri Sesi Root?</Text>
              <Text style={styles.alertMessage}>Akses kontrol penuh Anda akan ditutup. Sesi token akan dihapus dari sistem.</Text>
              
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
  infoLabel: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: COLORS.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: COLORS.textMain },
  badgeActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  dotActive: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2e7d32', marginRight: 6 },
  badgeText: { color: '#2e7d32', fontFamily: 'Urbanist-Bold', fontSize: 12 },
  
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
  opDesc: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: COLORS.textMain, opacity: 0.7, paddingRight: 10 },

  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', alignItems: 'flex-end', paddingTop: 100, paddingRight: 24 },
  dropdownBox: { backgroundColor: '#FFF', borderRadius: 24, width: 260, padding: 20, elevation: 15 },
  dropdownProfileWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  dropdownAvatar: { width: 50, height: 50, borderRadius: 18, backgroundColor: COLORS.blueSoft, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  dropdownName: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: COLORS.textMain, marginBottom: 2 },
  dropdownEmail: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: COLORS.textMuted, marginBottom: 6 },
  dropdownBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  dropdownBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#FFF' },
  dropdownDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: 15 },
  dropdownMenuBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  dropdownMenuText: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: COLORS.textMain, marginLeft: 15 },

  alertOverlay: { flex: 1, backgroundColor: 'rgba(33, 44, 33, 0.6)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: '#FFF', borderRadius: 35, padding: 30, width: '85%', alignItems: 'center', elevation: 20 },
  alertIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ffebee', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 10, textAlign: 'center' },
  alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  btnCancelFit: { flex: 0.48, backgroundColor: '#f1f5f9', borderRadius: 20, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  btnCancelTextFit: { color: '#64748B', fontFamily: 'Urbanist-Bold', fontSize: 15 },
  btnSubmitFit: { flex: 0.48, backgroundColor: COLORS.danger, borderRadius: 20, paddingVertical: 14, alignItems: 'center', elevation: 3 },
  btnSubmitTextFit: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
});