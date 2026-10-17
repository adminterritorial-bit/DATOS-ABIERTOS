-- Registrada en Supabase como create_restricted_pdt_review_staging.
-- Revisar historial de migraciones antes de aplicar manualmente.
CREATE TABLE IF NOT EXISTS observatorio.pdt_revision (
 codigo text PRIMARY KEY,
 anio integer NOT NULL DEFAULT 2025,
 pagina integer NOT NULL CHECK (pagina>=1 AND pagina<=500),
 titulo_extraido_parcial text,
 dependencia_propuesta text,
 meta_extraida numeric,
 ejecutado_extraido numeric,
 ejecutado_crudo numeric,
 incidencia boolean NOT NULL DEFAULT false,
 fuente_documento text NOT NULL DEFAULT '52005_informerendicioncuentassp.pdf',
 estado text NOT NULL DEFAULT 'pendiente_revision'
  CHECK(estado IN ('pendiente_revision','en_revision','corregido','rechazado')),
 revisado_por uuid REFERENCES auth.users(id),
 revisado_el timestamptz,
 creado_el timestamptz NOT NULL DEFAULT now(),
 CHECK(incidencia=false OR ejecutado_extraido IS NULL)
);
ALTER TABLE observatorio.pdt_revision ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON observatorio.pdt_revision FROM PUBLIC, anon, authenticated;
COMMENT ON TABLE observatorio.pdt_revision IS
 'Área de revisión privada. Extracciones PDF con etiquetas parciales, nunca resultados oficiales certificados.';
