/**
 * Almacenamiento de evidencias.
 *
 * Usa R2 si el binding ADJUNTOS está configurado (recomendado en producción)
 * o KV como alternativa gratuita (no requiere método de pago).
 * El contenido siempre se guarda con nombre aleatorio y sin metadatos.
 */
import type { Env } from "./tipos";

/** ¿Hay algún almacenamiento de adjuntos disponible? */
export function hayAlmacen(env: Env): boolean {
  return Boolean(env.ADJUNTOS || env.ADJUNTOS_KV);
}

/** Guarda una evidencia ya limpia de metadatos. */
export async function guardarAdjunto(
  env: Env,
  ruta: string,
  bytes: Uint8Array,
  mime: string,
): Promise<void> {
  if (env.ADJUNTOS) {
    await env.ADJUNTOS.put(ruta, bytes, { httpMetadata: { contentType: mime } });
    return;
  }

  if (!env.ADJUNTOS_KV) {
    throw new Error("No hay almacenamiento de adjuntos configurado.");
  }

  // KV no admite httpMetadata; el MIME real vive en la tabla buz_adjuntos.
  await env.ADJUNTOS_KV.put(ruta, bytes, { metadata: { mime } });
}

export interface AdjuntoLeido {
  cuerpo: ReadableStream | ArrayBuffer;
}

/** Lee una evidencia; devuelve null si no existe. */
export async function leerAdjunto(env: Env, ruta: string): Promise<AdjuntoLeido | null> {
  if (env.ADJUNTOS) {
    const objeto = await env.ADJUNTOS.get(ruta);
    if (!objeto) return null;
    return { cuerpo: objeto.body };
  }

  if (!env.ADJUNTOS_KV) return null;

  const datos = await env.ADJUNTOS_KV.get(ruta, "arrayBuffer");
  if (!datos) return null;
  return { cuerpo: datos };
}

/** Borra una evidencia; nunca lanza error. */
export async function borrarAdjunto(env: Env, ruta: string): Promise<void> {
  if (env.ADJUNTOS) {
    await env.ADJUNTOS.delete(ruta).catch(() => {});
    return;
  }

  if (env.ADJUNTOS_KV) {
    await env.ADJUNTOS_KV.delete(ruta).catch(() => {});
  }
}
