
import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseAsyncOptions<T> {
  immediate?: boolean;
  cache?: boolean;
  cacheKey?: string;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  executed: boolean;
}

export interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  retry: () => Promise<T>;
}

// Simple cache implementation
const cache = new Map<string, any>();

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> {
  const {
    immediate = false,
    cache: useCache = false,
    cacheKey,
    retry: maxRetries = 0,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    executed: false
  });

  const retryCountRef = useRef(0);
  const lastArgsRef = useRef<any[]>([]);
  const cancelledRef = useRef(false);

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    // Check cache first
    if (useCache && cacheKey && cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      setState(prev => ({
        ...prev,
        data: cachedData,
        loading: false,
        error: null,
        executed: true
      }));
      onSuccess?.(cachedData);
      return cachedData;
    }

    lastArgsRef.current = args;
    cancelledRef.current = false;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const data = await asyncFunction(...args);
      
      if (cancelledRef.current) {
        return data;
      }

      // Cache the result
      if (useCache && cacheKey) {
        cache.set(cacheKey, data);
      }

      setState({
        data,
        loading: false,
        error: null,
        executed: true
      });

      retryCountRef.current = 0;
      onSuccess?.(data);
      
      return data;
    } catch (error) {
      if (cancelledRef.current) {
        throw error;
      }

      const err = error instanceof Error ? error : new Error(String(error));

      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        if (!cancelledRef.current) {
          return execute(...args);
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: err,
        executed: true
      }));

      onError?.(err);
      throw err;
    }
  }, [asyncFunction, useCache, cacheKey, maxRetries, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    cancelledRef.current = true;
    setState({
      data: null,
      loading: false,
      error: null,
      executed: false
    });
    retryCountRef.current = 0;
  }, []);

  const retry = useCallback(() => {
    return execute(...lastArgsRef.current);
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    return () => {
      cancelledRef.current = true;
    };
  }, [immediate]);

  return {
    ...state,
    execute,
    reset,
    retry
  };
}
