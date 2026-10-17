'use client';

import {useMemo,useState} from 'react';
import Link from 'next/link';
import {Calculator,ArrowLeft,ArrowUpRight,Database,Layers,MapPin,Search,SlidersHorizontal,Activity,ExternalLink} from 'lucide-react';
import {indicadoresICET} from '@/lib/icetCatalog';
import {fuentesPublicas} from '@/lib/fuentesPublicas';
import {ICET_DIRECTAS,ICET_VINCULOS} from '@/lib/icetVinculos';
import {observacionesTerriData} from '@/lib/terriDataExpanded';
import {observacionesDocumentalesConAnio} from '@/lib/observacionesDocumentales2026';
import {observacionesExternas} from '@/lib/observacionesFuentesExternas';
import {indicadoresCalculados} from '@/lib/indicadoresCalculados';
import {observacionesINS} from '@/lib/observacionesINS';
import {estimacionesMunicipales} from '@/lib/estimacionesMunicipales';
import masivas from '@/data/fuentesMasivas76670.json';
import geo from '@/data/geografiaMunicipal76670.json';
import energia from '@/data/energiaMunicipiosReferencia.json';
import './mapa.css';

type Coordinate=[number,number];
type Geom={type:'Polygon'|'MultiPolygon';coordinates:Coordinate[][]|Coordinate[][][]};
type Shape={type:'Feature';properties:{codigo:string;municipio:string};geometry:Geom};
type DataItem={id:string;nombre:string;valor:number;unidad:string;anio:number|null;sector:string;fuente:string;nota?:string;icet?:string|null;tipo:'Publicado'|'Calculado'|'Relacionado'|'Estimación'};
const polygon=(geo as unknown as {features:Shape[]}).features;
const energiaMunicipal=(energia as {registros:Array<{divipola:string;anio:number;valor:number;unidad:string;fuente:string;viviendas_total:number;viviendas_conectadas:number}>}).registros;
const fuenteCatalogo:DataItem[]=observacionesTerriData.filter(r=>r.divipola==='76670').map(r=>({
 id:r.id,nombre:r.titulo,valor:r.valor,unidad:r.unidad,anio:r.anio,sector:r.sector,fuente:r.fuente,tipo:'Publicado'
}));
const doc:DataItem[]=observacionesDocumentalesConAnio.map(r=>({
 id:r.id,nombre:r.nombre,valor:r.valor,unidad:r.unidad,anio:r.anio,sector:r.sector,fuente:r.fuente,nota:'Dato documentado en archivo municipal',icet:r.codigoIcet,tipo:'Publicado'
}));
const publicadas:DataItem[]=[...observacionesExternas,...indicadoresCalculados,...observacionesINS,...estimacionesMunicipales].map(r=>({
 id:r.id,nombre:r.nombre,valor:r.valor,unidad:r.unidad,anio:r.anio,sector:r.sector,fuente:r.fuente,nota:r.nota,
 icet:r.codigoIcet,tipo:r.id.startsWith('EST-')?'Estimación':r.id.startsWith('DER-')?'Calculado':r.vinculacion==='relacionada'?'Relacionado':'Publicado'
}));
const extraidas:DataItem[]=masivas.observaciones.filter(r=>r.divipola==='76670'&&Number.isFinite(r.valor)).map(r=>({
 id:r.id,nombre:r.nombre,valor:r.valor,unidad:r.unidad,anio:r.anio??null,sector:r.sector,fuente:r.fuente,
 icet:r.icet,nota:r.nota,tipo:r.clase==='relacionada'?'Relacionado':r.metodo==='CALCULADO'?'Calculado':'Publicado'
}));
const DATOS=Array.from(new Map([...fuenteCatalogo,...doc,...publicadas,...extraidas].map(d=>[d.id,d] as const)).values());
const num=(v:number)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(v);
const bbox=polygon.flatMap(f=>flatten(f.geometry)).reduce((a,[lon,lat])=>({
 xmin:Math.min(a.xmin,lon),xmax:Math.max(a.xmax,lon),ymin:Math.min(a.ymin,lat),ymax:Math.max(a.ymax,lat)
}),{xmin:180,xmax:-180,ymin:90,ymax:-90});
function flatten(geometry:Geom):Coordinate[]{
 return geometry.type==='Polygon'
  ?(geometry.coordinates as Coordinate[][]).flat()
  :(geometry.coordinates as Coordinate[][][]).flat(2);
}
const projection=(()=>{
 const spanX=bbox.xmax-bbox.xmin,spanY=bbox.ymax-bbox.ymin;
 const scale=Math.min(820/spanX,530/spanY);
 const dw=spanX*scale,dh=spanY*scale;
 return ([x,y]:Coordinate):Coordinate=>[450+(x-(bbox.xmin+bbox.xmax)/2)*scale,310-(y-(bbox.ymin+bbox.ymax)/2)*scale];
})();
function pathGeometry(geometry:Geom){
 const polygons:Coordinate[][][]=geometry.type==='Polygon'
  ?[geometry.coordinates as Coordinate[][]]:(geometry.coordinates as Coordinate[][][]);
 return polygons.map(p=>p.map(ring=>ring.map((coord,i)=>{
  const [x,y]=projection(coord);
  return (i?'L':'M')+x.toFixed(1)+','+y.toFixed(1);
 }).join(' ')+' Z').join(' ')).join(' ');
}
const paths=polygon.map(g=>{
 const points=flatten(g.geometry);
 const bb=points.reduce((a,[x,y])=>({a:Math.min(a.a,x),b:Math.max(a.b,x),c:Math.min(a.c,y),d:Math.max(a.d,y)}),{a:180,b:-180,c:90,d:-90});
 return {id:g.properties.codigo,nombre:g.properties.municipio,shape:pathGeometry(g.geometry),label:projection([(bb.a+bb.b)/2,(bb.c+bb.d)/2])};
});
const years=['Todos',...Array.from(new Set(DATOS.map(d=>d.anio).filter((x):x is number=>x!==null))).sort((a,b)=>b-a).map(String)];
const areas=['Todos',...Array.from(new Set(DATOS.map(d=>d.sector))).sort()];
function escColor(valor?:number){
 if(valor===undefined)return '#e9eef5';
 if(valor>=99)return '#0e9775';
 if(valor>=94)return '#33b9b7';
 if(valor>=87)return '#87a5e5';
 return '#d5a4a0';
}
export default function MapaEstadistico(){
 const [municipio,setMunicipio]=useState('76670');
 const [capa,setCapa]=useState('electricidad');
 const [tema,setTema]=useState('Todos');
 const [anio,setAnio]=useState('Todos');
 const [clase,setClase]=useState('Todos');
 const [query,setQuery]=useState('');
 const [detalle,setDetalle]=useState<DataItem|null>(null);
 const [filtroFuente,setFiltroFuente]=useState('Todas');
 const active=paths.find(x=>x.id===municipio);
 const filaEnergia=energiaMunicipal.find(x=>x.divipola===municipio);
 const esSanPedro=municipio==='76670';
 const dataFiltrada=useMemo(()=>{
  let rows:DataItem[];
  if(esSanPedro)rows=DATOS;
  else rows=energiaMunicipal.filter(r=>r.divipola===municipio).map(r=>({
   id:'UPME-'+r.divipola+'-'+r.anio,nombre:'Índice de cobertura de energía eléctrica',
   valor:r.valor,unidad:r.unidad,anio:r.anio,sector:'Servicios públicos',fuente:r.fuente,icet:'ICET-65',
   nota:'Dato observado para municipio de referencia; NO representa San Pedro ni se imputa a sus indicadores.',
   tipo:'Publicado' as const
  }));
  return rows.filter(d=>(tema==='Todos'||d.sector===tema)&&(anio==='Todos'||String(d.anio)===anio)
   &&(clase==='Todos'||d.tipo===clase)&&(!query||[d.nombre,d.icet||'',d.sector].join(' ').toLowerCase().includes(query.toLowerCase())))
   .sort((a,b)=>(b.anio??0)-(a.anio??0));
 },[esSanPedro,municipio,tema,anio,clase,query]);
 const serviciosDisponibles=fuentesPublicas.filter(f=>filtroFuente==='Todas'||(filtroFuente==='Integradas'&&f.estado==='integrada')||(filtroFuente==='Por integrar'&&f.estado!=='integrada'));
 const byIndicator=new Map(indicadoresICET.map(i=>[i.codigo,i]));
 const serieDetalle=detalle&&esSanPedro?DATOS.filter(d=>d.nombre===detalle.nombre&&d.anio!==null).sort((a,b)=>(a.anio??0)-(b.anio??0)):[];
 const puntosSerie=serieDetalle.slice(-30);
 const directos=Object.keys(ICET_DIRECTAS).length;
 const representados=Object.keys(ICET_VINCULOS).length;
 return <main className="gm-shell">
  <header className="gm-topbar">
   <div className="gm-identity"><span className="gm-emblem"><MapPin size={24}/></span><div><b>GEOVISOR TERRITORIAL</b><small>Observatorio de Datos Abiertos · San Pedro, Valle del Cauca</small></div></div>
   <nav><Link href="/"><ArrowLeft size={15}/> Observatorio</Link><Link href="/estimador"><Calculator size={15}/> Estimador</Link><Link href="/icet/recuperados">Indicadores ICET <ArrowUpRight size={14}/></Link></nav>
  </header>
  <section className="gm-title-area"><div className="gm-eyebrow"><span/> MAPA MUNICIPAL · MGN DANE 2025</div>
   <h1>Explora el territorio <em>desde sus datos.</em></h1>
   <p>Selecciona un municipio en el mapa, compara coberturas oficiales y filtra las series de San Pedro por tema, año y procedencia. Cada cifra conserva su fuente y su vigencia real.</p>
   <div className="gm-stat-strip"><span><b>8</b> municipios con polígono DANE</span><span><b>{representados}/66</b> temas con cifras asociadas</span><span><b>{directos}</b> vínculos directos / calculados</span><span><b>{DATOS.length}</b> observaciones territoriales</span></div>
  </section>
  <div className="gm-main">
   <section className="gm-map-card">
    <div className="gm-panel-head"><div><div className="gm-panel-caption">EXPLORACIÓN ESPACIAL</div><h2>Valle del Cauca · San Pedro y entorno</h2><p>Polígonos oficiales DANE, mapa de referencia 2025</p></div>
      <div className="gm-switch"><button type="button" className={capa==='electricidad'?'active':''} onClick={()=>setCapa('electricidad')}>Cobertura ICEE</button><button type="button" className={capa==='limites'?'active':''} onClick={()=>setCapa('limites')}>Límites</button></div>
    </div>
    <svg className="gm-geoview" viewBox="0 0 900 620" role="img" aria-label="Mapa interactivo con límites reales de San Pedro y siete municipios cercanos; hacer clic en cada municipio">
      <defs><pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse"><path d="M 45 0 L 0 0 0 45" fill="none" stroke="#dfe8f3" strokeWidth="0.65"/></pattern><filter id="glow"><feGaussianBlur stdDeviation="3"/></filter></defs>
      <rect width="900" height="620" fill="#f7fafd" rx="12"/><rect width="900" height="620" fill="url(#grid)"/>
      {paths.map(p=>{
       const v=energiaMunicipal.find(x=>x.divipola===p.id)?.valor;
       return <g key={p.id} className={'gm-geo '+(municipio===p.id?'is-selected':'')}>
        <path d={p.shape} fill={capa==='electricidad'?escColor(v):p.id==='76670'?'#bad6fa':'#e1eaf4'}
          stroke={municipio===p.id?'#175eb6':'#fff'} strokeWidth={municipio===p.id?3.5:1.7} fillRule="evenodd"
          onClick={()=>{setMunicipio(p.id);setTema('Todos');setClase('Todos');setAnio('Todos');}}
          tabIndex={0} role="button" aria-label={'Seleccionar '+p.nombre}
          onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setMunicipio(p.id);setTema('Todos');setClase('Todos');setAnio('Todos');}}}>
         <title>{p.nombre} · {v===undefined?'sin ICEE':num(v)+' % ICEE 2024'}</title>
        </path>
        <text x={p.label[0]} y={p.label[1]} textAnchor="middle" fontSize={p.id==='76670'?13:10} fontWeight={p.id==='76670'?750:600} fill="#244563" pointerEvents="none">{p.nombre.length>17?p.nombre.slice(0,17)+'…':p.nombre}</text>
       </g>;
      })}
      <rect x="24" y="24" width="207" height="65" fill="white" rx="12" opacity="0.95"/>
      <text x="40" y="49" fill="#153f6e" fontWeight="750" fontSize="12">SAN PEDRO · 76670</text><text x="40" y="70" fill="#6582a4" fontSize="10">Referencia DIVIPOLA nacional</text>
    </svg>
    <div className="gm-map-bottom">{capa==='electricidad'?<><div className="gm-legend"><span className="lg low"/> Menos de 87 % <span className="lg mid"/> 87–94 % <span className="lg high"/> 94–99 % <span className="lg max"/> 99–100 %</div><small>UPME · Cobertura eléctrica 2024</small></>:<small>DANE · Marco Geoestadístico Nacional 2025. Límites oficiales; sin puntos inventados.</small>}</div>
    <div className="gm-selected"><span className="gm-selected-icon"><MapPin size={23}/></span><div><small>MUNICIPIO ACTIVO</small><h3>{active?.nombre??municipio}</h3><p>{esSanPedro?'Estadísticas completas del Observatorio':'Municipio de comparación: solo se mostrarán cifras propias disponibles'}</p></div><div className="gm-selected-rate"><small>ICEE 2024</small><b>{filaEnergia?num(filaEnergia.valor)+' %':'—'}</b></div></div>
   </section>
   <aside className="gm-aside">
    <div className="gm-filter-card"><div className="gm-heading"><SlidersHorizontal size={18}/><h2>Explorar indicadores</h2></div>
     <label>Tema estadístico<select value={tema} onChange={e=>setTema(e.target.value)}>{areas.map(x=><option key={x}>{x}</option>)}</select></label>
     <label>Vigencia<select value={anio} onChange={e=>setAnio(e.target.value)}>{years.map(x=><option key={x}>{x}</option>)}</select></label>
     <label>Clase de dato<select value={clase} onChange={e=>setClase(e.target.value)}>{['Todos','Publicado','Calculado','Relacionado','Estimación'].map(x=><option key={x}>{x}</option>)}</select></label>
     <label>Buscar por nombre o ICET<div className="gm-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej. energía, 65, víctimas…"/></div></label>
     <button className="gm-reset" type="button" onClick={()=>{setTema('Todos');setAnio('Todos');setClase('Todos');setQuery('');setMunicipio('76670')}}>Restablecer filtros</button>
    </div>
    <div className="gm-process"><div className="gm-heading"><Layers size={18}/><h2>Ruta de los datos</h2></div><p>De la entidad productora hasta la visualización ciudadana</p>
      <div className="gm-process-step"><b>01</b><div><strong>Fuentes oficiales</strong><small>DANE · DNP · UPME · SSPD · INS · RUV · RUNT</small></div></div>
      <div className="gm-process-line"/>
      <div className="gm-process-step"><b>02</b><div><strong>Extracción y normalización</strong><small>Filtro 76670 · clasificación · vigencia · deduplicación</small></div></div>
      <div className="gm-process-line"/>
      <div className="gm-process-step"><b>03</b><div><strong>Modelación y trazabilidad</strong><small>Publicado · calculado · relacionado · estimación</small></div></div>
      <div className="gm-process-line"/>
      <div className="gm-process-step"><b>04</b><div><strong>Mapa y dashboard</strong><small>Series, fichas, filtros y evolución territorial</small></div></div>
    </div>
   </aside>
  </div>
  <section className="gm-data-section"><div className="gm-data-head"><div><span className="gm-eyebrow">INFORMACIÓN INTERACTIVA</span><h2>{active?.nombre}: observaciones disponibles</h2><p>{dataFiltrada.length} resultados bajo los filtros seleccionados · clic para consultar metodología</p></div><Link href="/icet/recuperados">Ver los 66 indicadores <ArrowUpRight size={16}/></Link></div>
   <div className="gm-data-grid">{dataFiltrada.slice(0,80).map(item=><button type="button" key={item.id} className="gm-result" onClick={()=>setDetalle(item)}>
    <span className="gm-result-tag">{item.icet??item.sector} · {item.tipo}</span><h3>{item.nombre}</h3><div className="gm-result-value">{num(item.valor)} <small>{item.unidad}</small></div><footer><span>{item.anio??'Corte vigente'}</span><ArrowUpRight size={16}/></footer>
   </button>)}</div>
   {dataFiltrada.length>80&&<p className="gm-overflow">Se presentan las primeras 80 observaciones filtradas; acota por tema, año o búsqueda para localizar otras.</p>}
   {dataFiltrada.length===0&&<div className="gm-empty"><Activity size={32}/><b>No hay datos compatibles para esta selección.</b><p>Prueba otro año o municipio. No sustituimos las ausencias con ceros.</p></div>}
  </section>
  <section className="gm-sources gm-data-section"><div className="gm-data-head"><div><span className="gm-eyebrow">CATÁLOGO DE CONECTORES PÚBLICOS</span><h2>Fuentes estadísticas y georreferenciadas</h2><p>{fuentesPublicas.filter(x=>x.estado==='integrada').length} fuentes con extracción integrada de {fuentesPublicas.length} documentadas · otras requieren acceso, configuración o componentes</p></div>
   <div className="gm-switch"><button type="button" className={filtroFuente==='Todas'?'active':''} onClick={()=>setFiltroFuente('Todas')}>Todas</button><button type="button" className={filtroFuente==='Integradas'?'active':''} onClick={()=>setFiltroFuente('Integradas')}>Integradas</button><button type="button" className={filtroFuente==='Por integrar'?'active':''} onClick={()=>setFiltroFuente('Por integrar')}>Por integrar</button></div></div>
   <div className="gm-source-grid">{serviciosDisponibles.map(f=><a className="gm-source-tile" key={f.id} href={f.url} target="_blank" rel="noopener noreferrer">
    <span className="gm-source-tile-top"><span>{f.tema} · {f.formato}</span><ExternalLink size={13}/></span>
    <h3>{f.nombre}</h3><p>{f.detalle}</p><div><small>{f.periodicidad}</small><span className={f.estado==='integrada'?'is-integrated':f.estado==='sin_dato_local'?'is-unavailable':'is-external'}>{f.estado==='integrada'?'Extracción integrada':f.estado==='sin_dato_local'?'Sin registro municipal':'Referencia por integrar'}</span></div>
   </a>)}</div>
  </section>
  <footer className="gm-footer"><span>Geoportal DANE MGN 2025 · ICEE UPME 2024 · Observatorio de San Pedro</span><span>Los datos de municipios vecinos no se atribuyen a San Pedro.</span></footer>
  {detalle&&<div className="gm-modal-bg" role="presentation" onClick={()=>setDetalle(null)}><div className="gm-modal" role="dialog" aria-modal="true" aria-label="Ficha de trazabilidad" onClick={e=>e.stopPropagation()}>
   <button aria-label="Cerrar" className="gm-close" onClick={()=>setDetalle(null)}>×</button><span className="gm-eyebrow"><Database size={14}/> FICHA DE TRAZABILIDAD</span><h2>{detalle.nombre}</h2><strong className="gm-modal-figure">{num(detalle.valor)} <small>{detalle.unidad}</small></strong>
   {puntosSerie.length>=2&&<section className="gm-trend"><h3>Serie histórica de este dato</h3><div className="gm-trend-grid">{puntosSerie.map((d,i)=>{
 const biggest=Math.max(...puntosSerie.map(x=>x.valor),1);
 return <div key={d.id+'-'+i} className="gm-trend-col"><span>{num(d.valor)}</span><div style={{height:Math.max(3,Math.min(100,d.valor/biggest*100))+'%'}}/><small>{d.anio}</small></div>;
 })}</div><p>Comparación entre valores que comparten la misma denominación. Consultar la ficha de cada vigencia antes de afirmar equivalencia metodológica.</p></section>}
   <div className="gm-modal-fields"><span><small>Municipio</small>{active?.nombre}</span><span><small>Vigencia</small>{detalle.anio??'Corte de extracción'}</span><span><small>Naturaleza</small>{detalle.tipo}</span><span><small>Indicador relacionado</small>{detalle.icet??'Estadística adicional'}</span></div>
   {detalle.nota&&<p className="gm-note">{detalle.nota}</p>}
   {detalle.fuente.startsWith('http')?<a className="gm-source" href={detalle.fuente} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> Consultar fuente pública</a>:<p className="gm-note">Fuente documental: {detalle.fuente} (ver biblioteca documental del proyecto).</p>}
   {detalle.icet&&byIndicator.get(detalle.icet)&&<p className="gm-note">Definición ICET: {byIndicator.get(detalle.icet)?.nombre}. Una estadística relacionada no implica coincidencia exacta con la definición.</p>}
  </div></div>}
 </main>;
}