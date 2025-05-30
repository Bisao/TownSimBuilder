
import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

interface UseLocalStorageOptions {
  serializer?: {
    parse: (value: string) => any;
    stringify: (value: any) => string;
  };
}

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, (value: SetValue<T>) => void, () => void] => {
  const { serializer = JSON } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? serializer.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serializer.stringify(valueToStore));
          
          // Dispatch a custom event to notify other instances
          window.dispatchEvent(
            new CustomEvent('local-storage', {
              detail: { key, newValue: valueToStore }
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serializer]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, newValue: null }
          })
        );
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(serializer.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.newValue ?? initialValue);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('local-storage', handleCustomStorageChange as EventListener);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('local-storage', handleCustomStorageChange as EventListener);
      };
    }
  }, [key, initialValue, serializer]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
