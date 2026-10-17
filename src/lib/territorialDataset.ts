import {observacionesRendicion} from './rendicion2025';
import {observacionesConectividad} from './conectividadV6';
import type {FeedPublico} from './publicFeed';
import {observacionesTerriData} from './terriDataExpanded';
import {observacionesDocumentalesConAnio} from './observacionesDocumentales2026';
import {observacionesExternas} from './observacionesFuentesExternas';
import {observacionesINS} from './observacionesINS';
import {observacionesDaneMortalidad} from './observacionesDaneMortalidad';
import {indicadoresCalculados} from './indicadoresCalculados';
import datosMasivos from '@/data/fuentesMasivas76670.json';

export type ClaseDato='Publicado'|'Calculado'|'Relacionado'|'Estimación';
export interface DatoExplorador {
 id:string;nombre:string;sector:string;valor:number;unidad:string;
 anio:number;fuente:string;fuenteUrl?:string;codigoICET?:string;
 clase:ClaseDato;nota?:string;pagina?:number;tipoFuente?:string;codigoSerie?:string;precision?:string;origen?:'Gestión municipal'|'Estadística oficial'|'Contexto';
}
type Entrada={id:string;nombre:string;sector:string;valor:number;unidad:string;anio:number|null;fuente:string;nota?:string;codigoIcet?:string|null;vinculacion?:string};
const publicados:Entrada[]=[
 ...observacionesTerriData.filter(r=>r.divipola==='76670').map(r=>({id:r.id,nombre:r.titulo,sector:r.sector,valor:r.valor,unidad:r.unidad,anio:r.anio,fuente:r.fuente})),
 ...observacionesDocumentalesConAnio.map(r=>({id:r.id,nombre:r.nombre,sector:r.sector,valor:r.valor,unidad:r.unidad,anio:r.anio,fuente:r.fuente,codigoIcet:r.codigoIcet})),
 ...observacionesExternas,
 ...observacionesINS,
 ...observacionesDaneMortalidad,
 ...indicadoresCalculados
];
const adicionales=datosMasivos.observaciones.filter(r=>r.divipola==='76670'&&Number.isFinite(r.valor)).map(r=>({
 id:r.id,nombre:r.nombre,sector:r.sector,valor:r.valor,unidad:r.unidad,anio:r.anio,
 fuente:r.fuente,nota:r.nota,codigoIcet:r.icet,
 vinculacion:r.clase==='relacionada'?'relacionada':r.metodo==='CALCULADO'?'calculada':'directa'
}));
function clase(row:Entrada):ClaseDato{
 if(row.id.startsWith('EST-'))return 'Estimación';
 if(row.id.startsWith('DER-')||row.vinculacion==='calculada')return 'Calculado';
 if(row.vinculacion==='relacionada')return 'Relacionado';
 return 'Publicado';
}
export function reunirEstadisticas(feed:FeedPublico|null):DatoExplorador[]{
 const map=new Map<string,DatoExplorador>();
 for(const r of [...publicados,...adicionales]){
  if(typeof r.anio!=='number'||r.anio<1900||r.anio>2100||!Number.isFinite(r.valor))continue;
  map.set(r.id,{id:r.id,nombre:r.nombre,sector:r.sector,valor:r.valor,unidad:r.unidad,anio:r.anio,fuente:r.fuente,fuenteUrl:r.fuente.startsWith('https://')?r.fuente:undefined,origen:'Estadística oficial',nota:r.nota,codigoICET:r.codigoIcet||undefined,clase:clase(r)});
 }
 for(const r of feed?.registros||[]){
  // Preserve source record IDs and avoid translating different units to a common measure.
  const id='db-'+r.codigo+'-'+r.anio+'-'+r.id;
  map.set(id,{id,tipoFuente:r.tipo,codigoSerie:r.codigo,nombre:r.nombre,sector:r.tema,valor:Number(r.valor),unidad:r.unidad,anio:r.anio,fuente:r.fuente,fuenteUrl:r.fuente_url,nota:r.nota,clase:r.tipo==='derivado'?'Calculado':'Publicado'});
 }
 for(const r of [...observacionesRendicion,...observacionesConectividad])map.set(r.id,r);
 return [...map.values()].sort((a,b)=>b.anio-a.anio||a.nombre.localeCompare(b.nombre,'es'));
}
/** Only match explicit indicator-source IDs. Never infer a numerator from name similarity. */
export function itemsPorIndicador(rows:DatoExplorador[],codigo:string){
 return rows.filter(r=>r.codigoICET===codigo);
}
export function filtrarEstadisticas(rows:DatoExplorador[],palabra:string,anio:'Todos'|number='Todos',clase:'Todas'|ClaseDato='Todas'){
 const q=palabra.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return rows.filter(r=>(anio==='Todos'||r.anio===anio)&&(clase==='Todas'||r.clase===clase)&&(!q||(r.nombre+' '+r.sector+' '+r.fuente+' '+(r.codigoICET||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)));
}
