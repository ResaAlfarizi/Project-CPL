import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { capaianApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { EmptyState } from '../../components';

// ✅ THEME DOSEN (Green)
const THEME = ROLE_THEMES.dosen;

export default function CapaianScreen({ kelasList = [] }) {
    const [selectedKelasId, setSelectedKelasId] = useState('');
    const [showKelasDropdown, setShowKelasDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [capaianList, setCapaianList] = useState([]);
    const [loading, setLoading] = useState(false);

    const selectedKelas = kelasList.find(k => k.id === selectedKelasId) || null;

    // Fetch capaian dari API saat kelas dipilih
    useEffect(() => {
        if (!selectedKelasId) { setCapaianList([]); return; }
        setLoading(true);
        capaianApi.getByKelas(selectedKelasId)
            .then(res => setCapaianList(res.data || []))
            .catch(() => setCapaianList([]))
            .finally(() => setLoading(false));
    }, [selectedKelasId]);

    const handleSelectKelas = (id) => {
        setSelectedKelasId(id);
        setShowKelasDropdown(false);
        setSearchQuery('');
    };

    const displayRows = capaianList.filter(c =>
        (c.nama_mahasiswa || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.nim || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.kode_cpl || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats dihitung dari displayRows (sama seperti web dosen — dari data yang terfilter)
    const uniqueStudents  = new Set(
        displayRows.map(c => c.mahasiswa_id || c.enrollment_id).filter(id => id != null && id !== '')
    );
    const totalMahasiswa  = uniqueStudents.size;
    const validNilai      = displayRows.map(c => c.nilai_capaian).filter(n => n != null && !isNaN(n));
    const averageNilai    = validNilai.length > 0
        ? (validNilai.reduce((s, v) => s + Number(v), 0) / validNilai.length).toFixed(1)
        : '0.0';
    const excellenceCount = displayRows.filter(c => (c.status || '').toLowerCase().includes('excellence')).length;

    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('excellence'))   return { badge: styles.badgeExcellent,    text: styles.badgeExcellentText };
        if (s.includes('satisfactory')) return { badge: styles.badgeSatisfactory, text: styles.badgeSatisfactoryText };
        return { badge: styles.badgeNeedsImp, text: styles.badgeNeedsImpText };
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Banner */}
            <View style={styles.heroBanner}>
                <Text style={styles.heroTitle}>Capaian CPL Mahasiswa</Text>
                <Text style={styles.heroSubtitle}>Lihat capaian CPL mahasiswa untuk kelas yang Anda ampu</Text>
            </View>

            {/* 1. Pilih Kelas Dropdown */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Pilih Kelas</Text>
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    style={styles.selectBtn}
                    onPress={() => setShowKelasDropdown(!showKelasDropdown)}
                >
                    <View style={{ flex: 1, marginRight: 8 }}>
                        {selectedKelas ? (
                            <>
                                <Text style={styles.selectBtnText} numberOfLines={1}>
                                    {selectedKelas.mk_nama}
                                </Text>
                                <Text style={styles.selectBtnSub} numberOfLines={1}>
                                    Kelas {selectedKelas.kelas} • {selectedKelas.ta} {selectedKelas.semester}
                                </Text>
                            </>
                        ) : (
                            <Text style={[styles.selectBtnText, { color: BASE.textDisabled, fontWeight: '400' }]}>
                                -- Pilih Kelas --
                            </Text>
                        )}
                    </View>
                    <MaterialCommunityIcons name={showKelasDropdown ? "menu-up" : "menu-down"} size={24} color={BASE.textMuted} />
                </TouchableOpacity>

                {showKelasDropdown && (
                    <View style={styles.dropdownOptions}>
                        {kelasList.length === 0 ? (
                            <View style={styles.dropdownOptionRow}>
                                <Text style={[styles.dropdownOptionText, { color: BASE.textDisabled }]}>Tidak ada kelas tersedia</Text>
                            </View>
                        ) : kelasList.map((k) => (
                            <TouchableOpacity 
                                key={k.id} 
                                style={styles.dropdownOptionRow}
                                onPress={() => handleSelectKelas(k.id)}
                            >
                                <Text style={styles.dropdownOptionText} numberOfLines={1}>
                                    {k.mk_nama}
                                </Text>
                                <Text style={styles.dropdownOptionSub} numberOfLines={1}>
                                    Kelas {k.kelas} • {k.ta} {k.semester}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* If class is selected */}
            {selectedKelas && (
                <View style={styles.contentSection}>
                    {/* Class Tag Banner */}
                    <View style={styles.classInfoBar}>
                        <View style={styles.classBadgeRow}>
                            <View style={styles.classInfoBadge}>
                                <Text style={styles.classInfoBadgeText}>{selectedKelas.mk_kode}</Text>
                            </View>
                            <Text style={styles.classInfoName}>{selectedKelas.mk_nama} {selectedKelas.kelas}</Text>
                        </View>
                    </View>

                    {/* Stats Badges row: Total Mahasiswa, Rerata Nilai, Excellence (Image 9) */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>TOTAL MAHASISWA</Text>
                            <Text style={styles.statVal}>{totalMahasiswa}</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>RATA-RATA NILAI</Text>
                            <Text style={styles.statVal}>{averageNilai}</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statLabel}>EXCELLENCE</Text>
                            <Text style={[styles.statVal, { color: '#28C76F' }]}>{excellenceCount}</Text>
                        </View>
                    </View>

                    {/* Search box filter */}
                    <View style={styles.searchBox}>
                        <MaterialCommunityIcons name="magnify" size={18} color={BASE.textMuted} style={styles.searchIcon} />
                        <TextInput 
                            style={styles.searchInput}
                            placeholder="Cari mahasiswa..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={BASE.textDisabled}
                        />
                    </View>

                    {/* Capaian Card List */}
                    <View style={styles.cardList}>
                        {loading ? (
                            <ActivityIndicator size="large" color={BASE.primary} style={{ marginTop: 16 }} />
                        ) : displayRows.length === 0 ? (
                            <EmptyState 
                                icon="clipboard-text-off-outline" 
                                message={searchQuery ? 'Mahasiswa tidak ditemukan' : 'Belum ada data capaian untuk kelas ini'} 
                            />
                        ) : displayRows.map((c, idx) => {
                            const { badge, text } = getStatusStyle(c.status);
                            return (
                                <View key={c.id || `${c.mahasiswa_id}-${c.cpl_id}-${idx}`} style={styles.capaianCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.studentMeta}>
                                            <Text style={styles.studentName}>{c.nama_mahasiswa || '-'}</Text>
                                            <View style={styles.nimBadge}>
                                                <Text style={styles.nimBadgeText}>NIM: {c.nim || '-'}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.cplBadge}>
                                            <Text style={styles.cplBadgeText}>{c.kode_cpl || '-'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.cardBody}>
                                        <View style={styles.scoreGroup}>
                                            <Text style={styles.scoreLabel}>Nilai Capaian</Text>
                                            <Text style={styles.scoreVal}>
                                                {c.nilai_capaian != null ? Number(c.nilai_capaian).toFixed(1) : '-'}
                                            </Text>
                                        </View>
                                        {c.status ? (
                                            <View style={[styles.statusBadge, badge]}>
                                                <Text style={[styles.statusBadgeText, text]}>{c.status}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    bgFull: { flex: 1 },
    bgOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(246,245,250,0.82)',
    },

    /* -- Hero Banner — warna THEME Dosen -- */
    heroBanner: {
        backgroundColor: THEME.primary,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 28,
        marginBottom: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 4,
    },
    heroContent: { },
    heroTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: BASE.textMain, letterSpacing: -0.4 },
    heroSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textMuted, marginTop: 4 },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
    },
    title: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 24,
        fontWeight: '800',
        color: BASE.textMain,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 13,
        color: BASE.textMuted,
        marginTop: 2,
        lineHeight: 18,
    },
    formGroup: {
        marginHorizontal: 24,
        marginBottom: 20,
    },
    formLabel: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: BASE.textMuted,
        marginBottom: 8,
    },
    selectBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BASE.border,
        backgroundColor: BASE.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    selectBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        fontWeight: '700',
        color: BASE.textMain,
    },
    selectBtnSub: {
        fontFamily: 'Urbanist-Regular',
        fontSize: 11,
        color: BASE.textMuted,
        marginTop: 2,
    },
    dropdownOptions: {
        backgroundColor: BASE.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BASE.border,
        marginTop: 6,
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    dropdownOptionRow: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: BASE.borderLight,
    },
    dropdownOptionText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        color: BASE.textMain,
    },
    dropdownOptionSub: {
        fontFamily: 'Urbanist-Regular',
        fontSize: 11,
        color: BASE.textMuted,
        marginTop: 2,
    },
    contentSection: {
        marginTop: 4,
    },
    classInfoBar: {
        marginHorizontal: 24,
        marginBottom: 16,
        backgroundColor: BASE.surface,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: BASE.border,
    },
    classBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    classInfoBadge: {
        backgroundColor: BASE.primary,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    classInfoBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 9,
        color: BASE.surface,
        fontWeight: '750',
    },
    classInfoName: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        fontWeight: '800',
        color: BASE.textMain,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 24,
        marginBottom: 20,
        gap: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: BASE.surface,
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 1,
        borderWidth: 1,
        borderColor: BASE.border,
    },
    statLabel: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 8,
        fontWeight: '700',
        color: BASE.textMuted,
    },
    statVal: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 20,
        fontWeight: '800',
        color: BASE.textMain,
        marginTop: 4,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BASE.surface,
        borderRadius: 16,
        marginHorizontal: 24,
        marginBottom: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: BASE.border,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontFamily: 'Urbanist-SemiBold',
        fontSize: 12,
        color: BASE.textMain,
    },
    // Card List Styles (Replacing Table)
    cardList: {
        gap: 12,
        paddingHorizontal: 24,
    },
    capaianCard: {
        backgroundColor: BASE.surface,
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 15,
        elevation: 2,
        borderWidth: 1,
        borderColor: BASE.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    studentMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    studentName: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '800',
        color: BASE.textMain,
    },
    nimBadge: {
        backgroundColor: BASE.borderLight,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    nimBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 9,
        color: BASE.textMuted,
        fontWeight: '750',
    },
    cplBadge: {
        backgroundColor: THEME.secondary,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    cplBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        color: BASE.textMain,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: BASE.border,
        marginVertical: 12,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scoreGroup: {
        gap: 4,
    },
    scoreLabel: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 9,
        fontWeight: '700',
        color: BASE.textMuted,
        textTransform: 'uppercase',
    },
    scoreVal: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 18,
        fontWeight: '800',
        color: BASE.textMain,
    },
    statusBadge: {
        borderRadius: 99,
        paddingVertical: 6,
        paddingHorizontal: 12,
        minWidth: 90,
        alignItems: 'center',
    },
    statusBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        fontWeight: '800',
    },
    badgeExcellent: {
        backgroundColor: 'rgba(40, 199, 111, 0.12)',
    },
    badgeExcellentText: {
        color: '#28C76F',
    },
    badgeSatisfactory: {
        backgroundColor: 'rgba(0, 207, 232, 0.12)',
    },
    badgeSatisfactoryText: {
        color: '#00CFE8',
    },
    badgeNeedsImp: {
        backgroundColor: 'rgba(255, 159, 67, 0.12)',
    },
    badgeNeedsImpText: {
        color: '#FF9F43',
    },
});















