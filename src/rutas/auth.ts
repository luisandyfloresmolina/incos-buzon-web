/** Login de autoridades (SIA) y de cuentas locales del Buzón. */
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { limitar } from "../lib/limites";
import { exigir, fallo, ok } from "../lib/respuesta";
import {
  auditar,
  borrarSesion,
  borrarSesionLocal,
  borrarTokenSIA,
  COOKIE_SIA,
  guardarTokenSIA,
  iniciarSesionLocal,
  leerSesionLocal,
} from "../lib/sesion";
import { autoridades, loginSIA, verificarTokenSIA } from "../lib/sia";
import { verificarClave } from "../lib/cripto";
import type { Contexto, SesionLocal } from "../lib/tipos";

const auth = new Hono<Contexto>();

/** Perfil que devuelve el acceso único: sirve para decidir qué panel mostrar. */
interface PerfilEntrada {
  tipo: "AUTORIDAD" | "ADMIN" | "COMITE";
  nombre: string;
  rol?: string;
  cargos?: string[];
  persona?: { id: number; ci?: string; nombres?: string; apellidos?: string };
}

async function intentarCuentaLocal(
  c: any,
  correo: string,
  clave: string,
): Promise<PerfilEntrada | null> {
  if (!correo.includes("@")) return null;

  const usuario = await c.env.DB.prepare(
    `SELECT id, nombres, apellidos, clave_hash, rol, activo
       FROM buz_usuarios WHERE correo_electronico = ?`,
  )
    .bind(correo.toLowerCase())
    .first();

  const valido = usuario?.activo && (await verificarClave(clave, usuario.clave_hash));
  if (!valido) return null;

  const sesion: SesionLocal = {
    uid: Number(usuario.id),
    rol: usuario.rol,
    nombre: `${usuario.nombres} ${usuario.apellidos}`.trim(),
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
  };
  await iniciarSesionLocal(c, sesion);
  borrarTokenSIA(c);
  await auditar(c.env, {
    usuarioId: sesion.uid,
    accion: "LOGIN_OK",
    entidad: "cuenta_local",
  });

  return {
    tipo: sesion.rol === "COMITE" ? "COMITE" : "ADMIN",
    nombre: sesion.nombre,
    rol: sesion.rol,
  };
}

async function intentarAutoridad(
  c: any,
  identificador: string,
  clave: string,
): Promise<PerfilEntrada | null> {
  try {
    const datos = await loginSIA(c.env, identificador, clave);
    if (!datos.roles?.BUZON) return null;

    const vigentes = await autoridades(c.env);
    const nombres = new Set(vigentes.map((a) => a.cargoNombre.toLowerCase()));
    const esAutoridad = (datos.cargos ?? []).some((cargo) =>
      nombres.has(String(cargo).toLowerCase()),
    );
    if (!esAutoridad) return null;

    guardarTokenSIA(c, datos.token);
    borrarSesionLocal(c);
    await auditar(c.env, {
      personaId: datos.persona?.id ?? null,
      accion: "LOGIN_OK",
      entidad: "autoridad",
    });

    return {
      tipo: "AUTORIDAD",
      nombre:
        [datos.persona?.nombres, datos.persona?.apellidos].filter(Boolean).join(" ").trim() ||
        "Autoridad",
      cargos: datos.cargos,
      persona: datos.persona,
    };
  } catch {
    return null;
  }
}

// -------------------------------------------------------- acceso único
auth.post("/entrar", async (c) => {
  const intentos = Number(c.env.LIMITE_LOGIN_INTENTOS ?? 10) || 10;
  if (!(await limitar(c, "login", intentos, 900))) {
    return fallo(c, "DEMASIADOS_INTENTOS", "Demasiados intentos. Espere 15 minutos.", 429);
  }

  const cuerpo = await c.req.json().catch(() => ({}));
  const identificador = String(cuerpo?.identificador ?? "").trim();
  const clave = String(cuerpo?.clave ?? "");

  exigir(identificador && clave, 400, "DATOS_INVALIDOS", "Ingrese su CI o correo y su clave.");

  // Siempre intentamos ambos métodos: primero la cuenta local, luego el SIA.
  // Esto funciona en cualquier entorno (local sin SIA, o producción con SIA).
  let perfil: PerfilEntrada | null = null;

  // 1. Intento de cuenta local (correo institucional)
  perfil = await intentarCuentaLocal(c, identificador, clave);
  if (perfil) {
    // Éxito: ya tenemos perfil, saltamos el intento SIA
  } else {
    // 2. Intento SIA (ci o correo institucional)
    perfil = await intentarAutoridad(c, identificador, clave);
  }

  if (!perfil) {
    await auditar(c.env, { accion: "LOGIN_FALLIDO", entidad: "acceso" });
    return fallo(c, "CREDENCIALES", "Identificador o clave incorrectos.", 401);
  }

  return ok(c, perfil);
});

/** Sesión actual, para que la pantalla única decida qué panel mostrar. */
auth.get("/perfil", async (c) => {
  const local = await leerSesionLocal(c);
  if (local) {
    return ok(c, {
      tipo: local.rol === "COMITE" ? "COMITE" : "ADMIN",
      nombre: local.nombre,
      rol: local.rol,
    });
  }

  const token = getCookie(c, COOKIE_SIA);
  if (!token) return fallo(c, "NO_AUTENTICADO", "Debe iniciar sesión.", 401);

  const claims = await verificarTokenSIA(c.env, token);
  if (!claims) return fallo(c, "NO_AUTENTICADO", "Sesión vencida o inválida.", 401);

  const vigentes = await autoridades(c.env);
  const nombres = new Set(vigentes.map((a) => a.cargoNombre.toLowerCase()));
  const esAutoridad = (claims.cargos ?? []).some((cargo) =>
    nombres.has(String(cargo).toLowerCase()),
  );
  if (!esAutoridad) {
    return fallo(c, "SIN_PERMISO", "Su cuenta no ocupa un cargo marcado como autoridad.", 403);
  }

  return ok(c, {
    tipo: "AUTORIDAD",
    nombre: claims.nombre ?? "Autoridad",
    cargos: claims.cargos,
    personaId: claims.sub,
  });
});

// --------------------------------------------------------- autoridad (SIA)
auth.post("/sia", async (c) => {
  const intentos = Number(c.env.LIMITE_LOGIN_INTENTOS ?? 10) || 10;
  if (!(await limitar(c, "login-sia", intentos, 900))) {
    return fallo(c, "DEMASIADOS_INTENTOS", "Demasiados intentos. Espere 15 minutos.", 429);
  }

  const cuerpo = await c.req.json().catch(() => ({}));
  const identificador = String(cuerpo?.identificador ?? "").trim();
  const clave = String(cuerpo?.clave ?? "");

  exigir(identificador && clave, 400, "DATOS_INVALIDOS", "Ingrese su CI o correo y su clave.");

  let datos;
  try {
    datos = await loginSIA(c.env, identificador, clave);
  } catch {
    await auditar(c.env, {
      accion: "LOGIN_FALLIDO",
      entidad: "autoridad",
    });
    return fallo(
      c,
      "CREDENCIALES",
      "Identificador o clave incorrectos, o el SIA no está disponible.",
      401,
    );
  }

  if (!datos.roles?.BUZON) {
    return fallo(c, "SIN_PERMISO", "Su cuenta no tiene acceso al Buzón.", 403);
  }

  const vigentes = await autoridades(c.env);
  const nombres = new Set(vigentes.map((a) => a.cargoNombre.toLowerCase()));
  const esAutoridad = (datos.cargos ?? []).some((cargo) => nombres.has(String(cargo).toLowerCase()));
  if (!esAutoridad) {
    return fallo(c, "SIN_PERMISO", "Su cuenta no ocupa un cargo marcado como autoridad.", 403);
  }

  guardarTokenSIA(c, datos.token);
  await auditar(c.env, {
    personaId: datos.persona?.id ?? null,
    accion: "LOGIN_OK",
    entidad: "autoridad",
  });

  return ok(c, {
    persona: datos.persona,
    cargos: datos.cargos,
    expiraEn: datos.expiraEn,
  });
});

// ---------------------------------------------------------- cuenta local
auth.post("/local", async (c) => {
  const intentos = Number(c.env.LIMITE_LOGIN_INTENTOS ?? 10) || 10;
  if (!(await limitar(c, "login-local", intentos, 900))) {
    return fallo(c, "DEMASIADOS_INTENTOS", "Demasiados intentos. Espere 15 minutos.", 429);
  }

  const cuerpo = await c.req.json().catch(() => ({}));
  const correo = String(cuerpo?.correo ?? "").trim().toLowerCase();
  const clave = String(cuerpo?.clave ?? "");

  exigir(correo && clave, 400, "DATOS_INVALIDOS", "Ingrese su correo y su clave.");

  const usuario = await c.env.DB.prepare(
    `SELECT id, nombres, apellidos, clave_hash, rol, activo
       FROM buz_usuarios WHERE correo_electronico = ?`,
  )
    .bind(correo)
    .first<any>();

  const valido = usuario?.activo && (await verificarClave(clave, usuario.clave_hash));
  if (!valido) {
    await auditar(c.env, { accion: "LOGIN_FALLIDO", entidad: "cuenta_local" });
    return fallo(c, "CREDENCIALES", "Correo o clave incorrectos.", 401);
  }

  const sesion: SesionLocal = {
    uid: Number(usuario.id),
    rol: usuario.rol,
    nombre: `${usuario.nombres} ${usuario.apellidos}`.trim(),
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
  };
  await iniciarSesionLocal(c, sesion);
  await auditar(c.env, {
    usuarioId: sesion.uid,
    accion: "LOGIN_OK",
    entidad: "cuenta_local",
  });

  return ok(c, sesion);
});

auth.post("/salir", async (c) => {
  borrarSesion(c);
  return ok(c, { cerrado: true });
});

export default auth;
