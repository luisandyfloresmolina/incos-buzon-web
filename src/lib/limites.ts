/**
 * Límite de envíos sin identificar al emisor.
 *
 * Se usa la Cache API del borde: es efímera y no se guarda nada en la base
 * de datos. La clave es un hash con sal rotativa diaria, así que no sirve
 * para correlacionar envíos entre días ni para recuperar una IP.
 */
import type { Context } from "hono";
import { claveAnonima } from "./cripto";
import { hoyLaPaz } from "./fecha";

export async function limitar(
  c: Context,
  etiqueta: string,
  max: number,
  ventanaSegundos: number,
): Promise<boolean> {
  try {
    const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("x-forwarded-for") ?? "sin-ip";
    const sal = (c.env as any).ANON_SALT ?? "sal";
    const clave = await claveAnonima(`${etiqueta}:${ip}`, sal, hoyLaPaz());

    const cache = (caches as any).default as Cache;
    const solicitud = new Request(`https://limite.interno/${clave}`, { method: "GET" });
    const previo = await cache.match(solicitud);
    const conteo = previo ? Number(await previo.text()) || 0 : 0;
    if (conteo >= max) return false;

    await cache.put(
      solicitud,
      new Response(String(conteo + 1), {
        headers: { "cache-control": `max-age=${ventanaSegundos}` },
      }),
    );
    return true;
  } catch {
    return true; // nunca bloquear por un fallo del limitador
  }
}

/** Verificación de Cloudflare Turnstile. Si no hay secreto, se omite (dev). */
export async function verificarCaptcha(
  c: Context,
  token: string | undefined,
): Promise<boolean> {
  const secreto = (c.env as any).TURNSTILE_SECRET as string | undefined;
  if (!secreto) return true;
  if (!token) return false;

  try {
    const cuerpo = new FormData();
    cuerpo.append("secret", secreto);
    cuerpo.append("response", token);
    // Deliberadamente NO enviamos remoteip: no queremos que Turnstile lo asocie.

    const respuesta = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: cuerpo, signal: AbortSignal.timeout(8000) },
    );
    const resultado = (await respuesta.json()) as { success?: boolean };
    return resultado.success === true;
  } catch {
    return false;
  }
}
