
import { useEffect, useRef, useState, RefObject } from 'react';

interface UseResizeObserverOptions {
  debounceMs?: number;
  enabled?: boolean;
}

interface ResizeObserverEntry {
  width: number;
  height: number;
  top: number;
  left: number;
}

export const useResizeObserver = <T extends HTMLElement = HTMLElement>(
  options: UseResizeObserverOptions = {}
): [RefObject<T>, ResizeObserverEntry | null] => {
  const { debounceMs = 0, enabled = true } = options;
  const ref = useRef<T>(null);
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const updateEntry = (entries: globalThis.ResizeObserverEntry[]) => {
      const resizeEntry = entries[0];
      if (!resizeEntry) return;

      const { width, height, top, left } = resizeEntry.contentRect;
      const newEntry = { width, height, top, left };

      if (debounceMs > 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setEntry(newEntry);
        }, debounceMs);
      } else {
        setEntry(newEntry);
      }
    };

    const resizeObserver = new ResizeObserver(updateEntry);
    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, debounceMs]);

  return [ref, entry];
};

export default useResizeObserver;
