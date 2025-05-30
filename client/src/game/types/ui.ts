
export type PanelType = 'building' | 'resource' | 'npc' | 'inventory' | 'market' | 'skills' | 'combat' | 'research' | 'economy';
export type PanelPosition = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'floating';
export type PanelState = 'hidden' | 'minimized' | 'normal' | 'maximized' | 'docked' | 'floating';

export interface PanelConfig {
  id: string;
  type: PanelType;
  title: string;
  position: PanelPosition;
  state: PanelState;
  size: {
    width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  offset: {
    x: number;
    y: number;
  };
  zIndex: number;
  isResizable: boolean;
  isDraggable: boolean;
  isClosable: boolean;
  isMinimizable: boolean;
  isMaximizable: boolean;
  hasHeader: boolean;
  hasBorder: boolean;
  hasShadow: boolean;
  autoHide?: boolean;
  modal?: boolean;
  persistent?: boolean;
}

export interface NotificationConfig {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  icon?: string;
  color?: string;
  actions?: {
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }[];
  persistent?: boolean;
  timestamp: number;
}

export interface TooltipConfig {
  id: string;
  target: string;
  content: string | React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay: number;
  hideDelay: number;
  interactive: boolean;
  arrow: boolean;
  maxWidth?: number;
  theme?: 'dark' | 'light' | 'info' | 'warning' | 'error';
  offset?: {
    x: number;
    y: number;
  };
}

export interface ModalConfig {
  id: string;
  title?: string;
  content: React.ReactNode;
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  position: 'center' | 'top' | 'bottom';
  backdrop: boolean;
  closeOnBackdrop: boolean;
  closeOnEscape: boolean;
  showHeader: boolean;
  showFooter: boolean;
  buttons?: {
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
  }[];
  onOpen?: () => void;
  onClose?: () => void;
}

export interface MenuConfig {
  id: string;
  type: 'dropdown' | 'context' | 'sidebar' | 'navbar';
  items: MenuItem[];
  position?: {
    x: number;
    y: number;
  };
  direction?: 'vertical' | 'horizontal';
  autoClose?: boolean;
  maxHeight?: number;
  searchable?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action?: () => void;
  submenu?: MenuItem[];
  separator?: boolean;
  disabled?: boolean;
  visible?: boolean;
  badge?: {
    text: string;
    color: string;
  };
}

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'password' | 'email' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'date' | 'color';
  label: string;
  placeholder?: string;
  value: any;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  help?: string;
  error?: string;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface FormConfig {
  id: string;
  title?: string;
  fields: FormField[];
  layout: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  spacing?: 'compact' | 'normal' | 'loose';
  showLabels?: boolean;
  showRequiredMarks?: boolean;
  submitButton?: {
    label: string;
    disabled?: boolean;
    loading?: boolean;
  };
  cancelButton?: {
    label: string;
    action: () => void;
  };
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  validation?: 'onSubmit' | 'onChange' | 'onBlur';
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
  badge?: {
    text: string;
    color: string;
  };
}

export interface TabsConfig {
  id: string;
  tabs: TabConfig[];
  activeTab: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  variant: 'default' | 'pills' | 'underline';
  size: 'small' | 'medium' | 'large';
  scrollable?: boolean;
  addButton?: {
    label: string;
    action: () => void;
  };
  onTabChange: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
}

export interface ProgressConfig {
  id: string;
  value: number;
  max: number;
  type: 'linear' | 'circular';
  size: 'small' | 'medium' | 'large';
  color: string;
  showValue?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  striped?: boolean;
  label?: string;
}

export interface ListConfig {
  id: string;
  items: ListItem[];
  selectable?: boolean;
  multiSelect?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: {
    enabled: boolean;
    pageSize: number;
    currentPage: number;
    totalItems: number;
  };
  virtualScrolling?: boolean;
  groupBy?: string;
  emptyState?: {
    message: string;
    icon?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

export interface ListItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  image?: string;
  badge?: {
    text: string;
    color: string;
  };
  actions?: {
    label: string;
    icon?: string;
    action: () => void;
  }[];
  data?: any;
  selected?: boolean;
  disabled?: boolean;
  group?: string;
}

export interface UIState {
  panels: Record<string, PanelConfig>;
  notifications: NotificationConfig[];
  tooltips: Record<string, TooltipConfig>;
  modals: ModalConfig[];
  menus: Record<string, MenuConfig>;
  forms: Record<string, FormConfig>;
  tabs: Record<string, TabsConfig>;
  theme: {
    mode: 'light' | 'dark' | 'auto';
    colors: Record<string, string>;
    fonts: Record<string, string>;
    spacing: Record<string, number>;
    breakpoints: Record<string, number>;
  };
  layout: {
    sidebar: {
      visible: boolean;
      collapsed: boolean;
      width: number;
    };
    header: {
      visible: boolean;
      height: number;
    };
    footer: {
      visible: boolean;
      height: number;
    };
  };
  viewport: {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

// UI Events
export type UIEvent = {
  type: 'panel_open' | 'panel_close' | 'panel_resize' | 'panel_move' | 'notification_show' | 'notification_dismiss' | 'modal_open' | 'modal_close';
  target: string;
  timestamp: number;
  data: any;
};

// UI Actions
export interface UIActions {
  // Panels
  openPanel: (type: PanelType, config?: Partial<PanelConfig>) => void;
  closePanel: (id: string) => void;
  togglePanel: (type: PanelType) => void;
  minimizePanel: (id: string) => void;
  maximizePanel: (id: string) => void;
  resizePanel: (id: string, size: { width: number; height: number }) => void;
  movePanel: (id: string, position: { x: number; y: number }) => void;
  
  // Notifications
  showNotification: (config: Omit<NotificationConfig, 'id' | 'timestamp'>) => string;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Modals
  openModal: (config: Omit<ModalConfig, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Tooltips
  showTooltip: (config: TooltipConfig) => void;
  hideTooltip: (id: string) => void;
  hideAllTooltips: () => void;
  
  // Menus
  openMenu: (config: MenuConfig) => void;
  closeMenu: (id: string) => void;
  closeAllMenus: () => void;
  
  // Theme
  setTheme: (theme: Partial<UIState['theme']>) => void;
  toggleTheme: () => void;
  
  // Layout
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setHeaderHeight: (height: number) => void;
  setFooterHeight: (height: number) => void;
}

// Utility types
export type UIComponent = React.ComponentType<any>;
export type UIComponentRegistry = Record<string, UIComponent>;

export interface UITheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    light: string;
    dark: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    fast: number;
    normal: number;
    slow: number;
  };
}

export const DEFAULT_THEME: UITheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    light: '#f8fafc',
    dark: '#1e293b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  fonts: {
    primary: 'Inter, sans-serif',
    secondary: 'Inter, sans-serif',
    monospace: 'JetBrains Mono, monospace',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};
