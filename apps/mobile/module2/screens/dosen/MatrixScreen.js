import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
export default function MatrixScreen({ matrixPermissions }) {
    const [viewTab, setViewTab] = useState('resource'); // 'resource' or 'role'
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIndex, setExpandedIndex] = useState(0); // auto-expand first card

    const getBadgeStyle = (permClass) => {
        switch(permClass) {
            case 'rwd':
                return { bg: 'rgba(255, 159, 67, 0.15)', text: '#FF9F43' };
            case 'rw':
                return { bg: 'rgba(40, 199, 111, 0.15)', text: '#28C76F' };
            case 'r':
                return { bg: 'rgba(0, 207, 232, 0.15)', text: '#00CFE8' };
            default:
                return { bg: '#E2E8F0', text: '#64748B' };
        }
    };

    const handleCardPress = (idx) => {
        setExpandedIndex(expandedIndex === idx ? null : idx);
    };

    const filterText = searchQuery.toLowerCase();

    // Roles grouping data structure
    const roles = [
        { name: "Superadmin", key: "superadmin", bullet: "#FF9F43" },
        { name: "Admin Prodi", key: "admin_prodi", bullet: "#28C76F" },
        { name: "Dosen", key: "dosen", bullet: "#00CFE8" },
        { name: "Mahasiswa", key: "mahasiswa", bullet: "#64748B" }
    ];

    return (
        <View style={styles.container}>
            {/* Hero Banner UINSA */}
            <View style={styles.heroBanner}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Matriks Akses CPL</Text>
                    <Text style={styles.heroSubtitle}>Konfigurasi hak akses resource sistem</Text>
                </View>
            </View>

            {/* View Toggle Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity 
                    style={[styles.tabBtn, viewTab === 'resource' && styles.tabBtnActive]}
                    onPress={() => { setViewTab('resource'); setExpandedIndex(0); }}
                >
                    <Text style={[styles.tabText, viewTab === 'resource' && styles.tabTextActive]}>Resource</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabBtn, viewTab === 'role' && styles.tabBtnActive]}
                    onPress={() => { setViewTab('role'); setExpandedIndex(0); }}
                >
                    <Text style={[styles.tabText, viewTab === 'role' && styles.tabTextActive]}>Role</Text>
                </TouchableOpacity>
            </View>

            {/* Search Box */}
            <View style={styles.searchBox}>
                <MaterialCommunityIcons name="magnify" size={20} color="#64748B" style={styles.searchIcon} />
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Cari resource atau role..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#94A3B8"
                />
            </View>

            <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {viewTab === 'resource' ? (
                    // 1. Grouped by Resource
                    matrixPermissions
                        .filter(item => item.resource.toLowerCase().includes(filterText))
                        .map((item, idx) => {
                            const isExpanded = expandedIndex === idx;
                            return (
                                <View key={idx} style={styles.card}>
                                    <TouchableOpacity 
                                        style={styles.cardHeader} 
                                        activeOpacity={0.7}
                                        onPress={() => handleCardPress(idx)}
                                    >
                                        <Text style={styles.cardTitle}>{item.resource}</Text>
                                        <MaterialCommunityIcons 
                                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                                            size={18} 
                                            color="#64748B" 
                                        />
                                    </TouchableOpacity>

                                    {isExpanded && (
                                        <View style={styles.cardBody}>
                                            {renderPermissionRow("Superadmin", item.superadmin, "#FF9F43")}
                                            {renderPermissionRow("Admin Prodi", item.admin_prodi, "#28C76F")}
                                            {renderPermissionRow("Dosen", item.dosen, "#00CFE8")}
                                            {renderPermissionRow("Mahasiswa", item.mahasiswa, "#64748B")}
                                        </View>
                                    )}
                                </View>
                            );
                        })
                ) : (
                    // 2. Grouped by Role
                    roles
                        .filter(r => r.name.toLowerCase().includes(filterText))
                        .map((role, idx) => {
                            const isExpanded = expandedIndex === idx;
                            return (
                                <View key={idx} style={styles.card}>
                                    <TouchableOpacity 
                                        style={styles.cardHeader} 
                                        activeOpacity={0.7}
                                        onPress={() => handleCardPress(idx)}
                                    >
                                        <Text style={styles.cardTitle}>{role.name}</Text>
                                        <MaterialCommunityIcons 
                                            name={isExpanded ? "chevron-up" : "chevron-down"} 
                                            size={18} 
                                            color="#64748B" 
                                        />
                                    </TouchableOpacity>

                                    {isExpanded && (
                                        <View style={styles.cardBody}>
                                            {matrixPermissions.map((p, pIdx) => {
                                                const perm = p[role.key === 'Admin Prodi' ? 'admin_prodi' : role.key];
                                                const colors = getBadgeStyle(perm.class);
                                                return (
                                                    <View key={pIdx} style={styles.row}>
                                                        <Text style={styles.rowLabel}>{p.resource}</Text>
                                                        <View style={styles.rowRight}>
                                                            {perm.note ? <Text style={styles.noteText}>({perm.note})</Text> : null}
                                                            <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                                                                <Text style={[styles.badgeText, { color: colors.text }]}>{perm.code}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                            );
                        })
                )}
            </ScrollView>
        </View>
    );

    function renderPermissionRow(roleLabel, perm, bulletColor) {
        const colors = getBadgeStyle(perm.class);
        return (
            <View style={styles.row}>
                <View style={styles.rowLeft}>
                    <View style={[styles.bullet, { backgroundColor: bulletColor }]} />
                    <Text style={styles.rowLabel}>{roleLabel}</Text>
                </View>
                <View style={styles.rowRight}>
                    {perm.note ? <Text style={styles.noteText}>({perm.note})</Text> : null}
                    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.badgeText, { color: colors.text }]}>{perm.code}</Text>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    heroBanner: { backgroundColor: 'rgba(15,40,25,0.82)', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, marginBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    
    heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,40,25,0.58)' },
    heroContent: { padding: 20, paddingBottom: 20 },
    heroTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
    heroSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 4 },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
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
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#DBDFE9',
        padding: 4,
        borderRadius: 16,
        marginHorizontal: 24,
        marginBottom: 16,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    tabBtnActive: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1,
    },
    tabText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
    },
    tabTextActive: {
        color: '#212121',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 16,
        marginHorizontal: 24,
        marginBottom: 20,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontFamily: 'Urbanist-SemiBold',
        fontSize: 13,
        color: '#212121',
    },
    scrollList: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 24,
        marginBottom: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 15,
        elevation: 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.01)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    cardTitle: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 15,
        fontWeight: '800',
        color: '#212121',
    },
    cardBody: {
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.02)',
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 10,
    },
    rowLabel: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    noteText: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 10,
        color: '#64748B',
        marginRight: 6,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        minWidth: 52,
        alignItems: 'center',
    },
    badgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    }
});









