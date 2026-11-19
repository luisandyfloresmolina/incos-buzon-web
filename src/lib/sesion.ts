/**
 * Sesiones y permisos.
 *
 * Autoridades: el JWT del SIA viaja en una cookie httpOnly y se valida en
 * CADA petición con el JWKS (los permisos salen del claim `roles`, nunca de
 * la caché local). Cuentas locales: cookie firmada con HMAC.
 */
import { createMiddleware } from "hono/factory";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { ahoraLaPaz } from "./fecha";
import { abrirFirmado, firmarJSON } from "./cripto";
import { exigir } from "./respuesta";
import { autoridades, verificarTokenSIA } from "./sia";
import type { Contexto, Env, SesionLocal } from "./tipos";

export const COOKIE_SIA = "buz_sia";
export const COOKIE_LOCAL = "buz_local";
const DURACION = 8 * 60 * 60; // 8 horas, igual que el token del SIA

const opcionesCookie = {
  httpOnly: true,
  secure: true,
  sameSite: "Strict" as const,
  path: "/",
  maxAge: DURACION,
};

// ------------------------------------------------------------- autoridades
export function guardarTokenSIA(c: any, token: string) {
  setCookie(c, COOKIE_SIA, token, opcionesCookie);
}

export function borrarSesion(c: any) {
  deleteCookie(c, COOKIE_SIA, { path: "/" });
  deleteCookie(c, COOKIE_LOCAL, { path: "/" });
}

export function borrarTokenSIA(c: any) {
  deleteCookie(c, COOKIE_SIA, { path: "/" });
}

export function borrarSesionLocal(c: any) {
  deleteCookie(c, COOKIE_LOCAL, { path: "/" });
}

export const soloAutoridad = createMiddleware<Contexto>(async (c, next) => {
  const token = getCookie(c, COOKIE_SIA);
  exigir(token, 401, "NO_AUTENTICADO", "Debe iniciar sesión con el SIA.");

  const claims = await verificarTokenSIA(c.env, token!);
  exigir(claims, 401, "TOKEN_INVALIDO", "Sesión vencida o inválida. Vuelva a ingresar.");

  // Debe ocupar un cargo marcado como autoridad en el SIA.
  const vigentes = await autoridades(c.env);
  const nombres = new Set(vigentes.map((a) => a.cargoNombre.toLowerCase()));
  const esAutoridad = (claims!.cargos ?? []).some((cargo) =>
    nombres.has(String(cargo).toLowerCase()),
  );
  exigir(
    esAutoridad,
    403,
    "SIN_PERMISO",
    "Su cuenta no ocupa un cargo marcado como autoridad.",
  );

  c.set("claims", claims!);
  await next();
});

// ------------------------------------------------------------ cuentas locales
export async function iniciarSesionLocal(c: any, sesion: SesionLocal) {
  setCookie(c, COOKIE_LOCAL, await firmarJSON(sesion, c.env.SESSION_SECRET), opcionesCookie);
}

export async function leerSesionLocal(c: any): Promise<SesionLocal | null> {
  const token = getCookie(c, COOKIE_LOCAL);
  if (!token) return null;
  const sesion = await abrirFirmado<SesionLocal>(token, c.env.SESSION_SECRET);
  if (!sesion) return null;
  if (!sesion.exp || sesion.exp < Math.floor(Date.now() / 1000)) return null;
  return sesion;
}

/** Middleware para roles locales: ADMIN_TECNICO, COMITE o ambos. */
export function soloLocal(roles: Array<SesionLocal["rol"]>) {
  return createMiddleware<Contexto>(async (c, next) => {
    const sesion = await leerSesionLocal(c);
    exigir(sesion, 401, "NO_AUTENTICADO", "Debe iniciar sesión.");
    exigir(
      roles.includes(sesion!.rol),
      403,
      "SIN_PERMISO",
      "No tiene permiso para esta operación.",
    );
    c.set("local", sesion!);
    await next();
  });
}

// ---------------------------------------------------------------- auditoría
export async function auditar(
  env: Env,
  datos: {
    usuarioId?: number | null;
    personaId?: number | null;
    accion: string;
    entidad?: string | null;
    entidadId?: number | null;
  },
): Promise<void> {
  try {
    await env.DB.prepare(
      `INSERT INTO buz_auditoria (usuario_id, persona_id, accion, entidad, entidad_id, fecha_hora)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        datos.usuarioId ?? null,
        datos.personaId ?? null,
        datos.accion,
        datos.entidad ?? null,
        datos.entidadId ?? null,
        ahoraLaPaz(),
      )
      .run();
  } catch {
    // La auditoría nunca debe tumbar la operación principal.
  }
}
