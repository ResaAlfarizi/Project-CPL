import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mahasiswaApi } from '../../services/api';

export default function ProfileScreen({ user, onLogout }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        mahasiswaApi.getMyProfile()
            .then(res => {
                const data = res.data || res;
                // Merge dengan data user yang login
                setProfile({
                    id: data.id || user?.id || user?.entity_id,
                    nim: data.nim || user?.nim || '123456789',
                    nama: data.nama || data.name || user?.name || 'Mahasiswa',
                    email: data.email || user?.email || 'mahasiswa@example.com',
                    prodi_id: data.prodi_id || '1',
                    nama_prodi: data.nama_prodi || 'S1 Informatika',
                    kode_prodi: data.kode_prodi || 'IF',
                    jenjang: data.jenjang || 'S1',
                    angkatan: data.angkatan || 2021,
                    total_kelas: data.total_kelas || 8,
                    total_nilai: data.total_nilai || 24,
                });
            })
            .catch(() => {
                // Fallback ke data user yang login
                setProfile({
                    id: user?.id || user?.entity_id,
                    nim: user?.nim || '123456789',
                    nama: user?.name || 'Mahasiswa',
                    email: user?.email || 'mahasiswa@example.com',
                    prodi_id: '1',
                    nama_prodi: 'S1 Informatika',
                    kode_prodi: 'IF',
                    jenjang: 'S1',
                    angkatan: 2021,
                    total_kelas: 8,
                    total_nilai: 24,
                });
            })
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#212121" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF9F43" />
                <Text style={styles.errorText}>Profil tidak ditemukan</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Hero Banner */}
            <View style={styles.heroBanner}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Profil</Text>
                    <Text style={styles.heroSubtitle}>Informasi akun dan pengaturan</Text>
                </View>
            </View>

            {/* Profile Large Card */}
            <View style={styles.profileCard}>
                <View style={styles.largeAvatar}>
                    <Text style={styles.largeAvatarText}>{profile.nama.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.name}>{profile.nama}</Text>
                <Text style={styles.email}>{profile.email}</Text>
                <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>Mahasiswa</Text>
                </View>
            </View>

            {/* Informasi Pribadi */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Informasi Pribadi</Text>
                <View style={styles.menuList}>
                    {renderMenuItem('account-outline', 'Nama Lengkap', profile.nama, '#E8F3FF')}
                    {renderMenuItem('card-account-details-outline', 'NIM', profile.nim, '#CFDECA')}
                    {renderMenuItem('email-outline', 'Email', profile.email, '#EFF0A3')}
                </View>
            </View>

            {/* Informasi Akademik */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Informasi Akademik</Text>
                <View style={styles.menuList}>
                    {renderMenuItem('school-outline', 'Program Studi', profile.nama_prodi, '#E8F3FF')}
                    {renderMenuItem('code-tags', 'Kode Prodi', profile.kode_prodi, '#CFDECA')}
                    {renderMenuItem('stairs-up', 'Jenjang', profile.jenjang, '#EFF0A3')}
                    {renderMenuItem('calendar-account', 'Angkatan', String(profile.angkatan), '#D8DFE9')}
                </View>
            </View>

            {/* Statistik Akademik */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Statistik Akademik</Text>
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: '#E8F3FF' }]}>
                        <MaterialCommunityIcons name="google-classroom" size={20} color="#1E40AF" />
                        <Text style={styles.statLabel}>Total Kelas</Text>
                        <Text style={styles.statValue}>{profile.total_kelas}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#CFDECA' }]}>
                        <MaterialCommunityIcons name="clipboard-check-outline" size={20} color="#166534" />
                        <Text style={styles.statLabel}>Total Nilai</Text>
                        <Text style={styles.statValue}>{profile.total_nilai}</Text>
                    </View>
                </View>
            </View>

            {/* Info Note */}
            <View style={styles.infoCard}>
                <MaterialCommunityIcons name="information-outline" size={20} color="#1E40AF" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>Informasi</Text>
                    <Text style={styles.infoText}>
                        Data profil ini bersifat <Text style={styles.infoBold}>read-only</Text>. Jika ada perubahan data, silakan hubungi admin atau bagian akademik.
                    </Text>
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity activeOpacity={0.8} style={styles.logoutBtn} onPress={onLogout}>
                <MaterialCommunityIcons name="logout" size={18} color="#EA5455" />
                <Text style={styles.logoutBtnText}>Keluar / Ganti Peran</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    function renderMenuItem(iconName, label, val, bg) {
        return (
            <View style={styles.menuRow} key={label}>
                <View style={styles.menuLeft}>
                    <View style={[styles.menuIconWrapper, { backgroundColor: bg }]}>
                        <MaterialCommunityIcons name={iconName} size={16} color="#212121" />
                    </View>
                    <Text style={styles.menuLabel}>{label}</Text>
                </View>
                <Text style={styles.menuVal} numberOfLines={1}>{val}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { paddingBottom: 40 },

    heroBanner: {
        backgroundColor: 'rgba(15,40,25,0.82)',
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24,
        marginBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    heroContent: { paddingHorizontal: 4 },
    heroTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
    heroSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 4 },

    profileCard: {
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 24, padding: 24,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 15, elevation: 2,
        marginHorizontal: 20, marginBottom: 24,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.01)',
    },
    largeAvatar: {
        width: 80, height: 80, borderRadius: 30,
        backgroundColor: '#EFF0A3',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 4,
        marginBottom: 16,
    },
    largeAvatarText: { fontFamily: 'Urbanist-Bold', fontSize: 32, color: '#212121', fontWeight: '800' },
    name: { fontFamily: 'Urbanist-Bold', fontSize: 20, fontWeight: '800', color: '#212121', marginBottom: 4 },
    email: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B', marginBottom: 12, fontWeight: '500' },
    rolePill: { backgroundColor: '#D8DFE9', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6 },
    rolePillText: { fontFamily: 'Urbanist-Bold', fontSize: 11, fontWeight: '700', color: '#212121' },

    section: { marginBottom: 24, paddingHorizontal: 20 },
    sectionHeader: {
        fontFamily: 'Urbanist-Bold', fontSize: 12, fontWeight: '800',
        textTransform: 'uppercase', letterSpacing: 0.5, color: '#64748B',
        marginBottom: 8, paddingLeft: 4,
    },
    menuList: {
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 15, elevation: 2,
        overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.01)',
    },
    menuRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
    menuIconWrapper: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontFamily: 'Urbanist-Bold', fontSize: 14, fontWeight: '700', color: '#212121', flex: 1 },
    menuVal: { fontFamily: 'Urbanist-Bold', fontSize: 13, fontWeight: '700', color: '#64748B', maxWidth: '40%' },

    statsGrid: { flexDirection: 'row', gap: 12 },
    statCard: {
        flex: 1, borderRadius: 20, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 1,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
    },
    statLabel: { fontFamily: 'Urbanist-Bold', fontSize: 11, fontWeight: '700', color: '#64748B', marginTop: 8 },
    statValue: { fontFamily: 'Urbanist-Bold', fontSize: 28, fontWeight: '800', color: '#212121', marginTop: 4 },

    infoCard: {
        flexDirection: 'row', gap: 12,
        backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE',
        borderRadius: 16, padding: 14, marginHorizontal: 20, marginBottom: 16,
    },
    infoTitle: { fontFamily: 'Urbanist-Bold', fontSize: 13, fontWeight: '700', color: '#1E3A8A', marginBottom: 4 },
    infoText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#1E40AF', lineHeight: 18 },
    infoBold: { fontFamily: 'Urbanist-Bold', fontWeight: '700' },

    logoutBtn: {
        flexDirection: 'row', height: 48, borderRadius: 16,
        borderWidth: 1.5, borderColor: '#EA5455', backgroundColor: 'transparent',
        justifyContent: 'center', alignItems: 'center', gap: 8,
        marginHorizontal: 20, marginTop: 12, marginBottom: 16,
    },
    logoutBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 14, fontWeight: '800', color: '#EA5455' },

    errorText: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#FF9F43', marginTop: 12, textAlign: 'center' },
});
