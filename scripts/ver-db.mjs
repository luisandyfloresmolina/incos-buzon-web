/**
 * Muestra el contenido de la base D1 en la terminal.
 *
 *   npm run ver-db                      -> resumen y todas las tablas (base local)
 *   npm run ver-db -- buz_quejas        -> solo una tabla
 *   npm run ver-db -- --sql "SELECT ..." -> una consulta libre
 *   npm run ver-db -- --remote          -> base de producción (pide confirmación)
 *   npm run ver-db -- --completo        -> no recorta los textos largos
 *   npm run ver-db -- --limite 50       -> máximo de filas por tabla (por defecto 20)
 */
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { fileURLToPath } from "node:url";

const WRANGLER = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url));

const args = process.argv.slice(2);
const remoto = args.includes("--remote");
const completo = args.includes("--completo");

const valorDe = (bandera) => {
  const i = args.indexOf(bandera);
  return i >= 0 ? args[i + 1] : undefined;
};

const limite = Number(valorDe("--limite") ?? 20);
const sqlLibre = valorDe("--sql");
const tablaPedida = args.find((a) => !a.startsWith("--") && a !== String(limite) && a !== sqlLibre);

// Orden pensado para leer la información como una historia.
const TABLAS = [
  "buz_categorias",
  "buz_parametros",
  "buz_reglas_derivacion",
  "buz_quejas",
  "buz_derivaciones",
  "buz_historial_estados",
  "buz_adjuntos",
  "buz_mensajes",
  "buz_usuarios",
  "buz_auditoria",
  "buz_cache_autoridades",
];

function consultar(sql) {
  const salida = execFileSync(
    process.execPath,
    [
      WRANGLER, "d1", "execute", "buzon-incos",
      remoto ? "--remote" : "--local",
      "--json",
      "--command", sql,
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] },
  );
  const inicio = salida.indexOf("[");
  const datos = JSON.parse(salida.slice(inicio));
  return datos[0]?.results ?? [];
}

const recortar = (valor, ancho = 70) => {
  if (valor === null) return "NULL";
  if (valor === undefined) return "";
  const texto = String(valor).replace(/\s+/g, " ").trim();
  if (completo || texto.length <= ancho) return texto;
  return texto.slice(0, ancho - 1) + "…";
};

function imprimirTabla(filas) {
  if (!filas.length) {
    console.log("  (sin filas)\n");
    return;
  }

  const columnas = Object.keys(filas[0]);
  const celdas = filas.map((fila) => columnas.map((c) => recortar(fila[c])));
  const anchos = columnas.map((c, i) =>
    Math.max(c.length, ...celdas.map((fila) => fila[i].length)),
  );

  const linea = (izq, medio, der) =>
    izq + anchos.map((a) => "─".repeat(a + 2)).join(medio) + der;

  console.log(linea("┌", "┬", "┐"));
  console.log("│ " + columnas.map((c, i) => c.padEnd(anchos[i])).join(" │ ") + " │");
  console.log(linea("├", "┼", "┤"));
  for (const fila of celdas) {
    console.log("│ " + fila.map((v, i) => v.padEnd(anchos[i])).join(" │ ") + " │");
  }
  console.log(linea("└", "┴", "┘"));
  console.log(`  ${filas.length} fila(s)\n`);
}

const principal = async () => {
  if (remoto && !args.includes("--si")) {
    const rl = createInterface({ input: stdin, output: stdout });
    const respuesta = await rl.question(
      "⚠️  Esto consulta la base de PRODUCCIÓN y muestra las quejas reales.\n" +
        "    Escriba SI para continuar: ",
    );
    rl.close();
    if (respuesta.trim().toUpperCase() !== "SI") {
      console.log("Cancelado.");
      return;
    }
  }

  const entorno = remoto ? "PRODUCCIÓN (remota)" : "local (.wrangler)";
  console.log(`\n📦 Base de datos: buzon-incos — ${entorno}\n`);

  if (sqlLibre) {
    imprimirTabla(consultar(sqlLibre));
    return;
  }

  if (tablaPedida) {
    if (!/^[a-z_]+$/i.test(tablaPedida)) {
      console.error("Nombre de tabla inválido.");
      process.exitCode = 1;
      return;
    }
    console.log(`── ${tablaPedida} ──\n`);
    imprimirTabla(consultar(`SELECT * FROM ${tablaPedida} LIMIT ${limite}`));
    return;
  }

  // Resumen de cuántas filas tiene cada tabla.
  console.log("RESUMEN\n");
  for (const tabla of TABLAS) {
    const [{ total }] = consultar(`SELECT COUNT(*) AS total FROM ${tabla}`);
    console.log(`  ${tabla.padEnd(28)} ${String(total).padStart(4)} fila(s)`);
  }

  for (const tabla of TABLAS) {
    console.log(`\n═══════════════════════════════════════════════════════════════`);
    console.log(`  ${tabla}`);
    console.log(`═══════════════════════════════════════════════════════════════\n`);
    imprimirTabla(consultar(`SELECT * FROM ${tabla} LIMIT ${limite}`));
  }
};

principal().catch((error) => {
  console.error("\nNo se pudo leer la base de datos.");
  const detalle = error.stderr?.toString().trim() || error.message;
  console.error(detalle);
  process.exitCode = 1;
});
