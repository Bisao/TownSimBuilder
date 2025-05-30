
import { useState, useEffect, useCallback } from 'react';

interface UseIsMobileOptions {
  breakpoint?: number;
  debounceMs?: number;
}

interface UseIsMobileReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  orientation: 'portrait' | 'landscape';
}

export const useIsMobile = (options: UseIsMobileOptions = {}): UseIsMobileReturn => {
  const { breakpoint = 768, debounceMs = 100 } = options;
  
  const [state, setState] = useState<UseIsMobileReturn>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        orientation: 'landscape'
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width < breakpoint,
      isTablet: width >= breakpoint && width < 1024,
      isDesktop: width >= 1024,
      screenWidth: width,
      orientation: width > height ? 'landscape' : 'portrait'
    };
  });

  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setState({
      isMobile: width < breakpoint,
      isTablet: width >= breakpoint && width < 1024,
      isDesktop: width >= 1024,
      screenWidth: width,
      orientation: width > height ? 'landscape' : 'portrait'
    });
  }, [breakpoint]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateState, debounceMs);
    };

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const orientationQuery = window.matchMedia('(orientation: portrait)');

    // Add listeners
    window.addEventListener('resize', handleResize);
    mediaQuery.addEventListener('change', updateState);
    orientationQuery.addEventListener('change', updateState);

    // Initial update
    updateState();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', updateState);
      orientationQuery.removeEventListener('change', updateState);
    };
  }, [updateState, breakpoint, debounceMs]);

  return state;
};

export default useIsMobile;
