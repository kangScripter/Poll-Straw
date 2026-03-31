export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceHover: string;
  surfacePressed: string;
  surfaceSubtle: string;

  // Borders
  border: string;
  borderSubtle: string;
  borderAccent: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnPrimary: string;

  // Primary (Sky Blue)
  primary: string;
  primaryHover: string;
  primarySubtle: string;
  primaryLight: string;

  // Accent (Amber)
  accent: string;
  accentSubtle: string;

  // Semantic
  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;
  error: string;
  errorSubtle: string;
  info: string;
  infoSubtle: string;

  // UI Elements
  tabBarBg: string;
  tabBarBorder: string;
  overlay: string;
  skeleton: string;
  skeletonHighlight: string;
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  cardShadow: string;
  divider: string;

  // Gradients (as tuples)
  primaryGradient: [string, string];
  heroBg: [string, string];

  // Poll option colors
  pollOptionColors: string[];
}
