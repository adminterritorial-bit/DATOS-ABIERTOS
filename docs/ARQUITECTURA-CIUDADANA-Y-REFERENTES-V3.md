# Observatorio de San Pedro — Arquitectura de información y diseño v3

## Hallazgo metodológico esencial

El **Índice de Capacidad Estadística Territorial (ICET)** del DANE mide la capacidad de producir, acceder, usar y fortalecer estadísticas municipales. Sus cuatro dimensiones son **entorno institucional**, **infraestructura**, **metodología estadística** y **accesibilidad y uso**. Estas cuatro dimensiones **no deben sustituir** las categorías de indicadores socioeconómicos.

El cuestionario de disponibilidad reúne **66 preguntas sobre estadísticas**. Se mantienen los 66 identificadores y descripciones en `icetCatalog.ts`. `territorialTaxonomy.ts` es una **segunda capa editorial ciudadana**, que agrupa las 66 preguntas en **14 temas** y **4 macroáreas**, sin modificar las preguntas originales ni afirmar que estas 14 categorías sean oficiales del DANE.

### Taxonomía ciudadana operativa (14 temas, 66 códigos sin duplicados)

| Macroárea | Tema ciudadano | Preguntas |
|---|---|---|
| Territorio y ambiente | Ambiente y sostenibilidad | 01–06 |
| Territorio y ambiente | Ordenamiento y ruralidad | 07, 08, 14 |
| Territorio y ambiente | Agua, energía y saneamiento | 64–66 |
| Desarrollo humano | Población y demografía | 15, 16, 43 |
| Desarrollo humano | Educación y aprendizaje | 17–23, 42 |
| Desarrollo humano | Vivienda y condiciones de vida | 24–26 |
| Desarrollo humano | Vigilancia epidemiológica | 27–30, 37, 39, 49 |
| Desarrollo humano | Atención y protección en salud | 31–36, 38, 40 |
| Desarrollo humano | Mortalidad y salud de la vida | 41, 44–48, 50–53 |
| Economía e instituciones | Economía y finanzas públicas | 09, 10 |
| Economía e instituciones | Gobierno e instituciones | 12, 13 |
| Seguridad y convivencia | Movilidad y transporte | 11, 54, 55 |
| Seguridad y convivencia | Convivencia y seguridad | 56–58, 60, 61 |
| Seguridad y convivencia | Víctimas y construcción de paz | 59, 62, 63 |

La clasificación ciudadana facilita descubrir, no modifica el organismo responsable ni la fuente del dato. El algoritmo clasifica otros registros para exploración temática mediante nombres/sectores, pero **solo reconoce vínculo ICET cuando ya está explícitamente registrado en el dato**. Nunca presenta coincidencias de texto como homologaciones oficiales.

## Investigación de referentes, decisiones y licencias

| Referente | Patrón estudiado | Decisión |
|---|---|---|
| [EvilCharts](https://evilcharts.com/docs) | Revelado de área/líneas, colores con degradados, tooltips, variantes Recharts/ECharts, leyendas clicables | Motor Recharts propio con reveal progresivo, tooltips y selector de gráfica; **no se copia una plantilla completa** |
| [Mosaic Lite](https://github.com/cruip/tailwind-dashboard-template) | Navegación lateral jerárquica, paneles limpios, storytelling | Inspiración compositiva exclusivamente. Su repositorio anuncia licencia GPL y restricciones para republicar el template; no se importa su código |
| [CoreUI Free](https://github.com/coreui/coreui-free-react-admin-template) | Navegación por grupos, componentes reutilizables, responsive, arquitectura por vistas | Sidebar temático modular propio, sin instalar otra infraestructura UI |
| [Tremor OSS](https://github.com/tremorlabs/template-dashboard-oss) | Jerarquía visual y visualización analítica de React/Next.js | Fichas con foco editorial y tipos de gráficos independientes |
| [shadcn UI Command](https://ui.shadcn.com/docs/components/base/command) | Búsqueda por comandos, filtrado y navegación por teclado | Se mantiene paleta existente Ctrl/⌘+K |
| [Our World in Data Grapher](https://ourworldindata.org/redesigning-our-interactive-data-visualizations) | Cambiar gráfico/mapa/tabla; fuente visible; ampliar; compartir | Tres vistas en un área de trabajo: Gráficas, Geografía e Indicadores |
| [World Bank DataBank](https://datahelpdesk.worldbank.org/knowledgebase/articles/193421-how-do-i-select-indicators-in-databank) | Selección sectorial, período y serie | Filtros explícitos de vigencia, naturaleza y tema, sin mezclar denominadores |
| [Data Commons Place Explorer](https://datacommons.org/place) | Exploración alrededor del lugar y temas locales | La municipalidad es el punto de partida, no un ranking numérico arbitrario |
| [ArcGIS Maps](https://doc.arcgis.com/en/arcgis-online/get-started/view-pop-ups-mv.htm) | Polígonos, puntos, fichas emergentes, elementos visuales | Popover con atributos reales de cada geometría |

**No copiar páginas ni componentes con licencias o derechos incompatibles.** Los componentes nuevos del sitio son implementaciones específicas del proyecto.

## Cartografía y alcance municipal

- Contorno de San Pedro: copia de geometría municipal MGN 2025, código DIVIPOLA `76670`, procedente de `geografiaMunicipal76670.json`.
- Consulta directa al ArcGIS REST del DANE: `https://geoportal.dane.gov.co/mparcgis/rest/services/Divipola/Serv_DIVIPOLA_MGN_2025/FeatureServer/305/query`.
- Filtro: `MPIO_CDPMP='76670'`, año del servicio 2025; se leen `ZU_CNMBRE`, `ZU_CDIVI`, `CLAS_CCDGO`, `ZU_NAREA`, `ZU_NALTD` y geometría WGS84.
- Los pines se crean **únicamente para los polígonos realmente devueltos**. Sin respuesta remota, se muestra el contorno municipal, no puntos inventados.
- El detalle local muestra área y altitud si están presentes; **no distribuye habitantes, delitos, morbilidad ni necesidades entre zonas** sin una base que tenga código o geometría compatible y variables desagregadas.
- La capa MGN DIVIPOLA referida incorpora centros poblados y cabeceras, **no es una base completa de veredas**, ni contiene por sí misma habitantes por vereda.
- Se conserva la comparación regional anterior en `/mapa/region/`; el explorador de San Pedro ocupa `/mapa/`.

## Gráficos y tratamiento estadístico

- No sumar tasas ni mezclar COP y personas; agrupar por `unidad` y `anio` para comparaciones.
- **Evolución:** únicamente registros repetidos del mismo indicador y unidad, en distintos años.
- **Comparación:** una vigencia y una misma unidad, con acceso a ficha fuente.
- **Participación:** disponible solo para un conjunto compatible de porcentajes observados, no para sumas de indicadores conceptualmente distintos. Se requiere revisión de si forman realmente partes de un todo antes de difundirlos como composición.
- Valores oficiales, relacionados, calculados y exploratorios conservan su clase original.
- Motion y Recharts aplican animaciones sin añadir grandes animaciones decorativas a cada registro; `prefers-reduced-motion` se respeta.
- Cada contenido interactivo debe ejecutar una acción: abrir ficha, cambiar dato o período, navegar, filtrar, comparar.

## Arquitectura sin remiendos

Los nuevos módulos reemplazan la **portada anterior** mediante `src/app/page.tsx` → `ObservatoryExperience`; las gráficas se encapsulan en `components/insights`, ArcGIS en `components/maps`, clasificación en `lib/territorialTaxonomy.ts` y consolidación pública en `lib/territorialDataset.ts`. La capa de diseño `experience.css` contiene todas las reglas v3 y no modifica `dashboard.css` a través de overrides a ciegas. Las otras rutas especializadas conservan sus componentes mientras se validan antes de su sustitución.

La aplicación permanece en **Next.js static export + GitHub Pages + Supabase**. ArcGIS REST se consulta desde el navegador sin credenciales privadas. Los fallos de la fuente remota se muestran sin simular resultados.

## Verificación y riesgos abiertos

- TypeScript, pruebas unitarias de los 66 códigos, compilación estática, pruebas de interacción desktop/tablet/móvil.
- Confirmar respuestas CORS/HTTP reales del ArcGIS DANE desde el navegador de producción; si hay indisponibilidad, mostrar la degradación correcta.
- Evaluar futuros tipos de gráfica según pertinencia: diagramas de flujo (presupuestos conciliados), series comparadas, histogramas, dispersión, coropletas y mapas de calor solo cuando existan los componentes, unidades y geometrías válidos.
- No se declaran problemas por barrio/vereda ni habitantes por centro poblado sin fuentes con esta granularidad.
