
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { COLORS, Z_INDEX, ANIMATIONS } from '../../shared/constants/game';

// Utility function for class names
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Panel Variants
export type PanelVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type PanelSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Panel Base Classes
export function getPanelClasses(variant: PanelVariant = 'primary'): string {
  const baseClasses = `
    relative backdrop-blur-md border-2 rounded-xl shadow-xl
    transition-all duration-${ANIMATIONS.NORMAL} ease-in-out
    ui-panel fantasy-glow fantasy-border
  `;

  const variantClasses = {
    primary: 'bg-gradient-to-br from-amber-900/90 to-amber-800/95 border-amber-400/60',
    secondary: 'bg-gradient-to-br from-stone-900/90 to-stone-800/95 border-stone-400/60',
    success: 'bg-gradient-to-br from-green-900/90 to-green-800/95 border-green-400/60',
    warning: 'bg-gradient-to-br from-yellow-900/90 to-yellow-800/95 border-yellow-400/60',
    error: 'bg-gradient-to-br from-red-900/90 to-red-800/95 border-red-400/60',
  };

  return cn(baseClasses, variantClasses[variant]);
}

// Header Classes
export function getHeaderClasses(): string {
  return cn(`
    ui-panel-header p-4 border-b-2 border-amber-400/30
    bg-gradient-to-r from-amber-600/50 to-amber-500/40
    rounded-t-xl backdrop-blur-sm
  `);
}

// Content Classes
export function getContentClasses(): string {
  return cn(`
    ui-panel-content p-4 overflow-y-auto
    scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-transparent
    max-h-[70vh]
  `);
}

// Footer Classes
export function getFooterClasses(): string {
  return cn(`
    ui-panel-footer p-4 border-t-2 border-amber-400/30
    bg-gradient-to-r from-amber-600/50 to-amber-500/40
    rounded-b-xl backdrop-blur-sm
  `);
}

// Button Variants
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export function getButtonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  disabled: boolean = false
): string {
  const baseClasses = `
    fantasy-button relative inline-flex items-center justify-center
    font-semibold rounded-lg transition-all duration-${ANIMATIONS.FAST}
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
    disabled:transform-none
  `;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-3',
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-br from-amber-600 to-amber-700
      hover:from-amber-500 hover:to-amber-600
      border-2 border-amber-400/60 hover:border-amber-300
      text-amber-50 shadow-lg hover:shadow-xl
      focus:ring-amber-400
    `,
    secondary: `
      bg-gradient-to-br from-stone-600 to-stone-700
      hover:from-stone-500 hover:to-stone-600
      border-2 border-stone-400/60 hover:border-stone-300
      text-stone-50 shadow-lg hover:shadow-xl
      focus:ring-stone-400
    `,
    success: `
      bg-gradient-to-br from-green-600 to-green-700
      hover:from-green-500 hover:to-green-600
      border-2 border-green-400/60 hover:border-green-300
      text-green-50 shadow-lg hover:shadow-xl
      focus:ring-green-400
    `,
    warning: `
      bg-gradient-to-br from-yellow-600 to-yellow-700
      hover:from-yellow-500 hover:to-yellow-600
      border-2 border-yellow-400/60 hover:border-yellow-300
      text-yellow-50 shadow-lg hover:shadow-xl
      focus:ring-yellow-400
    `,
    error: `
      bg-gradient-to-br from-red-600 to-red-700
      hover:from-red-500 hover:to-red-600
      border-2 border-red-400/60 hover:border-red-300
      text-red-50 shadow-lg hover:shadow-xl
      focus:ring-red-400
    `,
    ghost: `
      bg-transparent hover:bg-amber-100/10
      border-2 border-transparent hover:border-amber-400/30
      text-amber-200 hover:text-amber-100
      focus:ring-amber-400
    `,
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:transform-none' : '';

  return cn(baseClasses, sizeClasses[size], variantClasses[variant], disabledClasses);
}

// Input Classes
export function getInputClasses(error: boolean = false): string {
  const baseClasses = `
    w-full px-3 py-2 rounded-lg border-2 bg-amber-50/10
    backdrop-blur-sm text-amber-100 placeholder-amber-300/60
    transition-all duration-${ANIMATIONS.FAST}
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const stateClasses = error
    ? 'border-red-400/60 focus:border-red-300 focus:ring-red-400'
    : 'border-amber-400/60 focus:border-amber-300 focus:ring-amber-400';

  return cn(baseClasses, stateClasses);
}

// Card Classes
export function getCardClasses(variant: PanelVariant = 'primary'): string {
  return cn(
    getPanelClasses(variant),
    'p-4 hover:scale-[1.02] cursor-pointer'
  );
}

// Badge Classes
export function getBadgeClasses(variant: ButtonVariant = 'primary'): string {
  const baseClasses = `
    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
    ring-1 ring-inset transition-colors duration-${ANIMATIONS.FAST}
  `;

  const variantClasses = {
    primary: 'bg-amber-100/20 text-amber-100 ring-amber-400/30',
    secondary: 'bg-stone-100/20 text-stone-100 ring-stone-400/30',
    success: 'bg-green-100/20 text-green-100 ring-green-400/30',
    warning: 'bg-yellow-100/20 text-yellow-100 ring-yellow-400/30',
    error: 'bg-red-100/20 text-red-100 ring-red-400/30',
    ghost: 'bg-transparent text-amber-200 ring-amber-400/30',
  };

  return cn(baseClasses, variantClasses[variant]);
}

// Notification Classes
export function getNotificationClasses(type: 'success' | 'error' | 'warning' | 'info'): string {
  const baseClasses = `
    relative p-4 rounded-lg shadow-lg backdrop-blur-md border-2
    transition-all duration-${ANIMATIONS.NORMAL} ease-in-out
    transform translate-x-0 opacity-100
  `;

  const typeClasses = {
    success: 'bg-green-900/90 border-green-400/60 text-green-100',
    error: 'bg-red-900/90 border-red-400/60 text-red-100',
    warning: 'bg-yellow-900/90 border-yellow-400/60 text-yellow-100',
    info: 'bg-blue-900/90 border-blue-400/60 text-blue-100',
  };

  return cn(baseClasses, typeClasses[type]);
}

// Progress Bar Classes
export function getProgressBarClasses(): string {
  return cn(`
    w-full bg-amber-900/30 rounded-full h-2 overflow-hidden
    border border-amber-400/30
  `);
}

export function getProgressFillClasses(percentage: number): string {
  return cn(`
    h-full bg-gradient-to-r from-amber-400 to-amber-500
    transition-all duration-${ANIMATIONS.NORMAL} ease-out
    rounded-full shadow-inner
  `);
}

// Tooltip Classes
export function getTooltipClasses(): string {
  return cn(`
    absolute z-50 px-3 py-2 text-sm text-amber-100
    bg-amber-900/95 border border-amber-400/60 rounded-lg
    backdrop-blur-sm shadow-xl pointer-events-none
    transition-all duration-${ANIMATIONS.FAST}
    max-w-xs break-words
  `);
}

// Modal Classes
export function getModalOverlayClasses(): string {
  return cn(`
    fixed inset-0 bg-black/50 backdrop-blur-sm
    flex items-center justify-center p-4
    z-${Z_INDEX.MODALS} transition-opacity duration-${ANIMATIONS.NORMAL}
  `);
}

export function getModalContentClasses(): string {
  return cn(`
    relative bg-gradient-to-br from-amber-900/95 to-amber-800/98
    border-2 border-amber-400/60 rounded-xl shadow-2xl
    max-w-2xl w-full max-h-[90vh] overflow-hidden
    backdrop-blur-md transform transition-all duration-${ANIMATIONS.NORMAL}
  `);
}

// Animation Classes
export const ANIMATION_CLASSES = {
  fadeIn: `animate-in fade-in duration-${ANIMATIONS.NORMAL}`,
  fadeOut: `animate-out fade-out duration-${ANIMATIONS.NORMAL}`,
  slideIn: `animate-in slide-in-from-right duration-${ANIMATIONS.NORMAL}`,
  slideOut: `animate-out slide-out-to-right duration-${ANIMATIONS.NORMAL}`,
  scaleIn: `animate-in zoom-in-95 duration-${ANIMATIONS.FAST}`,
  scaleOut: `animate-out zoom-out-95 duration-${ANIMATIONS.FAST}`,
} as const;

// Responsive Classes
export const RESPONSIVE_CLASSES = {
  panel: 'w-[95vw] max-w-[400px] h-[85vh] max-h-[600px] min-w-[280px] min-h-[400px] sm:w-[400px] sm:h-[600px]',
  fullscreen: 'w-screen h-screen',
  centered: 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
} as const;
