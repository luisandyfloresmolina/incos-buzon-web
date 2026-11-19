import { Hono } from "hono";
import { HttpError } from "./lib/respuesta";
import { escalarVencidas } from "./lib/derivacion";
import auth from "./rutas/auth";
import autoridad from "./rutas/autoridad";
import admin from "./rutas/admin";
import reportes from "./rutas/reportes";
import publico from "./rutas/publico";
import type { Contexto } from "./lib/tipos";

const app = new Hono<Contexto>();

// Cabeceras de seguridad para toda la API.
// Nada de cache: las respuestas pueden contener datos de una queja.
app.use("/api/*", async (c, next) => {
  await next();
  c.header("cache-control", "no-store");
  c.header("x-content-type-options", "nosniff");
  c.header("referrer-policy", "no-referrer");
  c.header("x-frame-options", "DENY");
});

app.route("/api", publico);
app.route("/api/auth", auth);
app.route("/api/autoridad", autoridad);
app.route("/api/admin", admin);
app.route("/api/reportes", reportes);

app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json(
      {
        exito: false,
        datos: null,
        meta: null,
        error: { codigo: "RUTA_NO_ENCONTRADA", mensaje: "Recurso no encontrado." },
      },
      404,
    );
  }
  return c.text("No encontrado", 404);
});

// Nunca se devuelve la traza ni el mensaje interno: podría filtrar datos.
app.onError((error, c) => {
  if (error instanceof HttpError) {
    return c.json(
      {
        exito: false,
        datos: null,
        meta: null,
        error: { codigo: error.codigo, mensaje: error.message },
      },
      error.status as any,
    );
  }

  console.error("ERROR_INTERNO", error instanceof Error ? error.name : "desconocido");
  return c.json(
    {
      exito: false,
      datos: null,
      meta: null,
      error: { codigo: "ERROR_INTERNO", mensaje: "Ocurrió un error inesperado." },
    },
    500,
  );
});

export default {
  fetch: app.fetch,

  /** Cron diario: escala las quejas cuyo plazo de atención venció. */
  async scheduled(_evento: ScheduledController, env: any, ctx: ExecutionContext) {
    ctx.waitUntil(escalarVencidas(env));
  },
};
