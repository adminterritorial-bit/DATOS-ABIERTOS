/**
 * Motor de reconstrucción estadística. Todos los resultados dependen de
 * numeradores y denominadores oficiales observados en el MISMO territorio
 * y período, con fórmula y fuentes explícitas. Nunca rellena `null` como 0.
 */
import type {ValorDocumental} from './observacionesDocumentales2026';
import {observacionesExternas} from './observacionesFuentesExternas';
import {poblacionDane} from './danePopulation';

const DANE='https://www.dane.gov.co/index.php/estadisticas-por-tema/demografia-y-poblacion/proyecciones-de-poblacion';
const pct=(numerador:number,denominador:number)=>{
 if(!Number.isFinite(numerador)||!Number.isFinite(denominador)||denominador<=0)throw new Error('Componentes estadísticos no compatibles');
 return 100*numerador/denominador;
};
const porCienMil=(numerador:number,denominador:number)=>pct(numerador,denominador)*1000;
function poblacion(anio:number){
 const found=poblacionDane.find(p=>p.anio===anio&&p.divipola==='76670');
 if(!found||!Number.isFinite(found.total)||found.total<=0)throw new Error('Población municipal no disponible para el período '+anio);
 return found;
}
function fuente(id:string,anio:number){
 const d=observacionesExternas.find(x=>x.id===id&&x.anio===anio);
 if(!d||!Number.isFinite(d.valor))throw new Error('Numerador documental incompatible: '+id+' '+anio);
 return d;
}
const p2023=poblacion(2023);
const afiliados=fuente('OFI-PTS-AFILIADOS-2023',2023);
const presupuesto=fuente('EXT-PRESUPUESTO-INGRESOS-2025',2025);
const tributarios=fuente('EXT-PRESUPUESTO-TRIBUTARIOS-2025',2025);
const intra=fuente('OFI-FOR-INTRA-CASOS-2023',2023);
const inter=fuente('OFI-FOR-INTER-CASOS-2023',2023);
const pareja=fuente('OFI-FOR-PAREJA-CASOS-2023',2023);
const carros=fuente('OFI-PTS-HURTO-AUTOMOTORES-2023',2023);
const motos=fuente('OFI-PTS-HURTO-MOTOS-2023',2023);

/** El cociente de población afiliada en MAR/2023 se compara con la proyección ANUAL DANE 2023.
 * Es una medida calculada, no la cobertura certificada por el Ministerio para el día de corte.
 */
export const indicadoresCalculados:ValorDocumental[]=[
 {
  id:'DER-ICET-38-2023',nombre:'Población afiliada al sistema de salud, calculada con registros públicos',
  sector:'Salud',valor:Math.round(pct(afiliados.valor,p2023.total)*100)/100,unidad:'%',
  anio:2023,periodo:'Numerador: marzo 2023; denominador: proyección anual 2023',
  fuente:afiliados.fuente,pagina:60,codigoIcet:'ICET-38',vinculacion:'directa',
  nota:'DERIVADO: 11.211 afiliados (MSPS/PTS Tabla 25; 7.293 subsidiados + 3.830 contributivos + 59 excepción + 29 INPEC) / 17.280 habitantes (DANE PPED, versión 08/08/2025) × 100. No se presenta como tasa oficial certificada del MSPS ni como dato 2025.'
 },
 {
  id:'DER-FIN-TRIBUTARIOS-2025',nombre:'Participación de ingresos tributarios en el presupuesto inicial',
  sector:'Finanzas públicas',valor:Math.round(pct(tributarios.valor,presupuesto.valor)*100)/100,unidad:'%',
  anio:2025,periodo:'Presupuesto inicial 2025',fuente:presupuesto.fuente,pagina:0,
  vinculacion:'relacionada',nota:'DERIVADO: ingresos tributarios iniciales / total rentas y recursos de capital iniciales × 100. NO equivale al ICET-10 de presupuesto financiado con TODOS los recursos propios.'
 },
 {
  id:'DER-ICET-55-2023',nombre:'Hurtos a vehículos motorizados registrados: automotores y motocicletas',
  sector:'Seguridad',valor:carros.valor+motos.valor,unidad:'casos reportados',anio:2023,
  periodo:'2023',fuente:carros.fuente,pagina:70,codigoIcet:'ICET-55',vinculacion:'relacionada',
  nota:'DERIVADO: 6 hurtos a automotores + 4 hurtos a motocicletas = 10 registros policiales (PTS, Tabla 33). El ICET también puede exigir intentos u otras clases de vehículo; el conteo no demuestra cobertura de todos los robos definidos.'
 },
 {
  id:'DER-ICET-61-2023',nombre:'Tasa calculada de casos médico-legales por violencia interpersonal e intrafamiliar',
  sector:'Seguridad',valor:Math.round(porCienMil(inter.valor+intra.valor+pareja.valor,p2023.total)*100)/100,
  unidad:'casos examinados por 100.000 habitantes',anio:2023,periodo:'2023',
  fuente:inter.fuente,pagina:90,codigoIcet:'ICET-61',vinculacion:'relacionada',
  nota:'DERIVADO: (18 violencia interpersonal + 5 intrafamiliar + 7 de pareja = 30 casos en columnas separadas de Forensis Tabla 8) / 17.280 habitantes DANE PPED 2023 × 100.000. Corresponde a casos médico-legales examinados, no garantiza personas únicas lesionadas; tasa distinta a la tasa oficial Forensis por usar otra versión de proyecciones.'
 },
 ...poblacionDane.filter(p=>p.divipola==='76670'&&p.anio>=2018&&p.anio<=2026).flatMap(p=>[
  {id:'DER-DEMO-CAB-'+p.anio,nombre:'Porcentaje de población proyectada en cabecera municipal',sector:'Demografía',valor:Math.round(pct(p.cabecera,p.total)*100)/100,unidad:'%',anio:p.anio,periodo:String(p.anio),fuente:DANE,pagina:0,vinculacion:'adicional' as const,nota:'DERIVADO: población cabecera / población total en la misma proyección anual DANE, municipio 76670.'},
  {id:'DER-DEMO-RUR-'+p.anio,nombre:'Porcentaje de población proyectada en centros poblados y rural disperso',sector:'Demografía',valor:Math.round(pct(p.rural,p.total)*100)/100,unidad:'%',anio:p.anio,periodo:String(p.anio),fuente:DANE,pagina:0,vinculacion:'adicional' as const,nota:'DERIVADO: población rural / población total en la misma proyección anual DANE, municipio 76670.'}
 ])
];
