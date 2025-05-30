
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, GAME_CONFIG } from '../../../shared/constants/game';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  priority: NotificationPriority;
  createdAt: number;
  actions?: NotificationAction[];
  persistent?: boolean;
  category?: string;
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  maxNotifications: number;
  enableSound: boolean;
  enablePersistence: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'priority'> & { priority?: NotificationPriority }) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  clearByCategory: (category: string) => void;
  markAsRead: (id: string) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  
  // Settings
  setMaxNotifications: (max: number) => void;
  toggleSound: () => void;
  togglePersistence: () => void;
  
  // Convenience methods
  showSuccess: (title: string, message?: string, options?: Partial<Notification>) => string;
  showError: (title: string, message?: string, options?: Partial<Notification>) => string;
  showWarning: (title: string, message?: string, options?: Partial<Notification>) => string;
  showInfo: (title: string, message?: string, options?: Partial<Notification>) => string;
  
  // Bulk operations
  clearOldNotifications: (olderThanMs: number) => void;
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByCategory: (category: string) => Notification[];
}

const DEFAULT_DURATIONS: Record<NotificationPriority, number> = {
  low: 3000,
  medium: 5000,
  high: 8000,
  critical: 0 // Never auto-dismiss
};

export const useNotificationStore = create<NotificationState>()(
  subscribeWithSelector((set, get) => ({
    notifications: [],
    maxNotifications: 10,
    enableSound: true,
    enablePersistence: false,

    addNotification: (notification) => {
      const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const priority = notification.priority || 'medium';
      const duration = notification.duration ?? DEFAULT_DURATIONS[priority];
      
      const newNotification: Notification = {
        ...notification,
        id,
        priority,
        duration,
        createdAt: Date.now(),
      };

      set(state => {
        let notifications = [...state.notifications, newNotification];
        
        // Sort by priority and creation time
        notifications.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          return priorityDiff !== 0 ? priorityDiff : b.createdAt - a.createdAt;
        });
        
        // Limit notifications
        if (notifications.length > state.maxNotifications) {
          // Remove oldest low priority notifications first
          const lowPriority = notifications.filter(n => n.priority === 'low');
          if (lowPriority.length > 0) {
            const toRemove = lowPriority[lowPriority.length - 1];
            notifications = notifications.filter(n => n.id !== toRemove.id);
          } else {
            notifications = notifications.slice(0, state.maxNotifications);
          }
        }
        
        return { notifications };
      });

      // Auto-remove after duration (if not persistent)
      if (duration > 0 && !newNotification.persistent) {
        setTimeout(() => {
          get().removeNotification(id);
        }, duration);
      }

      return id;
    },

    removeNotification: (id) => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    },

    clearAllNotifications: () => {
      set({ notifications: [] });
    },

    clearByCategory: (category) => {
      set(state => ({
        notifications: state.notifications.filter(n => n.category !== category),
      }));
    },

    markAsRead: (id) => {
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, metadata: { ...n.metadata, read: true } } : n
        ),
      }));
    },

    updateNotification: (id, updates) => {
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, ...updates } : n
        ),
      }));
    },

    setMaxNotifications: (max) => {
      set({ maxNotifications: Math.max(1, max) });
    },

    toggleSound: () => {
      set(state => ({ enableSound: !state.enableSound }));
    },

    togglePersistence: () => {
      set(state => ({ enablePersistence: !state.enablePersistence }));
    },

    showSuccess: (title, message = '', options = {}) => {
      return get().addNotification({
        type: 'success',
        title,
        message,
        priority: 'medium',
        ...options,
      });
    },

    showError: (title, message = '', options = {}) => {
      return get().addNotification({
        type: 'error',
        title,
        message,
        priority: 'high',
        duration: 8000,
        ...options,
      });
    },

    showWarning: (title, message = '', options = {}) => {
      return get().addNotification({
        type: 'warning',
        title,
        message,
        priority: 'medium',
        ...options,
      });
    },

    showInfo: (title, message = '', options = {}) => {
      return get().addNotification({
        type: 'info',
        title,
        message,
        priority: 'low',
        ...options,
      });
    },

    clearOldNotifications: (olderThanMs) => {
      const cutoff = Date.now() - olderThanMs;
      set(state => ({
        notifications: state.notifications.filter(n => n.createdAt > cutoff),
      }));
    },

    getNotificationsByType: (type) => {
      return get().notifications.filter(n => n.type === type);
    },

    getNotificationsByCategory: (category) => {
      return get().notifications.filter(n => n.category === category);
    },
  }))
);

// Cleanup old notifications periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useNotificationStore.getState();
    store.clearOldNotifications(24 * 60 * 60 * 1000); // 24 hours
  }, 60 * 60 * 1000); // Every hour
}
