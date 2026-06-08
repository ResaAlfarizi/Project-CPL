import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  StatusBar, ImageBackground, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE, ROLE_THEMES } from '../../theme/colors';

// ✅ THEME SUPERADMIN
const THEME = ROLE_THEMES.superadmin;

// ✅ Local color mapping
const COLORS = {
  primary: BASE.primary,
  background: BASE.background,
  surface: BASE.surface,
  textMain: BASE.textMain,
  textMuted: BASE.textMuted,
  border: BASE.border,
  blueSoft: THEME.secondary,
  blueStrong: THEME.primary,
  lavender: THEME.accent,
};

export default function SAProfilScreen({ navigation }) {
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
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Saya</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* KARTU PROFIL SUPERADMIN */}
        <View style={styles.profileCard}>
          
          <View style={styles.avatarWrap}>
            <Ionicons name="shield-checkmark" size={45} color={COLORS.surface} style={{ marginTop: 2 }} />
          </View>
          
          <View style={styles.nameSection}>
            <Text style={styles.adminTitle}>SUPERADMINISTRATOR</Text>
            <Text style={styles.adminProdi}>Sistem Pusat Pengelolaan CPL</Text>
            
            <View style={styles.badgeWrap}>
              <View style={styles.badgeActive}>
                <View style={styles.dotActive} />
                <Text style={styles.badgeText}>Root Access Terverifikasi</Text>
              </View>
            </View>
          </View>

          <View style={styles.dataSection}>
            <View style={styles.infoBubble}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.blueStrong }]}>
                <Ionicons name="mail" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Email Sistem</Text>
                <Text style={styles.infoValue}>superadmin@kampus.ac.id</Text>
              </View>
            </View>

            <View style={styles.infoBubble}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.blueSoft }]}>
                <Ionicons name="business" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Pusat Kendali</Text>
                <Text style={styles.infoValue}>Pusat Data & TI</Text>
              </View>
            </View>

            <View style={styles.infoBubble}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.lavender }]}>
                <Ionicons name="key" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Level Akses</Text>
                <Text style={styles.infoValue}>Kontrol Penuh (R/W/D)</Text>
              </View>
            </View>
          </View>

        </View>
        
        <Text style={styles.footerText}>© 2026 Sistem CPL{'\n'}UIN Sunan Ampel Surabaya</Text>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    paddingTop: 60, paddingBottom: 15, paddingHorizontal: 24, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  backBtn: { padding: 10, backgroundColor: '#FFF', borderRadius: 14, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  headerTitle: { fontFamily: 'Urbanist-Bold', fontSize: 18, color: COLORS.textMain },
  
  content: { padding: 24, paddingBottom: 40 },
  
  profileCard: { 
    backgroundColor: COLORS.surface, borderRadius: 28, 
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15,
    paddingTop: 24, paddingBottom: 14 
  },
  
  avatarWrap: { 
    width: 86, height: 86, borderRadius: 43, backgroundColor: COLORS.primary, 
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
    marginBottom: 12 
  },
  
  nameSection: { alignItems: 'center', paddingHorizontal: 20 },
  adminTitle: { fontFamily: 'Urbanist-Bold', fontSize: 20, color: COLORS.textMain, marginBottom: 2 },
  adminProdi: { fontFamily: 'Urbanist-Medium', fontSize: 14, color: COLORS.textMuted },
  
  badgeWrap: { marginTop: 12, marginBottom: 20 },
  badgeActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  dotActive: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2e7d32', marginRight: 6 },
  badgeText: { color: '#2e7d32', fontFamily: 'Urbanist-Bold', fontSize: 12 },
  
  dataSection: { paddingHorizontal: 16 },
  infoBubble: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, 
    padding: 12, borderRadius: 20, marginBottom: 10, 
    borderWidth: 1, borderColor: '#f1f5f9'
  },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontFamily: 'Urbanist-Medium', fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  infoValue: { fontFamily: 'Urbanist-Bold', fontSize: 14, color: COLORS.textMain },

  footerText: { fontFamily: 'Urbanist-Medium', fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 30, lineHeight: 20 }
});