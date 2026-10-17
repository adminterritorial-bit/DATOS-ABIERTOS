'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {Activity,ArrowDownToLine,ArrowRight,BarChart3,BookOpen,Check,ChevronDown,Database,ExternalLink,FileBarChart2,FileText,Filter,Globe2,Home,Info,Layers3,MapPinned,Menu,Search,ShieldCheck,SlidersHorizontal,TrendingUp,Users2,X} from 'lucide-react';
import type {FeedPublico,ObservacionPublica} from '@/lib/publicFeed';
import {encontrar,formatear,reducirSerie} from '@/lib/publicFeed';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import ICETHighlights from '@/components/ICETHighlights';
import SectorStatistics from '@/components/SectorStatistics';

const SECTORES=['Panorama','Demografía','Educación','Salud','Economía','Servicios públicos','Seguridad','Finanzas públicas','Víctimas','Gestión municipal','Ordenamiento','Innovación'];
const SOURCES=['DANE / PPED','TerriData / DNP'];
type Props={feed:FeedPublico|null;error?:string};
const topicClass=(s:string)=>s==='Demografía'?'#0f73e5':s==='Seguridad'?'#7959d9':s==='Economía'?'#159eaf':'#1671ce';
function Icono({s}:{s:string}){if(s==='Panorama')return <Home size={18}/>;if(s==='Demografía')return <Users2 size={18}/>;if(s==='Seguridad')return <ShieldCheck size={18}/>;if(s==='Educación')return <BookOpen size={18}/>;if(s==='Servicios públicos')return <Layers3 size={18}/>;if(s==='Economía')return <TrendingUp size={18}/>;return <BarChart3 size={18}/>;}
function valorConUnidad(d:ObservacionPublica|null){return d ? formatear(Number(d.valor),2):'—';}
export default function TerritorialDashboard({feed,error}:Props){
 const data=useMemo(()=>feed?.registros||[],[feed]);
 const [seccion,setSeccion]=useState('Panorama');
 const [anio,setAnio]=useState(2025);
 const [busqueda,setBusqueda]=useState('');
 const [fuenteFiltro,setFuenteFiltro]=useState('Todas');
 const [detalle,setDetalle]=useState<ObservacionPublica|null>(null);
 const [menu,setMenu]=useState(false);
 const [copiado,setCopiado]=useState(false);
 const years=useMemo(()=>[...new Set(data.map(x=>x.anio))].filter(y=>y>=2018&&y<=2026).sort((a,b)=>b-a),[data]);
 useEffect(()=>{const p=new URLSearchParams(location.search);const s=p.get('sector');const y=Number(p.get('anio'));if(s&&SECTORES.includes(s))setSeccion(s);if(y>=2018&&y<=2026)setAnio(y);},[]);
 const verSector=(s:string)=>{
  setSeccion(s);setMenu(false);setBusqueda('');setFuenteFiltro('Todas');
  if(s!=='Panorama'){
   const posibles=data.filter(r=>r.tema===s && r.anio<=2026).map(r=>r.anio);
   if(posibles.length)setAnio(Math.max(...posibles));
  }else setAnio(2025);
 };
 const rows=useMemo(()=>data.filter(r=>r.anio===anio&&(seccion==='Panorama'||r.tema===seccion)&&(!busqueda||r.nombre.toLowerCase().includes(busqueda.toLowerCase()))&&(fuenteFiltro==='Todas'||(fuenteFiltro==='DANE'?r.grupo==='SECTORIAL':r.grupo==='TERRIDATA'))),[data,anio,seccion,busqueda,fuenteFiltro]);
 const poblacion=encontrar(data,'población municipal total proyectada',anio)||null;
 const cabecera=encontrar(data,'población proyectada de cabecera municipal',anio)||null;
 const rural=encontrar(data,'población proyectada de centros poblados',anio)||null;
 const internet=encontrar(data,'penetración de acceso fijo a internet',anio)||null;
 const sectorCounts=Object.entries(data.filter(r=>r.anio===anio).reduce<Record<string,number>>((m,r)=>{m[r.tema]=(m[r.tema]||0)+1;return m;},{})).sort((a,b)=>b[1]-a[1]);
 const crop=data.filter(r=>r.anio===anio&&r.tema==='Economía'&&(r.unidad==='t'||r.unidad==='toneladas')).sort((a,b)=>b.valor-a.valor);
 const linea=(codigo:string,nombre:string,color:string)=>({nombre,color,valores:reducirSerie(data,codigo,2026).map(r=>({anio:r.anio,valor:Number(r.valor)}))});
 const series=[linea('DANE-POB-TOTAL','Población total','#0e6de4'),linea('DANE-POB-CABECERA','Cabecera','#27b6c9'),linea('DANE-POB-RURAL','Rural','#9b8be8')];
 const personas2025=encontrar(data,'población municipal total proyectada',2025);
 const resumenAnio=Number.isFinite(anio)?anio:2025;
 function descargar(){
  const cols=['codigo','nombre','tema','anio','valor','unidad','fuente','fuente_url','pagina','nota'];
  const safe=(v:unknown)=>{let str=String(v??'');if(/^\s*[=+@\-]/.test(str))str="'"+str;return '"'+str.replace(/"/g,'""')+'"';};
  const csv=[cols.map(safe).join(';'),...rows.map(r=>cols.map(k=>safe(r[k as keyof ObservacionPublica])).join(';'))].join('\r\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='san-pedro-'+anio+'-'+seccion.toLowerCase().replaceAll(' ','-')+'.csv';a.click();URL.revokeObjectURL(url);
 }
 function compartir(){
  const url=new URL(location.href);url.searchParams.set('anio',String(anio));url.searchParams.set('sector',seccion);
  if(navigator.clipboard){navigator.clipboard.writeText(url.toString()).then(()=>{setCopiado(true);setTimeout(()=>setCopiado(false),1800)}).catch(()=>{location.href=url.toString()})}
 }
 const navItem=(s:string)=> <button className={'ot-nav-item '+(s===seccion?'is-active':'')} key={s} onClick={()=>verSector(s)}><Icono s={s}/><span>{s}</span>{s===seccion&&<span className="ot-nav-dot"/>}</button>;
 return <div className="ot-app">
  <aside className={'ot-sidebar '+(menu?'is-visible':'')} aria-label="Menú del Observatorio">
   <div className="ot-brand"><Image src="/escudo-san-pedro.png" width={180} height={77} alt="Identidad gráfica de la Alcaldía de San Pedro" className="ot-logo" priority/><strong>OBSERVATORIO <span>TERRITORIAL</span></strong><small>SAN PEDRO · VALLE DEL CAUCA</small></div>
   <div className="ot-side-divider"/>
   <p className="ot-side-caption">INTELIGENCIA TERRITORIAL</p>
   <nav className="ot-nav">{SECTORES.map(navItem)}</nav>
   <p className="ot-side-caption ot-side-secondary">GESTIÓN DE INFORMACIÓN</p>
   <nav className="ot-nav"><Link className="ot-nav-item" href="/poblacion" onClick={()=>setMenu(false)}><Users2 size={18}/><span>Series demográficas</span></Link><Link className="ot-nav-item" href="/icet" onClick={()=>setMenu(false)}><BookOpen size={18}/><span>Indicadores ICET</span></Link><Link className="ot-nav-item" href="/seguridad" onClick={()=>setMenu(false)}><ShieldCheck size={18}/><span>Seguridad 2025</span></Link><Link className="ot-nav-item" href="/catalogo" onClick={()=>setMenu(false)}><Database size={18}/><span>Catálogo de datos</span></Link></nav>
   <div className="ot-side-bottom"><div className="ot-secure"><span className="ot-led"/> <span>Datos oficiales documentados<small>DIVIPOLA 76670</small></span></div><p>Información estadística agregada con vigencia y procedencia identificables.</p></div>
  </aside>
  {menu&&<button className="ot-menu-mask" aria-label="Cerrar navegación" onClick={()=>setMenu(false)}/>}
  <div className="ot-content-area">
   <header className="ot-topbar"><div className="ot-breadcrumb"><button className="ot-mobile-toggle" aria-label="Abrir menú" onClick={()=>setMenu(true)}><Menu size={23}/></button><span>Inteligencia Territorial</span><b>/</b><strong>{seccion}</strong></div><div className="ot-top-right"><span><MapPinned size={15}/> San Pedro, Valle del Cauca</span><span className="ot-top-separator"/><span className="ot-top-indicator"><i/> Fuentes conectadas</span></div></header>
   <main className="ot-main">
    <div className="ot-hero"><div className="ot-hero-info"><div className="ot-overline"><span/> OBSERVATORIO MUNICIPAL DE DATOS ABIERTOS</div><h1>El territorio, visto desde <em>sus datos.</em></h1><p>Un espacio para explorar la evolución de San Pedro a través de cifras públicas, fuentes oficiales y evidencia territorial.</p><div className="ot-hero-actions"><button onClick={()=>document.getElementById('ot-explorer')?.scrollIntoView({behavior:'smooth'})} className="ot-btn ot-btn-light">Explorar estadísticas <ArrowRight size={17}/></button><Link className="ot-btn ot-btn-ghost" href="/catalogo">Biblioteca de datos <ExternalLink size={16}/></Link></div></div><div className="ot-hero-graphic" aria-hidden="true"><span className="ot-orbit ot-orbit-a"/><span className="ot-orbit ot-orbit-b"/><div className="ot-floating-box"><small>CÓDIGO DEL MUNICIPIO</small><strong>76670</strong><span/><small>Valle del Cauca · Colombia</small></div></div></div>
    {!feed&&<div className="ot-error" role="status"><Info size={18}/><div><b>No fue posible consultar la base de datos ahora mismo.</b><p>{error||'Intenta actualizar la página más tarde. No se presentan cifras de ejemplo.'}</p></div></div>}
    <div className="ot-heading-strip"><div><span className="ot-small-heading">VISIÓN GENERAL</span><h2>{seccion==='Panorama'?'Panorama territorial':seccion}</h2><p>Indicadores con período de referencia explícito. Selecciona el año para actualizar las cifras disponibles.</p></div><div className="ot-control-group"><label className="ot-select-label">Vigencia <select aria-label="Vigencia" value={anio} onChange={e=>setAnio(Number(e.target.value))}>{years.map(y=><option key={y} value={y}>{y}</option>)}</select><ChevronDown size={14}/></label></div></div>
    <div className="ot-kpis"><article className="ot-kpi"><div className="ot-kpi-top">Población proyectada <span className="ot-kpi-icon"><Users2 size={19}/></span></div><strong>{valorConUnidad(poblacion)}</strong><small>Habitantes · {anio} · DANE</small><span className="ot-kpi-bottom">Proyección anual oficial</span></article><article className="ot-kpi"><div className="ot-kpi-top">Cabecera municipal <span className="ot-kpi-icon"><MapPinned size={19}/></span></div><strong>{valorConUnidad(cabecera)}</strong><small>Habitantes · {anio} · DANE</small><span className="ot-kpi-bottom">Población en cabecera</span></article><article className="ot-kpi"><div className="ot-kpi-top">Centros poblados y rural <span className="ot-kpi-icon"><Globe2 size={19}/></span></div><strong>{valorConUnidad(rural)}</strong><small>Habitantes · {anio} · DANE</small><span className="ot-kpi-bottom">Población fuera de cabecera</span></article><article className="ot-kpi"><div className="ot-kpi-top">Internet fijo <span className="ot-kpi-icon"><Activity size={19}/></span></div><strong>{internet?valorConUnidad(internet)+' %':'—'}</strong><small>Penetración municipal · {anio}</small><span className="ot-kpi-bottom">Fuente: TerriData / MinTIC</span></article></div>
    <ICETHighlights feed={feed}/>
    <SectorStatistics feed={feed}/>
    <div className="ot-visual-grid">
      <section className="ot-panel ot-pop-panel"><div className="ot-panel-head"><div><span className="ot-small-heading">EVOLUCIÓN DEMOGRÁFICA</span><h3>Una mirada a la población</h3><p>Serie 2018–2026 · proyecciones de población DANE</p></div><span className="ot-pill"><TrendingUp size={14}/> Serie histórica</span></div><LineChart series={series}/></section>
      <section className="ot-panel ot-territory-panel"><div className="ot-panel-head"><div><span className="ot-small-heading">COMPOSICIÓN TERRITORIAL</span><h3>Distribución poblacional</h3><p>Cabecera frente a centros poblados y rural disperso</p></div></div>
      {poblacion&&cabecera&&rural? <><div className="ot-donut" style={{background:`conic-gradient(#1785ec 0 ${Number(cabecera.valor)/Number(poblacion.valor)*100}%, #5dd3ce 0 100%)`}}><div className="ot-donut-center"><strong>{formatear(Number(cabecera.valor)/Number(poblacion.valor)*100,1)}%</strong><small>Cabecera</small></div></div><div className="ot-donut-legends"><span><i className="ot-dot-blue"/> Cabecera <strong>{formatear(Number(cabecera.valor),0)}</strong></span><span><i className="ot-dot-mint"/> Rural <strong>{formatear(Number(rural.valor),0)}</strong></span></div></>:<div className="ot-empty">La composición no está disponible para el año seleccionado.</div>}
      <div className="ot-fineprint"><Info size={14}/> Los porcentajes se calculan a partir de la misma serie DANE por área y vigencia.</div></section>
    </div>
    <div className="ot-secondary-grid">
     <section className="ot-panel"><div className="ot-panel-head"><div><span className="ot-small-heading">ECONOMÍA DEL TERRITORIO</span><h3>Producción agrícola</h3><p>Cultivos registrados · {anio} · toneladas</p></div><span className="ot-pill">TerriData</span></div><BarChart datos={crop} onSelect={setDetalle}/><p className="ot-fineprint">Se comparan únicamente cultivos con la misma unidad. No representan por sí solos la producción agrícola total.</p></section>
     <section className="ot-panel"><div className="ot-panel-head"><div><span className="ot-small-heading">DISPONIBILIDAD TEMÁTICA</span><h3>Explora por sector</h3><p>Cantidad de registros documentados por temática · {anio}</p></div></div><div className="ot-sector-bars">{sectorCounts.slice(0,8).map(([name,n],i)=><button className="ot-sector-item" onClick={()=>verSector(name)} key={name}><span>{name}</span><span className="ot-sector-track"><span style={{width:`${100*n/Math.max(1,sectorCounts[0]?.[1]||1)}%`,background:topicClass(name)}}/></span><strong>{n}</strong></button>)}</div><p className="ot-fineprint"><Info size={14}/> La cantidad de registros indica cobertura documental, no desempeño del sector.</p></section>
    </div>
    <section className="ot-panel ot-explore-panel" id="ot-explorer"><div className="ot-panel-head ot-explore-heading"><div><span className="ot-small-heading">EXPLORADOR ESTADÍSTICO</span><h3>Indicadores y cifras del territorio</h3><p>Consulta cada fuente, vigencia y unidad de medida de forma individual.</p></div><div className="ot-explore-actions"><button className="ot-icon-action" onClick={compartir}>{copiado?<Check size={16}/>:<ExternalLink size={16}/>} {copiado?'Enlace copiado':'Compartir vista'}</button><button disabled={!rows.length} className="ot-btn ot-export" onClick={descargar}><ArrowDownToLine size={17}/> CSV</button><a className={'ot-btn ot-export '+(!rows.length?'ot-disabled':'')} href={rows.length?`/api/reporte?anio=${anio}&sector=${encodeURIComponent(seccion)}`:'#'}><FileText size={17}/> Informe PDF</a></div></div>
      <div className="ot-filters"><label className="ot-search"><Search size={17}/><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar nombre del indicador..." aria-label="Buscar indicadores"/></label><label className="ot-select-label"><Filter size={15}/><select aria-label="Fuente" value={fuenteFiltro} onChange={e=>setFuenteFiltro(e.target.value)}><option value="Todas">Todas las fuentes</option><option value="DANE">DANE</option><option value="TerriData">TerriData</option></select><ChevronDown size={14}/></label></div>
      <div className="ot-results"><span>{rows.length} registros para {seccion==='Panorama'?'todas las temáticas':seccion} · {anio}</span><button onClick={()=>{setBusqueda('');setFuenteFiltro('Todas');verSector('Panorama')}}>Restablecer filtros</button></div>
      {rows.length?<div className="ot-data-grid">{rows.map(r=><button key={r.id} className="ot-data-card" onClick={()=>setDetalle(r)}><div className="ot-data-top"><span style={{color:topicClass(r.tema)}}>{r.tema}</span><ArrowRight size={16}/></div><h4>{r.nombre}</h4><strong>{formatear(Number(r.valor),2)} <small>{r.unidad}</small></strong><div className="ot-data-foot"><span>{r.anio} · {r.grupo==='SECTORIAL'?'DANE':'TerriData'}</span><span>Ver ficha <ArrowRight size={13}/></span></div></button>)}</div>:<div className="ot-empty"><Database size={24}/><p>No hay registros publicados con esta combinación de filtros.</p><button onClick={()=>verSector('Panorama')}>Volver al panorama</button></div>}
    </section>
    <footer className="ot-footer"><span>© 2026 · Alcaldía Municipal de San Pedro · Observatorio Territorial</span><span>Fuente primaria y vigencia visibles en cada registro · Código DIVIPOLA 76670</span></footer>
   </main>
  </div>
  {detalle&&<div className="ot-modal-backdrop" onClick={()=>setDetalle(null)} role="presentation"><section className="ot-modal" role="dialog" aria-modal="true" aria-labelledby="ot-dialog-title" onClick={e=>e.stopPropagation()}><div className="ot-modal-top"><span className="ot-small-heading">{detalle.tema} · {detalle.anio}</span><button onClick={()=>setDetalle(null)} aria-label="Cerrar detalle"><X size={21}/></button></div><h2 id="ot-dialog-title">{detalle.nombre}</h2><div className="ot-modal-stat">{formatear(Number(detalle.valor),2)} <span>{detalle.unidad}</span></div><div className="ot-detail-grid"><div><small>Vigencia</small><strong>{detalle.anio}</strong></div><div><small>Municipio</small><strong>San Pedro · 76670</strong></div><div><small>Origen de la cifra</small><strong>{detalle.fuente}</strong></div><div><small>Página de referencia</small><strong>{detalle.pagina||'Base estadística'}</strong></div></div><h3>Información metodológica</h3><p>{detalle.nota} La cifra se presenta en la unidad y período señalados por la fuente. No implica una relación causal.</p><a href={detalle.fuente_url} target="_blank" rel="noopener noreferrer" className="ot-btn ot-export">Consultar entidad productora <ExternalLink size={16}/></a></section></div>}
 </div>;
}
