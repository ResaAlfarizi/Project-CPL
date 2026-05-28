import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';

// Mahasiswa Screens
import DashboardScreen from './DashboardScreen';
import ProgramStudiScreen from './ProgramStudiScreen';
import MataKuliahScreen from './MataKuliahScreen';
import SubCpmkScreen from './SubCpmkScreen';
import CapaianScreen from './CapaianScreen';
import ProfileScreen from './ProfileScreen';

// Shared Components
import ScreenBackground from '../../components/ScreenBackground';

// API
import { tokenStorage } from '../../services/api';

const navItems = [
    { key: 'dashboard', icon: 'monitor-dashboard', label: 'Dashboard' },
    { key: 'program_studi', icon: 'school-outline', label: 'Program Studi' },
    { key: 'mata_kuliah', icon: 'book-open-outline', label: 'Mata Kuliah' },
    { key: 'sub_cpmk', icon: 'clipboard-text-outline', label: 'Sub-CPMK' },
    { key: 'capaian', icon: 'chart-bell-curve-cumulative', label: 'Capaian Saya' },
];

export default function MahasiswaMainScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = route.params || {};

    const [currentScreen, setCurrentScreen] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleNavigation = (screenKey) => {
        setCurrentScreen(screenKey);
        setSidebarOpen(false);
        setProfileDropdownOpen(false);
    };

    const handleLogout = async () => {
        await tokenStorage.remove();
        navigation.replace('Login');
    };

    const renderActiveScreen = () => {
        switch (currentScreen) {
            case 'dashboard':
                return <DashboardScreen user={user} onNavigate={handleNavigation} />;
            case 'program_studi':
                return <ProgramStudiScreen />;
            case 'mata_kuliah':
                return <MataKuliahScreen />;
            case 'sub_cpmk':
                return <SubCpmkScreen />;
            case 'capaian':
                return <CapaianScreen user={user} />;
            default:
                return <DashboardScreen user={user} onNavigate={handleNavigation} />;
        }
    };

    return (
        <SafeAreaView style={styles.appContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#F6F5FA" />
            <ExpoStatusBar style="dark" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity activeOpacity={0.8} style={styles.hamburgerBtn} onPress={() => setSidebarOpen(true)}>
                    <MaterialCommunityIcons name="menu" size={24} color="#212121" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerRole}>Mahasiswa</Text>
                </View>

                <TouchableOpacity activeOpacity={0.8} style={styles.profileBtn} onPress={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                    <Text style={styles.avatarText}>{user?.avatar || 'M'}</Text>
                </TouchableOpacity>

                {/* Profile dropdown */}
                {profileDropdownOpen && (
                    <View style={styles.profileDropdown}>
                        <View style={styles.dropdownProfileRow}>
                            <View style={styles.dropdownAvatar}>
                                <Text style={styles.dropdownAvatarText}>{user?.avatar || 'M'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.dropdownName} numberOfLines={1}>{user?.name || 'Mahasiswa'}</Text>
                                <Text style={styles.dropdownEmail} numberOfLines={1}>{user?.email || ''}</Text>
                                <View style={styles.dropdownRolePill}>
                                    <Text style={styles.dropdownRoleText}>Mahasiswa</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.dropdownDivider} />
                        <TouchableOpacity activeOpacity={0.8} style={styles.dropdownItem} onPress={() => {
                            setProfileDropdownOpen(false);
                            setCurrentScreen('profile');
                        }}>
                            <MaterialCommunityIcons name="account-outline" size={18} color="#212121" />
                            <Text style={styles.dropdownItemText}>Profil Saya</Text>
                        </TouchableOpacity>
                        <View style={styles.dropdownDivider} />
                        <TouchableOpacity activeOpacity={0.8} style={styles.dropdownItem} onPress={handleLogout}>
                            <MaterialCommunityIcons name="logout" size={18} color="#EA5455" />
                            <Text style={[styles.dropdownItemText, { color: '#EA5455' }]}>Keluar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* SCREEN VIEWPORT */}
            <ScreenBackground>
                <View style={styles.screenViewport}>
                    {currentScreen === 'profile' ? (
                        <ProfileScreen user={user} onLogout={handleLogout} />
                    ) : (
                        renderActiveScreen()
                    )}
                </View>
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
                                    <Text style={styles.logoSubtext}>Portal Mahasiswa</Text>
                                </View>
                            </View>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => setSidebarOpen(false)}>
                                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" opacity={0.6} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sidebarMenu}>
                            <Text style={styles.menuGroupHeader}>MENU UTAMA</Text>
                            {navItems.map((item) => {
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
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: '#F6F5FA',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
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
        backgroundColor: '#EFF0A3',
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
        color: '#212121',
        fontWeight: '700',
    },
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
        backgroundColor: '#EFF0A3',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    dropdownAvatarText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 16,
        color: '#212121',
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
    screenViewport: {
        flex: 1,
    },
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
        backgroundColor: '#212121',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 24 : 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#212121',
        borderWidth: 2,
        borderColor: '#EFF0A3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    logoSubtext: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    sidebarMenu: {
        flex: 1,
        padding: 16,
    },
    menuGroupHeader: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.35)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
        position: 'relative',
    },
    sidebarItemActive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    activeStrip: {
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: [{ translateY: -10 }],
        width: 3,
        height: 20,
        borderRadius: 3,
        backgroundColor: '#EFF0A3',
    },
    sidebarItemIcon: {
        marginRight: 12,
    },
    sidebarItemText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.6)',
    },
    sidebarItemTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});
