import { api, aviso, cargando, esc, fechaHora, toasta } from "./comun.js";
import qrcode from "./qrcode.mjs";

const $ = (id) => document.getElementById(id);

let sesion = null;
let cargos = [];
let categorias = [];
let paginaAuditoria = 1;
let totalAuditoria = 0;
let qrGenerado = false;
let paginaEvidencias = 1;
let paginasEvidencias = 1;

// ------------------------------------------------------------ arranque
async function iniciar() {
  try {
    const perfil = await api("/api/admin/perfil");
    await entrar(perfil);
  } catch {
    mostrarLogin();
  }
}

function mostrarLogin() {
  $("panel-login-admin")?.classList.remove("oculto");
  $("panel-admin")?.classList.add("oculto");
}

function manejarError(error) {
  toasta(error.message, "error");
  if (error.status === 401) mostrarLogin();
}

// --------------------------------------------------------------- login
$("formulario-login-admin")?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  aviso($("aviso-login-admin"), "");

  const correo = $("correo-admin").value.trim();
  const clave = $("clave-admin").value;
  const boton = $("ingresar-admin");

  if (!correo || !clave) return aviso($("aviso-login-admin"), "Ingrese correo y clave.", "error");

  if (!correo.includes("@")) {
    return aviso(
      $("aviso-login-admin"),
      'Ese dato no es un correo local. Si es autoridad del SIA, <a href="/autoridad.html">entre por Autoridades</a> con su CI (por ejemplo, <strong>DOC-003</strong>).',
      "aviso",
    );
  }

  cargando(boton, true, "Verificando…");
  try {
    const datos = await api("/api/auth/local", { metodo: "POST", cuerpo: { correo, clave } });
    $("clave-admin").value = "";
    entrar(datos);
  } catch (error) {
    aviso($("aviso-login-admin"), esc(error.message), "error");
  } finally {
    cargando(boton, false);
  }
});

$("salir-admin")?.addEventListener("click", async () => {
  await api("/api/auth/salir", { metodo: "POST" }).catch(() => {});
  location.reload();
});

// --------------------------------------------------------------- entrar
async function entrar(datos) {
  sesion = datos;
  $("panel-login-admin")?.classList.add("oculto");
  $("panel-admin")?.classList.remove("oculto");
  $("nombre-admin").textContent = datos.nombre ?? "Cuenta local";
  $("rol-admin").textContent = datos.rol;

  const esAdmin = datos.rol === "ADMIN_TECNICO";
  document.querySelectorAll("#pestanas button").forEach((boton) => {
    const soloAdmin = ["categorias", "reglas", "usuarios", "parametros"].includes(boton.dataset.pestana);
    if (soloAdmin && !esAdmin) boton.classList.add("oculto");
  });

  if (esAdmin) {
    await cargarCategorias();
    await cargarCargos();
  }
  mostrarPestana(esAdmin ? "categorias" : "auditoria");
}

function mostrarPestana(nombre) {
  document.querySelectorAll("#pestanas button").forEach((b) =>
    b.classList.toggle("activa", b.dataset.pestana === nombre),
  );
  document.querySelectorAll("#panel-admin section[id^='seccion-']").forEach((s) => {
    s.classList.toggle("oculto", s.id !== `seccion-${nombre}`);
  });

  if (nombre === "categorias") cargarCategorias().catch(manejarError);
  if (nombre === "reglas") cargarCategorias().then(() => cargarReglas()).catch(manejarError);
  if (nombre === "usuarios") cargarUsuarios().catch(manejarError);
  if (nombre === "parametros") cargarParametros().catch(manejarError);
  if (nombre === "evidencias") cargarEvidencias(paginaEvidencias).catch(manejarError);
  if (nombre === "qr") generarQrs();
  if (nombre === "auditoria") cargarAuditoria().catch(manejarError);
  if (nombre === "estadisticas") cargarEstadisticas().catch(manejarError);
}

$("pestanas").addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-pestana]");
  if (boton) mostrarPestana(boton.dataset.pestana);
});

// ------------------------------------------------------------ evidencias
async function cargarEvidencias(pagina = 1) {
  paginaEvidencias = Math.max(1, pagina);
  const datos = await api(`/api/admin/evidencias?pagina=${paginaEvidencias}`);

  const rejilla = $("rejilla-evidencias");
  const evidencias = datos.evidencias ?? [];
  paginasEvidencias = Math.max(1, Math.ceil(datos.total / datos.limite));

  if (!evidencias.length) {
    rejilla.innerHTML = `<p class="texto-suave">Todavía no hay imágenes de evidencia.</p>`;
  } else {
    rejilla.innerHTML = evidencias
      .map((e) => {
        const kb = Math.max(1, Math.round(Number(e.tamano_bytes) / 1024));
        return `<a class="evidencia" href="/api/admin/evidencia/${e.id}" target="_blank" rel="noopener">
          <img src="/api/admin/evidencia/${e.id}" alt="Evidencia de la queja ${e.queja_id}" loading="lazy" />
          <div class="evidencia-meta">
            <strong>Queja #${e.queja_id}</strong>
            <span>${esc(e.categoria)} · ${esc(e.fecha_envio)}</span>
            <span>${esc(e.estado)} · ${kb} KB</span>
          </div>
        </a>`;
      })
      .join("");
  }

  $("evidencias-pagina").textContent = `Página ${paginaEvidencias} de ${paginasEvidencias}`;
  $("evidencias-anterior").disabled = paginaEvidencias <= 1;
  $("evidencias-siguiente").disabled = paginaEvidencias >= paginasEvidencias;
}

$("evidencias-anterior").addEventListener("click", () => {
  if (paginaEvidencias > 1) cargarEvidencias(paginaEvidencias - 1).catch(manejarError);
});

$("evidencias-siguiente").addEventListener("click", () => {
  if (paginaEvidencias < paginasEvidencias) {
    cargarEvidencias(paginaEvidencias + 1).catch(manejarError);
  }
});

// ------------------------------------------------------------ códigos QR
const DESTINOS_QR = [
  { lienzo: "qr-queja", url: "qr-url-queja", ruta: "/queja", archivo: "buzon-enviar-queja.svg" },
  { lienzo: "qr-consulta", url: "qr-url-consulta", ruta: "/consulta", archivo: "buzon-consultar-queja.svg" },
];

/** Dibuja los QR con la dirección real del sitio (sirve también con dominio propio). */
function generarQrs() {
  if (qrGenerado) return;

  for (const destino of DESTINOS_QR) {
    const url = location.origin + destino.ruta;
    const qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    $(destino.lienzo).innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    $(destino.url).textContent = url;
  }

  qrGenerado = true;
}

$("imprimir-qr").addEventListener("click", () => window.print());

$("guardar-qr").addEventListener("click", () => {
  for (const destino of DESTINOS_QR) {
    const svg = $(destino.lienzo).querySelector("svg");
    if (!svg) continue;

    const texto = '<?xml version="1.0" encoding="UTF-8"?>\n' + svg.outerHTML;
    const blob = new Blob([texto], { type: "image/svg+xml;charset=utf-8" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = destino.archivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 3000);
  }
});

// ---------------------------------------------------------- categorías
async function cargarCategorias() {
  categorias = await api("/api/admin/categorias");
  $("cuerpo-categorias").innerHTML = categorias.length
    ? categorias
        .map(
          (c) => `<tr>
            <td>${esc(c.nombre)}</td>
            <td class="texto-suave">${esc(c.descripcion ?? "")}</td>
            <td>${c.quejas}</td>
            <td>${c.activa ? "Activa" : "Inactiva"}</td>
            <td>
              <button class="boton suave" data-editar="${c.id}" type="button">Editar</button>
              <button class="boton secundario" data-estado="${c.id}" type="button">${c.activa ? "Desactivar" : "Activar"}</button>
              <button class="boton peligro" data-eliminar="${c.id}" type="button">Eliminar</button>
            </td>
          </tr>`,
        )
        .join("")
    : '<tr><td colspan="5" class="texto-suave">Sin categorías.</td></tr>';

  const selector = $("reglas-categoria");
  selector.innerHTML = categorias
    .map((c) => `<option value="${c.id}">${esc(c.nombre)}</option>`)
    .join("");
}

$("formulario-categoria").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  aviso($("aviso-categoria"), "");

  const id = $("cat-id").value;
  const nombre = $("cat-nombre").value.trim();
  const descripcion = $("cat-descripcion").value.trim();
  if (nombre.length < 2) return aviso($("aviso-categoria"), "Escriba un nombre válido.", "error");

  const boton = $("cat-guardar");
  cargando(boton, true, "Guardando…");
  try {
    if (id) {
      await api(`/api/admin/categorias/${id}`, {
        metodo: "PATCH",
        cuerpo: { nombre, descripcion },
      });
      toasta("Categoría actualizada.", "exito");
    } else {
      await api("/api/admin/categorias", { metodo: "POST", cuerpo: { nombre, descripcion } });
      toasta("Categoría creada.", "exito");
    }
    limpiarCategoria();
    await cargarCategorias();
  } catch (error) {
    aviso($("aviso-categoria"), esc(error.message), "error");
  } finally {
    cargando(boton, false);
  }
});

function limpiarCategoria() {
  $("cat-id").value = "";
  $("cat-nombre").value = "";
  $("cat-descripcion").value = "";
  $("titulo-categoria").textContent = "Nueva categoría";
  $("cat-guardar").textContent = "Agregar categoría";
  $("cat-cancelar").classList.add("oculto");
}

$("cat-cancelar").addEventListener("click", limpiarCategoria);

$("cuerpo-categorias").addEventListener("click", async (evento) => {
  const boton = evento.target.closest("button");
  if (!boton) return;

  const idEditar = boton.dataset.editar;
  const idEstado = boton.dataset.estado;
  const idEliminar = boton.dataset.eliminar;

  if (idEditar) {
    const c = categorias.find((x) => String(x.id) === idEditar);
    if (!c) return;
    $("cat-id").value = c.id;
    $("cat-nombre").value = c.nombre;
    $("cat-descripcion").value = c.descripcion ?? "";
    $("titulo-categoria").textContent = "Editar categoría";
    $("cat-guardar").textContent = "Guardar cambios";
    $("cat-cancelar").classList.remove("oculto");
    $("cat-nombre").focus();
  }

  if (idEstado) {
    const c = categorias.find((x) => String(x.id) === idEstado);
    try {
      await api(`/api/admin/categorias/${idEstado}`, {
        metodo: "PATCH",
        cuerpo: { activa: !c.activa },
      });
      await cargarCategorias();
    } catch (error) {
      manejarError(error);
    }
  }

  if (idEliminar) {
    if (!confirm("¿Eliminar esta categoría? Solo es posible si no tiene quejas.")) return;
    try {
      await api(`/api/admin/categorias/${idEliminar}`, { metodo: "DELETE" });
      toasta("Categoría eliminada.", "exito");
      await cargarCategorias();
    } catch (error) {
      manejarError(error);
    }
  }
});

// ------------------------------------------------------------- cargos
async function cargarCargos() {
  try {
    const config = await api("/api/config");
    cargos = config.cargos ?? [];
  } catch {
    cargos = [];
  }
}

// -------------------------------------------------------------- reglas
async function cargarReglas() {
  const categoriaId = $("reglas-categoria").value;
  if (!categoriaId) {
    $("reglas-lista").innerHTML = "";
    return;
  }

  const reglas = await api(`/api/admin/reglas/${categoriaId}`);
  $("reglas-lista").innerHTML = "";
  reglas.forEach((r) => agregarFilaRegla(r.cargo_id, r.instancia_externa_texto));
}

function agregarFilaRegla(cargoId = null, externo = null) {
  const contenedor = document.createElement("div");
  contenedor.className = "fila-regla";
  contenedor.style.cssText =
    "display:flex; gap:10px; align-items:center; margin-bottom:10px; flex-wrap:wrap;";

  const numero = document.createElement("strong");
  numero.textContent = String($("reglas-lista").children.length + 1);

  const selector = document.createElement("select");
  selector.className = "regla-cargo";
  selector.style.maxWidth = "260px";
  selector.innerHTML =
    cargos.map((c) => `<option value="${c.id}">${esc(c.nombre)}</option>`).join("") +
    '<option value="externa">Instancia externa…</option>';

  const texto = document.createElement("input");
  texto.type = "text";
  texto.className = "regla-externa";
  texto.placeholder = "Nombre de la instancia externa";
  texto.style.flex = "1";
  texto.style.minWidth = "220px";

  const quitar = document.createElement("button");
  quitar.type = "button";
  quitar.className = "boton peligro";
  quitar.textContent = "Quitar";
  quitar.addEventListener("click", () => {
    contenedor.remove();
    renumerarReglas();
  });

  if (externo) selector.value = "externa";
  else if (cargoId) selector.value = String(cargoId);
  texto.value = externo ?? "";

  const alternar = () => {
    const esExterna = selector.value === "externa";
    texto.classList.toggle("oculto", !esExterna);
  };
  selector.addEventListener("change", alternar);
  alternar();

  contenedor.append(numero, selector, texto, quitar);
  $("reglas-lista").appendChild(contenedor);
}

function renumerarReglas() {
  Array.from($("reglas-lista").children).forEach((fila, indice) => {
    fila.querySelector("strong").textContent = String(indice + 1);
  });
}

$("agregar-regla").addEventListener("click", () => agregarFilaRegla());
$("reglas-categoria").addEventListener("change", () => cargarReglas().catch(manejarError));

$("guardar-reglas").addEventListener("click", async () => {
  const categoriaId = $("reglas-categoria").value;
  if (!categoriaId) return toasta("Seleccione una categoría.", "error");

  const filas = Array.from($("reglas-lista").children);
  if (filas.length === 0) return toasta("Agregue al menos un eslabón.", "error");

  const reglas = filas.map((fila) => {
    const valor = fila.querySelector(".regla-cargo").value;
    if (valor === "externa") {
      return { instancia_externa_texto: fila.querySelector(".regla-externa").value.trim() };
    }
    return { cargo_id: Number(valor) };
  });

  const boton = $("guardar-reglas");
  cargando(boton, true, "Guardando…");
  try {
    await api(`/api/admin/reglas/${categoriaId}`, { metodo: "PUT", cuerpo: { reglas } });
    toasta("Cadena guardada.", "exito");
    await cargarReglas();
  } catch (error) {
    manejarError(error);
  } finally {
    cargando(boton, false);
  }
});

// ------------------------------------------------------------ usuarios
async function cargarUsuarios() {
  const usuarios = await api("/api/admin/usuarios");
  $("cuerpo-usuarios").innerHTML = usuarios.length
    ? usuarios
        .map(
          (u) => `<tr>
            <td>${esc(u.nombres)} ${esc(u.apellidos)}</td>
            <td>${esc(u.correo_electronico)}</td>
            <td>${esc(u.rol)}</td>
            <td>${u.activo ? "Activa" : "Inactiva"}</td>
            <td>
              <button class="boton secundario" data-estado-usuario="${u.id}" data-activo="${u.activo ? 1 : 0}" type="button">
                ${u.activo ? "Desactivar" : "Activar"}
              </button>
              <button class="boton suave" data-clave="${u.id}" type="button">Cambiar clave</button>
            </td>
          </tr>`,
        )
        .join("")
    : '<tr><td colspan="5" class="texto-suave">Sin cuentas.</td></tr>';
}

$("formulario-usuario").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  aviso($("aviso-usuario"), "");

  const cuerpo = {
    nombres: $("u-nombres").value.trim(),
    apellidos: $("u-apellidos").value.trim(),
    correo: $("u-correo").value.trim(),
    clave: $("u-clave").value,
    rol: $("u-rol").value,
  };

  const boton = $("u-guardar");
  cargando(boton, true, "Creando…");
  try {
    await api("/api/admin/usuarios", { metodo: "POST", cuerpo });
    toasta("Cuenta creada.", "exito");
    $("formulario-usuario").reset();
    await cargarUsuarios();
  } catch (error) {
    aviso($("aviso-usuario"), esc(error.message), "error");
  } finally {
    cargando(boton, false);
  }
});

$("cuerpo-usuarios").addEventListener("click", async (evento) => {
  const boton = evento.target.closest("button");
  if (!boton) return;

  if (boton.dataset.estadoUsuario) {
    try {
      await api(`/api/admin/usuarios/${boton.dataset.estadoUsuario}`, {
        metodo: "PATCH",
        cuerpo: { activo: boton.dataset.activo === "1" ? 0 : 1 },
      });
      await cargarUsuarios();
    } catch (error) {
      manejarError(error);
    }
  }

  if (boton.dataset.clave) {
    const clave = prompt("Nueva clave (mínimo 10 caracteres):");
    if (!clave) return;
    if (clave.length < 10) return toasta("La clave es demasiado corta.", "error");
    try {
      await api(`/api/admin/usuarios/${boton.dataset.clave}`, {
        metodo: "PATCH",
        cuerpo: { clave },
      });
      toasta("Clave actualizada.", "exito");
    } catch (error) {
      manejarError(error);
    }
  }
});

// ---------------------------------------------------------- parámetros
async function cargarParametros() {
  const p = await api("/api/admin/parametros");
  $("p-plazo").value = p?.plazo_atencion_dias ?? 5;
  $("p-adjuntos").value = p?.max_adjuntos ?? 3;
  $("p-mb").value = p?.max_tamano_adjunto_mb ?? 2;
}

$("guardar-parametros").addEventListener("click", async () => {
  const boton = $("guardar-parametros");
  cargando(boton, true, "Guardando…");
  try {
    await api("/api/admin/parametros", {
      metodo: "PATCH",
      cuerpo: {
        plazo_atencion_dias: Number($("p-plazo").value),
        max_adjuntos: Number($("p-adjuntos").value),
        max_tamano_adjunto_mb: Number($("p-mb").value),
      },
    });
    toasta("Parámetros guardados.", "exito");
  } catch (error) {
    manejarError(error);
  } finally {
    cargando(boton, false);
  }
});

// ------------------------------------------------------------ auditoría
async function cargarAuditoria() {
  const datos = await api(`/api/admin/auditoria?pagina=${paginaAuditoria}&limite=50`);
  const filas = datos?.registros ?? [];
  totalAuditoria = datos?.total ?? filas.length;

  $("cuerpo-auditoria").innerHTML = filas.length
    ? filas
        .map(
          (a) => `<tr>
            <td>${a.id}</td>
            <td>${fechaHora(a.fecha_hora)}</td>
            <td>${esc(a.usuario ?? (a.persona_id ? "persona SIA #" + a.persona_id : "—"))}</td>
            <td>${esc(a.accion)}</td>
            <td>${esc(a.entidad ?? "—")}${a.entidad_id ? " #" + a.entidad_id : ""}</td>
          </tr>`,
        )
        .join("")
    : '<tr><td colspan="5" class="texto-suave">Sin registros.</td></tr>';

  const paginas = Math.max(1, Math.ceil(totalAuditoria / 50));
  $("aud-pagina").textContent = `Página ${paginaAuditoria} de ${paginas}`;
  $("aud-anterior").disabled = paginaAuditoria <= 1;
  $("aud-siguiente").disabled = paginaAuditoria >= paginas;
}

$("aud-anterior").addEventListener("click", () => {
  if (paginaAuditoria > 1) {
    paginaAuditoria--;
    cargarAuditoria().catch(manejarError);
  }
});

$("aud-siguiente").addEventListener("click", () => {
  paginaAuditoria++;
  cargarAuditoria().catch(manejarError);
});

// ---------------------------------------------------------- estadísticas
function barras(elemento, datos, etiqueta) {
  const maximo = Math.max(1, ...datos.map((d) => Number(d.n)));
  elemento.innerHTML = datos.length
    ? datos
        .map(
          (d) => `<div style="margin-bottom: 10px;">
            <div class="fila-botones" style="justify-content: space-between;">
              <span class="texto-pequeno">${esc(d[etiqueta] ?? d.estado ?? d.categoria ?? d.mes)}</span>
              <strong class="texto-pequeno">${d.n}</strong>
            </div>
            <div class="barra"><span style="width:${(Number(d.n) / maximo) * 100}%"></span></div>
          </div>`,
        )
        .join("")
    : '<p class="texto-suave texto-pequeno">Sin datos.</p>';
}

async function cargarEstadisticas() {
  const datos = await api("/api/admin/estadisticas");
  $("total-quejas").textContent = datos.total ?? 0;
  barras($("est-por-estado"), datos.porEstado ?? [], "estado");
  barras($("est-por-categoria"), datos.porCategoria ?? [], "categoria");
  barras($("est-por-mes"), datos.porMes ?? [], "mes");
}

iniciar();
