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


## Recuperación adicional 2024 de Medicina Legal

Publicación oficial: [Forensis 2024, Instituto Nacional de Medicina Legal y Ciencias Forenses](https://www.medicinalegal.gov.co/documents/20143/1269218/Forensis_2024.pdf). Municipio San Pedro, Valle del Cauca, código 76670.

| Indicador | Valor 2023 Forensis | Valor 2024 Forensis | Unidad |
|---|---:|---:|---|
| ICET 54 muertes por eventos de transporte | 27,65 | 49,63 | por 100.000 habitantes |
| ICET 57 homicidios | 44,25 | 55,14 | por 100.000 habitantes |
| ICET 58 suicidios | 23,85 | 5,93 | por 100.000 habitantes |

Casos absolutos 2024: 9 muertes en eventos de transporte, 10 homicidios (10 hombres y 0 mujeres) y 1 suicidio. Comparar tasas oficiales publicadas por la misma fuente con cautela y no recalcular denominadores para hacer pasar cifras nuevas por originales.

Forensis 2024 también presenta, en San Pedro, 10 casos médico-legales de violencia interpersonal, 2 de violencia intrafamiliar y 10 de violencia de pareja en columnas diferenciadas. Derivación relacionada con ICET 61, no equivalencia automática:

- Numerador documental: 10 + 2 + 10 = 22 casos examinados (verificar que las categorías sean disjuntas).
- Denominador: 17.270 personas, PPED DANE 2024 en el repositorio.
- Tasa calculada: 22 / 17.270 × 100.000 = **127,39 casos examinados por 100.000 habitantes**.
- Por tratarse de reconocimientos forenses, NO interpretarla sin más como víctimas únicas de violencia interpersonal en toda la población.

## SGSSS desagregado por sexo 2020, Gobernación

El documento técnico de la [Política Pública de Igualdad de Género del Valle 2025–2036](https://ogen.valledelcauca.gov.co/storage/Clientes/Gobernacion/OGEN/imagenes/contenidos/1112644-documento%20tecnico.pdf) recupera datos BDUA 2020 para San Pedro: **61,4 % de afiliación total**, **62,1 % mujeres** y **60,7 % hombres**. El primero complementa el ICET 38 con un dato publicado; la cifra calculada de marzo 2023 64,88 % utiliza un período y denominador propios, y no debe presentarse como comparación automática si cambió la metodología.

## Tasa general de homicidios 2025 ponderada por sexo

Se dispone de tasas específicas en la ficha TerriData San Pedro para 2025 (hombres **106,3**, mujeres **22,7** por 100.000) y de la proyección DANE PPED municipal total **17.275**. Una publicación secundaria que reproduce el reparto DANE de 2025 consigna **8.470 hombres** y **8.805 mujeres**:
https://telencuestas.com/censos-de-poblacion/colombia/2025/valle-del-cauca/san-pedro

La tasa combinada de dos subpoblaciones disjuntas se calcula por **promedio ponderado**:

`(106.3 × 8470 + 22.7 × 8805) / (8470 + 8805) = 63.69 homicidios/100.000`.

**La tasa 2025 63,69 es CALCULADA, no publicada como tasa total por DANE/TerriData.** La fuente secundaria del reparto por sexos deberá confrontarse con el archivo original DANE para certificarla. No hacer media aritmética simple (64,5) de dos tasas cuyos tamaños poblacionales difieren.

No promediar las tasas de Forensis 2023 y PTS Policía 2023: observan universos registrados diferentes, y su discrepancia exige mantener ambas fuentes.
