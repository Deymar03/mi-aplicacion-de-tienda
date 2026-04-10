/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Colores amigables para Tienda de Barrio
// Verde: Confianza, crecimiento, naturaleza
// Naranja: Calidez, energía, invitación
const tintColorLight = '#2ECC71'; // Verde vibrante y moderno
const tintColorDark = '#27AE60'; // Verde más profundo para dark mode
const accentColor = '#E67E22'; // Naranja cálido para acentos

export const Colors = {
  light: {
    text: '#2C3E50', // Gris azulado oscuro (mejor legibilidad)
    background: '#F8FAFB', // Blanco cálido muy suave
    tint: tintColorLight,
    icon: '#95A5A6', // Gris suave
    tabIconDefault: '#BDC3C7', // Gris claro
    tabIconSelected: tintColorLight,
    border: '#E0E6E8', // Borde suave
  },
  dark: {
    text: '#ECF0F1', // Blanco cálido suave
    background: '#1A252F', // Gris azulado oscuro profundo
    tint: tintColorLight,
    icon: '#7F8C8D', // Gris medio
    tabIconDefault: '#34495E', // Gris azulado más oscuro
    tabIconSelected: tintColorLight,
    border: '#2C3E50', // Borde más oscuro
  },
};

// Color de acento para alertas y elementos especiales
export const AccentColors = {
  success: '#27AE60', // Verde
  error: '#E74C3C', // Rojo cálido
  warning: accentColor, // Naranja
  info: '#3498DB', // Azul suave
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
