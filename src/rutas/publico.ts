/**
 * Rutas públicas: formulario, envío anónimo y consulta por código.
 *
 * El código de seguimiento NUNCA viaja en la URL (siempre por POST en el
 * cuerpo), para que no quede en historial, referrer ni logs de proxies.
 */
import { Hono } from "hono";
import { borrarAdjunto, guardarAdjunto, hayAlmacen } from "../lib/almacen";
import { generarCodigo, hashCodigo, sha256Hex } from "../lib/cripto";
import { hoyLaPaz, sumarDias } from "../lib/fecha";
import { derivarQueja } from "../lib/derivacion";
import { extensionPermitida, limpiarMetadatos } from "../lib/imagen";
import { limitar, verificarCaptcha } from "../lib/limites";
import { parametros } from "../lib/parametros";
import { exigir, fallo, HttpError, ok } from "../lib/respuesta";
import { cargosAutoridad } from "../lib/sia";
import type { Contexto } from "../lib/tipos";

const publico = new Hono<Contexto>();

// --------------------------------------------------------------- estado
publico.get("/estado", async (c) => {
  let db = false;
  try {
    await c.env.DB.prepare("SELECT 1").first();
    db = true;
  } catch {
    db = false;
  }
  return ok(c, { sistema: "buzon-incos", version: "1.0.0", baseDeDatos: db });
});

// ------------------------------------------------------------- formulario
publico.get("/config", async (c) => {
  const [cats, cargos, p] = await Promise.all([
    c.env.DB.prepare(
      "SELECT id, nombre, descripcion FROM buz_categorias WHERE activa = 1 ORDER BY nombre",
    ).all<any>(),
    cargosAutoridad(c.env).catch(() => []),
    parametros(c.env),
  ]);

  return ok(c, {
    entorno: c.env.ENTORNO ?? "produccion",
    turnstileSiteKey: c.env.TURNSTILE_SITE_KEY ?? "",
    maxAdjuntos: hayAlmacen(c.env) ? p.maxAdjuntos : 0,
    maxTamanoMB: p.maxMB,
    plazoAtencionDias: p.plazoDias,
    categorias: cats.results ?? [],
    cargos,
  });
});

// ---------------------------------------------------------- enviar queja
publico.post("/quejas", async (c) => {
  const largo = Number(c.req.header("content-length") ?? 0);
  exigir(largo < 16 * 1024 * 1024, 413, "ARCHIVO_GRANDE", "El envío supera el tamaño permitido.");

  // En desarrollo se puede elevar con LIMITE_QUEJAS_HORA (ver .dev.vars).
  const limiteQuejas = Number(c.env.LIMITE_QUEJAS_HORA ?? 10) || 10;
  if (!(await limitar(c, "queja", limiteQuejas, 3600))) {
    return fallo(c, "DEMASIADOS_ENVIOS", "Ha enviado varias quejas seguidas. Intente más tarde.", 429);
  }

  let formulario: FormData;
  try {
    formulario = await c.req.formData();
  } catch {
    throw new HttpError(400, "SOLICITUD_INVALIDA", "Formato de envío no válido.");
  }

  const categoriaId = Number(formulario.get("categoria_id") ?? 0);
  const descripcion = String(formulario.get("descripcion") ?? "").trim();
  const cargoInvolucradoRaw = String(formulario.get("cargo_involucrado_id") ?? "").trim();
  const captcha = String(formulario.get("turnstile_token") ?? "");

  if (!(await verificarCaptcha(c, captcha))) {
    return fallo(c, "CAPTCHA_INVALIDO", "No se pudo verificar que sea una persona. Intente de nuevo.", 400);
  }

  exigir(categoriaId > 0, 400, "DATOS_INVALIDOS", "Seleccione una categoría.");
  exigir(
    descripcion.length >= 30,
    400,
    "DATOS_INVALIDOS",
    "La descripción debe tener al menos 30 caracteres.",
  );
  exigir(
    descripcion.length <= 6000,
    400,
    "DATOS_INVALIDOS",
    "La descripción es demasiado larga (máximo 6000 caracteres).",
  );

  const categoria = await c.env.DB.prepare(
    "SELECT id FROM buz_categorias WHERE id = ? AND activa = 1",
  )
    .bind(categoriaId)
    .first();
  exigir(categoria, 400, "DATOS_INVALIDOS", "La categoría seleccionada no está disponible.");

  let cargoInvolucradoId: number | null = null;
  if (cargoInvolucradoRaw) {
    cargoInvolucradoId = Number(cargoInvolucradoRaw);
    const vigentes = await cargosAutoridad(c.env).catch(() => []);
    exigir(
      vigentes.some((a) => a.id === cargoInvolucradoId),
      400,
      "DATOS_INVALIDOS",
      "El cargo indicado no es válido.",
    );
  }

  // ---------------------------------------------------------- adjuntos
  const p = await parametros(c.env);
  const archivos = formulario.getAll("adjuntos").filter((v) => typeof v !== "string") as File[];
  exigir(
    archivos.length === 0 || hayAlmacen(c.env),
    503,
    "ADJUNTOS_NO_DISPONIBLES",
    "La evidencia no está disponible en este momento. Puede enviar la queja sin archivos.",
  );
  exigir(
    archivos.length <= p.maxAdjuntos,
    400,
    "DATOS_INVALIDOS",
    `Puede adjuntar como máximo ${p.maxAdjuntos} archivos.`,
  );

  const limpias: { bytes: Uint8Array; mime: string; ext: string; hash: string }[] = [];
  for (const archivo of archivos) {
    if (archivo.size === 0) continue;
    exigir(
      archivo.size <= p.maxMB * 1024 * 1024,
      400,
      "ARCHIVO_GRANDE",
      `Cada archivo debe pesar como máximo ${p.maxMB} MB.`,
    );
    const ext = extensionPermitida(archivo.type);
    exigir(ext, 400, "TIPO_NO_PERMITIDO", "Solo se aceptan imágenes JPG o PNG.");

    const bytes = new Uint8Array(await archivo.arrayBuffer());
    let limpio: Uint8Array;
    try {
      limpio = limpiarMetadatos(bytes, archivo.type);
    } catch {
      throw new HttpError(400, "ARCHIVO_INVALIDO", "Una de las imágenes no se pudo procesar.");
    }
    limpias.push({ bytes: limpio, mime: archivo.type, ext: ext!, hash: await sha256Hex(limpio) });
  }

  // ------------------------------------------------------------ guardar
  const codigo = generarCodigo();
  const codigoHash = await hashCodigo(codigo);
  const fecha = hoyLaPaz();
  const limite = sumarDias(fecha, p.plazoDias);

  const creada = await c.env.DB.prepare(
    `INSERT INTO buz_quejas
       (codigo_hash, categoria_id, descripcion, cargo_involucrado_id, estado, fecha_envio, fecha_limite_atencion)
     VALUES (?, ?, ?, ?, 'PENDIENTE', ?, ?)
     RETURNING id`,
  )
    .bind(codigoHash, categoriaId, descripcion, cargoInvolucradoId, fecha, limite)
    .first<{ id: number }>();

  const quejaId = Number(creada!.id);
  const guardadas: string[] = [];

  try {
    for (const archivo of limpias) {
      const ruta = `quejas/${quejaId}/${crypto.randomUUID()}.${archivo.ext}`;
      await guardarAdjunto(c.env, ruta, archivo.bytes, archivo.mime);
      guardadas.push(ruta);
      await c.env.DB.prepare(
        `INSERT INTO buz_adjuntos
           (queja_id, nombre_generico, ruta_almacenamiento, tamano_bytes, hash_sha256, tipo_mime)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
        .bind(quejaId, `evidencia.${archivo.ext}`, ruta, archivo.bytes.length, archivo.hash, archivo.mime)
        .run();
    }

    await derivarQueja(c.env, quejaId, categoriaId, cargoInvolucradoId);
  } catch {
    // Si algo falla, no debe quedar una queja huérfana.
    await c.env.DB.prepare("DELETE FROM buz_quejas WHERE id = ?").bind(quejaId).run();
    for (const ruta of guardadas) await borrarAdjunto(c.env, ruta);
    throw new HttpError(500, "ERROR_INTERNO", "No se pudo registrar la queja. Intente de nuevo.");
  }

  // El código se muestra UNA sola vez: solo guardamos su hash.
  return ok(c, { codigo, fecha_envio: fecha }, null, 201);
});

// -------------------------------------------------------- consultar estado
publico.post("/consulta", async (c) => {
  if (!(await limitar(c, "consulta", 30, 600))) {
    return fallo(c, "DEMASIADAS_SOLICITUDES", "Demasiados intentos. Espere unos minutos.", 429);
  }

  const cuerpo = await c.req.json().catch(() => ({}));
  const codigo = String(cuerpo?.codigo ?? "").trim();
  exigir(codigo.length >= 8, 400, "DATOS_INVALIDOS", "Ingrese su código de seguimiento.");

  const queja = await c.env.DB.prepare(
    `SELECT q.id, q.estado, q.descripcion, q.fecha_envio, q.fecha_limite_atencion,
            cat.nombre AS categoria
       FROM buz_quejas q
       JOIN buz_categorias cat ON cat.id = q.categoria_id
      WHERE q.codigo_hash = ?`,
  )
    .bind(await hashCodigo(codigo))
    .first<any>();

  exigir(queja, 404, "NO_ENCONTRADO", "No existe una queja con ese código.");

  const [derivacion, historial, mensajes] = await Promise.all([
    c.env.DB.prepare(
      `SELECT d.cargo_id, d.persona_id, d.motivo, d.fecha_hora, d.instancia_externa_texto,
              ca.cargo_nombre
         FROM buz_derivaciones d
         LEFT JOIN buz_cache_autoridades ca ON ca.cargo_id = d.cargo_id
        WHERE d.queja_id = ? AND d.activa = 1
        ORDER BY d.id DESC LIMIT 1`,
    )
      .bind(queja.id)
      .first<any>(),
    c.env.DB.prepare(
      `SELECT estado_anterior, estado_nuevo, fecha_hora
         FROM buz_historial_estados WHERE queja_id = ? ORDER BY id`,
    )
      .bind(queja.id)
      .all<any>(),
    c.env.DB.prepare(
      `SELECT id, autor, texto, fecha_hora
         FROM buz_mensajes WHERE queja_id = ? ORDER BY id`,
    )
      .bind(queja.id)
      .all<any>(),
  ]);

  await c.env.DB.prepare(
    "UPDATE buz_mensajes SET leido = 1 WHERE queja_id = ? AND autor = 'AUTORIDAD' AND leido = 0",
  )
    .bind(queja.id)
    .run();

  return ok(c, {
    estado: queja.estado,
    categoria: queja.categoria,
    descripcion: queja.descripcion,
    fecha_envio: queja.fecha_envio,
    fecha_limite_atencion: queja.fecha_limite_atencion,
    derivada_a: derivacion
      ? derivacion.cargo_nombre ?? derivacion.instancia_externa_texto ?? "Instancia interna"
      : "Sin asignar",
    historial: historial.results ?? [],
    mensajes: mensajes.results ?? [],
  });
});

// ------------------------------------------------ mensaje del denunciante
publico.post("/consulta/mensaje", async (c) => {
  if (!(await limitar(c, "mensaje", 20, 3600))) {
    return fallo(c, "DEMASIADOS_ENVIOS", "Demasiados mensajes. Intente más tarde.", 429);
  }

  const cuerpo = await c.req.json().catch(() => ({}));
  const codigo = String(cuerpo?.codigo ?? "").trim();
  const texto = String(cuerpo?.texto ?? "").trim();

  exigir(codigo.length >= 8, 400, "DATOS_INVALIDOS", "Ingrese su código de seguimiento.");
  exigir(texto.length >= 1 && texto.length <= 4000, 400, "DATOS_INVALIDOS", "Escriba un mensaje válido.");

  const queja = await c.env.DB.prepare(
    "SELECT id, estado FROM buz_quejas WHERE codigo_hash = ?",
  )
    .bind(await hashCodigo(codigo))
    .first<any>();

  exigir(queja, 404, "NO_ENCONTRADO", "No existe una queja con ese código.");
  exigir(queja.estado !== "CERRADA", 409, "QUEJA_CERRADA", "Esta queja ya fue cerrada.");

  await c.env.DB.prepare(
    `INSERT INTO buz_mensajes (queja_id, autor, texto, fecha_hora, leido)
     VALUES (?, 'DENUNCIANTE', ?, ?, 0)`,
  )
    .bind(queja.id, texto, new Date().toISOString())
    .run();

  return ok(c, { registrado: true }, null, 201);
});

export default publico;
