
// Game stores
export { useGame } from './useGame';
export { useAudio } from './useAudio';
export { useNotificationStore } from './useNotificationStore';
export { useValidationStore } from './useValidationStore';

// Store types
export type { GamePhase, PlayerData } from './useGame';
export type { Notification, NotificationAction } from './useNotificationStore';
export type { ValidationRule, ValidationError } from './useValidationStore';

// Store utilities
export const createStoreSelector = <T, R>(
  store: () => T,
  selector: (state: T) => R
) => {
  return () => selector(store());
};

export const createStoreActions = <T>(
  store: () => T & { [key: string]: (...args: any[]) => any }
) => {
  return (actionNames: string[]) => {
    const actions: Record<string, (...args: any[]) => any> = {};
    const state = store();
    
    actionNames.forEach(name => {
      if (typeof state[name] === 'function') {
        actions[name] = state[name];
      }
    });
    
    return actions;
  };
};
