/**
 * DANE PPED Proyecciones de población por área municipal, versión 08/08/2025.
 * Archivo primario: PPED-AreaMun-2018-2042_VP.xlsx
 * SHA256 de archivo oficial se conservará en catálogo de fuentes.
 * SOLO DIVIPOLA 76670 San Pedro Valle, NO 70717 San Pedro Sucre.
 * El año es vigencia proyectada, NO fecha de levantamiento censal.
 */
export type DanePoblacion = {anio:number;total:number;cabecera:number;rural:number;divipola:string;tipo:string};
export const poblacionDane:DanePoblacion[] = [
 {
  "anio": 2018,
  "total": 16948,
  "cabecera": 7575,
  "rural": 9373,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2019,
  "total": 17047,
  "cabecera": 7717,
  "rural": 9330,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2020,
  "total": 17184,
  "cabecera": 7869,
  "rural": 9315,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2021,
  "total": 17235,
  "cabecera": 7964,
  "rural": 9271,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2022,
  "total": 17256,
  "cabecera": 8048,
  "rural": 9208,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2023,
  "total": 17280,
  "cabecera": 8163,
  "rural": 9117,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2024,
  "total": 17270,
  "cabecera": 8257,
  "rural": 9013,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2025,
  "total": 17275,
  "cabecera": 8364,
  "rural": 8911,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2026,
  "total": 17244,
  "cabecera": 8466,
  "rural": 8778,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2027,
  "total": 17207,
  "cabecera": 8557,
  "rural": 8650,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2028,
  "total": 17155,
  "cabecera": 8650,
  "rural": 8505,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2029,
  "total": 17100,
  "cabecera": 8725,
  "rural": 8375,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2030,
  "total": 17052,
  "cabecera": 8794,
  "rural": 8258,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2031,
  "total": 16997,
  "cabecera": 8856,
  "rural": 8141,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2032,
  "total": 16912,
  "cabecera": 8891,
  "rural": 8021,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2033,
  "total": 16823,
  "cabecera": 8902,
  "rural": 7921,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2034,
  "total": 16745,
  "cabecera": 8915,
  "rural": 7830,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2035,
  "total": 16665,
  "cabecera": 8917,
  "rural": 7748,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2036,
  "total": 16541,
  "cabecera": 8882,
  "rural": 7659,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2037,
  "total": 16431,
  "cabecera": 8844,
  "rural": 7587,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2038,
  "total": 16331,
  "cabecera": 8824,
  "rural": 7507,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2039,
  "total": 16201,
  "cabecera": 8762,
  "rural": 7439,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2040,
  "total": 16058,
  "cabecera": 8709,
  "rural": 7349,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2041,
  "total": 15946,
  "cabecera": 8654,
  "rural": 7292,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 },
 {
  "anio": 2042,
  "total": 15798,
  "cabecera": 8587,
  "rural": 7211,
  "divipola": "76670",
  "tipo": "proyección poblacional DANE"
 }
];
export const fuentePoblacionDane={
 titulo:'Serie municipal de población por área, periodo 2018–2042',
 organismo:'DANE / PPED',
 publicacion:'2025-08-08',
 url:'https://www.dane.gov.co/files/censo2018/proyecciones-de-poblacion/Municipal/PPED-AreaMun-2018-2042_VP.xlsx',
 divipola:'76670',
 territorio:'San Pedro, Valle del Cauca',
 nombreHoja:'PobMunicipalxÁrea'
} as const;
