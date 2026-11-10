import { useRef, useEffect, useCallback } from 'react';

/**
 * REF HOOK PERSONALIZADO: useRefFocus
 * Demuestra el uso de Refs en React para acceder directamente al nodo DOM,
 * enfocar elementos de entrada y persistir referencias sin re-renderizar.
 */
export function useRefFocus<T extends HTMLElement = HTMLInputElement>(focusOnMount = false) {
  const elementRef = useRef<T | null>(null);

  const focus = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.focus();
    }
  }, []);

  const select = useCallback(() => {
    if (elementRef.current && 'select' in elementRef.current) {
      (elementRef.current as any).select();
    }
  }, []);

  useEffect(() => {
    if (focusOnMount) {
      focus();
    }
  }, [focusOnMount, focus]);

  return { elementRef, focus, select };
}

