import {datumDates} from './citizenNavigation.mjs';
import {formatSectorValue} from './sectorInsights.mjs';

const routes=[
 {id:'rendicion',titulo:'Rendición de cuentas 2025',descripcion:'Inversión, beneficiarios, programas y compromisos',href:'/rendicion/',periodo:'Gestión 2025',fuente:'Alcaldía de San Pedro'},
 {id:'territorios',titulo:'Comparadores territoriales',descripcion:'Energía e internet: San Pedro, Valle del Cauca y Colombia',href:'/territorios/',periodo:'UPME 2024 · MinTIC 2017–2023 · ECV 2025',fuente:'UPME · MinTIC · DANE'},
 {id:'inicio',titulo:'Inicio y panorama',descripcion:'Visión general del municipio y tableros por sector',href:'/',periodo:'Múltiples vigencias',fuente:'Fuentes oficiales documentadas'},
 {id:'icet',titulo:'66 indicadores territoriales',descripcion:'Diccionario ICET del DANE: definiciones y disponibilidad',href:'/icet/',periodo:'Catálogo 2025',fuente:'DANE · diccionario ICET'},
 {id:'catalogo',titulo:'Explorar los datos abiertos',descripcion:'Estadísticas, cifras, fuentes y períodos',href:'/catalogo/',periodo:'Múltiples vigencias',fuente:'Fuentes oficiales documentadas'},
 {id:'demografia',titulo:'Población y demografía',descripcion:'Proyecciones oficiales de población municipal',href:'/poblacion/',periodo:'Consultar las vigencias de cada serie',fuente:'DANE'},
 {id:'seguridad',titulo:'Seguridad ciudadana 2025',descripcion:'Registros policiales por conducta',href:'/seguridad/',periodo:'2025',fuente:'Policía Nacional'},
 {id:'documentos',titulo:'Biblioteca de fuentes',descripcion:'Enlaces documentales y metadatos',href:'/documentos/',periodo:'Fecha propia en cada documento',fuente:'Entidades oficiales'},
];
export function normalizeSearch(value){return String(value??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');}

function figureMetadata(row){
 const precision=normalizeSearch(row.precision);
 const canonical=['mayor que','superior a'].includes(precision)?'superior a':['menor que','inferior a'].includes(precision)?'inferior a':precision.includes('aproximad')||precision.includes('estimad')||precision.includes('estimacion')?'aproximado':row.precision;
 const qualifier=canonical==='superior a'?'Superior a':canonical==='inferior a'?'Inferior a':precision.includes('estimad')||precision.includes('estimacion')?'Estimado':canonical==='aproximado'?'Aproximado':row.clase==='Estimación'?'Estimado':undefined;
 return {valor:formatSectorValue({...row,precision:canonical})+' '+row.unidad,naturaleza:row.clase,origen:row.origen,precision:row.precision,calificador:qualifier};
}

/** Index metadata without deriving values or assigning observation years to ICET definitions. */
export function createSearchEntries(rows,indicators){
 return [
  ...routes.map(r=>({...r,clase:'ruta'})),
  ...indicators.map(i=>({id:'indicador-'+i.codigo,codigo:i.codigo,titulo:i.nombre,descripcion:i.codigo+' · '+i.area,href:'/icet/?q='+encodeURIComponent(i.codigo),clase:'indicador',periodo:'Catálogo 2025 · definición del indicador',fuente:'DANE · diccionario ICET'})),
  ...rows.map(r=>({id:'dato-'+r.id,codigo:r.codigoICET,titulo:r.nombre,descripcion:r.sector,href:(r.origen==='Gestión municipal'?'/rendicion/?buscar=':'/catalogo/?buscar=')+encodeURIComponent(r.nombre),clase:'dato',anio:r.anio,periodo:datumDates(r).period,fuente:r.fuente,...figureMetadata(r)})),
 ];
}

/** AND-token matching supports reordered words; exact title/code matches rank first. */
export function searchEntries(entries,query,filter='todos',limit=18){
 const term=normalizeSearch(query),tokens=[...new Set(term.split(' ').filter(Boolean))];
 const matches=entries.map((item,index)=>{
  const title=normalizeSearch(item.titulo),code=normalizeSearch(item.codigo);
  const text=normalizeSearch([item.titulo,item.descripcion,item.codigo,item.periodo,item.fuente,item.valor,item.naturaleza,item.origen,item.calificador].filter(Boolean).join(' '));
  if(!tokens.every(token=>text.includes(token)))return null;
  let score=0;
  if(term){
   score+=(title===term?180:title.startsWith(term)?90:title.includes(term)?60:0);
   score+=code===term?200:0;
   for(const token of tokens){if(title.split(' ').includes(token))score+=20;else if(title.includes(token))score+=10;if(code.includes(token))score+=12;}
  }
  return {item,index,score};
 }).filter(Boolean);
 const counts={ruta:0,dato:0,indicador:0};
 for(const match of matches)counts[match.item.clase]++;
 const filtered=matches.filter(({item})=>(filter==='todos'||item.clase===filter)&&(term||filter!=='todos'||item.clase==='ruta'));
 filtered.sort((a,b)=>b.score-a.score||(a.item.clase==='dato'&&b.item.clase==='dato'?(b.item.anio??0)-(a.item.anio??0):0)||a.index-b.index);
 return {items:filtered.slice(0,Math.max(0,limit)).map(r=>r.item),total:filtered.length,counts};
}
