/**
 * Catálogo base ICET 2025, 66 indicadores del Cuestionario de disponibilidad del DANE.
 * Los nombres 55–63 corresponden a Seguridad y Defensa; la etiqueta "Seguridad y Defensa"
 * es clasificación funcional, no modifica la taxonomía original "Sociodemográfico".
 * Ningún dato no confirmado se convierte automáticamente en cero.
 */
export interface IndicadorICET {
  codigo: string; numero: number; nombre: string; area: string;
  secretaria: string; valor2025: number | null; estado: 'pendiente';
  campos: string[]; fuentesPropuestas: string[];
}
const base = [
  {
    "numero": 1,
    "nombre": "Porcentaje de aguas residuales urbanas tratadas",
    "area": "Ambiental"
  },
  {
    "numero": 2,
    "nombre": "Tasa de personas afectadas a causa de eventos recurrentes",
    "area": "Ambiental"
  },
  {
    "numero": 3,
    "nombre": "Negocios verdes verificados",
    "area": "Ambiental"
  },
  {
    "numero": 4,
    "nombre": "Porcentaje de residuos sólidos efectivamente aprovechados",
    "area": "Ambiental"
  },
  {
    "numero": 5,
    "nombre": "Porcentaje de residuos sólidos urbanos dispuestos adecuadamente",
    "area": "Ambiental"
  },
  {
    "numero": 6,
    "nombre": "Residuos peligrosos aprovechados y tratados",
    "area": "Ambiental"
  },
  {
    "numero": 7,
    "nombre": "Hectáreas de pequeña y mediana propiedad rural, formalizadas",
    "area": "Económico"
  },
  {
    "numero": 8,
    "nombre": "Vocación de uso del suelo (caracterización y zonificación)",
    "area": "Económico"
  },
  {
    "numero": 9,
    "nombre": "Valor agregado por municipio",
    "area": "Económico"
  },
  {
    "numero": 10,
    "nombre": "Porcentaje de presupuesto municipal financiado con recursos propios",
    "area": "Económico"
  },
  {
    "numero": 11,
    "nombre": "Parque automotor por municipio (particular, oficial, público) incluyendo motocicletas",
    "area": "Económico"
  },
  {
    "numero": 12,
    "nombre": "Índice de desempeño institucional",
    "area": "Sociodemográfico"
  },
  {
    "numero": 13,
    "nombre": "Porcentaje de mujeres en cargos directivos del Estado Colombiano",
    "area": "Sociodemográfico"
  },
  {
    "numero": 14,
    "nombre": "Predios del país con catastro multipropósito formado y/o actualizado total o parcialmente",
    "area": "Sociodemográfico"
  },
  {
    "numero": 15,
    "nombre": "La esperanza de vida al nacer (total, hombre, mujer)",
    "area": "Sociodemográfico"
  },
  {
    "numero": 16,
    "nombre": "Total población",
    "area": "Sociodemográfico"
  },
  {
    "numero": 17,
    "nombre": "Brecha entre cobertura neta urbano-rural en educación preescolar, básica y media",
    "area": "Sociodemográfico"
  },
  {
    "numero": 18,
    "nombre": "Cobertura en educación superior",
    "area": "Sociodemográfico"
  },
  {
    "numero": 19,
    "nombre": "Porcentaje de matrícula oficial con conexión a internet",
    "area": "Sociodemográfico"
  },
  {
    "numero": 20,
    "nombre": "Tasa de analfabetismo para la población de 15 años y más",
    "area": "Sociodemográfico"
  },
  {
    "numero": 21,
    "nombre": "Tasa de cobertura bruta en educación media",
    "area": "Sociodemográfico"
  },
  {
    "numero": 22,
    "nombre": "Tasa de cobertura bruta en transición",
    "area": "Sociodemográfico"
  },
  {
    "numero": 23,
    "nombre": "Tasa de deserción intra-anual del sector oficial en educación básica y media",
    "area": "Sociodemográfico"
  },
  {
    "numero": 24,
    "nombre": "Hogares urbanos con déficit cualitativo de vivienda (CNPV 2018)",
    "area": "Sociodemográfico"
  },
  {
    "numero": 25,
    "nombre": "Hogares urbanos con déficit cuantitativo de vivienda (CNPV 2018)",
    "area": "Sociodemográfico"
  },
  {
    "numero": 26,
    "nombre": "Medida de pobreza multidimensional Censal",
    "area": "Sociodemográfico"
  },
  {
    "numero": 27,
    "nombre": "Incidencia de la hepatitis B por cada 100.000 habitantes",
    "area": "Sociodemográfico"
  },
  {
    "numero": 28,
    "nombre": "Incidencia de malaria",
    "area": "Sociodemográfico"
  },
  {
    "numero": 29,
    "nombre": "Incidencia de tuberculosis",
    "area": "Sociodemográfico"
  },
  {
    "numero": 30,
    "nombre": "Letalidad por dengue",
    "area": "Sociodemográfico"
  },
  {
    "numero": 31,
    "nombre": "Número de médicos",
    "area": "Sociodemográfico"
  },
  {
    "numero": 32,
    "nombre": "Porcentaje de menores de 1 año con tercera dosis de pentavalente",
    "area": "Sociodemográfico"
  },
  {
    "numero": 33,
    "nombre": "Porcentaje de mujeres de 15 a 19 años con embarazo subsiguiente",
    "area": "Sociodemográfico"
  },
  {
    "numero": 34,
    "nombre": "Porcentaje de mujeres de 15 a 19 años que son madres o están embarazadas de su primer hijo",
    "area": "Sociodemográfico"
  },
  {
    "numero": 35,
    "nombre": "Porcentaje de niñas y niños en primera infancia que cuentan con las atenciones priorizadas en el marco de la atención integral",
    "area": "Sociodemográfico"
  },
  {
    "numero": 36,
    "nombre": "Porcentaje de partos atendidos por personal calificado",
    "area": "Sociodemográfico"
  },
  {
    "numero": 37,
    "nombre": "Porcentaje de personas con criterio de tratamiento y diagnóstico de hepatitis C crónica a quienes se les inicia el tratamiento",
    "area": "Sociodemográfico"
  },
  {
    "numero": 38,
    "nombre": "Porcentaje de población afiliada al sistema de seguridad social en salud",
    "area": "Sociodemográfico"
  },
  {
    "numero": 39,
    "nombre": "Porcentaje de transmisión materno-infantil de la hepatitis B",
    "area": "Sociodemográfico"
  },
  {
    "numero": 40,
    "nombre": "Porcentaje niños y niñas de 1 año con vacunación de triple viral",
    "area": "Sociodemográfico"
  },
  {
    "numero": 41,
    "nombre": "Razón de mortalidad materna (42 días)",
    "area": "Sociodemográfico"
  },
  {
    "numero": 42,
    "nombre": "Tasa de cobertura del Programa de Alimentación Escolar",
    "area": "Sociodemográfico"
  },
  {
    "numero": 43,
    "nombre": "Tasa de fecundidad específica en mujeres adolescentes de 15 a 19 años",
    "area": "Sociodemográfico"
  },
  {
    "numero": 44,
    "nombre": "Tasa de mortalidad de niños menores de 5 años",
    "area": "Sociodemográfico"
  },
  {
    "numero": 45,
    "nombre": "Tasa de mortalidad infantil",
    "area": "Sociodemográfico"
  },
  {
    "numero": 46,
    "nombre": "Tasa de mortalidad neonatal",
    "area": "Sociodemográfico"
  },
  {
    "numero": 47,
    "nombre": "Tasa de mortalidad por desnutrición en menores de 5 años",
    "area": "Sociodemográfico"
  },
  {
    "numero": 48,
    "nombre": "Tasa de mortalidad por tumores malignos en menores de 18 años",
    "area": "Sociodemográfico"
  },
  {
    "numero": 49,
    "nombre": "Tasa de mortalidad por VIH/SIDA",
    "area": "Sociodemográfico"
  },
  {
    "numero": 50,
    "nombre": "Tasa de mortalidad prematura de las enfermedades crónicas de las vías respiratorias inferiores",
    "area": "Sociodemográfico"
  },
  {
    "numero": 51,
    "nombre": "Tasa de mortalidad prematura por cáncer de mama, cuello uterino, colon y recto, pulmón, próstata, estómago, linfoma no Hodgkin y Leucemia en adultos",
    "area": "Sociodemográfico"
  },
  {
    "numero": 52,
    "nombre": "Tasa de mortalidad prematura por diabetes",
    "area": "Sociodemográfico"
  },
  {
    "numero": 53,
    "nombre": "Tasa de mortalidad prematura por enfermedades no transmisibles en población entre 30 y hasta 70 años",
    "area": "Sociodemográfico"
  },
  {
    "numero": 54,
    "nombre": "Tasa General de mortalidad por accidentes de tránsito terrestre",
    "area": "Sociodemográfico"
  },
  {
    "numero": 55,
    "nombre": "Número de robos de vehículos motorizados",
    "area": "Seguridad y Defensa"
  },
  {
    "numero": 56,
    "nombre": "Tasa de feminicidio (homicidios de mujeres asesinadas por razones de género, por cada 100.000 mujeres)",
    "area": "Seguridad y Defensa"
  },
  {
    "numero": 57,
    "nombre": "Tasa de homicidios",
    "area": "Seguridad y Defensa"
  },
  {
    "numero": 58,
    "nombre": "Tasa de mortalidad por lesiones autoinfligidas intencionalmente",
    "area": "Seguridad y Defensa"
  },
  {
    "numero": 59,
    "nombre": "Tasa de víctimas directas de homicidio y desaparición forzada registradas en RUV",
    "area": "Seguridad y Defensa"
  },
  {
    "numero": 60,
    "nombre": "Tasa de victimización de hurto a personas",
    "area": "Seguridad y Defensa"
  },
  {
    "numero": 61,
    "nombre": "Tasa de violencia interpersonal",
    "area": "Seguridad y Defensa"
  },
  {
    "numero": 62,
    "nombre": "Víctimas con atención o acompañamiento psicosocial individual, familiar, comunitaria y/o grupal",
    "area": "Seguridad y Defensa"
  },
  {
    "numero": 63,
    "nombre": "Víctimas que superaron la situación de vulnerabilidad (nueva medición)",
    "area": "Seguridad y Defensa"
  },
  {
    "numero": 64,
    "nombre": "Acceso a agua potable adecuado",
    "area": "Sociodemográfico"
  },
  {
    "numero": 65,
    "nombre": "Cobertura de energía eléctrica",
    "area": "Sociodemográfico"
  },
  {
    "numero": 66,
    "nombre": "Porcentaje de la población con acceso a métodos de saneamiento adecuados",
    "area": "Sociodemográfico"
  }
] as const;
export function dependenciaICET(n: number): string {
  if(n <= 6) return 'Ambiente / SEDAMA';
  if(n <= 9) return 'Planeación y Agricultura';
  if(n === 10) return 'Hacienda';
  if(n === 11) return 'Tránsito / Planeación';
  if(n <= 13) return 'Secretaría General / Talento Humano';
  if(n <= 16) return 'Planeación e Infraestructura';
  if(n <= 23) return 'Oficina de Educación / Gobernación del Valle';
  if(n <= 26) return 'Planeación e Infraestructura';
  if(n <= 41) return 'Secretaría de Salud';
  if(n === 42) return 'Educación y PAE';
  if(n <= 54) return 'Secretaría de Salud';
  if(n <= 61) return 'Gobierno y Convivencia Ciudadana / Policía';
  if(n <= 63) return 'Gobierno / Enlace Municipal de Víctimas';
  return 'Planeación / Operador de servicios';
}
export function camposICET(n:number, nombre:string):string[]{
 const txt=nombre.toLowerCase();
 if(n === 11) return ['Automotores particulares','Automotores oficiales','Automotores públicos','Motocicletas','Fecha de corte y sistema RUNT'];
 if(n === 17) return ['Cobertura neta urbana (%)','Cobertura neta rural (%)'];
 if(n === 59) return ['Víctimas directas de homicidio RUV','Víctimas directas de desaparición forzada RUV','Población DANE correspondiente','Criterio territorial y fecha de ocurrencia'];
 if(n === 62) return ['Personas únicas atendidas','Modalidad de atención','Programa responsable'];
 if(n === 63) return ['Víctimas con medición nueva','Víctimas que superaron vulnerabilidad'];
 if(/tasa|porcentaje|cobertura|incidencia|letalidad|razón|brecha/.test(txt))return ['Numerador (según ficha oficial)','Denominador (según ficha oficial)','Unidad/factor','Fecha de corte'];
 return ['Valor absoluto o cantidad','Unidad y período'];
}
export const indicadoresICET: IndicadorICET[] = base.map(({numero,nombre,area})=>({
 codigo:'ICET-'+String(numero).padStart(2,'0'), numero, nombre, area,
 secretaria:dependenciaICET(numero), valor2025:null, estado:'pendiente' as const,
 campos:camposICET(numero,nombre), fuentesPropuestas:numero>=55&&numero<=61?['Policía Nacional','MinDefensa','DANE']:numero>=62&&numero<=63?['Unidad para las Víctimas','Enlace municipal']:numero>=27&&numero<=54?['SISPRO','INS','DANE']:['DANE','DNP','Entidad productora competente']
}));
