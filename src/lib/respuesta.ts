import type { Context } from "hono";

/**
 * Formato único de respuesta del ecosistema:
 * { exito, datos, meta, error }
 */
export function ok(c: Context, datos: unknown, meta: unknown = null, status = 200) {
  return c.json({ exito: true, datos, meta, error: null }, status as any);
}

export function fallo(
  c: Context,
  codigo: string,
  mensaje: string,
  status = 400,
) {
  return c.json(
    { exito: false, datos: null, meta: null, error: { codigo, mensaje } },
    status as any,
  );
}

/** Error controlado que el manejador global traduce a JSON. */
export class HttpError extends Error {
  status: number;
  codigo: string;

  constructor(status: number, codigo: string, mensaje: string) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
  }
}

export function exigir(condicion: unknown, status: number, codigo: string, mensaje: string) {
  if (!condicion) throw new HttpError(status, codigo, mensaje);
}
