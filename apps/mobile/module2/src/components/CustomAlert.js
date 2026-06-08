import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE, COMPONENT } from '../theme/colors';

/**
 * CUSTOM ALERT COMPONENT
 * Reusable alert modal untuk semua role
 * 
 * Props:
 * - visible: boolean
 * - type: 'success' | 'error' | 'danger' | 'info' | 'warning'
 * - title: string
 * - message: string
 * - onConfirm: function
 * - onCancel: function (optional)
 * - confirmText: string (default: 'OK')
 * - cancelText: string (default: 'Batal')
 */

export default function CustomAlert({
  visible,
  type = 'info',
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Batal',
}) {
  if (!visible) return null;

  const isSuccess = type === 'success';
  const isDanger = type === 'danger';
  const isError = type === 'error';
  const isWarning = type === 'warning';

  const iconName = isSuccess
    ? 'checkmark-circle'
    : isDanger || isError
    ? 'close-circle'
    : isWarning
    ? 'warning'
    : 'information-circle';

  const iconColor = isSuccess
    ? BASE.success
    : isDanger || isError
    ? BASE.error
    : isWarning
    ? BASE.warning
    : BASE.info;

  const iconBg = isSuccess
    ? BASE.successBg
    : isDanger || isError
    ? BASE.errorBg
    : isWarning
    ? BASE.warningBg
    : BASE.infoBg;

  const confirmBg = isSuccess
    ? BASE.success
    : isDanger || isError
    ? BASE.error
    : isWarning
    ? BASE.warning
    : BASE.info;

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={34} color={iconColor} />
          </View>

          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.btnRow}>
            {!!onCancel && (
              <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
                <Text style={styles.btnCancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.btnConfirm,
                { backgroundColor: confirmBg },
                !onCancel && { flex: 1 },
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.btnConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 53, 74, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  box: {
    backgroundColor: BASE.surface,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: BASE.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: BASE.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
    width: '100%',
  },
  btnCancel: {
    flex: 1,
    backgroundColor: BASE.borderLight,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BASE.border,
  },
  btnCancelText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: BASE.textMuted,
  },
  btnConfirm: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnConfirmText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
