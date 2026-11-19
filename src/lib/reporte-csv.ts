/** Genera CSV de quejas sin dependencias externas. */
import type { Env } from "../lib/tipos";

export async function extruirCSV(env: Env, periodo: string, fecha?: string): Promise<string> {
  const fechaObj = fecha ? new Date(fecha) : new Date();
  
  // Determinar rango de fechas según período
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
      inicio.setDate(fechaObj.getDate() - diaSemana + 1); // Lunes inicio
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
  
  // Consultar quejas en el rango de fechas desde D1
  const queries: string[] = [];
  const binds: any[] = [];
  
  // Buscamos quejas con la fecha de envío en el rango
  // La columna es fecha_envio
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
    ORDER BY q.fecha_envio DESC`
  );
  binds.push(inicio.toISOString(), fin.toISOString());
  
  // Ejecutar consulta
  const resultado = await env.DB.prepare(queries.join(" UNION ALL ")).bind(...binds).all();
  
  const quejas = resultado.results ?? [];
  
  // Si no hay datos, retornar CSV con encabezado solo
  if (quejas.length === 0) {
    return "ID,Estado,Categoría,Fecha Envío,Fecha Límite,Sin Leer,Adjuntos\n";
  }
  
  // Generar CSV
  const lines: string[] = [];
  lines.push("ID,Estado,Categoría,Fecha Envío,Fecha Límite,Sin Leer,Adjuntos");
  
  for (const q of quejas) {
    // q.fecha_envio y q.fecha_limite_atencion vienen como string|unknown desde D1
    const fechaEnv = q.fecha_envio as string | null;
    const fechaFin = q.fecha_limite_atencion as string | null;
    
    const row = [
      `"${q.id}"`,
      `"${q.estado ?? ""}"`,
      `"${q.categoria ?? ""}"`,
      `"${fechaEnv ? fechaEnv.split('T')[0] : ""}"`,
      `"${fechaFin ? fechaFin.split('T')[0] : ""}"`,
      `"${q.sin_leer ?? 0}"`,
      `"${q.adjuntos ?? 0}"`,
    ];
    lines.push(row.join(","));
  }
  
  return lines.join("\n");
}