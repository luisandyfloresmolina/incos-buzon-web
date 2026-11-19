import { api, aviso, cargando, esc, fecha, fechaHora, insignia, toasta } from "./comun.js";

const $ = (id) => document.getElementById(id);

const panelLogin = $("panel-login");
const panelBandeja = $("panel-bandeja");
const formularioLogin = $("formulario-login");
const cajaAvisoLogin = $("aviso-login");
const listaQuejas = $("lista-quejas");
const detalle = $("detalle");
const detalleVacio = $("detalle-vacio");

const ETIQUETAS = {
  PENDIENTE: "Pendiente",
  EN_REVISION: "En revisión",
  EN_PROCESO: "En proceso",
  CERRADA: "Cerrada",
};

let quejaActual = null;
let quejasCargadas = [];
let filtroEstado = "TODAS";
let textoBusqueda = "";
let esRector = false;

// ------------------------------------------------------------ arranque
async function iniciar() {
  try {
    const perfil = await api("/api/autoridad/perfil");
    await mostrarBandeja(perfil);
  } catch {
    panelLogin?.classList.remove("oculto");
    panelBandeja?.classList.add("oculto");
  }
}

// --------------------------------------------------------------- login
formularioLogin?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  aviso(cajaAvisoLogin, "");

  const identificador = $("identificador").value.trim();
  const clave = $("clave").value;
  const boton = $("ingresar");

  if (!identificador || !clave) {
    return aviso(cajaAvisoLogin, "Ingrese su CI o correo y su clave.", "error");
  }

  cargando(boton, true, "Verificando con el SIA…");
  try {
    const datos = await api("/api/auth/sia", {
      metodo: "POST",
      cuerpo: { identificador, clave },
    });
    $("clave").value = "";
    mostrarBandeja({
      nombre: datos.persona?.nombres,
      cargos: datos.cargos,
      puede_asignar: (datos.cargos ?? []).some((cargo) => /rector/i.test(String(cargo))),
    });
  } catch (error) {
    aviso(cajaAvisoLogin, esc(error.message), "error");
  } finally {
    cargando(boton, false);
  }
});

$("salir")?.addEventListener("click", async () => {
  await api("/api/auth/salir", { metodo: "POST" }).catch(() => {});
  location.reload();
});

// ------------------------------------------------------------- bandeja
async function mostrarBandeja(perfil) {
  panelLogin?.classList.add("oculto");
  panelBandeja?.classList.remove("oculto");
  esRector = Boolean(perfil?.puede_asignar);

  const nombre = (perfil?.nombre ?? "Autoridad").trim();
  $("nombre-autoridad").textContent = nombre;
  $("cargos-autoridad").textContent = (perfil?.cargos ?? []).join(" · ");
  $("inicial-autoridad").textContent = nombre.charAt(0).toUpperCase() || "A";

  await cargarBandeja();
}

async function cargarBandeja() {
  try {
    quejasCargadas = await api("/api/autoridad/bandeja");
    actualizarResumen();
    pintarLista();
  } catch (error) {
    toasta(error.message, "error");
  }
}

function actualizarResumen() {
  const cuenta = (estado) => quejasCargadas.filter((q) => q.estado === estado).length;
  $("total-quejas").textContent = quejasCargadas.length;
  $("total-pendientes").textContent = cuenta("PENDIENTE");
  $("total-revision").textContent = cuenta("EN_REVISION");
  $("total-proceso").textContent = cuenta("EN_PROCESO");
  $("total-cerradas").textContent = cuenta("CERRADA");
}

function sinAcentos(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function vencimiento(fechaLimite) {
  if (!fechaLimite) return "";

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(`${String(fechaLimite).slice(0, 10)}T00:00:00`);
  const dias = Math.round((limite - hoy) / 86400000);

  if (Number.isNaN(dias)) return "";
  if (dias < 0) return `<span class="vencimiento vencida">Vencida hace ${-dias} día(s)</span>`;
  if (dias === 0) return `<span class="vencimiento hoy">Vence hoy</span>`;
  if (dias <= 2) return `<span class="vencimiento proxima">Vence en ${dias} día(s)</span>`;
  return `<span class="vencimiento">Vence en ${dias} días</span>`;
}

function tarjetaQueja(q) {
  const activa = quejaActual === q.id ? " activa" : "";
  const resumen = String(q.resumen ?? "").replace(/\s+/g, " ").trim();
  const nuevos = Number(q.sin_leer) > 0
    ? `<span class="etiqueta-nueva">${q.sin_leer} nuevo${Number(q.sin_leer) === 1 ? "" : "s"}</span>`
    : "";
  const adjuntos = Number(q.adjuntos) > 0
    ? `<span class="etiqueta-adjunto">${q.adjuntos} foto${Number(q.adjuntos) === 1 ? "" : "s"}</span>`
    : "";
  const asignada = esRector
    ? q.asignada_a ?? q.asignada_externa ?? "Sin asignar"
    : "";

  return `<button type="button" class="queja-card${activa}" data-id="${q.id}">
    <div class="queja-card-fila">
      <span class="queja-numero">Queja #${q.id}</span>
      ${insignia(q.estado)}
    </div>
    <h4 class="queja-categoria">${esc(q.categoria)}</h4>
    ${resumen ? `<p class="queja-resumen">${esc(resumen)}</p>` : ""}
    <div class="queja-card-pie">
      <span>Enviada el ${fecha(q.fecha_envio)}${asignada ? ` · Asignada a ${esc(asignada)}` : ""} · ${vencimiento(q.fecha_limite_atencion)}</span>
      <span class="queja-etiquetas">
        ${adjuntos}${nuevos}
        <span class="queja-ver">Ver detalle →</span>
      </span>
    </div>
  </button>`;
}

function pintarLista() {
  const busqueda = sinAcentos(textoBusqueda);
  const visibles = quejasCargadas.filter((q) => {
    const coincideEstado = filtroEstado === "TODAS" || q.estado === filtroEstado;
    const coincideTexto =
      !busqueda ||
      sinAcentos(`${q.id} ${q.categoria} ${q.resumen ?? ""}`).includes(busqueda);
    return coincideEstado && coincideTexto;
  });

  if (!visibles.length) {
    const mensaje = quejasCargadas.length
      ? "No hay quejas que coincidan con la búsqueda o el filtro."
      : esRector
        ? "No hay quejas registradas."
        : "No tiene quejas derivadas por ahora.";
    listaQuejas.innerHTML = `<p class="texto-suave">${mensaje}</p>`;
  } else {
    listaQuejas.innerHTML = visibles.map(tarjetaQueja).join("");
    listaQuejas.querySelectorAll(".queja-card").forEach((tarjeta) => {
      tarjeta.addEventListener("click", () => abrirQueja(Number(tarjeta.dataset.id)));
    });
  }

  const total = quejasCargadas.length;
  $("bandeja-contador").textContent = total
    ? `${total} queja${total === 1 ? "" : "s"} · ${visibles.length} visible${visibles.length === 1 ? "" : "s"}`
    : "Sin quejas por atender.";
}

// ------------------------------------------------------- búsqueda/filtros
$("buscar-quejas")?.addEventListener("input", (evento) => {
  textoBusqueda = evento.target.value;
  pintarLista();
});

$("filtros-estado")?.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-filtro]");
  if (!boton) return;
  filtroEstado = boton.dataset.filtro;
  $("filtros-estado").querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("activo", chip === boton);
  });
  pintarLista();
});

// -------------------------------------------------------------- detalle
async function abrirQueja(id) {
  try {
    const q = await api(`/api/autoridad/queja/${id}`);
    quejaActual = id;

    detalleVacio.classList.add("oculto");
    detalle.classList.remove("oculto");

    $("detalle-titulo").textContent = `Queja #${q.id}`;
    $("detalle-estado").innerHTML = insignia(q.estado);
    $("detalle-meta").innerHTML = `
      <span class="dato"><strong>Categoría:</strong> ${esc(q.categoria)}</span>
      <span class="dato"><strong>Enviada:</strong> ${fecha(q.fecha_envio)}</span>
      <span class="dato"><strong>Límite:</strong> ${fecha(q.fecha_limite_atencion)} ${vencimiento(q.fecha_limite_atencion)}</span>
      <span class="dato"><strong>Derivación:</strong> ${esc(q.derivacion_actual)}</span>
      ${q.cargo_involucrado ? `<span class="dato"><strong>Cargo señalado:</strong> ${esc(q.cargo_involucrado)}</span>` : ""}
    `;
    $("detalle-texto").textContent = q.descripcion;

    const adjuntos = q.adjuntos ?? [];
    $("detalle-adjuntos").innerHTML = adjuntos.length
      ? adjuntos
          .map((a) => {
            const kb = Math.max(1, Math.round(Number(a.tamano_bytes) / 1024));
            return `<a class="adjunto" href="/api/autoridad/adjunto/${a.id}" target="_blank" rel="noopener">
              <img src="/api/autoridad/adjunto/${a.id}" alt="Evidencia de la queja #${q.id}" loading="lazy" />
              <span>${esc(a.nombre_generico)} · ${kb} KB</span>
            </a>`;
          })
          .join("")
      : '<p class="texto-suave texto-pequeno">Sin adjuntos.</p>';

    $("detalle-historial").innerHTML = (q.historial ?? []).length
      ? q.historial
          .map(
            (h) => `<li>
              <strong>${h.estado_anterior ? esc(ETIQUETAS[h.estado_anterior] ?? h.estado_anterior) + " → " : ""}${esc(ETIQUETAS[h.estado_nuevo] ?? h.estado_nuevo)}</strong>
              <span>${fechaHora(h.fecha_hora)}</span>
            </li>`,
          )
          .join("")
      : '<li><span>Sin cambios registrados.</span></li>';

    $("detalle-mensajes").innerHTML = (q.mensajes ?? []).length
      ? q.mensajes
          .map(
            (m) => `<div class="mensaje ${m.autor}">
              <div class="meta">${m.autor === "AUTORIDAD" ? "Autoridad" : "Denunciante"} · ${fechaHora(m.fecha_hora)}</div>
              ${esc(m.texto)}
            </div>`,
          )
          .join("")
      : '<p class="texto-suave texto-pequeno">Sin mensajes.</p>';

    $("nuevo-estado").value = q.estado;
    $("nuevo-estado").disabled = q.estado === "CERRADA";
    $("responder").classList.toggle("oculto", q.estado === "CERRADA");

    const bloqueAsignacion = $("asignacion");
    const puedeAsignar = Boolean(q.puede_asignar) && q.estado !== "CERRADA";
    bloqueAsignacion?.classList.toggle("oculto", !puedeAsignar);

    if (puedeAsignar) {
      const actual = Number(q.derivacion_cargo_id ?? 0);
      const acusado = Number(q.cargo_involucrado_id ?? 0);
      const opciones = (q.destinos ?? []).filter(
        (d) => d.personaId && d.cargoId !== actual && d.cargoId !== acusado,
      );
      $("destino-asignacion").innerHTML = opciones.length
        ? '<option value="">Seleccione una autoridad…</option>' +
          opciones
            .map(
              (d) =>
                `<option value="${d.cargoId}">${esc(d.cargoNombre)} · ${esc(d.nombreCompleto)}</option>`,
            )
            .join("")
        : '<option value="">No hay otra autoridad disponible</option>';
    }

    pintarLista();

    if (window.matchMedia("(max-width: 980px)").matches) {
      detalle.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    await cargarBandeja();
  } catch (error) {
    toasta(error.message, "error");
  }
}

// --------------------------------------------------------- asignar queja
$("asignar-queja")?.addEventListener("click", async () => {
  if (!quejaActual) return;

  const destino = Number($("destino-asignacion").value);
  if (!destino) return toasta("Seleccione una autoridad de destino.", "error");

  const boton = $("asignar-queja");
  cargando(boton, true, "Asignando…");
  try {
    const resultado = await api(`/api/autoridad/queja/${quejaActual}/asignar`, {
      metodo: "POST",
      cuerpo: { cargo_id: destino },
    });
    toasta(`Queja asignada a ${resultado.cargo}.`, "exito");
    await abrirQueja(quejaActual);
  } catch (error) {
    toasta(error.message, "error");
  } finally {
    cargando(boton, false);
  }
});

// -------------------------------------------------------- cambiar estado
$("guardar-estado")?.addEventListener("click", async () => {
  if (!quejaActual) return;
  const estado = $("nuevo-estado").value;
  const boton = $("guardar-estado");
  cargando(boton, true, "Guardando…");
  try {
    await api(`/api/autoridad/queja/${quejaActual}/estado`, {
      metodo: "PATCH",
      cuerpo: { estado },
    });
    toasta("Estado actualizado.", "exito");
    await abrirQueja(quejaActual);
  } catch (error) {
    toasta(error.message, "error");
  } finally {
    cargando(boton, false);
  }
});

// -------------------------------------------------------------- responder
$("formulario-respuesta")?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (!quejaActual) return;

  const texto = $("respuesta-texto").value.trim();
  if (!texto) return toasta("Escriba una respuesta.", "error");

  const boton = $("enviar-respuesta");
  cargando(boton, true, "Enviando…");
  try {
    await api(`/api/autoridad/queja/${quejaActual}/mensaje`, {
      metodo: "POST",
      cuerpo: { texto },
    });
    $("respuesta-texto").value = "";
    toasta("Respuesta enviada.", "exito");
    await abrirQueja(quejaActual);
  } catch (error) {
    toasta(error.message, "error");
  } finally {
    cargando(boton, false);
  }
});

iniciar();
