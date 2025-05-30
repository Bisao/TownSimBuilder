import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Classes base para painéis de fantasia lowpoly
export const getPanelClasses = (variant: 'primary' | 'secondary' | 'modal' = 'primary') => {
  const base = "backdrop-blur-md border-2 shadow-2xl rounded-xl overflow-hidden transition-all duration-200";

  switch (variant) {
    case 'primary':
      return cn(
        base,
        "bg-gradient-to-br from-amber-900/95 via-amber-800/90 to-amber-900/95",
        "border-amber-600/50"
      );
    case 'secondary':
      return cn(
        base,
        "bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-800/95",
        "border-slate-600/50"
      );
    case 'modal':
      return cn(
        base,
        "bg-gradient-to-br from-gray-900/98 via-gray-800/95 to-gray-900/98",
        "border-gray-600/60"
      );
  }
};

export const getButtonClasses = (variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' = 'primary', size: 'sm' | 'md' | 'lg' = 'md') => {
  const base = "font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 rounded-lg flex items-center justify-center gap-2 border shadow-lg";

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg"
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-400",
    secondary: "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-gray-400",
    success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-green-400",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-yellow-400",
    error: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-red-400",
    ghost: "bg-transparent hover:bg-white/10 text-current border-transparent"
  };

  return cn(base, sizeClasses[size], variantClasses[variant]);
};

export const getSlotClasses = () => {
  return cn(
    "border-2 border-dashed rounded-lg transition-all duration-200",
    "flex items-center justify-center cursor-pointer",
    "hover:border-solid hover:shadow-md"
  );
};

export const getHeaderClasses = () => {
  return "p-4 border-b backdrop-blur-sm";
};

export const getContentClasses = () => {
  return "p-4 flex-1 overflow-y-auto";
};

export const getFooterClasses = () => {
  return "p-4 border-t backdrop-blur-sm";
};

// Utilitários para grid e flexbox
export const gridClasses = {
  "ui-grid": "grid",
  "ui-grid-cols-1": "grid-cols-1",
  "ui-grid-cols-2": "grid-cols-2",
  "ui-grid-cols-3": "grid-cols-3",
  "ui-grid-cols-4": "grid-cols-4",
  "ui-grid-cols-5": "grid-cols-5",
  "ui-gap-1": "gap-1",
  "ui-gap-2": "gap-2",
  "ui-gap-3": "gap-3",
  "ui-gap-4": "gap-4"
};

export const flexClasses = {
  "ui-flex": "flex",
  "ui-flex-col": "flex-col",
  "ui-flex-row": "flex-row",
  "ui-flex-1": "flex-1",
  "ui-flex-center": "items-center justify-center",
  "ui-flex-between": "justify-between",
  "ui-items-center": "items-center",
  "ui-justify-center": "justify-center"
};

export const spacingClasses = {
  "ui-p-1": "p-1",
  "ui-p-2": "p-2",
  "ui-p-3": "p-3",
  "ui-p-4": "p-4",
  "ui-p-6": "p-6",
  "ui-m-1": "m-1",
  "ui-m-2": "m-2",
  "ui-m-3": "m-3",
  "ui-m-4": "m-4"
};

export const borderClasses = {
  "ui-rounded": "rounded",
  "ui-rounded-lg": "rounded-lg",
  "ui-rounded-xl": "rounded-xl",
  "ui-rounded-full": "rounded-full",
  "ui-border": "border",
  "ui-border-2": "border-2"
};

export const shadowClasses = {
  "ui-shadow": "shadow",
  "ui-shadow-lg": "shadow-lg",
  "ui-shadow-xl": "shadow-xl",
  "ui-shadow-2xl": "shadow-2xl",
  "ui-shadow-medium": "shadow-md"
};

// Classes de exemplo para demonstração
export const demoClasses = {
  ...gridClasses,
  ...flexClasses,
  ...spacingClasses,
  ...borderClasses,
  ...shadowClasses
};