/** Registro de integración de fuentes oficiales públicas.
 * "integrada" = extracción identificable ya versionada en el repositorio,
 * "por_integrar" = referencia documentada sin API conectada;
 * "sin_dato_local" = API operativa sin registro municipal atribuible.
 */
export type FuentePublica={id:string;nombre:string;tema:string;formato:string;url:string;estado:'integrada'|'por_integrar'|'sin_dato_local';detalle:string;periodicidad:string};
export const fuentesPublicas:FuentePublica[]=[
  {
    "id": "DANE-MGN",
    "nombre": "DANE – Marco Geoestadístico 2025",
    "tema": "Geografía",
    "formato": "ArcGIS FeatureServer/GeoJSON",
    "url": "https://geoportal.dane.gov.co/mparcgis/rest/services/Divipola/Serv_DIVIPOLA_MGN_2025/FeatureServer/317",
    "estado": "integrada",
    "detalle": "8 polígonos municipales oficiales para San Pedro y su entorno",
    "periodicidad": "Por versión DANE"
  },
  {
    "id": "DANE-PPED",
    "nombre": "DANE – Proyecciones demográficas",
    "tema": "Demografía",
    "formato": "XLSX descargable",
    "url": "https://www.dane.gov.co/files/censo2018/proyecciones-de-poblacion/Municipal/PPED-AreaMun-2018-2042_VP.xlsx",
    "estado": "integrada",
    "detalle": "Poblaciones oficiales por municipio, año y área",
    "periodicidad": "Cuando DANE actualice PPED"
  },
  {
    "id": "UPME-ICEE",
    "nombre": "UPME – Cobertura eléctrica municipal",
    "tema": "Servicios públicos",
    "formato": "ArcGIS FeatureServer",
    "url": "https://geo.upme.gov.co/server/rest/services/Capas_EnergiaElectrica/indice_cobertura_energia_electrica_mpio/FeatureServer/26",
    "estado": "integrada",
    "detalle": "ICEE urbano, rural y total, viviendas conectadas y totales",
    "periodicidad": "Anual"
  },
  {
    "id": "INS-SIVIGILA",
    "nombre": "INS – Vigilancia epidemiológica",
    "tema": "Salud",
    "formato": "Socrata SODA API",
    "url": "https://www.datos.gov.co/resource/xd2n-cu8j.json",
    "estado": "integrada",
    "detalle": "Notificaciones por evento de 2018, municipio de ocurrencia, sin registros personales",
    "periodicidad": "Corte histórico del conjunto"
  },
  {
    "id": "SALUD-SO",
    "nombre": "Salud – Indicadores municipales de mortalidad y morbilidad",
    "tema": "Salud",
    "formato": "Socrata SODA API",
    "url": "https://www.datos.gov.co/resource/4e4i-ua65.json",
    "estado": "integrada",
    "detalle": "180 observaciones municipales históricas de 2005–2020",
    "periodicidad": "Según conjunto publicado"
  },
  {
    "id": "RUV-HECHOS",
    "nombre": "UARIV – Víctimas por hecho municipal",
    "tema": "Víctimas",
    "formato": "Socrata SODA API",
    "url": "https://www.datos.gov.co/resource/9qih-4vkc.json",
    "estado": "integrada",
    "detalle": "Hechos victimizantes por corte y geografía; acumulados por hecho",
    "periodicidad": "Según cortes del registro"
  },
  {
    "id": "RUV-GENERAL",
    "nombre": "UARIV – Víctimas por municipio",
    "tema": "Víctimas",
    "formato": "Socrata SODA API",
    "url": "https://www.datos.gov.co/resource/ykxr-xynr.json",
    "estado": "integrada",
    "detalle": "Ocurrencia, declaración y ubicación, sin sumar como personas únicas",
    "periodicidad": "Según cortes del registro"
  },
  {
    "id": "SSPD-RUPS",
    "nombre": "Superservicios – Prestadores de servicios públicos",
    "tema": "Servicios públicos",
    "formato": "Socrata SODA API",
    "url": "https://www.datos.gov.co/resource/4qkq-csdn.json",
    "estado": "integrada",
    "detalle": "Prestadores con área de prestación San Pedro y departamento Valle",
    "periodicidad": "Por conjunto"
  },
  {
    "id": "SSPD-COB",
    "nombre": "Superservicios – Cobertura 2024",
    "tema": "Servicios públicos",
    "formato": "Anexo XLSX",
    "url": "https://www.superservicios.gov.co/sites/default/files/2025-12/Anexo-1-Base-de-informacion-2024.xlsx",
    "estado": "integrada",
    "detalle": "Acueducto, alcantarillado y aseo por área urbana/rural",
    "periodicidad": "Anual"
  },
  {
    "id": "SSPD-REC",
    "nombre": "Superservicios – Aprovechamiento 2024",
    "tema": "Ambiente",
    "formato": "Anexo XLSX",
    "url": "https://www.superservicios.gov.co/sites/default/files/2025-12/Base-informe-sectorial-de-aprovechamiento-2024.xlsx",
    "estado": "integrada",
    "detalle": "Materiales recuperados por tipo y municipio",
    "periodicidad": "Anual"
  },
  {
    "id": "SSPD-DISP",
    "nombre": "Superservicios – Disposición final 2024",
    "tema": "Ambiente",
    "formato": "Anexo XLSX",
    "url": "https://www.superservicios.gov.co/sites/default/files/2025-12/Base-de-datos-informe-nacional-de-disposicion-final-2024.xlsx",
    "estado": "integrada",
    "detalle": "Toneladas por municipio atendido y destino sanitario",
    "periodicidad": "Anual"
  },
  {
    "id": "RUNT",
    "nombre": "RUNT – Parque automotor municipal",
    "tema": "Transporte",
    "formato": "Socrata SODA API",
    "url": "https://www.datos.gov.co/resource/u3vn-bdcy.json",
    "estado": "sin_dato_local",
    "detalle": "Consulta implementada; no devolvió registros para San Pedro 76670. Proyección vehicular rechazada por sesgo de matrícula.",
    "periodicidad": "Mensual según conjunto"
  },
  {
    "id": "CVC",
    "nombre": "CVC – Geoportal ambiental",
    "tema": "Ambiente",
    "formato": "Visores y servicios geográficos",
    "url": "https://geo.cvc.gov.co/",
    "estado": "por_integrar",
    "detalle": "Vocación de uso de suelo, riesgos y calidad ambiental; requiere identificar capas y licencia",
    "periodicidad": "Por capa"
  },
  {
    "id": "IGAC",
    "nombre": "IGAC – Colombia en Mapas",
    "tema": "Catastro",
    "formato": "Servicios OGC/ArcGIS",
    "url": "https://www.colombiaenmapas.gov.co/",
    "estado": "por_integrar",
    "detalle": "Catastro multipropósito, parcelario y unidades catastrales municipales",
    "periodicidad": "Por versión"
  },
  {
    "id": "SISPRO",
    "nombre": "SISPRO – Cubos de salud",
    "tema": "Salud",
    "formato": "Cubos e informes",
    "url": "https://www.sispro.gov.co/",
    "estado": "por_integrar",
    "detalle": "Morbilidad y mortalidad con población, casos y causas CIE-10",
    "periodicidad": "Variable"
  },
  {
    "id": "MINEDU",
    "nombre": "MEN – Datos abiertos educación",
    "tema": "Educación",
    "formato": "Descargas institucionales",
    "url": "https://www.mineducacion.gov.co/portal/estadisticas/Datos-Abiertos-MEN/",
    "estado": "por_integrar",
    "detalle": "SIMAT, cobertura neta urbano-rural, Internet escolar y PAE",
    "periodicidad": "Anual"
  },
  {
    "id": "URT",
    "nombre": "UARIV – Unidad de Víctimas",
    "tema": "Víctimas",
    "formato": "Visores/Reportes",
    "url": "https://www.unidadvictimas.gov.co/visor-geografico/",
    "estado": "por_integrar",
    "detalle": "Superación de vulnerabilidad y atención psicosocial por municipio",
    "periodicidad": "Variable"
  },
  {
    "id": "DANE-EEVV",
    "nombre": "DANE – Estadísticas vitales",
    "tema": "Salud",
    "formato": "Microdatos anonimizados y tabulados",
    "url": "https://microdatos.dane.gov.co/",
    "estado": "por_integrar",
    "detalle": "Defunciones por CIE-10, edad y residencia para indicadores 47–53; exige filtros seguros y tablas municipales",
    "periodicidad": "Anual"
  }
];
