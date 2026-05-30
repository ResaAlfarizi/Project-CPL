import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { tokenStorage } from '../../services/api';

const API_BASE = 'http://172.30.100.119:3000/api/v1/m2';

// Decode JWT tanpa library eksternal
function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let str = '';
        let i = 0;
        while (i < base64.length) {
            const e1 = chars.indexOf(base64[i++]);
            const e2 = chars.indexOf(base64[i++]);
            const e3 = chars.indexOf(base64[i++]);
            const e4 = chars.indexOf(base64[i++]);
            str += String.fromCharCode((e1 << 2) | (e2 >> 4));
            if (e3 !== 64) str += String.fromCharCode(((e2 & 15) << 4) | (e3 >> 2));
            if (e4 !== 64) str += String.fromCharCode(((e3 & 3) << 6) | e4);
        }
        return JSON.parse(decodeURIComponent(
            str.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        ));
    } catch { return null; }
}

export default function ProfilDetailScreen({ user }) {
    const [nidn,  setNidn]  = useState('-');
    const [prodi, setProdi] = useState('-');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExtra = async () => {
            try {
                const token = await tokenStorage.get();
                if (!token) return;

                // Decode JWT untuk ambil entity_id
                const payload = decodeJwt(token);
                const entityId = payload?.entity_id || user?.entity_id;

                // Fetch /profile/me — nama_prodi sudah benar di sini
                const res = await fetch(`${API_BASE}/profile/me`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const json = await res.json();
                const data = json.data || {};

                if (data.nama_prodi && data.nama_prodi !== 'Program Studi') {
                    setProdi(data.nama_prodi);
                }

                // Fetch NIDN: gunakan entity_id untuk query ke sub-cpmk dosen
                // yang mengembalikan kode_mk dan nama_mk tapi bukan nidn.
                // Satu-satunya cara: fetch ke dosenProfileModel via dashboard
                // Dashboard tidak ada nidn, tapi kita bisa ambil dari kelas detail
                if (entityId) {
                    // Coba ambil dari kelas by id (getKelasById mengembalikan nidn)
                    // Tapi kita perlu kelas_id dulu dari my-classes
                    const kelasRes = await fetch(`${API_BASE}/kelas/dosen/my-classes`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    const kelasJson = await kelasRes.json();
                    const kelasList = kelasJson.data || [];

                    if (kelasList.length > 0) {
                        // Fetch detail kelas pertama — getKelasById mengembalikan nidn dosen
                        const kelasId = kelasList[0].id;
                        const detailRes = await fetch(`${API_BASE}/kelas/${kelasId}`, {
                            headers: { 'Authorization': `Bearer ${token}` },
                        });
                        const detailJson = await detailRes.json();
                        const detail = detailJson.data || {};
                        if (detail.nidn) {
                            setNidn(detail.nidn);
                        }
                    }
                }
            } catch (err) {
                // Biarkan default '-'
            } finally {
                setLoading(false);
            }
        };

        fetchExtra();
    }, [user?.entity_id]);

    // Nama lengkap dari user.name yang diisi saat login
    // Login response: user.nama = nama_entity dari tabel dosen (nama lengkap, bukan username)
    const nama  = user?.name  || '-';
    const email = user?.email || '-';
    const role  = user?.role  || 'dosen';

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#212121" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* ── Hero Banner ── */}
            <View style={styles.heroBanner}>
                <View style={styles.heroAvatar}>
                    <Text style={styles.heroAvatarText}>
                        {nama.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.heroName}>{nama}</Text>
                <Text style={styles.heroEmail}>{email}</Text>
                <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>{role.toUpperCase()}</Text>
                </View>
            </View>

            {/* ── Informasi Akun ── */}
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Informasi Akun</Text>
                {renderRow('account-outline',        'Nama Lengkap',  nama)}
                {renderRow('email-outline',          'Email',         email)}
                {renderRow('badge-account-outline',  'NIDN',          nidn)}
                {renderRow('school-outline',         'Program Studi', prodi)}
                {renderRow('shield-account-outline', 'Role',          role)}
            </View>
        </ScrollView>
    );

    function renderRow(icon, label, value) {
        return (
            <View style={styles.infoRow} key={label}>
                <View style={styles.infoIconBox}>
                    <MaterialCommunityIcons name={icon} size={16} color="#64748B" />
                </View>
                <View style={styles.infoMeta}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:     { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { paddingBottom: 40 },

    heroBanner: {
        backgroundColor: 'rgba(15,40,25,0.82)',
        paddingHorizontal: 20, paddingTop: 28, paddingBottom: 28,
        alignItems: 'center',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        marginBottom: 20,
    },
    heroAvatar: {
        width: 68, height: 68, borderRadius: 34,
        backgroundColor: '#EFF0A3',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
        borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)',
    },
    heroAvatarText: { fontFamily: 'Urbanist-Bold', fontSize: 30, color: '#212121', fontWeight: '800' },
    heroName:       { fontFamily: 'Urbanist-Bold', fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
    heroEmail:      { fontFamily: 'Urbanist-Medium', fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 3 },
    heroBadge: {
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4,
    },
    heroBadgeText: { fontFamily: 'Urbanist-Bold', fontSize: 10, color: '#EFF0A3', fontWeight: '700', letterSpacing: 0.5 },

    infoCard: {
        marginHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 24, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    },
    cardTitle: { fontFamily: 'Urbanist-Bold', fontSize: 14, fontWeight: '800', color: '#212121', marginBottom: 16 },
    infoRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    infoIconBox: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    infoMeta:  { flex: 1 },
    infoLabel: { fontFamily: 'Urbanist-Bold', fontSize: 9, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.4 },
    infoValue: { fontFamily: 'Urbanist-Bold', fontSize: 13, color: '#212121', fontWeight: '700', marginTop: 2 },
});
