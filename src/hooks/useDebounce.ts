import { useState, useEffect } from 'react';

/**
 * STATE HOOK: useDebounce
 * Retrasa la actualización de un valor hasta que transcurra un tiempo determinado.
 * Ideal para búsquedas en tiempo real en catálogos.
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

