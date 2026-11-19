/** Entorno del Worker: bindings + variables + secretos. */
export interface Env {
  DB: D1Database;
  /** R2 (si está activo). */
  ADJUNTOS?: R2Bucket;
  /** KV como alternativa gratuita mientras R2 no esté disponible. */
  ADJUNTOS_KV?: KVNamespace;
  ASSETS: Fetcher;

  SIA_URL: string;
  SIA_USUARIO: string;
  SIA_CLAVE: string;

  SESSION_SECRET: string;
  ANON_SALT: string;

  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET?: string;

  ENTORNO?: string;
  PBKDF2_ITERACIONES?: string;
  LIMITE_QUEJAS_HORA?: string;
  LIMITE_LOGIN_INTENTOS?: string;
}

/** Claims que usamos del JWT del SIA. */
export interface ClaimsSIA {
  sub: number;
  ci?: string;
  nombre?: string;
  roles: Record<string, string>;
  cargos: string[];
  exp: number;
}

/** Sesión de las cuentas locales del Buzón (ADMIN_TECNICO / COMITE). */
export interface SesionLocal {
  uid: number;
  rol: "ADMIN_TECNICO" | "COMITE";
  nombre: string;
  exp: number;
}

export interface Variables {
  claims: ClaimsSIA;
  local: SesionLocal;
}

export type Contexto = {
  Bindings: Env;
  Variables: Variables;
};
