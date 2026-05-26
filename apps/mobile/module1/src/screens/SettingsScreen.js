import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors, Radius, Shadows } from '../theme';
import { getAPIUrl, setBaseUrl } from '../api';

export default function SettingsScreen({ navigation }) {
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    // Muat IP saat ini ketika layar dibuka
    const loadCurrentIP = async () => {
      const currentUrl = await getAPIUrl();
      setIpAddress(currentUrl);
    };
    loadCurrentIP();
  }, []);

  const handleSave = async () => {
    if (!ipAddress.trim()) {
      Alert.alert('Error', 'IP URL tidak boleh kosong');
      return;
    }
    
    // Validasi sederhana
    let finalUrl = ipAddress.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'http://' + finalUrl;
    }

    await setBaseUrl(finalUrl);
    Alert.alert('Berhasil', 'Base URL API telah diperbarui!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Konfigurasi Server API</Text>
        <Text style={styles.description}>
          Masukkan URL Backend Modul 1. Biasanya formatnya adalah:{'\n'}
          http://[IP-HOTSPOT]:3000/api/v1/m1
        </Text>
        
        <TextInput
          style={styles.input}
          value={ipAddress}
          onChangeText={setIpAddress}
          placeholder="http://192.168.137.1:3000/api/v1/m1"
          autoCapitalize="none"
          keyboardType="url"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Simpan Pengaturan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    backgroundColor: Colors.aliceBlue,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.eerieBlack,
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.eerieBlack,
    padding: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Urbanist_700Bold',
  },
});
