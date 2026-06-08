import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME DOSEN (Green)
const THEME = ROLE_THEMES.dosen;

export default function ProfilDetailScreen({ user, nidn: nidnProp, namaProdi: namaProdiProp }) {
    const nama  = user?.name  || '-';
    const email = user?.email || '-';
    const role  = user?.role  || 'dosen';
    const nidn  = nidnProp  || '-';
    const prodi = namaProdiProp || '-';

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Hero Banner ── */}
            <View style={styles.heroBanner}>
                <View style={styles.heroAvatar}>
                    <Text style={styles.heroAvatarText}>
                        {nama.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.heroName}>{nama}</Text>
                <Text style={styles.heroEmail}>{email}</Text>
                <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>{role.toUpperCase()}</Text>
                </View>
            </View>

            {/* ── Informasi Akun ── */}
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Informasi Akun</Text>
                {renderRow('account-outline',        'Nama Lengkap',  nama)}
                {renderRow('email-outline',          'Email',         email)}
                {renderRow('badge-account-outline',  'NIDN',          nidn)}
                {renderRow('school-outline',         'Program Studi', prodi)}
                {renderRow('shield-account-outline', 'Role',          role)}
            </View>
        </ScrollView>
    );

    function renderRow(icon, label, value) {
        return (
            <View style={styles.infoRow} key={label}>
                <View style={styles.infoIconBox}>
                    <MaterialCommunityIcons name={icon} size={16} color={BASE.textMuted} />
                </View>
                <View style={styles.infoMeta}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:     { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { paddingBottom: 40 },

    heroBanner: {
        backgroundColor: 'rgba(15,40,25,0.82)',
        paddingHorizontal: 20, paddingTop: 28, paddingBottom: 28,
        alignItems: 'center',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        marginBottom: 20,
    },
    heroAvatar: {
        width: 68, height: 68, borderRadius: 34,
        backgroundColor: THEME.accent,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
        borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)',
    },
    heroAvatarText: { fontFamily: 'Urbanist-Bold', fontSize: 30, color: BASE.textMain, fontWeight: '800' },
    heroName:       { fontFamily: 'Urbanist-Bold', fontSize: 20, fontWeight: '800', color: BASE.surface },
    heroEmail:      { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 3 },
    heroBadge: {
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4,
    },
    heroBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: THEME.accent, fontWeight: '700', letterSpacing: 0.5 },

    infoCard: {
        marginHorizontal: 20,
        backgroundColor: BASE.surface, borderRadius: 24, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 14, fontWeight: '800', color: BASE.textMain, marginBottom: 16 },
    infoRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    infoIconBox: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: BASE.borderLight,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    infoMeta:  { flex: 1 },
    infoLabel: { fontFamily: 'Urbanist-Bold', fontSize: 9, color: BASE.textDisabled, textTransform: 'uppercase', letterSpacing: 0.4 },
    infoValue: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: BASE.textMain, fontWeight: '700', marginTop: 2 },
});
