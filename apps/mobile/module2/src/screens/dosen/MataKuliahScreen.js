import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { EmptyState } from '../../components';

// ✅ THEME DOSEN (Green)
const THEME = ROLE_THEMES.dosen;

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
                    <EmptyState 
                        icon="book-off-outline" 
                        message="Belum ada mata kuliah yang diampu" 
                    />
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
                                {renderDetailCell('calendar-clock',   'Tahun Akademik', mk.ta,              BASE.borderLight)}
                                {renderDetailCell('google-classroom',  'Kelas',          `Kelas ${mk.kelas}`, THEME.accent)}
                                {renderDetailCell('bookmark-outline',  'Semester',       mk.semester,        THEME.secondary)}
                            </View>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );

    function renderDetailCell(iconName, label, value, bg = BASE.borderLight) {
        return (
            <View style={styles.detailCell} key={label}>
                <View style={styles.labelRow}>
                    <MaterialCommunityIcons name={iconName} size={13} color={BASE.textMuted} />
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

    /* Hero Banner — warna THEME Dosen */
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
    heroTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: BASE.textMain, letterSpacing: -0.4 },
    heroSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textMuted, marginTop: 4 },

    /* Cards */
    cardList: { gap: 16, paddingHorizontal: 20 },
    mkCard: {
        backgroundColor: BASE.surface,
        borderRadius: 24, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 15, elevation: 3,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    titleMeta: { flex: 1, paddingRight: 10 },
    mkName: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: BASE.textMain, fontWeight: '800', marginBottom: 8, lineHeight: 22 },
    badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
    kodeBadge: { backgroundColor: BASE.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.surface, fontWeight: '700' },
    sksBadge: { backgroundColor: THEME.secondary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    sksBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.textMain, fontWeight: '700' },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.accent, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    divider: { height: 1, backgroundColor: BASE.border, marginVertical: 16 },

    /* Detail Grid */
    detailsGrid: { flexDirection: 'row', gap: 10 },
    detailCell: { flex: 1, gap: 6 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
    cellLabel: { fontFamily: 'Urbanist-Bold', fontSize: 9, fontWeight: '700', color: BASE.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, flexShrink: 1 },
    cellValBadge: { borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8 },
    cellVal: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: BASE.textMain, fontWeight: '700', lineHeight: 15 },
});
