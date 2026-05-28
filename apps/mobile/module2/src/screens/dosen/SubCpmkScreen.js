import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Modal, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mkCplApi } from '../../services/api';

export default function SubCpmkScreen({ subCpmkList, onAdd, onUpdate, onDelete }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode,     setEditMode]     = useState(false);
    const [selectedId,   setSelectedId]   = useState(null);
    const [saving,       setSaving]       = useState(false);

    // Form state
    const [mkCplId,   setMkCplId]   = useState('');
    const [kode,      setKode]      = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [bobot,     setBobot]     = useState('');

    // MK-CPL list untuk dropdown
    const [mkCplList,     setMkCplList]     = useState([]);
    const [mkCplLoading,  setMkCplLoading]  = useState(false);
    const [showMkDropdown,setShowMkDropdown]= useState(false);

    useEffect(() => {
        setMkCplLoading(true);
        mkCplApi.getAll()
            .then(res => setMkCplList(res?.data || res || []))
            .catch(() => setMkCplList([]))
            .finally(() => setMkCplLoading(false));
    }, []);

    const selectedMkCpl = mkCplList.find(m => m.id === mkCplId);

    const openAddModal = () => {
        setEditMode(false);
        setSelectedId(null);
        setMkCplId('');
        setKode('');
        setDeskripsi('');
        setBobot('');
        setShowMkDropdown(false);
        setModalVisible(true);
    };

    const openEditModal = (item) => {
        setEditMode(true);
        setSelectedId(item.id);
        setMkCplId(item.mk_cpl_id || item.mkCplId || '');
        setKode(item.kode_sub_cpmk || item.kode || '');
        setDeskripsi(item.deskripsi || '');
        setBobot((item.bobot || 0).toString());
        setShowMkDropdown(false);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!kode.trim())      { Alert.alert('Error', 'Kode Sub-CPMK harus diisi'); return; }
        if (!deskripsi.trim()) { Alert.alert('Error', 'Deskripsi harus diisi'); return; }
        const floatBobot = parseFloat(bobot);
        if (isNaN(floatBobot) || floatBobot < 0 || floatBobot > 1) {
            Alert.alert('Error', 'Bobot harus antara 0 dan 1 (contoh: 0.25)');
            return;
        }

        const data = {
            mk_cpl_id:     mkCplId || null,
            kode_sub_cpmk: kode.trim(),
            deskripsi:     deskripsi.trim(),
            bobot:         floatBobot,
        };

        setSaving(true);
        try {
            if (editMode) {
                await onUpdate(selectedId, data);
            } else {
                await onAdd(data);
            }
            setModalVisible(false);
        } catch (err) {
            Alert.alert('Gagal', err?.message || 'Terjadi kesalahan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id, kodeItem) => {
        Alert.alert(
            'Hapus Sub-CPMK',
            `Yakin hapus "${kodeItem}"?`,
            [
                { text: 'Batal', style: 'cancel' },
                { text: 'Hapus', style: 'destructive', onPress: () => onDelete(id) },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── Hero Banner ── */}
                <View style={styles.heroBanner}>
                    <Text style={styles.heroTitle}>Sub-CPMK</Text>
                    <Text style={styles.heroSubtitle}>Kelola komponen capaian pembelajaran mata kuliah</Text>
                    <TouchableOpacity activeOpacity={0.8} style={styles.heroAddBtn} onPress={openAddModal}>
                        <MaterialCommunityIcons name="plus" size={14} color="#212121" />
                        <Text style={styles.heroAddBtnText}>Tambah Sub-CPMK</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Card List ── */}
                <View style={styles.cardList}>
                    {subCpmkList.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <MaterialCommunityIcons name="clipboard-text-off-outline" size={32} color="#CBD5E1" />
                            <Text style={styles.emptyText}>Belum ada Sub-CPMK</Text>
                            <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal} activeOpacity={0.8}>
                                <Text style={styles.emptyAddBtnText}>Tambah Sekarang</Text>
                            </TouchableOpacity>
                        </View>
                    ) : subCpmkList.map((item) => (
                        <View key={item.id} style={styles.cpmkCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.kodeBadge}>
                                    <Text style={styles.kodeBadgeText}>{item.kode_sub_cpmk || item.kode || '-'}</Text>
                                </View>
                                <View style={styles.bobotBadge}>
                                    <Text style={styles.bobotBadgeLabel}>Bobot</Text>
                                    <Text style={styles.bobotBadgeText}>{Number(item.bobot || 0).toFixed(2)}</Text>
                                </View>
                            </View>
                            <Text style={styles.deskripsiText}>{item.deskripsi || '-'}</Text>
                            {item.mk_cpl_kode || item.kode_cpl ? (
                                <View style={styles.cplTag}>
                                    <MaterialCommunityIcons name="link-variant" size={11} color="#6366F1" />
                                    <Text style={styles.cplTagText}>{item.mk_cpl_kode || item.kode_cpl}</Text>
                                </View>
                            ) : null}
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.editBtn} activeOpacity={0.8} onPress={() => openEditModal(item)}>
                                    <MaterialCommunityIcons name="pencil-outline" size={14} color="#212121" />
                                    <Text style={styles.editBtnText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8} onPress={() => handleDelete(item.id, item.kode_sub_cpmk || item.kode)}>
                                    <MaterialCommunityIcons name="trash-can-outline" size={14} color="#EA5455" />
                                    <Text style={styles.deleteBtnText}>Hapus</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* ── Modal Tambah/Edit ── */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editMode ? 'Edit Sub-CPMK' : 'Tambah Sub-CPMK'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={22} color="#212121" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* MK-CPL Dropdown */}
                            <Text style={styles.inputLabel}>MK-CPL (Opsional)</Text>
                            <TouchableOpacity style={styles.selectBtn} activeOpacity={0.8}
                                onPress={() => setShowMkDropdown(!showMkDropdown)}>
                                <Text style={[styles.selectBtnText, !mkCplId && { color: '#94A3B8' }]}>
                                    {mkCplLoading ? 'Memuat...' : selectedMkCpl
                                        ? `${selectedMkCpl.kode_cpl || selectedMkCpl.kode || ''} - ${selectedMkCpl.deskripsi || ''}`
                                        : '-- Pilih MK-CPL (opsional) --'}
                                </Text>
                                <MaterialCommunityIcons name={showMkDropdown ? 'menu-up' : 'menu-down'} size={20} color="#64748B" />
                            </TouchableOpacity>
                            {showMkDropdown && (
                                <View style={styles.dropdownList}>
                                    <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMkCplId(''); setShowMkDropdown(false); }}>
                                        <Text style={[styles.dropdownItemText, { color: '#94A3B8' }]}>-- Tidak dipilih --</Text>
                                    </TouchableOpacity>
                                    {mkCplList.map(m => (
                                        <TouchableOpacity key={m.id} style={styles.dropdownItem}
                                            onPress={() => { setMkCplId(m.id); setShowMkDropdown(false); }}>
                                            <Text style={styles.dropdownItemText}>
                                                {m.kode_cpl || m.kode || m.id} — {m.deskripsi || ''}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Kode */}
                            <Text style={styles.inputLabel}>Kode Sub-CPMK *</Text>
                            <View style={styles.inputBox}>
                                <TextInput style={styles.textInput} value={kode} onChangeText={setKode}
                                    placeholder="Contoh: Sub-CPMK-1" placeholderTextColor="#94A3B8" autoCapitalize="characters" />
                            </View>

                            {/* Deskripsi */}
                            <Text style={styles.inputLabel}>Deskripsi *</Text>
                            <View style={[styles.inputBox, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
                                <TextInput style={[styles.textInput, { height: 60 }]} value={deskripsi} onChangeText={setDeskripsi}
                                    placeholder="Deskripsi capaian..." placeholderTextColor="#94A3B8"
                                    multiline numberOfLines={3} textAlignVertical="top" />
                            </View>

                            {/* Bobot */}
                            <Text style={styles.inputLabel}>Bobot (0.00 – 1.00) *</Text>
                            <View style={styles.inputBox}>
                                <TextInput style={styles.textInput} value={bobot} onChangeText={setBobot}
                                    placeholder="Contoh: 0.25" placeholderTextColor="#94A3B8" keyboardType="decimal-pad" />
                            </View>

                            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                                onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                                {saving
                                    ? <ActivityIndicator size="small" color="#212121" />
                                    : <Text style={styles.saveBtnText}>{editMode ? 'Simpan Perubahan' : 'Tambah Sub-CPMK'}</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container:   { flex: 1, backgroundColor: 'transparent' },
    scrollView:  { flex: 1 },
    scrollContent: { paddingBottom: 40 },

    /* Hero */
    heroBanner: {
        backgroundColor: 'rgba(15,40,25,0.82)',
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24,
        marginBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    heroTitle:    { fontFamily: 'Urbanist-Bold', fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
    heroSubtitle: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 4 },
    heroAddBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12,
        backgroundColor: '#EFF0A3', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6,
        alignSelf: 'flex-start',
    },
    heroAddBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#212121', fontWeight: '700' },

    /* Card list */
    cardList: { gap: 14, paddingHorizontal: 20 },
    cpmkCard: {
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    kodeBadge: { backgroundColor: '#212121', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    kodeBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
    bobotBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF0A3', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    bobotBadgeLabel: { fontFamily: 'Urbanist-Medium', fontSize: 10, color: '#64748B' },
    bobotBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#212121', fontWeight: '700' },
    deskripsiText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#212121', lineHeight: 19, marginBottom: 8 },
    cplTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
    cplTagText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#6366F1', fontWeight: '700' },
    cardActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D8DFE9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    editBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#212121', fontWeight: '700' },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(234,84,85,0.1)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    deleteBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 11, color: '#EA5455', fontWeight: '700' },

    /* Empty */
    emptyCard: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, padding: 32, alignItems: 'center', gap: 10, elevation: 2 },
    emptyText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#94A3B8' },
    emptyAddBtn: { backgroundColor: '#212121', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
    emptyAddBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 12, color: '#FFFFFF', fontWeight: '700' },

    /* Modal */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, fontWeight: '800', color: '#212121' },
    inputLabel: { fontFamily: 'Urbanist-Bold', fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.4 },
    inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, height: 48, backgroundColor: '#FAFAFA' },
    textInput: { flex: 1, fontFamily: 'Urbanist-Medium', fontSize: 14, color: '#212121', padding: 0 },
    selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, height: 48, backgroundColor: '#FAFAFA' },
    selectBtnText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#212121', flex: 1 },
    dropdownList: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: '#FFFFFF', marginTop: 4, maxHeight: 180, overflow: 'hidden' },
    dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    dropdownItemText: { fontFamily: 'Urbanist-Medium', fontSize: 13, color: '#212121' },
    saveBtn: { marginTop: 20, height: 50, backgroundColor: '#212121', borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
    saveBtnText: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: '#FFFFFF', fontWeight: '800' },
});
