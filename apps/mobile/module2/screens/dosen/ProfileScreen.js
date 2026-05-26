import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
export default function ProfileScreen({ currentRole, rolesData, onLogout, user }) {
    // Gunakan data user yang sedang login, bukan rolesData hardcoded
    const data = user || rolesData[currentRole];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Banner UINSA */}
            <View style={styles.heroBanner}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Profil</Text>
                    <Text style={styles.heroSubtitle}>Informasi akun dan pengaturan</Text>
                </View>
            </View>

            {/* Profile Large Card */}
            <View style={styles.profileCard}>
                <View style={styles.largeAvatar}>
                    <Text style={styles.largeAvatarText}>{data.avatar}</Text>
                </View>
                <Text style={styles.name}>{data.name}</Text>
                <Text style={styles.email}>{data.email}</Text>
                <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>{data.badge}</Text>
                </View>
            </View>

            {/* Academic Menu Group */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Sistem & Akademik</Text>
                <View style={styles.menuList}>
                    {renderMenuItem("calendar", "Tahun Akademik", "2024/2025 Genap", "#EFF0A3")}
                    {renderMenuItem("book-open-page-variant", "Program Studi", "S1 Informatika", "#CFDECA")}
                    {renderMenuItem("code-tags", "Sistem Versi", "v2.1.0-Expo", "#DBDFE9")}
                </View>
            </View>

            {/* Design Colors Showcase */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Palet Warna (Inspirasi)</Text>
                <View style={styles.paletteShowcase}>
                    {renderColorSwatch("Alice Blue", "#DBDFE9", "#DBDFE9", "#212121")}
                    {renderColorSwatch("Honeydew", "#CFDECA", "#CFDECA", "#212121")}
                    {renderColorSwatch("Vanilla", "#EFF0A3", "#EFF0A3", "#212121")}
                    {renderColorSwatch("Eerie Black", "#212121", "#212121", "#FFFFFF")}
                </View>
            </View>

            {/* Logout Simulator Button */}
            <TouchableOpacity activeOpacity={0.8} style={styles.logoutBtn} onPress={onLogout}>
                <MaterialCommunityIcons name="logout" size={18} color="#EA5455" />
                <Text style={styles.logoutBtnText}>Keluar / Ganti Peran</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    function renderMenuItem(iconName, label, val, bg) {
        return (
            <View style={styles.menuRow}>
                <View style={styles.menuLeft}>
                    <View style={[styles.menuIconWrapper, { backgroundColor: bg }]}>
                        <MaterialCommunityIcons name={iconName} size={16} color="#212121" />
                    </View>
                    <Text style={styles.menuLabel}>{label}</Text>
                </View>
                <Text style={styles.menuVal}>{val}</Text>
            </View>
        );
    }

    function renderColorSwatch(name, hex, colorCode, textColor) {
        return (
            <View style={[styles.swatch, { backgroundColor: colorCode }]}>
                <Text style={[styles.swatchName, { color: textColor }]}>{name}</Text>
                <Text style={[styles.swatchHex, { color: textColor, opacity: 0.8 }]}>{hex}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    bgFull: { flex: 1 },
    bgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(246,245,250,0.82)' },
    heroBanner: { backgroundColor: 'rgba(15,40,25,0.82)', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, marginBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    
    heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,40,25,0.58)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    heroContent: { padding: 20, paddingBottom: 22 },
    heroTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
    heroSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 4 },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    profileCard: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 15,
        elevation: 2,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.01)',
    },
    largeAvatar: {
        width: 80,
        height: 80,
        borderRadius: 30,
        backgroundColor: '#212121',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
        marginBottom: 16,
    },
    largeAvatarText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '800',
    },
    name: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 20,
        fontWeight: '800',
        color: '#212121',
        marginBottom: 4,
    },
    email: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 13,
        color: '#64748B',
        marginBottom: 12,
        fontWeight: '500',
    },
    rolePill: {
        backgroundColor: '#DBDFE9',
        borderRadius: 99,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    rolePillText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        fontWeight: '700',
        color: '#212121',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: '#64748B',
        marginBottom: 8,
        paddingLeft: 4,
    },
    menuList: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 24,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 15,
        elevation: 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.01)',
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    menuIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '700',
        color: '#212121',
    },
    menuVal: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    paletteShowcase: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginHorizontal: -4,
    },
    swatch: {
        width: '48%',
        borderRadius: 16,
        padding: 12,
        marginBottom: 8,
        marginHorizontal: '1%',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    swatchName: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        fontWeight: '800',
    },
    swatchHex: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 9,
        fontWeight: '500',
        marginTop: 4,
    },
    logoutBtn: {
        flexDirection: 'row',
        height: 48,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#EA5455',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
        marginBottom: 16,
    },
    logoutBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '800',
        color: '#EA5455',
    }
});









