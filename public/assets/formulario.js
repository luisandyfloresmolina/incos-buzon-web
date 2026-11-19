import { api, aviso, cargando, esc, toasta } from "./comun.js";

const formulario = document.getElementById("formulario-queja");
const selectCategoria = document.getElementById("categoria");
const selectCargo = document.getElementById("cargo-involucrado");
const descripcion = document.getElementById("descripcion");
const contador = document.getElementById("contador");
const archivos = document.getElementById("adjuntos");
const listaArchivos = document.getElementById("lista-archivos");
const botonEnviar = document.getElementById("enviar");
const cajaAviso = document.getElementById("aviso-formulario");
const panelResultado = document.getElementById("resultado");
const codigoTexto = document.getElementById("codigo-generado");
const panelFormulario = document.getElementById("panel-formulario");

let config = { maxAdjuntos: 3, maxTamanoMB: 2, turnstileSiteKey: "" };

function pintarContador() {
  const largo = descripcion.value.trim().length;
  contador.textContent = `${largo} / 6000 caracteres (mínimo 30)`;
  contador.classList.toggle("ok", largo >= 30);
}

function pintarArchivos() {
  const elegidos = Array.from(archivos.files ?? []);
  listaArchivos.innerHTML = elegidos.length
    ? elegidos
        .map(
          (f) =>
            `<li>${esc(f.name)} · ${(f.size / 1024 / 1024).toFixed(2)} MB</li>`,
        )
        .join("")
    : '<li class="texto-suave">Sin archivos seleccionados.</li>';
}

function validarArchivos() {
  const elegidos = Array.from(archivos.files ?? []);
  if (elegidos.length > config.maxAdjuntos) {
    return `Puede adjuntar como máximo ${config.maxAdjuntos} archivos.`;
  }
  for (const archivo of elegidos) {
    if (!["image/jpeg", "image/png"].includes(archivo.type)) {
      return `"${archivo.name}" no es JPG ni PNG.`;
    }
    if (archivo.size > config.maxTamanoMB * 1024 * 1024) {
      return `"${archivo.name}" supera los ${config.maxTamanoMB} MB.`;
    }
  }
  return null;
}

async function iniciar() {
  try {
    config = { ...config, ...(await api("/api/config")) };
  } catch {
    aviso(cajaAviso, "No se pudo cargar el formulario. Recargue la página.", "error");
    return;
  }

  selectCategoria.innerHTML =
    '<option value="">Seleccione una categoría…</option>' +
    config.categorias.map((c) => `<option value="${c.id}">${esc(c.nombre)}</option>`).join("");

  selectCargo.innerHTML =
    '<option value="">No involucra a ninguna autoridad</option>' +
    config.cargos.map((c) => `<option value="${c.id}">${esc(c.nombre)}</option>`).join("");

  document.getElementById("limite-adjuntos").textContent =
    `Hasta ${config.maxAdjuntos} archivos JPG o PNG de ${config.maxTamanoMB} MB cada uno.`;

  if (!config.maxAdjuntos) {
    document.getElementById("campo-adjuntos").classList.add("oculto");
  }

  if (config.turnstileSiteKey) {
    const contenedor = document.getElementById("turnstile");
    const widget = document.createElement("div");
    widget.className = "cf-turnstile";
    widget.dataset.sitekey = config.turnstileSiteKey;
    widget.dataset.theme = "light";
    contenedor.appendChild(widget);

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

descripcion.addEventListener("input", pintarContador);
archivos.addEventListener("change", () => {
  aviso(cajaAviso, "");
  pintarArchivos();
});

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  aviso(cajaAviso, "");

  const categoria = selectCategoria.value;
  const texto = descripcion.value.trim();
  const confirmacion = document.getElementById("confirmacion");

  if (!categoria) return aviso(cajaAviso, "Seleccione una categoría.", "error");
  if (texto.length < 30) {
    return aviso(cajaAviso, "La descripción debe tener al menos 30 caracteres.", "error");
  }
  if (!confirmacion.checked) {
    return aviso(cajaAviso, "Debe confirmar que leyó el aviso de privacidad.", "error");
  }

  const problemaArchivos = validarArchivos();
  if (problemaArchivos) return aviso(cajaAviso, problemaArchivos, "error");

  if (config.turnstileSiteKey) {
    const token = document.querySelector('[name="cf-turnstile-response"]')?.value;
    if (!token) return aviso(cajaAviso, "Complete la verificación anti-spam.", "error");
  }

  const datos = new FormData();
  datos.append("categoria_id", categoria);
  datos.append("descripcion", texto);
  datos.append("cargo_involucrado_id", selectCargo.value);
  datos.append(
    "turnstile_token",
    document.querySelector('[name="cf-turnstile-response"]')?.value ?? "",
  );
  for (const archivo of archivos.files ?? []) datos.append("adjuntos", archivo);

  cargando(botonEnviar, true, "Enviando queja…");
  try {
    const resultado = await api("/api/quejas", { metodo: "POST", form: datos });
    codigoTexto.textContent = resultado.codigo;
    panelFormulario.classList.add("oculto");
    panelResultado.classList.remove("oculto");
    panelResultado.dataset.codigo = resultado.codigo;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    aviso(cajaAviso, esc(error.message), "error");
    if (window.turnstile) window.turnstile.reset();
  } finally {
    cargando(botonEnviar, false);
  }
});

document.getElementById("copiar-codigo").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codigoTexto.textContent);
    toasta("Código copiado.", "exito");
  } catch {
    toasta("Seleccione y copie el código manualmente.", "error");
  }
});

document.getElementById("descargar-codigo").addEventListener("click", () => {
  const codigo = codigoTexto.textContent;
  const contenido =
    `Buzón de quejas · INCOS\n\n` +
    `Código de seguimiento:\n${codigo}\n\n` +
    `Guárdelo. Es la única forma de consultar su queja y no se puede recuperar.\n` +
    `Consulte en: ${location.origin}/consulta\n`;
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob([contenido], { type: "text/plain" }));
  enlace.download = "codigo-seguimiento.txt";
  enlace.click();
  URL.revokeObjectURL(enlace.href);
});

iniciar();
pintarContador();
pintarArchivos();
