import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
    ActivityIndicator, StatusBar, Platform, Dimensions,
} from 'react-native';
import {
    useFonts,
    Urbanist_300Light, Urbanist_400Regular, Urbanist_500Medium,
    Urbanist_600SemiBold, Urbanist_700Bold, Urbanist_800ExtraBold,
} from '@expo-google-fonts/urbanist';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// ── Auth (shared semua user) ─────────────────────────────────────────────────
import LoginScreen from './screens/auth/LoginScreen';

// ── Dosen screens ────────────────────────────────────────────────────────────
import DashboardScreen    from './screens/dosen/DashboardScreen';
import ProdiCplScreen     from './screens/dosen/ProdiCplScreen';
import MataKuliahScreen   from './screens/dosen/MataKuliahScreen';
import SubCpmkScreen      from './screens/dosen/SubCpmkScreen';
import InputNilaiScreen   from './screens/dosen/InputNilaiScreen';
import CapaianScreen      from './screens/dosen/CapaianScreen';
import ProfilDetailScreen from './screens/dosen/ProfilDetailScreen';

// ── Shared component ─────────────────────────────────────────────────────────
import ScreenBackground from './components/ScreenBackground';

// ── API service ──────────────────────────────────────────────────────────────
import {
    authApi, tokenStorage,
    kelasApi, subCpmkApi, dashboardApi, nilaiApi,
} from './services/api';

const { width } = Dimensions.get('window');

// ── Helper decode JWT tanpa library eksternal ────────────────────────────────
const decodeJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let str = '';
        let i = 0;
        while (i < base64.length) {
            const e1 = chars.indexOf(base64[i++]);
            const e2 = chars.indexOf(base64[i++]);
            const e3 = chars.indexOf(base64[i++]);
            const e4 = chars.indexOf(base64[i++]);
            str += String.fromCharCode((e1 << 2) | (e2 >> 4));
            if (e3 !== 64) str += String.fromCharCode(((e2 & 15) << 4) | (e3 >> 2));
            if (e4 !== 64) str += String.fromCharCode(((e3 & 3) << 6) | e4);
        }
        return JSON.parse(decodeURIComponent(
            str.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        ));
    } catch { return null; }
};

// ── Badge & quick-actions per role ───────────────────────────────────────────
const getRoleMeta = (role, nama) => {
    switch ((role || '').toLowerCase()) {
        case 'superadmin':
        case 'admin':
            return {
                badge: 'Administrator',
                avatar: (nama || 'A').charAt(0).toUpperCase(),
                quickActions: [
                    { title: 'Data Pengguna',    desc: 'Kelola akses dosen dan mahasiswa', icon: 'account-group-outline',    color: 'accent-blue',   target: 'mata_kuliah'  },
                    { title: 'Manajemen Kelas',  desc: 'Penjadwalan & ploting dosen',      icon: 'google-classroom',         color: 'accent-orange', target: 'prodi_cpl'    },
                    { title: 'Peserta Kelas',    desc: 'Plotting KRS & enrollment',        icon: 'account-plus-outline',     color: 'accent-yellow', target: 'capaian_mhs'  },
                    { title: 'Laporan CPL',      desc: 'Monitoring evaluasi pembelajaran', icon: 'chart-line',               color: 'accent-green',  target: 'capaian_mhs'  },
                ],
            };
        case 'mahasiswa':
            return {
                badge: 'Mahasiswa',
                avatar: (nama || 'M').charAt(0).toUpperCase(),
                quickActions: [
                    { title: 'Nilai Saya',    desc: 'Lihat nilai Sub-CPMK',       icon: 'clipboard-text-outline',  color: 'accent-green',  target: 'mata_kuliah'  },
                    { title: 'Capaian CPL',  desc: 'Progres capaian CPL saya',    icon: 'chart-bell-curve-cumulative', color: 'accent-blue', target: 'capaian_mhs' },
                    { title: 'Mata Kuliah',  desc: 'Daftar mata kuliah aktif',     icon: 'book-open-outline',       color: 'accent-yellow', target: 'mata_kuliah'  },
                    { title: 'Program Studi',desc: 'Info prodi & kurikulum',       icon: 'school-outline',          color: 'accent-orange', target: 'prodi_cpl'    },
                ],
            };
        default: // dosen
            return {
                badge: 'Dosen Pengajar',
                avatar: (nama || 'D').charAt(0).toUpperCase(),
                quickActions: [
                    { title: 'Input Nilai',   desc: 'Input & edit nilai Sub-CPMK',    icon: 'pencil-outline',         color: 'accent-yellow', target: 'input_nilai'  },
                    { title: 'Sub-CPMK',      desc: 'Kelola Sub-CPMK matakuliah',     icon: 'clipboard-text-outline', color: 'accent-green',  target: 'sub_cpmk'     },
                    { title: 'Capaian CPL',   desc: 'Lihat capaian CPL kelas',        icon: 'chart-line',             color: 'accent-blue',   target: 'capaian_mhs'  },
                    { title: 'Program Studi', desc: 'Informasi prodi & kurikulum',    icon: 'school-outline',         color: 'accent-orange', target: 'prodi_cpl'    },
                ],
            };
    }
};

// ── Sidebar menu per role ────────────────────────────────────────────────────
const getSidebarMenu = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin' || r === 'superadmin') {
        return [
            { key: 'dashboard',   icon: 'monitor-dashboard',            label: 'Dashboard'          },
            { key: 'prodi_cpl',   icon: 'school-outline',               label: 'Program Studi & CPL'},
            { key: 'mata_kuliah', icon: 'book-open-outline',            label: 'Mata Kuliah'        },
            { key: 'sub_cpmk',    icon: 'clipboard-text-outline',       label: 'Sub-CPMK'           },
            { key: 'input_nilai', icon: 'pencil-box-multiple-outline',  label: 'Input Nilai'        },
            { key: 'capaian_mhs', icon: 'chart-bell-curve-cumulative',  label: 'Capaian Mahasiswa'  },
        ];
    }
    if (r === 'mahasiswa') {
        return [
            { key: 'dashboard',   icon: 'monitor-dashboard',           label: 'Dashboard'          },
            { key: 'mata_kuliah', icon: 'book-open-outline',           label: 'Mata Kuliah'        },
            { key: 'capaian_mhs', icon: 'chart-bell-curve-cumulative', label: 'Capaian Saya'       },
            { key: 'prodi_cpl',   icon: 'school-outline',              label: 'Program Studi'      },
        ];
    }
    // dosen (default)
    return [
        { key: 'dashboard',   icon: 'monitor-dashboard',           label: 'Dashboard'          },
        { key: 'prodi_cpl',   icon: 'school-outline',              label: 'Program Studi & CPL'},
        { key: 'mata_kuliah', icon: 'book-open-outline',           label: 'Mata Kuliah'        },
        { key: 'sub_cpmk',    icon: 'clipboard-text-outline',      label: 'Sub-CPMK'           },
        { key: 'input_nilai', icon: 'pencil-box-multiple-outline', label: 'Input Nilai'        },
        { key: 'capaian_mhs', icon: 'chart-bell-curve-cumulative', label: 'Capaian Mahasiswa'  },
    ];
};

// ════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
    const [isLoggedIn,          setIsLoggedIn]          = useState(false);
    const [loggedInUser,        setLoggedInUser]        = useState(null);
    const [currentScreen,       setCurrentScreen]       = useState('dashboard');
    const [sidebarOpen,         setSidebarOpen]         = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [appLoading,          setAppLoading]          = useState(true);
    const [toastMessage,        setToastMessage]        = useState('');
    const [toastVisible,        setToastVisible]        = useState(false);

    // Data API
    const [kelasList,     setKelasList]     = useState([]);
    const [subCpmkList,   setSubCpmkList]   = useState([]);
    const [dashboardData, setDashboardData] = useState({});

    const showToast = (msg) => {
        setToastMessage(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2200);
    };

    // ── Cek token tersimpan saat app buka ────────────────────────────────────
    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await tokenStorage.get();
                if (token) {
                    const payload = decodeJwt(token);
                    if (!payload) throw new Error('Invalid token');
                    if (payload.exp * 1000 < Date.now()) throw new Error('Expired');

                    const meta = getRoleMeta(payload.role, payload.nama);
                    setLoggedInUser({
                        id:          payload.id,
                        name:        payload.nama || '',
                        email:       payload.email || '',
                        role:        payload.role || 'dosen',
                        entity_id:   payload.entity_id,
                        entity_type: payload.entity_type,
                        avatar:      meta.avatar,
                        badge:       meta.badge,
                        quickActions: meta.quickActions,
                    });
                    setIsLoggedIn(true);
                    await loadAllData(payload.role);
                } else {
                    await tokenStorage.remove();
                }
            } catch {
                await tokenStorage.remove();
            } finally {
                setAppLoading(false);
            }
        };
        checkToken();
    }, []);

    // ── Load data dari API ───────────────────────────────────────────────────
    const loadAllData = async (role) => {
        try {
            const [dashRes, kelasRes, subRes] = await Promise.allSettled([
                dashboardApi.getDosen(),
                kelasApi.getMyClasses(),
                subCpmkApi.getAll(),
            ]);
            if (dashRes.status === 'fulfilled') {
                const d = dashRes.value?.data || dashRes.value || {};
                setDashboardData(d.statistik ? { ...d.statistik, kelas: d.kelas || [] } : d);
            }
            if (kelasRes.status === 'fulfilled') setKelasList(kelasRes.value?.data || []);
            if (subRes.status === 'fulfilled')   setSubCpmkList(subRes.value?.data || []);
        } catch {}
    };

    // ── Font loading ─────────────────────────────────────────────────────────
    const [fontsLoaded] = useFonts({
        'Urbanist-Light':     Urbanist_300Light,
        'Urbanist-Regular':   Urbanist_400Regular,
        'Urbanist-Medium':    Urbanist_500Medium,
        'Urbanist-SemiBold':  Urbanist_600SemiBold,
        'Urbanist-Bold':      Urbanist_700Bold,
        'Urbanist-ExtraBold': Urbanist_800ExtraBold,
    });

    if (!fontsLoaded || appLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#212121" />
            </View>
        );
    }

    // ── Belum login → tampilkan LoginScreen ──────────────────────────────────
    if (!isLoggedIn) {
        return (
            <SafeAreaView style={styles.appContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#F6F5FA" />
                <ExpoStatusBar style="dark" />
                <LoginScreen
                    onLogin={async (credentials) => {
                        const res  = await authApi.login(credentials);
                        await tokenStorage.set(res.token);

                        const user = res.user || {};
                        const role = user.role || 'dosen';
                        const meta = getRoleMeta(role, user.nama || user.name);

                        const formattedUser = {
                            id:          user.id,
                            name:        user.nama || user.name || '',
                            email:       user.email || credentials.email,
                            role,
                            entity_id:   user.entity_id,
                            entity_type: user.entity_type,
                            avatar:      meta.avatar,
                            badge:       meta.badge,
                            quickActions: meta.quickActions,
                        };

                        setLoggedInUser(formattedUser);
                        setIsLoggedIn(true);
                        await loadAllData(role);
                        showToast(`Selamat datang, ${formattedUser.name}!`);
                    }}
                />
                {toastVisible && <ToastPanel message={toastMessage} />}
            </SafeAreaView>
        );
    }

    // ── CRUD Sub-CPMK ────────────────────────────────────────────────────────
    const handleAddSubCpmk = async (data) => {
        const res = await subCpmkApi.create(data);
        // Ambil item baru dari response, fallback ke data input + id sementara
        const newItem = res?.data || (res?.id ? res : { ...data, id: res?.id || Date.now() });
        setSubCpmkList(prev => [...prev, newItem]);
        showToast('Sub-CPMK berhasil ditambahkan!');
        // Background sync
        subCpmkApi.getAll()
            .then(r => { const list = r?.data || r || []; if (list.length > 0) setSubCpmkList(list); })
            .catch(() => {});
    };
    const handleUpdateSubCpmk = async (id, data) => {
        await subCpmkApi.update(id, data);
        setSubCpmkList(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
        showToast('Sub-CPMK berhasil diperbarui!');
        subCpmkApi.getAll()
            .then(r => { const list = r?.data || r || []; if (list.length > 0) setSubCpmkList(list); })
            .catch(() => {});
    };
    const handleDeleteSubCpmk = (id) => {
        setSubCpmkList(prev => prev.filter(item => item.id !== id));
        showToast('Sub-CPMK berhasil dihapus!');
    };

    // ── CRUD Nilai ───────────────────────────────────────────────────────────
    const handleAddGrade = async (data) => {
        try {
            await nilaiApi.create({ enrollment_id: data.enrollment_id, sub_cpmk_id: data.sub_cpmk_id, nilai: data.nilai });
            showToast('Nilai berhasil ditambahkan!');
        } catch (err) { showToast(err.message || 'Gagal menyimpan nilai'); throw err; }
    };
    const handleUpdateGrade = async (id, newValue) => {
        try {
            await nilaiApi.update(id, { nilai: newValue });
            showToast('Nilai berhasil diperbarui!');
        } catch (err) { showToast(err.message || 'Gagal memperbarui nilai'); throw err; }
    };

    const handleNavigation = (screenKey) => {
        setCurrentScreen(screenKey);
        setSidebarOpen(false);
        setProfileDropdownOpen(false);
    };

    // ── Format kelasList dari API ────────────────────────────────────────────
    const formattedKelas = kelasList.map(k => ({
        id:       k.id,
        mk_kode:  k.kode_mk  || k.mk_kode  || '-',
        mk_nama:  k.nama_mk  || k.mk_nama  || '-',
        mk_id:    k.mk_id,
        sks:      k.sks ?? 3,
        kelas:    k.nama_kelas || k.kelas   || '-',
        semester: `Semester ${k.semester_aktif ?? k.semester ?? ''}`,
        ta:       k.tahun_akademik || k.ta  || '-',
        mahasiswa: k.mahasiswa || [],
        subCpmk:   k.subCpmk  || [],
        nilai:     k.nilai     || [],
        total_mahasiswa: k.total_mahasiswa ?? k.jumlah_mahasiswa ?? k.count_mahasiswa ?? (k.mahasiswa || []).length ?? 0,
    }));

    const role        = loggedInUser?.role || 'dosen';
    const stats       = [
        { label: 'Kelas Diampu', value: String(dashboardData.total_kelas     ?? formattedKelas.length ?? 0), icon: 'monitor-dashboard', bg: 'bg-vanilla'  },
        { label: 'Total Mhs',    value: String(dashboardData.total_mahasiswa ?? 0),                          icon: 'account-group',     bg: 'bg-honeydew' },
        { label: 'Mata Kuliah',  value: String(dashboardData.total_mk        ?? formattedKelas.length ?? 0), icon: 'book-open-outline', bg: 'bg-alice'    },
    ];
    const enrichedUser       = loggedInUser ? { ...loggedInUser, stats } : loggedInUser;
    const enrichedScreenData = { [role]: enrichedUser };

    // ── Screen router ────────────────────────────────────────────────────────
    const renderActiveScreen = () => {
        switch (currentScreen) {
            case 'dashboard':
                return <DashboardScreen currentRole={role} rolesData={enrichedScreenData} kelasList={formattedKelas} dashboardData={dashboardData} onNavigate={handleNavigation} />;
            case 'prodi_cpl':
                return <ProdiCplScreen />;
            case 'mata_kuliah':
                return <MataKuliahScreen kelasList={formattedKelas} />;
            case 'sub_cpmk':
                return <SubCpmkScreen subCpmkList={subCpmkList} onAdd={handleAddSubCpmk} onUpdate={handleUpdateSubCpmk} onDelete={handleDeleteSubCpmk} />;
            case 'input_nilai':
                return <InputNilaiScreen kelasList={formattedKelas} subCpmkList={subCpmkList} onAddGrade={handleAddGrade} onUpdateGrade={handleUpdateGrade} />;
            case 'capaian_mhs':
                return <CapaianScreen kelasList={formattedKelas} />;
            case 'profile_detail':
                return <ProfilDetailScreen user={enrichedUser} />;
            default:
                return <DashboardScreen currentRole={role} rolesData={enrichedScreenData} kelasList={formattedKelas} dashboardData={dashboardData} onNavigate={handleNavigation} />;
        }
    };

    const sidebarMenu = getSidebarMenu(role);

    // ── Render utama (sudah login) ───────────────────────────────────────────
    return (
        <SafeAreaView style={styles.appContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#F6F5FA" />
            <ExpoStatusBar style="dark" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity activeOpacity={0.8} style={styles.hamburgerBtn} onPress={() => setSidebarOpen(true)}>
                    <MaterialCommunityIcons name="menu" size={24} color="#212121" />
                </TouchableOpacity>

                {/* Role badge di tengah */}
                <View style={styles.headerCenter}>
                    <Text style={styles.headerRole}>{loggedInUser?.badge || ''}</Text>
                </View>

                <TouchableOpacity activeOpacity={0.8} style={styles.profileBtn} onPress={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                    <Text style={styles.avatarText}>{loggedInUser?.avatar}</Text>
                </TouchableOpacity>

                {/* Profile dropdown */}
                {profileDropdownOpen && (
                    <View style={styles.profileDropdown}>
                        <View style={styles.dropdownProfileRow}>
                            <View style={styles.dropdownAvatar}>
                                <Text style={styles.dropdownAvatarText}>{loggedInUser?.avatar}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.dropdownName} numberOfLines={1}>{loggedInUser?.name}</Text>
                                <Text style={styles.dropdownEmail} numberOfLines={1}>{loggedInUser?.email}</Text>
                                <View style={styles.dropdownRolePill}>
                                    <Text style={styles.dropdownRoleText}>{loggedInUser?.badge}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.dropdownDivider} />
                        <TouchableOpacity activeOpacity={0.8} style={styles.dropdownItem} onPress={() => handleNavigation('profile_detail')}>
                            <MaterialCommunityIcons name="account-outline" size={18} color="#212121" />
                            <Text style={styles.dropdownItemText}>Profil Saya</Text>
                        </TouchableOpacity>
                        <View style={styles.dropdownDivider} />
                        <TouchableOpacity activeOpacity={0.8} style={styles.dropdownItem} onPress={async () => {
                            setProfileDropdownOpen(false);
                            await tokenStorage.remove();
                            setIsLoggedIn(false);
                            setLoggedInUser(null);
                            setKelasList([]);
                            setSubCpmkList([]);
                            setDashboardData({});
                            setCurrentScreen('dashboard');
                            showToast('Berhasil keluar dari sistem');
                        }}>
                            <MaterialCommunityIcons name="logout" size={18} color="#EA5455" />
                            <Text style={[styles.dropdownItemText, { color: '#EA5455' }]}>Keluar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* SCREEN VIEWPORT */}
            <ScreenBackground>
                <View style={styles.screenViewport}>{renderActiveScreen()}</View>
            </ScreenBackground>

            {/* SIDEBAR DRAWER */}
            {sidebarOpen && (
                <View style={styles.sidebarOverlay}>
                    <TouchableOpacity style={styles.sidebarBackdrop} activeOpacity={1} onPress={() => setSidebarOpen(false)} />
                    <View style={styles.sidebarDrawer}>
                        <View style={styles.sidebarHeader}>
                            <View style={styles.logoRow}>
                                <View style={styles.logoIcon}>
                                    <MaterialCommunityIcons name="school" size={20} color="#EFF0A3" />
                                </View>
                                <View>
                                    <Text style={styles.logoText}>Sistem CPL</Text>
                                    <Text style={styles.logoSubtext}>{loggedInUser?.badge}</Text>
                                </View>
                            </View>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => setSidebarOpen(false)}>
                                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" opacity={0.6} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sidebarMenu}>
                            <Text style={styles.menuGroupHeader}>MENU UTAMA</Text>
                            {sidebarMenu.map((item) => {
                                const isActive = currentScreen === item.key;
                                return (
                                    <TouchableOpacity
                                        key={item.key}
                                        activeOpacity={0.8}
                                        style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                                        onPress={() => handleNavigation(item.key)}
                                    >
                                        {isActive && <View style={styles.activeStrip} />}
                                        <MaterialCommunityIcons name={item.icon} size={20} color={isActive ? '#EFF0A3' : 'rgba(255,255,255,0.6)'} style={styles.sidebarItemIcon} />
                                        <Text style={[styles.sidebarItemText, isActive && styles.sidebarItemTextActive]}>{item.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.sidebarFooter}>
                            <View style={styles.footerIcon}>
                                <Text style={styles.footerIconText}>N</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* TOAST */}
            {toastVisible && <ToastPanel message={toastMessage} />}
        </SafeAreaView>
    );
}

// ── Toast component kecil ────────────────────────────────────────────────────
function ToastPanel({ message }) {
    return (
        <View style={styles.toast}>
            <View style={styles.toastIcon}>
                <MaterialCommunityIcons name="check" size={14} color="#28C76F" />
            </View>
            <Text style={styles.toastText}>{message}</Text>
        </View>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// STYLESHEET
// ════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: '#F6F5FA',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F5FA',
    },

    /* ── Header ── */
    header: {
        height: 64,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F6F5FA',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
        zIndex: 100,
        position: 'relative',
    },
    hamburgerBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerRole: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.3,
    },
    profileBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#212121',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
    },

    /* ── Profile Dropdown ── */
    profileDropdown: {
        position: 'absolute',
        top: 60,
        right: 24,
        width: 250,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#212121',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        zIndex: 150,
    },
    dropdownProfileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dropdownAvatar: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    dropdownAvatarText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '800',
    },
    dropdownName: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        fontWeight: '800',
        color: '#212121',
    },
    dropdownEmail: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 10,
        color: '#64748B',
        marginTop: 1,
    },
    dropdownRolePill: {
        marginTop: 4,
        backgroundColor: '#F1F5F9',
        borderRadius: 99,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: 'flex-start',
    },
    dropdownRoleText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 9,
        color: '#64748B',
        fontWeight: '700',
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 10,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        gap: 10,
    },
    dropdownItemText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        fontWeight: '700',
        color: '#212121',
    },

    /* ── Screen viewport ── */
    screenViewport: {
        flex: 1,
    },

    /* ── Sidebar ── */
    sidebarOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 200,
        flexDirection: 'row',
    },
    sidebarBackdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sidebarDrawer: {
        width: 280,
        height: '100%',
        backgroundColor: '#1b1b1b',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        marginBottom: 20,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    logoSubtext: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
    },
    sidebarMenu: {
        flex: 1,
    },
    menuGroupHeader: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: 0.8,
        marginBottom: 12,
        paddingHorizontal: 12,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 6,
        position: 'relative',
    },
    sidebarItemActive: {
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    activeStrip: {
        position: 'absolute',
        left: 0,
        top: '25%',
        bottom: '25%',
        width: 3,
        backgroundColor: '#EFF0A3',
        borderRadius: 9,
    },
    sidebarItemIcon: {
        marginRight: 12,
    },
    sidebarItemText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
    },
    sidebarItemTextActive: {
        color: '#EFF0A3',
    },
    sidebarFooter: {
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        alignItems: 'flex-start',
        paddingLeft: 8,
    },
    footerIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerIconText: {
        fontFamily: 'Urbanist-Bold',
        color: '#FFFFFF',
        fontSize: 11,
    },

    /* ── Toast ── */
    toast: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: '#212121',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 4,
        zIndex: 999,
    },
    toastIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(40,199,111,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toastText: {
        fontFamily: 'Urbanist-Bold',
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
});

