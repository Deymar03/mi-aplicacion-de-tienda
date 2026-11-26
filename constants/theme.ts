/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
//! con esto manejamos el cambio de color segun la preferencia
import { Platform } from 'react-native';
const accentColor = '#E67E22';

export const Colors = {
  light: {
  text: '#2C3E50',
  background: '#F8FAFB',
  tint: '#2ECC71',

  card: '#FFFFFF',
  input: '#FFFFFF',
  border: '#D1D5DB',

  success: '#22C55E',
  danger: '#EF4444',
  primary: '#6366F1',

  cardText: '#111827',
  secondaryText: '#4B5563',
  tabIconDefault: '#9CA3AF',
  tableHeader: '#F3F4F6',
  footer: '#FFFFFF',
  buttonSecondary: '#E5E7EB',
  },

  dark: {
  text: '#ECF0F1',
  background: '#111827',
  tint: '#2ECC71',
  tabIconDefault: '#6B7280',
  card: '#1F2937',
  input: '#111827',
  border: '#374151',

  success: '#22C55E',
  danger: '#EF4444',
  primary: '#6366F1',

  cardText: '#FFFFFF',
  secondaryText: '#D1D5DB',
  tableHeader: '#111827',
  footer: '#111827',
  buttonSecondary: '#374151',
  },
};

export const AccentColors = {
  success: '#27AE60', 
  error: '#E74C3C', 
  warning: accentColor, 
  info: '#3498DB', 
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
