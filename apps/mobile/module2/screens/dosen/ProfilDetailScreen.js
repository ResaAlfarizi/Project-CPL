import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { profileApi } from '../../services/api';

export default function ProfilDetailScreen({ user }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        profileApi.getMyProfile()
            .then(res => setProfile(res.data || res))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const nama  = profile?.nama       || user?.name  || '-';
    const email = profile?.email      || user?.email || '-';
    const nidn  = profile?.nidn       || user?.nidn  || '-';
    const prodi = profile?.nama_prodi || user?.prodi || '-';
    const role  = user?.role          || 'dosen';

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#212121" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* ── Hero Banner ── */}
            <View style={styles.heroBanner}>
                <View style={styles.heroAvatar}>
                    <Text style={styles.heroAvatarText}>{nama.charAt(0).toUpperCase()}</Text>
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
                {renderRow('account-outline',       'Nama Lengkap', nama)}
                {renderRow('email-outline',         'Email',        email)}
                {renderRow('badge-account-outline', 'NIDN',         nidn)}
                {renderRow('school-outline',        'Program Studi',prodi)}
                {renderRow('shield-account-outline','Role',         role)}
            </View>

        </ScrollView>
    );

    function renderRow(icon, label, value) {
        return (
            <View style={styles.infoRow} key={label}>
                <View style={styles.infoIconBox}>
                    <MaterialCommunityIcons name={icon} size={16} color="#64748B" />
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

    /* Hero */
    heroBanner: {
        backgroundColor: 'rgba(15,40,25,0.82)',
        paddingHorizontal: 20, paddingTop: 28, paddingBottom: 28,
        alignItems: 'center',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        marginBottom: 20,
    },
    heroAvatar: {
        width: 68, height: 68, borderRadius: 34,
        backgroundColor: '#EFF0A3', justifyContent: 'center', alignItems: 'center',
        marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)',
    },
    heroAvatarText: { fontFamily: 'Urbanist-Bold', fontSize: 30, color: '#212121', fontWeight: '800' },
    heroName:  { fontFamily: 'Urbanist-Bold', fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
    heroEmail: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 3 },
    heroBadge: {
        marginTop: 8, backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4,
    },
    heroBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#EFF0A3', fontWeight: '700', letterSpacing: 0.5 },

    /* Info Card */
    infoCard: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 24, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 14, fontWeight: '800', color: '#212121', marginBottom: 16 },
    infoRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    infoIconBox: {
        width: 32, height: 32, borderRadius: 10, backgroundColor: '#F1F5F9',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    infoMeta:  { flex: 1 },
    infoLabel: { fontFamily: 'Urbanist-Bold', fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4 },
    infoValue: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#212121', fontWeight: '700', marginTop: 2 },
});
