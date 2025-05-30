
/**
 * UI SYSTEM UTILITIES
 * Funções utilitárias para usar o sistema de design padronizado
 */

// Tipos para as variantes de UI
export type UIVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
export type UISize = 'sm' | 'base' | 'lg';
export type UIRarity = 'common' | 'rare' | 'epic' | 'legendary';

// Classes de botão combinadas
export const getButtonClasses = (variant: UIVariant = 'primary', size: UISize = 'base') => {
  const baseClasses = 'ui-button';
  const variantClass = `ui-button-${variant}`;
  const sizeClass = size !== 'base' ? `ui-button-${size}` : '';
  
  return [baseClasses, variantClass, sizeClass].filter(Boolean).join(' ');
};

// Classes de painel
export const getPanelClasses = (large: boolean = false) => {
  const baseClasses = 'ui-panel';
  const sizeClass = large ? 'ui-responsive-panel-large' : 'ui-responsive-panel';
  
  return [baseClasses, sizeClass].join(' ');
};

// Classes de slot com raridade
export const getSlotClasses = (rarity?: UIRarity) => {
  const baseClasses = 'ui-slot';
  const rarityClass = rarity ? `ui-rarity-${rarity}` : '';
  
  return [baseClasses, rarityClass].filter(Boolean).join(' ');
};

// Classes de badge
export const getBadgeClasses = (variant: UIVariant = 'primary') => {
  return `ui-badge ui-badge-${variant}`;
};

// Constantes de cores CSS
export const UI_COLORS = {
  primary: {
    50: 'var(--ui-primary-50)',
    100: 'var(--ui-primary-100)',
    200: 'var(--ui-primary-200)',
    300: 'var(--ui-primary-300)',
    400: 'var(--ui-primary-400)',
    500: 'var(--ui-primary-500)',
    600: 'var(--ui-primary-600)',
    700: 'var(--ui-primary-700)',
    800: 'var(--ui-primary-800)',
    900: 'var(--ui-primary-900)',
  },
  secondary: {
    50: 'var(--ui-secondary-50)',
    100: 'var(--ui-secondary-100)',
    200: 'var(--ui-secondary-200)',
    300: 'var(--ui-secondary-300)',
    400: 'var(--ui-secondary-400)',
    500: 'var(--ui-secondary-500)',
    600: 'var(--ui-secondary-600)',
    700: 'var(--ui-secondary-700)',
    800: 'var(--ui-secondary-800)',
    900: 'var(--ui-secondary-900)',
  },
  success: {
    50: 'var(--ui-success-50)',
    100: 'var(--ui-success-100)',
    200: 'var(--ui-success-200)',
    300: 'var(--ui-success-300)',
    400: 'var(--ui-success-400)',
    500: 'var(--ui-success-500)',
    600: 'var(--ui-success-600)',
    700: 'var(--ui-success-700)',
    800: 'var(--ui-success-800)',
    900: 'var(--ui-success-900)',
  },
  warning: {
    50: 'var(--ui-warning-50)',
    100: 'var(--ui-warning-100)',
    200: 'var(--ui-warning-200)',
    300: 'var(--ui-warning-300)',
    400: 'var(--ui-warning-400)',
    500: 'var(--ui-warning-500)',
    600: 'var(--ui-warning-600)',
    700: 'var(--ui-warning-700)',
    800: 'var(--ui-warning-800)',
    900: 'var(--ui-warning-900)',
  },
  error: {
    50: 'var(--ui-error-50)',
    100: 'var(--ui-error-100)',
    200: 'var(--ui-error-200)',
    300: 'var(--ui-error-300)',
    400: 'var(--ui-error-400)',
    500: 'var(--ui-error-500)',
    600: 'var(--ui-error-600)',
    700: 'var(--ui-error-700)',
    800: 'var(--ui-error-800)',
    900: 'var(--ui-error-900)',
  },
  gray: {
    50: 'var(--ui-gray-50)',
    100: 'var(--ui-gray-100)',
    200: 'var(--ui-gray-200)',
    300: 'var(--ui-gray-300)',
    400: 'var(--ui-gray-400)',
    500: 'var(--ui-gray-500)',
    600: 'var(--ui-gray-600)',
    700: 'var(--ui-gray-700)',
    800: 'var(--ui-gray-800)',
    900: 'var(--ui-gray-900)',
  },
} as const;

// Constantes de espaçamento
export const UI_SPACING = {
  1: 'var(--ui-space-1)',
  2: 'var(--ui-space-2)',
  3: 'var(--ui-space-3)',
  4: 'var(--ui-space-4)',
  5: 'var(--ui-space-5)',
  6: 'var(--ui-space-6)',
  8: 'var(--ui-space-8)',
  10: 'var(--ui-space-10)',
  12: 'var(--ui-space-12)',
  16: 'var(--ui-space-16)',
  20: 'var(--ui-space-20)',
} as const;

// Constantes de sombras
export const UI_SHADOWS = {
  sm: 'var(--ui-shadow-sm)',
  base: 'var(--ui-shadow-base)',
  md: 'var(--ui-shadow-md)',
  lg: 'var(--ui-shadow-lg)',
  xl: 'var(--ui-shadow-xl)',
  '2xl': 'var(--ui-shadow-2xl)',
} as const;

// Constantes de bordas arredondadas
export const UI_RADIUS = {
  sm: 'var(--ui-radius-sm)',
  base: 'var(--ui-radius-base)',
  md: 'var(--ui-radius-md)',
  lg: 'var(--ui-radius-lg)',
  xl: 'var(--ui-radius-xl)',
  '2xl': 'var(--ui-radius-2xl)',
  full: 'var(--ui-radius-full)',
} as const;

// Função para gerar estilos inline quando necessário
export const getUIStyle = (styles: Record<string, string>) => {
  return Object.entries(styles).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as React.CSSProperties);
};

// Hook para classes responsivas
export const useResponsiveClasses = () => {
  return {
    panel: 'ui-responsive-panel',
    panelLarge: 'ui-responsive-panel-large',
    text: 'ui-responsive-text',
    textLg: 'ui-responsive-text-lg',
  };
};

// Função para combinar classes CSS
export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
