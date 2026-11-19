/**
 * Utilidades criptográficas. Todo con WebCrypto (sin dependencias).
 *
 * Nota sobre PBKDF2: el plan gratuito de Workers limita el CPU por petición,
 * por eso el número de iteraciones es configurable con PBKDF2_ITERACIONES.
 * Con plan pagado se recomienda subirlo a 600000.
 */

const codificador = new TextEncoder();
const ITER_DEFECTO = 15000;

// ---------------------------------------------------------------- base64url
export function bytesAB64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlABytes(texto: string): Uint8Array {
  let b = texto.replace(/-/g, "+").replace(/_/g, "/");
  while (b.length % 4) b += "=";
  const bin = atob(b);
  const salida = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) salida[i] = bin.charCodeAt(i);
  return salida;
}

export function bytesAHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ------------------------------------------------------------------- hashes
export async function sha256Hex(texto: string | Uint8Array): Promise<string> {
  const datos = typeof texto === "string" ? codificador.encode(texto) : texto;
  const hash = await crypto.subtle.digest("SHA-256", datos as BufferSource);
  return bytesAHex(new Uint8Array(hash));
}

export async function sha256Bytes(bytes: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return new Uint8Array(hash);
}

/** Comparación en tiempo constante. */
export function compararSeguro(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a[i] ^ b[i];
  return diferencia === 0;
}

export function compararTextoSeguro(a: string, b: string): boolean {
  return compararSeguro(codificador.encode(a), codificador.encode(b));
}

// ------------------------------------------------- código de seguimiento
// Alfabeto Crockford: sin I, L, O ni U para evitar confusiones al transcribir.
const ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** 20 caracteres = 100 bits de entropía. Formato XXXX-XXXX-XXXX-XXXX-XXXX */
export function generarCodigo(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let crudo = "";
  for (let i = 0; i < 20; i++) crudo += ALFABETO[bytes[i] % 32];
  return crudo.match(/.{4}/g)!.join("-");
}

/** Normaliza lo que escribe el usuario (tolera guiones, espacios y confusiones). */
export function normalizarCodigo(entrada: string): string {
  return (entrada || "")
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
}

export async function hashCodigo(entrada: string): Promise<string> {
  return sha256Hex("codigo:" + normalizarCodigo(entrada));
}

// ------------------------------------------------------------- contraseñas
async function pbkdf2(clave: string, sal: Uint8Array, iteraciones: number): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey(
    "raw",
    codificador.encode(clave) as BufferSource,
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: sal as BufferSource, iterations: iteraciones },
    material,
    256,
  );
  return new Uint8Array(bits);
}

export function iteracionesPbkdf2(env?: string): number {
  const n = Number(env);
  return Number.isFinite(n) && n >= 1000 && n <= 2_000_000 ? Math.floor(n) : ITER_DEFECTO;
}

/** Formato: pbkdf2$<iteraciones>$<sal b64url>$<hash b64url> */
export async function hashClave(clave: string, iteraciones = ITER_DEFECTO): Promise<string> {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const bits = await pbkdf2(clave, sal, iteraciones);
  return `pbkdf2$${iteraciones}$${bytesAB64url(sal)}$${bytesAB64url(bits)}`;
}

export async function verificarClave(clave: string, almacenado: string): Promise<boolean> {
  try {
    const [algoritmo, iter, sal, hash] = (almacenado || "").split("$");
    if (algoritmo !== "pbkdf2" || !sal || !hash) return false;
    const bits = await pbkdf2(clave, b64urlABytes(sal), Number(iter));
    return compararSeguro(bits, b64urlABytes(hash));
  } catch {
    return false;
  }
}

// --------------------------------------------------- firma de sesión local
async function claveHmac(secreto: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    codificador.encode(secreto) as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function firmarTexto(payload: string, secreto: string): Promise<string> {
  const firma = await crypto.subtle.sign("HMAC", await claveHmac(secreto), codificador.encode(payload) as BufferSource);
  return bytesAB64url(new Uint8Array(firma));
}

export async function verificarFirma(payload: string, firma: string, secreto: string): Promise<boolean> {
  const esperada = await firmarTexto(payload, secreto);
  return compararTextoSeguro(esperada, firma);
}

/** Token opaco: base64url(JSON).firma */
export async function firmarJSON(objeto: unknown, secreto: string): Promise<string> {
  const payload = bytesAB64url(codificador.encode(JSON.stringify(objeto)));
  return `${payload}.${await firmarTexto(payload, secreto)}`;
}

export async function abrirFirmado<T>(token: string, secreto: string): Promise<T | null> {
  const partes = (token || "").split(".");
  if (partes.length !== 2) return null;
  if (!(await verificarFirma(partes[0], partes[1], secreto))) return null;
  try {
    const json = new TextDecoder().decode(b64urlABytes(partes[0]));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/** Clave anónima y efímera para límites en memoria (nunca se guarda en D1). */
export async function claveAnonima(valor: string, sal: string, fecha: string): Promise<string> {
  return sha256Hex(`${sal}|${fecha}|${valor}`);
}
