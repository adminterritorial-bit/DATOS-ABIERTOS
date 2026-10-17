# Indicadores y cálculos reproducibles para San Pedro, Valle (76670)

Los resultados se integran directamente a la aplicación mediante `src/lib/indicadoresCalculados.ts`, `src/lib/observacionesFuentesExternas.ts` y la API estática `/api/icet/documentados`. No son datos de relleno ni requieren exportar un Excel.

## Valores directamente documentados — nuevos indicadores

- **ICET 54 — mortalidad por eventos de transporte, 2023:** **27,65 por 100.000** (5 fallecimientos). Fuente [Forensis 2023, tabla 14, p. 459](https://www.medicinalegal.gov.co/documents/20143/1124000/Forensis_2023.pdf). El indicador ICET se refiere a transporte terrestre; confirmar alcance exacto de la categoría Forensis antes de presentarlo como certificación histórica.
- **ICET 57 — tasa de homicidios, 2023:** **44,25 por 100.000** (8 casos, 7 hombres y 1 mujer). [Forensis 2023, tabla 10, p. 135](https://www.medicinalegal.gov.co/documents/20143/1124000/Forensis_2023.pdf). El [Plan Territorial de Salud 2024–2027, tabla 34](https://www.concejosanpedrovalle.gov.co/wp-content/uploads/2024/06/PLAN-TERRITORIAL-DE-SALUD-2024-2027.pdf) reporta una tasa distinta **33,2**, basada en **6 homicidios de fuente policial**. No promediar ni borrar una versión. Son universos y métodos de registro distintos.
- **ICET 58 — mortalidad por lesiones autoinfligidas intencionalmente, 2023:** **23,85 por 100.000** (4 suicidios), [Forensis 2023, tabla 8 de suicidios, p. 403](https://www.medicinalegal.gov.co/documents/20143/1124000/Forensis_2023.pdf).

## Indicador 38 derivado de fuentes oficiales

**Cobertura de afiliación al SGSSS — cálculo documental de marzo 2023:** 11.211 afiliados registrados / 17.280 habitantes proyectados para 2023 × 100 = **64,88 %**.

- Numerador: [Plan Territorial de Salud, tabla 25, p. 60](https://www.concejosanpedrovalle.gov.co/wp-content/uploads/2024/06/PLAN-TERRITORIAL-DE-SALUD-2024-2027.pdf): 7.293 régimen subsidiado + 3.830 contributivo + 59 excepción + 29 INPEC intramural = **11.211 personas afiliadas, marzo 2023**.
- Denominador: [DANE proyecciones PPED (versión 08/08/2025)](https://www.dane.gov.co/index.php/estadisticas-por-tema/demografia-y-poblacion/proyecciones-de-poblacion), **17.280** personas proyectadas para San Pedro en 2023, serie que ya existe en `src/lib/danePopulation.ts`.
- Etiquetar siempre **calculado con componentes oficiales**; el numerador tiene corte de marzo y el denominador es proyección anual, no es necesariamente idéntico al valor oficial certificado por el Ministerio para ese mes.

## Operaciones adicionales documentadas (NO equivalen automáticamente a indicador ICET completo)

- **Relación ingresos tributarios / presupuesto inicial 2025**: COP 7.421.761.842 / COP 25.694.696.107 × 100 = **28,88 %**. Es la participación tributaria del presupuesto inicial, **NO** el indicador 10 de presupuesto financiado con *todos* los recursos propios.
- **Hurtos a automotores y motocicletas 2023:** 6 + 4 = **10 casos registrados** en Policía (PTS tabla 33); es un dato sectorial relacionado con ICET 55, no incluye necesariamente intentos u otras clases de vehículos.
- **Casos examinados de violencias, 2023:** 18 por violencia interpersonal + 5 por intrafamiliar + 7 por pareja = **30 casos** en columnas distintas de [Forensis 2023, tabla 8 de clínica, p. 89](https://www.medicinalegal.gov.co/documents/20143/1124000/Forensis_2023.pdf). Tasa calculada con DANE PPED 2023: 30 / 17.280 × 100.000 = **173,61 por 100.000**, clasificación **relacionada** con ICET 61 porque casos de peritaje no necesariamente equivalen a personas únicas lesionadas.
- **Composición demográfica**: para cada año DANE 2018–2026, porcentaje cabecera = cabecera/total × 100; porcentaje rural = rural/total × 100. Mantener la misma población base y mismo año para cada proporción.

## No aplicar estas operaciones sin componentes adecuados

- **#56 feminicidios:** 1 homicidio de mujer en Forensis no demuestra feminicidio por razón de género.
- **#59 víctimas directas RUV:** personas acumuladas por ocurrencia no son víctimas directas por homicidio/desaparición del año.
- **#60 victimización por hurto:** registros policiales de hurtos no equivalen automáticamente a personas de 15+ victimizadas (posibles repeticiones, universo distinto).
- **#64 agua adecuada:** cobertura de acueducto de hogares o redes no equivale por definición a toda la población con método adecuado en ámbitos rural y urbano.
- **#65 energía:** utilizar ICEE total oficial de UPME por municipio; no calcular promedio simple del ICEE rural y urbano ni utilizar ponderadores de población cuando el denominador es *viviendas*.
- **#66 saneamiento adecuado:** requiere población que accede a métodos adecuados, con reconocimiento de soluciones alternativas rurales; no reemplazar con cobertura de alcantarillado únicamente.

**Diferencias de denominador:** las tasas 2023 de Forensis no se recalculan con la versión DANE PPED 2025 para luego presentarlas como tasas publicadas de Medicina Legal. Las cifras publicadas son 44,25; 27,65; 23,85, mientras que cálculos nuevos con proyecciones revisadas podrían dar resultados distintos. La trazabilidad identifica la fórmula y versiones para evitar inconsistencias.

## Estándares para cálculos avanzados

- Promedios ponderados solo con pesos legítimos y disjuntos (`suma_i(numerador_i)/suma_i(denominador_i)`).
- Interpolaciones entre años solamente si se etiquetan como **estimaciones**, nunca se agregan al conteo ICET oficial ni se presentan como sucesos históricos observados.
- Derivadas y tasas de cambio sirven para **analizar tendencia**, no para reconstruir numeradores municipales ausentes.
- Integrales discretas/series acumuladas requieren flujos medidos y no eliminan el problema de cambios de definición.
- Álgebra lineal sirve para conciliación de componentes y detección de dependencias, no para identificar de forma única datos sin ecuaciones suficientes.
