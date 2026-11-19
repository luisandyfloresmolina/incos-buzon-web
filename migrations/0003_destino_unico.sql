-- ---------------------------------------------------------------------
-- Destino único: todas las quejas llegan a la Rectora.
--
-- La categoría deja de decidir el routing y queda solo como clasificación.
-- La Rectora asigna manualmente desde su bandeja a cualquier otra autoridad.
-- ---------------------------------------------------------------------

-- Las reglas de derivación se conservan por compatibilidad, pero todas
-- apuntan al cargo Rector. El código de derivación ya no las usa para
-- decidir el destino; solo el escalamiento histórico las consulta.
DELETE FROM buz_reglas_derivacion;
INSERT INTO buz_reglas_derivacion (categoria_id, orden, cargo_id, instancia_externa_texto)
SELECT id, 1, 9, NULL FROM buz_categorias;

-- Reasignar las derivaciones vigentes a la Rectora actual, salvo que la
-- propia queja señale al Rector como denunciado. En ese caso se conserva
-- la derivación existente (Académico o instancia externa).
UPDATE buz_derivaciones
   SET cargo_id = 9,
       persona_id = COALESCE(
         (SELECT persona_id FROM buz_cache_autoridades WHERE cargo_id = 9 LIMIT 1),
         1050
       ),
       motivo = 'REGLA',
       instancia_externa_texto = NULL
 WHERE activa = 1
   AND queja_id IN (
     SELECT id FROM buz_quejas
      WHERE cargo_involucrado_id IS NULL OR cargo_involucrado_id <> 9
   );
