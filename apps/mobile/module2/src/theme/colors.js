/**
 * THEME COLORS - CONSISTENT ACROSS ALL ROLES
 * Design System untuk Mobile Module 2
 * 
 * Digunakan oleh: Superadmin, Admin Prodi, Dosen, Mahasiswa
 */

// ─── BASE COLORS ─────────────────────────────────────────────────────────────
export const BASE = {
  // Primary palette
  primary:      '#24354a',      // Dark navy - untuk teks header & tombol utama
  primaryLight: '#577590',      // Blue grey - untuk icons & secondary elements
  
  // Background
  background:   '#F6F5FA',      // Light purple-grey - background utama
  surface:      '#FFFFFF',      // White - untuk cards & surfaces
  
  // Text
  textMain:     '#212121',      // Almost black - untuk body text
  textMuted:    '#64748B',      // Grey - untuk secondary text
  textDisabled: '#94A3B8',      // Light grey - untuk disabled text
  
  // Borders
  border:       '#E2E8F0',      // Light grey - untuk borders
  borderLight:  '#f1f5f9',      // Very light grey - untuk subtle borders
  
  // Status colors
  success:      '#16a34a',      // Green
  successBg:    '#dcfce7',      // Light green
  warning:      '#f59e0b',      // Orange
  warningBg:    '#fef3c7',      // Light orange
  error:        '#c62828',      // Red
  errorBg:      '#fee2e2',      // Light red
  info:         '#0284c7',      // Blue
  infoBg:       '#dbeafe',      // Light blue
};

// ─── LEGACY CONSTANTS (untuk backward compatibility dengan Superadmin) ─────
export const PRIMARY_BLUE = BASE.primaryLight;  // '#577590'
export const PRIMARY_DARK = BASE.primary;       // '#24354a'

// ─── LEGACY COLORS OBJECT (untuk backward compatibility) ───────────────────
export const COLORS = {
  // Map BASE colors to old COLORS structure
  primary: BASE.primary,
  primaryLight: BASE.primaryLight,
  background: BASE.background,
  surface: BASE.surface,
  textMain: BASE.textMain,
  textMuted: BASE.textMuted,
  textSecondary: BASE.textMuted,
  textDisabled: BASE.textDisabled,
  textWhite: '#FFFFFF',
  border: BASE.border,
  borderLight: BASE.borderLight,
  success: BASE.success,
  successBg: BASE.successBg,
  error: BASE.error,
  errorBg: BASE.errorBg,
  warning: BASE.warning,
  warningBg: BASE.warningBg,
  info: BASE.info,
  infoBg: BASE.infoBg,
  danger: BASE.error,
  
  // Superadmin specific colors
  aliceBlue: '#cad4ed',
  honeydew: '#dcead7',
  vanilla: '#f2f3cb',
  pinky: '#f4d6d6',
  blueStrong: '#cdddf4',
  blueSoft: '#e8f3ff',
  lavender: '#E5E1F9',
};

// ─── ROLE-SPECIFIC THEME COLORS ─────────────────────────────────────────────
export const ROLE_THEMES = {
  superadmin: {
    primary:    '#cdddf4',      // Light blue - header background
    secondary:  '#a3c1e5',      // Soft blue - accents
    accent:     '#E5E1F9',      // Lavender - highlights
  },
  adminProdi: {
    primary:    '#d4e4f7',      // Sky blue - header background
    secondary:  '#b8d4f1',      // Lighter sky blue - accents
    accent:     '#e8f4f8',      // Very light blue - highlights
  },
  dosen: {
    primary:    '#d1f4e0',      // Light green - header background
    secondary:  '#a8e6cf',      // Mint green - accents
    accent:     '#e8f8f5',      // Very light green - highlights
  },
  mahasiswa: {
    primary:    '#fff4e6',      // Light orange - header background
    secondary:  '#ffe0b2',      // Peach - accents
    accent:     '#fff8e1',      // Cream - highlights
  },
};

// ─── COMPONENT COLORS ────────────────────────────────────────────────────────
export const COMPONENT = {
  // Cards
  cardBg:           BASE.surface,
  cardBorder:       BASE.border,
  cardShadow:       'rgba(0, 0, 0, 0.05)',
  
  // Buttons
  btnPrimary:       BASE.primary,
  btnPrimaryText:   '#FFFFFF',
  btnSecondary:     BASE.surface,
  btnSecondaryText: BASE.textMain,
  btnDisabled:      BASE.borderLight,
  btnDisabledText:  BASE.textDisabled,
  
  // Input
  inputBg:          BASE.surface,
  inputBorder:      BASE.border,
  inputBorderFocus: BASE.primaryLight,
  inputText:        BASE.textMain,
  inputPlaceholder: BASE.textDisabled,
  
  // FAB
  fabBg:            BASE.primary,
  fabIcon:          '#FFFFFF',
  
  // Badge
  badgeExcellence:     { bg: '#dcfce7', color: '#166534' },
  badgeSatisfactory:   { bg: '#dbeafe', color: '#1e3a8a' },
  badgeCompetent:      { bg: '#fef9c3', color: '#713f12' },
  badgeDeveloping:     { bg: '#ffedd5', color: '#7c2d12' },
  badgeNotCompetent:   { bg: '#fee2e2', color: '#7f1d1d' },
  
  // Status
  statusActive:     { bg: BASE.successBg, color: BASE.success },
  statusInactive:   { bg: BASE.errorBg, color: BASE.error },
  statusPending:    { bg: BASE.warningBg, color: BASE.warning },
};

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
export const getRoleTheme = (role) => {
  const roleKey = role?.toLowerCase();
  if (roleKey === 'superadmin') return ROLE_THEMES.superadmin;
  if (roleKey === 'admin prodi' || roleKey === 'adminprodi') return ROLE_THEMES.adminProdi;
  if (roleKey === 'dosen') return ROLE_THEMES.dosen;
  if (roleKey === 'mahasiswa') return ROLE_THEMES.mahasiswa;
  return ROLE_THEMES.superadmin; // Default
};

export const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  if (s === 'active' || s === 'aktif' || s === 'success') return COMPONENT.statusActive;
  if (s === 'inactive' || s === 'nonaktif' || s === 'error') return COMPONENT.statusInactive;
  if (s === 'pending' || s === 'warning') return COMPONENT.statusPending;
  return { bg: BASE.borderLight, color: BASE.textMuted };
};

export const getPredikatColor = (predikat) => {
  const p = predikat?.toLowerCase();
  if (p === 'excellence') return COMPONENT.badgeExcellence;
  if (p === 'satisfactory') return COMPONENT.badgeSatisfactory;
  if (p === 'competent') return COMPONENT.badgeCompetent;
  if (p === 'developing') return COMPONENT.badgeDeveloping;
  if (p === 'not competent') return COMPONENT.badgeNotCompetent;
  return { bg: BASE.borderLight, color: BASE.textMuted };
};

export default {
  BASE,
  ROLE_THEMES,
  COMPONENT,
  getRoleTheme,
  getStatusColor,
  getPredikatColor,
  // Legacy exports
  COLORS,
  PRIMARY_BLUE,
  PRIMARY_DARK,
};
