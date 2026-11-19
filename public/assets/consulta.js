import { api, aviso, cargando, esc, fecha, fechaHora, insignia, toasta } from "./comun.js";

const formulario = document.getElementById("formulario-consulta");
const campoCodigo = document.getElementById("codigo");
const boton = document.getElementById("buscar");
const cajaAviso = document.getElementById("aviso-consulta");
const resultado = document.getElementById("resultado");

let codigoActual = "";

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  aviso(cajaAviso, "");

  const codigo = campoCodigo.value.trim();
  if (codigo.length < 8) {
    return aviso(cajaAviso, "Ingrese el código completo de seguimiento.", "error");
  }

  cargando(boton, true, "Buscando…");
  try {
    const datos = await api("/api/consulta", { metodo: "POST", cuerpo: { codigo } });
    codigoActual = codigo;
    pintar(datos);
    resultado.classList.remove("oculto");
  } catch (error) {
    resultado.classList.add("oculto");
    aviso(cajaAviso, esc(error.message), "error");
  } finally {
    cargando(boton, false);
  }
});

function pintar(datos) {
  document.getElementById("estado-queja").innerHTML = insignia(datos.estado);
  document.getElementById("categoria-queja").textContent = datos.categoria;
  document.getElementById("fecha-queja").textContent = fecha(datos.fecha_envio);
  document.getElementById("limite-queja").textContent = datos.fecha_limite_atencion
    ? fecha(datos.fecha_limite_atencion)
    : "—";
  document.getElementById("derivada-queja").textContent = datos.derivada_a;
  document.getElementById("texto-queja").textContent = datos.descripcion;

  const historial = document.getElementById("historial");
  historial.innerHTML = (datos.historial ?? []).length
    ? datos.historial
        .map(
          (h) => `<li>
            <span class="texto-suave texto-pequeno">${fechaHora(h.fecha_hora)}</span><br />
            ${h.estado_anterior ? esc(h.estado_anterior) + " → " : ""}${esc(h.estado_nuevo)}
          </li>`,
        )
        .join("")
    : '<li class="texto-suave">Sin cambios de estado.</li>';

  const mensajes = document.getElementById("mensajes");
  mensajes.innerHTML = (datos.mensajes ?? []).length
    ? datos.mensajes
        .map(
          (m) => `<div class="mensaje ${m.autor}">
            <div class="meta">${m.autor === "AUTORIDAD" ? "Autoridad" : "Usted"} · ${fechaHora(m.fecha_hora)}</div>
            ${esc(m.texto)}
          </div>`,
        )
        .join("")
    : '<p class="texto-suave texto-pequeno">Todavía no hay mensajes.</p>';

  const cerrada = datos.estado === "CERRADA";
  document.getElementById("panel-respuesta").classList.toggle("oculto", cerrada);
}

document.getElementById("formulario-mensaje").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const caja = document.getElementById("aviso-mensaje");
  aviso(caja, "");

  const texto = document.getElementById("mensaje-texto").value.trim();
  if (!texto) return aviso(caja, "Escriba un mensaje.", "error");

  const botonEnviar = document.getElementById("enviar-mensaje");
  cargando(botonEnviar, true, "Enviando…");
  try {
    await api("/api/consulta/mensaje", {
      metodo: "POST",
      cuerpo: { codigo: codigoActual, texto },
    });
    document.getElementById("mensaje-texto").value = "";
    toasta("Mensaje enviado.", "exito");
    const datos = await api("/api/consulta", { metodo: "POST", cuerpo: { codigo: codigoActual } });
    pintar(datos);
  } catch (error) {
    aviso(caja, esc(error.message), "error");
  } finally {
    cargando(botonEnviar, false);
  }
});
