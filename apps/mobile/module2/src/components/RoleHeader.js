import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE, getRoleTheme } from '../theme/colors';

/**
 * ROLE HEADER COMPONENT
 * Reusable header untuk semua role dengan theme-based colors
 * 
 * Props:
 * - role: 'superadmin' | 'adminProdi' | 'dosen' | 'mahasiswa'
 * - title: string (required)
 * - subtitle: string (optional)
 * - onBack: function (required)
 * - rightComponent: ReactNode (optional)
 */

export default function RoleHeader({ role = 'superadmin', title, subtitle, onBack, rightComponent }) {
  const theme = getRoleTheme(role);

  return (
    <View style={[styles.header, { backgroundColor: theme.primary }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={BASE.primary} />
      </TouchableOpacity>
      
      <View style={styles.headerTextWrap}>
        <Text style={styles.headerTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      
      {rightComponent && <View style={styles.rightComponent}>{rightComponent}</View>}
      {!rightComponent && <View style={{ width: 40 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backBtn: {
    padding: 8,
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 22,
    color: BASE.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: BASE.textMuted,
  },
  rightComponent: {
    marginLeft: 8,
  },
});
