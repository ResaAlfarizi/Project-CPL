/**
 * Global Color Palette - Web Module 2
 * Consistent colors untuk semua role (Superadmin, Admin Prodi, Dosen, Mahasiswa)
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
  surfaceDark: '#1a1a1a',    // Dark surface (untuk dark mode elements)
  
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
} as const;

export type ColorKey = keyof typeof COLORS;

/**
 * Helper function untuk menggunakan color dengan opacity
 * @param color - Color key dari COLORS object
 * @param opacity - Opacity 0-1
 */
export function withOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * CSS Variables untuk global styles
 * Dapat digunakan di globals.css
 */
export const CSS_VARIABLES = `
:root {
  /* Primary */
  --color-primary: ${COLORS.primary};
  --color-primary-light: ${COLORS.primaryLight};
  --color-primary-dark: ${COLORS.primaryDark};
  
  /* Background */
  --color-background: ${COLORS.background};
  --color-surface: ${COLORS.surface};
  --color-surface-hover: ${COLORS.surfaceHover};
  
  /* Text */
  --color-text-main: ${COLORS.textMain};
  --color-text-secondary: ${COLORS.textSecondary};
  --color-text-muted: ${COLORS.textMuted};
  --color-text-white: ${COLORS.textWhite};
  
  /* Border */
  --color-border: ${COLORS.border};
  --color-border-light: ${COLORS.borderLight};
  --color-border-dark: ${COLORS.borderDark};
  
  /* Accent */
  --color-alice-blue: ${COLORS.aliceBlue};
  --color-honeydew: ${COLORS.honeydew};
  --color-vanilla: ${COLORS.vanilla};
  --color-pinky: ${COLORS.pinky};
  
  /* Status */
  --color-success: ${COLORS.success};
  --color-success-bg: ${COLORS.successBg};
  --color-error: ${COLORS.error};
  --color-error-bg: ${COLORS.errorBg};
  --color-warning: ${COLORS.warning};
  --color-warning-bg: ${COLORS.warningBg};
  --color-info: ${COLORS.info};
  --color-info-bg: ${COLORS.infoBg};
  
  /* Brand */
  --color-uinsa-green: ${COLORS.uinsaGreen};
  --color-uinsa-yellow: ${COLORS.uinsaYellow};
}
`;
