import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE } from '../theme/colors';

/**
 * EMPTY STATE COMPONENT
 * Reusable empty state untuk semua role
 * 
 * Props:
 * - icon: string (ionicon name, default: 'folder-open-outline')
 * - message: string (required)
 * - submessage: string (optional)
 */

export default function EmptyState({ 
  icon = 'folder-open-outline', 
  message, 
  submessage 
}) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={BASE.border} />
      <Text style={styles.message}>{message}</Text>
      {!!submessage && <Text style={styles.submessage}>{submessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  message: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    color: BASE.textMuted,
    marginTop: 12,
    textAlign: 'center',
  },
  submessage: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    color: BASE.textDisabled,
    marginTop: 4,
    textAlign: 'center',
  },
});
