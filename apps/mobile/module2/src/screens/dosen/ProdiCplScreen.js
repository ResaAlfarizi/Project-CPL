import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { prodiApi, cplApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { EmptyState, LoadingState } from '../../components';

// ✅ THEME DOSEN (Green)
const THEME = ROLE_THEMES.dosen;

// Memuat asset gambar untuk background dasar aplikasi (samar-samar di belakang)
const BG_IMAGE = require('../../../assets/uinsa2.jpeg');

export default function ProdiCplScreen() {
    const [prodiList, setProdiList]       = useState([]);
    const [cplList, setCplList]           = useState([]);
    const [selectedProdiId, setSelectedProdiId] = useState(null);
    const [loading, setLoading]           = useState(true);
    const [loadingCpl, setLoadingCpl]     = useState(false);

    useEffect(() => {
        prodiApi.getAll()
            .then(res => setProdiList(res.data || []))
            .catch(() => setProdiList([]))
            .finally(() => setLoading(false));
    }, []);

    const handleToggleProdi = async (prodiId) => {
        if (selectedProdiId === prodiId) {
            setSelectedProdiId(null);
            setCplList([]);
            return;
        }
        setSelectedProdiId(prodiId);
        setLoadingCpl(true);
        try {
            const res = await cplApi.getByProdi(prodiId);
            setCplList(res.data || []);
        } catch {
            setCplList([]);
        } finally {
            setLoadingCpl(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <LoadingState message="Memuat data program studi..." color={BASE.primary} />
            </View>
        );
    }

    return (
        // Gambar gedung ditaruh di paling luar sebagai background keseluruhan screen
        <ImageBackground source={BG_IMAGE} style={styles.bgFull} resizeMode="cover">
            {/* Overlay putih transparan agar background gedung terlihat samar & teks tetap kontras */}
            <View style={styles.bgOverlay} />

            <ScrollView 
                style={styles.container} 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* ── Hero Banner ── */}
                <View style={styles.heroBanner}>
                    <Text style={styles.heroTitle}>Program Studi & CPL</Text>
                    <Text style={styles.heroSubtitle}>
                        Daftar program studi dan Capaian Pembelajaran Lulusan
                    </Text>
                </View>

                {prodiList.length === 0 ? (
                    <View style={{ paddingHorizontal: 20 }}>
                        <EmptyState 
                            icon="school-off-outline" 
                            message="Data program studi tidak ditemukan" 
                        />
                    </View>
                ) : (
                    <View style={styles.cardList}>
                        {prodiList.map((prodi) => {
                            const isSelected = selectedProdiId === prodi.id;
                            return (
                                <View key={prodi.id} style={styles.prodiCard}>
                                    <View style={styles.prodiHeader}>
                                        <View style={styles.prodiMeta}>
                                            <Text style={styles.prodiNama}>{prodi.nama_prodi}</Text>
                                            <View style={styles.badgeRow}>
                                                <View style={styles.kodeBadge}>
                                                    <Text style={styles.kodeBadgeText}>{prodi.kode_prodi}</Text>
                                                </View>
                                                <View style={styles.jenjangBadge}>
                                                    <Text style={styles.jenjangBadgeText}>{prodi.jenjang}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <MaterialCommunityIcons name="school-outline" size={36} color={BASE.border} />
                                    </View>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={[styles.toggleBtn, isSelected && styles.toggleBtnActive]}
                                        onPress={() => handleToggleProdi(prodi.id)}
                                    >
                                        <Text style={[styles.toggleBtnText, isSelected && styles.toggleBtnTextActive]}>
                                            {isSelected ? 'Tutup CPL' : 'Lihat CPL'}
                                        </Text>
                                        <MaterialCommunityIcons
                                            name={isSelected ? "chevron-up" : "chevron-down"}
                                            size={16}
                                            color={isSelected ? BASE.surface : BASE.textMuted}
                                        />
                                    </TouchableOpacity>

                                    {isSelected && (
                                        <View style={styles.cplContainer}>
                                            {loadingCpl ? (
                                                <ActivityIndicator size="small" color={BASE.primary} />
                                            ) : cplList.length === 0 ? (
                                                <Text style={styles.emptyText}>Belum ada CPL untuk prodi ini</Text>
                                            ) : (
                                                <>
                                                    <Text style={styles.cplHeaderTitle}>
                                                        Capaian Pembelajaran Lulusan ({cplList.length})
                                                    </Text>
                                                    {cplList.map((cpl) => (
                                                        <View key={cpl.id} style={styles.cplSubCard}>
                                                            <View style={styles.cplCardHeader}>
                                                                <View style={styles.cplBadge}>
                                                                    <Text style={styles.cplBadgeText}>{cpl.kode_cpl}</Text>
                                                                </View>
                                                                <View style={styles.statusBadge}>
                                                                    <Text style={styles.statusBadgeText}>
                                                                        {cpl.is_active ? 'Aktif' : 'Nonaktif'}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            <Text style={styles.cplDescription}>{cpl.deskripsi}</Text>
                                                        </View>
                                                    ))}
                                                </>
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgFull: { 
        flex: 1 
    },
    bgOverlay: {
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        backgroundColor: 'rgba(246,245,250,0.85)',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingBottom: 40,
    },

    /* ── Gaya Hero Banner — warna THEME Dosen ── */
    heroBanner: { 
        backgroundColor: THEME.primary,
        borderBottomLeftRadius: 32, 
        borderBottomRightRadius: 32,
        paddingTop: 24,
        paddingBottom: 28,
        paddingHorizontal: 24,
        marginBottom: 24,
        width: '100%',
        elevation: 4,
    },
    heroTitle: { 
        fontFamily: 'Urbanist-Bold', 
        fontSize: 22, 
        fontWeight: '800', 
        color: BASE.textMain, 
        letterSpacing: -0.5 
    },
    heroSubtitle: { 
        fontFamily: 'Urbanist-Medium', 
        fontSize: 13, 
        color: BASE.textMuted, 
        marginTop: 6,
        lineHeight: 18
    },

    /* ── Card List ── */
    cardList: {
        gap: 16,
        paddingHorizontal: 20,
    },
    prodiCard: {
        backgroundColor: BASE.surface,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 15,
        elevation: 2,
        borderWidth: 1,
        borderColor: BASE.border,
    },
    prodiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    prodiMeta: {
        flex: 1,
        paddingRight: 8,
    },
    prodiNama: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 16,
        color: BASE.textMain,
        fontWeight: '800',
        marginBottom: 6,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    kodeBadge: {
        backgroundColor: BASE.primary,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    kodeBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        color: BASE.surface,
        fontWeight: '700',
    },
    jenjangBadge: {
        backgroundColor: THEME.accent, 
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    jenjangBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        color: BASE.textMain,
        fontWeight: '700',
    },
    toggleBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BASE.borderLight,
        height: 40,
        borderRadius: 12,
        gap: 6,
    },
    toggleBtnActive: {
        backgroundColor: BASE.primary,
    },
    toggleBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        fontWeight: '800',
        color: BASE.textMuted,
    },
    toggleBtnTextActive: {
        color: BASE.surface,
    },
    cplContainer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: BASE.border,
        paddingTop: 16,
        gap: 12,
    },
    cplHeaderTitle: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        fontWeight: '800',
        color: BASE.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    cplSubCard: {
        backgroundColor: BASE.borderLight,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: BASE.border,
    },
    cplCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cplBadge: {
        backgroundColor: THEME.secondary, 
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    cplBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        color: BASE.textMain,
        fontWeight: '700',
    },
    statusBadge: {
        backgroundColor: 'rgba(40, 199, 111, 0.12)',
        borderRadius: 99,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    statusBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 9,
        color: '#28C76F',
        fontWeight: '700',
    },
    cplDescription: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 12,
        color: '#475569',
        lineHeight: 18,
    },
    emptyText: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 13,
        color: BASE.textDisabled,
        textAlign: 'center',
    },
});