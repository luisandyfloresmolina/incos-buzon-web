import type { Env } from "./tipos";

export interface Parametros {
  plazoDias: number;
  maxAdjuntos: number;
  maxMB: number;
}

export async function parametros(env: Env): Promise<Parametros> {
  const fila = await env.DB.prepare(
    `SELECT plazo_atencion_dias, max_adjuntos, max_tamano_adjunto_mb
       FROM buz_parametros WHERE id = 1`,
  ).first<any>();

  return {
    plazoDias: Number(fila?.plazo_atencion_dias ?? 5),
    maxAdjuntos: Number(fila?.max_adjuntos ?? 3),
    maxMB: Number(fila?.max_tamano_adjunto_mb ?? 2),
  };
}
