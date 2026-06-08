import React, { useState, useEffect } from 'react'; 
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  StatusBar, ImageBackground, ScrollView,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ✅ Import API & Theme
import { profileApi } from '../../services/api';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState } from '../../components';

// ✅ THEME ADMIN PRODI
const THEME = ROLE_THEMES.adminProdi;

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
          <Ionicons name="arrow-back" size={20} color={BASE.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Saya</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {isLoading ? (
          <LoadingState message="Memuat profil admin..." color={BASE.primary} />
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
                  <View style={[styles.iconBox, { backgroundColor: THEME.secondary }]}>
                    <Ionicons name="mail" size={18} color={BASE.primary} />
                  </View>
                  <View style={styles.infoTextWrap}>
                    <Text style={styles.infoLabel}>EMAIL INSTANSI</Text>
                    <Text style={styles.infoValue}>{profileData.email || '-'}</Text>
                  </View>
                </View>

                {/* 2. SEKARANG MENJADI FAKULTAS */}
                <View style={styles.infoBubble}>
                  <View style={[styles.iconBox, { backgroundColor: THEME.accent }]}>
                    <Ionicons name="business" size={18} color={BASE.primary} />
                  </View>
                  <View style={styles.infoTextWrap}>
                    <Text style={styles.infoLabel}>FAKULTAS</Text>
                    <Text style={styles.infoValue}>{profileData.fakultas || profileData.nama_fakultas || 'Sains dan Teknologi'}</Text>
                  </View>
                </View>

                {/* 3. ROLE AKSES */}
                <View style={styles.infoBubble}>
                  <View style={[styles.iconBox, { backgroundColor: THEME.primary }]}>
                    <Ionicons name="ribbon" size={18} color={BASE.primary} />
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
  container: { flex: 1, backgroundColor: BASE.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 50, 
    paddingBottom: 16 
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: BASE.surface, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 2 
  },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: BASE.textMain },
  content: { padding: 24, paddingBottom: 40 },
  profileCard: { 
    backgroundColor: BASE.surface, 
    borderRadius: 32, 
    padding: 24, 
    alignItems: 'center', 
    elevation: 4 
  },
  
  avatarWrap: { 
    width: 100, 
    height: 100, 
    borderRadius: 50,
    backgroundColor: THEME.secondary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16, 
    elevation: 4 
  },
  
  avatarLetter: { fontFamily: 'Urbanist-Bold', fontSize: 36, color: BASE.textMain },
  nameSection: { alignItems: 'center', width: '100%' },
  adminTitle: { 
    fontFamily: 'Urbanist-Bold', 
    fontSize: 20, 
    color: BASE.textMain, 
    textAlign: 'center', 
    marginBottom: 2 
  },
  adminProdi: { fontFamily: 'Urbanist-Medium', fontSize: 14, color: BASE.textMuted },
  badgeWrap: { marginTop: 12, marginBottom: 20 },
  badgeActive: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: BASE.successBg, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16 
  },
  dotActive: { width: 6, height: 6, borderRadius: 3, backgroundColor: BASE.success, marginRight: 6 },
  badgeText: { color: BASE.success, fontFamily: 'Urbanist-Bold', fontSize: 12 },
  dataSection: { paddingHorizontal: 16, width: '100%' },
  infoBubble: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: BASE.background, 
    padding: 12, 
    borderRadius: 20, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: THEME.accent
  },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: BASE.textMuted, marginBottom: 2 },
  infoValue: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: BASE.textMain },
});