
import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  enabled?: boolean;
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = <T extends HTMLElement = HTMLElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, IntersectionObserverEntry | null] => {
  const {
    enabled = true,
    freezeOnceVisible = false,
    threshold = 0,
    root = null,
    rootMargin = '0%',
    ...restOptions
  } = options;

  const ref = useRef<T>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    if (!enabled || frozen || !ref.current) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      setEntry(entries[0]);
    };

    const observerOptions = {
      threshold,
      root,
      rootMargin,
      ...restOptions
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [enabled, frozen, threshold, root, rootMargin, restOptions]);

  return [ref, entry];
};

export default useIntersectionObserver;
