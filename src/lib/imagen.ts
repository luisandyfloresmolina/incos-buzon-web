/**
 * Eliminación de metadatos de imágenes, en el servidor.
 *
 * Se reescriben los segmentos del archivo y se descartan EXIF, XMP, IPTC,
 * comentarios y marcas de tiempo. Nunca se conserva el nombre original.
 * Solo se aceptan JPEG y PNG (un PDF puede traer autor, software, etc.).
 */

export const TIPOS_PERMITIDOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

export function extensionPermitida(mime: string): string | null {
  return TIPOS_PERMITIDOS[mime] ?? null;
}

/** Comprueba que los bytes correspondan de verdad al tipo declarado. */
export function firmaValida(bytes: Uint8Array, mime: string): boolean {
  if (bytes.length < 2) return false;
  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8;
  }
  if (mime === "image/png") {
    if (bytes.length < 8) return false;
    return (
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
    );
  }
  return false;
}

function concatenar(partes: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const parte of partes) total += parte.length;
  const salida = new Uint8Array(total);
  let offset = 0;
  for (const parte of partes) {
    salida.set(parte, offset);
    offset += parte.length;
  }
  return salida;
}

// ------------------------------------------------------------------- JPEG
// Se conservan APP0 (JFIF), APP2 (perfil ICC) y APP14 (Adobe).
// Se descartan APP1 (EXIF/XMP), APP13 (IPTC), COM y demás APPn.
const MARCAS_JPEG_CONSERVADAS = new Set([0xe0, 0xe2, 0xee]);

function limpiarJpeg(origen: Uint8Array): Uint8Array {
  const partes: Uint8Array[] = [origen.subarray(0, 2)];
  let i = 2;

  while (i < origen.length) {
    if (origen[i] !== 0xff) {
      partes.push(origen.subarray(i));
      break;
    }

    const marca = origen[i + 1];

    // Marcadores sin longitud propia.
    if (marca === 0x01 || (marca >= 0xd0 && marca <= 0xd8)) {
      partes.push(origen.subarray(i, i + 2));
      i += 2;
      continue;
    }

    // Inicio del escaneo: el resto de la imagen se copia tal cual.
    if (marca === 0xda) {
      partes.push(origen.subarray(i));
      break;
    }

    if (i + 4 > origen.length) {
      partes.push(origen.subarray(i));
      break;
    }

    const longitud = (origen[i + 2] << 8) | origen[i + 3];
    if (longitud < 2 || i + 2 + longitud > origen.length) {
      partes.push(origen.subarray(i));
      break;
    }

    const esApp = marca >= 0xe0 && marca <= 0xef;
    const descartar = marca === 0xfe || (esApp && !MARCAS_JPEG_CONSERVADAS.has(marca));
    if (!descartar) partes.push(origen.subarray(i, i + 2 + longitud));

    i += 2 + longitud;
  }

  return concatenar(partes);
}

// -------------------------------------------------------------------- PNG
const CHUNKS_PNG_DESCARTADOS = new Set(["eXIf", "tEXt", "zTXt", "iTXt", "tIME", "iCCP"]);

function limpiarPng(origen: Uint8Array): Uint8Array {
  const partes: Uint8Array[] = [origen.subarray(0, 8)];
  const vista = new DataView(origen.buffer, origen.byteOffset, origen.byteLength);
  let i = 8;

  while (i + 12 <= origen.length) {
    const longitud = vista.getUint32(i);
    const fin = i + 12 + longitud;
    if (longitud > origen.length || fin > origen.length) break;

    const tipo = String.fromCharCode(
      origen[i + 4], origen[i + 5], origen[i + 6], origen[i + 7],
    );
    if (!CHUNKS_PNG_DESCARTADOS.has(tipo)) partes.push(origen.subarray(i, fin));

    i = fin;
    if (tipo === "IEND") break;
  }

  if (partes.length === 1) return origen; // estructura inesperada: no tocar
  return concatenar(partes);
}

/** Devuelve la imagen sin metadatos. Lanza si el archivo no es válido. */
export function limpiarMetadatos(origen: Uint8Array, mime: string): Uint8Array {
  if (!firmaValida(origen, mime)) {
    throw new Error("El archivo no corresponde al tipo declarado.");
  }
  const limpio = mime === "image/png" ? limpiarPng(origen) : limpiarJpeg(origen);
  if (!firmaValida(limpio, mime)) {
    throw new Error("No se pudo procesar la imagen.");
  }
  return limpio;
}
