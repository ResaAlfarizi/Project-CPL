// Design tokens matching the web app's globals.css
// Font: Urbanist | Palette: alice-blue, honeydew, vanilla, eerie-black, ghost-white

export const Colors = {
  aliceBlue: '#D8DFE9',
  honeydew: '#CFDECA',
  vanilla: '#EFFDA3',
  eerieBlack: '#212121',
  ghostWhite: '#F6F5FA',
  white: '#FFFFFF',

  danger: '#e74c3c',
  dangerLight: '#fdecea',
  success: '#27ae60',
  successLight: '#eafaf1',
  warning: '#f39c12',
  warningLight: '#fef9e7',
  info: '#2980b9',
  infoLight: '#ebf5fb',

  textPrimary: '#212121',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#D8DFE9',
  cardBg: '#FFFFFF',
  screenBg: '#F6F5FA',
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#212121',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#212121',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#212121',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  },
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  hero: 30,
};

export const FontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// Badge color presets matching web CSS
export const BadgeColors = {
  blue: { bg: '#D8DFE9', text: '#2d5986' },
  green: { bg: '#CFDECA', text: '#2d6a4f' },
  yellow: { bg: '#EFFDA3', text: '#7d6608' },
  red: { bg: '#fdecea', text: '#e74c3c' },
  gray: { bg: '#F6F5FA', text: '#6b7280', borderColor: '#D8DFE9' },
};

// Stat card presets from web dashboard
export const StatPresets = {
  prodi: { icon: '🎓', color: '#D8DFE9', bg: '#f0f4f9' },
  cpl: { icon: '🎯', color: '#CFDECA', bg: '#f0f7ee' },
  mk: { icon: '📚', color: '#fde8cc', bg: '#fef6ed' },
  mapping: { icon: '🔗', color: '#cceeff', bg: '#eef9ff' },
  subCpmk: { icon: '📋', color: '#ffe0e0', bg: '#fff5f5' },
};
