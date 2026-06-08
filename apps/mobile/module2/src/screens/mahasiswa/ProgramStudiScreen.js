import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { prodiApi, cplApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, EmptyState } from '../../components';

// ✅ THEME MAHASISWA (Orange)
const THEME = ROLE_THEMES.mahasiswa;

export default function ProgramStudiScreen({ user }) {
    const [prodiList, setProdiList]           = useState([]);
    const [cplList, setCplList]               = useState([]);
    const [selectedProdiId, setSelectedProdiId] = useState(null);
    const [loading, setLoading]               = useState(true);
    const [loadingCpl, setLoadingCpl]         = useState(false);

    useEffect(() => {
        prodiApi.getAll()
            .then(res => {
                const allProdi = res.data || [];
                // Filter: hanya tampilkan prodi mahasiswa sendiri
                const filtered = user?.prodi_id 
                    ? allProdi.filter(p => p.id === user.prodi_id)
                    : allProdi;
                setProdiList(filtered);
                
                // Auto-load CPL untuk prodi mahasiswa
                if (filtered.length > 0 && user?.prodi_id) {
                    setSelectedProdiId(user.prodi_id);
                    loadCplForProdi(user.prodi_id);
                }
            })
            .catch(() => setProdiList([]))
            .finally(() => setLoading(false));
    }, [user]);

    const loadCplForProdi = async (prodiId) => {
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

    const handleToggleProdi = async (prodiId) => {
        if (selectedProdiId === prodiId) {
            setSelectedProdiId(null);
            setCplList([]);
            return;
        }
        setSelectedProdiId(prodiId);
        await loadCplForProdi(prodiId);
    };

    if (loading) {
        return <LoadingState message="Memuat data program studi..." color={BASE.primary} />;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Hero Banner */}
            <View style={styles.heroBanner}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Program Studi & CPL</Text>
                    <Text style={styles.heroSubtitle}>Informasi program studi dan Capaian Pembelajaran Lulusan Anda</Text>
                </View>
            </View>

            {/* Prodi List - Hanya Prodi Mahasiswa */}
            {prodiList.length === 0 ? (
                <EmptyState icon="school-off-outline" message="Data program studi tidak ditemukan" />
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
                                    <MaterialCommunityIcons name="school-outline" size={36} color="#E2E8F0" />
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
                                        name={isSelected ? 'chevron-up' : 'chevron-down'}
                                        size={16}
                                        color={isSelected ? '#FFFFFF' : '#64748B'}
                                    />
                                </TouchableOpacity>

                                {isSelected && (
                                    <View style={styles.cplContainer}>
                                        {loadingCpl ? (
                                            <LoadingState message="Memuat CPL..." color={BASE.primary} />
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
                                                        </View>
                                                        {cpl.nama_cpl && (
                                                            <Text style={styles.cplNama}>{cpl.nama_cpl}</Text>
                                                        )}
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

    cardList: { gap: 16, paddingHorizontal: 20 },
    prodiCard: {
        backgroundColor: BASE.surface, borderRadius: 24, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 15, elevation: 2,
        borderWidth: 1, borderColor: BASE.border,
    },
    prodiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    prodiMeta: { flex: 1, paddingRight: 8 },
    prodiNama: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain, fontWeight: '800', marginBottom: 6 },
    badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    kodeBadge: { backgroundColor: BASE.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.surface, fontWeight: '700' },
    jenjangBadge: { backgroundColor: THEME.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    jenjangBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.textMain, fontWeight: '700' },

    toggleBtn: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        backgroundColor: BASE.borderLight, height: 40, borderRadius: 12, gap: 6,
    },
    toggleBtnActive: { backgroundColor: BASE.primary },
    toggleBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 12, fontWeight: '800', color: BASE.textMuted },
    toggleBtnTextActive: { color: BASE.surface },

    cplContainer: { marginTop: 20, borderTopWidth: 1, borderTopColor: BASE.borderLight, paddingTop: 16, gap: 12 },
    cplHeaderTitle: {
        fontFamily: 'Urbanist-Bold', fontSize: 12, fontWeight: '800', color: BASE.textMuted,
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
    },
    cplSubCard: { backgroundColor: THEME.primary, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BASE.border },
    cplCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    cplBadge: { backgroundColor: THEME.secondary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    cplBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.textMain, fontWeight: '700' },
    cplNama: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: BASE.textMain, fontWeight: '700', marginBottom: 4 },

    emptyCard: {
        backgroundColor: BASE.surface, borderRadius: 24, padding: 32, alignItems: 'center', gap: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 15, elevation: 2,
        marginHorizontal: 20,
    },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textDisabled, textAlign: 'center' },
});
