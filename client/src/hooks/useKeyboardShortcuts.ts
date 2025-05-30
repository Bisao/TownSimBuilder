
import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

interface UseKeyboardShortcutsOptions {
  target?: HTMLElement | Window | null;
  enabled?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { target = window, enabled = true } = options;
  const shortcutsRef = useRef(shortcuts);
  const enabledRef = useRef(enabled);

  // Update refs when props change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabledRef.current) return;

    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = (shortcut.ctrl ?? false) === (event.ctrlKey || event.metaKey);
      const altMatch = (shortcut.alt ?? false) === event.altKey;
      const shiftMatch = (shortcut.shift ?? false) === event.shiftKey;
      const metaMatch = (shortcut.meta ?? false) === event.metaKey;

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      if (matchingShortcut.stopPropagation !== false) {
        event.stopPropagation();
      }
      matchingShortcut.action(event);
    }
  }, []);

  useEffect(() => {
    const currentTarget = target || window;
    
    if (currentTarget && enabled) {
      currentTarget.addEventListener('keydown', handleKeyDown as EventListener);
      
      return () => {
        currentTarget.removeEventListener('keydown', handleKeyDown as EventListener);
      };
    }
  }, [target, enabled, handleKeyDown]);
};

export default useKeyboardShortcuts;
