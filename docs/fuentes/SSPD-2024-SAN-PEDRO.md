# Superservicios, anexos 2024: extracción municipal San Pedro, Valle del Cauca (76670)

**Archivos oficiales procesados mediante GitHub Actions:** [Ejecución 38999039408](https://github.com/adminterritorial-bit/DATOS-ABIERTOS/actions/runs/38999039408). Se descargaron tres archivos originales XLSX **solo como insumos**, y se extrajeron las filas del municipio atendido usando *DIVIPOLA = 76670*. No se generó ninguna hoja Excel de entrega al usuario.

## 1. Cobertura de servicios públicos, año 2024

[Anexo 1 - Base de información 2024 SSPD](https://www.superservicios.gov.co/sites/default/files/2025-12/Anexo-1-Base-de-informacion-2024.xlsx), `Sheet1`, filas **6218–6223**, campos `codigo_dane`, `departamento`, `municipio`, `Servicio`, `Asentamiento`, `serie_certificada`, `serie_tratada`; estado «Dato certificado».

| Servicio | Urbana (%) | Rural (%) |
|---|---:|---:|
| Acueducto | 99,85 | 66,32 |
| Alcantarillado | 99,04 | 56,89 |
| Aseo / recolección | 90,06 | 60,36 |

Los valores de **cobertura** de red de acueducto y alcantarillado no demuestran por sí solos **calidad de agua** (ICET 64) ni todos los métodos de saneamiento adecuados (ICET 66). Su vinculación al catálogo es `relacionada`, conservando definición real.

## 2. Aprovechamiento de materiales, 2024

[Base informe sectorial de aprovechamiento 2024](https://www.superservicios.gov.co/sites/default/files/2025-12/Base-informe-sectorial-de-aprovechamiento-2024.xlsx), hoja `Base Toneladas 2024`, filas 591–594, `DIVIPOLA=76670` y `DEPARTAMENTO=VALLE DEL CAUCA`.

| Material | Toneladas/año |
|---|---:|
| Metales | 10,538 |
| Papel y cartón | 48,128 |
| Plásticos | 94,609 |
| Vidrio | 13,763 |
| **Total reportado** | **167,038** |

## 3. Disposición final en rellenos sanitarios, 2024

[Base nacional de disposición final 2024](https://www.superservicios.gov.co/sites/default/files/2025-12/Base-de-datos-informe-nacional-de-disposicion-final-2024.xlsx), hoja `Disposición Final 2024`, filas 1162–1163. **Filtrar columna `COD DANE ATENDIDO` = 76670**, nunca columna `COD DANE SITIO UBICACIÓN`, ya que hay otros municipios que usan el relleno localizado en San Pedro.

| Destino de residuos del municipio | Toneladas/año |
|---|---:|
| Relleno Sanitario Regional Presidente (San Pedro) | 3.651,889 |
| Relleno Sanitario Regional Colomba-El Guabal (Yotoco) | 289,900 |
| **Total reportado** | **3.941,789** |

Son dos operadores para el **municipio atendido** 76670 y año 2024, por lo que sus flujos reportados son diferenciados.

## 4. Valor reconstruido útil para ICET 4

La participación de materiales efectivamente aprovechados dentro del universo de *dos flujos SSPD reportados* es:

[
R = rac{167,038}{167,038 + 3941,789} 	imes 100 = 4,0653,%
]

La cifra **4,07 %** es una **estimación reproducible basada en flujos oficiales**. Presupone que aprovechamiento y disposición representan flujos independientes, comparables y suficientemente completos; no debe etiquetarse como tasa certificada por SSPD si los reportes no cubren toda la generación municipal. Mostrar en tarjeta «Proporción estimada de aprovechamiento de los residuos reportados», con ficha metodológica.

La fracción de toneladas reportadas a disposición final que se envió a *sitios tipo relleno sanitario* fue 100 % según las dos filas del anexo, pero **no se puede inferir 100 % de todos los residuos sólidos urbanos**: cobertura urbana de recolección reportada 90,06 %, y pueden existir residuos no recolectados. Para ICET 5 utilizar cantidad de toneladas dispuestas y/o porcentaje de recolección como estadísticas **relacionadas**, no un cumplimiento artificial.

## 5. Fuentes a usar en el aplicativo

Los valores individuales y la estimación están codificados en `src/lib/observacionesFuentesExternas.ts`. La pantalla `/icet/recuperados` conecta estos registros mediante un mapa explícito de estadísticas relacionadas, y `/api/icet/documentados` ofrece el agregado público con fuente, año, método y nota. No cargar las bases nacionales con municipios ajenos en Supabase.

**Contexto de la auditoría:** El PDF/URL fuente tiene naturaleza gubernamental, el hecho de que sea un archivo XLSX no significa entregar un Excel al usuario, ya que únicamente se utiliza como insumo ETL para visualizaciones web.
