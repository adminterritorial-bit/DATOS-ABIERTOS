'use client';
import DataProvenance from '@/components/experience/DataProvenance';
import {useEffect,useMemo,useRef,useState} from 'react';
import centerCache from '@/data/centrosPoblados76670.json';
import './map-exploration.css';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {ArrowRight,ArrowUpRight,BookOpen,Copy,ExternalLink,Flag,Layers3,LocateFixed,MapPin,Minus,Plus,Search,SlidersHorizontal,X} from 'lucide-react';
import {AreaChart,Area,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import type {DatoExplorador} from '@/lib/territorialDataset';
import {temasTerritoriales,numeroTema} from '@/lib/territorialTaxonomy';
import {sourceLabel} from '@/lib/sourceLabel';
import {useDialogFocus} from '@/components/useDialogFocus';
import type {GeoSelection} from './ArcGISMapEngine';
const ArcGISMapEngine=dynamic(()=>import('./ArcGISMapEngine'),{ssr:false,loading:()=> <div className="g4-skeleton">Preparando ArcGIS Maps SDK y cartografía de San Pedro…</div>});
const NF=new Intl.NumberFormat('es-CO',{maximumFractionDigits:2});
const DANE='https://geoportal.dane.gov.co/mparcgis/rest/services/Divipola/Serv_DIVIPOLA_MGN_2025/FeatureServer/305';
function flagForTopic(id:string){
 if(['educacion'].includes(id))return 'education';
 if(['atencion','epidemiologia','mortalidad'].includes(id))return 'health';
 if(['ambiente','suelo','servicios'].includes(id))return 'environment';
 if(['seguridad','victimas','transporte'].includes(id))return 'safety';
 return 'municipal';
}
function topicMatch(d:DatoExplorador,topic:string){
 if(d.codigoICET?.startsWith('ICET-'))return numeroTema.get(Number(d.codigoICET.slice(-2)))?.id===topic;
 const s=(d.sector+' '+d.nombre).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const phrases:Record<string,RegExp>={
  ambiente:/ambiente|residuo|recicl|forestal|riesgo|ecolog|vertimiento/,
  suelo:/suelo|catastro|agric|pecuar|rural|cultivo|predial/,
  servicios:/energia|agua potable|acueducto|alcantarillado|saneamiento|servicio publico|aseo/,
  poblacion:/poblacion|demografia|habitantes|natalidad|fecundidad/,
  educacion:/educacion|matricula|escuela|colegio|desercion|alfabet|estudiantes/,
  vivienda:/vivienda|deficit|pobreza|hogares/,
  epidemiologia:/dengue|tubercul|malaria|hepatitis|sivigila|vih|epidemiolog/,
  atencion:/afiliacion|salud|medic|vacuna|nacidos|embarazo/,
  mortalidad:/mortalidad|defuncion|fallecimiento|causa de muerte/,
  economia:/economia|valor agregado|finanzas|presupuesto|recaudo|ingreso fiscal/,
  gobierno:/gobierno|alcaldia|administracion|institucion|desempeno/,
  transporte:/automotor|transito|vial|movilidad|vehiculo/,
  seguridad:/homicidio|hurtos?|delito|feminicidio|suicidio|violencia|seguridad/,
  victimas:/victima|conflicto armado|desplazamiento|reparacion|ruv/
 };
 return Boolean(phrases[topic]?.test(s));
}
interface Props{datos:DatoExplorador[];activeTopic?:string;onTopicChange?:(topic:string)=>void}
function ChartSmall({series}:{series:DatoExplorador[]}){
 const points=[...new Map([...series].sort((a,b)=>a.anio-b.anio).map(x=>[x.anio,x])).values()].map(x=>({anio:String(x.anio),valor:x.valor}));
 if(points.length<2)return null;
 return <div className="g4-popup-chart"><span>Evolución de la misma serie y unidad</span><ResponsiveContainer width="100%" height={132}><AreaChart data={points}><defs><linearGradient id="g4-mini" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3ccfb4" stopOpacity=".4"/><stop offset="1" stopColor="#3ccfb4" stopOpacity="0"/></linearGradient></defs><XAxis dataKey="anio" tick={{fontSize:9,fill:'#6786a0'}} axisLine={false} tickLine={false}/><YAxis width={46} tick={{fontSize:9,fill:'#6786a0'}} axisLine={false} tickLine={false}/><CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e9f0f7"/><Tooltip formatter={n=>NF.format(Number(n))}/><Area dataKey="valor" stroke="#13ae94" strokeWidth={3} type="monotone" fill="url(#g4-mini)" isAnimationActive animationDuration={740}/></AreaChart></ResponsiveContainer></div>;
}
export default function ArcgisLocalMap({datos,activeTopic='Todos',onTopicChange}:Props){
 const reduced=useReducedMotion();
 const [selection,setSelection]=useState<GeoSelection|null>(null);
 const [placePopup,setPlacePopup]=useState(false);
 const [showPlaces,setShowPlaces]=useState(true);
 const [topic,setTopic]=useState('Todos');
 const [q,setQ]=useState('');
 const [placeQuery,setPlaceQuery]=useState('');
 const [linkMessage,setLinkMessage]=useState('');
 const [shareUrl,setShareUrl]=useState('');
 const deepLinkApplied=useRef(false);
 const [layers,setLayers]=useState(true);
 const [status,setStatus]=useState('Preparando mapa geográfico…');
 const [places,setPlaces]=useState<{code:string;name:string}[]>([]);
 const [focusKey,setFocusKey]=useState('');
 const [command,setCommand]=useState<{type:'home'|'in'|'out';nonce:number}>({type:'home',nonce:0});
 const [detail,setDetail]=useState<DatoExplorador|null>(null);
 const placeDialogRef=useDialogFocus(placePopup,()=>setPlacePopup(false));
 const detailDialogRef=useDialogFocus(Boolean(detail),()=>setDetail(null));
 const chosen=activeTopic!=='Todos'?activeTopic:topic;
 const mapped=useMemo(()=>datos.filter(d=>chosen==='Todos'||topicMatch(d,chosen)).filter(d=>d.clase!=='Estimación'),[datos,chosen]);
 const result=useMemo(()=>{
  const normalized=q.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const rows=mapped.filter(d=>!normalized||(d.nombre+' '+d.sector+' '+d.fuente).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(normalized));
  return [...new Map([...rows].sort((a,b)=>a.anio-b.anio).map(d=>[d.nombre+'|'+d.unidad,d])).values()].slice(0,20);
 },[mapped,q]);
 const localPlaces=places.filter(p=>p.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').includes(placeQuery.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es')));
 const openPlace=(place:{code:string;name:string})=>{
  const cached=centerCache.items.find(p=>p.code===place.code);
  setLayers(true);setFocusKey(place.code);setSelection({kind:'place',...place,area:cached?.area??undefined,altitude:cached?.altitude??undefined,year:cached?.year});setPlacePopup(true);setDetail(null);setQ('');setLinkMessage('');setShareUrl('');
 };
 // The engine reports its places only after their real map focus targets exist.
 useEffect(()=>{
  if(!places.length||deepLinkApplied.current)return;
  deepLinkApplied.current=true;
  const params=new URLSearchParams(window.location.search);
  const requestedTopic=params.get('tema');
  if(requestedTopic&&temasTerritoriales.some(t=>t.id===requestedTopic)){setTopic(requestedTopic);if(requestedTopic!==activeTopic)onTopicChange?.(requestedTopic)}
  const code=params.get('lugar');
  if(!code)return;
  const place=places.find(p=>p.code===code);
  if(!place){setLinkMessage('El código del enlace no corresponde a un lugar disponible. Elige uno de la lista DANE.');return}
  document.querySelector<HTMLButtonElement>('[data-place-code="'+place.code+'"]')?.focus({preventScroll:true});
  openPlace(place);
 },[places,onTopicChange,activeTopic]);
 const sharePlace=async()=>{
  if(selection?.kind!=='place')return;
  const url=new URL('/DATOS-ABIERTOS/mapa/',window.location.origin);url.search='';url.searchParams.set('lugar',selection.code);if(chosen!=='Todos')url.searchParams.set('tema',chosen);url.hash='';
  setShareUrl(url.toString());
  try{await navigator.clipboard.writeText(url.toString());setLinkMessage('Enlace copiado. Abre este mismo lugar y tema.')}catch{setLinkMessage('Selecciona y copia el enlace del lugar.')}
 };
 const change=(id:string)=>{setTopic(id);onTopicChange?.(id);setDetail(null)};
 const zoom=(type:'home'|'in'|'out')=>{setCommand({type,nonce:Date.now()});if(type==='home')setFocusKey('home')};
 const serie=detail?datos.filter(d=>d.nombre===detail.nombre&&d.unidad===detail.unidad&&d.clase===detail.clase):[];
 return <section className="g4-explorer territory-explorer">
  <div className="g4-topline"><div><span className="g4-eyebrow"><span/> CARTOGRAFÍA INTERACTIVA · ARCGIS MAPS SDK</span><h2>Elige un lugar. Conoce su contexto.</h2><p>Recorre la cabecera y los centros poblados de San Pedro. Abre una bandera para ver su ficha DANE y consultar cifras del municipio, con su fuente y vigencia.</p></div><div className="g4-map-pill"><MapPin size={16}/> DIVIPOLA 76670</div></div>
  <div className="g4-layout">
   <div className="g4-map-column">
    <div className="g4-map-toolbar"><div className="g4-layer-chip"><Layers3 size={17}/><span>CAPAS</span></div><button aria-pressed={layers} onClick={()=>setLayers(s=>!s)} className={layers?'is-active':''}><Flag size={16}/> Centros DANE</button><button onClick={()=>{setSelection({kind:'municipal',name:'San Pedro · consulta municipal',code:'76670'});setPlacePopup(false);setDetail(null)}}><BookOpen size={16}/> Indicadores</button><span className="g4-grow"/><button onClick={()=>zoom('out')} aria-label="Alejar mapa"><Minus size={18}/></button><button onClick={()=>zoom('in')} aria-label="Acercar mapa"><Plus size={18}/></button><button onClick={()=>zoom('home')} aria-label="Centrar en San Pedro"><LocateFixed size={18}/></button></div>
    <div className="territory-map-guide"><MapPin size={20} aria-hidden="true"/><p><strong>Empieza por una bandera.</strong> Selecciona un lugar en el mapa o en la lista; acerca el mapa para recorrer sus calles.</p></div><div className="g4-map-scene"><ArcGISMapEngine visible={layers} onSelect={s=>{setSelection(s);setPlacePopup(s.kind==='place');setDetail(null);setQ('');setShareUrl('');setLinkMessage('')}} onStatus={setStatus} onPlaces={setPlaces} focusKey={focusKey} cameraCommand={command}/><div className="g4-map-floating-legend"><img src="/DATOS-ABIERTOS/geo-flags/territory.svg" alt="Bandera de sitio cartografiado"/><span>Ubicación DANE georreferenciada</span></div><div className="g4-map-copyright">© OpenStreetMap contributors · © DANE MGN 2025 · Powered by Esri</div></div>
    <div className="g4-map-status"><span className="g4-dot"/><p>{status}</p><a href={DANE} target="_blank" rel="noopener noreferrer">Fuente <ExternalLink size={13}/></a></div>
   </div>
   <aside className="g4-console" aria-label="Panel de control y consulta territorial">
     <div className="g4-console-header"><div className="g4-emblem"><Flag size={22}/></div><div><span className="g4-eyebrow">EXPLORADOR CIUDADANO</span><h3>¿Qué lugar quieres explorar?</h3></div></div>
     <label className="g4-search territory-place-search"><Search size={18}/><input value={placeQuery} placeholder="Busca un lugar, por ejemplo San José" onChange={e=>{setPlaceQuery(e.target.value);setShowPlaces(true)}} aria-label="Buscar lugares DANE"/></label>
     <div className="n5-map-controls"><label><SlidersHorizontal size={18}/><span>Tema</span><select aria-label="Elegir categoría de indicadores del mapa" value={chosen} onChange={e=>change(e.target.value)}><option value="Todos">Todos los indicadores</option>{temasTerritoriales.map(t=><option key={t.id} value={t.id}>{t.nombre}</option>)}</select></label><button type="button" aria-expanded={showPlaces} onClick={()=>setShowPlaces(v=>!v)}><MapPin size={17}/> Lugares <b>{places.length}</b></button></div>
     <div className="g4-console-section">
      <header><span>{selection?.kind==='place'?'LUGAR DEL DANE':selection?.kind==='municipal'?'CONSULTA MUNICIPAL':'INDICADORES DEL MUNICIPIO'}</span><strong>{result.length} fichas</strong></header>
      {selection?.kind==='place'?<div className="g4-place-detail"><h3>{selection.name}</h3><p>Centro poblado o cabecera obtenido de la capa DANE 2025, código {selection.code}.</p><div className="g4-place-info">{typeof selection.area==='number'&&<span>Área <b>{NF.format(selection.area/1e6)} km²</b></span>}{typeof selection.altitude==='number'&&<span>Altitud <b>{NF.format(selection.altitude)} m</b></span>}</div><p className="g4-place-scope">Los indicadores siguientes corresponden al municipio completo; solo se atribuirán al lugar cuando los registros incluyan ese código de zona.</p><button onClick={()=>setSelection({kind:'municipal',name:'San Pedro · consulta municipal',code:'76670'})}>Ver consulta municipal <ArrowRight size={16}/></button></div>:null}
      {linkMessage&&!placePopup&&<p className="territory-link-message" role="status">{linkMessage}</p>}{showPlaces&&<div className="territory-place-picker"><div className="g4-location-results n5-place-list"><span>{places.length?`${localPlaces.length} de ${places.length} lugares DANE · selecciona para abrir su ficha`:'Preparando lugares DANE…'}</span>{localPlaces.map(p=><button key={p.code} type="button" data-place-code={p.code} aria-pressed={selection?.code===p.code} onClick={()=>openPlace(p)}><img src="/DATOS-ABIERTOS/geo-flags/territory.svg" width="23" height="31" alt=""/><span>{p.name}</span><ArrowUpRight size={16}/></button>)}</div>{placeQuery&&<div className="territory-search-reset">{!localPlaces.length&&<p>No hay lugares con ese nombre.</p>}<button type="button" onClick={()=>setPlaceQuery('')}>Ver todos los lugares ({places.length})</button></div>}</div>}
      <div className="territory-indicator-intro"><strong>Cifras de todo San Pedro</strong><p>Alcance municipal · DIVIPOLA 76670. Cada ficha indica su año y fuente.</p></div><label className="g4-search territory-indicator-search"><Search size={16}/><input value={q} placeholder="Buscar un indicador municipal…" onChange={e=>setQ(e.target.value)} aria-label="Buscar indicadores municipales"/></label>{!result.length&&<p className="territory-empty">No hay indicadores para esta búsqueda y tema. Prueba otra palabra o selecciona todos los indicadores.</p>}<div className="g4-records">{result.map(d=><button key={d.id} className={'g4-record '+(detail?.id===d.id?'active':'')} onClick={()=>{setDetail(d);if(!selection)setSelection({kind:'municipal',name:'San Pedro · consulta municipal',code:'76670'})}}><span className="g4-record-top"><span>{d.sector} · {d.anio}</span><ArrowUpRight size={15}/></span><strong>{d.nombre}</strong><span className="g4-record-bottom"><b>{d.precision==='superior a'?'> ':['aproximado','estimación institucional'].includes(d.precision||'')?'≈ ':''}{NF.format(d.valor)} <small>{d.unidad}</small></b><span>Ver ficha <ArrowRight size={13}/></span></span></button>)}</div>
     </div>
   </aside>
  </div>
  <AnimatePresence>{placePopup&&selection?.kind==='place'&&<motion.div className="g4-dialog-backdrop" initial={reduced?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setPlacePopup(false)}><motion.section ref={placePopup?placeDialogRef:undefined} tabIndex={-1} className="g4-dialog n5-place-popup" role="dialog" aria-modal="true" aria-label={'Información del lugar '+selection.name} initial={reduced?false:{y:35,x:20}} animate={{y:0,x:0}} exit={{y:35,opacity:0}} onClick={e=>e.stopPropagation()}><button className="g4-close" aria-label="Cerrar información del lugar" onClick={()=>setPlacePopup(false)}><X size={19}/></button><div className="n5-place-flag"><img src="/DATOS-ABIERTOS/geo-flags/territory.svg" width="80" height="90" alt=""/></div><span className="g4-eyebrow">BANDERA SELECCIONADA · DANE MGN 2025</span><h2>{selection.name}</h2><p>Ubicación verificada en San Pedro, Valle del Cauca. Código geográfico: <strong>{selection.code}</strong>.</p><dl><div><dt>Fuente cartográfica</dt><dd>DANE, Marco Geoestadístico Nacional 2025</dd></div><div><dt>Territorio</dt><dd>San Pedro · 76670</dd></div><div><dt>Vigencia cartográfica</dt><dd>{selection.year||2025}</dd></div>{typeof selection.altitude==='number'&&<div><dt>Altitud</dt><dd>{NF.format(selection.altitude)} m</dd></div>}{typeof selection.area==='number'&&<div><dt>Superficie cartográfica</dt><dd>{NF.format(selection.area/1e6)} km²</dd></div>}</dl><p className="territory-source-note">Respaldo DANE consultado el {new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(centerCache.generatedAt))}. La cartografía describe ubicaciones; las cifras municipales conservan la vigencia de cada registro.</p><div className="n5-place-context"><strong>Contexto municipal · {chosen==='Todos'?'todos los temas':temasTerritoriales.find(t=>t.id===chosen)?.nombre}</strong><p>Las siguientes cifras representan todo San Pedro, no exclusivamente este centro poblado.</p>{!result.length&&<p>No hay cifras disponibles para el tema o búsqueda actual. Consulta todos los indicadores desde el panel municipal.</p>}{result.slice(0,3).map(d=><button key={d.id} onClick={()=>{setPlacePopup(false);setDetail(d)}}><span>{d.nombre}<small>{d.anio} · {sourceLabel(d.fuente)} · Ver ficha y fuente</small></span><b>{d.precision==='superior a'?'> ':['aproximado','estimación institucional'].includes(d.precision||'')?'≈ ':''}{NF.format(d.valor)} {d.unidad}</b></button>)}</div><div className="territory-share"><button type="button" onClick={sharePlace}><Copy size={15}/> Copiar enlace de este lugar</button>{shareUrl&&<input aria-label="Enlace para compartir este lugar" value={shareUrl} readOnly onFocus={e=>e.currentTarget.select()}/>}<p role="status">{linkMessage}</p></div><footer><button onClick={()=>{setSelection({kind:'municipal',name:'San Pedro · consulta municipal',code:'76670'});setPlacePopup(false)}}>Consultar indicadores municipales <ArrowRight size={15}/></button><a href={DANE} target="_blank" rel="noopener noreferrer">Ver fuente DANE <ExternalLink size={15}/></a></footer></motion.section></motion.div>}</AnimatePresence>
  <AnimatePresence>{detail&&<motion.div className="g4-dialog-backdrop" initial={reduced?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setDetail(null)}><motion.section ref={detail?detailDialogRef:undefined} tabIndex={-1} role="dialog" aria-modal="true" aria-label={'Ficha de '+detail.nombre} className="g4-dialog" initial={reduced?false:{y:32,opacity:0}} animate={{y:0,opacity:1}} exit={{y:32,opacity:0}} onClick={e=>e.stopPropagation()}><button aria-label="Cerrar ventana" className="g4-close" onClick={()=>setDetail(null)}><X size={19}/></button><span className="g4-eyebrow">FICHA DEL INDICADOR · {detail.anio}</span><h2>{detail.nombre}</h2><strong className="g4-number">{detail.precision==='superior a'?'> ':['aproximado','estimación institucional'].includes(detail.precision||'')?'≈ ':''}{NF.format(detail.valor)} <small>{detail.unidad}</small></strong><ChartSmall series={serie}/><dl><div><dt>Alcance</dt><dd>Municipio de San Pedro, DIVIPOLA 76670</dd></div><div><dt>Vigencia</dt><dd>{detail.anio}</dd></div><div><dt>Fuente</dt><dd>{detail.fuente}</dd></div><div><dt>Naturaleza</dt><dd>{detail.clase} · {detail.origen||'Estadística documentada'}</dd></div></dl>{detail.nota&&<p className="g4-note">{detail.nota}</p>}<DataProvenance datum={detail}/><footer>{detail.fuenteUrl?<a href={detail.fuenteUrl} target="_blank" rel="noopener noreferrer">Abrir fuente original <ExternalLink size={15}/></a>:<Link href="/documentos/">Consultar biblioteca <BookOpen size={15}/></Link>}<button onClick={()=>setDetail(null)}>Regresar al mapa</button></footer></motion.section></motion.div>}</AnimatePresence>
 </section>;
}
