/** Datos públicos de notificaciones agregadas INS, sin microdatos individuales. */
import sivigila from '@/data/insSivigilaSanPedro76670.json';
import {poblacionDane} from './danePopulation';
import type {ValorDocumental} from './observacionesDocumentales2026';
const FUENTE='https://www.datos.gov.co/d/xd2n-cu8j';
const total=poblacionDane.find(x=>x.divipola==='76670'&&x.anio===2018)?.total;
const rec=sivigila.eventos.filter(x=>x.anio===2018);
const cases=(codigos:string[])=>rec.filter(x=>codigos.includes(x.codigo_evento)).reduce((s,x)=>s+x.casos_notificados,0);
export const observacionesINS:ValorDocumental[]=[
 ...rec.map(r=>({
  id:'INS-'+r.codigo_evento+'-'+r.anio,nombre:'Casos notificados INS: '+r.evento,sector:'Salud',
  valor:r.casos_notificados,unidad:'notificaciones',anio:r.anio,periodo:'2018',
  fuente:FUENTE,pagina:0,vinculacion:'adicional' as const,
  nota:'INS SIVIGILA 2018, casos reportados bajo COD_DPTO_O=76 y COD_MUN_O=670. No equivale automáticamente a incidencia por residencia ni a todos los casos reales; nunca usar ausencia de un evento como cero certificado.'
 })),
 ...total&&total>0?[{
  id:'INS-TB-ICET29-2018',nombre:'Tasa reconstruida de notificaciones por tuberculosis pulmonar y extrapulmonar',
  sector:'Salud',valor:Math.round(100000*cases(['810','820'])/total*100)/100,
  unidad:'notificaciones por 100.000 habitantes',anio:2018,periodo:'2018',
  fuente:FUENTE,pagina:0,codigoIcet:'ICET-29',vinculacion:'relacionada' as const,
  nota:'Estimación operativa: 1 notificación de tuberculosis extrapulmonar (código 810) + 2 pulmonares (código 820), dividido entre 16.948 habitantes proyectados por DANE PPED 2018 × 100.000 = 17,70. El atributo COD_MUN_O se asocia a municipio de origen/ocurrencia del registro INS, no se certificó la residencia de casos, validación diagnóstica posterior ni duplicados intersistema. Fuente poblacional https://www.dane.gov.co/files/censo2018/proyecciones-de-poblacion/Municipal/PPED-AreaMun-2018-2042_VP.xlsx'
 }]:[]
];
