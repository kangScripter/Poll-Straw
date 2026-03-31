import { ThemeColors } from './types';

export const darkTheme: ThemeColors = {
  // Backgrounds
  background: '#111827',
  backgroundElevated: '#1F2937',
  surface: '#1F2937',
  surfaceHover: '#374151',
  surfacePressed: '#4B5563',
  surfaceSubtle: '#1A2332',

  // Borders
  border: '#374151',
  borderSubtle: '#2D3748',
  borderAccent: '#F59E0B',

  // Text
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textOnPrimary: '#FFFFFF',

  // Primary (Sky Blue - lighter in dark mode for contrast)
  primary: '#38BDF8',
  primaryHover: '#7DD3FC',
  primarySubtle: '#0C4A6E',
  primaryLight: '#0EA5E9',

  // Accent (Amber)
  accent: '#FBBF24',
  accentSubtle: '#78350F',

  // Semantic
  success: '#34D399',
  successSubtle: '#064E3B',
  warning: '#FBBF24',
  warningSubtle: '#78350F',
  error: '#F87171',
  errorSubtle: '#7F1D1D',
  info: '#60A5FA',
  infoSubtle: '#1E3A5F',

  // UI Elements
  tabBarBg: '#111827',
  tabBarBorder: '#1F2937',
  overlay: '#00000080',
  skeleton: '#374151',
  skeletonHighlight: '#4B5563',
  inputBg: '#1F2937',
  inputBorder: '#4B5563',
  inputFocusBorder: '#38BDF8',
  cardShadow: '#00000000',
  divider: '#374151',

  // Gradients
  primaryGradient: ['#38BDF8', '#0EA5E9'],
  heroBg: ['#0C4A6E', '#111827'],

  // Poll option colors (brighter for dark mode)
  pollOptionColors: ['#3EB991', '#FF7563', '#AA66CC', '#FFBB33', '#FF8800', '#33B5E5', '#E91E63', '#8BC34A'],
};
