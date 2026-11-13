/**
 * Cálculo de IGV centralizado — usado tanto por el frontend (carrito, ticket)
 * como por el backend (al persistir una venta). Nunca se debe calcular el IGV
 * en más de un lugar: eso fue exactamente el bug original (IGV calculado como
 * total × 18%, cuando el total YA incluye el IGV).
 *
 * El precio mostrado al cliente (subtotalFinal / total a pagar) ya INCLUYE el
 * IGV. Para extraerlo: IGV = total × 18 / 118, base imponible = total − IGV.
 */
export const IGV_RATE = 0.18;

export interface ImpuestoCalculado {
  /** Base imponible (operación gravada), sin IGV. */
  base: number;
  /** IGV extraído del total. */
  igv: number;
}

/**
 * Calcula IGV y base imponible a partir de un total que YA INCLUYE IGV.
 * `igv` se redondea primero a 2 decimales, y `base` se obtiene restando ese
 * IGV ya redondeado del total (también redondeado) — así `base + igv` suma
 * siempre exactamente el total, sin importar el redondeo de cada parte por
 * separado.
 */
export function calcularImpuestoDesdeTotal(total: number): ImpuestoCalculado {
  const totalRedondeado = Math.round((total + Number.EPSILON) * 100) / 100;
  if (totalRedondeado <= 0) {
    return { base: 0, igv: 0 };
  }
  const igv = Math.round((totalRedondeado * IGV_RATE / (1 + IGV_RATE) + Number.EPSILON) * 100) / 100;
  const base = Math.round((totalRedondeado - igv + Number.EPSILON) * 100) / 100;
  return { base, igv };
}
