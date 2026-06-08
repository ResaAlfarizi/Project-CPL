import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { subCpmkApi, mahasiswaApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, EmptyState } from '../../components';

// ✅ THEME MAHASISWA (Orange)
const THEME = ROLE_THEMES.mahasiswa;

export default function SubCpmkScreen({ user }) {
    const [subCpmkList, setSubCpmkList] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [expandedId, setExpandedId]   = useState(null);
    const [expandedMkId, setExpandedMkId] = useState(null); // State untuk expand mata kuliah
    const [expandedCplId, setExpandedCplId] = useState(null); // ✅ BARU: State untuk expand CPL
    const [userProdiId, setUserProdiId] = useState(null);

    useEffect(() => {
        // Ambil prodi_id mahasiswa dan filter sub-CPMK
        const fetchProdiIdAndSubCpmk = async () => {
            try {
                // Ambil profil mahasiswa untuk mendapatkan prodi_id
                const profileRes = await mahasiswaApi.getMyProfile();
                const profileData = profileRes.data || profileRes;
                const prodiId = profileData.prodi_id || user?.prodi_id;
                setUserProdiId(prodiId);

                // Ambil semua sub-CPMK
                const subCpmkRes = await subCpmkApi.getAll();
                const allSubCpmk = subCpmkRes.data || [];
                
                console.log('🔍 SUB-CPMK - All data:', allSubCpmk);
                
                // Filter sub-CPMK berdasarkan prodi_id mahasiswa
                // Sub-CPMK terhubung ke mata_kuliah melalui mk_cpl, jadi perlu filter berdasarkan prodi_id dari mk
                const filteredSubCpmk = prodiId
                    ? allSubCpmk.filter(s => String(s.prodi_id) === String(prodiId))
                    : allSubCpmk;
                
                console.log('🔍 SUB-CPMK - Filtered by prodi:', filteredSubCpmk.length);
                setSubCpmkList(filteredSubCpmk);
            } catch (error) {
                console.error('❌ Error fetching sub-CPMK:', error);
                setSubCpmkList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProdiIdAndSubCpmk();
    }, [user]);

    const filtered = subCpmkList.filter(s => {
        const q = search.toLowerCase();
        return (
            (s.kode_sub_cpmk || '').toLowerCase().includes(q) ||
            (s.nama_sub_cpmk || '').toLowerCase().includes(q) ||
            (s.nama_mk || '').toLowerCase().includes(q) ||
            (s.kode_mk || '').toLowerCase().includes(q) ||
            (s.kode_cpl || '').toLowerCase().includes(q)
        );
    });

    // ✅ REVISI: Kelompokkan sub-CPMK per MK → CPL → Sub-CPMK
    const groupedByMk = filtered.reduce((acc, subCpmk) => {
        const mkKey = subCpmk.mk_id || 'unknown';
        const mkData = {
            mk_id: subCpmk.mk_id,
            kode_mk: subCpmk.kode_mk || '-',
            nama_mk: subCpmk.nama_mk || 'Mata Kuliah Tidak Diketahui',
        };
        
        if (!acc[mkKey]) {
            acc[mkKey] = {
                ...mkData,
                cplList: {} // Nested CPL grouping
            };
        }
        
        // Group by CPL within MK
        const cplKey = subCpmk.cpl_id || 'unknown';
        const cplData = {
            cpl_id: subCpmk.cpl_id,
            kode_cpl: subCpmk.kode_cpl || '-',
            deskripsi_cpl: subCpmk.deskripsi_cpl || 'CPL Tidak Diketahui',
        };
        
        if (!acc[mkKey].cplList[cplKey]) {
            acc[mkKey].cplList[cplKey] = {
                ...cplData,
                subCpmks: []
            };
        }
        
        acc[mkKey].cplList[cplKey].subCpmks.push(subCpmk);
        return acc;
    }, {});

    // Convert nested objects to arrays and sort
    const mkList = Object.values(groupedByMk).map(mk => ({
        ...mk,
        cplList: Object.values(mk.cplList).sort((a, b) => 
            (a.kode_cpl || '').localeCompare(b.kode_cpl || '')
        )
    })).sort((a, b) => 
        (a.kode_mk || '').localeCompare(b.kode_mk || '')
    );

    const totalSubCpmk = filtered.length;
    const totalCpl = mkList.reduce((sum, mk) => sum + mk.cplList.length, 0);

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

            {/* Card List - Grouped by MK → CPL → Sub-CPMK */}
            {mkList.length === 0 ? (
                <EmptyState icon="clipboard-off-outline" message="Tidak ada data Sub-CPMK" />
            ) : (
                <View style={styles.cardList}>
                    {mkList.map((mk, mkIndex) => {
                        const isMkExpanded = expandedMkId === mk.mk_id;
                        const mkKey = mk.mk_id || `mk-${mkIndex}`;
                        const totalSubCpmkInMk = mk.cplList.reduce((sum, cpl) => sum + cpl.subCpmks.length, 0);
                        
                        return (
                            <View key={mkKey} style={styles.mkSection}>
                                {/* Header Mata Kuliah */}
                                <TouchableOpacity 
                                    style={styles.mkHeader}
                                    onPress={() => setExpandedMkId(isMkExpanded ? null : mk.mk_id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.mkHeaderLeft}>
                                        <View style={styles.mkKodeBadge}>
                                            <Text style={styles.mkKodeBadgeText}>{mk.kode_mk}</Text>
                                        </View>
                                        <View style={styles.mkInfo}>
                                            <Text style={styles.mkNama} numberOfLines={2}>{mk.nama_mk}</Text>
                                            <Text style={styles.mkSubCount}>
                                                {mk.cplList.length} CPL • {totalSubCpmkInMk} Sub-CPMK
                                            </Text>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons
                                        name={isMkExpanded ? 'chevron-up' : 'chevron-down'}
                                        size={24}
                                        color={BASE.primary}
                                    />
                                </TouchableOpacity>

                                {/* Daftar CPL dalam Mata Kuliah */}
                                {isMkExpanded && (
                                    <View style={styles.cplContainer}>
                                        {mk.cplList.map((cpl, cplIndex) => {
                                            const isCplExpanded = expandedCplId === `${mkKey}-${cpl.cpl_id}`;
                                            const cplKey = `${mkKey}-cpl-${cpl.cpl_id || cplIndex}`;
                                            
                                            return (
                                                <View key={cplKey} style={styles.cplSection}>
                                                    {/* Header CPL */}
                                                    <TouchableOpacity 
                                                        style={styles.cplHeader}
                                                        onPress={() => setExpandedCplId(isCplExpanded ? null : `${mkKey}-${cpl.cpl_id}`)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <View style={styles.cplHeaderLeft}>
                                                            <View style={styles.cplKodeBadge}>
                                                                <Text style={styles.cplKodeBadgeText}>{cpl.kode_cpl}</Text>
                                                            </View>
                                                            <View style={styles.cplInfo}>
                                                                <Text style={styles.cplDeskripsi} numberOfLines={1}>
                                                                    {cpl.deskripsi_cpl}
                                                                </Text>
                                                                <Text style={styles.cplSubCount}>
                                                                    {cpl.subCpmks.length} Sub-CPMK
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <MaterialCommunityIcons
                                                            name={isCplExpanded ? 'chevron-up' : 'chevron-down'}
                                                            size={20}
                                                            color={BASE.textMuted}
                                                        />
                                                    </TouchableOpacity>

                                                    {/* Daftar Sub-CPMK dalam CPL */}
                                                    {isCplExpanded && (
                                                        <View style={styles.subCpmkContainer}>
                                                            {cpl.subCpmks.map((subCpmk, subIndex) => {
                                                                const subKey = `${cplKey}-sub-${subCpmk.id || subIndex}`;
                                                                
                                                                return (
                                                                    <View key={subKey} style={styles.subCpmkCard}>
                                                                        <View style={styles.cardHeader}>
                                                                            <View style={styles.headerLeft}>
                                                                                <View style={styles.badgeRow}>
                                                                                    <View style={styles.kodeBadge}>
                                                                                        <Text style={styles.kodeBadgeText}>{subCpmk.kode_sub_cpmk || '-'}</Text>
                                                                                    </View>
                                                                                    {subCpmk.bobot && (
                                                                                        <View style={styles.bobotBadge}>
                                                                                            <Text style={styles.bobotBadgeText}>Bobot: {subCpmk.bobot}%</Text>
                                                                                        </View>
                                                                                    )}
                                                                                </View>
                                                                                <Text style={styles.subCpmkNama}>
                                                                                    {subCpmk.nama_sub_cpmk || '-'}
                                                                                </Text>
                                                                                
                                                                                {/* ✅ BARU: Tampilkan deskripsi langsung */}
                                                                                {subCpmk.deskripsi && (
                                                                                    <>
                                                                                        <View style={styles.divider} />
                                                                                        <Text style={styles.deskripsi}>{subCpmk.deskripsi}</Text>
                                                                                    </>
                                                                                )}
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                );
                                                            })}
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Summary */}
            {totalSubCpmk > 0 && (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>
                        Menampilkan <Text style={styles.summaryBold}>{totalSubCpmk}</Text> Sub-CPMK dari <Text style={styles.summaryBold}>{totalCpl}</Text> CPL dalam <Text style={styles.summaryBold}>{mkList.length}</Text> Mata Kuliah
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

    cardList: { gap: 16, paddingHorizontal: 20 },
    
    // ✅ BARU: Styling untuk Section Mata Kuliah
    mkSection: {
        backgroundColor: BASE.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: BASE.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    mkHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: THEME.secondary,
    },
    mkHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    mkKodeBadge: {
        backgroundColor: BASE.primary,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    mkKodeBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        color: BASE.surface,
        fontWeight: '700',
    },
    mkInfo: {
        flex: 1,
    },
    mkNama: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '700',
        color: BASE.textMain,
        lineHeight: 19,
        marginBottom: 2,
    },
    mkSubCount: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 11,
        color: BASE.textMuted,
    },
    
    // ✅ BARU: Container untuk daftar CPL
    cplContainer: {
        padding: 10,
        gap: 10,
        backgroundColor: BASE.borderLight,
    },
    
    // ✅ BARU: Styling untuk Section CPL
    cplSection: {
        backgroundColor: BASE.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: BASE.border,
        overflow: 'hidden',
    },
    cplHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: THEME.primary,
    },
    cplHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    cplKodeBadge: {
        backgroundColor: BASE.primary,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    cplKodeBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        color: BASE.surface,
        fontWeight: '700',
    },
    cplInfo: {
        flex: 1,
    },
    cplDeskripsi: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        fontWeight: '700',
        color: BASE.textMain,
        lineHeight: 17,
        marginBottom: 2,
    },
    cplSubCount: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 10,
        color: BASE.textMuted,
    },
    
    // ✅ REVISI: Container untuk daftar Sub-CPMK (nested dalam CPL)
    subCpmkContainer: {
        padding: 10,
        gap: 8,
        backgroundColor: BASE.background,
    },
    
    subCpmkCard: {
        backgroundColor: BASE.surface,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: BASE.border,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerLeft: { flex: 1, paddingRight: 8 },
    badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 },
    kodeBadge: { backgroundColor: BASE.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 9, color: BASE.surface, fontWeight: '700' },
    bobotBadge: { backgroundColor: THEME.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    bobotBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 9, color: BASE.textMain, fontWeight: '700' },
    subCpmkNama: { fontFamily: 'Urbanist-Bold', fontSize: 12, fontWeight: '700', color: BASE.textMain, lineHeight: 17 },
    expandBtn: { padding: 4, flexShrink: 0 },
    divider: { height: 1, backgroundColor: BASE.borderLight, marginVertical: 10 },
    deskripsi: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: BASE.textMuted, lineHeight: 17 },

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
