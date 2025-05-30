import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '../lib/stores/useNotificationStore';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration: number;
  timestamp: number;
  icon?: string;
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  style: 'primary' | 'secondary' | 'danger';
}

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getNotificationIcon = (type: string, customIcon?: string) => {
    if (customIcon) return customIcon;

    const iconMap: Record<string, string> = {
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle',
      info: 'fa-info-circle'
    };

    return iconMap[type] || 'fa-bell';
  };

  const getNotificationStyle = (type: string) => {
    const styleMap: Record<string, string> = {
      success: 'border-l-green-500 bg-green-50/90 text-green-800',
      warning: 'border-l-yellow-500 bg-yellow-50/90 text-yellow-800',
      error: 'border-l-red-500 bg-red-50/90 text-red-800',
      info: 'border-l-blue-500 bg-blue-50/90 text-blue-800'
    };

    return styleMap[type] || 'border-l-gray-500 bg-gray-50/90 text-gray-800';
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actions && notification.actions.length === 1) {
      notification.actions[0].action();
      removeNotification(notification.id);
    }
  };

  const handleActionClick = (action: NotificationAction, notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    action.action();
    removeNotification(notificationId);
  };

  const handleDismiss = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeNotification(notificationId);
  };

  if (!mounted) return null;

  return (
    <div className="notification-container fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            notification pointer-events-auto transform transition-all duration-300 ease-out
            ${getNotificationStyle(notification.type)}
            bg-white/95 backdrop-blur-lg border-l-4 rounded-lg shadow-lg p-4
            hover:shadow-xl hover:scale-105 cursor-pointer
            animate-slideInRight
          `}
          onClick={() => handleNotificationClick(notification)}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <i 
                className={`fa-solid ${getNotificationIcon(notification.type, notification.icon)} text-lg`}
                aria-hidden="true"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm leading-tight">
                    {notification.title}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {notification.message}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={(e) => handleDismiss(notification.id, e)}
                  className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-black/10 
                           flex items-center justify-center transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current"
                  aria-label="Fechar notificação"
                >
                  <i className="fa-solid fa-times text-xs opacity-60 hover:opacity-100"></i>
                </button>
              </div>

              {/* Actions */}
              {notification.actions && notification.actions.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {notification.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={(e) => handleActionClick(action, notification.id, e)}
                      className={`
                        px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-1
                        ${action.style === 'primary' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
                          : action.style === 'danger'
                          ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500'
                        }
                      `}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar for timed notifications */}
          {notification.duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
              <div 
                className="h-full bg-current opacity-30 animate-shrinkWidth"
                style={{
                  animationDuration: `${notification.duration}ms`,
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards'
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;