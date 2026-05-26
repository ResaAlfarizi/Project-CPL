import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MkCplAPI, CPLAPI } from '../api';
import { Colors, Radius, Shadows } from '../theme';
import Badge from '../components/Badge';
import WeightBar from '../components/WeightBar';

export default function MKDetailScreen({ route, navigation }) {
  const { mk, prodi_name, kode_prodi } = route.params;
  const [cplList, setCplList] = useState([]);
  const [mkcpl, setMkcpl] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [cplData, mkcplData] = await Promise.all([
        CPLAPI.list(), MkCplAPI.listAll(),
      ]);
      setCplList(cplData || []);
      const mappings = (mkcplData || []).filter((m) => m.mk_id === mk.id);
      setMkcpl(mappings);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [mk.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const getCpl = (id) => cplList.find((c) => c.id === id);
  const totalBobot = mkcpl.reduce((s, m) => s + Number(m.bobot), 0);

  const semColor = (s) => s <= 2 ? 'blue' : s <= 4 ? 'green' : s <= 6 ? 'yellow' : 'gray';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* MK Detail Card */}
      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <Badge variant="blue" mono style={{ marginBottom: 8 }}>{mk.kode_mk}</Badge>
          <Text style={styles.mkName}>{mk.nama_mk}</Text>
        </View>
        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Program Studi</Text>
            <Text style={styles.detailValue}>{kode_prodi} — {prodi_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={[styles.detailItem, { flex: 1 }]}>
              <Text style={styles.detailLabel}>SKS</Text>
              <Text style={styles.detailValue}>{mk.sks} SKS</Text>
            </View>
            <View style={[styles.detailItem, { flex: 1 }]}>
              <Text style={styles.detailLabel}>Semester</Text>
              <View style={{ marginTop: 4 }}>
                <Badge variant={semColor(mk.semester)}>Semester {mk.semester}</Badge>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Mapped CPL */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔗 CPL Terpetakan</Text>
          <Badge variant={mkcpl.length > 0 ? 'green' : 'red'}>
            {mkcpl.length} CPL
          </Badge>
        </View>

        {mkcpl.length > 0 && (
          <View style={styles.weightBarContainer}>
            <WeightBar total={totalBobot} label="Total bobot MK→CPL" />
          </View>
        )}

        {mkcpl.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Belum ada CPL dipetakan ke MK ini</Text>
          </View>
        ) : (
          mkcpl.map((map, index) => {
            const c = getCpl(map.cpl_id);
            return (
              <View key={map.id || index} style={styles.cplRow}>
                <View style={styles.cplRowHeader}>
                  <Badge variant="green" mono>{c?.kode_cpl || '—'}</Badge>
                  <Text style={styles.bobotText}>{Number(map.bobot).toFixed(4)}</Text>
                </View>
                <Text style={styles.cplDesc}>{c?.deskripsi?.slice(0, 100) || '—'}</Text>
                {/* Mini progress bar */}
                <View style={styles.miniBarTrack}>
                  <View style={[styles.miniBarFill, { width: `${Number(map.bobot) * 100}%` }]} />
                </View>
                <Text style={styles.pctText}>{(Number(map.bobot) * 100).toFixed(1)}%</Text>
              </View>
            );
          })
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#eef9ff', borderColor: '#cceeff' }]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MappingList', { mk_id: mk.id, mk_name: mk.nama_mk, kode_mk: mk.kode_mk })}
        >
          <Text style={styles.actionEmoji}>🔗</Text>
          <Text style={styles.actionLabel}>Lihat Pemetaan</Text>
          <Text style={styles.actionChevron}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#fff5f5', borderColor: '#ffe0e0' }]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('SubCPMKList', { mk_id: mk.id, mk_name: mk.nama_mk, kode_mk: mk.kode_mk })}
        >
          <Text style={styles.actionEmoji}>📋</Text>
          <Text style={styles.actionLabel}>Lihat Sub-CPMK</Text>
          <Text style={styles.actionChevron}>→</Text>
        </TouchableOpacity>
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
    padding: 16,
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    ...Shadows.sm,
  },
  detailHeader: {
    backgroundColor: Colors.eerieBlack,
    padding: 20,
  },
  mkName: {
    fontSize: 20,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.white,
    lineHeight: 26,
  },
  detailGrid: {
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.eerieBlack,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostWhite,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
  },
  weightBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostWhite,
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textMuted,
  },
  cplRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostWhite,
  },
  cplRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bobotText: {
    fontSize: 15,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
    letterSpacing: 0.3,
  },
  cplDesc: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: '#4b5563',
    lineHeight: 19,
    marginBottom: 8,
  },
  miniBarTrack: {
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.ghostWhite,
    overflow: 'hidden',
    marginBottom: 4,
  },
  miniBarFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.honeydew,
  },
  pctText: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  actionsRow: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  actionEmoji: {
    fontSize: 22,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.eerieBlack,
  },
  actionChevron: {
    fontSize: 18,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.textSecondary,
  },
});
