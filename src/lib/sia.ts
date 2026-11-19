/**
 * Integración con el SIA-INCOS.
 *
 * - Valida el JWT (RS256) con el JWKS público, cacheado.
 * - Usa una cuenta de servicio para consultar cargos cuando el denunciante
 *   envía la queja (en ese momento no hay ninguna autoridad conectada).
 * - Mantiene buz_cache_autoridades como respaldo de lectura si el SIA falla.
 */
import { decodeProtectedHeader, importJWK, jwtVerify } from "jose";
import type { ClaimsSIA, Env } from "./tipos";
import { ahoraLaPaz } from "./fecha";
import { b64urlABytes } from "./cripto";

export interface Autoridad {
  cargoId: number;
  cargoNombre: string;
  personaId: number | null;
  nombreCompleto: string;
}

interface RespuestaSIA<T> {
  exito: boolean;
  datos: T;
  meta: unknown;
  error: { codigo: string; mensaje: string } | null;
}

const base = (env: Env) => (env.SIA_URL || "").replace(/\/+$/, "");

async function apiSIA<T = any>(
  env: Env,
  ruta: string,
  opciones: { metodo?: string; cuerpo?: unknown; token?: string } = {},
): Promise<RespuestaSIA<T>> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opciones.token) headers.authorization = `Bearer ${opciones.token}`;

  const respuesta = await fetch(base(env) + ruta, {
    method: opciones.metodo ?? "GET",
    headers,
    body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
    signal: AbortSignal.timeout(8000),
  });

  if (!respuesta.ok) throw new Error(`SIA ${respuesta.status} en ${ruta}`);
  return (await respuesta.json()) as RespuestaSIA<T>;
}

// ------------------------------------------------------------------- JWKS
let cacheJwks: { claves: any[]; expira: number } | null = null;

async function obtenerJwks(env: Env): Promise<any[]> {
  const ahora = Date.now();
  if (cacheJwks && cacheJwks.expira > ahora) return cacheJwks.claves;

  const respuesta = await fetch(base(env) + "/.well-known/jwks.json", {
    signal: AbortSignal.timeout(8000),
  });
  if (!respuesta.ok) throw new Error(`JWKS ${respuesta.status}`);

  const cuerpo = (await respuesta.json()) as { keys?: any[] };
  const claves = cuerpo.keys ?? [];
  if (claves.length === 0) throw new Error("JWKS vacío");

  cacheJwks = { claves, expira: ahora + 60 * 60 * 1000 };
  return claves;
}

/**
 * El JWKS del SIA publica el campo `n` con la clave SPKI completa en base64
 * (no con el módulo RSA crudo como manda el estándar JWK). Se detecta y se
 * importa como SPKI; si algún día lo corrigen, se usa importJWK normal.
 */
async function importarClave(jwk: any): Promise<CryptoKey> {
  const der = b64urlABytes(String(jwk?.n ?? ""));
  if (der.length > 4 && der[0] === 0x30 && der[1] === 0x82) {
    return crypto.subtle.importKey(
      "spki",
      der as BufferSource,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
  }
  return (await importJWK(jwk, "RS256")) as CryptoKey;
}

/** Devuelve los claims si el token es válido y trae rol BUZON; si no, null. */
export async function verificarTokenSIA(env: Env, token: string): Promise<ClaimsSIA | null> {
  try {
    const cabecera = decodeProtectedHeader(token);
    const claves = await obtenerJwks(env);
    const jwk = claves.find((k) => k.kid === cabecera.kid) ?? claves[0];
    if (!jwk) return null;

    const clave = await importarClave(jwk);
    const { payload } = await jwtVerify(token, clave as any, {
      issuer: "sia-incos",
      algorithms: ["RS256"],
    });

    const roles = (payload.roles as Record<string, string>) ?? {};
    if (!roles.BUZON) return null;

    return {
      sub: Number(payload.sub),
      ci: payload.ci as string | undefined,
      nombre: payload.nombre as string | undefined,
      roles,
      cargos: (payload.cargos as string[]) ?? [],
      exp: Number(payload.exp ?? 0),
    };
  } catch (error) {
    console.error("FALLO_VERIFICACION_JWT", error instanceof Error ? error.message : error);
    return null;
  }
}

/** Login central del ecosistema (autoridades). Lanza si las credenciales fallan. */
export async function loginSIA(
  env: Env,
  identificador: string,
  clave: string,
): Promise<{
  token: string;
  expiraEn?: string;
  persona: { id: number; ci?: string; nombres?: string; apellidos?: string };
  roles: Record<string, string>;
  cargos: string[];
}> {
  const respuesta = await apiSIA<any>(env, "/api/v1/auth/ingresar", {
    metodo: "POST",
    cuerpo: { identificador, clave },
  });
  if (!respuesta?.datos?.token) {
    throw new Error(respuesta?.error?.mensaje ?? "Credenciales inválidas");
  }
  return respuesta.datos;
}

// ------------------------------------------------- token de servicio SIA
let cacheServicio: { token: string; expira: number } | null = null;

export async function tokenServicio(env: Env): Promise<string> {
  if (cacheServicio && cacheServicio.expira > Date.now()) return cacheServicio.token;

  let respuesta: RespuestaSIA<{ token: string; expiraEn?: string }>;
  try {
    respuesta = await apiSIA<{ token: string; expiraEn?: string }>(
      env,
      "/api/v1/auth/ingresar",
      {
        metodo: "POST",
        cuerpo: { identificador: env.SIA_USUARIO, clave: env.SIA_CLAVE },
      },
    );
  } catch (error) {
    console.error(
      "FALLO_TOKEN_SERVICIO_SIA",
      env.SIA_USUARIO,
      error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    );
    throw error;
  }

  const token = respuesta?.datos?.token;
  if (!token) throw new Error("El SIA no devolvió token de servicio");

  const expira = respuesta.datos.expiraEn
    ? new Date(respuesta.datos.expiraEn).getTime() - 60_000
    : Date.now() + 6 * 60 * 60 * 1000;

  cacheServicio = { token, expira };
  return token;
}

// ------------------------------------------------------------- autoridades
let cacheAutoridades: { datos: Autoridad[]; expira: number } | null = null;

function normalizar(datos: any[]): Autoridad[] {
  return (datos ?? []).map((c) => ({
    cargoId: Number(c.id),
    cargoNombre: String(c.nombre ?? ""),
    personaId: c?.persona?.id ? Number(c.persona.id) : null,
    nombreCompleto: c?.persona
      ? `${c.persona.nombres ?? ""} ${c.persona.apellidos ?? ""}`.trim()
      : "",
  }));
}

async function guardarCache(env: Env, datos: Autoridad[]): Promise<void> {
  if (datos.length === 0) return;
  const momento = ahoraLaPaz();

  // El SIA es la fuente de verdad: se reemplaza la caché completa para no
  // conservar cargos o personas que ya cambiaron (por ejemplo, tras un
  // reinicio de la base del SIA).
  await env.DB.batch([
    env.DB.prepare("DELETE FROM buz_cache_autoridades"),
    ...datos.map((a) =>
      env.DB.prepare(
        `INSERT INTO buz_cache_autoridades (cargo_id, persona_id, cargo_nombre, nombre_completo, actualizado_en)
         VALUES (?, ?, ?, ?, ?)`,
      ).bind(a.cargoId, a.personaId, a.cargoNombre, a.nombreCompleto, momento),
    ),
  ]);
}

async function leerCache(env: Env): Promise<Autoridad[]> {
  const fila = await env.DB.prepare(
    `SELECT cargo_id, persona_id, cargo_nombre, nombre_completo
       FROM buz_cache_autoridades ORDER BY cargo_nombre`,
  ).all<any>();

  return (fila.results ?? []).map((r) => ({
    cargoId: Number(r.cargo_id),
    cargoNombre: String(r.cargo_nombre),
    personaId: r.persona_id === null ? null : Number(r.persona_id),
    nombreCompleto: String(r.nombre_completo ?? ""),
  }));
}

/**
 * Autoridades vigentes según el SIA. Si el SIA no responde, devuelve la caché
 * local (modo lectura), tal como exige el contrato de integración.
 */
export async function autoridades(env: Env, forzar = false): Promise<Autoridad[]> {
  if (!forzar && cacheAutoridades && cacheAutoridades.expira > Date.now()) {
    return cacheAutoridades.datos;
  }

  try {
    const token = await tokenServicio(env);
    const respuesta = await apiSIA<any[]>(env, "/api/v1/cargos?autoridad=true", { token });
    const datos = normalizar(respuesta?.datos ?? []).filter((a) => a.personaId);
    await guardarCache(env, datos);
    cacheAutoridades = { datos, expira: Date.now() + 10 * 60 * 1000 };
    return datos;
  } catch (error) {
    console.error(
      "FALLO_AUTORIDADES_SIA",
      error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    );
    const datos = await leerCache(env);
    cacheAutoridades = { datos, expira: Date.now() + 60 * 1000 };
    return datos;
  }
}

/** Catálogo mínimo para el formulario: solo id y nombre del cargo. */
export async function cargosAutoridad(env: Env): Promise<{ id: number; nombre: string }[]> {
  const lista = await autoridades(env);
  return lista.map((a) => ({ id: a.cargoId, nombre: a.cargoNombre }));
}
