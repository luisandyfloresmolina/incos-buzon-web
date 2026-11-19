/**
 * Fechas del sistema. Bolivia no tiene horario de verano: se usa -04:00 fijo.
 * Las quejas solo guardan la FECHA (sin hora) a propósito.
 */

const OFFSET_MS = 4 * 60 * 60 * 1000;

/** ISO-8601 con offset de La Paz, p. ej. 2026-11-19T10:30:00-04:00 */
export function ahoraLaPaz(): string {
  return new Date(Date.now() - OFFSET_MS).toISOString().replace("Z", "-04:00");
}

/** Fecha local 'YYYY-MM-DD' (sin hora). */
export function hoyLaPaz(): string {
  return new Date(Date.now() - OFFSET_MS).toISOString().slice(0, 10);
}

/** Suma días a una fecha 'YYYY-MM-DD' y devuelve el mismo formato. */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(fecha + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Formato legible para pantalla: 19/11/2026 */
export function fechaLegible(fecha?: string | null): string {
  if (!fecha) return "—";
  const [a, m, d] = fecha.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}
