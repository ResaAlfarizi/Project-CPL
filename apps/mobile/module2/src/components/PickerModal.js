import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE } from '../theme/colors';

/**
 * PICKER MODAL COMPONENT
 * Reusable picker modal dengan search functionality
 * 
 * Props:
 * - visible: boolean (required)
 * - title: string (required)
 * - data: array of objects (required) - must have 'id' and 'label' fields
 * - selectedId: any (optional)
 * - onSelect: function(item) (required)
 * - onClose: function (required)
 * - searchable: boolean (optional, default: false)
 * - searchPlaceholder: string (optional)
 */

export default function PickerModal({
  visible,
  title,
  data = [],
  selectedId,
  onSelect,
  onClose,
  searchable = false,
  searchPlaceholder = 'Cari...',
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = searchable && searchQuery
    ? data.filter(item => 
        (item.label || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data;

  const renderItem = ({ item }) => {
    const isActive = selectedId === item.id;
    return (
      <TouchableOpacity
        style={[styles.option, isActive && styles.optionActive]}
        onPress={() => {
          onSelect(item);
          setSearchQuery('');
        }}
      >
        <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
          {item.label}
        </Text>
        {isActive && <Ionicons name="checkmark-circle" size={20} color={BASE.primaryLight} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => {
          onClose();
          setSearchQuery('');
        }}
      >
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>

          {searchable && (
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color={BASE.textDisabled} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor={BASE.textDisabled}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={BASE.textDisabled} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Tidak ada data</Text>
            }
          />

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              onClose();
              setSearchQuery('');
            }}
          >
            <Text style={styles.closeBtnText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: BASE.surface,
    borderRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  title: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: BASE.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BASE.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BASE.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Urbanist-Medium',
    fontSize: 13,
    color: BASE.textMain,
    paddingVertical: 0,
  },
  list: {
    maxHeight: 300,
  },
  listContent: {
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: BASE.borderLight,
  },
  optionActive: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
  },
  optionText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 15,
    color: BASE.textMain,
    flex: 1,
  },
  optionTextActive: {
    color: BASE.primaryLight,
    fontFamily: 'Urbanist-Bold',
  },
  emptyText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    color: BASE.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: BASE.errorBg,
    borderRadius: 16,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  closeBtnText: {
    color: BASE.error,
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
  },
});
