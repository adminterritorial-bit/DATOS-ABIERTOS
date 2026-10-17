'use client';
import {useEffect,useMemo,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {Compass,ExternalLink,Flag,Layers3,MapPin,Maximize2,Minus,Plus,RefreshCcw,X} from 'lucide-react';
import municipalGeo from '@/data/geografiaMunicipal76670.json';
import type {DatoExplorador} from '@/lib/territorialDataset';
const API='https://geoportal.dane.gov.co/mparcgis/rest/services/Divipola/Serv_DIVIPOLA_MGN_2025/FeatureServer/305';
const urlConsulta=API+'/query?'+new URLSearchParams({
 where:"MPIO_CDPMP='76670'",outFields:'ZU_CDIVI,ZU_CNMBRE,CLAS_CCDGO,ZU_NAREA,ZU_NALTD,ZU_NANO,MPIO_CDPMP',
 returnGeometry:'true',outSR:'4326',geometryPrecision:'5',f:'json'
}).toString();
type Coord=[number,number];
type Shape={type:string;geometry:{type:string;coordinates:Coord[][]|Coord[][][]};properties:{codigo:string;municipio:string}};
type ArcZone={attributes:{ZU_CDIVI?:string;ZU_CNMBRE?:string;CLAS_CCDGO?:string;ZU_NAREA?:number;ZU_NALTD?:number;ZU_NANO?:number};geometry?:{rings:number[][][]}};
const sanPedro=(municipalGeo as unknown as {features:Shape[]}).features.find(x=>x.properties.codigo==='76670');
function flat(g:Shape['geometry']):Coord[]{
 return (g.type==='Polygon'?(g.coordinates as Coord[][]).flat():(g.coordinates as Coord[][][]).flat(2));
}
const points=sanPedro?flat(sanPedro.geometry):[];
const bound=points.reduce((a,[x,y])=>({left:Math.min(a.left,x),right:Math.max(a.right,x),top:Math.max(a.top,y),bottom:Math.min(a.bottom,y)}),{left:180,right:-180,top:-90,bottom:90});
const w=920,h=560,pad=62;
const scale=Math.min((w-2*pad)/(bound.right-bound.left),(h-2*pad)/(bound.top-bound.bottom));
const project=([lon,lat]:Coord):Coord=>[w/2+(lon-(bound.left+bound.right)/2)*scale,h/2-(lat-(bound.top+bound.bottom)/2)*scale];
function ringPath(rings:Coord[][]){
 return rings.map(r=>r.map((coord,i)=>{const [x,y]=project(coord);return (i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}).join(' ')+' Z').join(' ');
}
const boundary=sanPedro?(sanPedro.geometry.type==='Polygon'
 ?ringPath(sanPedro.geometry.coordinates as Coord[][])
 :(sanPedro.geometry.coordinates as Coord[][][]).map(ringPath).join(' ')):'';
function center(rings:number[][][]):Coord|null{
 if(!rings?.length||!rings[0]?.length)return null;
 const ring=rings[0];
 const pts=ring.filter(x=>x.length>1&&Number.isFinite(x[0])&&Number.isFinite(x[1]));
 if(!pts.length)return null;
 // Bounds midpoint of actual DANE geometry, not a speculative site location.
 return [pts.reduce((n,x)=>Math.min(n,x[0]),180)/2+pts.reduce((n,x)=>Math.max(n,x[0]),-180)/2,
 pts.reduce((n,x)=>Math.min(n,x[1]),90)/2+pts.reduce((n,x)=>Math.max(n,x[1]),-90)/2];
}
const fmt=(n:number,d=1)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:d}).format(n);
export default function ArcgisLocalMap({datos}:{datos:DatoExplorador[]}){
 const reduced=useReducedMotion();
 const [zonas,setZonas]=useState<ArcZone[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [zone,setZone]=useState<ArcZone|null>(null);
 const [zoom,setZoom]=useState(1);
 const [showZones,setShowZones]=useState(true);
 useEffect(()=>{
  const abort=new AbortController();
  const timer=setTimeout(()=>abort.abort(),18000);
  fetch(urlConsulta,{signal:abort.signal}).then(async r=>{
   if(!r.ok)throw Error('Servicio cartográfico sin respuesta ('+r.status+')');
   const data=await r.json() as {features?:ArcZone[];error?:{message?:string}};
   if(data.error)throw Error(data.error.message||'Consulta ArcGIS rechazada');
   if(!Array.isArray(data.features))throw Error('Geometría del servicio no disponible');
   setZonas(data.features.filter(x=>x.geometry?.rings?.length&&x.attributes?.ZU_CNMBRE));
  }).catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:'No disponible')}).finally(()=>{clearTimeout(timer);if(!abort.signal.aborted)setLoading(false)});
  return ()=>{clearTimeout(timer);abort.abort()};
 },[]);
 const layers=useMemo(()=>zonas.flatMap(z=>{const c=z.geometry?.rings?center(z.geometry.rings):null;if(!c)return[];const pt=project(c);return [{zone:z,pt,code:z.attributes.ZU_CDIVI||'',name:z.attributes.ZU_CNMBRE||'Centro poblado'}]}),[zonas]);
 const pob=datos.filter(d=>/poblaci[oó]n municipal total proyectada|poblaci[oó]n total proyectada/i.test(d.nombre)&&d.unidad.toLowerCase().includes('person')).sort((a,b)=>b.anio-a.anio)[0];
 const sel=zone?.attributes;
 return <section className="xp-geo">
 <div className="xp-geo-head"><div><span className="xp-overline">GEOGRAFÍA VIVA · ARC GIS REST</span><h2>San Pedro, desde su territorio</h2><p>Límites DANE 2025, con centros poblados consultados directamente en el servicio oficial.</p></div><div className="xp-geo-controls"><button onClick={()=>setShowZones(v=>!v)} aria-pressed={showZones}><Layers3 size={16}/> Centros poblados</button><button onClick={()=>setZoom(z=>Math.max(1,z-.35))} aria-label="Alejar mapa"><Minus size={17}/></button><button onClick={()=>setZoom(z=>Math.min(2.5,z+.35))} aria-label="Acercar mapa"><Plus size={17}/></button><button onClick={()=>setZoom(1)} aria-label="Restablecer escala"><Maximize2 size={16}/></button></div></div>
 <div className="xp-geo-stage">
 <svg viewBox={'0 0 '+w+' '+h} className="xp-geo-svg" role="img" aria-label="Contorno cartográfico DANE de San Pedro y marcadores de los centros poblados obtenidos en ArcGIS">
  <defs><linearGradient id="xp-land" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#bceaf2"/><stop offset="1" stopColor="#c9d8ff"/></linearGradient><pattern id="xp-grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M 44 0 L 0 0 0 44" fill="none" stroke="#e6eff7" strokeWidth="1"/></pattern><filter id="xp-land-shadow"><feDropShadow dx="0" dy="12" stdDeviation="15" floodColor="#3c79b6" floodOpacity=".2"/></filter></defs>
  <rect width={w} height={h} fill="#f5f9ff"/><rect width={w} height={h} fill="url(#xp-grid)"/>
  <g transform={`translate(${w/2} ${h/2}) scale(${zoom}) translate(${-w/2} ${-h/2})`}>
   <path d={boundary} fill="url(#xp-land)" stroke="#3888b6" strokeWidth={2/zoom} filter="url(#xp-land-shadow)" strokeLinejoin="round" fillRule="evenodd"/>
   {showZones&&layers.map((p,i)=><g key={p.code+'-'+i} className="xp-zone-pin" tabIndex={0} role="button" aria-label={'Consultar '+p.name} onClick={()=>setZone(p.zone)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setZone(p.zone)}}}>
    <circle cx={p.pt[0]} cy={p.pt[1]} r={19/zoom} fill="#fff" opacity=".84"/>
    <circle cx={p.pt[0]} cy={p.pt[1]} r={13/zoom} fill="#1269ce" stroke="#fff" strokeWidth={2.6/zoom}/>
    <path d={'M '+(p.pt[0]-4/zoom)+' '+(p.pt[1]-5/zoom)+' v '+10/zoom+' M '+(p.pt[0]-4/zoom)+' '+(p.pt[1]-5/zoom)+' h '+8/zoom+' v '+6/zoom+' h '+(-8/zoom)} stroke="#fff" strokeWidth={1.7/zoom} fill="none"/>
    <title>{p.name} · geometría oficial, abre ficha</title>
   </g>)}
  </g>
  <g className="xp-geo-compass"><circle cx="48" cy="48" r="25" fill="white" stroke="#dce9f6"/><path d="M48 26 L43 43 L53 43 Z" fill="#1d67bb"/><text x="48" y="62" textAnchor="middle" fontSize="12" fill="#4b6986" fontWeight="800">N</text></g>
  <text x="23" y="528" fill="#54718f" fontSize="12" fontWeight="700">DANE · DIVIPOLA 76670 · MGN 2025</text>
 </svg>
 <div className="xp-map-notes"><div><MapPin size={16}/> <b>San Pedro</b> · Valle del Cauca</div><div><Flag size={16}/>{loading?'Consultando ArcGIS…':error?'Límite municipal disponible':layers.length+' zonas georreferenciadas'}</div></div>
 </div>
 <div className="xp-geo-footer">{error?<p><Compass size={15}/> Los centros poblados no pudieron consultarse ahora: {error}. Se conserva el límite oficial del municipio. <a href={API} target="_blank" rel="noopener noreferrer">Consultar servicio <ExternalLink size={13}/></a></p>:<p>Los pines corresponden exclusivamente a polígonos devueltos por el servicio ArcGIS del DANE. Haz clic para consultar sus atributos geográficos.</p>}
 <p><strong>Precisión territorial:</strong> la cifra municipal de población {pob?('('+fmt(pob.valor,0)+' personas, '+pob.anio+')'):''} no se distribuye entre centros poblados ni veredas si la fuente no suministra esa desagregación.</p></div>
 <AnimatePresence>{zone&&<motion.div className="xp-zone-backdrop" initial={reduced?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setZone(null)}>
 <motion.section role="dialog" aria-modal="true" aria-label={'Información de '+sel?.ZU_CNMBRE} initial={reduced?false:{scale:.94,y:24}} animate={{scale:1,y:0}} transition={{type:'spring',stiffness:280,damping:28}} onClick={e=>e.stopPropagation()}>
  <button className="xp-modal-close" aria-label="Cerrar ficha territorial" onClick={()=>setZone(null)}><X size={17}/></button>
  <span className="xp-overline">FICHA GEOESPACIAL · DANE 2025</span>
  <h2>{sel?.ZU_CNMBRE||'Zona oficial'}</h2>
  <p>{sel?.CLAS_CCDGO==='1'?'Cabecera municipal':sel?.CLAS_CCDGO==='2'?'Centro poblado':'Zona clasificada por DANE'} · Código {sel?.ZU_CDIVI}</p>
  <div className="xp-zone-facts"><div><span>Área geográfica registrada</span><strong>{typeof sel?.ZU_NAREA==='number'?fmt(sel.ZU_NAREA/1000000,3)+' km²':'Sin dato'}</strong></div><div><span>Altitud media</span><strong>{typeof sel?.ZU_NALTD==='number'?fmt(sel.ZU_NALTD,0)+' m':'Sin dato'}</strong></div><div><span>Población específica</span><strong>Sin cifra desagregada</strong></div></div>
  <div className="xp-zone-reality"><Flag size={18}/><p>Las alertas, problemas y habitantes solo se presentarán para esta zona cuando exista un registro oficial con el mismo código o geometría. Los datos agregados del municipio no se trasladan a un centro poblado.</p></div>
  <a href={API} target="_blank" rel="noopener noreferrer" className="xp-geo-source">Fuente ArcGIS DANE <ExternalLink size={16}/></a>
 </motion.section></motion.div>}</AnimatePresence>
 </section>;
}
