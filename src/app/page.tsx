'use client';
import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownToLine, ArrowRight, BarChart3, BookOpen, CheckCircle2, ChevronDown, CircleHelp, Database, FileText, Filter, Home, Info, Layers3, MapPinned, Menu, Search, ShieldCheck, X } from 'lucide-react';
import { registros, sectores } from '@/lib/records';
import type { Registro } from '@/lib/model';
import { csvSeguro, formatValor } from '@/lib/metrics.mjs';

const etiquetas = ['Panorama', 'Demografía', 'Economía', 'Seguridad', 'Víctimas', 'Infraestructura', 'Plan de Desarrollo', 'Biblioteca'];
const iconos = [Home, MapPinned, BarChart3, ShieldCheck, Activity, Layers3, FileText, BookOpen];
const fuentesOficiales = [
 { nombre:'DANE · DIVIPOLA', url:'https://www.dane.gov.co/index.php/sistema-estadistico-nacional-sen/normas-y-estandares/nomenclaturas-y-clasificaciones/nomenclaturas/codificacion-de-la-division-politica-administrativa-de-colombia-divipola', detalle:'Identidad territorial estandarizada · 76670' },
 { nombre:'Departamento Nacional de Planeación · TerriData', url:'https://terridata.dnp.gov.co/', detalle:'Perfil estadístico municipal y series históricas' },
 { nombre:'Portal municipal de San Pedro', url:'https://www.sanpedro-valle.gov.co/', detalle:'Documentos e informes de la Alcaldía' },
 { nombre:'Unidad para las Víctimas · RUV', url:'https://datospaz.unidadvictimas.gov.co/registro-unico-de-victimas/', detalle:'Registro Único de Víctimas · datos acumulados' }
];
function downloadCsv(rows:Registro[]) {
 const encabezados=['id','indicador','sector','valor','unidad','vigencia','periodo','entidad','fuente','pagina','estado','nota'];
 const valores=rows.map(r=>[r.id,r.titulo,r.sector,r.valor,r.unidad,r.anio,r.periodo||'',r.entidad,r.fuente,r.pagina||'',r.estado,r.nota||'']);
 const data=[encabezados,...valores].map(row=>row.map(csvSeguro).join(';')).join('\r\n');
 const blob=new Blob(['\uFEFF'+data],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob); const a=document.createElement('a');
 a.href=url; a.download='san-pedro-registros-territoriales.csv'; a.click(); URL.revokeObjectURL(url);
}
function num(v:number|null, digits=1) { return formatValor(v,digits); }
function Estadistica({titulo,valor,sub,icono:Icon}: {titulo:string;valor:string;sub:string;icono:typeof Activity}) {
 return <div className="stat"><div className="stat-top"><span>{titulo}</span><span className="stat-icon"><Icon size={18}/></span></div><strong>{valor}</strong><small>{sub}</small></div>;
}
function Ficha({dato,onOpen}:{dato:Registro;onOpen:(item:Registro)=>void}) {
 return <button className="metric-card" onClick={()=>onOpen(dato)} aria-label={'Consultar fuente y metodología: '+dato.titulo}>
  <div className="metric-card-head"><span className="metric-category">{dato.sector}</span><ArrowRight size={15}/></div>
  <h3>{dato.titulo}</h3>
  <div className="metric-value">{num(dato.valor)} <span>{dato.unidad}</span></div>
  <div className="metric-foot"><span>{dato.anio ?? 'Sin vigencia'}</span><span><CheckCircle2 size={13}/> Documento identificado</span></div>
 </button>;
}
function Agricultura() {
 const items=registros.filter(r=>r.tipo==='produccion'&&r.anio===2025);
 const max=Math.max(...items.map(r=>r.valor||0));
 return <div className="chart-body"><div className="chart-heading"><div><h3>Producción agrícola registrada</h3><p>Toneladas en 2025 · los cultivos no corresponden a la producción total municipal</p></div><span className="chip">UPRA / EVA</span></div><div className="horizontal-bars">{items.map((r)=> <div key={r.id} className="bar-row"><span>{r.titulo.replace('Producción de ','')}</span><div className="bar-track"><div className="bar-fill" style={{width:String((r.valor||0)/max*100)+'%'}}/></div><strong>{num(r.valor)}</strong></div>)}</div><div className="chart-note"><Info size={15}/> Todos los valores están expresados en toneladas. Se muestran por separado para no mezclar magnitudes incompatibles.</div></div>;
}
export default function HomePage() {
 const [seccion,setSeccion]=useState('Panorama');
 const [busqueda,setBusqueda]=useState('');
 const [anio,setAnio]=useState('2025');
 const [seleccion,setSeleccion]=useState<Registro|null>(null);
 const [sidebar,setSidebar]=useState(false);
 const [sector,setSector]=useState('Todos');
 useEffect(()=>{
  const q=new URLSearchParams(window.location.search);
  const s=q.get('sector'); const y=q.get('anio');
  if(s&&sectores.includes(s))setSector(s);
  if(y&&['Todos','2025','2026'].includes(y))setAnio(y);
 },[]);
 const resultados=useMemo(()=>registros.filter(r=>(anio==='Todos'||String(r.anio)===anio)&&(sector==='Todos'||r.sector===sector)&&r.titulo.toLocaleLowerCase('es').includes(busqueda.toLocaleLowerCase('es'))&&(seccion==='Panorama'||seccion==='Biblioteca'||(seccion==='Demografía'?r.sector==='Demografía':seccion==='Infraestructura'?r.sector==='Infraestructura':r.sector===seccion))),[anio,sector,busqueda,seccion]);
 const total2025=registros.filter(r=>r.anio===2025).length;
 const agrupacion=Object.entries(registros.filter(r=>r.anio===2025).reduce<Record<string,number>>((acc,r)=>{acc[r.sector]=(acc[r.sector]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1]);
 function cambiarSeccion(s:string){setSeccion(s);setSidebar(false);setSector('Todos');setBusqueda('');}
 function compartir(){const url=new URL(window.location.href);url.searchParams.set('anio',anio);url.searchParams.set('sector',sector);navigator.clipboard?.writeText(url.toString());}
 return <div className="shell">
  <aside className={'sidebar '+(sidebar?'sidebar-open':'')}>
    <div className="brand"><img src="/escudo-san-pedro.png" alt="Escudo e identidad oficial de San Pedro" className="logo"/><div className="brand-caption">OBSERVATORIO TERRITORIAL<span>ALCALDÍA MUNICIPAL</span></div></div>
    <div className="side-overline">CENTRO DE INTELIGENCIA</div>
    <nav aria-label="Navegación principal">{etiquetas.map((s,i)=>{const Icon=iconos[i];return <button key={s} className={'nav-item '+(seccion===s?'active':'')} onClick={()=>cambiarSeccion(s)}><Icon size={18}/><span>{s}</span>{seccion===s&&<span className="active-dot"/>}</button>})}</nav>
    <div className="side-bottom"><div className="data-identity"><span className="status-pulse"/><div>Fuentes trazables <small>DIVIPOLA 76670 · Valle del Cauca</small></div></div><p>Información agregada. No se publican archivos nominativos ni cifras no verificadas.</p></div>
  </aside>
  {sidebar&&<button className="scrim" aria-label="Cerrar navegación" onClick={()=>setSidebar(false)}/>}
  <div className="workspace">
   <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={()=>setSidebar(true)} aria-label="Abrir menú"><Menu size={22}/></button><span className="crumb">Observatorio <span>/</span> {seccion}</span></div><div className="topbar-right"><span className="jurisdiction"><MapPinned size={15}/> San Pedro, Valle del Cauca</span><span className="top-divider"/><span className="environment"><span/> Datos documentados</span></div></header>
   <main className="content"><div style={{display:'flex',flexWrap:'wrap',gap:9,margin:'0 0 16px'}}>
 <a href="/icet" style={{background:'#0c66cc',color:'#fff',borderRadius:9,padding:'10px 13px',fontSize:11,fontWeight:800}}>66 indicadores DANE ↗</a>
 <a href="/poblacion" style={{background:'#e8f2ff',color:'#0759af',borderRadius:9,padding:'10px 13px',fontSize:11,fontWeight:800}}>Serie DANE de población ↗</a>
 <a href="/catalogo" style={{background:'#e8f2ff',color:'#0759af',borderRadius:9,padding:'10px 13px',fontSize:11,fontWeight:800}}>65 datos TerriData ↗</a>
 <a href="/seguridad" style={{background:'#e8f2ff',color:'#0759af',borderRadius:9,padding:'10px 13px',fontSize:11,fontWeight:800}}>Seguridad 2025 ↗</a>
 </div>
    <div className="hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-square"/> PLATAFORMA DE INTELIGENCIA TERRITORIAL</div><h1>Decisiones que parten de <em>datos reales.</em></h1><p>Conoce el territorio a través de estadísticas documentadas, resultados institucionales y evidencia verificable. Cada cifra conserva su período, fuente y significado.</p><div className="hero-actions"><button onClick={()=>document.getElementById('explorar')?.scrollIntoView({behavior:'smooth'})} className="primary-action">Explorar indicadores <ArrowRight size={17}/></button><button className="secondary-action" onClick={()=>cambiarSeccion('Biblioteca')}>Consultar fuentes <BookOpen size={17}/></button></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-glass"><span className="hero-glass-eyebrow">IDENTIFICADOR MUNICIPAL</span><strong>76670</strong><div className="hero-glass-line"/><small>Valle del Cauca · Colombia</small></div><div className="grid-glow"/></div></div>
    <div className="kpi-grid"><Estadistica titulo="Registros trazables" valor={num(registros.length,0)} sub="Datos del municipio, con página de origen" icono={Database}/><Estadistica titulo="Registros vigencia 2025" valor={num(total2025,0)} sub="No equivalen a indicadores ICET calculados" icono={CheckCircle2}/><Estadistica titulo="Áreas con registros 2025" valor={num(agrupacion.length,0)} sub="Cobertura documental parcial" icono={Layers3}/><Estadistica titulo="Código oficial" valor="76670" sub="San Pedro · Valle del Cauca" icono={MapPinned}/></div>
    {seccion==='Biblioteca'?<section className="panel bibliotecapanel"><div className="section-heading"><div><div className="section-kicker">CATÁLOGO DOCUMENTAL</div><h2>Fuentes institucionales</h2><p>Localización de portales oficiales y archivos aportados, con el alcance real de cada evidencia.</p></div></div><div className="source-grid">{fuentesOficiales.map(f=><a key={f.url} className="source-card" href={f.url} target="_blank" rel="noopener noreferrer"><BookOpen size={20}/><div><strong>{f.nombre}</strong><small>{f.detalle}</small></div><ArrowRight size={16}/></a>)}</div><div className="notice"><Info size={17}/><p>Los PDF institucionales recibidos se han utilizado para extraer los valores señalados. No se publican automáticamente porque requieren revisión de derechos, versiones y datos sensibles. Los enlaces externos son portales de consulta, no sustituyen la referencia al documento y página.</p></div></section>:
    <><section className="panel viz-panel"><div className="section-heading"><div><div className="section-kicker">LECTURA DEL TERRITORIO</div><h2>{seccion==='Panorama'?'Panorama estadístico 2025':seccion}</h2><p>{seccion==='Panorama'?'Composición de registros documentados, no de la disponibilidad total de indicadores.':'Indicadores documentados del sector seleccionado.'}</p></div><span className="soft-pill"><span className="status-pulse"/> Corte por vigencia</span></div>
      <div className="viz-grid"><div className="sector-coverage"><h3>Registros por temática</h3><p>Conteo de observaciones identificadas para 2025</p>{agrupacion.map(([s,c])=><button key={s} className="sector-row" onClick={()=>{setSector(s);document.getElementById('explorar')?.scrollIntoView({behavior:'smooth'});}}><span>{s}</span><div className="sector-track"><div style={{width:String(c/total2025*100)+'%'}}/></div><strong>{c}</strong></button>)}<div className="chart-note"><Info size={15}/> El número de registros no mide el desempeño del sector.</div></div><Agricultura/></div></section></>}
    <section className="panel indicators-panel" id="explorar"><div className="section-heading"><div><div className="section-kicker">CONSULTA DE INDICADORES</div><h2>Explorador de datos</h2><p>Filtra por vigencia, temática y nombre. Abre cualquier tarjeta para consultar sus detalles.</p></div><button className="export-action" onClick={()=>downloadCsv(resultados)} disabled={resultados.length===0}><ArrowDownToLine size={17}/> Exportar CSV</button></div>
     <div className="filters"><label className="searchbox"><Search size={17}/><input type="search" placeholder="Buscar indicador o variable..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></label><label className="selectbox"><Filter size={16}/><select value={sector} onChange={e=>setSector(e.target.value)} aria-label="Filtrar por temática">{sectores.map(s=><option key={s} value={s}>{s}</option>)}</select><ChevronDown size={15}/></label><label className="selectbox narrow"><select value={anio} onChange={e=>setAnio(e.target.value)} aria-label="Filtrar por vigencia"><option value="2025">2025</option><option value="2026">2026</option><option value="Todos">Todas las vigencias</option></select><ChevronDown size={15}/></label></div>
     <div className="results-head"><span>{resultados.length} registros disponibles con los filtros actuales</span><button className="text-action" onClick={()=>{setAnio('2025');setSector('Todos');setBusqueda('');}}>Restablecer filtros</button></div>
     {resultados.length?<div className="metric-grid">{resultados.map(d=><Ficha key={d.id} dato={d} onOpen={setSeleccion}/>)}</div>:<div className="empty-state"><CircleHelp size={34}/><h3>No se encontraron registros</h3><p>No se interpreta como un valor cero. Amplía el período o cambia los filtros.</p></div>}
    </section>
    <footer className="footer"><span>© 2026 · Observatorio Territorial de San Pedro</span><span>Datos con trazabilidad · No implica validación oficial ICET</span></footer>
   </main>
  </div>
  {seleccion&&<div className="modal-backdrop" role="presentation" onMouseDown={()=>setSeleccion(null)}><section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="dato-titulo" onMouseDown={e=>e.stopPropagation()}><div className="detail-heading"><span className="metric-category">{seleccion.sector}</span><button aria-label="Cerrar detalle" onClick={()=>setSeleccion(null)}><X size={20}/></button></div><h2 id="dato-titulo">{seleccion.titulo}</h2><div className="detail-number">{num(seleccion.valor)} <span>{seleccion.unidad}</span></div><div className="detail-meta"><div><small>Vigencia</small><strong>{seleccion.anio||'Sin corte'}</strong></div><div><small>Geografía</small><strong>San Pedro · 76670</strong></div><div><small>Estado</small><strong>Documentado</strong></div><div><small>Fuente productora</small><strong>{seleccion.entidad}</strong></div></div><div className="detail-block"><h3>Fuente y trazabilidad</h3><p>{seleccion.fuente}{seleccion.pagina?' · página '+seleccion.pagina:''}</p><p>{seleccion.periodo||'Vigencia anual referenciada en el documento.'}</p></div><div className="detail-block"><h3>Lectura metodológica</h3><p>{seleccion.metodologia||seleccion.nota||'El registro corresponde al dato agregado consignado en la fuente. No se infiere ninguna causalidad ni equivalencia con otros indicadores.'}</p></div><button className="primary-action modal-close" onClick={()=>setSeleccion(null)}>Cerrar ficha <ArrowRight size={16}/></button></section></div>}
 </div>;
}
