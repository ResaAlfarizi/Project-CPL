import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, ActivityIndicator  } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { nilaiApi, enrollmentApi, subCpmkApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { EmptyState } from '../../components';

// ✅ THEME DOSEN (Green)
const THEME = ROLE_THEMES.dosen;

export default function InputNilaiScreen({ 
    kelasList = [],
    subCpmkList: globalSubCpmk = [],
    onAddGrade, 
    onUpdateGrade 
}) {
    const [selectedKelasId, setSelectedKelasId] = useState('');
    const [showKelasDropdown, setShowKelasDropdown] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Data per kelas dari API
    const [nilaiList, setNilaiList]       = useState([]);
    const [enrollments, setEnrollments]   = useState([]);
    const [kelasSubCpmk, setKelasSubCpmk] = useState([]);

    // Add Form State
    const [selectedEnrollment, setSelectedEnrollment] = useState('');
    const [selectedSubCpmkId, setSelectedSubCpmkId]   = useState('');
    const [nilaiInput, setNilaiInput]                 = useState('');
    const [showMhsModal, setShowMhsModal]             = useState(false);
    const [showSubCpmkModal, setShowSubCpmkModal]     = useState(false);
    const [saving, setSaving]                         = useState(false);

    // Inline edit
    const [editingId, setEditingId]         = useState(null);
    const [editingNilaiText, setEditingNilaiText] = useState('');

    const selectedKelas = kelasList.find(k => k.id === selectedKelasId) || null;

    // Load data saat kelas dipilih
    useEffect(() => {
        if (!selectedKelasId) {
            setNilaiList([]); setEnrollments([]); setKelasSubCpmk([]);
            return;
        }
        const load = async () => {
            setLoading(true);
            try {
                const [nilaiRes, enrollRes] = await Promise.allSettled([
                    nilaiApi.getByKelas(selectedKelasId),
                    enrollmentApi.getByKelas(selectedKelasId),
                ]);
                setNilaiList(nilaiRes.status === 'fulfilled' ? (nilaiRes.value?.data || []) : []);
                setEnrollments(enrollRes.status === 'fulfilled' ? (enrollRes.value?.data || []) : []);

                // Sub-CPMK berdasarkan mk_id kelas
                const kelas = kelasList.find(k => k.id === selectedKelasId);
                if (kelas?.mk_id) {
                    const subRes = await subCpmkApi.getByMk(kelas.mk_id).catch(() => ({ data: [] }));
                    setKelasSubCpmk(subRes.data || []);
                } else {
                    setKelasSubCpmk(globalSubCpmk);
                }
            } catch {
                setNilaiList([]); setEnrollments([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selectedKelasId]);

    const reloadNilai = async () => {
        if (!selectedKelasId) return;
        const res = await nilaiApi.getByKelas(selectedKelasId).catch(() => ({ data: [] }));
        setNilaiList(res.data || []);
    };

    const handleSelectKelas = (id) => {
        setSelectedKelasId(id);
        setShowKelasDropdown(false);
        setShowAddForm(false);
        setEditingId(null);
    };

    const handleOpenAddForm = () => {
        setSelectedEnrollment('');
        setSelectedSubCpmkId('');
        setNilaiInput('');
        setShowAddForm(true);
    };

    const handleSaveNewGrade = async () => {
        if (!selectedEnrollment || !selectedSubCpmkId || !nilaiInput) {
            alert("Harap pilih Mahasiswa, Sub-CPMK, dan isi Nilai!");
            return;
        }
        const floatNilai = parseFloat(nilaiInput);
        if (isNaN(floatNilai) || floatNilai < 0 || floatNilai > 100) {
            alert("Nilai harus angka antara 0 dan 100!");
            return;
        }
        setSaving(true);
        try {
            await onAddGrade({
                enrollment_id: selectedEnrollment,
                sub_cpmk_id:   selectedSubCpmkId,
                nilai:         floatNilai,
            });
            setShowAddForm(false);
            await reloadNilai();
        } catch (err) {
            alert(err.message || "Gagal menyimpan nilai");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async (id) => {
        const floatVal = parseFloat(editingNilaiText);
        if (isNaN(floatVal) || floatVal < 0 || floatVal > 100) {
            alert("Nilai harus angka antara 0 dan 100!");
            return;
        }
        setSaving(true);
        try {
            await onUpdateGrade(id, floatVal);
            setEditingId(null);
            await reloadNilai();
        } catch (err) {
            alert(err.message || "Gagal memperbarui nilai");
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Banner */}
            <View style={styles.heroBanner}>
                <Text style={styles.heroTitle}>Input Nilai Sub-CPMK</Text>
                <Text style={styles.heroSubtitle}>Input dan edit nilai mahasiswa untuk kelas yang Anda ampu</Text>
            </View>

                {/* 1. Pilih Kelas Dropdown Selector */}
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
                                <Text style={[styles.selectBtnText, { color: '#94A3B8', fontWeight: '400' }]}>
                                    -- Pilih Kelas --
                                </Text>
                            )}
                        </View>
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

                {/* If class is selected, show details and list */}
                {selectedKelas && (
                    <View style={styles.contentSection}>
                        {/* Class Tag Info */}
                        <View style={styles.classInfoBar}>
                            <View style={styles.classBadgeRow}>
                                <View style={styles.classInfoBadge}>
                                    <Text style={styles.classInfoBadgeText}>{selectedKelas.mk_kode}</Text>
                                </View>
                                <Text style={styles.classInfoName} numberOfLines={2}>{selectedKelas.mk_nama} {selectedKelas.kelas}</Text>
                            </View>
                            {!showAddForm && (
                                <TouchableOpacity activeOpacity={0.8} style={styles.addNilaiBtn} onPress={handleOpenAddForm}>
                                    <MaterialCommunityIcons name="plus" size={14} color="#212121" />
                                    <Text style={styles.addNilaiBtnText}>Input Nilai Baru</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* 2. + Input Nilai Baru Collapsible Form (Image 6) */}
                        {showAddForm && (
                            <View style={styles.addFormCard}>
                                <Text style={styles.formCardTitle}>Input Nilai Baru</Text>

                                {/* Mahasiswa Selector */}
                                <Text style={styles.gridLabel}>Mahasiswa</Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.fullSelectBtn}
                                    onPress={() => setShowMhsModal(true)}
                                >
                                    <Text style={styles.fullSelectBtnText} numberOfLines={2}>
                                        {selectedEnrollment
                                            ? (() => { const en = enrollments.find(e => e.id === selectedEnrollment); return en ? `${en.nim || ''} — ${en.nama_mahasiswa || ''}` : selectedEnrollment; })()
                                            : '-- Pilih Mahasiswa --'}
                                    </Text>
                                    <MaterialCommunityIcons name="menu-down" size={18} color="#64748B" />
                                </TouchableOpacity>

                                {/* Sub-CPMK Selector */}
                                <Text style={[styles.gridLabel, { marginTop: 10 }]}>Sub-CPMK</Text>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.fullSelectBtn}
                                    onPress={() => setShowSubCpmkModal(true)}
                                >
                                    <Text style={styles.fullSelectBtnText} numberOfLines={2}>
                                        {selectedSubCpmkId
                                            ? (() => {
                                                const sc = kelasSubCpmk.find(s => s.id === selectedSubCpmkId);
                                                if (!sc) return selectedSubCpmkId;
                                                return sc.kode_cpl
                                                    ? `${sc.kode_sub_cpmk} → CPL: ${sc.kode_cpl}`
                                                    : sc.kode_sub_cpmk;
                                              })()
                                            : '-- Pilih Sub-CPMK --'}
                                    </Text>
                                    <MaterialCommunityIcons name="menu-down" size={18} color="#64748B" />
                                </TouchableOpacity>

                                {/* Nilai Input */}
                                <Text style={[styles.gridLabel, { marginTop: 10 }]}>Nilai (0–100)</Text>
                                <TextInput
                                    style={styles.fullInput}
                                    value={nilaiInput}
                                    onChangeText={setNilaiInput}
                                    keyboardType="numeric"
                                    placeholder="Masukkan nilai 0 - 100"
                                    placeholderTextColor="#94A3B8"
                                />

                                <View style={styles.formActions}>
                                    <TouchableOpacity activeOpacity={0.8} style={styles.btnFormSave} onPress={handleSaveNewGrade}>
                                        <Text style={styles.btnFormSaveText}>Simpan</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.8} style={styles.btnFormCancel} onPress={() => setShowAddForm(false)}>
                                        <Text style={styles.btnFormCancelText}>Batal</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* 3. Grades Card List */}
                        {loading ? (
                            <ActivityIndicator size="large" color={BASE.primary} style={{ marginTop: 24 }} />
                        ) : (
                            <View style={styles.cardList}>
                                {nilaiList.length === 0 ? (
                                    <View style={{ marginHorizontal: 24 }}>
                                        <EmptyState 
                                            icon="clipboard-text-off-outline" 
                                            message='Belum ada nilai. Klik "Input Nilai Baru".' 
                                        />
                                    </View>
                                ) : nilaiList.map((n) => {
                                    const isEditing = editingId === n.id;
                                    return (
                                        <View key={n.id} style={styles.gradeCard}>
                                            <View style={styles.gradeCardHeader}>
                                                <View style={styles.studentMeta}>
                                                    <Text style={styles.studentName}>{n.nama_mahasiswa || '-'}</Text>
                                                    <View style={styles.nimBadge}>
                                                        <Text style={styles.nimBadgeText}>NIM: {n.nim || '-'}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.subBadge}>
                                                    <Text style={styles.subBadgeText}>{n.kode_sub_cpmk || '-'}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.divider} />

                                            <View style={styles.gradeCardBody}>
                                                <View style={styles.bodyDetails}>
                                                    <Text style={styles.tglText}>
                                                        Tgl Input: {n.input_at
                                                            ? new Date(n.input_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                            : new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </Text>
                                                </View>

                                                {isEditing ? (
                                                    <View style={styles.inlineEditArea}>
                                                        <Text style={styles.nilaiLabel}>Nilai:</Text>
                                                        <TextInput
                                                            style={styles.rowInput}
                                                            value={editingNilaiText}
                                                            onChangeText={setEditingNilaiText}
                                                            keyboardType="numeric"
                                                            selectTextOnFocus={true}
                                                            autoFocus={true}
                                                        />
                                                        <View style={styles.rowEditActions}>
                                                            <TouchableOpacity activeOpacity={0.8} style={styles.btnInlineSave} onPress={() => handleSaveEdit(n.id)} disabled={saving}>
                                                                <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity activeOpacity={0.8} style={styles.btnInlineCancel} onPress={() => setEditingId(null)}>
                                                                <MaterialCommunityIcons name="close" size={14} color="#EA5455" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <View style={styles.scoreRow}>
                                                        <View style={styles.scoreBadgeContainer}>
                                                            <Text style={styles.scoreLabel}>Nilai</Text>
                                                            <Text style={styles.scoreValue}>{Number(n.nilai).toFixed(2)}</Text>
                                                        </View>
                                                        <TouchableOpacity activeOpacity={0.8} style={styles.editRowBtn} onPress={() => { setEditingId(n.id); setEditingNilaiText(String(n.nilai)); setShowAddForm(false); }}>
                                                            <MaterialCommunityIcons name="pencil-outline" size={14} color="#212121" />
                                                            <Text style={styles.editRowBtnText}>Ubah</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Mahasiswa Dropdown Modal */}
            <Modal animationType="fade" transparent={true} visible={showMhsModal} onRequestClose={() => setShowMhsModal(false)}>
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowMhsModal(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeaderTitle}>Pilih Mahasiswa</Text>
                        {enrollments.length === 0 ? (
                            <Text style={{ color: '#94A3B8', fontSize: 13, padding: 8 }}>Tidak ada mahasiswa terdaftar</Text>
                        ) : enrollments.map(en => (
                            <TouchableOpacity
                                key={en.id}
                                style={styles.optionRow}
                                onPress={() => { setSelectedEnrollment(en.id); setShowMhsModal(false); }}
                            >
                                <Text style={styles.optionText}>{en.nim || ''} - {en.nama_mahasiswa || en.mahasiswa_id}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Sub-CPMK Dropdown Modal */}
            <Modal animationType="fade" transparent={true} visible={showSubCpmkModal} onRequestClose={() => setShowSubCpmkModal(false)}>
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowSubCpmkModal(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeaderTitle}>Pilih Sub-CPMK</Text>
                        {kelasSubCpmk.length === 0 ? (
                            <Text style={{ color: '#94A3B8', fontSize: 13, padding: 8 }}>Tidak ada Sub-CPMK tersedia</Text>
                        ) : kelasSubCpmk.map(sc => {
                            const desc = sc.deskripsi
                                ? (sc.deskripsi.length > 50 ? sc.deskripsi.substring(0, 50) + '...' : sc.deskripsi)
                                : null;
                            return (
                                <TouchableOpacity
                                    key={sc.id}
                                    style={styles.optionRow}
                                    onPress={() => { setSelectedSubCpmkId(sc.id); setShowSubCpmkModal(false); }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: desc ? 3 : 0 }}>
                                        <View style={styles.subCpmkCodeBadge}>
                                            <Text style={styles.subCpmkCodeText}>{sc.kode_sub_cpmk}</Text>
                                        </View>
                                        {sc.kode_cpl ? (
                                            <View style={styles.cplBadge}>
                                                <Text style={styles.cplBadgeText}>CPL: {sc.kode_cpl}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                    {desc ? (
                                        <Text style={styles.optionSubText}>{desc}</Text>
                                    ) : null}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </TouchableOpacity>
            </Modal>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({

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
    scrollView: {
        flex: 1,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        flex: 1,
        marginRight: 8,
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
        flexShrink: 1,
    },
    addNilaiBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.accent,
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
        gap: 4,
        flexShrink: 0,
    },
    addNilaiBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        fontWeight: '800',
        color: BASE.textMain,
    },
    addFormCard: {
        backgroundColor: BASE.surface,
        borderRadius: 24,
        padding: 16,
        marginHorizontal: 24,
        marginBottom: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        borderWidth: 1,
        borderColor: BASE.border,
    },
    formCardTitle: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        fontWeight: '800',
        color: BASE.textMain,
        marginBottom: 12,
    },
    formGrid: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 14,
    },
    gridCol: {
        flex: 1,
        gap: 4,
    },
    gridLabel: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        fontWeight: '700',
        color: BASE.textMuted,
    },
    miniInput: {
        height: 38,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: BASE.border,
        backgroundColor: BASE.surface,
        paddingHorizontal: 10,
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        color: BASE.textMain,
    },
    formActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 14,
    },
    btnFormSave: {
        backgroundColor: BASE.primary,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    btnFormSaveText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        fontWeight: '800',
        color: BASE.surface,
    },
    btnFormCancel: {
        backgroundColor: 'transparent',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    btnFormCancelText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        fontWeight: '700',
        color: BASE.textMuted,
    },
    // Card List Styles (Replacing Table)
    cardList: {
        gap: 12,
        paddingHorizontal: 24,
    },
    gradeCard: {
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
    gradeCardHeader: {
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
    subBadge: {
        backgroundColor: THEME.secondary,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    subBadgeText: {
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
    gradeCardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bodyDetails: {
        flex: 1,
    },
    tglText: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 11,
        color: BASE.textMuted,
        marginTop: 4,
    },
    cplInfoBadge: {
        backgroundColor: THEME.secondary,
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    cplInfoText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        color: BASE.textMain,
        fontWeight: '700',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    scoreBadgeContainer: {
        backgroundColor: THEME.accent,
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    scoreLabel: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 8,
        fontWeight: '700',
        color: BASE.textMuted,
        textTransform: 'uppercase',
    },
    scoreValue: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '800',
        color: BASE.textMain,
    },
    editRowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: BASE.border,
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 12,
        gap: 4,
    },
    editRowBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        fontWeight: '700',
        color: BASE.textMain,
    },
    inlineEditArea: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nilaiLabel: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        color: BASE.textMuted,
    },
    rowInput: {
        height: 36,
        width: 60,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: BASE.primary,
        backgroundColor: BASE.surface,
        textAlign: 'center',
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '800',
        color: BASE.textMain,
        padding: 0,
    },
    rowEditActions: {
        flexDirection: 'row',
        gap: 4,
    },
    btnInlineSave: {
        width: 32,
        height: 32,
        backgroundColor: BASE.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnInlineCancel: {
        width: 32,
        height: 32,
        backgroundColor: BASE.errorBg,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Selector styles
    miniSelectBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 38,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: BASE.border,
        backgroundColor: BASE.surface,
        paddingHorizontal: 10,
    },
    miniSelectBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        color: BASE.textMain,
        flex: 1,
    },
    // Full-width selector untuk form Input Nilai (mengganti grid 3 kolom)
    fullSelectBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BASE.border,
        backgroundColor: BASE.surface,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginBottom: 2,
    },
    fullSelectBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        color: BASE.textMain,
        flex: 1,
        marginRight: 8,
        lineHeight: 18,
    },
    fullInput: {
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BASE.border,
        backgroundColor: BASE.surface,
        paddingHorizontal: 14,
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        color: BASE.textMain,
        marginBottom: 2,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: BASE.surface,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeaderTitle: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '800',
        color: BASE.textMain,
        marginBottom: 14,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: BASE.borderLight,
    },
    optionRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: BASE.borderLight,
    },
    optionText: {
        fontFamily: 'Urbanist-SemiBold',
        fontSize: 12,
        color: BASE.textMain,
    },
    optionSubText: {
        fontFamily: 'Urbanist-Regular',
        fontSize: 11,
        color: BASE.textMuted,
        marginTop: 3,
    },
    subCpmkCodeBadge: {
        backgroundColor: BASE.primary,
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    subCpmkCodeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        fontWeight: '800',
        color: BASE.surface,
    },
    cplBadge: {
        backgroundColor: THEME.secondary,
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    cplBadgeText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        fontWeight: '700',
        color: BASE.textMain,
    },
});















