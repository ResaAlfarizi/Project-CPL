import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Radius } from '../theme';

export default function SearchBar({ value, onChangeText, placeholder = 'Cari...' }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.aliceBlue,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    height: 42,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
    color: Colors.textMuted,
  },
  input: {
    flex: 1,
    fontFamily: 'Urbanist_400Regular',
    fontSize: 14,
    color: Colors.eerieBlack,
    padding: 0,
  },
});
