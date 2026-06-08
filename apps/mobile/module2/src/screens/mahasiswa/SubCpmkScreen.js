import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { subCpmkApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, EmptyState } from '../../components';

// ✅ THEME MAHASISWA (Orange)
const THEME = ROLE_THEMES.mahasiswa;

export default function SubCpmkScreen() {
    const [subCpmkList, setSubCpmkList] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [expandedId, setExpandedId]   = useState(null);

    useEffect(() => {
        subCpmkApi.getAll()
            .then(res => setSubCpmkList(res.data || []))
            .catch(() => setSubCpmkList([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = subCpmkList.filter(s => {
        const q = search.toLowerCase();
        return (
            (s.kode_sub_cpmk || '').toLowerCase().includes(q) ||
            (s.nama_sub_cpmk || '').toLowerCase().includes(q) ||
            (s.nama_mk || '').toLowerCase().includes(q) ||
            (s.kode_mk || '').toLowerCase().includes(q)
        );
    });

    if (loading) {
        return <LoadingState message="Memuat data Sub-CPMK..." color={BASE.primary} />;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Hero Banner */}
            <View style={styles.heroBanner}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Sub-CPMK</Text>
                    <Text style={styles.heroSubtitle}>Daftar Sub-CPMK dari mata kuliah</Text>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={18} color="#64748B" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Cari sub-CPMK atau mata kuliah..."
                    value={search}
                    onChangeText={setSearch}
                    placeholderTextColor="#94A3B8"
                />
            </View>

            {/* Card List */}
            {filtered.length === 0 ? (
                <EmptyState icon="clipboard-off-outline" message="Tidak ada data Sub-CPMK" />
            ) : (
                <View style={styles.cardList}>
                    {filtered.map((subCpmk) => {
                        const isExpanded = expandedId === subCpmk.id;
                        return (
                            <View key={subCpmk.id} style={styles.subCpmkCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.headerLeft}>
                                        <View style={styles.badgeRow}>
                                            <View style={styles.kodeBadge}>
                                                <Text style={styles.kodeBadgeText}>{subCpmk.kode_sub_cpmk || '-'}</Text>
                                            </View>
                                            {subCpmk.nama_mk && (
                                                <View style={styles.mkBadge}>
                                                    <Text style={styles.mkBadgeText}>{subCpmk.kode_mk || subCpmk.nama_mk}</Text>
                                                </View>
                                            )}
                                            {subCpmk.bobot && (
                                                <View style={styles.bobotBadge}>
                                                    <Text style={styles.bobotBadgeText}>Bobot: {subCpmk.bobot}%</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={styles.subCpmkNama} numberOfLines={isExpanded ? undefined : 2}>
                                            {subCpmk.nama_sub_cpmk || '-'}
                                        </Text>
                                    </View>
                                    {subCpmk.deskripsi && (
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={styles.expandBtn}
                                            onPress={() => setExpandedId(isExpanded ? null : subCpmk.id)}
                                        >
                                            <MaterialCommunityIcons
                                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                size={20}
                                                color="#64748B"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {isExpanded && subCpmk.deskripsi && (
                                    <>
                                        <View style={styles.divider} />
                                        <Text style={styles.deskripsi}>{subCpmk.deskripsi}</Text>
                                    </>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Summary */}
            {filtered.length > 0 && (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>
                        Menampilkan <Text style={styles.summaryBold}>{filtered.length}</Text> Sub-CPMK
                    </Text>
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

    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: BASE.surface, borderRadius: 16,
        marginHorizontal: 20, marginBottom: 20, paddingHorizontal: 16,
        borderWidth: 1, borderColor: BASE.border,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 44, fontFamily: 'Urbanist-SemiBold', fontSize: 13, color: BASE.textMain },

    cardList: { gap: 12, paddingHorizontal: 20 },
    subCpmkCard: {
        backgroundColor: BASE.surface, borderRadius: 20, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerLeft: { flex: 1, paddingRight: 8 },
    badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 },
    kodeBadge: { backgroundColor: BASE.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.surface, fontWeight: '700' },
    mkBadge: { backgroundColor: THEME.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    mkBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.textMain, fontWeight: '700' },
    bobotBadge: { backgroundColor: THEME.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    bobotBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.textMain, fontWeight: '700' },
    subCpmkNama: { fontFamily: 'Urbanist-Bold', fontSize: 14, fontWeight: '700', color: BASE.textMain, lineHeight: 20 },
    expandBtn: { padding: 4, flexShrink: 0 },
    divider: { height: 1, backgroundColor: BASE.borderLight, marginVertical: 12 },
    deskripsi: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textMuted, lineHeight: 19 },

    summaryCard: {
        marginHorizontal: 20, marginTop: 8,
        backgroundColor: BASE.surface, borderRadius: 16, padding: 14,
        borderWidth: 1, borderColor: BASE.border,
    },
    summaryText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textMuted },
    summaryBold: { fontFamily: 'Urbanist-Bold', fontWeight: '700', color: BASE.textMain },

    emptyCard: {
        backgroundColor: BASE.surface, borderRadius: 24, padding: 32,
        alignItems: 'center', gap: 12, elevation: 2, marginHorizontal: 20,
    },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textDisabled, textAlign: 'center' },
});
