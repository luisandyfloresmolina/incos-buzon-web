/** Endpoints de reportes: CSV, HTML e impresión. */
import { Hono } from "hono";
import { extruirCSV } from "../lib/reporte-csv";
import { generarHTMLReporte } from "../lib/reporte-html";
import type { Contexto } from "../lib/tipos";

const reportes = new Hono<Contexto>();

/** CSV de quejas por período.
 *  Parámetros de consulta:
 *  - periodo: "diario" | "semanal" | "mensual" | "anual"
 *  - fecha: YYYY-MM-DD (opcional, por defecto hoy)
 *  - INTEGRACION solo
 */
reportes.get("/csv", async (c) => {
  try {
    const url = new URL(c.req.url!);
    const periodo = url.searchParams.get("periodo") ?? "mensual";
    const fecha = url.searchParams.get("fecha") ?? "";

    // Validar periodo
    const periodosValidos = ["diario", "semanal", "mensual", "anual"];
    if (!periodosValidos.includes(periodo)) {
      return c.json({ exito: false, error: "PERIODO_INVALIDO", mensaje: "Período inválido. Use: diario, semanal, mensual o anual" }, 400);
    }

    // Generar CSV (usando librería interna sin dependencias externas)
    const csvData = await extruirCSV(c.env, periodo, fecha);
    
    // Retornar como archivo descargable
    return c.body(csvData, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="quejas-${periodo}-${fecha || new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generando CSV:", error);
    return c.json({ exito: false, error: "ERROR_INTERNO", mensaje: "Error generando el reporte CSV" }, 500);
  }
});

/** HTML de reporte para imprimir a PDF.
 *  Igual que CSV pero retorna HTML con formato de tabla.
 *  El usuario puede presionar Ctrl+P → Guardar como PDF.
 */
reportes.get("/html", async (c) => {
  try {
    const url = new URL(c.req.url!);
    const periodo = url.searchParams.get("periodo") ?? "mensual";
    const fecha = url.searchParams.get("fecha") ?? "";

    // Validar periodo
    const periodosValidos = ["diario", "semanal", "mensual", "anual"];
    if (!periodosValidos.includes(periodo)) {
      return c.json({ exito: false, error: "PERIODO_INVALIDO", mensaje: "Período inválido" }, 400);
    }

    const html = await generarHTMLReporte(c.env, periodo, fecha);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generando HTML reporte:", error);
    return c.json({ exito: false, error: "ERROR_INTERNO", mensaje: "Error generando el reporte HTML" }, 500);
  }
});

/** Endpoint de prueba rápido */
reportes.get("/test", async (c) => {
  return c.json({
    exito: true,
    mensaje: "Endpoints de reportes activos",
    endpoints: [
      "/api/reportes/csv?periodo=mensual&fecha=2024-01-15",
      "/api/reportes/html?periodo=semanal",
    ],
  });
});

export default reportes;