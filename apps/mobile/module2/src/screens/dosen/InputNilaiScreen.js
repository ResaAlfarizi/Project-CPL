import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, ActivityIndicator  } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { nilaiApi, enrollmentApi, subCpmkApi } from '../../services/api';

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
                            {/* Hero Banner UINSA */}
            <View style={styles.heroBanner}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Input Nilai Sub-CPMK</Text>
                    <Text style={styles.heroSubtitle}>Input dan edit nilai mahasiswa untuk kelas yang Anda ampu</Text>
                </View>
            </View>

                {/* 1. Pilih Kelas Dropdown Selector */}
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

                {/* If class is selected, show details and list */}
                {selectedKelas && (
                    <View style={styles.contentSection}>
                        {/* Class Tag Info */}
                        <View style={styles.classInfoBar}>
                            <View style={styles.classBadgeRow}>
                                <View style={styles.classInfoBadge}>
                                    <Text style={styles.classInfoBadgeText}>{selectedKelas.mk_kode}</Text>
                                </View>
                                <Text style={styles.classInfoName}>{selectedKelas.mk_nama} {selectedKelas.kelas}</Text>
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
                                
                                <View style={styles.formGrid}>
                                    {/* Mahasiswa Selector */}
                                    <View style={styles.gridCol}>
                                        <Text style={styles.gridLabel}>Mahasiswa</Text>
                                        <TouchableOpacity 
                                            activeOpacity={0.8} 
                                            style={styles.miniSelectBtn}
                                            onPress={() => setShowMhsModal(true)}
                                        >
                                            <Text style={styles.miniSelectBtnText} numberOfLines={1}>
                                                {selectedEnrollment
                                                    ? (() => { const en = enrollments.find(e => e.id === selectedEnrollment); return en ? `${en.nim || ''} - ${en.nama_mahasiswa || ''}` : selectedEnrollment; })()
                                                    : '-- Pilih --'}
                                            </Text>
                                            <MaterialCommunityIcons name="menu-down" size={16} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Sub-CPMK Selector */}
                                    <View style={styles.gridCol}>
                                        <Text style={styles.gridLabel}>Sub-CPMK</Text>
                                        <TouchableOpacity 
                                            activeOpacity={0.8} 
                                            style={styles.miniSelectBtn}
                                            onPress={() => setShowSubCpmkModal(true)}
                                        >
                                            <Text style={styles.miniSelectBtnText} numberOfLines={1}>
                                                {selectedSubCpmkId
                                                    ? (() => { const sc = kelasSubCpmk.find(s => s.id === selectedSubCpmkId); return sc ? sc.kode_sub_cpmk : selectedSubCpmkId; })()
                                                    : '-- Pilih --'}
                                            </Text>
                                            <MaterialCommunityIcons name="menu-down" size={16} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Nilai Input */}
                                    <View style={styles.gridCol}>
                                        <Text style={styles.gridLabel}>Nilai (0-100)</Text>
                                        <TextInput 
                                            style={styles.miniInput}
                                            value={nilaiInput}
                                            onChangeText={setNilaiInput}
                                            keyboardType="numeric"
                                            placeholder="0 - 100"
                                            placeholderTextColor="#94A3B8"
                                        />
                                    </View>
                                </View>

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
                            <ActivityIndicator size="large" color="#212121" style={{ marginTop: 24 }} />
                        ) : (
                            <View style={styles.cardList}>
                                {nilaiList.length === 0 ? (
                                    <View style={styles.emptyGrade}>
                                        <Text style={styles.emptyGradeText}>Belum ada nilai. Klik "Input Nilai Baru".</Text>
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
                                                        Tgl Input: {n.input_at ? new Date(n.input_at).toLocaleDateString('id-ID') : '-'}
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
                        ) : kelasSubCpmk.map(c => (
                            <TouchableOpacity
                                key={c.id}
                                style={styles.optionRow}
                                onPress={() => { setSelectedSubCpmkId(c.id); setShowSubCpmkModal(false); }}
                            >
                                <Text style={styles.optionText}>{c.kode_sub_cpmk} - {c.deskripsi}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    addNilaiBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF0A3', // Vanilla accent style
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
        gap: 4,
    },
    addNilaiBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 10,
        fontWeight: '800',
        color: '#212121',
    },
    addFormCard: {
        backgroundColor: 'rgba(255,255,255,0.92)',
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
        borderColor: 'rgba(0,0,0,0.02)',
    },
    formCardTitle: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 13,
        fontWeight: '800',
        color: '#212121',
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
        color: '#64748B',
    },
    miniInput: {
        height: 38,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 10,
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        color: '#212121',
    },
    formActions: {
        flexDirection: 'row',
        gap: 8,
    },
    btnFormSave: {
        backgroundColor: '#212121',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    btnFormSaveText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        fontWeight: '800',
        color: '#FFFFFF',
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
        color: '#64748B',
    },
    // Card List Styles (Replacing Table)
    cardList: {
        gap: 12,
        paddingHorizontal: 24,
    },
    gradeCard: {
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
    subBadge: {
        backgroundColor: '#D8DFE9', // Alice blue
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    subBadgeText: {
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
        color: '#64748B',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    scoreBadgeContainer: {
        backgroundColor: '#EFF0A3', // Vanilla color style
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    scoreLabel: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 8,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
    },
    scoreValue: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '800',
        color: '#212121',
    },
    editRowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 12,
        gap: 4,
    },
    editRowBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        fontWeight: '700',
        color: '#212121',
    },
    inlineEditArea: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nilaiLabel: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 12,
        color: '#64748B',
    },
    rowInput: {
        height: 36,
        width: 60,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#212121',
        backgroundColor: 'rgba(255,255,255,0.92)',
        textAlign: 'center',
        fontFamily: 'Urbanist-Bold',
        fontSize: 14,
        fontWeight: '800',
        color: '#212121',
        padding: 0,
    },
    rowEditActions: {
        flexDirection: 'row',
        gap: 4,
    },
    btnInlineSave: {
        width: 32,
        height: 32,
        backgroundColor: '#212121',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnInlineCancel: {
        width: 32,
        height: 32,
        backgroundColor: 'rgba(234, 84, 85, 0.12)',
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
        borderColor: '#E2E8F0',
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 10,
    },
    miniSelectBtnText: {
        fontFamily: 'Urbanist-Bold',
        fontSize: 11,
        color: '#212121',
        flex: 1,
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
        backgroundColor: 'rgba(255,255,255,0.92)',
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
        color: '#212121',
        marginBottom: 14,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    optionRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    optionText: {
        fontFamily: 'Urbanist-SemiBold',
        fontSize: 12,
        color: '#212121',
    },
    emptyGrade: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 24,
    },
    emptyGradeText: {
        fontFamily: 'Urbanist-Medium',
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
    },
});















