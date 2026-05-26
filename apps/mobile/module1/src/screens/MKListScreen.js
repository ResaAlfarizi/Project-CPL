import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MKAPI, ProdiAPI, MkCplAPI } from '../api';
import { Colors, Radius, Shadows } from '../theme';
import SearchBar from '../components/SearchBar';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';

const semColor = (s) => s <= 2 ? 'blue' : s <= 4 ? 'green' : s <= 6 ? 'yellow' : 'gray';

export default function MKListScreen({ route, navigation }) {
  const { prodi_id, prodi_name, kode_prodi } = route.params || {};
  const [list, setList] = useState([]);
  const [prodi, setProdi] = useState([]);
  const [mkcpl, setMkcpl] = useState([]);
  const [search, setSearch] = useState('');
  const [activeSemester, setActiveSemester] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [mkData, prodiData, mkcplData] = await Promise.all([
        MKAPI.list(), ProdiAPI.list(), MkCplAPI.listAll(),
      ]);
      const allMk = mkData || [];
      setList(prodi_id ? allMk.filter((m) => m.prodi_id === prodi_id) : allMk);
      setProdi(prodiData || []);
      setMkcpl(mkcplData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [prodi_id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const searched = list.filter((m) => {
    const matchesSearch = m.kode_mk.toLowerCase().includes(search.toLowerCase()) ||
                          m.nama_mk.toLowerCase().includes(search.toLowerCase());
    const matchesSem = activeSemester ? m.semester === activeSemester : true;
    return matchesSearch && matchesSem;
  });

  const getMkCplCount = (mkId) => mkcpl.filter((m) => m.mk_id === mkId).length;
  const getProdiCode = (id) => prodi.find((p) => p.id === id)?.kode_prodi || '—';

  // Semester summary
  const semesters = [...new Set(list.map((m) => m.semester))].sort((a, b) => a - b);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.6}
      onPress={() => navigation.navigate('MKDetail', {
        mk: item,
        prodi_name: prodi.find((p) => p.id === item.prodi_id)?.nama_prodi || '—',
        kode_prodi: getProdiCode(item.prodi_id),
      })}
    >
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{item.nama_mk}</Text>
          <View style={styles.rowMeta}>
            <Badge variant="blue" mono>{item.kode_mk}</Badge>
            <Badge variant="gray">{item.sks} SKS</Badge>
            <Badge variant={semColor(item.semester)}>Sem {item.semester}</Badge>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
      <View style={styles.rowBottom}>
        <Text style={styles.prodiLabel}>{getProdiCode(item.prodi_id)}</Text>
        <View>
          {getMkCplCount(item.id) > 0 ? (
            <Badge variant="green">{getMkCplCount(item.id)} CPL</Badge>
          ) : (
            <Badge variant="red">Belum dipetakan</Badge>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* Prodi Banner */}
      {prodi_name && (
        <View style={styles.prodiBanner}>
          <Text style={styles.prodiBannerLabel}>Program Studi</Text>
          <Text style={styles.prodiBannerName}>{kode_prodi} — {prodi_name}</Text>
        </View>
      )}

      {/* Semester Summary */}
      {semesters.length > 0 && (
        <View style={styles.semRow}>
          {semesters.map((s) => {
            const isActive = activeSemester === s;
            return (
              <TouchableOpacity 
                key={s} 
                style={[styles.semChip, isActive && styles.semChipActive]}
                activeOpacity={0.7}
                onPress={() => setActiveSemester(isActive ? null : s)}
              >
                <Text style={[styles.semChipLabel, isActive && styles.semChipLabelActive]}>Sem {s}</Text>
                <Text style={[styles.semChipValue, isActive && styles.semChipValueActive]}>{list.filter((m) => m.semester === s).length}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Cari mata kuliah..." />
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>📚 {searched.length} dari {list.length} mata kuliah</Text>
      </View>

      {/* List */}
      <FlatList
        data={searched}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={searched.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="📚"
            title="Belum ada Mata Kuliah"
            message="Data mata kuliah belum tersedia"
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  prodiBanner: {
    backgroundColor: Colors.eerieBlack,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  prodiBannerLabel: {
    fontSize: 11,
    fontFamily: 'Urbanist_500Medium',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  prodiBannerName: {
    fontSize: 15,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.white,
    marginTop: 2,
  },
  semRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    flexWrap: 'wrap',
  },
  semChip: {
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  semChipLabel: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textSecondary,
  },
  semChipValue: {
    fontSize: 14,
    fontFamily: 'Urbanist_800ExtraBold',
    color: Colors.eerieBlack,
  },
  semChipActive: {
    backgroundColor: Colors.eerieBlack,
    borderColor: Colors.eerieBlack,
  },
  semChipLabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  semChipValueActive: {
    color: Colors.white,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 13,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.eerieBlack,
    marginBottom: 8,
  },
  rowMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textMuted,
    fontWeight: '300',
    marginLeft: 8,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.ghostWhite,
  },
  prodiLabel: {
    fontSize: 12,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.textSecondary,
  },
});
