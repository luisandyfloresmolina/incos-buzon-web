/**
 * Derivación única hacia la Rectora, con exclusión del denunciado.
 *
 * Todas las quejas se derivan a la Rectora, sin importar la categoría. La
 * categoría queda solo como clasificación estadística. Si la queja señala a
 * la Rectora, se entrega al Académico; si también lo señala, al siguiente
 * cargo de autoridad disponible.
 */
import type { Env } from "./tipos";
import { autoridades } from "./sia";
import type { Autoridad } from "./sia";
import { ahoraLaPaz, hoyLaPaz, sumarDias } from "./fecha";
import { parametros } from "./parametros";

export interface ResultadoDerivacion {
  tipo: "INTERNA" | "EXTERNA" | "NINGUNA";
  cargoId?: number | null;
  cargoNombre?: string;
  personaId?: number | null;
}

/** ¿El cargo es la Rectora? Se usa para permisos de asignación y bandeja. */
export function esCargoRector(cargos: string[] | undefined): boolean {
  return (cargos ?? []).some((cargo) => /rector/i.test(String(cargo)));
}

interface Regla {
  id: number;
  categoria_id: number;
  orden: number;
  cargo_id: number | null;
  instancia_externa_texto: string | null;
}

async function reglasDe(env: Env, categoriaId: number): Promise<Regla[]> {
  const fila = await env.DB.prepare(
    `SELECT id, categoria_id, orden, cargo_id, instancia_externa_texto
       FROM buz_reglas_derivacion WHERE categoria_id = ? ORDER BY orden`,
  )
    .bind(categoriaId)
    .all<Regla>();
  return fila.results ?? [];
}

async function insertarDerivacion(
  env: Env,
  datos: {
    quejaId: number;
    cargoId: number | null;
    personaId: number | null;
    motivo: "REGLA" | "EXCLUSION" | "ESCALAMIENTO";
    externa?: string | null;
  },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO buz_derivaciones
       (queja_id, cargo_id, persona_id, motivo, fecha_hora, activa, instancia_externa_texto)
     VALUES (?, ?, ?, ?, ?, 1, ?)`,
  )
    .bind(
      datos.quejaId,
      datos.cargoId,
      datos.personaId,
      datos.motivo,
      ahoraLaPaz(),
      datos.externa ?? null,
    )
    .run();
}

/**
 * Deriva una queja recién creada hacia la Rectora.
 * `cargoInvolucradoId` es opcional: si el denunciante señala a una autoridad,
 * se excluye a esa persona y se usa el siguiente cargo disponible.
 */
export async function derivarQueja(
  env: Env,
  quejaId: number,
  _categoriaId: number,
  cargoInvolucradoId: number | null,
): Promise<ResultadoDerivacion> {
  const vigentes = await autoridades(env);
  const denunciado =
    cargoInvolucradoId != null
      ? vigentes.find((a) => a.cargoId === Number(cargoInvolucradoId))?.personaId ?? null
      : null;

  const rector = vigentes.find((a) => esCargoRector([a.cargoNombre]));
  const academico = vigentes.find((a) => /acad[eé]mico/i.test(a.cargoNombre));
  const resto = vigentes.filter((a) => a !== rector && a !== academico);
  const candidatos = [rector, academico, ...resto].filter(
    (a): a is Autoridad => Boolean(a),
  );

  let excluido = false;

  for (const autoridad of candidatos) {
    if (!autoridad.personaId) continue; // cargo vacante: siguiente

    if (denunciado && autoridad.personaId === denunciado) {
      excluido = true; // no se entrega la queja a la persona denunciada
      continue;
    }

    await insertarDerivacion(env, {
      quejaId,
      cargoId: autoridad.cargoId,
      personaId: autoridad.personaId,
      motivo: excluido ? "EXCLUSION" : "REGLA",
    });
    return {
      tipo: "INTERNA",
      cargoId: autoridad.cargoId,
      cargoNombre: autoridad.cargoNombre,
      personaId: autoridad.personaId,
    };
  }

  return { tipo: "NINGUNA" };
}

/**
 * Escalamiento diario: si venció el plazo y la queja sigue abierta, pasa al
 * siguiente eslabón de la cadena. La ejecuta el Cron Trigger.
 */
export async function escalarVencidas(env: Env): Promise<number> {
  const hoy = hoyLaPaz();
  const { plazoDias } = await parametros(env);

  const vencidas = await env.DB.prepare(
    `SELECT q.id, q.categoria_id, q.cargo_involucrado_id,
            d.cargo_id, d.persona_id
       FROM buz_quejas q
       JOIN buz_derivaciones d ON d.queja_id = q.id AND d.activa = 1
      WHERE q.estado <> 'CERRADA'
        AND q.fecha_limite_atencion IS NOT NULL
        AND q.fecha_limite_atencion < ?`,
  )
    .bind(hoy)
    .all<any>();

  if (!vencidas.results?.length) return 0;

  const vigentes = await autoridades(env);
  let escaladas = 0;

  for (const fila of vencidas.results) {
    if (fila.cargo_id == null) continue; // ya está en instancia externa

    const reglas = await reglasDe(env, Number(fila.categoria_id));
    const indiceActual = reglas.findIndex((r) => Number(r.cargo_id) === Number(fila.cargo_id));
    if (indiceActual < 0) continue;

    const denunciado =
      fila.cargo_involucrado_id != null
        ? vigentes.find((a) => a.cargoId === Number(fila.cargo_involucrado_id))?.personaId ?? null
        : null;

    for (let i = indiceActual + 1; i < reglas.length; i++) {
      const regla = reglas[i];

      if (regla.cargo_id != null) {
        const autoridad = vigentes.find((a) => a.cargoId === Number(regla.cargo_id));
        if (!autoridad || !autoridad.personaId) continue;
        if (denunciado && autoridad.personaId === denunciado) continue;

        await env.DB.batch([
          env.DB.prepare(`UPDATE buz_derivaciones SET activa = 0 WHERE queja_id = ? AND activa = 1`).bind(
            fila.id,
          ),
          env.DB.prepare(
            `INSERT INTO buz_derivaciones
               (queja_id, cargo_id, persona_id, motivo, fecha_hora, activa)
             VALUES (?, ?, ?, 'ESCALAMIENTO', ?, 1)`,
          ).bind(fila.id, regla.cargo_id, autoridad.personaId, ahoraLaPaz()),
          env.DB.prepare(`UPDATE buz_quejas SET fecha_limite_atencion = ? WHERE id = ?`).bind(
            sumarDias(hoy, plazoDias),
            fila.id,
          ),
        ]);
        escaladas++;
        break;
      }

      if (regla.instancia_externa_texto) {
        await env.DB.batch([
          env.DB.prepare(`UPDATE buz_derivaciones SET activa = 0 WHERE queja_id = ? AND activa = 1`).bind(
            fila.id,
          ),
          env.DB.prepare(
            `INSERT INTO buz_derivaciones
               (queja_id, cargo_id, persona_id, motivo, fecha_hora, activa, instancia_externa_texto)
             VALUES (?, NULL, NULL, 'ESCALAMIENTO', ?, 1, ?)`,
          ).bind(fila.id, ahoraLaPaz(), regla.instancia_externa_texto),
          env.DB.prepare(`UPDATE buz_quejas SET fecha_limite_atencion = NULL WHERE id = ?`).bind(
            fila.id,
          ),
        ]);
        escaladas++;
        break;
      }
    }
  }

  return escaladas;
}
