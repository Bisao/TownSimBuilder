
export interface UIState {
  panels: Record<string, PanelState>;
  activePanel?: string;
  notifications: Notification[];
  modals: Modal[];
  tooltips: Tooltip[];
  contextMenus: ContextMenu[];
  dragState?: DragState;
  isLoading: boolean;
  theme: UITheme;
  layout: UILayout;
}

export interface PanelState {
  id: string;
  isVisible: boolean;
  position: Position;
  size: Size;
  isMinimized: boolean;
  isMaximized: boolean;
  isDocked: boolean;
  dockSide?: DockSide;
  zIndex: number;
  canResize: boolean;
  canMove: boolean;
  canClose: boolean;
  transparency: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  duration: number;
  timestamp: number;
  actions?: NotificationAction[];
  progress?: number;
  category: string;
  priority: NotificationPriority;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  style: 'primary' | 'secondary' | 'danger';
}

export interface Modal {
  id: string;
  type: ModalType;
  title: string;
  content: React.ReactNode;
  size: ModalSize;
  isClosable: boolean;
  hasBackdrop: boolean;
  backdropDismiss: boolean;
  actions?: ModalAction[];
  data?: Record<string, any>;
}

export interface ModalAction {
  id: string;
  label: string;
  action: () => void;
  style: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export interface Tooltip {
  id: string;
  content: string | React.ReactNode;
  position: Position;
  targetId: string;
  placement: TooltipPlacement;
  delay: number;
  interactive: boolean;
}

export interface ContextMenu {
  id: string;
  items: ContextMenuItem[];
  position: Position;
  targetId?: string;
  isVisible: boolean;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action?: () => void;
  disabled?: boolean;
  shortcut?: string;
  submenu?: ContextMenuItem[];
  separator?: boolean;
}

export interface DragState {
  isDragging: boolean;
  dragType: DragType;
  dragData: any;
  startPosition: Position;
  currentPosition: Position;
  targetId?: string;
  ghostElement?: HTMLElement;
}

export interface UITheme {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
  borders: ThemeBorders;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeFonts {
  primary: string;
  secondary: string;
  monospace: string;
  sizes: Record<string, string>;
  weights: Record<string, number>;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeBorders {
  radius: Record<string, string>;
  width: Record<string, string>;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeAnimations {
  durations: Record<string, string>;
  easing: Record<string, string>;
}

export interface UILayout {
  sidebar: SidebarLayout;
  header: HeaderLayout;
  footer: FooterLayout;
  mainContent: ContentLayout;
  breakpoints: Record<string, number>;
}

export interface SidebarLayout {
  isVisible: boolean;
  width: number;
  position: 'left' | 'right';
  collapsible: boolean;
  isCollapsed: boolean;
}

export interface HeaderLayout {
  isVisible: boolean;
  height: number;
  position: 'fixed' | 'static';
  transparent: boolean;
}

export interface FooterLayout {
  isVisible: boolean;
  height: number;
  position: 'fixed' | 'static';
}

export interface ContentLayout {
  padding: ThemeSpacing;
  maxWidth?: number;
  centered: boolean;
}

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  action: () => void;
  description: string;
  category: string;
  enabled: boolean;
  context?: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  value: any;
  placeholder?: string;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  validation: ValidationRule[];
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  cols?: number;
}

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
}

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  icon?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'achievement';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ModalType = 'info' | 'confirm' | 'prompt' | 'custom';
export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type DragType = 'item' | 'building' | 'npc' | 'panel' | 'custom';
export type DockSide = 'top' | 'bottom' | 'left' | 'right';
export type FormFieldType = 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'color' | 'range';
export type ValidationType = 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'custom';

// Import shared types
export type { Position } from './game';
