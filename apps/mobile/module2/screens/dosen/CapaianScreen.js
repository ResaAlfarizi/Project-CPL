import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { capaianApi } from '../../services/api';

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

    // Stats
    const uniqueStudents  = [...new Set(capaianList.map(c => c.mahasiswa_id || c.enrollment_id).filter(Boolean))];
    const totalMahasiswa  = uniqueStudents.length;
    const validNilai      = capaianList.map(c => c.nilai_capaian).filter(n => n != null && !isNaN(n));
    const averageNilai    = validNilai.length > 0
        ? (validNilai.reduce((s, v) => s + Number(v), 0) / validNilai.length).toFixed(1)
        : '0.0';
    const excellenceCount = capaianList.filter(c => (c.status || '').toLowerCase().includes('excellence')).length;

    const getStatusStyle = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('excellence'))  return { badge: styles.badgeExcellent,    text: styles.badgeExcellentText };
        if (s.includes('satisfactory')) return { badge: styles.badgeSatisfactory, text: styles.badgeSatisfactoryText };
        return { badge: styles.badgeNeedsImp, text: styles.badgeNeedsImpText };
    };

    const displayRows = capaianList.filter(c =>
        (c.nama_mahasiswa || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.nim || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.kode_cpl || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Banner UINSA */}
            <View style={styles.heroBanner}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Capaian CPL Mahasiswa</Text>
                    <Text style={styles.heroSubtitle}>Lihat capaian CPL mahasiswa untuk kelas yang Anda ampu</Text>
                </View>
            </View>

            {/* 1. Pilih Kelas Dropdown */}
            <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Pilih Kelas</Text>
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    style={styles.selectBtn}
                    onPress={() => setShowKelasDropdown(!showKelasDropdown)}
                >
                    <Text style={styles.selectBtnText}>
                        {selectedKelas
                            ? `${selectedKelas.mk_nama} - ${selectedKelas.kelas} (${selectedKelas.ta} ${selectedKelas.semester})`
                            : '-- Pilih Kelas --'}
                    </Text>
                    <MaterialCommunityIcons name={showKelasDropdown ? "menu-up" : "menu-down"} size={24} color="#64748B" />
                </TouchableOpacity>

                {showKelasDropdown && (
                    <View style={styles.dropdownOptions}>
                        {kelasList.length === 0 ? (
                            <View style={styles.dropdownOptionRow}>
                                <Text style={[styles.dropdownOptionText, { color: '#94A3B8' }]}>Tidak ada kelas tersedia</Text>
                            </View>
                        ) : kelasList.map((k) => (
                            <TouchableOpacity 
                                key={k.id} 
                                style={styles.dropdownOptionRow}
                                onPress={() => handleSelectKelas(k.id)}
                            >
                                <Text style={styles.dropdownOptionText}>
                                    {k.mk_nama} - {k.kelas} ({k.ta} {k.semester})
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
                        <MaterialCommunityIcons name="magnify" size={18} color="#64748B" style={styles.searchIcon} />
                        <TextInput 
                            style={styles.searchInput}
                            placeholder="Cari mahasiswa..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>

                    {/* Capaian Card List */}
                    <View style={styles.cardList}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#212121" style={{ marginTop: 16 }} />
                        ) : displayRows.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    {searchQuery ? 'Mahasiswa tidak ditemukan' : 'Belum ada data capaian untuk kelas ini'}
                                </Text>
                            </View>
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

    /* -- Hero Banner -- */
    heroBanner: { backgroundColor: 'rgba(15,40,25,0.82)', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, marginBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    
    heroOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(10,40,25,0.58)',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    heroContent: { padding: 20, paddingBottom: 22 },
    heroTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
    heroSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 4 },
    heroAddBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10,
        backgroundColor: '#EFF0A3', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5,
        alignSelf: 'flex-start',
    },
    heroAddBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#212121', fontWeight: '700' },
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
        color: '#212121',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 13,
        color: '#64748B',
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
        color: '#64748B',
        marginBottom: 8,
    },
    selectBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 16,
    },
    selectBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        fontWeight: '700',
        color: '#212121',
    },
    dropdownOptions: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
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
        borderBottomColor: '#F1F5F9',
    },
    dropdownOptionText: {
        fontFamily: 'Urbanist-SemiBold',
        fontSize: 13,
        color: '#212121',
    },
    contentSection: {
        marginTop: 4,
    },
    classInfoBar: {
        marginHorizontal: 24,
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    classBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    classInfoBadge: {
        backgroundColor: '#212121',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    classInfoBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 9,
        color: '#FFFFFF',
        fontWeight: '750',
    },
    classInfoName: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        fontWeight: '800',
        color: '#212121',
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
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.01)',
    },
    statLabel: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 8,
        fontWeight: '700',
        color: '#64748B',
    },
    statVal: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 20,
        fontWeight: '800',
        color: '#212121',
        marginTop: 4,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 16,
        marginHorizontal: 24,
        marginBottom: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontFamily: 'Urbanist-SemiBold',
        fontSize: 12,
        color: '#212121',
    },
    // Card List Styles (Replacing Table)
    cardList: {
        gap: 12,
        paddingHorizontal: 24,
    },
    capaianCard: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 15,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.01)',
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
        color: '#212121',
    },
    nimBadge: {
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    nimBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 9,
        color: '#64748B',
        fontWeight: '750',
    },
    cplBadge: {
        backgroundColor: '#D8DFE9', // Alice blue
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    cplBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        color: '#212121',
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
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
        color: '#64748B',
        textTransform: 'uppercase',
    },
    scoreVal: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 18,
        fontWeight: '800',
        color: '#212121',
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
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 12,
        color: '#64748B',
    }
});















