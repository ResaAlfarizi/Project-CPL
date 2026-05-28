import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MataKuliahScreen({ kelasList = [] }) {
    const listMk = kelasList.map((k) => ({
        id:       k.id,
        kode:     k.mk_kode,
        nama:     k.mk_nama,
        sks:      k.sks,
        semester: k.semester,
        kelas:    k.kelas,
        ta:       k.ta,
    }));

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* ── Hero Banner (warna solid, foto UINSA ada di background screen) ── */}
            <View style={styles.heroBanner}>
                <Text style={styles.heroTitle}>Mata Kuliah & Pemetaan</Text>
                <Text style={styles.heroSubtitle}>Daftar mata kuliah dan kelas yang Anda ampu</Text>
            </View>

            {/* ── Card List ── */}
            <View style={styles.cardList}>
                {listMk.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <MaterialCommunityIcons name="book-off-outline" size={32} color="#CBD5E1" />
                        <Text style={styles.emptyText}>Belum ada mata kuliah yang diampu</Text>
                    </View>
                ) : (
                    listMk.map((mk) => (
                        <View key={mk.id} style={styles.mkCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.titleMeta}>
                                    <Text style={styles.mkName}>{mk.nama}</Text>
                                    <View style={styles.badgeRow}>
                                        <View style={styles.kodeBadge}>
                                            <Text style={styles.kodeBadgeText}>{mk.kode}</Text>
                                        </View>
                                        <View style={styles.sksBadge}>
                                            <Text style={styles.sksBadgeText}>{mk.sks} SKS</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.iconCircle}>
                                    <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#6366F1" />
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.detailsGrid}>
                                {renderDetailCell('calendar-clock',   'Tahun Akademik', mk.ta,              '#F1F5F9')}
                                {renderDetailCell('google-classroom',  'Kelas',          `Kelas ${mk.kelas}`, '#EFF0A3')}
                                {renderDetailCell('bookmark-outline',  'Semester',       mk.semester,        '#D8DFE9')}
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );

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
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { paddingBottom: 40 },

    /* Hero Banner — warna solid gelap, foto UINSA ada di belakang screen */
    heroBanner: {
        backgroundColor: 'rgba(15,40,25,0.82)',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 24,
        marginBottom: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    heroIconBadge: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    },
    heroTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
    heroSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 4 },
    heroPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10,
        backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start',
        borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4,
    },
    heroPillText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#EFF0A3', fontWeight: '700' },

    /* Cards */
    cardList: { gap: 16, paddingHorizontal: 20 },
    mkCard: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 24, padding: 20,
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

    /* Detail Grid */
    detailsGrid: { flexDirection: 'row', gap: 10 },
    detailCell: { flex: 1, gap: 6 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
    cellLabel: { fontFamily: 'Urbanist-Bold', fontSize: 9, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.3, flexShrink: 1 },
    cellValBadge: { borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8 },
    cellVal: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#212121', fontWeight: '700', lineHeight: 15 },

    /* Empty */
    emptyCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 24, padding: 32, alignItems: 'center', gap: 12, elevation: 2 },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#94A3B8', textAlign: 'center' },
});
