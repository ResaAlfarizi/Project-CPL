import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radius, Shadows } from '../theme';

export default function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style }) {
  return (
    <View style={[styles.cardHeader, style]}>
      {children}
    </View>
  );
}

export function CardBody({ children, style }) {
  return (
    <View style={[styles.cardBody, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostWhite,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBody: {
    padding: 20,
  },
});
