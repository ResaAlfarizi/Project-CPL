import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mahasiswaApi } from '../../services/api';

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
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#212121" />
            </View>
        );
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
                    <View style={styles.emptyCard}>
                        <MaterialCommunityIcons name="chart-line-variant" size={32} color="#CBD5E1" />
                        <Text style={styles.emptyText}>Belum ada data capaian CPL</Text>
                    </View>
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

    cardList: { gap: 14, paddingHorizontal: 20 },
    capaianCard: {
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 16,
        borderWidth: 1, borderColor: '#E5E7EB',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
    },
    capaianHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    capaianLeft: { flex: 1, paddingRight: 12 },
    badgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 },
    kodeBadge: { backgroundColor: '#212121', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
    statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
    statusBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11, fontWeight: '700' },
    capaianNama: { fontFamily: 'Urbanist-Bold', fontSize: 13, fontWeight: '700', color: '#212121', lineHeight: 19 },
    capaianRight: { alignItems: 'flex-end' },
    persentaseValue: { fontFamily: 'Urbanist-Bold', fontSize: 28, fontWeight: '800', color: '#212121', lineHeight: 32 },
    targetText: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#64748B', marginTop: 2 },

    progressContainer: { position: 'relative', marginBottom: 8 },
    progressBg: { width: '100%', height: 10, backgroundColor: '#F3F4F6', borderRadius: 999, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 999 },
    targetMarker: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#6B7280' },
    nilaiText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B' },
    nilaiBold: { fontFamily: 'Urbanist-Bold', fontWeight: '700', color: '#212121' },

    emptyCard: {
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 32,
        alignItems: 'center', gap: 12, elevation: 2,
    },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#94A3B8', textAlign: 'center' },
});
