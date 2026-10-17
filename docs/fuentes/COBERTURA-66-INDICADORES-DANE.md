# Cobertura efectiva de los 66 indicadores ICET para el Observatorio de San Pedro

**Inventario generado en la rama de recuperación documental, corte 16 octubre 2026.** Esta auditoría NO constituye respuesta certificada de disponibilidad municipal ICET 2025; mide exclusivamente existencia de una cifra histórica municipal utilizable en el dashboard.

**21 de 66 definiciones** tienen al menos un dato documental, publicado o matemáticamente calculado que puede vincularse con control metodológico. **45 de 66** siguen sin componente estadístico equivalente recuperado. No completar éstos con ceros ficticios.

Véanse `src/app/icet/ICETDashboard.tsx` (correspondencias), `src/lib/indicadoresCalculados.ts` (fórmulas), `src/lib/observacionesFuentesExternas.ts` (fuentes), `/api/icet/documentados` (JSON) y `docs/fuentes/CALCULOS-ICET-REPRODUCIBLES.md` (metodología).

| ICET | Indicador | Evidencia disponible o ruta de recuperación |
|---:|---|---|
| 1 | Porcentaje de aguas residuales urbanas tratadas | Buscar exacto: CVC / SSPD SUI / IDEAM RESPEL / UNGRD / PGIRS |
| 2 | Tasa de personas afectadas a causa de eventos recurrentes | Buscar exacto: CVC / SSPD SUI / IDEAM RESPEL / UNGRD / PGIRS |
| 3 | Negocios verdes verificados | Buscar exacto: CVC / SSPD SUI / IDEAM RESPEL / UNGRD / PGIRS |
| 4 | Porcentaje de residuos sólidos efectivamente aprovechados | Buscar exacto: CVC / SSPD SUI / IDEAM RESPEL / UNGRD / PGIRS |
| 5 | Porcentaje de residuos sólidos urbanos dispuestos adecuadamente | Buscar exacto: CVC / SSPD SUI / IDEAM RESPEL / UNGRD / PGIRS |
| 6 | Residuos peligrosos aprovechados y tratados | Buscar exacto: CVC / SSPD SUI / IDEAM RESPEL / UNGRD / PGIRS |
| 7 | Hectáreas de pequeña y mediana propiedad rural, formalizadas | Buscar exacto: IGAC/ANT/UPRA; CUIPO-CHIP; RUNT |
| 8 | Vocación de uso del suelo (caracterización y zonificación) | Buscar exacto: IGAC/ANT/UPRA; CUIPO-CHIP; RUNT |
| 9 | Valor agregado por municipio | Cifra asociada: Ficha TerriData 2023, sectores y suma |
| 10 | Porcentaje de presupuesto municipal financiado con recursos propios | Buscar exacto: IGAC/ANT/UPRA; CUIPO-CHIP; RUNT |
| 11 | Parque automotor por municipio (particular, oficial, público) incluyendo motocicletas | Buscar exacto: IGAC/ANT/UPRA; CUIPO-CHIP; RUNT |
| 12 | Índice de desempeño institucional | Cifra asociada: FURAG informe gestión 2021 |
| 13 | Porcentaje de mujeres en cargos directivos del Estado Colombiano | Buscar exacto: Función Pública/empleo; IGAC; DANE vitales |
| 14 | Predios del país con catastro multipropósito formado y/o actualizado total o parcialmente | Buscar exacto: Función Pública/empleo; IGAC; DANE vitales |
| 15 | La esperanza de vida al nacer (total, hombre, mujer) | Buscar exacto: Función Pública/empleo; IGAC; DANE vitales |
| 16 | Total población | Cifra asociada: DANE TerriData 2026 |
| 17 | Brecha entre cobertura neta urbano-rural en educación preescolar, básica y media | Buscar exacto: MEN SIMAT/SINEB/PAE; DANE CNPV |
| 18 | Cobertura en educación superior | Cifra asociada: Informe de gestión, educación 2023 |
| 19 | Porcentaje de matrícula oficial con conexión a internet | Buscar exacto: MEN SIMAT/SINEB/PAE; DANE CNPV |
| 20 | Tasa de analfabetismo para la población de 15 años y más | Buscar exacto: MEN SIMAT/SINEB/PAE; DANE CNPV |
| 21 | Tasa de cobertura bruta en educación media | Cifra asociada: Informe gestión, media 2023 |
| 22 | Tasa de cobertura bruta en transición | Cifra asociada: Informe gestión, transición 2023 |
| 23 | Tasa de deserción intra-anual del sector oficial en educación básica y media | Cifra asociada: TerriData deserción 2024 |
| 24 | Hogares urbanos con déficit cualitativo de vivienda (CNPV 2018) | Cifra asociada: Ficha TerriData, déficit urbano CNPV 2018 |
| 25 | Hogares urbanos con déficit cuantitativo de vivienda (CNPV 2018) | Cifra asociada: Ficha TerriData, déficit urbano CNPV 2018 |
| 26 | Medida de pobreza multidimensional Censal | Cifra asociada: Plan Territorial de Salud, IPM CNPV 2018 |
| 27 | Incidencia de la hepatitis B por cada 100.000 habitantes | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 28 | Incidencia de malaria | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 29 | Incidencia de tuberculosis | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 30 | Letalidad por dengue | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 31 | Número de médicos | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 32 | Porcentaje de menores de 1 año con tercera dosis de pentavalente | Cifra asociada: PDT 2020–2023, pentavalente 2016 |
| 33 | Porcentaje de mujeres de 15 a 19 años con embarazo subsiguiente | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 34 | Porcentaje de mujeres de 15 a 19 años que son madres o están embarazadas de su primer hijo | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 35 | Porcentaje de niñas y niños en primera infancia que cuentan con las atenciones priorizadas en el marco de la atención integral | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 36 | Porcentaje de partos atendidos por personal calificado | Cifra asociada: TerriData, partos 2024 |
| 37 | Porcentaje de personas con criterio de tratamiento y diagnóstico de hepatitis C crónica a quienes se les inicia el tratamiento | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 38 | Porcentaje de población afiliada al sistema de seguridad social en salud | Cifra asociada: OGEN BDUA 2020 y cálculo afiliados 2023 |
| 39 | Porcentaje de transmisión materno-infantil de la hepatitis B | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 40 | Porcentaje niños y niñas de 1 año con vacunación de triple viral | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 41 | Razón de mortalidad materna (42 días) | Cifra asociada: TerriData, mortalidad materna 2021 |
| 42 | Tasa de cobertura del Programa de Alimentación Escolar | Buscar exacto: MEN SIMAT/SINEB/PAE; DANE CNPV |
| 43 | Tasa de fecundidad específica en mujeres adolescentes de 15 a 19 años | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 44 | Tasa de mortalidad de niños menores de 5 años | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 45 | Tasa de mortalidad infantil | Cifra asociada: TerriData 2024 e histórico 2017 |
| 46 | Tasa de mortalidad neonatal | Cifra asociada: TerriData, mortalidad neonatal 2022 |
| 47 | Tasa de mortalidad por desnutrición en menores de 5 años | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 48 | Tasa de mortalidad por tumores malignos en menores de 18 años | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 49 | Tasa de mortalidad por VIH/SIDA | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 50 | Tasa de mortalidad prematura de las enfermedades crónicas de las vías respiratorias inferiores | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 51 | Tasa de mortalidad prematura por cáncer de mama, cuello uterino, colon y recto, pulmón, próstata, estómago, linfoma no Hodgkin y Leucemia en adultos | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 52 | Tasa de mortalidad prematura por diabetes | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 53 | Tasa de mortalidad prematura por enfermedades no transmisibles en población entre 30 y hasta 70 años | Buscar exacto: SISPRO/SIVIGILA/RUAF/PAI/MinSalud/DANE |
| 54 | Tasa General de mortalidad por accidentes de tránsito terrestre | Cifra asociada: Forensis 2023–2024, transporte (corroborar ámbito terrestre) |
| 55 | Número de robos de vehículos motorizados | Cifra asociada: PTS Policía 2023, hurtos automotores y motos sumados |
| 56 | Tasa de feminicidio (homicidios de mujeres asesinadas por razones de género, por cada 100.000 mujeres) | Buscar exacto: Policía CANTIDAD, Medicina Legal, RUV/RNI/UARIV/PAPSIVI |
| 57 | Tasa de homicidios | Cifra asociada: Forensis 2023–2024, tasa homicidios; cálculo 2025 por sexo |
| 58 | Tasa de mortalidad por lesiones autoinfligidas intencionalmente | Cifra asociada: Forensis 2023–2024, suicidios |
| 59 | Tasa de víctimas directas de homicidio y desaparición forzada registradas en RUV | Buscar exacto: Policía CANTIDAD, Medicina Legal, RUV/RNI/UARIV/PAPSIVI |
| 60 | Tasa de victimización de hurto a personas | Buscar exacto: Policía CANTIDAD, Medicina Legal, RUV/RNI/UARIV/PAPSIVI |
| 61 | Tasa de violencia interpersonal | Cifra asociada: Forensis 2023–2024, tasa de violencia interpersonal |
| 62 | Víctimas con atención o acompañamiento psicosocial individual, familiar, comunitaria y/o grupal | Buscar exacto: Policía CANTIDAD, Medicina Legal, RUV/RNI/UARIV/PAPSIVI |
| 63 | Víctimas que superaron la situación de vulnerabilidad (nueva medición) | Buscar exacto: Policía CANTIDAD, Medicina Legal, RUV/RNI/UARIV/PAPSIVI |
| 64 | Acceso a agua potable adecuado | Buscar exacto: UPME ICEE municipal; SSPD SUI; prestadores; DANE CNPV |
| 65 | Cobertura de energía eléctrica | Buscar exacto: UPME ICEE municipal; SSPD SUI; prestadores; DANE CNPV |
| 66 | Porcentaje de la población con acceso a métodos de saneamiento adecuados | Buscar exacto: UPME ICEE municipal; SSPD SUI; prestadores; DANE CNPV |

## Criterios no negociables de derivación

- Tasa general = suma de conteos compatibles / población de referencia × factor, sin mezclar distintos productores o métodos.
- Tasas por subgrupo se combinan con promedio ponderado por denominadores correspondientes, no media simple salvo pesos iguales.
- Cuota de energía o agua por viviendas: utilizar viviendas conectadas sobre total de viviendas, **NO** habitantes como denominador.
- #55: sumatoria de hurto a automotores + hurto a motocicletas (Policía 2023) describe delitos reportados, **no** robos no denunciados ni tentativas.
- #54: Forensis «eventos de transporte» puede ser más amplio que «tránsito terrestre», verificar alcance.
- #57: mantener por separado series Forensis y Policía; el cálculo TerriData 2025 ponderado por sexo requiere contrastar el desglose poblacional con el Excel DANE original.
- #38: cálculo marzo 2023 usa afiliados del PTS y población anual PPED DANE; registrar el desfase de cortes.
- #61: usar las tasas oficiales Forensis de **violencia interpersonal exclusivamente**, no sumatoria de violencia familiar y de pareja, que son categorías diferentes.
- Mantener observaciones relacionadas como contenido sectorial del dashboard sin falsear cumplimiento de la definición ICET.

## Siguiente extracción prioritaria

**#65:** Fuente UPME ArcGIS `https://geo.upme.gov.co/server/rest/services/Capas_EnergiaElectrica/indice_cobertura_energia_electrica_mpio/FeatureServer/layers`. Capa 26: atributo `cod_mpio='76670'`; recuperar `iceetotal`, `vcstotal`, `vttotal` y `vigencia`. La respuesta API no pudo recuperarse en esta sesión, por lo que no hay cifra publicada para este indicador todavía. No usar datos nacionales o departamentales.
**#20:** DANE CNPV censo 2018 de alfabetismo de personas 15+, diferente de privación por analfabetismo de hogares.
**#64 y #66:** SSPD SUI/operadores y CNPV; diferenciar calidad de agua y tipo de saneamiento de simple cobertura de redes.
**#27–53:** bases SISPRO/INS/RUAF desagregadas por código territorial, año, numerador/denominador; calcular tasas de enfermedades y mortalidad cuando haya compatibilidad.
**#59, #62, #63:** obtener conjunto RUV de hechos directos, atención PAPSIVI y superación de vulnerabilidad; sus cifras acumuladas por ubicación/ocurrencia no sustituyen esas variables.

**Publicación:** datos en rama PR #5, no en `main` ni publicados en Supabase/producción hasta merge e ingesta por Work. Los documentos públicos se enlazan desde `/documentos`, extractos agregados se versionan en GitHub. No generar más Excel de presentación.