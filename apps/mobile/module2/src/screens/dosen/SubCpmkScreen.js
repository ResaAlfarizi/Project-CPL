import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Modal, TextInput, ActivityIndicator, StatusBar,
    ImageBackground, TouchableWithoutFeedback, Keyboard, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mkCplApi } from '../../services/api';

// Warna sesuai card di menu dosen (aliceBlue)
const THEME_COLOR = '#cad4ed';
const PRIMARY_BLUE = '#577590';
const CANCEL_BG = '#ffebee';
const CANCEL_TEXT = '#c62828';

export default function SubCpmkScreen({ subCpmkList, onAdd, onUpdate, onDelete }) {
    const [modalVisible, setModalVisible]     = useState(false);
    const [editMode, setEditMode]             = useState(false);
    const [selectedId, setSelectedId]         = useState(null);
    const [saving, setSaving]                 = useState(false);

    // Form state
    const [mkCplId, setMkCplId]       = useState('');
    const [kode, setKode]             = useState('');
    const [deskripsi, setDeskripsi]   = useState('');
    const [bobot, setBobot]           = useState('');

    // MK-CPL dropdown
    const [mkCplList, setMkCplList]           = useState([]);
    const [mkCplLoading, setMkCplLoading]     = useState(false);
    const [showMkDropdown, setShowMkDropdown] = useState(false);

    // Alert modal
    const [alertConfig, setAlertConfig] = useState({ visible: false, type: '', title: '', message: '', onConfirm: null });

    useEffect(() => {
        setMkCplLoading(true);
        mkCplApi.getAll()
            .then(res => setMkCplList(res?.data || res || []))
            .catch(() => setMkCplList([]))
            .finally(() => setMkCplLoading(false));
    }, []);

    const selectedMkCpl = mkCplList.find(m => m.id === mkCplId);

    // Label MK-CPL sama seperti web2
    const mkCplLabel = (m) =>
        `${m.nama_mk || ''} (${m.kode_mk || ''}) → ${m.kode_cpl || ''} (Bobot: ${Math.round((m.bobot || 0) * 100)}%)`;

    const openAddModal = () => {
        setEditMode(false); setSelectedId(null);
        setMkCplId(''); setKode(''); setDeskripsi(''); setBobot('');
        setShowMkDropdown(false);
        setModalVisible(true);
    };

    const openEditModal = (item) => {
        setEditMode(true); setSelectedId(item.id);
        setMkCplId(item.mk_cpl_id || item.mkCplId || '');
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

    const handleSave = async () => {
        if (!mkCplId) {
            setAlertConfig({ visible: true, type: 'error', title: 'Pilih MK-CPL', message: 'Mata Kuliah → CPL harus dipilih.', onConfirm: null });
            return;
        }
        if (!kode.trim()) {
            setAlertConfig({ visible: true, type: 'error', title: 'Kode Kosong', message: 'Kode Sub-CPMK harus diisi.', onConfirm: null });
            return;
        }
        if (!deskripsi.trim()) {
            setAlertConfig({ visible: true, type: 'error', title: 'Deskripsi Kosong', message: 'Deskripsi Sub-CPMK harus diisi.', onConfirm: null });
            return;
        }
        const floatBobot = parseFloat(bobot);
        if (isNaN(floatBobot) || floatBobot <= 0 || floatBobot > 1) {
            setAlertConfig({ visible: true, type: 'error', title: 'Bobot Tidak Valid', message: 'Bobot harus antara 0.01 dan 1.00 (contoh: 0.25).', onConfirm: null });
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
                onConfirm: null,
            }), 300);
        } catch (err) {
            const msg = err?.message || 'Terjadi kesalahan';
            const isDup = msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique');
            setAlertConfig({
                visible: true, type: 'error',
                title: isDup ? 'Kode Sudah Ada' : 'Gagal Menyimpan',
                message: isDup ? `Kode "${kode}" sudah digunakan untuk MK-CPL yang sama. Gunakan kode lain.` : msg,
                onConfirm: null,
            });
        } finally { setSaving(false); }
    };

    const confirmDelete = (item) => {
        setAlertConfig({
            visible: true, type: 'confirm',
            title: 'Hapus Sub-CPMK?',
            message: `Yakin hapus "${item.kode_sub_cpmk || item.kode}"? Data yang sudah dihapus tidak bisa dikembalikan.`,
            onConfirm: () => executeDelete(item.id),
        });
    };

    const executeDelete = async (id) => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        try {
            await onDelete(id);
            setAlertConfig({ visible: true, type: 'success', title: 'Terhapus!', message: 'Sub-CPMK berhasil dihapus.', onConfirm: null });
        } catch (err) {
            const msg = err?.message || 'Gagal menghapus';
            const isForbidden = msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('403') || msg.toLowerCase().includes('tidak diizinkan');
            setAlertConfig({
                visible: true, type: 'error',
                title: isForbidden ? 'Akses Ditolak' : 'Gagal Menghapus',
                message: isForbidden ? 'Hanya Superadmin yang dapat menghapus Sub-CPMK.' : msg,
                onConfirm: null,
            });
        }
    };

    const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false, onConfirm: null }));

    const renderItem = ({ item }) => {
        const mkLabel = item.nama_mk
            ? `${item.nama_mk}${item.kode_mk ? ' (' + item.kode_mk + ')' : ''}`
            : (item.kode_mk || '');
        const cplLabel = item.kode_cpl || item.mk_cpl_kode || '';
        return (
            <View style={styles.card}>
                <View style={styles.cardAvatar}>
                    <Text style={styles.avatarText}>{(item.kode_sub_cpmk || item.kode || '??').slice(-2)}</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>
                        {item.kode_sub_cpmk || item.kode || '-'}{cplLabel ? ` • ${cplLabel}` : ''}
                    </Text>
                    {mkLabel ? <Text style={styles.cardMk} numberOfLines={1}>{mkLabel}</Text> : null}
                    <Text style={styles.cardSubtitle} numberOfLines={2}>
                        Bobot: {Number(item.bobot || 0).toFixed(2)} | {item.deskripsi || '-'}
                    </Text>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.editIconBtn} activeOpacity={0.7} onPress={() => openEditModal(item)}>
                        <Ionicons name="pencil-outline" size={16} color={PRIMARY_BLUE} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconBtn} activeOpacity={0.7} onPress={() => confirmDelete(item)}>
                        <Ionicons name="trash-outline" size={16} color={CANCEL_TEXT} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <ImageBackground source={require('../../../assets/uinsa2.jpeg')} style={styles.container} imageStyle={{ opacity: 0.15 }}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            {/* Header — warna sesuai card aliceBlue */}
            <View style={styles.header}>
                <View style={styles.headerTextWrap}>
                    <Text style={styles.headerTitle}>Sub-CPMK</Text>
                    <Text style={styles.headerSubtitle}>Kelola komponen capaian pembelajaran mata kuliah</Text>
                </View>
            </View>

            {subCpmkList.length === 0 ? (
                <View style={styles.emptyWrap}>
                    <Ionicons name="clipboard-outline" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>Belum ada Sub-CPMK</Text>
                    <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal} activeOpacity={0.8}>
                        <Text style={styles.emptyAddBtnText}>Tambah Sekarang</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={subCpmkList}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB Tambah */}
            <TouchableOpacity style={styles.fab} onPress={openAddModal} activeOpacity={0.8}>
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
                            {/* MK-CPL — WAJIB */}
                            <Text style={styles.inputLabel}>Mata Kuliah → CPL *</Text>
                            <View style={styles.inputContainerDropdown}>
                                <Ionicons name="library-outline" size={20} color={PRIMARY_BLUE} style={styles.inputIcon} />
                                <TouchableOpacity style={styles.dropdownTrigger} onPress={() => { Keyboard.dismiss(); setShowMkDropdown(!showMkDropdown); }}>
                                    <Text style={[styles.dropdownValue, !mkCplId && { color: '#94A3B8' }]} numberOfLines={2}>
                                        {mkCplLoading ? 'Memuat...' : selectedMkCpl ? mkCplLabel(selectedMkCpl) : '-- Pilih MK dan CPL --'}
                                    </Text>
                                    <Ionicons name={showMkDropdown ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color="#64748B" />
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
                                    showsVerticalScrollIndicator={true}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={[styles.pickerOption, item.id === mkCplId && styles.pickerOptionSelected]} onPress={() => { setMkCplId(item.id); setShowMkDropdown(false); }}>
                                            <Text style={[styles.pickerOptionText, item.id === mkCplId && { color: PRIMARY_BLUE, fontWeight: '700' }]}>{mkCplLabel(item)}</Text>
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

            {/* ── Alert / Confirm Modal ── */}
            <Modal visible={alertConfig.visible} animationType="fade" transparent onRequestClose={closeAlert}>
                <TouchableOpacity style={styles.alertOverlay} activeOpacity={1} onPress={alertConfig.type === 'confirm' ? undefined : closeAlert}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.alertBox}>
                            <View style={[styles.alertIconWrap, {
                                backgroundColor: alertConfig.type === 'success' ? '#e0f2f1' : alertConfig.type === 'confirm' ? '#fff8e1' : '#ffebee',
                            }]}>
                                <Ionicons
                                    name={alertConfig.type === 'success' ? 'checkmark-circle' : alertConfig.type === 'confirm' ? 'help-circle' : 'warning'}
                                    size={45}
                                    color={alertConfig.type === 'success' ? '#00796b' : alertConfig.type === 'confirm' ? '#f57c00' : '#c62828'}
                                />
                            </View>
                            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
                            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
                            {alertConfig.type === 'confirm' ? (
                                <View style={styles.alertBtnRow}>
                                    <TouchableOpacity style={styles.btnAlertCancel} onPress={closeAlert} activeOpacity={0.8}>
                                        <Text style={styles.btnAlertCancelText}>Batal</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.btnAlertOK, { backgroundColor: '#c62828' }]} onPress={alertConfig.onConfirm} activeOpacity={0.8}>
                                        <Text style={styles.btnAlertOKText}>Ya, Hapus</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={[styles.btnAlertOK, { backgroundColor: alertConfig.type === 'success' ? PRIMARY_BLUE : '#c62828' }]} onPress={closeAlert} activeOpacity={0.8}>
                                    <Text style={styles.btnAlertOKText}>Oke, Mengerti</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F5FA' },
    header: {
        backgroundColor: '#cad4ed',
        paddingTop: 24, paddingBottom: 28, paddingHorizontal: 24,
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 4,
    },
    headerTextWrap: { flex: 1 },
    headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 22, color: '#212121', marginBottom: 4 },
    headerSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#64748B' },
    listContainer: { padding: 20, paddingBottom: 100 },
    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFFFFF', padding: 14, borderRadius: 20,
        marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2,
    },
    cardAvatar: {
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: '#cad4ed', justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    avatarText: { fontFamily: 'Urbanist-Bold', fontSize: 16, color: '#212121' },
    cardContent: { flex: 1 },
    cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#212121', marginBottom: 2 },
    cardMk: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: PRIMARY_BLUE, marginBottom: 3 },
    cardSubtitle: { fontFamily: 'Urbanist-Regular', fontSize: 12, color: '#64748B', paddingRight: 4 },
    cardActions: { flexDirection: 'column', gap: 6, marginLeft: 8 },
    editIconBtn: { padding: 7, borderRadius: 10, backgroundColor: '#EFF0A3' },
    deleteIconBtn: { padding: 7, borderRadius: 10, backgroundColor: '#ffebee' },
    emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingBottom: 80 },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#94A3B8' },
    emptyAddBtn: { backgroundColor: '#212121', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
    emptyAddBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#FFFFFF' },
    fab: {
        position: 'absolute', bottom: 30, right: 30,
        width: 60, height: 60, borderRadius: 20,
        backgroundColor: '#cad4ed', justifyContent: 'center', alignItems: 'center', elevation: 5,
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(33,44,33,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35,
        padding: 24, paddingTop: 15, paddingBottom: 40, maxHeight: '90%', elevation: 20,
    },
    modalHandle: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
    modalTitle: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: PRIMARY_BLUE, textAlign: 'center', marginBottom: 20 },
    inputLabel: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#64748B', marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: '#e2e8f0' },
    inputContainerDropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 52 },
    inputIcon: { marginRight: 10 },
    inputField: { flex: 1, paddingVertical: 14, fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#212121' },
    dropdownTrigger: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    dropdownValue: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#212121', flex: 1, marginRight: 8, lineHeight: 18 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
    btnCancel: { flex: 0.45, backgroundColor: CANCEL_BG, borderRadius: 18, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
    btnCancelText: { color: CANCEL_TEXT, fontFamily: 'Urbanist-Bold', fontSize: 14 },
    btnSubmit: { flex: 0.55, backgroundColor: PRIMARY_BLUE, borderRadius: 18, paddingVertical: 14, alignItems: 'center', elevation: 3 },
    btnSubmitText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 14 },
    pickerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 20 },
    pickerBox: { backgroundColor: '#FFF', width: '100%', borderRadius: 24, maxHeight: '75%', padding: 20, elevation: 10 },
    pickerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 17, color: PRIMARY_BLUE, textAlign: 'center', marginBottom: 14 },
    pickerOption: { paddingVertical: 13, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    pickerOptionSelected: { backgroundColor: '#EFF0A3', borderRadius: 10 },
    pickerOptionText: { fontFamily: 'Urbanist-Regular', fontSize: 13, color: '#212121' },
    pickerCloseBtn: { marginTop: 14, paddingVertical: 10, paddingHorizontal: 30, backgroundColor: CANCEL_BG, borderRadius: 14, alignSelf: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
    pickerCloseText: { color: CANCEL_TEXT, fontFamily: 'Urbanist-Bold', fontSize: 14 },
    alertOverlay: { flex: 1, backgroundColor: 'rgba(33,44,33,0.5)', justifyContent: 'center', alignItems: 'center' },
    alertBox: { backgroundColor: '#FFF', borderRadius: 32, padding: 28, width: '82%', alignItems: 'center', elevation: 20 },
    alertIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
    alertTitle: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: '#212121', marginBottom: 8, textAlign: 'center' },
    alertMessage: { fontFamily: 'Urbanist-Regular', fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 22, lineHeight: 21 },
    alertBtnRow: { flexDirection: 'row', gap: 10, width: '100%' },
    btnAlertCancel: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 18, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    btnAlertCancelText: { color: '#64748B', fontFamily: 'Urbanist-Bold', fontSize: 14 },
    btnAlertOK: { flex: 1, borderRadius: 18, paddingVertical: 13, paddingHorizontal: 28, alignItems: 'center', elevation: 3 },
    btnAlertOKText: { color: '#FFF', fontFamily: 'Urbanist-Bold', fontSize: 15 },
});
