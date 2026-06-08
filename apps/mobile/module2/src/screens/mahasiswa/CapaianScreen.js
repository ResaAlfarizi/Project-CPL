import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mahasiswaApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, EmptyState } from '../../components';

// ✅ THEME MAHASISWA (Orange)
const THEME = ROLE_THEMES.mahasiswa;

export default function CapaianScreen({ user }) {
    const [capaianList, setCapaianList] = useState([]);
    const [loading, setLoading]         = useState(true);

    useEffect(() => {
        mahasiswaApi.getMyCapaian()
            .then(res => setCapaianList(res.data || []))
            .catch(() => setCapaianList([]))
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'tercapai':
                return { bg: 'rgba(40, 199, 111, 0.12)', text: '#28C76F' };
            case 'belum tercapai':
                return { bg: 'rgba(234, 84, 85, 0.12)', text: '#EA5455' };
            default:
                return { bg: 'rgba(255, 159, 67, 0.12)', text: '#FF9F43' };
        }
    };

    const getProgressColor = (persentase) => {
        if (!persentase) return '#E5E7EB';
        if (persentase >= 80) return '#28C76F';
        if (persentase >= 60) return '#FF9F43';
        return '#EA5455';
    };

    if (loading) {
        return <LoadingState message="Memuat data capaian..." color={BASE.primary} />;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Hero Banner */}
            <View style={styles.heroBanner}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Capaian CPL Saya</Text>
                    <Text style={styles.heroSubtitle}>Data capaian pembelajaran untuk {user?.name || 'Mahasiswa'}</Text>
                </View>
            </View>

            {/* Capaian CPL Cards */}
            <View style={styles.cardList}>
                {capaianList.length === 0 ? (
                    <EmptyState icon="chart-line-variant" message="Belum ada data capaian CPL" />
                ) : (
                    capaianList.map((capaian) => {
                        const statusColor = getStatusColor(capaian.status);
                        const progressColor = getProgressColor(capaian.persentase);
                        const persentase = capaian.persentase || 0;

                        return (
                            <View key={capaian.id} style={styles.capaianCard}>
                                <View style={styles.capaianHeader}>
                                    <View style={styles.capaianLeft}>
                                        <View style={styles.badgeRow}>
                                            <View style={styles.kodeBadge}>
                                                <Text style={styles.kodeBadgeText}>{capaian.kode_cpl || '-'}</Text>
                                            </View>
                                            {capaian.status && (
                                                <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                                                    <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
                                                        {capaian.status}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={styles.capaianNama}>{capaian.nama_cpl || '-'}</Text>
                                    </View>
                                    <View style={styles.capaianRight}>
                                        <Text style={styles.persentaseValue}>{persentase.toFixed(1)}%</Text>
                                        {capaian.target && (
                                            <Text style={styles.targetText}>Target: {capaian.target}%</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Progress Bar */}
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBg}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${Math.min(persentase, 100)}%`, backgroundColor: progressColor }
                                            ]}
                                        />
                                    </View>
                                    {capaian.target && (
                                        <View
                                            style={[
                                                styles.targetMarker,
                                                { left: `${Math.min(capaian.target, 100)}%` }
                                            ]}
                                        />
                                    )}
                                </View>

                                {capaian.nilai !== undefined && (
                                    <Text style={styles.nilaiText}>
                                        Nilai: <Text style={styles.nilaiBold}>{capaian.nilai.toFixed(2)}</Text>
                                    </Text>
                                )}
                            </View>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BASE.background },
    scrollContent: { paddingBottom: 40 },

    heroBanner: {
        backgroundColor: THEME.secondary,
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24,
        marginBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    heroContent: { paddingHorizontal: 4 },
    heroTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: BASE.textMain, letterSpacing: -0.4 },
    heroSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: BASE.textMuted, marginTop: 4 },

    cardList: { gap: 14, paddingHorizontal: 20 },
    capaianCard: {
        backgroundColor: BASE.surface, borderRadius: 20, padding: 16,
        borderWidth: 1, borderColor: BASE.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
    },
    capaianHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    capaianLeft: { flex: 1, paddingRight: 12 },
    badgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 },
    kodeBadge: { backgroundColor: BASE.primary, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: BASE.surface, fontWeight: '700' },
    statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
    statusBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11, fontWeight: '700' },
    capaianNama: { fontFamily: 'Urbanist-Bold', fontSize: 13, fontWeight: '700', color: BASE.textMain, lineHeight: 19 },
    capaianRight: { alignItems: 'flex-end' },
    persentaseValue: { fontFamily: 'Urbanist-Bold', fontSize: 28, fontWeight: '800', color: BASE.textMain, lineHeight: 32 },
    targetText: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: BASE.textMuted, marginTop: 2 },

    progressContainer: { position: 'relative', marginBottom: 8 },
    progressBg: { width: '100%', height: 10, backgroundColor: BASE.borderLight, borderRadius: 999, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 999 },
    targetMarker: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: BASE.textMuted },
    nilaiText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: BASE.textMuted },
    nilaiBold: { fontFamily: 'Urbanist-Bold', fontWeight: '700', color: BASE.textMain },

    emptyCard: {
        backgroundColor: BASE.surface, borderRadius: 20, padding: 32,
        alignItems: 'center', gap: 12, elevation: 2,
    },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textDisabled, textAlign: 'center' },
});
