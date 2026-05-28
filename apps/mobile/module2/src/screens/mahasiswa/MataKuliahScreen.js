import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mahasiswaApi } from '../../services/api';

export default function MataKuliahScreen() {
    const [kelasList, setKelasList]           = useState([]);
    const [loading, setLoading]               = useState(true);
    const [search, setSearch]                 = useState('');
    const [selectedSemester, setSelectedSemester] = useState('all');

    useEffect(() => {
        // Endpoint kelas untuk mahasiswa - gunakan getAllKelas
        mahasiswaApi.getAllKelas()
            .then(res => setKelasList(res.data || []))
            .catch(() => setKelasList([]))
            .finally(() => setLoading(false));
    }, []);

    const semesters = [...new Set(kelasList.map(k => k.semester).filter(Boolean))];

    const filtered = kelasList.filter(k => {
        const q = search.toLowerCase();
        const matchSearch =
            (k.nama_mk || k.mk_nama || '').toLowerCase().includes(q) ||
            (k.kode_mk || k.mk_kode || '').toLowerCase().includes(q) ||
            (k.nama_kelas || k.kelas || '').toLowerCase().includes(q);
        const sem = k.semester_aktif ?? k.semester ?? '';
        const matchSemester = selectedSemester === 'all' || String(sem) === selectedSemester;
        return matchSearch && matchSemester;
    });

    const totalSks = filtered.reduce((sum, k) => sum + (k.sks || 0), 0);

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
                <Text style={styles.heroTitle}>Mata Kuliah</Text>
                <Text style={styles.heroSubtitle}>Daftar mata kuliah yang tersedia</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={18} color="#64748B" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Cari mata kuliah..."
                    value={search}
                    onChangeText={setSearch}
                    placeholderTextColor="#94A3B8"
                />
            </View>

            {/* Semester Filter */}
            {semesters.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterContent}
                >
                    <FilterChip
                        label="Semua"
                        active={selectedSemester === 'all'}
                        onPress={() => setSelectedSemester('all')}
                    />
                    {semesters.map(sem => (
                        <FilterChip
                            key={sem}
                            label={`Semester ${sem}`}
                            active={selectedSemester === String(sem)}
                            onPress={() => setSelectedSemester(String(sem))}
                        />
                    ))}
                </ScrollView>
            )}

            {/* Card List */}
            {filtered.length === 0 ? (
                <View style={styles.emptyCard}>
                    <MaterialCommunityIcons name="book-off-outline" size={32} color="#CBD5E1" />
                    <Text style={styles.emptyText}>Tidak ada mata kuliah ditemukan</Text>
                </View>
            ) : (
                <View style={styles.cardList}>
                    {filtered.map((k, idx) => {
                        const kodeMk   = k.kode_mk  || k.mk_kode  || '-';
                        const namaMk   = k.nama_mk  || k.mk_nama  || '-';
                        const namaKelas = k.nama_kelas || k.kelas  || '-';
                        const semester = k.semester_aktif ?? k.semester ?? '-';
                        const ta       = k.tahun_akademik || k.ta || '-';
                        const dosen    = k.dosen_pengampu || k.nama_dosen || '-';

                        return (
                            <View key={k.id || idx} style={styles.mkCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.titleMeta}>
                                        <Text style={styles.mkName}>{namaMk}</Text>
                                        <View style={styles.badgeRow}>
                                            <View style={styles.kodeBadge}>
                                                <Text style={styles.kodeBadgeText}>{kodeMk}</Text>
                                            </View>
                                            {k.sks ? (
                                                <View style={styles.sksBadge}>
                                                    <Text style={styles.sksBadgeText}>{k.sks} SKS</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                    <View style={styles.iconCircle}>
                                        <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#6366F1" />
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.detailsGrid}>
                                    {renderDetailCell('google-classroom',  'Kelas',    namaKelas,          '#EFF0A3')}
                                    {renderDetailCell('bookmark-outline',  'Semester', `Sem. ${semester}`, '#D8DFE9')}
                                    {renderDetailCell('calendar-clock',    'TA',       ta,                 '#F1F5F9')}
                                </View>

                                {dosen !== '-' && (
                                    <View style={styles.dosenRow}>
                                        <MaterialCommunityIcons name="account-tie-outline" size={13} color="#64748B" />
                                        <Text style={styles.dosenText}>{dosen}</Text>
                                    </View>
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
                        Menampilkan <Text style={styles.summaryBold}>{filtered.length}</Text> mata kuliah
                        {totalSks > 0 && (
                            <Text>  •  Total SKS: <Text style={styles.summaryBold}>{totalSks}</Text></Text>
                        )}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

function FilterChip({ label, active, onPress }) {
    return (
        <View
            style={[styles.chip, active && styles.chipActive]}
            onStartShouldSetResponder={() => true}
            onResponderRelease={onPress}
        >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
        </View>
    );
}

function renderDetailCell(iconName, label, value, bg = '#F1F5F9') {
    return (
        <View style={styles.detailCell} key={label}>
            <View style={styles.labelRow}>
                <MaterialCommunityIcons name={iconName} size={13} color="#64748B" />
                <Text style={styles.cellLabel}>{label}</Text>
            </View>
            <View style={[styles.cellValBadge, { backgroundColor: bg }]}>
                <Text style={styles.cellVal} numberOfLines={2}>{value}</Text>
            </View>
        </View>
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
    heroTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
    heroSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 4 },

    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16,
        marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 16,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 44, fontFamily: 'Urbanist-SemiBold', fontSize: 13, color: '#212121' },

    filterScroll: { marginBottom: 16 },
    filterContent: { paddingHorizontal: 20, gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99,
        backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 1, borderColor: '#E2E8F0',
    },
    chipActive: { backgroundColor: '#212121', borderColor: '#212121' },
    chipText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#64748B', fontWeight: '700' },
    chipTextActive: { color: '#FFFFFF' },

    cardList: { gap: 16, paddingHorizontal: 20 },
    mkCard: {
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 24, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 15, elevation: 3,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    titleMeta: { flex: 1, paddingRight: 10 },
    mkName: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121', fontWeight: '800', marginBottom: 8, lineHeight: 22 },
    badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
    kodeBadge: { backgroundColor: '#212121', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
    sksBadge: { backgroundColor: '#CFDECA', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    sksBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#212121', fontWeight: '700' },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

    detailsGrid: { flexDirection: 'row', gap: 10 },
    detailCell: { flex: 1, gap: 6 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
    cellLabel: { fontFamily: 'Urbanist-Bold', fontSize: 9, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.3, flexShrink: 1 },
    cellValBadge: { borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8 },
    cellVal: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#212121', fontWeight: '700', lineHeight: 15 },

    dosenRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
    dosenText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B' },

    summaryCard: {
        marginHorizontal: 20, marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 16, padding: 14,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
    },
    summaryText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B' },
    summaryBold: { fontFamily: 'Urbanist-Bold', fontWeight: '700', color: '#212121' },

    emptyCard: {
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 24, padding: 32,
        alignItems: 'center', gap: 12, elevation: 2, marginHorizontal: 20,
    },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#94A3B8', textAlign: 'center' },
});
