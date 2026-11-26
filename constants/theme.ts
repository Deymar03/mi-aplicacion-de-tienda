
import { Platform } from 'react-native';

// Paleta centralizada de Tienda Doña Judy.
const BRAND_GREEN = '#15803D';
const NAVY_BLUE = '#173B5E';
const DANGER_RED = '#B91C1C';

export const Colors = {
  light: {
    // Superficies
    background: '#F5F7FA',
    card: '#FFFFFF',
    input: '#FFFFFF',
    footer: '#FFFFFF',
    tableHeader: '#EEF2F6',
    buttonSecondary: '#E8EEF5',

    // Texto
    text: '#17212B',
    cardText: '#17212B',
    secondaryText: '#526171',
    mutedText: '#64748B',

    // Marca y navegación
    tint: BRAND_GREEN,
    primary: NAVY_BLUE,
    primaryText: '#FFFFFF',
    tabIconDefault: '#64748B',
    icon: '#687076',

    // Bordes
    border: '#D8E0E8',

    // Estados
    success: '#166534',
    successBackground: '#DCFCE7',

    danger: DANGER_RED,
    dangerBackground: '#FEE2E2',

    warning: '#92400E',
    warningBackground: '#FEF3C7',

    info: '#1D4ED8',
    infoBackground: '#DBEAFE',

    // Valores comerciales
    price: '#166534',
    profit: '#047857',
    stockLow: '#92400E',
    stockLowBackground: '#FEF3C7',

    // Acciones
    actionSuccess: BRAND_GREEN,
    actionDanger: DANGER_RED,
    actionInfo: NAVY_BLUE,
    actionText: '#FFFFFF',
  },

  dark: {
    // Superficies
    background: '#0F172A',
    card: '#1E293B',
    input: '#172235',
    footer: '#172235',
    tableHeader: '#172235',
    buttonSecondary: '#334155',

    // Texto
    text: '#F8FAFC',
    cardText: '#F8FAFC',
    secondaryText: '#CBD5E1',
    mutedText: '#94A3B8',

    // Marca y navegación
    tint: '#4ADE80',
    primary: NAVY_BLUE,
    primaryText: '#FFFFFF',
    tabIconDefault: '#94A3B8',
    icon: '#9BA1A6',

    // Bordes
    border: '#334155',

    // Estados
    success: '#4ADE80',
    successBackground: '#14532D',

    danger: '#F87171',
    dangerBackground: '#451A1A',

    warning: '#FDE68A',
    warningBackground: '#451A03',

    info: '#60A5FA',
    infoBackground: '#172554',

    // Valores comerciales
    price: '#4ADE80',
    profit: '#34D399',
    stockLow: '#FDE68A',
    stockLowBackground: '#451A03',

    // Acciones
    actionSuccess: BRAND_GREEN,
    actionDanger: DANGER_RED,
    actionInfo: NAVY_BLUE,
    actionText: '#FFFFFF',
  },
};

export const AccentColors = {
  success: BRAND_GREEN,
  error: DANGER_RED,
  warning: '#92400E',
  info: '#1D4ED8',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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
