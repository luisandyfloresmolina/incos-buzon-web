import { execFileSync } from "node:child_process";
const W = new (await import("wrangler"))();
const r = execFileSync(
  W._nodeOptions ? W._nodeOptions : process.execPath,
  [
    W.bin,
    "d1",
    "execute",
    "buzon-incos",
    "--local",
    "--json",
    "--command",
    "SELECT id, codigo_hash, categoria_id, estado, cargo_involucrado_id, fecha_envio FROM buz_quejas ORDER BY id DESC"
  ],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }
);
console.log(r.substring(0, 3000));