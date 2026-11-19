/** Rutas de las autoridades: bandeja, detalle, estados y mensajes. */
import { Hono } from "hono";
import { leerAdjunto } from "../lib/almacen";
import { esCargoRector } from "../lib/derivacion";
import { auditar, soloAutoridad } from "../lib/sesion";
import { exigir, fallo, ok } from "../lib/respuesta";
import { ahoraLaPaz } from "../lib/fecha";
import { autoridades } from "../lib/sia";
import type { Contexto } from "../lib/tipos";

const autoridad = new Hono<Contexto>();
autoridad.use("*", soloAutoridad);

const ESTADOS = ["PENDIENTE", "EN_REVISION", "EN_PROCESO", "CERRADA"] as const;

/**
 * Comprueba el acceso a una queja. La Rectora supervisa todas; las demás
 * autoridades solo ven las que están derivadas de forma vigente a su persona.
 */
async function accesoAutoridad(c: any, quejaId: number) {
  const claims = c.get("claims");
  const personaId = claims.sub;
  if (esCargoRector(claims.cargos)) return personaId;

  const fila = await c.env.DB.prepare(
    `SELECT id FROM buz_derivaciones
      WHERE queja_id = ? AND persona_id = ? AND activa = 1 LIMIT 1`,
  )
    .bind(quejaId, personaId)
    .first();
  exigir(fila, 403, "SIN_PERMISO", "Esta queja no está derivada a su cargo.");
  return personaId;
}

// ---------------------------------------------------------------- perfil
autoridad.get("/perfil", (c) => {
  const claims = c.get("claims");
  return ok(c, {
    personaId: claims.sub,
    nombre: claims.nombre,
    cargos: claims.cargos,
    puede_asignar: esCargoRector(claims.cargos),
  });
});

// --------------------------------------------------------------- bandeja
autoridad.get("/bandeja", async (c) => {
  const claims = c.get("claims");
  const esRector = esCargoRector(claims.cargos);

  const fila = await c.env.DB.prepare(
    `SELECT q.id, q.estado, q.fecha_envio, q.fecha_limite_atencion,
            substr(q.descripcion, 1, 200) AS resumen,
            cat.nombre AS categoria,
            d.activa, d.fecha_hora AS derivada_en,
            d.cargo_id AS asignada_cargo_id,
            d.instancia_externa_texto AS asignada_externa,
            ca.cargo_nombre AS asignada_a,
            (SELECT COUNT(*) FROM buz_mensajes m
              WHERE m.queja_id = q.id AND m.autor = 'DENUNCIANTE' AND m.leido = 0) AS sin_leer,
            (SELECT COUNT(*) FROM buz_adjuntos a WHERE a.queja_id = q.id) AS adjuntos
       FROM buz_quejas q
       JOIN buz_categorias cat ON cat.id = q.categoria_id
       LEFT JOIN buz_derivaciones d ON d.id = (
         SELECT id FROM buz_derivaciones
          WHERE queja_id = q.id AND activa = 1
          ORDER BY id DESC LIMIT 1
       )
       LEFT JOIN buz_cache_autoridades ca ON ca.cargo_id = d.cargo_id
      WHERE d.persona_id = ? OR ? = 1
      ORDER BY q.id DESC
      LIMIT 300`,
  )
    .bind(claims.sub, esRector ? 1 : 0)
    .all<any>();

  // Una queja puede tener más de una derivación histórica: se muestra una vez.
  const vistas = new Set<number>();
  const quejas = (fila.results ?? []).filter((q) => {
    if (vistas.has(q.id)) return false;
    vistas.add(q.id);
    return true;
  });

  return ok(c, quejas);
});

// ---------------------------------------------------------------- detalle
autoridad.get("/queja/:id", async (c) => {
  const quejaId = Number(c.req.param("id"));
  exigir(Number.isFinite(quejaId), 400, "DATOS_INVALIDOS", "Identificador no válido.");
  const personaId = await accesoAutoridad(c, quejaId);
  const claims = c.get("claims");
  const esRector = esCargoRector(claims.cargos);

  const queja = await c.env.DB.prepare(
    `SELECT q.id, q.estado, q.descripcion, q.fecha_envio, q.fecha_limite_atencion,
            q.cargo_involucrado_id,
            cat.nombre AS categoria,
            ci.cargo_nombre AS cargo_involucrado
       FROM buz_quejas q
       JOIN buz_categorias cat ON cat.id = q.categoria_id
       LEFT JOIN buz_cache_autoridades ci ON ci.cargo_id = q.cargo_involucrado_id
      WHERE q.id = ?`,
  )
    .bind(quejaId)
    .first<any>();
  exigir(queja, 404, "NO_ENCONTRADO", "La queja no existe.");

  const [derivacion, historial, mensajes, adjuntos] = await Promise.all([
    c.env.DB.prepare(
      `SELECT d.motivo, d.fecha_hora, d.instancia_externa_texto,
              d.cargo_id, d.persona_id, ca.cargo_nombre
         FROM buz_derivaciones d
         LEFT JOIN buz_cache_autoridades ca ON ca.cargo_id = d.cargo_id
        WHERE d.queja_id = ? AND d.activa = 1 ORDER BY d.id DESC LIMIT 1`,
    )
      .bind(quejaId)
      .first<any>(),
    c.env.DB.prepare(
      `SELECT estado_anterior, estado_nuevo, fecha_hora
         FROM buz_historial_estados WHERE queja_id = ? ORDER BY id`,
    )
      .bind(quejaId)
      .all<any>(),
    c.env.DB.prepare(
      `SELECT id, autor, texto, fecha_hora, leido
         FROM buz_mensajes WHERE queja_id = ? ORDER BY id`,
    )
      .bind(quejaId)
      .all<any>(),
    c.env.DB.prepare(
      `SELECT id, nombre_generico, tamano_bytes, tipo_mime, hash_sha256
         FROM buz_adjuntos WHERE queja_id = ? ORDER BY id`,
    )
      .bind(quejaId)
      .all<any>(),
  ]);

  await c.env.DB.prepare(
    `UPDATE buz_mensajes SET leido = 1
      WHERE queja_id = ? AND autor = 'DENUNCIANTE' AND leido = 0`,
  )
    .bind(quejaId)
    .run();

  const destinos = esRector
    ? (await autoridades(c.env)).map((a) => ({
        cargoId: a.cargoId,
        cargoNombre: a.cargoNombre,
        personaId: a.personaId,
        nombreCompleto: a.nombreCompleto,
      }))
    : [];

  return ok(c, {
    ...queja,
    derivacion_actual: derivacion
      ? derivacion.cargo_nombre ?? derivacion.instancia_externa_texto ?? "Instancia interna"
      : "Sin asignar",
    motivo_derivacion: derivacion?.motivo ?? null,
    derivacion_cargo_id: derivacion?.cargo_id ?? null,
    derivacion_persona_id: derivacion?.persona_id ?? null,
    historial: historial.results ?? [],
    mensajes: mensajes.results ?? [],
    adjuntos: adjuntos.results ?? [],
    mi_persona_id: personaId,
    puede_asignar: esRector,
    destinos,
  });
});

// --------------------------------------------------------- asignar queja
autoridad.post("/queja/:id/asignar", async (c) => {
  const quejaId = Number(c.req.param("id"));
  exigir(Number.isFinite(quejaId), 400, "DATOS_INVALIDOS", "Identificador no válido.");

  const claims = c.get("claims");
  exigir(
    esCargoRector(claims.cargos),
    403,
    "SIN_PERMISO",
    "Solo la Rectora puede asignar quejas a otras autoridades.",
  );

  const cuerpo = await c.req.json().catch(() => ({}));
  const cargoId = Number(cuerpo?.cargo_id);
  exigir(
    Number.isFinite(cargoId) && cargoId > 0,
    400,
    "DATOS_INVALIDOS",
    "Seleccione una autoridad de destino.",
  );

  const queja = await c.env.DB.prepare(
    "SELECT id, estado, cargo_involucrado_id FROM buz_quejas WHERE id = ?",
  )
    .bind(quejaId)
    .first<any>();
  exigir(queja, 404, "NO_ENCONTRADO", "La queja no existe.");
  exigir(
    queja.estado !== "CERRADA",
    409,
    "QUEJA_CERRADA",
    "Una queja cerrada no se puede reasignar.",
  );

  const vigentes = await autoridades(c.env);
  const destino = vigentes.find((a) => a.cargoId === cargoId);
  exigir(
    destino?.personaId,
    400,
    "DESTINO_INVALIDO",
    "El cargo seleccionado no tiene una persona vigente.",
  );

  const acusado =
    queja.cargo_involucrado_id != null
      ? vigentes.find((a) => a.cargoId === Number(queja.cargo_involucrado_id))
      : null;
  exigir(
    !acusado || acusado.personaId !== destino!.personaId,
    400,
    "DESTINO_INVALIDO",
    "No se puede asignar la queja a la persona señalada en ella.",
  );

  await c.env.DB.batch([
    c.env.DB.prepare(
      "UPDATE buz_derivaciones SET activa = 0 WHERE queja_id = ? AND activa = 1",
    ).bind(quejaId),
    c.env.DB.prepare(
      `INSERT INTO buz_derivaciones
         (queja_id, cargo_id, persona_id, motivo, fecha_hora, activa, instancia_externa_texto)
       VALUES (?, ?, ?, 'REGLA', ?, 1, NULL)`,
    ).bind(quejaId, destino!.cargoId, destino!.personaId, ahoraLaPaz()),
  ]);

  await auditar(c.env, {
    personaId: claims.sub,
    accion: "ASIGNACION",
    entidad: "queja",
    entidadId: quejaId,
  });

  return ok(c, {
    asignada: true,
    cargo: destino!.cargoNombre,
    persona: destino!.nombreCompleto,
  });
});

// --------------------------------------------------------- cambiar estado
autoridad.patch("/queja/:id/estado", async (c) => {
  const quejaId = Number(c.req.param("id"));
  exigir(Number.isFinite(quejaId), 400, "DATOS_INVALIDOS", "Identificador no válido.");
  const personaId = await accesoAutoridad(c, quejaId);

  const cuerpo = await c.req.json().catch(() => ({}));
  const nuevo = String(cuerpo?.estado ?? "");
  exigir(
    (ESTADOS as readonly string[]).includes(nuevo),
    400,
    "DATOS_INVALIDOS",
    "Estado no válido.",
  );

  const actual = await c.env.DB.prepare("SELECT estado FROM buz_quejas WHERE id = ?")
    .bind(quejaId)
    .first<any>();
  exigir(actual, 404, "NO_ENCONTRADO", "La queja no existe.");
  exigir(actual.estado !== "CERRADA", 409, "QUEJA_CERRADA", "Una queja cerrada no se puede modificar.");

  if (actual.estado !== nuevo) {
    await c.env.DB.batch([
      c.env.DB.prepare("UPDATE buz_quejas SET estado = ? WHERE id = ?").bind(nuevo, quejaId),
      c.env.DB.prepare(
        `INSERT INTO buz_historial_estados
           (queja_id, estado_anterior, estado_nuevo, persona_id, fecha_hora)
         VALUES (?, ?, ?, ?, ?)`,
      ).bind(quejaId, actual.estado, nuevo, personaId, ahoraLaPaz()),
    ]);
    await auditar(c.env, {
      personaId,
      accion: "CAMBIO_ESTADO",
      entidad: "queja",
      entidadId: quejaId,
    });
  }

  return ok(c, { estado: nuevo });
});

// ------------------------------------------------------------- responder
autoridad.post("/queja/:id/mensaje", async (c) => {
  const quejaId = Number(c.req.param("id"));
  exigir(Number.isFinite(quejaId), 400, "DATOS_INVALIDOS", "Identificador no válido.");
  const personaId = await accesoAutoridad(c, quejaId);

  const cuerpo = await c.req.json().catch(() => ({}));
  const texto = String(cuerpo?.texto ?? "").trim();
  exigir(texto.length >= 1 && texto.length <= 4000, 400, "DATOS_INVALIDOS", "Escriba un mensaje válido.");

  const queja = await c.env.DB.prepare("SELECT estado FROM buz_quejas WHERE id = ?")
    .bind(quejaId)
    .first<any>();
  exigir(queja, 404, "NO_ENCONTRADO", "La queja no existe.");
  exigir(queja.estado !== "CERRADA", 409, "QUEJA_CERRADA", "La queja está cerrada.");

  await c.env.DB.prepare(
    `INSERT INTO buz_mensajes (queja_id, autor, persona_id, texto, fecha_hora, leido)
     VALUES (?, 'AUTORIDAD', ?, ?, ?, 0)`,
  )
    .bind(quejaId, personaId, texto, ahoraLaPaz())
    .run();

  // Primera respuesta: la queja pasa a revisión.
  if (queja.estado === "PENDIENTE") {
    await c.env.DB.batch([
      c.env.DB.prepare("UPDATE buz_quejas SET estado = 'EN_REVISION' WHERE id = ?").bind(quejaId),
      c.env.DB.prepare(
        `INSERT INTO buz_historial_estados
           (queja_id, estado_anterior, estado_nuevo, persona_id, fecha_hora)
         VALUES (?, 'PENDIENTE', 'EN_REVISION', ?, ?)`,
      ).bind(quejaId, personaId, ahoraLaPaz()),
    ]);
  }

  await auditar(c.env, {
    personaId,
    accion: "RESPUESTA",
    entidad: "queja",
    entidadId: quejaId,
  });

  return ok(c, { registrado: true }, null, 201);
});

// ------------------------------------------------------- descargar adjunto
autoridad.get("/adjunto/:id", async (c) => {
  const adjuntoId = Number(c.req.param("id"));
  exigir(Number.isFinite(adjuntoId), 400, "DATOS_INVALIDOS", "Identificador no válido.");
  const claims = c.get("claims");
  const personaId = claims.sub;
  const esRector = esCargoRector(claims.cargos);

  const adjunto = esRector
    ? await c.env.DB.prepare(
        `SELECT a.ruta_almacenamiento, a.nombre_generico, a.tipo_mime
           FROM buz_adjuntos a
          WHERE a.id = ?`,
      )
        .bind(adjuntoId)
        .first<any>()
    : await c.env.DB.prepare(
        `SELECT a.ruta_almacenamiento, a.nombre_generico, a.tipo_mime
           FROM buz_adjuntos a
           JOIN buz_derivaciones d ON d.queja_id = a.queja_id AND d.activa = 1
          WHERE a.id = ? AND d.persona_id = ? LIMIT 1`,
      )
        .bind(adjuntoId, personaId)
        .first<any>();

  exigir(adjunto, 403, "SIN_PERMISO", "No tiene acceso a este adjunto.");

  const objeto = await leerAdjunto(c.env, adjunto.ruta_almacenamiento);
  exigir(objeto, 404, "NO_ENCONTRADO", "El archivo no está disponible.");

  await auditar(c.env, {
    personaId,
    accion: "DESCARGA_ADJUNTO",
    entidad: "adjunto",
    entidadId: adjuntoId,
  });

  return new Response(objeto!.cuerpo, {
    headers: {
      "content-type": adjunto.tipo_mime,
      "content-disposition": `attachment; filename="${adjunto.nombre_generico}"`,
      "cache-control": "no-store",
    },
  });
});

export default autoridad;
