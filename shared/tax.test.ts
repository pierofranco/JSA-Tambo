import { describe, it, expect } from 'vitest';
import { calcularImpuestoDesdeTotal, IGV_RATE } from './tax';

describe('calcularImpuestoDesdeTotal', () => {
  it('extrae el IGV correcto de un total que ya lo incluye (18/118, no total*18%)', () => {
    expect(calcularImpuestoDesdeTotal(9.8)).toEqual({ base: 8.31, igv: 1.49 });
    expect(calcularImpuestoDesdeTotal(166.2)).toEqual({ base: 140.85, igv: 25.35 });
    expect(calcularImpuestoDesdeTotal(69.6)).toEqual({ base: 58.98, igv: 10.62 });
  });

  it('nunca produce lo que daría la fórmula incorrecta (total * 18%)', () => {
    const { igv } = calcularImpuestoDesdeTotal(9.8);
    expect(igv).not.toBeCloseTo(9.8 * IGV_RATE, 2);
  });

  it('base + igv siempre suma exactamente el total (redondeo consistente)', () => {
    const casos = [0.01, 1, 4.9, 9.8, 10, 18.9, 43.8, 69.6, 100, 166.2, 999.99];
    for (const total of casos) {
      const { base, igv } = calcularImpuestoDesdeTotal(total);
      expect(Math.round((base + igv) * 100) / 100).toBe(Math.round(total * 100) / 100);
    }
  });

  it('total 0 o negativo devuelve base e igv en 0 (sin dividir entre cero ni valores negativos)', () => {
    expect(calcularImpuestoDesdeTotal(0)).toEqual({ base: 0, igv: 0 });
    expect(calcularImpuestoDesdeTotal(-5)).toEqual({ base: 0, igv: 0 });
  });

  it('redondea a 2 decimales', () => {
    const { base, igv } = calcularImpuestoDesdeTotal(33.33);
    expect(Number.isInteger(base * 100)).toBe(true);
    expect(Number.isInteger(igv * 100)).toBe(true);
  });
});
