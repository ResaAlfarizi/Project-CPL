import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BadgeColors, Radius } from '../theme';

export default function Badge({ children, variant = 'gray', style, mono = false }) {
  const colors = BadgeColors[variant] || BadgeColors.gray;

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, colors.borderColor && { borderWidth: 1, borderColor: colors.borderColor }, style]}>
      <Text style={[styles.text, { color: colors.text }, mono && styles.mono]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
  },
  mono: {
    fontFamily: 'Urbanist_700Bold',
    letterSpacing: 0.5,
  },
});
