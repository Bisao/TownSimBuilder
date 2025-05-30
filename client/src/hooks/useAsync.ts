
import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useAsync = <T, Args extends any[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions = {}
) => {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const mountedRef = useRef(true);
  const lastCallIdRef = useRef(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: Args) => {
      const callId = ++lastCallIdRef.current;
      
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFunction(...args);
        
        if (mountedRef.current && callId === lastCallIdRef.current) {
          setState({ data, loading: false, error: null });
          onSuccess?.(data);
        }
        
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (mountedRef.current && callId === lastCallIdRef.current) {
          setState({ data: null, loading: false, error: err });
          onError?.(err);
        }
        
        throw err;
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset
  };
};

export default useAsync;
