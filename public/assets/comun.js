/* Utilidades compartidas por todas las pantallas. */

export async function api(ruta, opciones = {}) {
  const config = {
    method: opciones.metodo ?? "GET",
    credentials: "same-origin",
    headers: {
      "X-Sistema": "BUZON",
    },
  };

  if (opciones.cuerpo !== undefined) {
    config.headers["content-type"] = "application/json";
    config.body = JSON.stringify(opciones.cuerpo);
  }
  if (opciones.form) config.body = opciones.form;

  const respuesta = await fetch(ruta, config);
  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    /* respuesta sin JSON */
  }

  if (!respuesta.ok || datos?.exito === false) {
    const error = new Error(datos?.error?.mensaje || `Error ${respuesta.status}`);
    error.codigo = datos?.error?.codigo;
    error.status = respuesta.status;
    throw error;
  }
  return datos?.datos;
}

export function esc(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

export function fecha(valor) {
  if (!valor) return "—";
  const partes = String(valor).slice(0, 10).split("-");
  if (partes.length !== 3) return esc(valor);
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function fechaHora(valor) {
  if (!valor) return "—";
  const texto = String(valor);
  const hora = texto.includes("T") ? texto.slice(11, 16) : "";
  return hora ? `${fecha(texto)} · ${hora}` : fecha(texto);
}

export function insignia(estado) {
  const etiquetas = {
    PENDIENTE: "Pendiente",
    EN_REVISION: "En revisión",
    EN_PROCESO: "En proceso",
    CERRADA: "Cerrada",
  };
  return `<span class="insignia ${esc(estado)}">${esc(etiquetas[estado] ?? estado)}</span>`;
}

let toastaActual = null;

export function toasta(mensaje, tipo = "info") {
  if (toastaActual) toastaActual.remove();
  const nodo = document.createElement("div");
  nodo.className = `toasta ${tipo}`;
  nodo.textContent = mensaje;
  document.body.appendChild(nodo);
  toastaActual = nodo;
  setTimeout(() => {
    nodo.remove();
    if (toastaActual === nodo) toastaActual = null;
  }, 5200);
}

export function aviso(elemento, mensaje, tipo = "error") {
  if (!elemento) return;
  if (!mensaje) {
    elemento.className = "oculto";
    elemento.innerHTML = "";
    return;
  }
  elemento.className = `alerta ${tipo}`;
  elemento.innerHTML = mensaje;
}

export function cargando(boton, activo, textoActivo = "Procesando…") {
  if (!boton) return;
  if (activo) {
    boton.dataset.texto = boton.textContent;
    boton.disabled = true;
    boton.textContent = textoActivo;
  } else {
    boton.disabled = false;
    if (boton.dataset.texto) boton.textContent = boton.dataset.texto;
  }
}
