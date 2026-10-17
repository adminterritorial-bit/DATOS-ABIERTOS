/**
 * Motor de reconstrucción estadística. Todos los resultados dependen de
 * numeradores y denominadores oficiales observados en el MISMO territorio
 * y período, con fórmula y fuentes explícitas. Nunca rellena `null` como 0.
 */
import type {ValorDocumental} from './observacionesDocumentales2026';
import {observacionesExternas} from './observacionesFuentesExternas';
import {poblacionDane} from './danePopulation';
import {observacionesTerriData} from './terriDataExpanded';

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
const p2024=poblacion(2024);
const inter2024=fuente('OFI-FOR-INTER-2024',2024);
const intra2024=fuente('OFI-FOR-INTRA-2024',2024);
const pareja2024=fuente('OFI-FOR-PAREJA-2024',2024);

const afiliados=fuente('OFI-PTS-AFILIADOS-2023',2023);
const presupuesto=fuente('EXT-PRESUPUESTO-INGRESOS-2025',2025);
const tributarios=fuente('EXT-PRESUPUESTO-TRIBUTARIOS-2025',2025);
const intra=fuente('OFI-FOR-INTRA-CASOS-2023',2023);
const inter=fuente('OFI-FOR-INTER-CASOS-2023',2023);
const pareja=fuente('OFI-FOR-PAREJA-CASOS-2023',2023);
const carros=fuente('OFI-PTS-HURTO-AUTOMOTORES-2023',2023);
const motos=fuente('OFI-PTS-HURTO-MOTOS-2023',2023);

const ph2025=8470; // Hombres, proyecciones DANE reproducidas por Telencuestas.
const pm2025=8805; // Mujeres, mismo municipio y año.
const p2025=poblacion(2025);
if(ph2025+pm2025!==p2025.total)throw new Error('Desagregación de sexo incompatible con total DANE 2025');
const tasaH=observacionesTerriData.find(r=>r.id==='TERRI-031'&&r.anio===2025&&r.divipola==='76670');
const tasaM=observacionesTerriData.find(r=>r.id==='TERRI-033'&&r.anio===2025&&r.divipola==='76670');
if(!tasaH||!tasaM)throw new Error('Faltan tasas por sexo del mismo año para calcular homicidios');
const tasaHomicidios2025=(tasaH.valor*ph2025+tasaM.valor*pm2025)/p2025.total;

/** El cociente de población afiliada en MAR/2023 se compara con la proyección ANUAL DANE 2023.
 * Es una medida calculada, no la cobertura certificada por el Ministerio para el día de corte.
 */
export const indicadoresCalculados:ValorDocumental[]=[
 {id:'DER-CAT-PREDIOS-2024',nombre:'Total de predios registrados (urbanos y rurales)',sector:'Catastro',valor:4498+2903,unidad:'predios',anio:2024,periodo:'2024',fuente:'FICHA  TERRIDATA SAN PEDRO.pdf',pagina:14,codigoIcet:'ICET-14',vinculacion:'relacionada',nota:'DERIVADO: 4.498 predios urbanos + 2.903 rurales = 7.401 predios catastrales registrados en 2024. El total existente no equivale al número de predios actualizados mediante catastro multipropósito (ICET 14).'},
 {
 id:'DER-ICET-61-2024',nombre:'Tasa reconstruida de casos médico-legales por violencia interpersonal e intrafamiliar',sector:'Seguridad',
 valor:Math.round(porCienMil(inter2024.valor+intra2024.valor+pareja2024.valor,p2024.total)*100)/100,
 unidad:'casos examinados por 100.000 habitantes',anio:2024,periodo:'2024',
 fuente:inter2024.fuente,pagina:85,codigoIcet:'ICET-61',vinculacion:'relacionada',
 nota:'CALCULADO (10 violencia interpersonal + 2 intrafamiliar + 10 de pareja) / 17.270 habitantes DANE PPED 2024 × 100.000. Clasificación Forensis 2024 en columnas separadas, no tasa ICET certificada ni víctimas únicas; verificar no superposición de categorías.'
 },
 {
  id:'DER-ICET-57-2025',nombre:'Tasa total de homicidio intencional, ponderada por sexo',
  sector:'Seguridad',valor:Math.round(tasaHomicidios2025*100)/100,
  unidad:'homicidios por 100.000 habitantes',anio:2025,periodo:'2025',
  fuente:'FICHA  TERRIDATA SAN PEDRO.pdf',pagina:8,codigoIcet:'ICET-57',vinculacion:'directa',
  nota:'DERIVADO: (106,3 x 8.470 hombres + 22,7 x 8.805 mujeres) / 17.275 residentes DANE 2025 = 63,69 homicidios por 100.000 habitantes. Tasas específicas tomadas de la ficha TerriData 2025 (p. 8), y sexos de las proyecciones DANE 2025 publicadas como fuente secundaria en https://telencuestas.com/censos-de-poblacion/colombia/2025/valle-del-cauca/san-pedro . El total coincide con DANE PPED 2025, pero debe contrastarse la desagregación por sexo en el archivo original antes de certificar la tasa.'
 },
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
  periodo:'2023',fuente:carros.fuente,pagina:70,codigoIcet:'ICET-55',vinculacion:'directa',
  nota:'DERIVADO: 6 hurtos a automotores + 4 hurtos a motocicletas = 10 registros policiales (PTS, Tabla 33). Corresponde a las dos categorías disjuntas de vehículos motorizados publicadas por Policía; no incluye eventos no denunciados, tentativas ni definición ampliada si el cuestionario la exige.'
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
