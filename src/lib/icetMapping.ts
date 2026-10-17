import type {FeedPublico,ObservacionPublica,VinculoICET} from './publicFeed';
export interface RegistroICET {codigo:string;relacion:VinculoICET;registro:ObservacionPublica}
export const ICET_TOTAL=66;
export function vincularICET(feed:FeedPublico):RegistroICET[]{
 const items:RegistroICET[]=[];
 for(const link of feed.vinculos_icet||[]){
  if(!/^ICET-\d{2}$/.test(link.codigo))continue;
  const same=feed.registros.filter(r=>r.codigo===link.fuente_codigo&&r.valor!==null&&Number.isFinite(Number(r.valor))&&r.anio>=1900&&r.anio<=2100);
  for(const r of same) items.push({codigo:link.codigo,relacion:link,registro:r});
 }
 return items.sort((a,b)=>a.codigo.localeCompare(b.codigo)||(b.registro.anio-a.registro.anio));
}
export function icetVigenciaActual(list:RegistroICET[]){
 const found=new Map<string,RegistroICET>();
 for(const r of list){if(!found.has(r.codigo))found.set(r.codigo,r)}
 return [...found.values()];
}
export function icetPorAnio(list:RegistroICET[],anio:number){
 return list.filter(x=>x.registro.anio===anio);
}
