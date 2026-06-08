import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { prodiApi, mahasiswaApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { EmptyState, LoadingState } from '../../components';

// ✅ THEME MAHASISWA (Orange)
const THEME = ROLE_THEMES.mahasiswa;

export default function DashboardScreen({ user, onNavigate }) {
    const [prodiList, setProdiList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProdiId, setUserProdiId] = useState(null);

    useEffect(() => {
        const fetchProdiIdAndProdi = async () => {
            try {
                // Ambil profil mahasiswa untuk mendapatkan prodi_id yang akurat
                const profileRes = await mahasiswaApi.getMyProfile();
                const profileData = profileRes.data || profileRes;
                const prodiId = profileData.prodi_id || user?.prodi_id;
                setUserProdiId(prodiId);

                console.log('🔍 DASHBOARD - User prodi_id:', prodiId);

                // Ambil semua prodi
                const prodiRes = await prodiApi.getAll();
                const allProdi = prodiRes.data || [];
                
                console.log('🔍 DASHBOARD - All prodi:', allProdi.map(p => ({ id: p.id, nama: p.nama_prodi })));
                
                // Filter: hanya tampilkan prodi mahasiswa sendiri dengan String comparison
                const filtered = prodiId 
                    ? allProdi.filter(p => String(p.id) === String(prodiId))
                    : allProdi;
                
                console.log('🔍 DASHBOARD - Filtered prodi:', filtered.map(p => ({ id: p.id, nama: p.nama_prodi })));
                
                setProdiList(filtered);
            } catch (error) {
                console.error('❌ DASHBOARD - Error fetching prodi:', error);
                setProdiList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProdiIdAndProdi();
    }, [user]);

    const quickActions = [
        { title: 'Capaian CPL',   desc: 'Progres capaian CPL saya',    icon: 'chart-bell-curve-cumulative', color: THEME.secondary, target: 'capaian'       },
        { title: 'Mata Kuliah',   desc: 'Daftar mata kuliah aktif',     icon: 'book-open-outline',           color: THEME.accent, target: 'mata_kuliah'   },
        { title: 'Program Studi', desc: 'Info prodi & CPL',             icon: 'school-outline',              color: THEME.primary, target: 'program_studi' },
        { title: 'Sub-CPMK',      desc: 'Lihat sub-CPMK mata kuliah',   icon: 'clipboard-text-outline',      color: THEME.secondary, target: 'sub_cpmk'      },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Hero Banner */}
            <View style={styles.heroBanner}>
                <Text style={styles.heroGreeting}>Selamat Datang 👋</Text>
                <Text style={styles.heroName}>{user?.name || 'Mahasiswa'}</Text>
                <Text style={styles.heroSub}>Berikut ringkasan aktivitas Anda hari ini</Text>
            </View>

            {/* Quick Access */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Akses Cepat</Text>
                <View style={styles.quickGrid}>
                    {quickActions.map((action, idx) => (
                        <TouchableOpacity
                            key={idx}
                            activeOpacity={0.8}
                            style={[styles.quickCard, { borderLeftColor: action.color, borderLeftWidth: 4 }]}
                            onPress={() => onNavigate && onNavigate(action.target)}
                        >
                            <View style={styles.quickIconRow}>
                                <View style={[styles.quickIconBox, { backgroundColor: action.color }]}>
                                    <MaterialCommunityIcons name={action.icon} size={20} color={BASE.textMain} />
                                </View>
                                <View style={styles.quickArrow}>
                                    <MaterialCommunityIcons name="arrow-up-right" size={12} color={BASE.textMuted} />
                                </View>
                            </View>
                            <View style={styles.quickMeta}>
                                <Text style={styles.quickTitle}>{action.title}</Text>
                                <Text style={styles.quickDesc}>{action.desc}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Program Studi - Hanya Prodi Mahasiswa */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Program Studi Saya</Text>
                    <TouchableOpacity onPress={() => onNavigate && onNavigate('program_studi')}>
                        <Text style={styles.textLink}>Lihat Detail</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <LoadingState message="Memuat data..." color={BASE.primary} />
                ) : prodiList.length === 0 ? (
                    <EmptyState 
                        icon="school-off-outline" 
                        message="Data program studi tidak ditemukan" 
                    />
                ) : (
                    <View style={{ gap: 12 }}>
                        {prodiList.map((prodi) => (
                            <View key={prodi.id} style={styles.prodiCard}>
                                <View style={styles.prodiInfo}>
                                    <Text style={styles.prodiNama}>{prodi.nama_prodi || '-'}</Text>
                                    <View style={styles.badgeRow}>
                                        <View style={styles.kodeBadge}>
                                            <Text style={styles.kodeBadgeText}>{prodi.kode_prodi || '-'}</Text>
                                        </View>
                                        <View style={styles.jenjangBadge}>
                                            <Text style={styles.jenjangBadgeText}>{prodi.jenjang || '-'}</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.lihatBtn}
                                    onPress={() => onNavigate && onNavigate('program_studi')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.lihatBtnText}>Lihat CPL</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
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
    heroGreeting: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textMuted },
    heroName: { fontFamily: 'Urbanist-Bold', fontSize: 26, fontWeight: '800', color: BASE.textMain, letterSpacing: -0.5, marginTop: 2 },
    heroSub: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: BASE.textMuted, marginTop: 2 },

    section: { marginBottom: 24, paddingHorizontal: 20 },
    sectionTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, fontWeight: '800', color: BASE.textMain, marginBottom: 14 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    textLink: { fontFamily: 'Urbanist-Bold', fontSize: 12, fontWeight: '700', color: BASE.textMuted },

    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    quickCard: {
        width: '48%', backgroundColor: BASE.surface, borderRadius: 20, padding: 14,
        marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    quickIconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    quickIconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    quickArrow: { width: 24, height: 24, borderRadius: 12, backgroundColor: BASE.background, justifyContent: 'center', alignItems: 'center' },
    quickMeta: { marginTop: 10, paddingLeft: 2 },
    quickTitle: { fontFamily: 'Urbanist-Bold', fontSize: 13, fontWeight: '800', color: BASE.textMain },
    quickDesc: { fontFamily: 'Urbanist-Regular', fontSize: 10, color: BASE.textMuted, marginTop: 2, lineHeight: 13 },

    prodiCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: BASE.surface, borderRadius: 20, padding: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    prodiInfo: { flex: 1, paddingRight: 8 },
    prodiNama: { fontFamily: 'Urbanist-Bold', fontSize: 14, fontWeight: '800', color: BASE.textMain, marginBottom: 6 },
    badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
    kodeBadge: { backgroundColor: BASE.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.surface, fontWeight: '700' },
    jenjangBadge: { backgroundColor: THEME.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    jenjangBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: BASE.textMain, fontWeight: '700' },
    lihatBtn: {
        backgroundColor: BASE.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    },
    lihatBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: BASE.surface, fontWeight: '700' },

    emptyCard: { backgroundColor: BASE.surface, borderRadius: 20, padding: 24, alignItems: 'center', elevation: 2 },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: BASE.textDisabled },
});
