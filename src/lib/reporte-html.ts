/** Genera HTML de reporte para imprimir a PDF. */
import type { Env } from "../lib/tipos";

export async function generarHTMLReporte(env: Env, periodo: string, fecha?: string): Promise<string> {
  const fechaObj = fecha ? new Date(fecha) : new Date();
  
  // Mismo rango que CSV
  let inicio: Date, fin: Date;
  
  switch (periodo) {
    case "diario":
      inicio = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate());
      fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 1);
      break;
      
    case "semanal":
      const diaSemana = fechaObj.getDay();
      inicio = new Date(fechaObj);
      inicio.setDate(fechaObj.getDate() - diaSemana + 1);
      fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 7);
      break;
      
    case "mensual":
      inicio = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), 1);
      fin = new Date(fechaObj.getFullYear(), fechaObj.getMonth() + 1, 1);
      break;
      
    case "anual":
      inicio = new Date(fechaObj.getFullYear(), 0, 1);
      fin = new Date(fechaObj.getFullYear() + 1, 0, 1);
      break;
      
    default:
      inicio = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), 1);
      fin = new Date(fechaObj.getFullYear(), fechaObj.getMonth() + 1, 1);
  }
  
  // Consultar quejas
  const queries: string[] = [];
  const binds: any[] = [];
  
  queries.push(
    `SELECT 
      q.id,
      q.estado,
      cat.nombre AS categoria,
      q.fecha_envio,
      q.fecha_limite_atencion,
      q.descripcion,
      (SELECT COUNT(*) FROM buz_mensajes m WHERE m.queja_id = q.id AND m.autor = 'DENUNCIANTE' AND m.leido = 0) AS sin_leer,
      (SELECT COUNT(*) FROM buz_adjuntos a WHERE a.queja_id = q.id) AS adjuntos
    FROM buz_quejas q
    JOIN buz_categorias cat ON cat.id = q.categoria_id
    WHERE q.fecha_envio >= ? AND q.fecha_envio < ?
    ORDER BY q.fecha_envio DESC LIMIT 200`
  );
  binds.push(inicio.toISOString(), fin.toISOString());
  
  const resultado = await env.DB.prepare(queries.join(" ")).bind(...binds).all();
  const quejas = resultado.results ?? [];
  
  // Formateo de fechas para HTML
  const formatearFecha = (fechaStr: string | null) => {
    if (!fechaStr) return "—";
    const d = new Date(fechaStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };
  
  const formatearEstado = (estado: string | null) => {
    const etiquetas = ["PENDIENTE", "EN_REVISION", "EN_PROCESO", "CERRADA"];
    return etiquetas.includes(estado ?? "") ? estado : estado;
  };
  
  // Título del reporte
  const titulosPeriodo: any = {
    diario: "Reporte Diario",
    semanal: "Reporte Semanal", 
    mensual: "Reporte Mensual",
    anual: "Reporte Anual",
  };
  
  const titulo = titulosPeriodo[periodo] || "Reporte de Quejas";
  const periodoTexto = periodo === "diario" ? "Últimas 24 horas" :
                       periodo === "semanal" ? "Últimos 7 días" :
                       periodo === "mensual" ? "Último mes" : "Último año";
  
  // HTML de tabla
  let filasHTML = "";
  
  if (quejas.length === 0) {
    filasHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--tinta-suave);">No hay quejas en este período.</td></tr>`;
  } else {
    for (const q of quejas) {
      const prioridad = q.estado === "PENDIENTE" ? "alta" : 
                        q.estado === "EN_REVISION" ? "media" : 
                        q.estado === "EN_PROCESO" ? "baja" : "info";
      
      filasHTML += `
        <tr>
          <td style="padding:8px; border:1px solid #dee2e6; font-weight:bold;">${q.id}</td>
          <td style="padding:8px; border:1px solid #dee2e6; color:${prioridad === "alta" ? "#dc3545" : prioridad === "media" ? "#ffc107" : prioridad === "baja" ? "#198754" : "#6c757d"};">
            ${q.estado ?? "—"}
          </td>
          <td style="padding:8px; border:1px solid #dee2e6;">${q.categoria ?? "—"}</td>
          <td style="padding:8px; border:1px solid #dee2e6;">${formatearFecha(q.fecha_envio as string)}</td>
          <td style="padding:8px; border:1px solid #dee2e6;">${formatearFecha(q.fecha_limite_atencion as string)}</td>
          <td style="padding:8px; border:1px solid #dee2e6; text-align:center;">${q.sin_leer ?? 0}</td>
          <td style="padding:8px; border:1px solid #dee2e6; text-align:center;">${q.adjuntos ?? 0}</td>
        </tr>`;
    }
  }
  
  // HTML completo con CSS embebido para imprimir bonito
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo} - Buzón INCOS</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 20px; color: var(--tinta); }
    h1 { color: var(--primario); border-bottom: 2px solid var(--primario); padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { padding: 10px 8px; background: var(--fondo-header); color: white; font-size: 13px; }
    td { padding: 8px; border: 1px solid #dee2e6; font-size: 12px; }
    tr:nth-child(even) { background: #f8f9fa; }
    .resumen { margin: 20px 0; padding: 15px; background: #e9ecef; border-radius: 6px; }
    .nota { font-size: 11px; color: var(--tinta-suave); margin-top: 30px; }
    @media print { 
      body * { visibility: hidden; }
      #reporte, #reporte * { visibility: visible; }
      #reporte { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div id="reporte">
    <h1>${titulo}</h1>
    <div class="resumen">
      <p>Período: ${periodoTexto}</p>
      <p>Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      <p>Total de quejas: ${quejas.length}</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Estado</th>
          <th>Categoría</th>
          <th>Fecha Envío</th>
          <th>Fecha Límite</th>
          <th>Sin Leer</th>
          <th>Adjuntos</th>
        </tr>
      </thead>
      <tbody>
        ${filasHTML}
      </tbody>
    </table>
    <div class="nota">
      <p>Sistema Buzón INCOS - SIA-INCOS<br>
      Datos generados automáticamente. Para dudas contactar a la Rectora.</p>
    </div>
  </div>
  <script>
    // Auto-foco y impresión al cargar
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;
}