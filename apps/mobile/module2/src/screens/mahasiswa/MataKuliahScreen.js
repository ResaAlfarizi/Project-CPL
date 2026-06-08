import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mahasiswaApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, EmptyState } from '../../components';

// ✅ THEME MAHASISWA (Orange)
const THEME = ROLE_THEMES.mahasiswa;

export default function MataKuliahScreen({ user }) {
    const [kelasList, setKelasList]           = useState([]);
    const [loading, setLoading]               = useState(true);
    const [search, setSearch]                 = useState('');
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [userProdiId, setUserProdiId]       = useState(null);

    useEffect(() => {
        // Ambil prodi_id mahasiswa dari profil
        const fetchProdiIdAndKelas = async () => {
            try {
                const profileRes = await mahasiswaApi.getMyProfile();
                const profileData = profileRes.data || profileRes;
                const prodiId = profileData.prodi_id || user?.prodi_id;
                setUserProdiId(prodiId);

                // Ambil semua kelas lalu filter berdasarkan prodi mahasiswa
                const kelasRes = await mahasiswaApi.getAllKelas();
                const allKelas = kelasRes.data || [];
                
                // Filter kelas berdasarkan prodi_id mahasiswa
                // Kelas memiliki relasi ke mata_kuliah yang memiliki prodi_id
                const filteredKelas = prodiId 
                    ? allKelas.filter(k => String(k.prodi_id) === String(prodiId))
                    : allKelas;
                
                setKelasList(filteredKelas);
            } catch (error) {
                console.error('Error fetching kelas:', error);
                setKelasList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProdiIdAndKelas();
    }, [user]);

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
        return <LoadingState message="Memuat data mata kuliah..." color={BASE.primary} />;
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
                <EmptyState icon="book-off-outline" message="Tidak ada mata kuliah ditemukan" />
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
    container: { flex: 1, backgroundColor: BASE.background },
    scrollContent: { paddingBottom: 40 },

    heroBanner: {
        backgroundColor: THEME.secondary,
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24,
        marginBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    heroTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: BASE.textMain, letterSpacing: -0.4 },
    heroSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: BASE.textMuted, marginTop: 4 },

    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: BASE.surface, borderRadius: 16,
        marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 16,
        borderWidth: 1, borderColor: BASE.border,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 44, fontFamily: 'Urbanist-SemiBold', fontSize: 13, color: BASE.textMain },

    filterScroll: { marginBottom: 16 },
    filterContent: { paddingHorizontal: 20, gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99,
        backgroundColor: BASE.surface, borderWidth: 1, borderColor: BASE.border,
    },
    chipActive: { backgroundColor: BASE.primary, borderColor: BASE.primary },
    chipText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: BASE.textMuted, fontWeight: '700' },
    chipTextActive: { color: BASE.surface },

    cardList: { gap: 16, paddingHorizontal: 20 },
    mkCard: {
        backgroundColor: BASE.surface, borderRadius: 24, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 15, elevation: 3,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    titleMeta: { flex: 1, paddingRight: 10 },
    mkName: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain, fontWeight: '800', marginBottom: 8, lineHeight: 22 },
    badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
    kodeBadge: { backgroundColor: BASE.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.surface, fontWeight: '700' },
    sksBadge: { backgroundColor: THEME.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    sksBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.textMain, fontWeight: '700' },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    divider: { height: 1, backgroundColor: BASE.borderLight, marginVertical: 16 },

    detailsGrid: { flexDirection: 'row', gap: 10 },
    detailCell: { flex: 1, gap: 6 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
    cellLabel: { fontFamily: 'Urbanist-Bold', fontSize: 9, fontWeight: '700', color: BASE.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, flexShrink: 1 },
    cellValBadge: { borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8 },
    cellVal: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: BASE.textMain, fontWeight: '700', lineHeight: 15 },

    dosenRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
    dosenText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: BASE.textMuted },

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
