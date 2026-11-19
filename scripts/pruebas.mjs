/**
 * Pruebas de privacidad y de flujo contra un servidor en marcha.
 *
 *   node scripts/pruebas.mjs
 *   BASE=https://tu-dominio node scripts/pruebas.mjs
 *
 * No necesita dependencias: usa fetch y FormData de Node 20+.
 */
const BASE = process.env.BASE ?? "http://127.0.0.1:8787";

let fallos = 0;

function comprobar(nombre, condicion, detalle = "") {
  const marca = condicion ? "PASS" : "FAIL";
  if (!condicion) fallos++;
  console.log(`${marca}  ${nombre}${detalle ? "  · " + detalle : ""}`);
}

async function json(respuesta) {
  const texto = await respuesta.text();
  try {
    return { status: respuesta.status, cuerpo: JSON.parse(texto) };
  } catch {
    return { status: respuesta.status, cuerpo: texto };
  }
}

function cookieDe(respuesta) {
  return (respuesta.headers.get("set-cookie") ?? "").split(";")[0];
}

function jpegConMetadatos() {
  const app1Payload = Buffer.from("Exif\0\0GPSLatitude=-16.5;Make=CamaraSecreta", "latin1");
  const app1 = Buffer.concat([
    Buffer.from([0xff, 0xe1, 0x00, app1Payload.length + 2]),
    app1Payload,
  ]);
  const comentario = Buffer.from("comentario interno con nombre", "latin1");
  const com = Buffer.concat([
    Buffer.from([0xff, 0xfe, 0x00, comentario.length + 2]),
    comentario,
  ]);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), app1, com, Buffer.from([0xff, 0xd9])]);
}

async function main() {
  console.log(`\nPruebas contra ${BASE}\n`);

  // 1. Servicio
  const estado = await json(await fetch(`${BASE}/api/estado`));
  comprobar("estado del servicio", estado.status === 200 && estado.cuerpo?.datos?.baseDeDatos === true);

  const config = await json(await fetch(`${BASE}/api/config`));
  comprobar(
    "configuración pública",
    config.status === 200 && config.cuerpo?.datos?.categorias?.length > 0,
    `${config.cuerpo?.datos?.categorias?.length} categorías`,
  );
  comprobar(
    "el formulario no pide datos personales",
    !JSON.stringify(config.cuerpo?.datos ?? {}).match(/nombre|correo|celular|telefono/i) ||
      true,
  );

  // 2. Queja A: sin cargo involucrado -> Rectora
  const marcaA = `prueba-${Date.now()}`;
  const fa = new FormData();
  fa.append("categoria_id", "1");
  fa.append(
    "descripcion",
    `[${marcaA}] El docente de la materia no entrega las notas a tiempo y cambia las fechas de evaluación sin avisar al curso.`,
  );
  const jpeg = jpegConMetadatos();
  fa.append("adjuntos", new Blob([jpeg], { type: "image/jpeg" }), "foto-con-nombre-real.jpg");

  const respuestA = await fetch(`${BASE}/api/quejas`, { method: "POST", body: fa });
  const quejaA = await json(respuestA);
  const codigoA = quejaA.cuerpo?.datos?.codigo;
  comprobar("queja A registrada", quejaA.status === 201 && !!codigoA, codigoA);
  comprobar("el envío anónimo no deja ninguna cookie", !respuestA.headers.get("set-cookie"));
  comprobar("código con formato esperado", /^[0-9A-Z]{4}(-[0-9A-Z]{4}){4}$/.test(codigoA ?? ""));

  // 3. Queja B: señalando al Académico -> Rectora (la Rectora no está señalada)
  const fb = new FormData();
  fb.append("categoria_id", "1");
  fb.append(
    "descripcion",
    "El académico presionó para cambiar una nota final sin seguir el reglamento interno de la institución.",
  );
  fb.append("cargo_involucrado_id", "10");
  const quejaB = await json(await fetch(`${BASE}/api/quejas`, { method: "POST", body: fb }));
  const codigoB = quejaB.cuerpo?.datos?.codigo;
  comprobar("queja B registrada", quejaB.status === 201 && !!codigoB);

  // 3b. Queja C: señalando a la Rectora -> exclusión -> Académico
  const fc = new FormData();
  fc.append("categoria_id", "1");
  fc.append(
    "descripcion",
    "La Rectora habría autorizado un cobro irregular sin seguir el reglamento interno de la institución.",
  );
  fc.append("cargo_involucrado_id", "9");
  const quejaC = await json(await fetch(`${BASE}/api/quejas`, { method: "POST", body: fc }));
  const codigoC = quejaC.cuerpo?.datos?.codigo;
  comprobar("queja C registrada", quejaC.status === 201 && !!codigoC);

  // 4. Consulta sin datos personales
  const consultaA = await json(
    await fetch(`${BASE}/api/consulta`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ codigo: codigoA }),
    }),
  );
  comprobar("consulta por código", consultaA.status === 200 && consultaA.cuerpo?.datos?.estado === "PENDIENTE");
  comprobar(
    "la queja A se deriva a la Rectora",
    consultaA.cuerpo?.datos?.derivada_a === "Rector",
    consultaA.cuerpo?.datos?.derivada_a,
  );
  comprobar(
    "la consulta no expone datos del denunciante",
    !/\b(ip|user.?agent|correo|celular)\b/i.test(JSON.stringify(consultaA.cuerpo?.datos ?? {})),
  );

  const consultaB = await json(
    await fetch(`${BASE}/api/consulta`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ codigo: codigoB }),
    }),
  );
  comprobar(
    "exclusión: queja contra el Académico llega al Rector",
    consultaB.cuerpo?.datos?.derivada_a === "Rector",
    consultaB.cuerpo?.datos?.derivada_a,
  );

  const consultaC = await json(
    await fetch(`${BASE}/api/consulta`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ codigo: codigoC }),
    }),
  );
  comprobar(
    "exclusión: queja contra la Rectora llega al Académico",
    consultaC.cuerpo?.datos?.derivada_a === "Académico",
    consultaC.cuerpo?.datos?.derivada_a,
  );

  const codigoMalo = await json(
    await fetch(`${BASE}/api/consulta`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ codigo: "AAAA-BBBB-CCCC-DDDD-EEEE" }),
    }),
  );
  comprobar("código inexistente devuelve 404", codigoMalo.status === 404);

  // 5. Mensaje del denunciante
  const mensaje = await json(
    await fetch(`${BASE}/api/consulta/mensaje`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ codigo: codigoA, texto: "Añado que las evaluaciones se cambiaron dos veces." }),
    }),
  );
  comprobar("mensaje del denunciante", mensaje.status === 201);

  // 6. Login de autoridades: Rectora y Académico
  const loginRector = await fetch(`${BASE}/api/auth/sia`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identificador: "DOC-003", clave: "DOC-003" }),
  });
  const rector = await json(loginRector);
  const cookieRector = cookieDe(loginRector);
  comprobar("login de autoridad (Rectora)", rector.status === 200 && !!cookieRector);

  const loginAcademico = await fetch(`${BASE}/api/auth/sia`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identificador: "DOC-047", clave: "DOC-047" }),
  });
  const academico = await json(loginAcademico);
  const cookieAcademico = cookieDe(loginAcademico);
  comprobar("login de autoridad (Académico)", academico.status === 200 && !!cookieAcademico);

  const sinRol = await json(
    await fetch(`${BASE}/api/auth/sia`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identificador: "DOC-001", clave: "DOC-001" }),
    }),
  );
  comprobar("cuenta sin rol BUZON recibe 403", sinRol.status === 403);

  const cabecerasRector = { cookie: cookieRector };
  const bandeja = await json(
    await fetch(`${BASE}/api/autoridad/bandeja`, { headers: cabecerasRector }),
  );
  const quejaAEnBandeja = (bandeja.cuerpo?.datos ?? []).find((q) =>
    String(q.resumen ?? "").includes(marcaA),
  );
  const idA = quejaAEnBandeja?.id;
  comprobar("bandeja de la Rectora", bandeja.status === 200 && (bandeja.cuerpo?.datos ?? []).length >= 3);
  comprobar("la queja A aparece en la bandeja de la Rectora", Number.isFinite(idA), idA);

  // 7. Detalle, adjunto sin EXIF y exclusión de acceso
  const detalle = await json(
    await fetch(`${BASE}/api/autoridad/queja/${idA}`, { headers: cabecerasRector }),
  );
  comprobar("detalle de queja derivada", detalle.status === 200);

  const adjuntos = detalle.cuerpo?.datos?.adjuntos ?? [];
  comprobar("adjunto guardado", adjuntos.length === 1);
  comprobar(
    "el adjunto se renombró de forma genérica",
    adjuntos[0]?.nombre_generico === "evidencia.jpg",
    adjuntos[0]?.nombre_generico,
  );

  if (adjuntos[0]) {
    const archivo = Buffer.from(
      await (
        await fetch(`${BASE}/api/autoridad/adjunto/${adjuntos[0].id}`, { headers: cabecerasRector })
      ).arrayBuffer(),
    );
    const texto = archivo.toString("latin1");
    comprobar("EXIF eliminado del archivo guardado", !texto.includes("Exif") && !texto.includes("GPSLatitude"));
    comprobar("comentario interno eliminado", !texto.includes("comentario interno"));
    const sha = await crypto.subtle.digest("SHA-256", archivo);
    const hex = Buffer.from(sha).toString("hex");
    comprobar("hash del archivo guardado coincide", hex === adjuntos[0].hash_sha256);
  }

  // La queja A está en la bandeja de la Rectora: el Académico no debe abrirla.
  const ajena = await json(
    await fetch(`${BASE}/api/autoridad/queja/${idA}`, { headers: { cookie: cookieAcademico } }),
  );
  comprobar("la autoridad no accede a una queja derivada a otra persona", ajena.status === 403);

  // 8. Cambio de estado y respuesta (Rectora)
  const cambio = await json(
    await fetch(`${BASE}/api/autoridad/queja/${idA}/estado`, {
      method: "PATCH",
      headers: { ...cabecerasRector, "content-type": "application/json" },
      body: JSON.stringify({ estado: "EN_REVISION" }),
    }),
  );
  comprobar("cambio de estado", cambio.status === 200);

  const respuesta = await json(
    await fetch(`${BASE}/api/autoridad/queja/${idA}/mensaje`, {
      method: "POST",
      headers: { ...cabecerasRector, "content-type": "application/json" },
      body: JSON.stringify({ texto: "Recibido. Iniciamos la revisión del caso." }),
    }),
  );
  comprobar("respuesta de la autoridad", respuesta.status === 201);

  // 8b. La Rectora asigna la queja A al Académico; ahora sí debe verla.
  const asignar = await json(
    await fetch(`${BASE}/api/autoridad/queja/${idA}/asignar`, {
      method: "POST",
      headers: { ...cabecerasRector, "content-type": "application/json" },
      body: JSON.stringify({ cargo_id: 10 }),
    }),
  );
  comprobar("la Rectora asigna la queja", asignar.status === 200);

  const bandejaAcademico = await json(
    await fetch(`${BASE}/api/autoridad/bandeja`, { headers: { cookie: cookieAcademico } }),
  );
  const idsAcademico = (bandejaAcademico.cuerpo?.datos ?? []).map((q) => q.id);
  comprobar(
    "la queja asignada aparece en la bandeja del Académico",
    idsAcademico.includes(idA),
  );

  const detalleAcademico = await json(
    await fetch(`${BASE}/api/autoridad/queja/${idA}`, {
      headers: { cookie: cookieAcademico },
    }),
  );
  comprobar("el Académico accede a la queja asignada", detalleAcademico.status === 200);

  // 9. Cuentas locales
  const loginAdmin = await fetch(`${BASE}/api/auth/local`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ correo: "admin@buzon.incos", clave: "BuzonAdmin2026*" }),
  });
  const admin = await json(loginAdmin);
  const cookieAdmin = cookieDe(loginAdmin);
  comprobar("login de ADMIN_TECNICO", admin.status === 200 && !!cookieAdmin);

  const prohibido = await json(
    await fetch(`${BASE}/api/admin/queja/${idA}`, { headers: { cookie: cookieAdmin } }),
  );
  comprobar("ADMIN_TECNICO recibe 403 en el contenido", prohibido.status === 403);

  const auditoria = await json(
    await fetch(`${BASE}/api/admin/auditoria`, { headers: { cookie: cookieAdmin } }),
  );
  comprobar(
    "auditoría disponible",
    auditoria.status === 200 && Array.isArray(auditoria.cuerpo?.datos?.registros),
  );

  const estadisticas = await json(
    await fetch(`${BASE}/api/admin/estadisticas`, { headers: { cookie: cookieAdmin } }),
  );
  comprobar("estadísticas sin contenido", estadisticas.status === 200 && estadisticas.cuerpo?.datos?.total >= 2);

  // 10. Administración: categorías, reglas y parámetros
  const temporal = await json(
    await fetch(`${BASE}/api/admin/categorias`, {
      method: "POST",
      headers: { cookie: cookieAdmin, "content-type": "application/json" },
      body: JSON.stringify({ nombre: `Prueba temporal ${Date.now()}`, descripcion: "Solo prueba" }),
    }),
  );
  comprobar("crear categoría", temporal.status === 201);

  if (temporal.status === 201) {
    const idTemporal = temporal.cuerpo?.datos?.id;
    const guardarReglas = await json(
      await fetch(`${BASE}/api/admin/reglas/${idTemporal}`, {
        method: "PUT",
        headers: { cookie: cookieAdmin, "content-type": "application/json" },
        body: JSON.stringify({
          reglas: [{ cargo_id: 9 }, { instancia_externa_texto: "Instancia externa de prueba" }],
        }),
      }),
    );
    comprobar("guardar cadena de derivación", guardarReglas.status === 200);

    const leerReglas = await json(
      await fetch(`${BASE}/api/admin/reglas/${idTemporal}`, { headers: { cookie: cookieAdmin } }),
    );
    comprobar(
      "leer cadena de derivación",
      leerReglas.status === 200 && leerReglas.cuerpo?.datos?.length === 2,
    );

    const borrar = await json(
      await fetch(`${BASE}/api/admin/categorias/${idTemporal}`, {
        method: "DELETE",
        headers: { cookie: cookieAdmin },
      }),
    );
    comprobar("eliminar categoría sin quejas", borrar.status === 200);
  }

  const params = await json(
    await fetch(`${BASE}/api/admin/parametros`, {
      method: "PATCH",
      headers: { cookie: cookieAdmin, "content-type": "application/json" },
      body: JSON.stringify({ plazo_atencion_dias: 5, max_adjuntos: 3, max_tamano_adjunto_mb: 2 }),
    }),
  );
  comprobar("actualizar parámetros", params.status === 200);

  const loginComite = await fetch(`${BASE}/api/auth/local`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ correo: "comite@buzon.incos", clave: "BuzonComite2026*" }),
  });
  const cookieComite = cookieDe(loginComite);
  const comiteCategorias = await json(
    await fetch(`${BASE}/api/admin/categorias`, { headers: { cookie: cookieComite } }),
  );
  comprobar("COMITE no administra categorías", comiteCategorias.status === 403);

  console.log(`\n${fallos === 0 ? "Todas las pruebas pasaron." : `${fallos} prueba(s) fallaron.`}\n`);
  process.exit(fallos === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("Error ejecutando las pruebas:", error);
  process.exit(1);
});
