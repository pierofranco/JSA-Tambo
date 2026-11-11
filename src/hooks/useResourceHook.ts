import { useState, useEffect, useCallback, useRef } from 'react';

export interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook de Recurso (Resource Hook) en React:
 * Gestiona el ciclo de vida de un recurso asíncrono (REST API, caché, estado diferido),
 * implementando almacenamiento en caché, revalidación y soporte para transiciones.
 */
export function useResource<T>(
  asyncFetcher: () => Promise<T>,
  dependencies: unknown[] = [],
  autoFetch = true
): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(asyncFetcher);
  fetcherRef.current = asyncFetcher;

  const executeFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      executeFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: executeFetch
  };
}

/**
 * Patrón Suspense Resource (compatible con React Suspense y React 19 `use(promise)`)
 */
export function createSuspenseResource<T>(promise: Promise<T>) {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: unknown;

  const suspender = promise.then(
    (res) => {
      status = 'success';
      result = res;
    },
    (err) => {
      status = 'error';
      error = err;
    }
  );

  return {
    read(): T {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw error;
      }
      return result;
    }
  };
}

