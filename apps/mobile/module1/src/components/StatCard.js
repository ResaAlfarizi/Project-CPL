import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Shadows } from '../theme';

export default function StatCard({ icon, label, value, color, bg, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bg, borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.value}>{value ?? '—'}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Shadows.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  value: {
    fontSize: 26,
    fontFamily: 'Urbanist_800ExtraBold',
    color: Colors.eerieBlack,
    lineHeight: 30,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
