import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook de Ref para enfocar automáticamente un elemento de entrada (input/select)
 * Demuestra el uso de `useRef` como hook de referencia al DOM.
 */
export function useFocusOnMount<T extends HTMLElement = HTMLInputElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return ref;
}

/**
 * Hook de Ref para impresión de comprobantes o captura directa del nodo DOM
 * Demuestra `useRef` en la manipulación e impresión de tickets térmicos.
 */
export function useTicketPrint() {
  const ticketRef = useRef<HTMLDivElement | null>(null);

  const printTicket = useCallback(() => {
    if (!ticketRef.current) return;

    const printContents = ticketRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impresión de Ticket TamboPOS</title>
          <style>
            body {
              font-family: 'JetBrains Mono', 'Courier New', monospace;
              width: 320px;
              margin: 10px auto;
              font-size: 12px;
              color: #111;
            }
            .ticket-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .ticket-title { font-weight: bold; font-size: 16px; margin: 0; }
            .ticket-row { display: flex; justify-content: space-between; margin: 3px 0; }
            .ticket-divider { border-top: 1px dashed #333; margin: 6px 0; }
            .ticket-total { font-weight: bold; font-size: 14px; }
            .ticket-footer { text-align: center; font-size: 10px; margin-top: 12px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  return { ticketRef, printTicket };
}

