# Auditoría completa de los 66 indicadores ICET · San Pedro (76670)

Corte de la investigación: octubre 2026. Este documento describe **contenido del Observatorio**, no la certificación oficial de publicación ICET 2025.

## Cobertura real de cifras y procedimientos

- **66/66** definiciones presentes y fichas navegables.
- **26/66** con un valor municipal histórico/publicado o calculado según una definición asociada.
- **20/66** con estadística histórica relacionada pero de alcance distinto al indicador.
- **2/66** con una estimación territorial exploratoria derivada de SIVIGILA 2018 y siete municipios de referencia.
- **18/66** sin valor numérico sustentable todavía. Todos tienen **receta y calculadora de componentes**, sin números fingidos.
- **48/66** ofrecen ya alguna cifra numérica asociada, contextual o estimada; **25 recetas matemáticas** están disponibles (incluyen siete indicadores donde además existen datos contextuales, útiles para futuros modelos).

### Incorporación decisiva: defunciones definitivas DANE 2024

Los **130 fallecimientos de residentes de San Pedro** de 2024 se recuperaron del [anexo definitivo DANE, Cuadro 5](https://www.dane.gov.co/files/operaciones/EEVV/2026/6-feb-2026/anex-EEVV-DefuncionesNoFetalesCuadroUnificado-2024.xlsx), distinguiéndolos de los **65 fallecimientos ocurridos físicamente en el municipio** (Cuadro 3). Las **33 causas codificadas OPS 6/67** suman 130 y los grupos de edad/sexo concilian con cada causa. Archivos `src/data/daneDefunciones76670_2024.json` y `src/lib/observacionesDaneMortalidad.ts`.

- **ICET 47:** 0 defunciones por deficiencias nutricionales (grupo 602) en menores de cinco años. Tasa 0 por 100.000, con denominador 0–4 años de 1.322 habitantes de la proyección DANE reproducida por fuente secundaria; cifra cero respaldada por listado exhaustivo.
- **ICET 49:** 0 defunciones de residentes por enfermedad VIH/SIDA (grupo OPS **107**), por tanto tasa 0 por 100.000 para 2024 con población 17.270 DANE.
- **ICET 48:** 0 defunciones por tumores malignos en población **0–14**, pero los **15–17** están mezclados en el intervalo 15–44: solo dato relacionado.
- **ICET 50:** 8 defunciones por enfermedades crónicas de vías respiratorias inferiores, **todas las edades**, no exclusivamente prematuras.
- **ICET 51:** 13 defunciones por ocho grupos de neoplasias seleccionados, todas las edades; no equivale a lista/edades exactas requeridas.
- **ICET 52:** 5 defunciones por diabetes (todas las edades).
- **ICET 53:** 59 defunciones por enfermedades circulatorias, todas las edades; no equivale a todas las ENT de 30–70 años.

## Tabla exacta de integración

| ICET | Definición | Clase de evidencia | Valor enlazado o calculadora |
|---:|---|---|---|
| 1 | Porcentaje de aguas residuales urbanas tratadas | Receta executable (sin componentes) | `/estimador?icet=1` |
| 2 | Tasa de personas afectadas a causa de eventos recurrentes | Receta executable (sin componentes) | `/estimador?icet=2` |
| 3 | Negocios verdes verificados | Receta executable (sin componentes) | `/estimador?icet=3` |
| 4 | Porcentaje de residuos sólidos efectivamente aprovechados | Dato municipal relacionado | `SSPD-APROVECHAMIENTO-PROPORCION-2024` |
| 5 | Porcentaje de residuos sólidos urbanos dispuestos adecuadamente | Dato municipal relacionado | `SSPD-DISPOSICION-TOTAL-2024` |
| 6 | Residuos peligrosos aprovechados y tratados | Receta executable (sin componentes) | `/estimador?icet=6` |
| 7 | Hectáreas de pequeña y mediana propiedad rural, formalizadas | Dato municipal relacionado | `TERRI-055` |
| 8 | Vocación de uso del suelo (caracterización y zonificación) | Dato municipal relacionado | `GOB-AGRO-SIEMBRA-2023` |
| 9 | Valor agregado por municipio | Valor municipal publicado/derivado | `DOC-ICET-09-2023` |
| 10 | Porcentaje de presupuesto municipal financiado con recursos propios | Dato municipal relacionado | `DER-FIN-TRIBUTARIOS-2025` |
| 11 | Parque automotor por municipio (particular, oficial, público) incluyendo motocicletas | Receta executable (sin componentes) | `/estimador?icet=11` |
| 12 | Índice de desempeño institucional | Valor municipal publicado/derivado | `DOC-FURAG-12-2021` |
| 13 | Porcentaje de mujeres en cargos directivos del Estado Colombiano | Receta executable (sin componentes) | `/estimador?icet=13` |
| 14 | Predios del país con catastro multipropósito formado y/o actualizado total o parcialmente | Dato municipal relacionado | `DER-CAT-PREDIOS-2024` |
| 15 | La esperanza de vida al nacer (total, hombre, mujer) | Receta executable (sin componentes) | `/estimador?icet=15` |
| 16 | Total población | Valor municipal publicado/derivado | `TERRI-001` |
| 17 | Brecha entre cobertura neta urbano-rural en educación preescolar, básica y media | Receta executable (sin componentes) | `/estimador?icet=17` |
| 18 | Cobertura en educación superior | Valor municipal publicado/derivado | `DOC-EDU-18-2023` |
| 19 | Porcentaje de matrícula oficial con conexión a internet | Receta executable (sin componentes) | `/estimador?icet=19` |
| 20 | Tasa de analfabetismo para la población de 15 años y más | Dato municipal relacionado | `OFI-ANALF-HOG-2018` |
| 21 | Tasa de cobertura bruta en educación media | Valor municipal publicado/derivado | `DOC-EDU-21-2023` |
| 22 | Tasa de cobertura bruta en transición | Valor municipal publicado/derivado | `DOC-EDU-22-2023` |
| 23 | Tasa de deserción intra-anual del sector oficial en educación básica y media | Valor municipal publicado/derivado | `TERRI-021` |
| 24 | Hogares urbanos con déficit cualitativo de vivienda (CNPV 2018) | Valor municipal publicado/derivado | `DOC-CNPV-24-2018` |
| 25 | Hogares urbanos con déficit cuantitativo de vivienda (CNPV 2018) | Valor municipal publicado/derivado | `DOC-CNPV-25-2018` |
| 26 | Medida de pobreza multidimensional Censal | Valor municipal publicado/derivado | `OFI-ICET-26-2018` |
| 27 | Incidencia de la hepatitis B por cada 100.000 habitantes | Escenario regional exploratorio | `EST-ICET27-2018` |
| 28 | Incidencia de malaria | Escenario regional exploratorio | `EST-ICET28-2018` |
| 29 | Incidencia de tuberculosis | Dato municipal relacionado | `INS-TB-ICET29-2018` |
| 30 | Letalidad por dengue | Receta executable (sin componentes) | `/estimador?icet=30` |
| 31 | Número de médicos | Receta executable (sin componentes) | `/estimador?icet=31` |
| 32 | Porcentaje de menores de 1 año con tercera dosis de pentavalente | Valor municipal publicado/derivado | `EXT-ICET-32-PENTA-2016` |
| 33 | Porcentaje de mujeres de 15 a 19 años con embarazo subsiguiente | Receta executable (sin componentes) | `/estimador?icet=33` |
| 34 | Porcentaje de mujeres de 15 a 19 años que son madres o están embarazadas de su primer hijo | Receta executable (sin componentes) | `/estimador?icet=34` |
| 35 | Porcentaje de niñas y niños en primera infancia que cuentan con las atenciones priorizadas en el marco de la atención integral | Receta executable (sin componentes) | `/estimador?icet=35` |
| 36 | Porcentaje de partos atendidos por personal calificado | Valor municipal publicado/derivado | `TERRI-014` |
| 37 | Porcentaje de personas con criterio de tratamiento y diagnóstico de hepatitis C crónica a quienes se les inicia el tratamiento | Receta executable (sin componentes) | `/estimador?icet=37` |
| 38 | Porcentaje de población afiliada al sistema de seguridad social en salud | Valor municipal publicado/derivado | `DER-ICET-38-2023` |
| 39 | Porcentaje de transmisión materno-infantil de la hepatitis B | Receta executable (sin componentes) | `/estimador?icet=39` |
| 40 | Porcentaje niños y niñas de 1 año con vacunación de triple viral | Receta executable (sin componentes) | `/estimador?icet=40` |
| 41 | Razón de mortalidad materna (42 días) | Valor municipal publicado/derivado | `TERRI-015` |
| 42 | Tasa de cobertura del Programa de Alimentación Escolar | Dato municipal relacionado | `DOC-PAE-BENEFICIARIOS-2025` |
| 43 | Tasa de fecundidad específica en mujeres adolescentes de 15 a 19 años | Valor municipal publicado/derivado | `SALUD-DA-d65385a58-2017` |
| 44 | Tasa de mortalidad de niños menores de 5 años | Valor municipal publicado/derivado | `SALUD-DA-d153e100b-2011` |
| 45 | Tasa de mortalidad infantil | Valor municipal publicado/derivado | `TERRI-012` |
| 46 | Tasa de mortalidad neonatal | Valor municipal publicado/derivado | `TERRI-016` |
| 47 | Tasa de mortalidad por desnutrición en menores de 5 años | Valor municipal publicado/derivado | `DANE-ICET47-2024` |
| 48 | Tasa de mortalidad por tumores malignos en menores de 18 años | Dato municipal relacionado | `DANE-ICET48-2024` |
| 49 | Tasa de mortalidad por VIH/SIDA | Valor municipal publicado/derivado | `DANE-ICET49-2024` |
| 50 | Tasa de mortalidad prematura de las enfermedades crónicas de las vías respiratorias inferiores | Dato municipal relacionado | `DANE-ICET50-2024` |
| 51 | Tasa de mortalidad prematura por cáncer de mama, cuello uterino, colon y recto, pulmón, próstata, estómago, linfoma no Hodgkin y Leucemia en adultos | Dato municipal relacionado | `DANE-ICET51-2024` |
| 52 | Tasa de mortalidad prematura por diabetes | Dato municipal relacionado | `DANE-ICET52-2024` |
| 53 | Tasa de mortalidad prematura por enfermedades no transmisibles en población entre 30 y hasta 70 años | Dato municipal relacionado | `DANE-ICET53-2024` |
| 54 | Tasa General de mortalidad por accidentes de tránsito terrestre | Valor municipal publicado/derivado | `OFI-FOR-ICET54-2023` |
| 55 | Número de robos de vehículos motorizados | Valor municipal publicado/derivado | `DER-ICET-55-2023` |
| 56 | Tasa de feminicidio (homicidios de mujeres asesinadas por razones de género, por cada 100.000 mujeres) | Dato municipal relacionado | `FOR-MUJER-HOM-2023` |
| 57 | Tasa de homicidios | Valor municipal publicado/derivado | `DER-ICET-57-2025` |
| 58 | Tasa de mortalidad por lesiones autoinfligidas intencionalmente | Valor municipal publicado/derivado | `OFI-FOR-ICET58-2023` |
| 59 | Tasa de víctimas directas de homicidio y desaparición forzada registradas en RUV | Dato municipal relacionado | `RUV-2025-HOMICIDIO-OCURRENCIA` |
| 60 | Tasa de victimización de hurto a personas | Dato municipal relacionado | `EXT-POLICIA-HURTO-PERSONAS-2025` |
| 61 | Tasa de violencia interpersonal | Valor municipal publicado/derivado | `OFI-FOR-ICET61-2024` |
| 62 | Víctimas con atención o acompañamiento psicosocial individual, familiar, comunitaria y/o grupal | Dato municipal relacionado | `DOC-RUV-atencion` |
| 63 | Víctimas que superaron la situación de vulnerabilidad (nueva medición) | Receta executable (sin componentes) | `/estimador?icet=63` |
| 64 | Acceso a agua potable adecuado | Dato municipal relacionado | `TERRI-023` |
| 65 | Cobertura de energía eléctrica | Valor municipal publicado/derivado | `UPME-ICEE-TOTAL-2024` |
| 66 | Porcentaje de la población con acceso a métodos de saneamiento adecuados | Dato municipal relacionado | `TERRI-027` |

## Mapa, geoestadística y fuentes

Ruta **`/mapa`** (archivo `src/app/mapa/page.tsx`) dibuja **8 polígonos reales DANE MGN 2025**, incluido San Pedro, y compara la cobertura ICEE 2024 UPME entre los ocho municipios. Permite elegir municipio, año, sector, clase de dato y búsqueda textual, con fichas de fuente y series temporales. No aplica directamente los datos de comparables a San Pedro.

Ruta **`/estimador`** (archivo `src/app/estimador/page.tsx`) contiene 25 recetas editables con numerador, denominador, universo objetivo municipal, vigencia, fuente y municipios de comparación. Sin componentes no ofrece números ficticios, pero siempre proporciona cálculo procedural, exportación JSON y control básico de coherencia.

El registro `src/lib/fuentesPublicas.ts` inventaría **18 fuentes y APIs**, de las cuales **11 tienen ETL aplicado** y 7 están clasificadas como referencia pendiente o fuente sin registro municipal atribuible. Queda integrado en el geovisor con filtro y enlace al proveedor.

### Conjuntos y código implementado

- `src/data/geografiaMunicipal76670.json`: polígonos oficiales, obtenidos de ArcGIS DANE.
- `src/data/energiaMunicipiosReferencia.json`: ICEE 2024 por municipio y viviendas conectadas/totales de UPME.
- `src/data/fuentesMasivas76670.json`: 232 observaciones agregadas UPME, salud, RUV y SSPD.
- `src/data/insSivigilaSanPedro76670.json`: notificaciones de 16 eventos INS SIVIGILA 2018.
- `src/data/escenariosComparables76670.json`: DANE PPED, siete municipios y modelos analógicos con prueba leave-one-out. La estimación del parque automotor RUNT (#11) se **rechazó** porque la tasa de vehículos registrados de los comparadores oscila de 0,00642 a 4,14088 vehículos por residente (sesgo del lugar de matrícula); el dato del municipio no consta en el conjunto RUNT disponible.
- `src/lib/recetasEstimacion.ts`: 25 fórmulas específicas y fuentes sectoriales, no números falsos.
- `src/lib/icetVinculos.ts`: mapa único de vínculos directos, relacionados y escenarios.
- API `/api/icet/documentados` expone observaciones públicas agregadas, sin microdatos individuales; el dashboard `/icet/recuperados` ofrece filtros y fichas de procedencia.

### Próxima extracción prioritaria para conseguir valores NUMÉRICOS que faltan

DANE EEVV / SISPRO RUAF por CIE-10, edad y municipio de residencia: #47–#53; MEN SIMAT: #17 y #19; SISPRO/PAI: #30, #33–#40; RETHUS: #31; UARIV superación de vulnerabilidad: #63; CVC/IDEAM: #1, #2, #3, #6. Los modelos para fenómenos sin numeradores, pocos eventos o alta confusión administrativa deben reservarse a escenarios etiquetados y nunca reemplazar reportes oficiales.

**Estado técnico:** todo el trabajo está en PR #5 rama `feat/icet-recuperacion-documental` y requiere conciliación con `main`/Supabase y despliegue, sin afirmar que ya está publicado en producción.
