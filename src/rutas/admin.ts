/**
 * Administración del Buzón.
 *
 * ADMIN_TECNICO gestiona cuentas, categorías, reglas y parámetros.
 * COMITE consulta auditoría y estadísticas.
 * NINGUNO de los dos puede ver el contenido de una queja (prueba explícita
 * en GET /admin/queja/:id, que siempre responde 403).
 */
import { Hono } from "hono";
import { leerAdjunto } from "../lib/almacen";
import { hashClave, iteracionesPbkdf2 } from "../lib/cripto";
import { exigir, fallo, ok } from "../lib/respuesta";
import { auditar, soloLocal } from "../lib/sesion";
import type { Contexto } from "../lib/tipos";

const admin = new Hono<Contexto>();

const soloAdmin = soloLocal(["ADMIN_TECNICO"]);
const adminYComite = soloLocal(["ADMIN_TECNICO", "COMITE"]);

// ---------------------------------------------------------------- perfil
admin.get("/perfil", adminYComite, (c) => ok(c, c.get("local")));

// ------------------------------------------------------------ categorías
admin.get("/categorias", soloAdmin, async (c) => {
  const fila = await c.env.DB.prepare(
    `SELECT c.id, c.nombre, c.descripcion, c.activa,
            (SELECT COUNT(*) FROM buz_quejas q WHERE q.categoria_id = c.id) AS quejas
       FROM buz_categorias c ORDER BY c.nombre`,
  ).all<any>();
  return ok(c, fila.results ?? []);
});

admin.post("/categorias", soloAdmin, async (c) => {
  const cuerpo = await c.req.json().catch(() => ({}));
  const nombre = String(cuerpo?.nombre ?? "").trim();
  const descripcion = String(cuerpo?.descripcion ?? "").trim();

  exigir(nombre.length >= 2 && nombre.length <= 80, 400, "DATOS_INVALIDOS", "Nombre de categoría no válido.");

  try {
    const creada = await c.env.DB.prepare(
      "INSERT INTO buz_categorias (nombre, descripcion) VALUES (?, ?) RETURNING id",
    )
      .bind(nombre, descripcion)
      .first<{ id: number }>();
    await auditar(c.env, {
      usuarioId: c.get("local").uid,
      accion: "CATEGORIA_CREADA",
      entidad: "categoria",
      entidadId: Number(creada!.id),
    });
    return ok(c, { id: Number(creada!.id) }, null, 201);
  } catch {
    return fallo(c, "REGISTRO_DUPLICADO", "Ya existe una categoría con ese nombre.", 409);
  }
});

admin.patch("/categorias/:id", soloAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  const cuerpo = await c.req.json().catch(() => ({}));

  const actual = await c.env.DB.prepare("SELECT * FROM buz_categorias WHERE id = ?").bind(id).first<any>();
  exigir(actual, 404, "NO_ENCONTRADO", "La categoría no existe.");

  const nombre = cuerpo?.nombre === undefined ? actual.nombre : String(cuerpo.nombre).trim();
  const descripcion =
    cuerpo?.descripcion === undefined ? actual.descripcion : String(cuerpo.descripcion).trim();
  const activa = cuerpo?.activa === undefined ? actual.activa : cuerpo.activa ? 1 : 0;

  await c.env.DB.prepare(
    "UPDATE buz_categorias SET nombre = ?, descripcion = ?, activa = ? WHERE id = ?",
  )
    .bind(nombre, descripcion, activa, id)
    .run();

  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "CATEGORIA_EDITADA",
    entidad: "categoria",
    entidadId: id,
  });
  return ok(c, { actualizada: true });
});

// Eliminación lógica: nunca se borra una categoría con quejas.
admin.delete("/categorias/:id", soloAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  const uso = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM buz_quejas WHERE categoria_id = ?")
    .bind(id)
    .first<any>();
  exigir(Number(uso?.n ?? 0) === 0, 409, "CONFLICTO", "La categoría tiene quejas: desactívela en lugar de borrarla.");

  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM buz_reglas_derivacion WHERE categoria_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM buz_categorias WHERE id = ?").bind(id),
  ]);
  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "CATEGORIA_ELIMINADA",
    entidad: "categoria",
    entidadId: id,
  });
  return ok(c, { eliminada: true });
});

// ---------------------------------------------------------------- reglas
admin.get("/reglas/:categoriaId", soloAdmin, async (c) => {
  const categoriaId = Number(c.req.param("categoriaId"));
  const fila = await c.env.DB.prepare(
    `SELECT r.id, r.categoria_id, r.orden, r.cargo_id, r.instancia_externa_texto,
            ca.cargo_nombre, ca.nombre_completo
       FROM buz_reglas_derivacion r
       LEFT JOIN buz_cache_autoridades ca ON ca.cargo_id = r.cargo_id
      WHERE r.categoria_id = ? ORDER BY r.orden`,
  )
    .bind(categoriaId)
    .all<any>();
  return ok(c, fila.results ?? []);
});

/** Reemplaza la cadena completa de una categoría. */
admin.put("/reglas/:categoriaId", soloAdmin, async (c) => {
  const categoriaId = Number(c.req.param("categoriaId"));
  const cuerpo = await c.req.json().catch(() => ({}));
  const reglas = Array.isArray(cuerpo?.reglas) ? cuerpo.reglas : null;

  exigir(reglas && reglas.length >= 1 && reglas.length <= 10, 400, "DATOS_INVALIDOS", "La cadena debe tener entre 1 y 10 eslabones.");

  const categoria = await c.env.DB.prepare("SELECT id FROM buz_categorias WHERE id = ?")
    .bind(categoriaId)
    .first();
  exigir(categoria, 404, "NO_ENCONTRADO", "La categoría no existe.");

  const sentencias: D1PreparedStatement[] = [
    c.env.DB.prepare("DELETE FROM buz_reglas_derivacion WHERE categoria_id = ?").bind(categoriaId),
  ];

  reglas.forEach((regla: any, indice: number) => {
    const cargoId = regla?.cargo_id === undefined || regla?.cargo_id === null || regla?.cargo_id === ""
      ? null
      : Number(regla.cargo_id);
    const externo = regla?.instancia_externa_texto ? String(regla.instancia_externa_texto).trim() : null;
    exigir(cargoId !== null || externo, 400, "DATOS_INVALIDOS", "Cada eslabón debe tener un cargo o una instancia externa.");

    sentencias.push(
      c.env.DB.prepare(
        `INSERT INTO buz_reglas_derivacion (categoria_id, orden, cargo_id, instancia_externa_texto)
         VALUES (?, ?, ?, ?)`,
      ).bind(categoriaId, indice + 1, cargoId, externo),
    );
  });

  await c.env.DB.batch(sentencias);
  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "REGLAS_ACTUALIZADAS",
    entidad: "categoria",
    entidadId: categoriaId,
  });
  return ok(c, { actualizadas: reglas.length });
});

// --------------------------------------------------------------- usuarios
admin.get("/usuarios", soloAdmin, async (c) => {
  const fila = await c.env.DB.prepare(
    `SELECT id, nombres, apellidos, correo_electronico, rol, activo
       FROM buz_usuarios ORDER BY rol, apellidos`,
  ).all<any>();
  return ok(c, fila.results ?? []);
});

admin.post("/usuarios", soloAdmin, async (c) => {
  const cuerpo = await c.req.json().catch(() => ({}));
  const nombres = String(cuerpo?.nombres ?? "").trim();
  const apellidos = String(cuerpo?.apellidos ?? "").trim();
  const correo = String(cuerpo?.correo ?? "").trim().toLowerCase();
  const clave = String(cuerpo?.clave ?? "");
  const rol = String(cuerpo?.rol ?? "");

  exigir(nombres && apellidos, 400, "DATOS_INVALIDOS", "Nombres y apellidos son obligatorios.");
  exigir(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo), 400, "DATOS_INVALIDOS", "Correo no válido.");
  exigir(clave.length >= 10, 400, "DATOS_INVALIDOS", "La clave debe tener al menos 10 caracteres.");
  exigir(["ADMIN_TECNICO", "COMITE"].includes(rol), 400, "DATOS_INVALIDOS", "Rol no válido.");

  try {
    const creado = await c.env.DB.prepare(
      `INSERT INTO buz_usuarios (nombres, apellidos, correo_electronico, clave_hash, rol, activo)
       VALUES (?, ?, ?, ?, ?, 1) RETURNING id`,
    )
      .bind(
        nombres,
        apellidos,
        correo,
        await hashClave(clave, iteracionesPbkdf2(c.env.PBKDF2_ITERACIONES)),
        rol,
      )
      .first<{ id: number }>();

    await auditar(c.env, {
      usuarioId: c.get("local").uid,
      accion: "USUARIO_CREADO",
      entidad: "usuario",
      entidadId: Number(creado!.id),
    });
    return ok(c, { id: Number(creado!.id) }, null, 201);
  } catch {
    return fallo(c, "REGISTRO_DUPLICADO", "Ya existe una cuenta con ese correo.", 409);
  }
});

admin.patch("/usuarios/:id", soloAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  const cuerpo = await c.req.json().catch(() => ({}));
  const actual = await c.env.DB.prepare("SELECT * FROM buz_usuarios WHERE id = ?").bind(id).first<any>();
  exigir(actual, 404, "NO_ENCONTRADO", "La cuenta no existe.");

  const nombres = cuerpo?.nombres === undefined ? actual.nombres : String(cuerpo.nombres).trim();
  const apellidos = cuerpo?.apellidos === undefined ? actual.apellidos : String(cuerpo.apellidos).trim();
  const rol = cuerpo?.rol === undefined ? actual.rol : String(cuerpo.rol);
  const activo = cuerpo?.activo === undefined ? actual.activo : cuerpo.activo ? 1 : 0;
  const clave = cuerpo?.clave ? String(cuerpo.clave) : null;

  exigir(["ADMIN_TECNICO", "COMITE"].includes(rol), 400, "DATOS_INVALIDOS", "Rol no válido.");
  if (clave) exigir(clave.length >= 10, 400, "DATOS_INVALIDOS", "La clave debe tener al menos 10 caracteres.");

  const claveHash = clave
    ? await hashClave(clave, iteracionesPbkdf2(c.env.PBKDF2_ITERACIONES))
    : actual.clave_hash;

  await c.env.DB.prepare(
    `UPDATE buz_usuarios
        SET nombres = ?, apellidos = ?, rol = ?, activo = ?, clave_hash = ?
      WHERE id = ?`,
  )
    .bind(nombres, apellidos, rol, activo, claveHash, id)
    .run();

  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "USUARIO_EDITADO",
    entidad: "usuario",
    entidadId: id,
  });
  return ok(c, { actualizado: true });
});

// ------------------------------------------------------------- parámetros
admin.get("/parametros", soloAdmin, async (c) => {
  const fila = await c.env.DB.prepare("SELECT * FROM buz_parametros WHERE id = 1").first<any>();
  return ok(c, fila);
});

admin.patch("/parametros", soloAdmin, async (c) => {
  const cuerpo = await c.req.json().catch(() => ({}));
  const actual = await c.env.DB.prepare("SELECT * FROM buz_parametros WHERE id = 1").first<any>();

  const plazo = Number(cuerpo?.plazo_atencion_dias ?? actual?.plazo_atencion_dias ?? 5);
  const maxAdjuntos = Number(cuerpo?.max_adjuntos ?? actual?.max_adjuntos ?? 3);
  const maxMB = Number(cuerpo?.max_tamano_adjunto_mb ?? actual?.max_tamano_adjunto_mb ?? 2);

  exigir(plazo >= 1 && plazo <= 60, 400, "DATOS_INVALIDOS", "El plazo debe estar entre 1 y 60 días.");
  exigir(maxAdjuntos >= 0 && maxAdjuntos <= 3, 400, "DATOS_INVALIDOS", "Los adjuntos deben ser entre 0 y 3.");
  exigir(maxMB >= 1 && maxMB <= 10, 400, "DATOS_INVALIDOS", "El tamaño debe estar entre 1 y 10 MB.");

  await c.env.DB.prepare(
    `UPDATE buz_parametros
        SET plazo_atencion_dias = ?, max_adjuntos = ?, max_tamano_adjunto_mb = ?
      WHERE id = 1`,
  )
    .bind(plazo, maxAdjuntos, maxMB)
    .run();

  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "PARAMETROS_ACTUALIZADOS",
    entidad: "parametros",
    entidadId: 1,
  });
  return ok(c, { actualizados: true });
});

// -------------------------------------------------------------- auditoría
admin.get("/auditoria", adminYComite, async (c) => {
  const pagina = Math.max(1, Number(c.req.query("pagina") ?? 1));
  const limite = Math.min(100, Math.max(1, Number(c.req.query("limite") ?? 50)));

  const [fila, total] = await Promise.all([
    c.env.DB.prepare(
      `SELECT a.id, a.accion, a.entidad, a.entidad_id, a.fecha_hora,
              a.usuario_id, a.persona_id,
              CASE WHEN a.usuario_id IS NOT NULL
                   THEN u.nombres || ' ' || u.apellidos
                   ELSE NULL END AS usuario
         FROM buz_auditoria a
         LEFT JOIN buz_usuarios u ON u.id = a.usuario_id
        ORDER BY a.id DESC LIMIT ? OFFSET ?`,
    )
      .bind(limite, (pagina - 1) * limite)
      .all<any>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM buz_auditoria").first<any>(),
  ]);

  return ok(c, {
    registros: fila.results ?? [],
    pagina,
    limite,
    total: Number(total?.n ?? 0),
  });
});

// ----------------------------------------------------------- estadísticas
admin.get("/estadisticas", adminYComite, async (c) => {
  const [total, porEstado, porCategoria, porMes] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM buz_quejas").first<any>(),
    c.env.DB.prepare("SELECT estado, COUNT(*) AS n FROM buz_quejas GROUP BY estado").all<any>(),
    c.env.DB.prepare(
      `SELECT cat.nombre AS categoria, COUNT(*) AS n
         FROM buz_quejas q JOIN buz_categorias cat ON cat.id = q.categoria_id
        GROUP BY cat.id ORDER BY n DESC`,
    ).all<any>(),
    c.env.DB.prepare(
      `SELECT substr(fecha_envio, 1, 7) AS mes, COUNT(*) AS n
         FROM buz_quejas GROUP BY mes ORDER BY mes DESC LIMIT 12`,
    ).all<any>(),
  ]);

  return ok(c, {
    total: Number(total?.n ?? 0),
    porEstado: porEstado.results ?? [],
    porCategoria: porCategoria.results ?? [],
    porMes: porMes.results ?? [],
  });
});

// ------------------------------------------------ evidencias (solo imágenes)
// Excepción deliberada y solicitada: el administrador puede revisar las
// imágenes adjuntas, pero sigue sin acceso al TEXTO de la queja
// (GET /admin/queja/:id continúa respondiendo 403).
admin.get("/evidencias", adminYComite, async (c) => {
  const pagina = Math.max(1, Number(c.req.query("pagina") ?? 1));
  const limite = Math.min(24, Math.max(1, Number(c.req.query("limite") ?? 12)));

  const [filas, total] = await Promise.all([
    c.env.DB.prepare(
      `SELECT a.id, a.queja_id, a.nombre_generico, a.tamano_bytes, a.tipo_mime,
              q.fecha_envio, q.estado, cat.nombre AS categoria
         FROM buz_adjuntos a
         JOIN buz_quejas q ON q.id = a.queja_id
         JOIN buz_categorias cat ON cat.id = q.categoria_id
        ORDER BY a.id DESC LIMIT ? OFFSET ?`,
    )
      .bind(limite, (pagina - 1) * limite)
      .all<any>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM buz_adjuntos").first<any>(),
  ]);

  return ok(c, {
    evidencias: filas.results ?? [],
    pagina,
    limite,
    total: Number(total?.n ?? 0),
  });
});

admin.get("/evidencia/:id", adminYComite, async (c) => {
  const id = Number(c.req.param("id"));
  exigir(Number.isFinite(id), 400, "DATOS_INVALIDOS", "Identificador no válido.");

  const adjunto = await c.env.DB.prepare(
    "SELECT ruta_almacenamiento, nombre_generico, tipo_mime FROM buz_adjuntos WHERE id = ?",
  )
    .bind(id)
    .first<any>();
  exigir(adjunto, 404, "NO_ENCONTRADO", "La evidencia no existe.");

  const objeto = await leerAdjunto(c.env, adjunto.ruta_almacenamiento);
  exigir(objeto, 404, "NO_ENCONTRADO", "El archivo no está disponible.");

  await auditar(c.env, {
    usuarioId: c.get("local").uid,
    accion: "VER_EVIDENCIA",
    entidad: "adjunto",
    entidadId: id,
  });

  return new Response(objeto!.cuerpo, {
    headers: {
      "content-type": adjunto.tipo_mime,
      "content-disposition": `inline; filename="${adjunto.nombre_generico}"`,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
});

// ------------------------------ prueba de privacidad exigida por la guía
admin.get("/queja/:id", adminYComite, (c) => {
  return fallo(
    c,
    "SIN_PERMISO",
    "El administrador técnico no puede ver el contenido de las quejas.",
    403,
  );
});

export default admin;
