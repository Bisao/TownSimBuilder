
import { create } from 'zustand';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, GAME_CONFIG } from '../../../shared/constants/game';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  createdAt: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

interface NotificationState {
  notifications: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Convenience methods
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: Date.now(),
      duration: notification.duration || GAME_CONFIG.NOTIFICATION_DURATION,
    };

    set(state => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  showSuccess: (title, message = '') => {
    get().addNotification({
      type: 'success',
      title,
      message,
    });
  },

  showError: (title, message = '') => {
    get().addNotification({
      type: 'error',
      title,
      message,
      duration: 5000, // Errors stay longer
    });
  },

  showWarning: (title, message = '') => {
    get().addNotification({
      type: 'warning',
      title,
      message,
    });
  },

  showInfo: (title, message = '') => {
    get().addNotification({
      type: 'info',
      title,
      message,
    });
  },
}));
