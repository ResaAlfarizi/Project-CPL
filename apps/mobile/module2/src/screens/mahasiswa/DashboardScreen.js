import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { prodiApi } from '../../services/api';

// Palette: Alice Blue #D8DFE9 | Honeydew #CFDECA | Vanilla #EFF0A3 | Eerie Black #212121 | Ghost White #F6F5FA

export default function DashboardScreen({ user, onNavigate }) {
    const [prodiList, setProdiList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        prodiApi.getAll()
            .then(res => {
                const allProdi = res.data || [];
                // Filter: hanya tampilkan prodi mahasiswa sendiri
                const filtered = user?.prodi_id 
                    ? allProdi.filter(p => p.id === user.prodi_id)
                    : allProdi;
                setProdiList(filtered);
            })
            .catch(() => setProdiList([]))
            .finally(() => setLoading(false));
    }, [user]);

    const quickActions = [
        { title: 'Capaian CPL',   desc: 'Progres capaian CPL saya',    icon: 'chart-bell-curve-cumulative', color: '#CFDECA', target: 'capaian'       },
        { title: 'Mata Kuliah',   desc: 'Daftar mata kuliah aktif',     icon: 'book-open-outline',           color: '#EFF0A3', target: 'mata_kuliah'   },
        { title: 'Program Studi', desc: 'Info prodi & CPL',             icon: 'school-outline',              color: '#D8DFE9', target: 'program_studi' },
        { title: 'Sub-CPMK',      desc: 'Lihat sub-CPMK mata kuliah',   icon: 'clipboard-text-outline',      color: '#FFD8A8', target: 'sub_cpmk'      },
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
                                    <MaterialCommunityIcons name={action.icon} size={20} color="#212121" />
                                </View>
                                <View style={styles.quickArrow}>
                                    <MaterialCommunityIcons name="arrow-up-right" size={12} color="#64748B" />
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
                    <ActivityIndicator size="small" color="#212121" style={{ marginTop: 8 }} />
                ) : prodiList.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Data program studi tidak ditemukan</Text>
                    </View>
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
    container: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { paddingBottom: 40 },

    heroBanner: {
        backgroundColor: 'rgba(15,40,25,0.82)',
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24,
        marginBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    heroGreeting: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: 'rgba(255,255,255,0.75)' },
    heroName: { fontFamily: 'Urbanist-Bold', fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginTop: 2 },
    heroSub: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

    section: { marginBottom: 24, paddingHorizontal: 20 },
    sectionTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, fontWeight: '800', color: '#212121', marginBottom: 14 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    textLink: { fontFamily: 'Urbanist-Bold', fontSize: 12, fontWeight: '700', color: '#64748B' },

    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    quickCard: {
        width: '48%', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 14,
        marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    quickIconRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    quickIconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    quickArrow: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F6F5FA', justifyContent: 'center', alignItems: 'center' },
    quickMeta: { marginTop: 10, paddingLeft: 2 },
    quickTitle: { fontFamily: 'Urbanist-Bold', fontSize: 13, fontWeight: '800', color: '#212121' },
    quickDesc: { fontFamily: 'Urbanist-Regular', fontSize: 10, color: '#64748B', marginTop: 2, lineHeight: 13 },

    prodiCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    prodiInfo: { flex: 1, paddingRight: 8 },
    prodiNama: { fontFamily: 'Urbanist-Bold', fontSize: 14, fontWeight: '800', color: '#212121', marginBottom: 6 },
    badgeRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
    kodeBadge: { backgroundColor: '#212121', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
    jenjangBadge: { backgroundColor: '#EFF0A3', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    jenjangBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#212121', fontWeight: '700' },
    lihatBtn: {
        backgroundColor: '#212121', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    },
    lihatBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#FFFFFF', fontWeight: '700' },

    emptyCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 24, alignItems: 'center', elevation: 2 },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#94A3B8' },
});
