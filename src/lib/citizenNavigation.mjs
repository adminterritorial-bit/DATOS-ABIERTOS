const defaultState={tema:'Todos',macro:'Todos',anio:'Todos',clase:'Todas',buscar:'',vista:'historias'};
export function readHomeQuery(search,topics=[],macros=[]){
 const p=new URLSearchParams(search),year=p.get('anio')||'';
 return {tema:topics.includes(p.get('tema'))?p.get('tema'):'Todos',macro:macros.includes(p.get('macro'))?p.get('macro'):'Todos',anio:/^\d{4}$/.test(year)&&Number(year)>=1900&&Number(year)<=2100?year:'Todos',clase:['Publicado','Calculado','Relacionado','Estimación'].includes(p.get('clase'))?p.get('clase'):'Todas',buscar:(p.get('buscar')||'').trim().slice(0,160),vista:['catalogo','territorio'].includes(p.get('vista'))?p.get('vista'):'historias'};
}
export function homeQueryUrl(state){const p=new URLSearchParams();for(const key of Object.keys(defaultState)){if(state[key]!==undefined&&state[key]!==defaultState[key])p.set(key,String(state[key]));}return '/DATOS-ABIERTOS/'+(p.size?'?'+p.toString():'');}
export function formatSourceDate(value){
 if(typeof value==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(value))return new Intl.DateTimeFormat('es-CO',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'-01T00:00:00Z'));
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value))return null;
 const d=new Date(value);if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value.slice(0,10))return null;
 return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(d);
}
export function datumDates(row){const quarter=String(row.nota||'').match(/trimestre\s+([1-4])/i)?.[1];return {period:String(row.anio)+(quarter?' · trimestre '+quarter:''),published:formatSourceDate(row.publicadoEn),consulted:formatSourceDate(row.consultadoEn)};}
