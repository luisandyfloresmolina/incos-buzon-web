/**
 * Acceso único del Buzón.
 *
 * Un solo formulario detecta si la cuenta es una autoridad del SIA o una
 * cuenta local (administración/comité). Según el rol, se monta la bandeja de
 * autoridades o el panel administrativo dentro de la misma página.
 */
import { api, aviso, cargando, esc } from "./comun.js";

const $ = (id) => document.getElementById(id);

const panelLogin = $("panel-login-unificado");
const panelUnificado = $("panel-unificado");
const contenido = $("contenido-panel");
const navSesion = $("nav-sesion");
const usuarioSesion = $("usuario-sesion");
const cajaAviso = $("aviso-login-unificado");

let rolActual = null;
let montando = false;

// ------------------------------------------------------------- arranque
async function iniciar() {
  try {
    const perfil = await api("/api/auth/perfil");
    await mostrarPanel(perfil);
  } catch {
    mostrarLogin();
  }
}

function mostrarLogin() {
  panelLogin.classList.remove("oculto");
  panelUnificado.classList.add("oculto");
  navSesion.classList.add("oculto");
  contenido.innerHTML = "";
  rolActual = null;
}

function pintarUsuario(perfil) {
  const nombre = String(perfil?.nombre ?? "Usuario").trim() || "Usuario";
  let detalle = "";
  if (perfil?.tipo === "AUTORIDAD") {
    detalle = (perfil.cargos ?? []).join(" · ");
  } else {
    detalle = perfil?.rol ?? "";
  }
  usuarioSesion.textContent = detalle ? `${nombre} · ${detalle}` : nombre;
}

async function mostrarPanel(perfil) {
  if (montando) return;
  montando = true;

  try {
    panelLogin.classList.add("oculto");
    panelUnificado.classList.remove("oculto");
    navSesion.classList.remove("oculto");
    pintarUsuario(perfil);

    contenido.innerHTML = '<div class="tarjeta"><p class="texto-suave">Cargando panel…</p></div>';

    const esAutoridad = perfil?.tipo === "AUTORIDAD";
    const ruta = esAutoridad ? "/autoridad.html?embed=1" : "/admin.html?embed=1";
    const selector = esAutoridad ? "#panel-bandeja" : "#panel-admin";

    const respuesta = await fetch(ruta, { credentials: "same-origin" });
    if (!respuesta.ok) throw new Error("No se pudo cargar el panel.");

    const html = await respuesta.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const seccion = doc.querySelector(selector);
    if (!seccion) throw new Error("El panel no tiene el formato esperado.");

    contenido.innerHTML = seccion.outerHTML;
    rolActual = esAutoridad ? "AUTORIDAD" : "ADMIN";

    // El HTML se inserta sin ejecutar sus scripts; ahora cargamos el módulo
    // que ya conoce los elementos del panel.
    await import(esAutoridad ? "/assets/autoridad.js?embed=1" : "/assets/admin.js?embed=1");
  } catch (error) {
    contenido.innerHTML = `
      <div class="tarjeta">
        <h3>No se pudo abrir el panel</h3>
        <p class="texto-suave">${esc(error?.message ?? "Error inesperado.")}</p>
        <button class="boton secundario" type="button" id="reintentar-panel">Volver a intentar</button>
      </div>`;
    $("reintentar-panel")?.addEventListener("click", () => location.reload());
  } finally {
    montando = false;
  }
}

// ---------------------------------------------------------------- login
$("formulario-login-unificado").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  aviso(cajaAviso, "");

  const identificador = $("identificador-unificado").value.trim();
  const clave = $("clave-unificada").value;
  const boton = $("ingresar-unificado");

  if (!identificador || !clave) {
    return aviso(cajaAviso, "Ingrese su CI o correo y su clave.", "error");
  }

  cargando(boton, true, "Verificando…");
  try {
    const perfil = await api("/api/auth/entrar", {
      metodo: "POST",
      cuerpo: { identificador, clave },
    });
    $("clave-unificada").value = "";
    await mostrarPanel(perfil);
  } catch (error) {
    aviso(cajaAviso, esc(error?.message ?? "No se pudo ingresar."), "error");
  } finally {
    cargando(boton, false);
  }
});

// --------------------------------------------------------------- salir
$("salir-panel").addEventListener("click", async () => {
  await api("/api/auth/salir", { metodo: "POST" }).catch(() => {});
  location.reload();
});

iniciar();
