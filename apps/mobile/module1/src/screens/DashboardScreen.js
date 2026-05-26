import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ProdiAPI, CPLAPI, MKAPI, MkCplAPI, SubCpmkAPI } from '../api';
import { Colors, Radius, Shadows } from '../theme';
import StatCard from '../components/StatCard';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const fetchStats = async () => {
    try {
      setError(null);
      const [prodi, cpl, mk, mkcpl, sub] = await Promise.all([
        ProdiAPI.list(), CPLAPI.list(), MKAPI.list(),
        MkCplAPI.listAll(), SubCpmkAPI.listAll(),
      ]);
      setStats({
        prodi: prodi?.length || 0,
        cpl: cpl?.length || 0,
        mk: mk?.length || 0,
        mkcpl: mkcpl?.length || 0,
        sub: sub?.length || 0,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchStats().finally(() => setLoading(false));
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [loading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const CARDS = [
    { icon: '🎓', label: 'Program Studi', value: stats.prodi, color: '#D8DFE9', bg: '#f0f4f9', screen: 'ProdiList' },
    { icon: '🎯', label: 'CPL Terdaftar', value: stats.cpl, color: '#CFDECA', bg: '#f0f7ee', screen: 'CPLList' },
    { icon: '📚', label: 'Mata Kuliah', value: stats.mk, color: '#fde8cc', bg: '#fef6ed', screen: 'MKList' },
    { icon: '🔗', label: 'Pemetaan MK–CPL', value: stats.mkcpl, color: '#cceeff', bg: '#eef9ff', screen: 'MappingList' },
    { icon: '📋', label: 'Sub-CPMK', value: stats.sub, color: '#ffe0e0', bg: '#fff5f5', screen: 'SubCPMKList' },
  ];

  const STEPS = [
    { step: '①', label: 'Daftar Program Studi', screen: 'ProdiList', done: (stats.prodi || 0) > 0 },
    { step: '②', label: 'Definisi CPL per Prodi', screen: 'CPLList', done: (stats.cpl || 0) > 0 },
    { step: '③', label: 'Daftar Mata Kuliah', screen: 'MKList', done: (stats.mk || 0) > 0 },
    { step: '④', label: 'Pemetaan MK → CPL', screen: 'MappingList', done: (stats.mkcpl || 0) > 0 },
    { step: '⑤', label: 'Definisi Sub-CPMK', screen: 'SubCPMKList', done: (stats.sub || 0) > 0 },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🎓</Text>
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.eerieBlack} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.greeting}>Selamat Datang 👋</Text>
        <Text style={styles.subtitle}>CPL System — Modul 1</Text>
      </Animated.View>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Stat Cards */}
      <Text style={styles.sectionTitle}>Ringkasan Data</Text>
      <View style={styles.statsGrid}>
        {CARDS.map((c) => (
          <StatCard
            key={c.label}
            icon={c.icon}
            label={c.label}
            value={c.value}
            color={c.color}
            bg={c.bg}
            onPress={() => navigation.navigate(c.screen)}
          />
        ))}
      </View>

      {/* Quick Steps */}
      <View style={styles.stepsCard}>
        <View style={styles.stepsHeader}>
          <Text style={styles.stepsTitle}>🚀 Alur Navigasi</Text>
          <Text style={styles.stepsSubtitle}>Tap untuk melihat data</Text>
        </View>
        {STEPS.map((item, i) => (
          <React.Fragment key={item.screen}>
            <View
              style={styles.stepRow}
            >
              <Text style={styles.stepNumber}>{item.step}</Text>
              <Text style={styles.stepLabel}>{item.label}</Text>
              <Text style={styles.stepIcon}>{item.done ? '✅' : '⭕'}</Text>
            </View>
            {i < STEPS.length - 1 && <View style={styles.stepDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ Tentang</Text>
        <Text style={styles.infoText}>
          Sistem ini digunakan untuk mengelola Capaian Pembelajaran Lulusan (CPL) secara terstruktur.
          Aplikasi mobile ini bersifat <Text style={{ fontFamily: 'Urbanist_700Bold' }}>read-only</Text> — hanya untuk melihat data.
        </Text>
        {[
          { label: 'Σ bobot MK→CPL', info: 'Total = 1.0 (100%)', color: Colors.honeydew },
          { label: 'Σ bobot Sub-CPMK', info: 'Total per MK-CPL = 1.0', color: Colors.aliceBlue },
        ].map((item) => (
          <View key={item.label} style={[styles.infoChip, { backgroundColor: item.color }]}>
            <Text style={styles.chipLabel}>{item.label}</Text>
            <Text style={styles.chipInfo}>{item.info}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.screenBg,
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.textSecondary,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Urbanist_800ExtraBold',
    color: Colors.eerieBlack,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.sm,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.danger,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
    marginBottom: 12,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  stepsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  stepsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostWhite,
  },
  stepsTitle: {
    fontSize: 16,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
  },
  stepsSubtitle: {
    fontSize: 12,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  stepNumber: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  stepLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.eerieBlack,
  },
  stepIcon: {
    fontSize: 16,
  },
  stepDivider: {
    height: 1,
    backgroundColor: Colors.ghostWhite,
    marginHorizontal: 16,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Urbanist_400Regular',
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 14,
  },
  infoChip: {
    borderRadius: Radius.sm,
    padding: 12,
    marginBottom: 8,
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
    marginBottom: 2,
  },
  chipInfo: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.eerieBlack,
  },
});
