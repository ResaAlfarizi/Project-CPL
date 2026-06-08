import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mahasiswaApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, EmptyState } from '../../components';

// ✅ THEME MAHASISWA (Orange)
const THEME = ROLE_THEMES.mahasiswa;

export default function CapaianScreen({ user }) {
    const [capaianList, setCapaianList] = useState([]);
    const [capaianDetail, setCapaianDetail] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCplId, setExpandedCplId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Ambil profil mahasiswa untuk mendapatkan prodi_id
                const profileRes = await mahasiswaApi.getMyProfile();
                const profileData = profileRes.data || profileRes;
                const prodiId = profileData.prodi_id || user?.prodi_id;

                console.log('🔍 CAPAIAN - User prodi_id:', prodiId);

                // 2. Fetch capaian CPL (summary)
                const capaianRes = await mahasiswaApi.getMyCapaian();
                const allCapaian = capaianRes.data || [];
                
                console.log('🔍 CAPAIAN - All capaian:', allCapaian);
                console.log('🔍 CAPAIAN - Count:', allCapaian.length);
                setCapaianList(allCapaian);
                
                // 3. Fetch capaian detail per MK
                const detailRes = await mahasiswaApi.getMyCapaianDetail();
                const allDetail = detailRes.data || [];
                
                console.log('🔍 CAPAIAN - All detail:', allDetail);
                console.log('🔍 CAPAIAN - Detail count:', allDetail.length);
                setCapaianDetail(allDetail);
            } catch (error) {
                console.error('❌ CAPAIAN - Error fetching capaian:', error);
                setCapaianList([]);
                setCapaianDetail([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [user]);

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

    const handleToggleDetail = (cplId) => {
        setExpandedCplId(expandedCplId === cplId ? null : cplId);
    };

    // Group detail by kode_cpl
    const getDetailByCpl = (kodeCpl) => {
        return capaianDetail
            .filter(d => d.kode_cpl === kodeCpl)
            .sort((a, b) => {
                // Sort by kode_mk
                return (a.kode_mk || '').localeCompare(b.kode_mk || '');
            });
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
                    capaianList.map((capaian, capaianIdx) => {
                        // ✅ FIX: Gunakan rata_rata_nilai dari backend, bukan persentase
                        const nilaiCpl = parseFloat(capaian.rata_rata_nilai || capaian.nilai_cpl_total || capaian.persentase || 0);
                        const statusCpl = capaian.status_capaian || capaian.status || '-';
                        const statusColor = getStatusColor(statusCpl);
                        const progressColor = getProgressColor(nilaiCpl);
                        const kodeCpl = capaian.kode_cpl || '-';
                        const isExpanded = expandedCplId === capaian.cpl_id;
                        const detailList = getDetailByCpl(kodeCpl);
                        const hasDetail = detailList.length > 0;

                        // ✅ FIX: Gunakan nilai_minimum sebagai target threshold
                        const targetValue = parseFloat(capaian.nilai_minimum || 75);

                        return (
                            <View key={`cpl-${capaian.cpl_id || capaianIdx}`}>
                                {/* Card CPL */}
                                <View style={styles.capaianCard}>
                                    <View style={styles.capaianHeader}>
                                        <View style={styles.capaianLeft}>
                                            <View style={styles.badgeRow}>
                                                <View style={styles.kodeBadge}>
                                                    <Text style={styles.kodeBadgeText}>{kodeCpl}</Text>
                                                </View>
                                                {statusCpl && statusCpl !== '-' && (
                                                    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                                                        <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
                                                            {statusCpl}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.capaianNama}>{capaian.deskripsi_cpl || '-'}</Text>
                                        </View>
                                        <View style={styles.capaianRight}>
                                            <Text style={styles.persentaseValue}>{nilaiCpl.toFixed(1)}</Text>
                                            <Text style={styles.targetText}>Target: {targetValue.toFixed(0)}</Text>
                                        </View>
                                    </View>

                                    {/* Progress Bar */}
                                    <View style={styles.progressContainer}>
                                        <View style={styles.progressBg}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    { width: `${Math.min(nilaiCpl, 100)}%`, backgroundColor: progressColor }
                                                ]}
                                            />
                                        </View>
                                        <View
                                            style={[
                                                styles.targetMarker,
                                                { left: `${Math.min(targetValue, 100)}%` }
                                            ]}
                                        />
                                    </View>

                                    {/* Nilai CPL Total */}
                                    <View style={styles.nilaiContainer}>
                                        <MaterialCommunityIcons name="sigma" size={14} color={BASE.textMuted} />
                                        <Text style={styles.nilaiText}>
                                            Nilai Total CPL: <Text style={styles.nilaiBold}>{nilaiCpl.toFixed(2)}</Text>
                                        </Text>
                                    </View>

                                    {/* Toggle Detail Button */}
                                    {hasDetail && (
                                        <TouchableOpacity 
                                            style={styles.toggleDetailBtn}
                                            onPress={() => handleToggleDetail(capaian.cpl_id)}
                                            activeOpacity={0.7}
                                        >
                                            <MaterialCommunityIcons 
                                                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                                                size={16} 
                                                color={BASE.textMuted} 
                                            />
                                            <Text style={styles.toggleDetailText}>
                                                {isExpanded ? 'Sembunyikan' : 'Lihat'} Detail per Mata Kuliah ({detailList.length})
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* ✅ FIX: Tabel Detail Langsung di Bawah Card CPL yang Di-expand */}
                                {isExpanded && hasDetail && (
                                    <View style={styles.detailSection}>
                                        <View style={styles.detailSectionHeader}>
                                            <MaterialCommunityIcons name="book-open-outline" size={18} color={BASE.primary} />
                                            <Text style={styles.detailSectionTitle}>
                                                Detail Mata Kuliah - {kodeCpl}
                                            </Text>
                                        </View>
                                        <Text style={styles.detailSectionSubtitle}>
                                            Daftar nilai capaian per mata kuliah
                                        </Text>
                                        
                                        <View style={styles.mkTableContainer}>
                                            {detailList.map((detail, idx) => {
                                                const detailStatus = getStatusColor(detail.status);
                                                const uniqueKey = `mk-${kodeCpl}-${detail.kode_mk || 'unknown'}-${idx}`;
                                                return (
                                                    <View key={uniqueKey} style={styles.mkCard}>
                                                        <View style={styles.mkCardHeader}>
                                                            <View style={styles.mkBadge}>
                                                                <Text style={styles.mkBadgeText}>{detail.kode_mk || '-'}</Text>
                                                            </View>
                                                            {detail.status && (
                                                                <View style={[styles.mkStatusBadge, { backgroundColor: detailStatus.bg }]}>
                                                                    <Text style={[styles.mkStatusText, { color: detailStatus.text }]}>
                                                                        {detail.status}
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <Text style={styles.mkNama} numberOfLines={2}>
                                                            {detail.nama_mk || '-'}
                                                        </Text>
                                                        <View style={styles.mkMetaRow}>
                                                            <View style={styles.mkMetaItem}>
                                                                <MaterialCommunityIcons name="calendar" size={12} color={BASE.textMuted} />
                                                                <Text style={styles.mkMetaText}>
                                                                    {detail.semester_aktif ? `Sem ${detail.semester_aktif}` : '-'}
                                                                </Text>
                                                            </View>
                                                            <View style={styles.mkMetaItem}>
                                                                <MaterialCommunityIcons name="calendar-range" size={12} color={BASE.textMuted} />
                                                                <Text style={styles.mkMetaText}>
                                                                    {detail.tahun_akademik || '-'}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.mkNilaiRow}>
                                                            <Text style={styles.mkNilaiLabel}>Nilai Capaian:</Text>
                                                            <Text style={styles.mkNilaiValue}>
                                                                {detail.nilai !== null && detail.nilai !== undefined 
                                                                    ? (typeof detail.nilai === 'number' 
                                                                        ? detail.nilai.toFixed(2) 
                                                                        : parseFloat(detail.nilai).toFixed(2))
                                                                    : '-'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
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

    cardList: { gap: 14, paddingHorizontal: 20, marginBottom: 20 },
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
    
    nilaiContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6, 
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: BASE.borderLight,
        borderRadius: 8,
        alignSelf: 'flex-start'
    },
    nilaiText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: BASE.textMuted },
    nilaiBold: { fontFamily: 'Urbanist-Bold', fontWeight: '700', color: BASE.textMain, fontSize: 13 },

    // Toggle Detail Button
    toggleDetailBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 6, 
        paddingVertical: 10, 
        paddingHorizontal: 12,
        backgroundColor: BASE.borderLight, 
        borderRadius: 10, 
        marginTop: 12 
    },
    toggleDetailText: { fontFamily: 'Urbanist-Bold', fontSize: 12, fontWeight: '700', color: BASE.textMuted },

    // ===== SECTION TERPISAH UNTUK TABEL MATA KULIAH =====
    detailSection: {
        backgroundColor: BASE.borderLight,
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: BASE.border,
    },
    detailSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    detailSectionTitle: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '800',
        color: BASE.textMain,
    },
    detailSectionSubtitle: {
        fontFamily: 'Urbanist-Regular',
        fontSize: 11,
        color: BASE.textMuted,
        marginBottom: 12,
    },
    
    // Tabel Mata Kuliah
    mkTableContainer: {
        gap: 10,
    },
    mkCard: {
        backgroundColor: BASE.surface,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: BASE.border,
    },
    mkCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    mkBadge: {
        backgroundColor: BASE.primary,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    mkBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        fontWeight: '700',
        color: BASE.surface,
    },
    mkStatusBadge: {
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    mkStatusText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        fontWeight: '700',
    },
    mkNama: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        fontWeight: '700',
        color: BASE.textMain,
        marginBottom: 6,
        lineHeight: 17,
    },
    mkMetaRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    mkMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    mkMetaText: {
        fontFamily: 'Urbanist-Regular',
        fontSize: 10,
        color: BASE.textMuted,
    },
    mkNilaiRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: BASE.borderLight,
    },
    mkNilaiLabel: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 11,
        color: BASE.textMuted,
    },
    mkNilaiValue: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 18,
        fontWeight: '800',
        color: BASE.textMain,
    },

    emptyCard: {
        backgroundColor: BASE.surface, borderRadius: 20, padding: 32,
        alignItems: 'center', gap: 12, elevation: 2,
    },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textDisabled, textAlign: 'center' },
});
