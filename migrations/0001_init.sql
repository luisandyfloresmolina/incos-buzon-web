-- =====================================================================
-- Buzón de quejas anónimo · INCOS
-- Prefijo buz_ en todas las tablas, snake_case en español.
-- Regla de oro: ninguna tabla guarda IP, datos del navegador ni la hora
-- exacta de una queja (solo la fecha). El código de seguimiento se
-- guarda únicamente como hash.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- Catálogo de categorías (editable por ADMIN_TECNICO)
-- ---------------------------------------------------------------------
CREATE TABLE buz_categorias (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL UNIQUE,
  descripcion TEXT,
  activa      INTEGER NOT NULL DEFAULT 1 CHECK (activa IN (0, 1))
);

-- ---------------------------------------------------------------------
-- Cadena ordenada de receptores por categoría.
-- El último eslabón puede ser una instancia externa (sin cargo_id).
-- ---------------------------------------------------------------------
CREATE TABLE buz_reglas_derivacion (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria_id             INTEGER NOT NULL REFERENCES buz_categorias(id) ON DELETE CASCADE,
  orden                    INTEGER NOT NULL,
  cargo_id                 INTEGER,             -- id de cargo en el SIA (sin FK)
  instancia_externa_texto  TEXT,                -- solo si es eslabón externo
  CHECK (cargo_id IS NOT NULL OR instancia_externa_texto IS NOT NULL),
  UNIQUE (categoria_id, orden)
);
CREATE INDEX idx_buz_reglas_categoria ON buz_reglas_derivacion(categoria_id, orden);

-- ---------------------------------------------------------------------
-- Quejas. Solo el hash del código de seguimiento.
-- fecha_envio: 'YYYY-MM-DD' en America/La_Paz (sin hora, a propósito).
-- ---------------------------------------------------------------------
CREATE TABLE buz_quejas (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_hash            TEXT    NOT NULL UNIQUE,
  categoria_id           INTEGER NOT NULL REFERENCES buz_categorias(id),
  descripcion            TEXT    NOT NULL CHECK (length(descripcion) >= 30),
  cargo_involucrado_id   INTEGER,
  estado                 TEXT    NOT NULL DEFAULT 'PENDIENTE'
                          CHECK (estado IN ('PENDIENTE', 'EN_REVISION', 'EN_PROCESO', 'CERRADA')),
  fecha_envio            TEXT    NOT NULL,
  fecha_limite_atencion  TEXT
);
CREATE INDEX idx_buz_quejas_estado   ON buz_quejas(estado);
CREATE INDEX idx_buz_quejas_categoria ON buz_quejas(categoria_id);
CREATE INDEX idx_buz_quejas_limite   ON buz_quejas(fecha_limite_atencion);

-- ---------------------------------------------------------------------
-- Derivación vigente/histórica. Una sola activa por queja.
-- motivo: REGLA | EXCLUSION (se saltó al denunciado) | ESCALAMIENTO
-- ---------------------------------------------------------------------
CREATE TABLE buz_derivaciones (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  queja_id    INTEGER NOT NULL REFERENCES buz_quejas(id) ON DELETE CASCADE,
  cargo_id    INTEGER,
  persona_id  INTEGER,
  motivo      TEXT    NOT NULL CHECK (motivo IN ('REGLA', 'EXCLUSION', 'ESCALAMIENTO')),
  fecha_hora  TEXT    NOT NULL,
  activa      INTEGER NOT NULL DEFAULT 1 CHECK (activa IN (0, 1)),
  -- Extensión: texto del eslabón cuando la queja sale del sistema (sin cargo).
  instancia_externa_texto TEXT
);
CREATE INDEX idx_buz_deriv_queja   ON buz_derivaciones(queja_id, activa);
CREATE INDEX idx_buz_deriv_persona ON buz_derivaciones(persona_id, activa);

-- ---------------------------------------------------------------------
-- Historial de estados. Una fila por cambio, nunca se edita.
-- ---------------------------------------------------------------------
CREATE TABLE buz_historial_estados (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  queja_id       INTEGER NOT NULL REFERENCES buz_quejas(id) ON DELETE CASCADE,
  estado_anterior TEXT,
  estado_nuevo   TEXT    NOT NULL,
  persona_id     INTEGER,
  fecha_hora     TEXT    NOT NULL
);
CREATE INDEX idx_buz_historial_queja ON buz_historial_estados(queja_id, id);

-- ---------------------------------------------------------------------
-- Adjuntos. Nunca se guarda el nombre original ni se conservan metadatos.
-- ---------------------------------------------------------------------
CREATE TABLE buz_adjuntos (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  queja_id            INTEGER NOT NULL REFERENCES buz_quejas(id) ON DELETE CASCADE,
  nombre_generico     TEXT    NOT NULL,
  ruta_almacenamiento TEXT    NOT NULL,
  tamano_bytes        INTEGER NOT NULL,
  hash_sha256         TEXT    NOT NULL,
  tipo_mime           TEXT    NOT NULL
);
CREATE INDEX idx_buz_adjuntos_queja ON buz_adjuntos(queja_id);

-- ---------------------------------------------------------------------
-- Mensajes entre denunciante y autoridad. El denunciante no tiene persona_id.
-- ---------------------------------------------------------------------
CREATE TABLE buz_mensajes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  queja_id   INTEGER NOT NULL REFERENCES buz_quejas(id) ON DELETE CASCADE,
  autor      TEXT    NOT NULL CHECK (autor IN ('DENUNCIANTE', 'AUTORIDAD')),
  persona_id INTEGER,
  texto      TEXT    NOT NULL CHECK (length(texto) BETWEEN 1 AND 4000),
  fecha_hora TEXT    NOT NULL,
  leido      INTEGER NOT NULL DEFAULT 0 CHECK (leido IN (0, 1))
);
CREATE INDEX idx_buz_mensajes_queja ON buz_mensajes(queja_id, id);

-- ---------------------------------------------------------------------
-- Cuentas locales: solo ADMIN_TECNICO y COMITE.
-- ---------------------------------------------------------------------
CREATE TABLE buz_usuarios (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  nombres            TEXT    NOT NULL,
  apellidos          TEXT    NOT NULL,
  correo_electronico TEXT    NOT NULL UNIQUE,
  clave_hash         TEXT    NOT NULL,
  rol                TEXT    NOT NULL CHECK (rol IN ('ADMIN_TECNICO', 'COMITE')),
  activo             INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))
);

-- ---------------------------------------------------------------------
-- Auditoría del uso del sistema. Nunca registra el contenido de una queja.
-- ---------------------------------------------------------------------
CREATE TABLE buz_auditoria (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  persona_id INTEGER,
  accion     TEXT    NOT NULL,
  entidad    TEXT,
  entidad_id INTEGER,
  fecha_hora TEXT    NOT NULL
);
CREATE INDEX idx_buz_auditoria_fecha ON buz_auditoria(fecha_hora);

-- ---------------------------------------------------------------------
-- Parámetros configurables (fila única).
-- ---------------------------------------------------------------------
CREATE TABLE buz_parametros (
  id                    INTEGER PRIMARY KEY CHECK (id = 1),
  plazo_atencion_dias   INTEGER NOT NULL DEFAULT 5 CHECK (plazo_atencion_dias BETWEEN 1 AND 60),
  max_adjuntos          INTEGER NOT NULL DEFAULT 3 CHECK (max_adjuntos BETWEEN 0 AND 3),
  max_tamano_adjunto_mb INTEGER NOT NULL DEFAULT 2 CHECK (max_tamano_adjunto_mb BETWEEN 1 AND 10)
);

-- ---------------------------------------------------------------------
-- Caché de lectura de autoridades del SIA. Nunca decide permisos.
-- ---------------------------------------------------------------------
CREATE TABLE buz_cache_autoridades (
  cargo_id        INTEGER PRIMARY KEY,
  persona_id      INTEGER,
  cargo_nombre    TEXT NOT NULL,
  nombre_completo TEXT,
  actualizado_en  TEXT NOT NULL
);

-- =====================================================================
-- Semilla: categorías, cadenas de derivación y parámetros.
-- La cadena final (instancia externa si se denuncia al Rector) debe
-- validarse por escrito con la Dirección.
-- =====================================================================
INSERT INTO buz_categorias (id, nombre, descripcion, activa) VALUES
  (1, 'Académica',       'Docentes, evaluaciones, notas, contenido o metodología de una materia.', 1),
  (2, 'Administrativa',  'Atención, trámites, cobros, documentación o personal administrativo.',   1),
  (3, 'Conducta grave',  'Acoso, discriminación, violencia, hostigamiento o faltas graves.',        1),
  (4, 'Infraestructura', 'Aulas, laboratorios, equipos, mobiliario o servicios básicos.',           1);

-- Eslabón 1: cargo 10 = Académico · cargo 9 = Rector (SIA, noviembre 2026)
INSERT INTO buz_reglas_derivacion (categoria_id, orden, cargo_id, instancia_externa_texto) VALUES
  (1, 1, 10,   NULL),
  (1, 2, 9,    NULL),
  (1, 3, NULL, 'Instancia superior externa (a definir con la Dirección)'),
  (2, 1, 9,    NULL),
  (2, 2, NULL, 'Instancia superior externa (a definir con la Dirección)'),
  (3, 1, 9,    NULL),
  (3, 2, NULL, 'Instancia superior externa (a definir con la Dirección)'),
  (4, 1, 9,    NULL),
  (4, 2, NULL, 'Instancia superior externa (a definir con la Dirección)');

INSERT INTO buz_parametros (id, plazo_atencion_dias, max_adjuntos, max_tamano_adjunto_mb)
VALUES (1, 5, 3, 2);
