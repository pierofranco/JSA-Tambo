/** Utilidades para filtrar ventas por rango de fechas (fecha viene como "DD/MM/YYYY"). */

export function parseFechaVenta(fecha: string): Date {
  const [d, m, y] = fecha.split('/').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function hoy(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function hoyMenosDias(dias: number): Date {
  const d = hoy();
  d.setDate(d.getDate() - dias);
  return d;
}

/** `desde`/`hasta` en formato yyyy-mm-dd: válido si no están invertidos (desde <= hasta). */
export function rangoFechasValido(desde: string, hasta: string): boolean {
  if (!desde || !hasta) return true;
  return desde <= hasta; // yyyy-mm-dd compara correctamente como string
}

/** `desde`/`hasta` en formato de <input type="date"> (yyyy-mm-dd) o cadena vacía. */
export function fechaVentaEnRango(fechaVenta: string, desde: string, hasta: string): boolean {
  if (!desde && !hasta) return true;
  const fecha = parseFechaVenta(fechaVenta);
  fecha.setHours(0, 0, 0, 0);
  if (desde) {
    const [y, m, d] = desde.split('-').map(Number);
    if (fecha < new Date(y, m - 1, d)) return false;
  }
  if (hasta) {
    const [y, m, d] = hasta.split('-').map(Number);
    if (fecha > new Date(y, m - 1, d)) return false;
  }
  return true;
}
