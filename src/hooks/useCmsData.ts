/**
 * Custom hook for fetching CMS data with loading and error states
 */

import { useState, useEffect } from 'react';

interface UseCmsDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useCmsData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): UseCmsDataState<T> {
  const [state, setState] = useState<UseCmsDataState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await fetchFn();
        if (isMounted) {
          setState({
            data: result,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (isMounted) {
          let readableMessage = 'Failed to load content.';

          if (err instanceof Error && err.message) {
            readableMessage = err.message;
          } else if (typeof err === 'string') {
            readableMessage = err;
          } else if (err && typeof err === 'object') {
            const maybeErr = err as any;
            readableMessage =
              maybeErr?.message ||
              maybeErr?.error?.message ||
              maybeErr?.response?.data?.error?.message ||
              maybeErr?.response?.data?.message ||
              readableMessage;
          }

          const error = new Error(readableMessage);
          setState({
            data: null,
            loading: false,
            error,
          });
          console.error('CMS data fetch error:', error);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return state;
}
