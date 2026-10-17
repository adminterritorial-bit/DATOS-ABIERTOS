/** Catálogo de métodos de modelación parametrizables para las definiciones ICET aún sin cifra. */
export type TipoReceta='proporcion'|'tasa'|'conteo'|'referencia'|'brecha';
export type Receta={numero:number;modelo:TipoReceta;formula:string;etiquetaNumerador:string;etiquetaDenominador:string;fuentes:string;nota:string};
export const recetasEstimacion:Receta[]=[
  {
    "numero": 1,
    "modelo": "proporcion",
    "formula": "Caudal urbano efectivamente tratado / caudal urbano de aguas residuales generado × 100",
    "etiquetaNumerador": "m³ tratados",
    "etiquetaDenominador": "m³ generados",
    "fuentes": "SSPD · PTAR municipal · CVC",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 2,
    "modelo": "tasa",
    "formula": "Personas únicas afectadas por eventos recurrentes / población municipal expuesta × 100.000",
    "etiquetaNumerador": "personas afectadas",
    "etiquetaDenominador": "población expuesta",
    "fuentes": "UNGRD · SNGRD · CMGRD",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 3,
    "modelo": "conteo",
    "formula": "Tasa de negocios verdes verificados por establecimiento comparable × establecimientos locales elegibles",
    "etiquetaNumerador": "negocios verdes verificados en pares",
    "etiquetaDenominador": "empresas elegibles de pares",
    "fuentes": "CVC · MinAmbiente · Ventanilla de Negocios Verdes",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 6,
    "modelo": "conteo",
    "formula": "Toneladas de residuos peligrosos tratados / toneladas generadas en comparables × toneladas RESPEL locales",
    "etiquetaNumerador": "toneladas tratadas en comparables",
    "etiquetaDenominador": "toneladas RESPEL generadas en comparables",
    "fuentes": "IDEAM RESPEL · autoridades ambientales",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 11,
    "modelo": "conteo",
    "formula": "Parque registrado por población comparable × población objetivo municipal. Validar sesgo de sede de matrícula.",
    "etiquetaNumerador": "vehículos activos e inconsistentes en pares",
    "etiquetaDenominador": "población de municipios pares",
    "fuentes": "RUNT 2.0 · DANE PPED",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 13,
    "modelo": "proporcion",
    "formula": "Mujeres en cargos directivos del Estado / total de cargos directivos × 100",
    "etiquetaNumerador": "directivas",
    "etiquetaDenominador": "total de cargos directivos",
    "fuentes": "Función Pública · Ley de Cuotas · Talento Humano",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 15,
    "modelo": "referencia",
    "formula": "Esperanza de vida a nacimiento (e0) de tabla de vida regional comparable. NO calcular como inverso de mortalidad bruta.",
    "etiquetaNumerador": "e0 publicado del comparable",
    "etiquetaDenominador": "unidad 1 para valor de referencia",
    "fuentes": "DANE · tablas de mortalidad · edades y sexos",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 17,
    "modelo": "brecha",
    "formula": "Cobertura neta en educación urbana (%) − cobertura neta rural (%)",
    "etiquetaNumerador": "cobertura neta urbana (%)",
    "etiquetaDenominador": "cobertura neta rural (%)",
    "fuentes": "MEN SIMAT · DANE población en edad escolar por área",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 19,
    "modelo": "proporcion",
    "formula": "Matrícula oficial con conexión funcional a Internet / matrícula oficial total × 100",
    "etiquetaNumerador": "estudiantes con internet",
    "etiquetaDenominador": "matrícula oficial total",
    "fuentes": "MEN · SINEB · SIMAT · educación Valle",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 30,
    "modelo": "proporcion",
    "formula": "Defunciones por dengue / casos confirmados de dengue × 100",
    "etiquetaNumerador": "defunciones confirmadas por dengue",
    "etiquetaDenominador": "casos dengue confirmados",
    "fuentes": "INS SIVIGILA · SISPRO",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 31,
    "modelo": "conteo",
    "formula": "Médicos activos en la zona por población comparable × población municipal",
    "etiquetaNumerador": "médicos RETHUS en pares",
    "etiquetaDenominador": "población de pares",
    "fuentes": "MinSalud RETHUS · prestadores REPS · DANE",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 33,
    "modelo": "proporcion",
    "formula": "Embarazos subsiguientes en adolescentes 15–19 / embarazos totales adolescentes 15–19 × 100",
    "etiquetaNumerador": "embarazos subsiguientes",
    "etiquetaDenominador": "embarazos adolescentes",
    "fuentes": "SISPRO · RUAF · EEVV DANE",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 34,
    "modelo": "proporcion",
    "formula": "Mujeres 15–19 madres o embarazadas por primera vez / total de mujeres 15–19 × 100",
    "etiquetaNumerador": "adolescentes madres/primer embarazo",
    "etiquetaDenominador": "mujeres 15–19",
    "fuentes": "DANE CNPV · EEVV · ENDS / SISPRO",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 35,
    "modelo": "proporcion",
    "formula": "Niñas/niños con paquete de atenciones priorizadas / población objetivo primera infancia × 100",
    "etiquetaNumerador": "menores con atenciones integrales",
    "etiquetaDenominador": "total menores primera infancia",
    "fuentes": "ICBF · SNBF · SISPRO",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 37,
    "modelo": "proporcion",
    "formula": "Casos elegibles de hepatitis C crónica que iniciaron tratamiento / elegibles totales × 100",
    "etiquetaNumerador": "casos que inician tratamiento",
    "etiquetaDenominador": "pacientes elegibles",
    "fuentes": "SISPRO · Cuenta de Alto Costo · MinSalud",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 39,
    "modelo": "proporcion",
    "formula": "Nacidos infectados por transmisión de hepatitis B maternoinfantil / nacidos expuestos × 100",
    "etiquetaNumerador": "casos infantiles infectados",
    "etiquetaDenominador": "nacidos expuestos",
    "fuentes": "INS · PAI · SISPRO",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 40,
    "modelo": "proporcion",
    "formula": "Dosis aplicadas de triple viral a población de un año / población objetivo de un año × 100",
    "etiquetaNumerador": "dosis triple viral aplicadas a un año",
    "etiquetaDenominador": "población objetivo de un año",
    "fuentes": "MinSalud PAI · DANE proyección por edad",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 47,
    "modelo": "tasa",
    "formula": "Defunciones <5 con causa básica desnutrición / población <5 × 100.000",
    "etiquetaNumerador": "muertes <5 desnutrición",
    "etiquetaDenominador": "población <5",
    "fuentes": "DANE EEVV · SISPRO RUAF",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 48,
    "modelo": "tasa",
    "formula": "Defunciones <18 por tumores malignos / población <18 × 100.000",
    "etiquetaNumerador": "muertes <18 tumores",
    "etiquetaDenominador": "población <18",
    "fuentes": "DANE EEVV · SISPRO",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 49,
    "modelo": "tasa",
    "formula": "Defunciones por VIH/SIDA (causa básica B20–B24) / población municipal × 100.000",
    "etiquetaNumerador": "muertes causa básica VIH/SIDA",
    "etiquetaDenominador": "población de referencia",
    "fuentes": "DANE EEVV defunciones · SISPRO",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 50,
    "modelo": "tasa",
    "formula": "Defunciones prematuras por enfermedades crónicas respiratorias bajas / población edad objetivo × 100.000",
    "etiquetaNumerador": "muertes por CIE-10 respiratorias en edad definida",
    "etiquetaDenominador": "población edad objetivo",
    "fuentes": "DANE EEVV · SISPRO",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 51,
    "modelo": "tasa",
    "formula": "Defunciones prematuras por lista especificada de neoplasias / población edad objetivo × 100.000",
    "etiquetaNumerador": "muertes por CIE-10 neoplasias listadas",
    "etiquetaDenominador": "población edad objetivo",
    "fuentes": "DANE EEVV · SISPRO",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 52,
    "modelo": "tasa",
    "formula": "Defunciones prematuras por diabetes (E10–E14) / población edad objetivo × 100.000",
    "etiquetaNumerador": "muertes por diabetes en edad definida",
    "etiquetaDenominador": "población edad objetivo",
    "fuentes": "DANE EEVV · SISPRO",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 53,
    "modelo": "tasa",
    "formula": "Defunciones por causas no transmisibles entre 30–70 / población 30–70 × 100.000",
    "etiquetaNumerador": "muertes ENT 30–70",
    "etiquetaDenominador": "población 30–70",
    "fuentes": "DANE EEVV · SISPRO · definiciones OMS",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  },
  {
    "numero": 63,
    "modelo": "conteo",
    "formula": "Víctimas que superaron vulnerabilidad / víctimas elegibles en municipio par × víctimas elegibles de San Pedro",
    "etiquetaNumerador": "personas únicas con superación en pares",
    "etiquetaDenominador": "personas elegibles en pares",
    "fuentes": "UARIV · SNARIV · RUV nueva medición",
    "nota": "Usar componentes de la misma definición, municipio/área y período; una analogía nunca se certifica como dato municipal observado."
  }
];
export function escenarioEstimacion(receta:Receta,numerador:number,denominador:number,universoMunicipal:number):number|null{
 if(![numerador,denominador,universoMunicipal].every(x=>Number.isFinite(x)&&x>=0))return null;
 if(receta.modelo==='referencia')return numerador;
 if(receta.modelo==='brecha')return Math.abs(numerador-denominador);
 if(denominador<=0)return null;
 const razon=numerador/denominador;
 if(receta.modelo==='proporcion')return razon*100;
 if(receta.modelo==='tasa')return razon*100000;
 return razon*universoMunicipal;
}
