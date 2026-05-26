import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../theme';

export default function WeightBar({ total, label = 'Σ bobot' }) {
  const pct = Math.min(total * 100, 100);
  const over = total > 1.0001;
  const perfect = Math.abs(total - 1.0) <= 0.0001;

  let valueColor = Colors.eerieBlack;
  if (over) valueColor = Colors.danger;
  else if (perfect) valueColor = Colors.success;

  const statusIcon = perfect && !over ? ' ✅' : over ? ' ⚠️' : '';

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, over && { color: Colors.danger }]}>{label}</Text>
        <Text style={[styles.value, { color: valueColor }]}>
          {total > 0 ? total.toFixed(4) : '0.0000'}{statusIcon}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${pct}%` },
            over && styles.fillOver,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Urbanist_500Medium',
  },
  value: {
    fontSize: 15,
    fontFamily: 'Urbanist_800ExtraBold',
  },
  track: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.ghostWhite,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.honeydew,
  },
  fillOver: {
    backgroundColor: Colors.danger,
  },
});
