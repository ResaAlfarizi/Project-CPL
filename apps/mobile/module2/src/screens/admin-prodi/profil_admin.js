import React, { useState, useEffect } from 'react'; 
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  StatusBar, ImageBackground, ScrollView,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ SEKARANG MENGGUNAKAN PROFILEAPI UTAMA DARI API.JS KELOMPOK
import { profileApi } from '../../services/api';

const COLORS = {
  primary: '#577590', // Disesuaikan dengan aksen biru KelolaCPL & Audit agar serasi     
  background: '#F6F5FA',  
  surface: '#FFFFFF',    
  textMain: '#212121',  
  textMuted: '#64748B',
  border: '#E2E8F0',     
  aliceBlue: '#cad4ed',
  honeydew: '#dcead7',
  vanilla: '#f2f3cb',
};

export default function ProfilAdminScreen({ navigation }) {
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FUNGSI TARIK DATA MENGGUNAKAN API TERSENTRALISASI
  const fetchProfileData = () => {
    setIsLoading(true);
    
    profileApi.getAdmin()
      .then(result => {
        // Ekstraksi layer data secara aman sesuai standar respons backend kelompok
        const fetchedData = result && result.data ? result.data : (result || {});
        setProfileData(fetchedData);
      })
      .catch(error => {
        console.error("Gagal menarik data profil melalui api.js:", error);
        setProfileData({});
      })
      .finally(() => {
        setIsLoading(false); 
      });
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <ImageBackground 
      source={require('../../../assets/uinsa2.jpeg')} 
      style={styles.container} 
      imageStyle={{ opacity: 0.1 }} 
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Saya</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Memuat profil admin...</Text>
          </View>
        ) : (
          <View style={styles.profileCard}>
            {/* ✅ BAGIAN AVATAR SUDAH DIUBAH MENJADI BULAT SEMPURNA */}
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarLetter}>
                {profileData.nama ? profileData.nama.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
            
            <View style={styles.nameSection}>
              <Text style={styles.adminTitle}>{profileData.nama || 'ADMIN PROGRAM STUDI'}</Text>
              <Text style={styles.adminProdi}>{profileData.prodi || profileData.nama_prodi || 'Sistem Informasi'}</Text>
              
              <View style={styles.badgeWrap}>
                <View style={styles.badgeActive}>
                  <View style={styles.dotActive} />
                  <Text style={styles.badgeText}>Akun Aktif</Text>
                </View>
              </View>
              
              {/* BUBBLE INFORMASI DETAIL */}
              <View style={styles.dataSection}>
                
                {/* 1. SEKARANG MENJADI EMAIL INSTANSI */}
                <View style={styles.infoBubble}>
                  <View style={[styles.iconBox, { backgroundColor: COLORS.aliceBlue }]}>
                    <Ionicons name="mail" size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoTextWrap}>
                    <Text style={styles.infoLabel}>EMAIL INSTANSI</Text>
                    <Text style={styles.infoValue}>{profileData.email || '-'}</Text>
                  </View>
                </View>

                {/* 2. SEKARANG MENJADI FAKULTAS */}
                <View style={styles.infoBubble}>
                  <View style={[styles.iconBox, { backgroundColor: COLORS.honeydew }]}>
                    <Ionicons name="business" size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoTextWrap}>
                    <Text style={styles.infoLabel}>FAKULTAS</Text>
                    <Text style={styles.infoValue}>{profileData.fakultas || profileData.nama_fakultas || 'Sains dan Teknologi'}</Text>
                  </View>
                </View>

                {/* 3. ROLE AKSES */}
                <View style={styles.infoBubble}>
                  <View style={[styles.iconBox, { backgroundColor: COLORS.vanilla }]}>
                    <Ionicons name="ribbon" size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoTextWrap}>
                    <Text style={styles.infoLabel}>ROLE AKSES</Text>
                    <Text style={styles.infoValue}>{profileData.role || 'Administrator Prodi'}</Text>
                  </View>
                </View>
              </View>

            </View>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: COLORS.textMain },
  content: { padding: 24, paddingBottom: 40 },
  profileCard: { backgroundColor: COLORS.surface, borderRadius: 32, padding: 24, alignItems: 'center', elevation: 4 },
  
  // ✅ PERBAIKAN DI SINI: borderRadius diubah menjadi 50 (setengah dari width & height)
  avatarWrap: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, // <-- Ini yang membuatnya bulat sempurna
    backgroundColor: COLORS.aliceBlue, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16, 
    elevation: 4 
  },
  
  avatarLetter: { fontFamily: 'Urbanist-Bold', fontSize: 36, color: COLORS.textMain },
  nameSection: { alignItems: 'center', width: '100%' },
  adminTitle: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: COLORS.textMain, textAlign: 'center', marginBottom: 2 },
  adminProdi: { fontFamily: 'Urbanist-Medium', fontSize: 14, color: COLORS.textMuted },
  badgeWrap: { marginTop: 12, marginBottom: 20 },
  badgeActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  dotActive: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2e7d32', marginRight: 6 },
  badgeText: { color: '#2e7d32', fontFamily: 'Urbanist-Bold', fontSize: 12 },
  dataSection: { paddingHorizontal: 16, width: '100%' },
  infoBubble: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, 
    padding: 12, borderRadius: 20, marginBottom: 10, 
    borderWidth: 1, borderColor: '#f1f5f9'
  },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  infoValue: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: COLORS.textMain },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
  loadingText: { marginTop: 12, fontFamily: 'Urbanist-Regular', color: COLORS.textMuted }
});