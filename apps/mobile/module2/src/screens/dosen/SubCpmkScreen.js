import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Modal, TextInput, ActivityIndicator,
    ImageBackground, TouchableWithoutFeedback, Keyboard, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mkCplApi } from '../../services/api';

const THEME_COLOR = '#cad4ed';   // aliceBlue — sesuai card menu dosen
const PRIMARY_BLUE = '#577590';
const CANCEL_BG = '#ffebee';
const CANCEL_TEXT = '#c62828';

export default function SubCpmkScreen({ subCpmkList, onAdd, onUpdate }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode]         = useState(false);
    const [selectedId, setSelectedId]     = useState(null);
    const [saving, setSaving]             = useState(false);

    // Form state
    const [mkCplId, setMkCplId]       = useState('');
    const [kode, setKode]             = useState('');
    const [deskripsi, setDeskripsi]   = useState('');
    const [bobot, setBobot]           = useState('');

    // MK-CPL list (dari API)
    const [mkCplList, setMkCplList]           = useState([]);
    const [mkCplLoading, setMkCplLoading]     = useState(false);
    const [showMkDropdown, setShowMkDropdown] = useState(false);

    // Alert modal
    const [alertConfig, setAlertConfig] = useState({
        visible: false, type: '', title: '', message: '',
    });

    useEffect(() => {
        setMkCplLoading(true);
        mkCplApi.getAll()
            .then(res => setMkCplList(res?.data || res || []))
            .catch(() => setMkCplList([]))
            .finally(() => setMkCplLoading(false));
    }, []);

    // ── Grouping: sama persis seperti web dosen ──────────────────────────────
    // Buat map: kode_mk → { info MK, mkCplList[], subCpmkList[] }
    const mkGroups = [];
    const mkMap = new Map();

    mkCplList.forEach(mc => {
        const key = mc.kode_mk || mc.mk_id;
        if (!mkMap.has(key)) {
            mkMap.set(key, {
                kode_mk:  mc.kode_mk  || '-',
                nama_mk:  mc.nama_mk  || '-',
                sks:      mc.sks,
                semester: mc.semester,
                mkCplItems: [],   // daftar pemetaan MK→CPL
                subCpmkItems: [], // semua sub-cpmk milik MK ini
            });
        }
        mkMap.get(key).mkCplItems.push(mc);
    });

    subCpmkList.forEach(sub => {
        const key = sub.kode_mk || (() => {
            // cari kode_mk dari mkCplList berdasarkan mk_cpl_id
            const mc = mkCplList.find(m => m.id === sub.mk_cpl_id);
            return mc ? (mc.kode_mk || mc.mk_id) : null;
        })();
        if (key && mkMap.has(key)) {
            mkMap.get(key).subCpmkItems.push(sub);
        }
    });

    mkMap.forEach(g => mkGroups.push(g));

    // ── Helpers ──────────────────────────────────────────────────────────────
    const selectedMkCpl = mkCplList.find(m => m.id === mkCplId);

    const mkCplLabel = (m) =>
        `${m.nama_mk || ''} (${m.kode_mk || ''}) → ${m.kode_cpl || ''} (Bobot: ${Math.round((m.bobot || 0) * 100)}%)`;

    const openAddModal = (prefillMkCplId = '') => {
        setEditMode(false); setSelectedId(null);
        setMkCplId(prefillMkCplId); setKode(''); setDeskripsi(''); setBobot('');
        setShowMkDropdown(false);
        setModalVisible(true);
    };

    const openEditModal = (item) => {
        setEditMode(true); setSelectedId(item.id);
        setMkCplId(item.mk_cpl_id || '');
        setKode(item.kode_sub_cpmk || item.kode || '');
        setDeskripsi(item.deskripsi || '');
        setBobot((item.bobot || 0).toString());
        setShowMkDropdown(false);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false); setShowMkDropdown(false);
        setMkCplId(''); setKode(''); setDeskripsi(''); setBobot('');
    };

    const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!mkCplId) {
            setAlertConfig({ visible: true, type: 'error', title: 'Pilih MK-CPL', message: 'Mata Kuliah → CPL harus dipilih.' });
            return;
        }
        if (!kode.trim()) {
            setAlertConfig({ visible: true, type: 'error', title: 'Kode Kosong', message: 'Kode Sub-CPMK harus diisi.' });
            return;
        }
        if (!deskripsi.trim()) {
            setAlertConfig({ visible: true, type: 'error', title: 'Deskripsi Kosong', message: 'Deskripsi Sub-CPMK harus diisi.' });
            return;
        }
        const floatBobot = parseFloat(bobot);
        if (isNaN(floatBobot) || floatBobot <= 0 || floatBobot > 1) {
            setAlertConfig({ visible: true, type: 'error', title: 'Bobot Tidak Valid', message: 'Bobot harus antara 0.01 dan 1.00 (contoh: 0.25).' });
            return;
        }
        // Validasi total bobot per MK-CPL
        const currentTotal = subCpmkList
            .filter(s => s.mk_cpl_id === mkCplId && s.id !== selectedId)
            .reduce((sum, s) => sum + Number(s.bobot || 0), 0);
        if (currentTotal + floatBobot > 1.0001) {
            const mc = mkCplList.find(m => m.id === mkCplId);
            setAlertConfig({
                visible: true, type: 'error',
                title: 'Bobot Melebihi 100%',
                message: `Total bobot Sub-CPMK untuk ${mc?.nama_mk || 'MK'} → ${mc?.kode_cpl || 'CPL'} akan menjadi ${((currentTotal + floatBobot) * 100).toFixed(1)}%. Maksimal 100%.`,
            });
            return;
        }

        const data = { mk_cpl_id: mkCplId, kode_sub_cpmk: kode.trim(), deskripsi: deskripsi.trim(), bobot: floatBobot };
        setSaving(true);
        try {
            if (editMode) { await onUpdate(selectedId, data); }
            else          { await onAdd(data); }
            closeModal();
            setTimeout(() => setAlertConfig({
                visible: true, type: 'success',
                title: 'Berhasil!',
                message: editMode ? 'Sub-CPMK berhasil diperbarui.' : 'Sub-CPMK baru berhasil ditambahkan.',
            }), 300);
        } catch (err) {
            const msg = err?.message || 'Terjadi kesalahan';
            const isDup = msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique');
            setAlertConfig({
                visible: true, type: 'error',
                title: isDup ? 'Kode Sudah Ada' : 'Gagal Menyimpan',
                message: isDup ? `Kode "${kode}" sudah digunakan untuk MK-CPL yang sama. Gunakan kode lain.` : msg,
            });
        } finally { setSaving(false); }
    };

    // ── Delete — tidak tersedia untuk Dosen (hanya Superadmin)
    // Backend mengembalikan 403 jika dosen mencoba hapus Sub-CPMK

    // ── Render sub-cpmk card per CPL ─────────────────────────────────────────
    const renderSubCard = (sub) => (
        <View key={String(sub.id)} style={styles.subCard}>
            <View style={styles.subCardLeft}>
                <View style={styles.kodeBadge}>
                    <Text style={styles.kodeBadgeText}>{sub.kode_sub_cpmk || sub.kode || '-'}</Text>
                </View>
                <View style={styles.subCardInfo}>
                    <Text style={styles.subDeskripsi} numberOfLines={2}>{sub.deskripsi || '-'}</Text>
                    <View style={styles.bobotRow}>
                        <View style={styles.bobotBadge}>
                            <Text style={styles.bobotBadgeText}>
                                {Number(sub.bobot || 0).toFixed(4)} ({(Number(sub.bobot || 0) * 100).toFixed(1)}%)
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.editIconBtn} activeOpacity={0.7} onPress={() => openEditModal(sub)}>
                <Ionicons name="pencil-outline" size={15} color={PRIMARY_BLUE} />
            </TouchableOpacity>
        </View>
    );

    // ── Render group per Mata Kuliah ──────────────────────────────────────────
    const renderMkGroup = (group, idx) => (
        <View key={group.kode_mk + idx} style={styles.mkGroupCard}>
            {/* Header MK — gradient-like dengan warna aliceBlue gelap */}
            <View style={styles.mkHeader}>
                <View style={styles.mkHeaderLeft}>
                    <View style={styles.mkHeaderBadgeRow}>
                        <View style={styles.mkKodeBadge}>
                            <Text style={styles.mkKodeBadgeText}>{group.kode_mk}</Text>
                        </View>
                        {group.sks ? (
                            <View style={styles.mkInfoPill}>
                                <Text style={styles.mkInfoPillText}>{group.sks} SKS</Text>
                            </View>
                        ) : null}
                        {group.semester ? (
                            <View style={styles.mkInfoPill}>
                                <Text style={styles.mkInfoPillText}>Sem {group.semester}</Text>
                            </View>
                        ) : null}
                    </View>
                    <Text style={styles.mkNama}>{group.nama_mk}</Text>
                </View>
                <Ionicons name="book-outline" size={28} color="rgba(33,44,33,0.2)" />
            </View>

            {/* Per CPL dalam MK ini */}
            <View style={styles.mkBody}>
                {group.mkCplItems.map((mc) => {
                    const subsForCpl = group.subCpmkItems.filter(s => s.mk_cpl_id === mc.id);
                    const totalBobot = subsForCpl.reduce((sum, s) => sum + Number(s.bobot || 0), 0);
                    const isOver    = totalBobot > 1.0001;
                    const isDone    = totalBobot >= 0.999 && totalBobot <= 1.0001;
                    const pct       = (totalBobot * 100).toFixed(1);

                    return (
                        <View key={mc.id} style={styles.cplSection}>
                            {/* CPL header bar */}
                            <View style={[styles.cplHeaderBar, isOver && styles.cplHeaderBarOver]}>
                                <View style={styles.cplHeaderLeft}>
                                    <View style={styles.cplBadge}>
                                        <Text style={styles.cplBadgeText}>{mc.kode_cpl}</Text>
                                    </View>
                                    <Text style={styles.cplBobotMk}>
                                        Bobot MK→CPL: <Text style={{ fontFamily: 'Urbanist-Bold' }}>{Math.round((mc.bobot || 0) * 100)}%</Text>
                                    </Text>
                                </View>
                                <View style={styles.cplHeaderRight}>
                                    <Text style={[
                                        styles.totalBobotText,
                                        isOver ? { color: '#c62828' } : isDone ? { color: '#16a34a' } : { color: '#f59e0b' },
                                    ]}>
                                        Σ {pct}%{isOver ? ' ⚠️' : isDone ? ' ✓' : ''}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.addCplBtn}
                                        activeOpacity={0.8}
                                        onPress={() => openAddModal(mc.id)}
                                    >
                                        <Ionicons name="add" size={13} color="#212121" />
                                        <Text style={styles.addCplBtnText}>Tambah</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Warning over limit */}
                            {isOver && (
                                <View style={styles.warningBar}>
                                    <Ionicons name="warning-outline" size={14} color="#c62828" />
                                    <Text style={styles.warningText}>
                                        Total bobot melebihi 100% ({pct}%). Harap sesuaikan.
                                    </Text>
                                </View>
                            )}

                            {/* Sub-CPMK list untuk CPL ini */}
                            {subsForCpl.length === 0 ? (
                                <View style={styles.emptySubWrap}>
                                    <Text style={styles.emptySubText}>Belum ada Sub-CPMK untuk pemetaan ini</Text>
                                </View>
                            ) : (
                                <View style={styles.subList}>
                                    {subsForCpl.map(sub => renderSubCard(sub))}
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <ImageBackground
            source={require('../../../assets/uinsa2.jpeg')}
            style={styles.container}
            imageStyle={{ opacity: 0.15 }}
        >
            {/* Header hero — aliceBlue */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sub-CPMK</Text>
                <Text style={styles.headerSubtitle}>Kelola komponen capaian pembelajaran mata kuliah</Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {mkCplLoading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
                        <Text style={styles.loadingText}>Memuat data...</Text>
                    </View>
                ) : mkGroups.length === 0 ? (
                    <View style={styles.emptyWrap}>
                        <Ionicons name="clipboard-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>Belum ada Mata Kuliah yang diampu</Text>
                        <TouchableOpacity style={styles.emptyAddBtn} onPress={() => openAddModal()} activeOpacity={0.8}>
                            <Text style={styles.emptyAddBtnText}>Tambah Sub-CPMK</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    mkGroups.map((g, i) => renderMkGroup(g, i))
                )}
            </ScrollView>

            {/* FAB — tambah tanpa prefill */}
            <TouchableOpacity style={styles.fab} onPress={() => openAddModal()} activeOpacity={0.8}>
                <Ionicons name="add" size={28} color="#212121" />
            </TouchableOpacity>

            {/* ── Modal Tambah / Edit ── */}
            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); closeModal(); }}>
                        <View style={StyleSheet.absoluteFillObject} />
                    </TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>{editMode ? 'Edit Sub-CPMK' : 'Tambah Sub-CPMK'}</Text>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {/* MK-CPL dropdown */}
                            <Text style={styles.inputLabel}>Mata Kuliah → CPL *</Text>
                            <View style={styles.inputContainerDropdown}>
                                <Ionicons name="library-outline" size={20} color={PRIMARY_BLUE} style={styles.inputIcon} />
                                <TouchableOpacity
                                    style={styles.dropdownTrigger}
                                    onPress={() => { Keyboard.dismiss(); setShowMkDropdown(!showMkDropdown); }}
                                    disabled={editMode}
                                >
                                    <Text style={[styles.dropdownValue, !mkCplId && { color: '#94A3B8' }]} numberOfLines={2}>
                                        {mkCplLoading ? 'Memuat...' : selectedMkCpl ? mkCplLabel(selectedMkCpl) : '-- Pilih MK dan CPL --'}
                                    </Text>
                                    {!editMode && <Ionicons name={showMkDropdown ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color="#64748B" />}
                                </TouchableOpacity>
                            </View>
                            {/* Kode */}
                            <Text style={styles.inputLabel}>Kode Sub-CPMK *</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="barcode-outline" size={20} color={PRIMARY_BLUE} style={styles.inputIcon} />
                                <TextInput style={styles.inputField} value={kode} onChangeText={setKode} placeholder="Contoh: Sub-CPMK-1" placeholderTextColor="#94A3B8" autoCapitalize="characters" />
                            </View>
                            {/* Deskripsi */}
                            <Text style={styles.inputLabel}>Deskripsi *</Text>
                            <View style={[styles.inputContainer, { alignItems: 'flex-start' }]}>
                                <Ionicons name="create-outline" size={20} color={PRIMARY_BLUE} style={[styles.inputIcon, { marginTop: 15 }]} />
                                <TextInput style={[styles.inputField, { height: 80, textAlignVertical: 'top', paddingTop: 15 }]} value={deskripsi} onChangeText={setDeskripsi} placeholder="Deskripsi capaian..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />
                            </View>
                            {/* Bobot */}
                            <Text style={styles.inputLabel}>Bobot (0.01 – 1.00) *</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="pie-chart-outline" size={20} color={PRIMARY_BLUE} style={styles.inputIcon} />
                                <TextInput style={styles.inputField} value={bobot} onChangeText={setBobot} placeholder="Contoh: 0.25" placeholderTextColor="#94A3B8" keyboardType="decimal-pad" />
                            </View>
                            <Text style={styles.bobotHint}>⚠️ Total bobot semua Sub-CPMK untuk MK-CPL yang sama harus = 1.0 (100%)</Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.btnCancel} onPress={closeModal} activeOpacity={0.8}>
                                    <Text style={styles.btnCancelText}>Batal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btnSubmit, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                                    {saving ? <ActivityIndicator size="small" color="#212121" /> : <Text style={styles.btnSubmitText}>{editMode ? 'Simpan Perubahan' : 'Tambah Sub-CPMK'}</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                    {/* Picker MK-CPL */}
                    {showMkDropdown && (
                        <View style={styles.pickerOverlay}>
                            <View style={styles.pickerBox}>
                                <Text style={styles.pickerTitle}>Pilih Mata Kuliah → CPL</Text>
                                <FlatList
                                    data={mkCplList}
                                    keyExtractor={item => String(item.id)}
                                    showsVerticalScrollIndicator
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.pickerOption, item.id === mkCplId && styles.pickerOptionSelected]}
                                            onPress={() => { setMkCplId(item.id); setShowMkDropdown(false); }}
                                        >
                                            <Text style={[styles.pickerOptionText, item.id === mkCplId && { color: PRIMARY_BLUE, fontWeight: '700' }]}>
                                                {mkCplLabel(item)}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <TouchableOpacity style={styles.pickerCloseBtn} onPress={() => setShowMkDropdown(false)}>
                                    <Text style={styles.pickerCloseText}>Batal</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>

            {/* ── Alert Modal ── */}
            <Modal visible={alertConfig.visible} animationType="fade" transparent onRequestClose={closeAlert}>
                <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={closeAlert}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.alertBox}>
                            <View style={[styles.alertIconWrap, {
                                backgroundColor: alertConfig.type === 'success' ? '#e0f2f1' : '#ffebee',
                            }]}>
                                <Ionicons
                                    name={alertConfig.type === 'success' ? 'checkmark-circle' : 'warning'}
                                    size={45}
                                    color={alertConfig.type === 'success' ? '#00796b' : '#c62828'}
                                />
                            </View>
                            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
                            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
                            <TouchableOpacity
                                style={[styles.btnAlertOK, { backgroundColor: alertConfig.type === 'success' ? PRIMARY_BLUE : '#c62828' }]}
                                onPress={closeAlert}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.btnAlertOKText}>Oke, Mengerti</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F5FA' },

    // ── Header hero ──
    header: {
        backgroundColor: THEME_COLOR,
        paddingTop: 24, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 4,
    },
    headerTitle:    { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 4 },
    headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },

    // ── Scroll ──
    scroll:        { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 100 },

    // ── Loading / Empty ──
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
    loadingText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#64748B' },
    emptyWrap:   { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
    emptyText:   { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#94A3B8', textAlign: 'center' },
    emptyAddBtn: { backgroundColor: '#212121', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
    emptyAddBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#FFFFFF' },

    // ── MK Group Card ──
    mkGroupCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24, marginBottom: 20,
        overflow: 'hidden',
        elevation: 3,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    mkHeader: {
        backgroundColor: THEME_COLOR,
        paddingHorizontal: 20, paddingVertical: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    mkHeaderLeft: { flex: 1, paddingRight: 8 },
    mkHeaderBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    mkKodeBadge: {
        backgroundColor: 'rgba(33,44,33,0.15)',
        borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3,
    },
    mkKodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#212121' },
    mkInfoPill: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
    },
    mkInfoPillText: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: '#212121' },
    mkNama: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121' },

    // ── MK Body ──
    mkBody: { padding: 16 },

    // ── CPL Section ──
    cplSection: { marginBottom: 20 },
    cplHeaderBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#f0fdf4',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
        borderWidth: 1.5, borderColor: '#bbf7d0',
        marginBottom: 10,
    },
    cplHeaderBarOver: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },
    cplHeaderLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    cplHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cplBadge: {
        backgroundColor: '#D8DFE9',
        borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    },
    cplBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#212121' },
    cplBobotMk: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', flex: 1 },
    totalBobotText: { fontFamily: 'Urbanist-Bold', fontSize: 12 },
    addCplBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#EFF0A3',
        borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
    },
    addCplBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#212121' },

    // ── Warning bar ──
    warningBar: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#fef2f2', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10,
    },
    warningText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#c62828', flex: 1 },

    // ── Empty sub ──
    emptySubWrap: {
        padding: 20, alignItems: 'center',
        backgroundColor: '#F9FAFB', borderRadius: 12,
        borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed',
    },
    emptySubText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#94A3B8' },

    // ── Sub-CPMK card ──
    subList: { gap: 8 },
    subCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14, padding: 12,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    subCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    kodeBadge: {
        backgroundColor: '#212121',
        borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
        alignSelf: 'flex-start', marginTop: 2,
    },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#FFFFFF' },
    subCardInfo: { flex: 1 },
    subDeskripsi: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#212121', lineHeight: 18, marginBottom: 6 },
    bobotRow: { flexDirection: 'row' },
    bobotBadge: {
        backgroundColor: '#FEF3C7',
        borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    },
    bobotBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#92400e' },
    subCardActions: { flexDirection: 'column', gap: 6, marginLeft: 8 },
    editIconBtn:   { padding: 7, borderRadius: 10, backgroundColor: '#EFF0A3', marginLeft: 8 },
    deleteIconBtn: { padding: 7, borderRadius: 10, backgroundColor: '#ffebee' },

    // ── FAB ──
    fab: {
        position: 'absolute', bottom: 30, right: 30,
        width: 60, height: 60, borderRadius: 20,
        backgroundColor: THEME_COLOR, justifyContent: 'center', alignItems: 'center', elevation: 5,
    },

    // ── Modal ──
    modalOverlay: { flex: 1, backgroundColor: 'rgba(33,44,33,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35,
        padding: 24, paddingTop: 15, paddingBottom: 40, maxHeight: '90%', elevation: 20,
    },
    modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
    modalTitle:  { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_BLUE, textAlign: 'center', marginBottom: 20 },
    inputLabel:  { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#64748B', marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: '#e2e8f0' },
    inputContainerDropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 52 },
    inputIcon:   { marginRight: 10 },
    inputField:  { flex: 1, paddingVertical: 14, fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#212121' },
    dropdownTrigger: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    dropdownValue:   { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#212121', flex: 1, marginRight: 8, lineHeight: 18 },
    bobotHint: { fontFamily: 'Urbanist-Regular', fontSize: 11, color: '#f59e0b', marginTop: 6, lineHeight: 16 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
    btnCancel: { flex: 0.45, backgroundColor: CANCEL_BG, borderRadius: 18, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
    btnCancelText: { color: CANCEL_TEXT, fontFamily: 'Urbanist-Bold', fontSize: 14 },
    btnSubmit: { flex: 0.55, backgroundColor: PRIMARY_BLUE, borderRadius: 18, paddingVertical: 14, alignItems: 'center', elevation: 3 },
    btnSubmitText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 14 },

    // ── Picker ──
    pickerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 20 },
    pickerBox:     { backgroundColor: '#FFF', width: '100%', borderRadius: 24, maxHeight: '75%', padding: 20, elevation: 10 },
    pickerTitle:   { fontFamily: 'Urbanist-Bold', fontSize: 17, color: PRIMARY_BLUE, textAlign: 'center', marginBottom: 14 },
    pickerOption:  { paddingVertical: 13, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    pickerOptionSelected: { backgroundColor: '#EFF0A3', borderRadius: 10 },
    pickerOptionText: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#212121' },
    pickerCloseBtn: { marginTop: 14, paddingVertical: 10, paddingHorizontal: 30, backgroundColor: CANCEL_BG, borderRadius: 14, alignSelf: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
    pickerCloseText: { color: CANCEL_TEXT, fontFamily: 'Urbanist-Bold', fontSize: 14 },

    // ── Alert ──
    alertOverlay: { flex: 1, backgroundColor: 'rgba(33,44,33,0.5)', justifyContent: 'center', alignItems: 'center' },
    alertBox:     { backgroundColor: '#FFF', borderRadius: 32, padding: 28, width: '82%', alignItems: 'center', elevation: 20 },
    alertIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
    alertTitle:   { fontFamily: 'Urbanist-Bold', fontSize: 20, color: '#212121', marginBottom: 8, textAlign: 'center' },
    alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 22, lineHeight: 21 },
    btnAlertOK:   { borderRadius: 18, paddingVertical: 13, paddingHorizontal: 28, alignItems: 'center', elevation: 3, minWidth: 140 },
    btnAlertOKText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
});
