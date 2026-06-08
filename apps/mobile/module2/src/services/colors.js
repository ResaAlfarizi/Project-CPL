/**
 * Global Color Palette - Mobile Module 2
 * Consistent colors untuk semua role (Superadmin, Admin Prodi, Dosen, Mahasiswa)
 * SAMA dengan Web Module 2
 */

export const COLORS = {
  // Primary Colors
  primary: '#212c21',        // Hijau gelap (buttons, active states)
  primaryLight: '#3d5a3d',   // Hover states
  primaryDark: '#1a231a',    // Pressed states
  
  // Background Colors
  background: '#F6F5FA',     // Main background (abu terang)
  surface: '#FFFFFF',        // Cards, panels
  surfaceHover: '#F9FAFB',   // Hover states
  surfaceDark: '#1a1a1a',    // Dark surface
  
  // Text Colors
  textMain: '#212121',       // Primary text
  textSecondary: '#64748B',  // Secondary text
  textMuted: '#94A3B8',      // Disabled text
  textWhite: '#FFFFFF',      // On dark backgrounds
  textDark: '#111827',       // Extra dark text
  
  // Border Colors
  border: '#E2E8F0',         // Default borders
  borderLight: '#F1F5F9',    // Subtle borders
  borderDark: '#CBD5E1',     // Emphasis borders
  
  // Accent Colors (untuk cards)
  aliceBlue: '#cad4ed',      // Biru muda
  honeydew: '#dcead7',       // Hijau muda
  vanilla: '#f2f3cb',        // Kuning muda
  pinky: '#f4d6d6',          // Pink muda
  
  // Status Colors
  success: '#10B981',        // Green
  successBg: '#DCFCE7',      // Light green background
  successLight: '#D1FAE5',   // Lighter green
  error: '#EF4444',          // Red
  errorBg: '#FEE2E2',        // Light red background
  errorDark: '#DC2626',      // Darker red
  warning: '#F59E0B',        // Orange
  warningBg: '#FEF3C7',      // Light orange background
  info: '#3B82F6',           // Blue
  infoBg: '#DBEAFE',         // Light blue background
  
  // Brand Colors (UINSA specific)
  uinsaGreen: '#2E4E3F',     // UINSA brand color
  uinsaYellow: '#EFF0A3',    // UINSA accent
  
  // Neutral Grays
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// ─── LEGACY CONSTANTS (untuk backward compatibility) ───────────────────────
export const PRIMARY_BLUE = '#577590';
export const PRIMARY_DARK = '#24354a';
export const DANGER_COLOR = '#c62828';
export const SUCCESS_COLOR = '#16a34a';

/**
 * Helper function untuk menggunakan color dengan opacity
 * @param {string} color - Color hex value
 * @param {number} opacity - Opacity 0-1
 * @returns {string} rgba string
 */
export function withOpacity(color, opacity) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Usage example in React Native:
 * 
 * import { COLORS, withOpacity } from './services/colors';
 * 
 * <View style={{ backgroundColor: COLORS.primary }}>
 *   <Text style={{ color: COLORS.textWhite }}>Hello</Text>
 * </View>
 * 
 * <View style={{ backgroundColor: withOpacity(COLORS.primary, 0.1) }}>
 *   <Text style={{ color: COLORS.primary }}>Semi-transparent</Text>
 * </View>
 */
