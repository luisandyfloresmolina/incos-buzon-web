-- =====================================================================
-- Actualización de autoridades del SIA (noviembre 2026).
--
-- El SIA reinició su base y cambió los identificadores de cargo:
--   Rector:    1  ->  9
--   Académico: 2  ->  10
--
-- Esta migración conserva las cadenas de derivación existentes y traduce
-- las referencias viejas. La caché se deja vacía para que se vuelva a
-- cargar desde el SIA con la cuenta de servicio vigente.
-- =====================================================================

UPDATE buz_reglas_derivacion SET cargo_id = 10 WHERE cargo_id = 2;
UPDATE buz_reglas_derivacion SET cargo_id = 9  WHERE cargo_id = 1;

UPDATE buz_quejas SET cargo_involucrado_id = 10 WHERE cargo_involucrado_id = 2;
UPDATE buz_quejas SET cargo_involucrado_id = 9  WHERE cargo_involucrado_id = 1;

UPDATE buz_derivaciones SET cargo_id = 10 WHERE cargo_id = 2;
UPDATE buz_derivaciones SET cargo_id = 9  WHERE cargo_id = 1;

DELETE FROM buz_cache_autoridades;
