/** Device-only saved selections. URL validation is independent of the stored label. */
export const SAVED_QUERIES_KEY='san-pedro:saved-queries:v1';
export const SAVED_QUERIES_EVENT='san-pedro:saved-queries-changed';
export const MAX_SAVED_QUERIES=8;
const topics=new Set(['Todos','ambiente','suelo','servicios','poblacion','educacion','vivienda','epidemiologia','atencion','mortalidad','economia','gobierno','transporte','seguridad','victimas']);
const macros=new Set(['Todos','Territorio y ambiente','Desarrollo humano','Economía e instituciones','Seguridad y convivencia']);
const classes=new Set(['Todas','Publicado','Calculado','Relacionado','Estimación']);
const codes=new Set(['76670','76','CO','76036','76113','76306','76890']);
const unsafe=/[\u0000-\u001f\u007f<>]/;
/** Accept only known app routes and selection parameters, never arbitrary destinations. */
export function normalizeSavedQueryUrl(input){
 if(typeof input!=='string'||input.length>2000||!input.startsWith('/')||input.startsWith('//')||input.includes('\\')||unsafe.test(input))return null;
 const match=input.match(/^(\/DATOS-ABIERTOS)?(\/territorios\/|\/territorios|\/)(\?[^#]*)?$/);
 if(!match)return null;
 const route=match[2].startsWith('/territorios')?'/territorios/':'/';
 const params=new URLSearchParams((match[3]||'').slice(1));
 const allowed=route==='/'?new Set(['tema','macro','anio','clase','buscar','vista']):new Set(['indicador','periodo','territorios','vista']);
 for(const [key,value] of params){
  if(!allowed.has(key)||params.getAll(key).length!==1||unsafe.test(value))return null;
  let valid=false;
  if(route==='/'){
   valid=key==='tema'?topics.has(value):key==='macro'?macros.has(value):key==='anio'?value==='Todos'||/^\d{4}$/.test(value)&&Number(value)>=1900&&Number(value)<=2100:key==='clase'?classes.has(value):key==='buscar'?value.length<=200:key==='vista'?['historias','territorio','catalogo'].includes(value):false;
  }else{
   valid=key==='indicador'?['energia','internet'].includes(value):key==='periodo'?/^(19|20)\d{2}(-T[1-4])?$/.test(value):key==='territorios'?value.length>0&&value.split(',').length<=codes.size&&value.split(',').every(c=>codes.has(c))&&new Set(value.split(',')).size===value.split(',').length:key==='vista'?['energia','internet','contexto'].includes(value):false;
  }
  if(!valid)return null;
 }
 params.sort();
 return (match[1]||'')+route+(params.size?'?'+params.toString():'');
}
export function normalizeSavedQueryLabel(value){
 if(typeof value!=='string'||unsafe.test(value))return null;
 const label=value.trim().replace(/\s+/g,' ');
 return label&&label.length<=240?label:null;
}
function validItem(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const url=normalizeSavedQueryUrl(value.url),label=normalizeSavedQueryLabel(value.label);
 if(!url||!label||typeof value.savedAt!=='string'||value.savedAt.length>30)return null;
 const date=new Date(value.savedAt);
 if(!Number.isFinite(date.getTime())||date.toISOString()!==value.savedAt)return null;
 return {url,label,savedAt:value.savedAt};
}
export function parseSavedQueries(raw){
 if(raw===null||raw===undefined||raw==='')return {items:[],invalid:false};
 if(typeof raw!=='string'||raw.length>32000)return {items:[],invalid:true};
 try{
  const data=JSON.parse(raw);
  if(!data||data.version!==1||!Array.isArray(data.queries))return {items:[],invalid:true};
  let invalid=false;
  const unique=new Map();
  for(const value of data.queries){
   const item=validItem(value);
   if(!item){invalid=true;continue;}
   const existing=unique.get(item.url);
   if(!existing||item.savedAt>existing.savedAt)unique.set(item.url,item);
  }
  const items=[...unique.values()].sort((a,b)=>b.savedAt.localeCompare(a.savedAt)).slice(0,MAX_SAVED_QUERIES);
  return {items,invalid};
 }catch{return {items:[],invalid:true};}
}
export function addSavedQuery(items,url,label,savedAt){
 const item=validItem({url,label,savedAt});
 if(!item)return null;
 // Saving an existing selection refreshes its real save date and descriptive label.
 return [item,...items.filter(r=>r.url!==item.url).map(validItem).filter(Boolean)].slice(0,MAX_SAVED_QUERIES);
}
export function removeSavedQuery(items,url){return items.filter(r=>r.url!==url);}
export function serializeSavedQueries(items){
 const normalized=parseSavedQueries(JSON.stringify({version:1,queries:items}));
 return JSON.stringify({version:1,queries:normalized.items});
}
/** Injected storage boundary: callers only update their UI after ok === true. */
export function writeSavedQueries(storage,items){
 try{storage.setItem(SAVED_QUERIES_KEY,serializeSavedQueries(items));return true;}catch{return false;}
}
