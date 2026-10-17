/** DANE EEVV, cuadro definitivo 2024, municipios de RESIDENCIA.
 * Causas de muerte codificadas en lista OPS 6/67, grupo de edad agregado.
 * Publicamos datos agregados, nunca microdatos individuales.
 */
import dades from '@/data/daneDefunciones76670_2024.json';
import type {ValorDocumental} from './observacionesDocumentales2026';
import {poblacionDane} from './danePopulation';
const SOURCE=dades.fuente;
const notes='DANE EEVV 2024, Cuadro5, municipio de residencia del fallecido 76670. Causa de muerte por lista OPS 6/67. Archivo definitivo actualizado 06/02/2026. ';
const codes=new Map(dades.registros_causa.map(c=>[c.grupo,c] as const));
const total=poblacionDane.find(p=>p.divipola==='76670'&&p.anio===2024)?.total;
if(!total||total<=0||dades.total_defunciones!==130)throw new Error('DANE municipal age population/death mismatch');
const by=(code:string)=>codes.get(code);
const n=(code:string)=>by(code)?.total??0;
const under5=(code:string)=>(by(code)?.edades.menor_1??0)+(by(code)?.edades.edad_1_4??0);
const cancers=['201','202','203','204','205','206','207','208','209','210','211','212','213','214'];
const highPriorityCancers=['201','202','204','206','207','210','212','213'];
const circulatory=['301','302','303','304','305','306','307','308','309'];
const aggregate=(labels:string[])=>labels.reduce((t,c)=>t+n(c),0);
const noteZero='DANE Cuadro5 2024 tiene categorías de causas exhaustivas, cuya suma da 130 defunciones de residentes de San Pedro. Las causas no listadas no presentan defunciones en esta tabla. Un cero verificado es un valor oficial, distinto de un dato faltante.';
const observation=(id:string,nombre:string,valor:number,unidad:string,icet:string,clase:'directa'|'relacionada',nota:string):ValorDocumental=>({
 id,nombre,valor,unidad,anio:2024,periodo:'2024',fuente:SOURCE,pagina:0,codigoIcet:icet,vinculacion:clase,sector:'Salud',
 nota:notes+nota
});
export const observacionesDaneMortalidad:ValorDocumental[]=[
 observation('DANE-ICET47-2024','Tasa de mortalidad por deficiencias nutricionales en menores de 5 años',
  0,'muertes por 100.000 menores de 5 años','ICET-47','directa',
  'Código OPS 602 (Deficiencias nutricionales y anemias nutricionales), menores de 1 año + edades 1–4 = '+under5('602')+' defunciones. Denominador estimado del grupo 0–4 años: 1.322 residentes 2024 en desglose quinquenal DANE reproducido por https://telencuestas.com/censos-de-poblacion/colombia/2024/valle-del-cauca/san-pedro ; tasa 0/1322*100000 = 0. '+noteZero),
 observation('DANE-ICET49-2024','Tasa de mortalidad por VIH/SIDA, residentes San Pedro',
  (n('107')/total)*100000,'defunciones por 100.000 habitantes','ICET-49','directa',
  'Causa OPS 107 Enfermedad por VIH (SIDA): '+n('107')+' fallecimientos. Población DANE PPED 2024: '+total+'. Tasa = defunciones/población*100.000. '+noteZero),
 observation('DANE-ICET48-2024','Defunciones por tumores malignos de menores de 15 años (ámbito parcial ICET 48)',
  cancers.reduce((t,c)=>t+(by(c)?.edades.menor_1??0)+(by(c)?.edades.edad_1_4??0)+(by(c)?.edades.edad_5_14??0),0),'defunciones (edades 0–14)','ICET-48','relacionada',
  'La fuente agrupa edades 15–44, así que no identifica los casos entre 15 y 17 años. No usar el cero 0–14 como tasa de mortalidad de todos los menores de 18.'),
 observation('DANE-ICET50-2024','Defunciones por enfermedades crónicas de vías respiratorias inferiores (todas las edades)',
  n('605'),'defunciones','ICET-50','relacionada',
  'Grupo OPS 605: '+n('605')+' defunciones en todas las edades. El ICET pide mortalidad prematura, que requiere desagregar 30–70 años; esta tabla utiliza 15–44, 45–64 y 65–84.'),
 observation('DANE-ICET51-2024','Defunciones por ocho grupos de neoplasias seleccionados (todas las edades)',
  aggregate(highPriorityCancers),'defunciones','ICET-51','relacionada',
  'Grupos OPS '+highPriorityCancers.join(', ')+' incluyen tumores malignos de estómago, colon, pulmón, mama, cuello uterino, próstata, leucemia y tumores del tejido linfático. No coincide exactamente con los linfomas no Hodgkin ni con límite de edad 30–70 del ICET.'),
 observation('DANE-ICET52-2024','Defunciones por diabetes mellitus (todas las edades)',
  n('601'),'defunciones','ICET-52','relacionada',
  'Grupo OPS 601, '+n('601')+' defunciones 2024. No equivale a mortalidad prematura de 30–70 años sin obtener edades exactas.'),
 observation('DANE-ICET53-2024','Defunciones por enfermedades del sistema circulatorio (todas las edades)',
  aggregate(circulatory),'defunciones','ICET-53','relacionada',
  'Suma causas OPS 301–309 sin duplicar subgrupos: '+aggregate(circulatory)+' defunciones. Estadística contextual de enfermedades no transmisibles, no equivale al conjunto total de causas ENT ni a la edad 30–70.'),
 observation('DANE-RESIDENTES-MORTALIDAD-2024','Defunciones totales de residentes, todas las causas',
  dades.total_defunciones,'defunciones','ICET-53','relacionada',
  'Total 130 defunciones de RESIDENTES (Cuadro4/5). Diferente de 65 defunciones OCURRIDAS físicamente en San Pedro (Cuadro3).'),
 ...dades.registros_causa.map(c=>({
  id:'DANE-CAUSA-'+c.grupo+'-2024',nombre:c.nombre,sector:'Salud',valor:c.total,
  unidad:'defunciones de residentes',anio:2024,periodo:'2024',fuente:SOURCE,pagina:0,
  vinculacion:'adicional' as const,nota:notes+'Grupo de causa '+c.grupo+'; todas las edades. Totales sexos: '+c.hombres+' hombres, '+c.mujeres+' mujeres.'
 }))
];
