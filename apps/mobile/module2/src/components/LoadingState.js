import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BASE } from '../theme/colors';

/**
 * LOADING STATE COMPONENT
 * Reusable loading state untuk semua role
 * 
 * Props:
 * - message: string (optional, default: 'Memuat data...')
 * - color: string (optional, default: BASE.primary)
 */

export default function LoadingState({ 
  message = 'Memuat data...', 
  color = BASE.primary 
}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  message: {
    marginTop: 12,
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
    color: BASE.textMuted,
  },
});
