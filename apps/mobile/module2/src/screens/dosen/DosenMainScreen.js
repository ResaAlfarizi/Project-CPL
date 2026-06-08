import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    StatusBar, Platform, Modal, TouchableWithoutFeedback,
    ScrollView, ImageBackground,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';

// Dosen Screens
import ProdiCplScreen from './ProdiCplScreen';
import MataKuliahScreen from './MataKuliahScreen';
import SubCpmkScreen from './SubCpmkScreen';
import InputNilaiScreen from './InputNilaiScreen';
import CapaianScreen from './CapaianScreen';
import ProfilDetailScreen from './ProfilDetailScreen';

// Shared Components
import ScreenBackground from '../../components/ScreenBackground';

// API
import { tokenStorage, kelasApi, subCpmkApi, dashboardApi, nilaiApi, profileApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { CustomAlert } from '../../components';

// ✅ THEME DOSEN (Green)
const THEME = ROLE_THEMES.dosen;

const navItems = [
    { key: 'prodi_cpl',   icon: 'school-outline',               label: 'Program Studi & CPL',  desc: 'Lihat CPL program studi',                    bg: THEME.primary },
    { key: 'mata_kuliah', icon: 'book-open-outline',            label: 'Mata Kuliah',           desc: 'Kelas dan mata kuliah yang Anda ampu',       bg: THEME.secondary },
    { key: 'sub_cpmk',    icon: 'clipboard-text-outline',       label: 'Sub-CPMK',             desc: 'Kelola sub capaian pembelajaran MK',         bg: THEME.primary },
    { key: 'input_nilai', icon: 'pencil-box-multiple-outline',  label: 'Input Nilai',          desc: 'Input nilai mahasiswa per Sub-CPMK',         bg: THEME.accent },
    { key: 'capaian_mhs', icon: 'chart-bell-curve-cumulative',  label: 'Capaian Mahasiswa',    desc: 'Pantau capaian CPL mahasiswa',               bg: THEME.secondary },
];

export default function DosenMainScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = route.params || {};

    const [currentScreen, setCurrentScreen] = useState(null); // null = home card view
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible]   = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Data API
    const [kelasList, setKelasList]       = useState([]);
    const [subCpmkList, setSubCpmkList]   = useState([]);
    const [dashboardData, setDashboardData] = useState({});
    const [dosenNidn, setDosenNidn]       = useState('-');
    const [dosenProdi, setDosenProdi]     = useState('-');
    const [dosenNama, setDosenNama]       = useState(user?.nama || user?.name || '');

    useEffect(() => { loadAllData(); }, []);

    const loadAllData = async () => {
        let kelasList_local = [];
        try {
            const [dashRes, kelasRes, subRes, profileRes] = await Promise.allSettled([
                dashboardApi.getDosen(),
                kelasApi.getMyClasses(),
                subCpmkApi.getMySubCpmk(),
                profileApi.getMyProfile(),
            ]);
            if (dashRes.status === 'fulfilled') {
                const d = dashRes.value?.data || dashRes.value || {};
                setDashboardData(d.statistik ? { ...d.statistik, kelas: d.kelas || [] } : d);
            }
            if (kelasRes.status === 'fulfilled') {
                kelasList_local = kelasRes.value?.data || [];
                setKelasList(kelasList_local);
            }
            if (subRes.status === 'fulfilled')   setSubCpmkList(subRes.value?.data || []);
            if (profileRes.status === 'fulfilled') {
                const pData = profileRes.value?.data || {};
                // Nama dan prodi dari database via /profile/me
                if (pData.nama) setDosenNama(pData.nama);
                if (pData.nama_prodi && pData.nama_prodi !== 'Program Studi') {
                    setDosenProdi(pData.nama_prodi);
                }
            }
        } catch {}

        // Ambil NIDN dari detail kelas pertama
        try {
            if (kelasList_local.length > 0) {
                const detailJson = await kelasApi.getById(kelasList_local[0].id);
                const detail = detailJson.data || {};
                if (detail.nidn) setDosenNidn(detail.nidn);
                // nama_prodi TIDAK diambil dari kelas — prodi dosen sudah benar dari /profile/me
            }
        } catch {}
    };

    const handleNavigation = (screenKey) => setCurrentScreen(screenKey);

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
        } catch (error) {
            console.log('Error during logout:', error);
        }
        
        await tokenStorage.remove();
        navigation.replace('Login');
    };

    const handleScroll = (event) => {
        const y = event.nativeEvent.contentOffset.y;
        setIsScrolled(y > 20);
    };

    // CRUD Sub-CPMK
    const handleAddSubCpmk = async (data) => {
        const res = await subCpmkApi.create(data);
        const newItem = res?.data || (res?.id ? res : { ...data, id: res?.id || Date.now() });
        setSubCpmkList(prev => [...prev, newItem]);
    };

    const handleUpdateSubCpmk = async (id, data) => {
        await subCpmkApi.update(id, data);
        setSubCpmkList(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
    };

    const handleDeleteSubCpmk = async (id) => {
        await subCpmkApi.delete(id);
        setSubCpmkList(prev => prev.filter(item => item.id !== id));
    };

    // CRUD Nilai
    const handleAddGrade    = async (data) => await nilaiApi.create({ enrollment_id: data.enrollment_id, sub_cpmk_id: data.sub_cpmk_id, nilai: data.nilai });
    const handleUpdateGrade = async (id, newValue) => await nilaiApi.update(id, { nilai: newValue });

    const formattedKelas = kelasList.map(k => ({
        id: k.id,
        mk_kode: k.kode_mk || k.mk_kode || '-',
        mk_nama: k.nama_mk || k.mk_nama || '-',
        mk_id: k.mk_id,
        sks: k.sks ?? 3,
        kelas: k.nama_kelas || k.kelas || '-',
        semester: `Semester ${k.semester_aktif ?? k.semester ?? ''}`,
        ta: k.tahun_akademik || k.ta || '-',
        mahasiswa: k.mahasiswa || [],
        subCpmk: k.subCpmk || [],
        nilai: k.nilai || [],
        total_mahasiswa: k.total_mahasiswa ?? k.jumlah_mahasiswa ?? (k.mahasiswa || []).length ?? 0,
    }));

    const enrichedUser = user
        ? { ...user, name: dosenNama || user?.nama || user?.name || 'Dosen' }
        : { name: dosenNama || 'Dosen' };

    const renderActiveScreen = () => {
        switch (currentScreen) {
            case 'prodi_cpl':   return <ProdiCplScreen />;
            case 'mata_kuliah': return <MataKuliahScreen kelasList={formattedKelas} />;
            case 'sub_cpmk':    return <SubCpmkScreen subCpmkList={subCpmkList} onAdd={handleAddSubCpmk} onUpdate={handleUpdateSubCpmk} />;
            case 'input_nilai': return <InputNilaiScreen kelasList={formattedKelas} subCpmkList={subCpmkList} onAddGrade={handleAddGrade} onUpdateGrade={handleUpdateGrade} />;
            case 'capaian_mhs': return <CapaianScreen kelasList={formattedKelas} />;
            case 'profile':     return <ProfilDetailScreen user={enrichedUser} nidn={dosenNidn} namaProdi={dosenProdi} />;
            default:            return null;
        }
    };

    // ── Home card view (mirip admin-prodi dashboard) ──
    const renderHome = () => (
        <ImageBackground
            source={require('../../../assets/uinsa2.jpeg')}
            style={styles.homeContainer}
            imageStyle={{ opacity: 0.1 }}
        >
            {/* Fixed header */}
            <View style={styles.fixedHeaderWrap}>
                <View style={[styles.headerBase, isScrolled ? styles.headerSolid : styles.headerTransparent]}>
                    <View style={styles.headerTop}>
                        <View style={{ flex: 1, paddingRight: 15 }}>
                            <Text style={[styles.greeting, { color: isScrolled ? BASE.surface : BASE.primary }]} numberOfLines={1}>
                                Portal Dosen
                            </Text>
                            <Text style={[styles.subtitle, { color: isScrolled ? '#A1A1AA' : BASE.textMuted }]} numberOfLines={1}>
                                {dosenNama || user?.nama || user?.name || 'Dosen Pengajar'}
                            </Text>
                            {user?.email ? (
                                <View style={styles.emailWrap}>
                                    <Ionicons name="mail-outline" size={12} color={isScrolled ? '#A1A1AA' : BASE.textMuted} style={{ marginRight: 5 }} />
                                    <Text style={[styles.emailText, { color: isScrolled ? '#A1A1AA' : BASE.textMuted }]} numberOfLines={1}>
                                        {user.email}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                        <TouchableOpacity
                            style={[styles.accountBtn, {
                                borderColor: isScrolled ? 'rgba(255,255,255,0.2)' : 'rgba(33,44,33,0.1)',
                                backgroundColor: isScrolled ? 'rgba(255,255,255,0.1)' : 'rgba(33,44,33,0.05)',
                            }]}
                            onPress={() => setOptionsModalVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="person-circle-outline" size={24} color={isScrolled ? BASE.surface : BASE.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info panel */}
                <View style={styles.infoPanelContainer}>
                    <View style={styles.infoPanel}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Kelas Diampu</Text>
                                <Text style={styles.infoValue}>{dashboardData.total_kelas ?? formattedKelas.length ?? 0}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Mahasiswa</Text>
                                <Text style={styles.infoValue}>{dashboardData.total_mahasiswa ?? 0}</Text>
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
                <View style={{ height: 255 }} />

                {/* Menu navigasi */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Menu Dosen</Text>
                    <View style={styles.operationalList}>
                        {navItems.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[styles.operationalCard, { backgroundColor: item.bg }]}
                                onPress={() => handleNavigation(item.key)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.opIconWrap}>
                                    <MaterialCommunityIcons name={item.icon} size={24} color={BASE.textMain} />
                                </View>
                                <View style={styles.opTextWrap}>
                                    <Text style={styles.opTitle}>{item.label}</Text>
                                    <Text style={styles.opDesc}>{item.desc}</Text>
                                </View>
                                <Ionicons name="arrow-forward" size={20} color={BASE.textMain} style={{ opacity: 0.4 }} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </ImageBackground>
    );

    // Jika ada screen aktif, tampilkan screen tersebut dengan header back
    if (currentScreen) {
        return (
            <SafeAreaView style={styles.appContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#F6F5FA" />
                <ExpoStatusBar style="dark" />

                {/* Sub-screen header */}
                <View style={styles.subHeader}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.backBtn}
                        onPress={() => setCurrentScreen(null)}
                    >
                        <Ionicons name="arrow-back" size={22} color={BASE.textMain} />
                    </TouchableOpacity>
                    <Text style={styles.subHeaderTitle}>
                        {navItems.find(n => n.key === currentScreen)?.label || 'Profil'}
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.profileBtn}
                        onPress={() => setOptionsModalVisible(true)}
                    >
                        <Text style={styles.avatarText}>{user?.avatar || ((dosenNama || user?.nama || user?.name || 'D')?.[0] || 'D').toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>

                <ScreenBackground>
                    <View style={styles.screenViewport}>{renderActiveScreen()}</View>
                </ScreenBackground>

                {/* Options modal */}
                {renderOptionsModal()}
                {renderLogoutModal()}
            </SafeAreaView>
        );
    }

    // Home view
    return (
        <SafeAreaView style={styles.appContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <ExpoStatusBar style="dark" />
            {renderHome()}
            {renderOptionsModal()}
            {renderLogoutModal()}
        </SafeAreaView>
    );

    function renderOptionsModal() {
        return (
            <Modal visible={optionsModalVisible} animationType="fade" transparent onRequestClose={() => setOptionsModalVisible(false)}>
                <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setOptionsModalVisible(false)}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.dropdownBox}>
                            <View style={styles.dropdownProfileWrap}>
                                <View style={styles.dropdownAvatar}>
                                    <Text style={styles.dropdownAvatarText}>
                                        {((dosenNama || user?.nama || user?.name || 'D')?.[0] || 'D').toUpperCase()}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.dropdownName} numberOfLines={1}>{dosenNama || user?.nama || user?.name || 'Dosen'}</Text>
                                    <Text style={styles.dropdownEmail} numberOfLines={1}>{user?.email || ''}</Text>
                                    <View style={styles.dropdownBadge}>
                                        <Text style={styles.dropdownBadgeText}>Dosen Pengajar</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.dropdownDivider} />
                            <TouchableOpacity style={styles.dropdownMenuBtn} onPress={() => { setOptionsModalVisible(false); setCurrentScreen('profile'); }}>
                                <Ionicons name="person-outline" size={20} color={BASE.textMain} />
                                <Text style={styles.dropdownMenuText}>Profil Saya</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.dropdownMenuBtn, { marginTop: 8 }]} onPress={() => { setOptionsModalVisible(false); setLogoutModalVisible(true); }}>
                                <Ionicons name="log-out-outline" size={20} color={BASE.error} />
                                <Text style={[styles.dropdownMenuText, { color: BASE.error }]}>Keluar</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        );
    }

    function renderLogoutModal() {
        return (
            <Modal visible={logoutModalVisible} animationType="fade" transparent onRequestClose={() => setLogoutModalVisible(false)}>
                <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={() => setLogoutModalVisible(false)}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.alertBox}>
                            <View style={styles.alertIconWrap}>
                                <Ionicons name="log-out" size={45} color={BASE.error} />
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
        );
    }
}

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: BASE.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },

    // Sub-screen header (when a screen is active)
    subHeader: {
        height: 64,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: BASE.background,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.04)',
        zIndex: 100,
    },
    backBtn: {
        width: 40, height: 40,
        justifyContent: 'center', alignItems: 'center',
        borderRadius: 12,
        backgroundColor: BASE.borderLight,
    },
    subHeaderTitle: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 15,
        fontWeight: '700',
        color: BASE.textMain,
        flex: 1,
        textAlign: 'center',
    },
    profileBtn: {
        width: 36, height: 36,
        borderRadius: 10,
        backgroundColor: BASE.primary,
        justifyContent: 'center', alignItems: 'center',
        elevation: 2,
    },
    avatarText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 15,
        color: BASE.surface,
        fontWeight: '700',
    },
    screenViewport: { flex: 1 },

    // Home view
    homeContainer: { flex: 1, backgroundColor: BASE.background },
    fixedHeaderWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
    headerBase: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
        paddingBottom: 70,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTransparent: { backgroundColor: 'transparent' },
    headerSolid: {
        backgroundColor: BASE.primary,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontFamily: 'Urbanist-Bold', fontSize: 24, marginBottom: 2 },
    subtitle:  { fontFamily: 'Urbanist-Medium', fontSize: 13 },
    emailWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    emailText: { fontFamily: 'Urbanist-Medium', fontSize: 11, fontStyle: 'italic' },
    accountBtn: { padding: 12, borderRadius: 16, borderWidth: 1 },

    infoPanelContainer: { paddingHorizontal: 24, marginTop: -40 },
    infoPanel: {
        backgroundColor: BASE.surface,
        padding: 20,
        borderRadius: 24,
        elevation: 6,
        shadowColor: BASE.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: BASE.border,
    },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    infoItem: { alignItems: 'center', flex: 1 },
    divider: { width: 1, height: 30, backgroundColor: BASE.border },
    infoLabel: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 12,
        color: BASE.textMuted,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: BASE.textMain },
    badgeActive: { backgroundColor: THEME.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#3B5935', fontFamily: 'Urbanist-Bold', fontSize: 12 },

    sectionContainer: { marginBottom: 24 },
    sectionTitle: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 18,
        color: BASE.textMain,
        marginBottom: 12,
        paddingHorizontal: 24,
    },
    operationalList: { paddingHorizontal: 24 },
    operationalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
    },
    opIconWrap: {
        width: 48, height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center', alignItems: 'center',
    },
    opTextWrap: { flex: 1, marginLeft: 14 },
    opTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain, marginBottom: 4 },
    opDesc:  { fontFamily: 'Urbanist-Regular', fontSize: 13, color: BASE.textMain, opacity: 0.7 },

    // Dropdown options modal
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'flex-end',
        paddingTop: 100,
        paddingRight: 24,
    },
    dropdownBox: {
        backgroundColor: BASE.surface,
        borderRadius: 24,
        width: 260,
        padding: 20,
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
    },
    dropdownProfileWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    dropdownAvatar: {
        width: 50, height: 50,
        borderRadius: 18,
        backgroundColor: THEME.secondary,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 15,
    },
    dropdownAvatarText: { fontFamily: 'Urbanist-Bold', fontSize: 24, color: BASE.primary },
    dropdownName:  { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain, marginBottom: 2 },
    dropdownEmail: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: BASE.textMuted, marginBottom: 6 },
    dropdownBadge: {
        backgroundColor: THEME.primary,
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 8, alignSelf: 'flex-start',
    },
    dropdownBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.primary },
    dropdownDivider: { height: 1, backgroundColor: BASE.border, marginBottom: 15 },
    dropdownMenuBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    dropdownMenuText: { fontFamily: 'Urbanist-Bold', fontSize: 15, color: BASE.textMain, marginLeft: 15 },

    // Logout alert
    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(33,44,33,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
    alertBox: {
        backgroundColor: BASE.surface,
        borderRadius: 35,
        padding: 30,
        width: '85%',
        alignItems: 'center',
        elevation: 20,
    },
    alertIconWrap: {
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: BASE.errorBg,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
    },
    alertTitle:   { fontFamily: 'Urbanist-Bold', fontSize: 22, color: BASE.textMain, marginBottom: 10, textAlign: 'center' },
    alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 15, color: BASE.textMuted, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    btnCancelFit: {
        flex: 0.48,
        backgroundColor: BASE.borderLight,
        borderRadius: 20, paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1, borderColor: BASE.border,
    },
    btnCancelTextFit: { color: BASE.textMuted, fontFamily: 'Urbanist-Bold', fontSize: 15 },
    btnSubmitFit: {
        flex: 0.48,
        backgroundColor: BASE.error,
        borderRadius: 20, paddingVertical: 14,
        alignItems: 'center', elevation: 3,
    },
    btnSubmitTextFit: { color: BASE.surface, fontFamily: 'Urbanist-Bold', fontSize: 15 },
});
