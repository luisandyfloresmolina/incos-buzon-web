/**
 * Crea las cuentas locales iniciales (ADMIN_TECNICO y COMITE).
 *
 *   npm run seed         -> base remota
 *   npm run seed:local   -> base local de wrangler dev
 *
 * Las claves se pueden cambiar con las variables ADMIN_CLAVE y COMITE_CLAVE.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";

const local = process.argv.includes("--local");

const ADMIN_CORREO = process.env.ADMIN_CORREO ?? "admin@buzon.incos";
const ADMIN_CLAVE = process.env.ADMIN_CLAVE ?? "BuzonAdmin2026*";
const COMITE_CORREO = process.env.COMITE_CORREO ?? "comite@buzon.incos";
const COMITE_CLAVE = process.env.COMITE_CLAVE ?? "BuzonComite2026*";

const ITERACIONES = Number(process.env.PBKDF2_ITERACIONES ?? 15000);

const b64url = (bytes) =>
  Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function hashClave(clave) {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(clave),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: sal, iterations: ITERACIONES },
    material,
    256,
  );
  return `pbkdf2$${ITERACIONES}$${b64url(sal)}$${b64url(new Uint8Array(bits))}`;
}

const escapar = (texto) => String(texto).replace(/'/g, "''");

async function main() {
  const sql = [
    `DELETE FROM buz_usuarios WHERE correo_electronico IN ('${escapar(ADMIN_CORREO)}', '${escapar(COMITE_CORREO)}');`,
    `INSERT INTO buz_usuarios (nombres, apellidos, correo_electronico, clave_hash, rol, activo) VALUES
      ('Administrador', 'Técnico', '${escapar(ADMIN_CORREO)}', '${await hashClave(ADMIN_CLAVE)}', 'ADMIN_TECNICO', 1),
      ('Comité', 'de Quejas', '${escapar(COMITE_CORREO)}', '${await hashClave(COMITE_CLAVE)}', 'COMITE', 1);`,
  ].join("\n");

  const archivo = ".seed-temporal.sql";
  writeFileSync(archivo, sql, "utf8");

  try {
    execFileSync(
      "npx",
      [
        "wrangler",
        "d1",
        "execute",
        "buzon-incos",
        local ? "--local" : "--remote",
        `--file=${archivo}`,
      ],
      { stdio: "inherit", shell: true },
    );
  } finally {
    try {
      unlinkSync(archivo);
    } catch {}
  }

  console.log("\nCuentas creadas:");
  console.log(`  ADMIN_TECNICO  ${ADMIN_CORREO}  /  ${ADMIN_CLAVE}`);
  console.log(`  COMITE         ${COMITE_CORREO}  /  ${COMITE_CLAVE}`);
  console.log("\nCambie estas claves antes de la entrega.\n");
}

main().catch((error) => {
  console.error("No se pudieron crear las cuentas:", error.message);
  process.exit(1);
});
