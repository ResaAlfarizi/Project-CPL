import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Palette: Alice Blue #D8DFE9 | Honeydew #CFDECA | Vanilla #EFF0A3 | Eerie Black #212121 | Ghost White #F6F5FA

export default function DashboardScreen({ currentRole, rolesData, kelasList = [], dashboardData = {}, onNavigate }) {
    const data = rolesData[currentRole] || {};

    const getAccentColor = (color) => {
        switch (color) {
            case 'accent-yellow': return '#EFF0A3';
            case 'accent-green':  return '#CFDECA';
            case 'accent-blue':   return '#D8DFE9';
            case 'accent-orange': return '#FFD8A8';
            default: return '#D8DFE9';
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* ── Hero Banner (warna solid, foto UINSA ada di belakang screen) ── */}
            <View style={styles.heroBanner}>
                <Text style={styles.heroGreeting}>Selamat Datang 👋</Text>
                <Text style={styles.heroName}>{data.name || 'Pengguna'}</Text>
                <View style={styles.heroBadgeRow}>
                   
                </View>
                <Text style={styles.heroSub}>Berikut ringkasan aktivitas Anda hari ini</Text>
            </View>

            {/* ── Stats Grid ── */}
            <View style={styles.statsGrid}>
                {(data.stats || []).map((stat, idx) => {
                    const bgMap = { 'bg-vanilla': '#EFF0A3', 'bg-honeydew': '#CFDECA', 'bg-alice': '#D8DFE9' };
                    const bg = bgMap[stat.bg] || '#D8DFE9';
                    return (
                        <TouchableOpacity key={idx} activeOpacity={0.9} style={[styles.statCard, { backgroundColor: bg }]}>
                            <View style={styles.statIconWrapper}>
                                <MaterialCommunityIcons name={stat.icon} size={18} color="#212121" />
                            </View>
                            <View style={styles.statMeta}>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                                <Text style={styles.statValue}>{stat.value}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── Quick Access ── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Akses Cepat</Text>
                <View style={styles.quickGrid}>
                    {(data.quickActions || []).map((action, idx) => {
                        const accent = getAccentColor(action.color);
                        return (
                            <TouchableOpacity
                                key={idx} activeOpacity={0.8}
                                style={[styles.quickCard, { borderLeftColor: accent, borderLeftWidth: 4 }]}
                                onPress={() => onNavigate(action.target)}
                            >
                                <View style={styles.quickIconRow}>
                                    <View style={[styles.quickIconBox, { backgroundColor: accent }]}>
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
                        );
                    })}
                </View>
            </View>

            {/* ── Kelas / Nilai / Audit ── */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {currentRole === 'dosen' ? 'Kelas Saya' :
                         currentRole === 'mahasiswa' ? 'Nilai Sub-CPMK Terakhir' : 'Audit Log Terbaru'}
                    </Text>
                    <TouchableOpacity><Text style={styles.textLink}>Lihat Semua</Text></TouchableOpacity>
                </View>

                {currentRole === 'dosen' && (
                    kelasList.length === 0 ? (
                        <View style={styles.emptyCard}><Text style={styles.emptyText}>Belum ada kelas yang diampu</Text></View>
                    ) : (
                        <View style={{ gap: 12 }}>
                            {kelasList.map((kelas) => (
                                <View key={kelas.id} style={styles.classCard}>
                                    <View style={styles.classDetails}>
                                        <Text style={styles.className}>{kelas.mk_nama}</Text>
                                        <View style={styles.classMetaRow}>
                                            <View style={styles.classBadge}><Text style={styles.classBadgeText}>Kelas {kelas.kelas}</Text></View>
                                            <Text style={styles.dotSeparator}>•</Text>
                                            <Text style={styles.classMetaText}>{kelas.total_mahasiswa} Mahasiswa</Text>
                                        </View>
                                    </View>
                                    <View style={styles.classRight}>
                                        <View style={styles.semesterBadge}><Text style={styles.semesterBadgeText}>{kelas.semester}</Text></View>
                                        <Text style={styles.academicYearText}>TA {kelas.ta}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )
                )}

                {currentRole === 'mahasiswa' && (
                    <View style={{ gap: 12 }}>
                        {[{ mk: 'Pemrograman Dasar', sub: 'Sub-CPMK 1', nilai: 90 }, { mk: 'Matematika Diskrit', sub: 'Sub-CPMK 2', nilai: 82 }].map((item, i) => (
                            <View key={i} style={styles.classCard}>
                                <View style={styles.classDetails}>
                                    <Text style={styles.className}>{item.mk}</Text>
                                    <View style={styles.classMetaRow}>
                                        <View style={styles.classBadge}><Text style={styles.classBadgeText}>{item.sub}</Text></View>
                                        <Text style={styles.dotSeparator}>•</Text>
                                        <Text style={styles.boldScoreText}>Nilai: {item.nilai}</Text>
                                    </View>
                                </View>
                                <View style={styles.classRight}>
                                    <View style={[styles.semesterBadge, { backgroundColor: 'rgba(40,199,111,0.15)' }]}>
                                        <Text style={{ fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#28C76F' }}>Tuntas</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {(currentRole === 'superadmin' || currentRole === 'admin') && (
                    <View style={{ gap: 12 }}>
                        {[{ act: 'Input Nilai Pemrograman Dasar A', by: 'Dr. Budi Santoso', time: '10m ago' },
                          { act: 'Merubah Hak Akses Sub-CPMK', by: 'Luthfi Pratama', time: '1h ago' }].map((item, i) => (
                            <View key={i} style={styles.classCard}>
                                <View style={styles.classDetails}>
                                    <Text style={styles.className}>{item.act}</Text>
                                    <Text style={styles.logAuthor}>Oleh: {item.by}</Text>
                                </View>
                                <View style={styles.classRight}>
                                    <Text style={styles.logTimeText}>{item.time}</Text>
                                </View>
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

    /* Hero Banner — warna solid gelap */
    heroBanner: {
        backgroundColor: 'rgba(15,40,25,0.82)',
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24,
        marginBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    heroGreeting: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: 'rgba(255,255,255,0.75)' },
    heroName: { fontFamily: 'Urbanist-Bold', fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginTop: 2 },
    heroSub: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

    /* Stats */
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 20 },
    statCard: {
        flex: 1, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 10,
        marginHorizontal: 4, minHeight: 110, justifyContent: 'space-between',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    statIconWrapper: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center' },
    statMeta: { marginTop: 10 },
    statLabel: { fontFamily: 'Urbanist-Bold', fontSize: 9, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
    statValue: { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: '#212121', marginTop: 2 },

    /* Section */
    section: { marginBottom: 24, paddingHorizontal: 20 },
    sectionTitle: { fontFamily: 'Urbanist-Bold', fontSize: 16, fontWeight: '800', color: '#212121', marginBottom: 14 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    textLink: { fontFamily: 'Urbanist-Bold', fontSize: 12, fontWeight: '700', color: '#64748B' },

    /* Quick cards */
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

    /* Class cards */
    classCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    classDetails: { flex: 1, paddingRight: 8 },
    className: { fontFamily: 'Urbanist-Bold', fontSize: 14, fontWeight: '800', color: '#212121' },
    classMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    classBadge: { backgroundColor: '#D8DFE9', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
    classBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, fontWeight: '700', color: '#212121' },
    dotSeparator: { marginHorizontal: 6, color: '#64748B' },
    classMetaText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B' },
    classRight: { alignItems: 'flex-end' },
    semesterBadge: { backgroundColor: '#EFF0A3', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
    semesterBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11, fontWeight: '700', color: '#212121' },
    academicYearText: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#64748B', marginTop: 6 },
    boldScoreText: { fontFamily: 'Urbanist-Bold', fontSize: 12, fontWeight: '700', color: '#212121' },
    logAuthor: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#64748B', marginTop: 4 },
    logTimeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#64748B', fontWeight: '700' },
    emptyCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 24, alignItems: 'center', elevation: 2 },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#94A3B8' },
});
