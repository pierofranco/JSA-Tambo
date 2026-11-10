import { useState, useEffect, useCallback, useRef } from 'react';

export interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  timestamp: Date | null;
  reload: () => Promise<void>;
  mutate: (newData: T | ((prev: T | null) => T)) => void;
}

/**
 * RESOURCE HOOK
 * Patrón moderno para la carga declarativa y gestión del ciclo de vida
 * de recursos asíncronos (REST, caché, APIs) en React.
 */
export function useResource<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  options: { immediate?: boolean; initialData?: T } = { immediate: true }
): ResourceState<T> {
  const [data, setData] = useState<T | null>(options.initialData ?? null);
  const [loading, setLoading] = useState<boolean>(options.immediate ?? true);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<Date | null>(null);

  // Ref Hook para evitar condiciones de carrera si el componente se desmonta
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (isMounted.current) {
        setData(result);
        setTimestamp(new Date());
        setLoading(false);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || 'Error al cargar el recurso');
        setLoading(false);
      }
    }
  }, dependencies);

  useEffect(() => {
    if (options.immediate !== false) {
      loadData();
    }
  }, [loadData]);

  const mutate = useCallback((newData: T | ((prev: T | null) => T)) => {
    setData(prev => (typeof newData === 'function' ? (newData as any)(prev) : newData));
  }, []);

  return {
    data,
    loading,
    error,
    timestamp,
    reload: loadData,
    mutate
  };
}

