
import { useEffect, useRef, RefObject } from 'react';

interface UseClickOutsideOptions {
  enabled?: boolean;
  ignoreElements?: (HTMLElement | null)[];
}

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  options: UseClickOutsideOptions = {}
): RefObject<T> => {
  const ref = useRef<T>(null);
  const { enabled = true, ignoreElements = [] } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside the ref element
      if (ref.current && ref.current.contains(target)) {
        return;
      }

      // Check if click is inside any ignored elements
      for (const element of ignoreElements) {
        if (element && element.contains(target)) {
          return;
        }
      }

      // Click is outside, call handler
      handler(event);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [handler, enabled, ignoreElements]);

  return ref;
};

export default useClickOutside;
