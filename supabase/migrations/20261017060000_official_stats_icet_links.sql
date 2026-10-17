-- Reproducible observatory increment: this schema is isolated from other systems.
-- Sources are aggregate official-document readings, years not overwritten.
create table if not exists observatorio.icet_vinculos (
 icet_id text primary key references observatorio.indicadores(id),
 indicador_fuente_id text not null references observatorio.indicadores(id),
 equivalencia text not null check(equivalencia in ('directa','derivada')),
 justificacion text not null,
 creado_en timestamptz not null default now()
);
alter table observatorio.icet_vinculos enable row level security;
revoke all on observatorio.icet_vinculos from public, anon, authenticated;
insert into observatorio.fuentes (id,nombre,organismo,url,tipo,clasificacion,anio_publicacion) values
('FUENTE_AGRO_CATASTRO_VALLE_2024','Catastro de Datos agropecuarios, fila San Pedro 76670','Gobernación del Valle del Cauca','https://portalciudadanoagricultura.valledelcauca.gov.co/wp-content/uploads/2024/12/Catastro-de-Datos.pdf','documento','publica_agregada',2024),
('FUENTE_PRESUPUESTO_010_2024','Acuerdo Municipal 010 de 2024, presupuesto inicial 2025','Concejo Municipal de San Pedro','https://www.concejosanpedrovalle.gov.co/wp-content/uploads/2024/12/ACUERDO-MUNICIPAL-010-2024-PRESUPUESTO-2025.pdf','documento','publica_agregada',2024),
('FUENTE_VALOR_AGREGADO_TD','Valor agregado por ramas 2023, ficha TerriData julio de 2026','DNP / DANE','https://terridata.dnp.gov.co/','calculo','publica_agregada',2026)
on conflict (id) do update set nombre=excluded.nombre, organismo=excluded.organismo, url=excluded.url;
insert into observatorio.indicadores (id,nombre,tema,subtema,unidad,territorio,grupo) values
('AGRO-2023-AGR-PROD','Productores agrícolas registrados','Economía','Agricultura','productores','76670','SECTORIAL'),
('AGRO-2023-AREA','Área sembrada agrícola municipal','Economía','Agricultura','hectáreas','76670','SECTORIAL'),
('AGRO-2023-PEC-PROD','Productores pecuarios registrados','Economía','Agricultura y ganadería','productores','76670','SECTORIAL'),
('AGRO-2023-PEC-UP','Unidades productoras pecuarias','Economía','Agricultura y ganadería','unidades productoras pecuarias','76670','SECTORIAL'),
('AGRO-2023-TON','Producción agrícola municipal reportada','Economía','Agricultura','toneladas/año','76670','SECTORIAL'),
('AGRO-2023-UPA','Unidades productoras agropecuarias (UPA)','Economía','Agricultura','UPA','76670','SECTORIAL'),
('AGRO-2024-ASOC','Asociaciones agropecuarias caracterizadas','Economía','Asociatividad','asociaciones','76670','SECTORIAL'),
('AGRO-2024-CARACT','Productores agropecuarios caracterizados','Economía','Asociatividad','productores','76670','SECTORIAL'),
('PRES-2025-CAP','Presupuesto inicial de recursos de capital 2025','Finanzas públicas','Presupuesto inicial','COP','76670','SECTORIAL'),
('PRES-2025-CORR','Presupuesto inicial de ingresos corrientes 2025','Finanzas públicas','Presupuesto inicial','COP','76670','SECTORIAL'),
('PRES-2025-NOTRIB','Presupuesto inicial de ingresos no tributarios 2025','Finanzas públicas','Presupuesto inicial','COP','76670','SECTORIAL'),
('PRES-2025-TOTAL','Presupuesto inicial total de rentas y recursos de capital 2025','Finanzas públicas','Presupuesto inicial','COP','76670','SECTORIAL'),
('PRES-2025-TRIB','Presupuesto inicial de ingresos tributarios 2025','Finanzas públicas','Presupuesto inicial','COP','76670','SECTORIAL'),
('VAL-AGREGADO-2023','Valor agregado municipal: suma de actividades económicas','Economía','Valor agregado','miles de millones $ COP','76670','SECTORIAL')
on conflict (id) do nothing;
insert into observatorio.observaciones (indicador_id,fuente_id,id_en_fuente,anio,valor,unidad,nota,estado) values
('AGRO-2023-AGR-PROD','FUENTE_AGRO_CATASTRO_VALLE_2024','AGRO-2023-AGR-PROD',2023,'34','productores','Columna municipal 76670 San Pedro.','revisado'),
('AGRO-2023-AREA','FUENTE_AGRO_CATASTRO_VALLE_2024','AGRO-2023-AREA',2023,'6864','hectáreas','Área sembrada reportada para 2023, no área municipal total.','revisado'),
('AGRO-2023-PEC-PROD','FUENTE_AGRO_CATASTRO_VALLE_2024','AGRO-2023-PEC-PROD',2023,'291','productores','Columna municipal 76670 San Pedro, catastro agropecuario departamental.','revisado'),
('AGRO-2023-PEC-UP','FUENTE_AGRO_CATASTRO_VALLE_2024','AGRO-2023-PEC-UP',2023,'94','unidades productoras pecuarias','No sumar con UPA ni productores: universos diferentes.','revisado'),
('AGRO-2023-TON','FUENTE_AGRO_CATASTRO_VALLE_2024','AGRO-2023-TON',2023,'533785','toneladas/año','Producción agrícola total según catastro 2023; no sumar a cultivos de 2025.','revisado'),
('AGRO-2023-UPA','FUENTE_AGRO_CATASTRO_VALLE_2024','AGRO-2023-UPA',2023,'788','UPA','Unidades de Producción Agropecuaria 2023.','revisado'),
('AGRO-2024-ASOC','FUENTE_AGRO_CATASTRO_VALLE_2024','AGRO-2024-ASOC',2024,'10','asociaciones','Asociaciones caracterizadas en 2024.','revisado'),
('AGRO-2024-CARACT','FUENTE_AGRO_CATASTRO_VALLE_2024','AGRO-2024-CARACT',2024,'85','productores','Productores caracterizados en 2024.','revisado'),
('PRES-2025-CAP','FUENTE_PRESUPUESTO_010_2024','PRES-2025-CAP',2025,'15527630','COP','Recursos de capital iniciales.','revisado'),
('PRES-2025-CORR','FUENTE_PRESUPUESTO_010_2024','PRES-2025-CORR',2025,'25679168477','COP','Ingresos corrientes presupuestados inicialmente.','revisado'),
('PRES-2025-NOTRIB','FUENTE_PRESUPUESTO_010_2024','PRES-2025-NOTRIB',2025,'18257406635','COP','Ingresos no tributarios iniciales.','revisado'),
('PRES-2025-TOTAL','FUENTE_PRESUPUESTO_010_2024','PRES-2025-TOTAL',2025,'25694696107','COP','Apropiación inicial, NO ejecución. Cifras transcritas del acuerdo 010/2024; URL del documento necesita restauración.','revisado'),
('PRES-2025-TRIB','FUENTE_PRESUPUESTO_010_2024','PRES-2025-TRIB',2025,'7421761842','COP','Ingresos tributarios iniciales, NO equivalen al porcentaje ICET recursos propios.','revisado'),
('VAL-AGREGADO-2023','FUENTE_VALOR_AGREGADO_TD','VAL-AGREGADO-2023',2023,'612.7','miles de millones $ COP','DERIVADO: 353,4 primarias + 33,7 secundarias + 225,6 terciarias, todas en 2023, ficha TerriData p.10. No confundir con PIB.','revisado')
on conflict (indicador_id,fuente_id,id_en_fuente) where id_en_fuente is not null do nothing;
insert into observatorio.icet_vinculos (icet_id,indicador_fuente_id,equivalencia,justificacion) values
('ICET-09','VAL-AGREGADO-2023','derivada','Suma de actividades primarias, secundarias y terciarias 2023, todas en miles de millones de pesos corrientes, calculada sobre datos de ficha TerriData.'),
('ICET-16','DANE-POB-TOTAL','directa','Proyección DANE PPED de población total municipal; seleccionar vigencia explícita de la serie.'),
('ICET-23','TERRI-021','directa','Deserción intraanual sector oficial: unidad porcentaje, cifra 2024 de TerriData.'),
('ICET-36','TERRI-014','directa','Partos con personal calificado: porcentaje 2024 de TerriData.'),
('ICET-41','TERRI-015','directa','Mortalidad materna a 42 días: razón 2021 y cero observado explícitamente.'),
('ICET-45','TERRI-012','directa','Mortalidad infantil menor de un año: tasa por 1.000 nacidos vivos 2024.'),
('ICET-46','TERRI-016','directa','Mortalidad neonatal: tasa por 1.000 nacidos vivos 2022.')
on conflict (icet_id) do update set indicador_fuente_id=excluded.indicador_fuente_id,equivalencia=excluded.equivalencia,justificacion=excluded.justificacion;

CREATE OR REPLACE FUNCTION public.observatorio_public_feed()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
with permitidos as (
 select o.id,o.id_en_fuente,o.indicador_id,o.anio,o.valor,o.unidad,o.pagina,o.nota,o.fuente_id,i.nombre,i.tema,i.grupo,f.nombre as fuente_nombre,f.url
 from observatorio.observaciones o
 join observatorio.indicadores i on i.id=o.indicador_id
 join observatorio.fuentes f on f.id=o.fuente_id
 where o.territorio='76670' and i.territorio='76670'
 and o.alcance='municipal' and o.valor is not null
 and i.grupo in ('SECTORIAL','TERRIDATA','POLICIA')
 and o.fuente_id in (
  'FUENTE_DANE_PPED_2025_08','FUENTE_TERRIDATA_2026_07','FUENTE_POLICIA_2025',
  'FUENTE_AGRO_CATASTRO_VALLE_2024','FUENTE_PRESUPUESTO_010_2024','FUENTE_VALOR_AGREGADO_TD')
 and f.clasificacion='publica_agregada'
),
links as (
 select v.icet_id,v.indicador_fuente_id,v.equivalencia,v.justificacion
 from observatorio.icet_vinculos v
 join observatorio.indicadores source on source.id=v.indicador_fuente_id and source.territorio='76670'
 join observatorio.indicadores target on target.id=v.icet_id and target.grupo='ICET' and target.territorio='76670'
 where exists(select 1 from permitidos p where p.indicador_id=v.indicador_fuente_id)
)
select jsonb_build_object(
 'municipio','San Pedro','divipola','76670','departamento','Valle del Cauca',
 'aviso','Series agregadas y fichas oficiales. La vigencia del dato es diferente de la fecha de actualización del portal.',
 'registros',coalesce((select jsonb_agg(
   jsonb_build_object('id',coalesce(p.id_en_fuente,p.id::text),'codigo',p.indicador_id,'nombre',p.nombre,
     'tema',p.tema,'grupo',p.grupo,'anio',p.anio,'valor',p.valor,'unidad',p.unidad,'pagina',p.pagina,
     'fuente',p.fuente_nombre,'fuente_url',p.url,'nota',coalesce(p.nota,''),
     'tipo',case when p.fuente_id='FUENTE_DANE_PPED_2025_08' then 'proyeccion_poblacional'
       when p.fuente_id='FUENTE_POLICIA_2025' then 'filas_registro_no_hechos'
       when p.fuente_id='FUENTE_VALOR_AGREGADO_TD' then 'derivado'
       when p.fuente_id='FUENTE_PRESUPUESTO_010_2024' then 'presupuesto_inicial'
       else 'estadistica_documentada' end)
   order by p.tema,p.indicador_id,p.anio) from permitidos p),'[]'::jsonb),
 'vinculos_icet',coalesce((select jsonb_agg(jsonb_build_object(
     'codigo',l.icet_id,'fuente_codigo',l.indicador_fuente_id,'equivalencia',l.equivalencia,
     'justificacion',l.justificacion) order by l.icet_id)
   from links l),'[]'::jsonb),
 'actualizado_consulta',current_date::text
);
$function$
;
revoke all on function public.observatorio_public_feed() from public, anon, authenticated;
grant execute on function public.observatorio_public_feed() to service_role;
