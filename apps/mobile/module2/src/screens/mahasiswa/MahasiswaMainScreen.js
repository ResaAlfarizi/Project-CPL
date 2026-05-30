import React, { useState } from 'react';
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

export default function MahasiswaMainScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = route.params || {};

    const [currentScreen, setCurrentScreen] = useState('dashboard');
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const handleNavigation = (screenKey) => {
        setCurrentScreen(screenKey);
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
                return <ProgramStudiScreen user={user} />;
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

            {/* HEADER - Sama seperti Dosen */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoIcon}>
                        <MaterialCommunityIcons name="school" size={20} color="#EFF0A3" />
                    </View>
                    <View>
                        <Text style={styles.logoText}>Sistem CPL</Text>
                        <Text style={styles.logoSubtext}>Portal Mahasiswa</Text>
                    </View>
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

            {/* BOTTOM NAVIGATION */}
            <View style={styles.bottomNav}>
                <TouchableOpacity 
                    style={styles.navItem} 
                    onPress={() => handleNavigation('dashboard')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons 
                        name="view-dashboard" 
                        size={24} 
                        color={currentScreen === 'dashboard' ? '#212121' : '#94A3B8'} 
                    />
                    <Text style={[styles.navLabel, currentScreen === 'dashboard' && styles.navLabelActive]}>
                        Dashboard
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.navItem} 
                    onPress={() => handleNavigation('program_studi')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons 
                        name="school-outline" 
                        size={24} 
                        color={currentScreen === 'program_studi' ? '#212121' : '#94A3B8'} 
                    />
                    <Text style={[styles.navLabel, currentScreen === 'program_studi' && styles.navLabelActive]}>
                        Prodi
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.navItem} 
                    onPress={() => handleNavigation('mata_kuliah')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons 
                        name="book-open-outline" 
                        size={24} 
                        color={currentScreen === 'mata_kuliah' ? '#212121' : '#94A3B8'} 
                    />
                    <Text style={[styles.navLabel, currentScreen === 'mata_kuliah' && styles.navLabelActive]}>
                        Mata Kuliah
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.navItem} 
                    onPress={() => handleNavigation('capaian')}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons 
                        name="chart-bell-curve-cumulative" 
                        size={24} 
                        color={currentScreen === 'capaian' ? '#212121' : '#94A3B8'} 
                    />
                    <Text style={[styles.navLabel, currentScreen === 'capaian' && styles.navLabelActive]}>
                        Capaian
                    </Text>
                </TouchableOpacity>
            </View>
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
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
        color: '#212121',
    },
    logoSubtext: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
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
        backgroundColor: '#212121',
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
    screenViewport: {
        flex: 1,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        paddingTop: 8,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    navLabel: {
        fontFamily: 'Urbanist-SemiBold',
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 4,
    },
    navLabelActive: {
        color: '#212121',
        fontWeight: '700',
    },
});
