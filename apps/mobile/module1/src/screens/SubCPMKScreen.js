import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SubCpmkAPI, MkCplAPI, MKAPI, CPLAPI } from '../api';
import { Colors, Radius, Shadows } from '../theme';
import Badge from '../components/Badge';
import WeightBar from '../components/WeightBar';
import EmptyState from '../components/EmptyState';

export default function SubCPMKScreen({ route }) {
  const { mk_id, mk_name, kode_mk } = route.params || {};
  const [mk, setMk] = useState([]);
  const [cpl, setCpl] = useState([]);
  const [mkcpl, setMkcpl] = useState([]);
  const [subCpmk, setSubCpmk] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [mkData, cplData, mkcplData, subData] = await Promise.all([
        MKAPI.list(), CPLAPI.list(), MkCplAPI.listAll(), SubCpmkAPI.listAll(),
      ]);
      setMk(mkData || []);
      setCpl(cplData || []);
      setMkcpl(mkcplData || []);
      setSubCpmk(subData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Display MKs
  const displayMk = mk_id ? mk.filter((m) => m.id === mk_id) : mk;

  const getMkCpls = (mkId) => mkcpl.filter((m) => m.mk_id === mkId);
  const getCplCode = (id) => cpl.find((c) => c.id === id)?.kode_cpl || '—';
  const getCplDesc = (id) => cpl.find((c) => c.id === id)?.deskripsi || '—';
  const getSubCpmks = (mkcplId) => subCpmk.filter((s) => s.mk_cpl_id === mkcplId);
  const getTotalBobot = (mkcplId) => getSubCpmks(mkcplId).reduce((a, s) => a + Number(s.bobot), 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 40 }}>📋</Text>
        <Text style={styles.loadingText}>Memuat Sub-CPMK...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          💡 <Text style={{ fontFamily: 'Urbanist_700Bold' }}>Aturan:</Text> Jumlah bobot keseluruhan Sub-CPMK dalam 1 Mata Kuliah harus bernilai <Text style={{ fontFamily: 'Urbanist_700Bold' }}>1.0</Text>
        </Text>
      </View>

      {displayMk.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Belum ada Mata Kuliah"
          message="Pastikan MK sudah dipetakan ke CPL terlebih dahulu"
        />
      ) : (
        displayMk.map((m) => {
          const mkCpls = getMkCpls(m.id);

          if (mkCpls.length === 0) {
            return (
              <View key={m.id} style={styles.mkCard}>
                <View style={styles.mkHeader}>
                  <View style={styles.mkBadges}>
                    <Badge variant="blue" mono>{m.kode_mk}</Badge>
                  </View>
                  <Text style={styles.mkName}>{m.nama_mk}</Text>
                </View>
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>MK ini belum dipetakan ke CPL manapun</Text>
                </View>
              </View>
            );
          }

          // Calculate total sub-cpmk bobot for this MK
          const mkTotalSubBobot = mkCpls.reduce((s, mc) => s + getTotalBobot(mc.id), 0);

          return (
            <View key={m.id} style={styles.mkCard}>
              {/* MK Header */}
              <View style={styles.mkHeader}>
                <View style={styles.mkBadges}>
                  <Badge variant="blue" mono>{m.kode_mk}</Badge>
                  <Badge variant="gray">{m.sks} SKS · Sem {m.semester}</Badge>
                </View>
                <Text style={styles.mkName}>{m.nama_mk}</Text>
              </View>

              {/* Warning if over 1.0 */}
              {mkTotalSubBobot > 1.0001 && (
                <View style={styles.warningBanner}>
                  <Text style={styles.warningText}>
                    ⚠️ Total bobot Sub-CPMK melebihi 1.0 ({mkTotalSubBobot.toFixed(4)})
                  </Text>
                </View>
              )}

              {/* Per CPL */}
              {mkCpls.map((mc) => {
                const subs = getSubCpmks(mc.id);
                const totalBobot = getTotalBobot(mc.id);

                return (
                  <View key={mc.id} style={styles.cplSection}>
                    {/* CPL Header */}
                    <View style={styles.cplHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.cplBadgeRow}>
                          <Badge variant="green" mono>{getCplCode(mc.cpl_id)}</Badge>
                          <Text style={styles.cplBobotLabel}>
                            Bobot MK→CPL: <Text style={{ fontFamily: 'Urbanist_700Bold' }}>{Number(mc.bobot).toFixed(4)}</Text>
                          </Text>
                        </View>
                        <Text style={styles.cplDesc} numberOfLines={2}>
                          {getCplDesc(mc.cpl_id)?.slice(0, 80)}…
                        </Text>
                        <WeightBar total={totalBobot} label="Σ bobot Sub-CPMK" />
                      </View>
                    </View>

                    {/* Sub-CPMK items */}
                    {subs.length === 0 ? (
                      <View style={styles.emptySubBox}>
                        <Text style={styles.emptyText}>Belum ada Sub-CPMK untuk pasangan ini</Text>
                      </View>
                    ) : (
                      subs.map((sub, index) => (
                        <View key={sub.id || index} style={styles.subRow}>
                          <View style={styles.subRowTop}>
                            <Badge variant="yellow" mono>{sub.kode_sub_cpmk}</Badge>
                            <Text style={styles.subBobot}>{Number(sub.bobot).toFixed(4)}</Text>
                          </View>
                          {sub.deskripsi ? (
                            <Text style={styles.subDesc} numberOfLines={2}>{sub.deskripsi}</Text>
                          ) : (
                            <Text style={[styles.subDesc, { color: Colors.textMuted }]}>—</Text>
                          )}
                          <View style={styles.subProgressRow}>
                            <View style={styles.subProgressTrack}>
                              <View style={[styles.subProgressFill, { width: `${Number(sub.bobot) * 100}%` }]} />
                            </View>
                            <Text style={styles.subPct}>{(Number(sub.bobot) * 100).toFixed(1)}%</Text>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                );
              })}
            </View>
          );
        })
      )}

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.screenBg,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.textSecondary,
  },
  infoBanner: {
    backgroundColor: '#f0f4f9',
    borderRadius: Radius.sm,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.aliceBlue,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.eerieBlack,
    lineHeight: 20,
  },
  mkCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    ...Shadows.sm,
  },
  mkHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostWhite,
  },
  mkBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  mkName: {
    fontSize: 15,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
  },
  warningBanner: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  warningText: {
    fontSize: 13,
    fontFamily: 'Urbanist_600SemiBold',
    color: '#b91c1c',
  },
  emptyBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptySubBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textMuted,
  },
  cplSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.ghostWhite,
  },
  cplHeader: {
    padding: 16,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostWhite,
  },
  cplBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  cplBobotLabel: {
    fontSize: 12,
    fontFamily: 'Urbanist_400Regular',
    color: Colors.textMuted,
  },
  cplDesc: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: '#4b5563',
    lineHeight: 19,
    marginBottom: 8,
  },
  subRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ghostWhite,
  },
  subRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  subBobot: {
    fontSize: 15,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.eerieBlack,
    letterSpacing: 0.3,
  },
  subDesc: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: '#4b5563',
    lineHeight: 19,
    marginBottom: 8,
  },
  subProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subProgressTrack: {
    flex: 1,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.ghostWhite,
    overflow: 'hidden',
  },
  subProgressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.vanilla,
  },
  subPct: {
    fontSize: 13,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textSecondary,
    width: 50,
    textAlign: 'right',
  },
});
