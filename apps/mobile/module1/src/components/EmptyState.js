import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme';

export default function EmptyState({ icon = '📭', title, message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
