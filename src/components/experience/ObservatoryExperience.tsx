'use client';
import {useMemo,useState} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {Activity,ArrowDownRight,ArrowRight,ArrowUpRight,BookOpen,ChartNoAxesCombined,Check,ChevronDown,Compass,Database,ExternalLink,Filter,Flag,Globe2,GraduationCap,HeartPulse,House,Landmark,Layers3,Leaf,Map,MapPinned,Menu,Search,ShieldCheck,SlidersHorizontal,Sparkles,Users,X} from 'lucide-react';
import {usePublicFeed} from '@/lib/usePublicFeed';
import {reunirEstadisticas,filtrarEstadisticas,itemsPorIndicador} from '@/lib/territorialDataset';
import type {DatoExplorador,ClaseDato} from '@/lib/territorialDataset';
import {indicadoresICET} from '@/lib/icetCatalog';
import {codigoICET,macroDimensiones,temasTerritoriales,numeroTema} from '@/lib/territorialTaxonomy';
import type {TemaTerritorial} from '@/lib/territorialTaxonomy';
const AnimatedCharts=dynamic(()=>import('@/components/insights/AnimatedCharts'),{ssr:false,loading:()=> <div className="xp-loading">Preparando visualizaciones…</div>});
const ArcgisLocalMap=dynamic(()=>import('@/components/maps/ArcgisLocalMap'),{ssr:false,loading:()=> <div className="xp-loading">Cargando cartografía DANE…</div>});
const nf=(x:number,d=1)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:d}).format(x);
const domains=['Todos',...macroDimensiones] as const;
function clasificarDato(d:DatoExplorador):string{
 if(d.codigoICET&&/^ICET-\d{2}$/.test(d.codigoICET))return numeroTema.get(Number(d.codigoICET.slice(-2)))?.id||'';
 const q=(d.nombre+' '+d.sector).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const s=d.sector.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/victima|desplazam|conflicto armado|ruv|reparacion/.test(q))return 'victimas';
 if(/energia electrica|alcantarillado|acueducto|agua potable|saneamiento|residuo|aseo/.test(q))return /residuo/.test(q)?'ambiente':'servicios';
 if(/educacion|matricula|desercion|colegio|internet escolar|alfabet/.test(q))return 'educacion';
 if(/mortalidad|defuncion|fallecim/.test(q))return /accidente de transito/.test(q)?'transporte':'mortalidad';
 if(/tubercul|dengue|hepatitis|malaria|vih|sivigila|incidencia|letalidad/.test(q))return 'epidemiologia';
 if(/vacuna|salud|medic|parto|afiliacion|embarazo|gestacion/.test(q))return 'atencion';
 if(/homicidio|hurto|extorsion|violencia|feminicidio|suicidio/.test(q))return 'seguridad';
 if(/poblacion|demografia|natalidad|hombres|mujeres|fecundidad/.test(q))return 'poblacion';
 if(/vivienda|pobreza|hogares con deficit/.test(q))return 'vivienda';
 if(/presupuesto|tributario|valor agregado|ingreso fiscal|finanzas/.test(q))return 'economia';
 if(/cultivo|agricola|ganad|hectareas|rural|suelo|catastro|predio|upa/.test(q))return 'suelo';
 if(/vehi|transito|movilidad|accidente/.test(q))return 'transporte';
 if(/institucional|administracion|gobierno|alcaldia/.test(q))return 'gobierno';
 if(s==='economia')return 'economia';
 if(s==='ambiental')return 'ambiente';
 if(s==='seguridad')return 'seguridad';
 if(s==='demografia')return 'poblacion';
 if(s==='servicios publicos')return 'servicios';
 if(s==='educacion')return 'educacion';
 if(s==='salud')return 'atencion';
 return '';
}
function IconTheme({name,size=18}:{name:string;size?:number}){
 switch(name){
 case 'leaf':return <Leaf size={size}/>;
 case 'map':return <Map size={size}/>;
 case 'droplets':return <Layers3 size={size}/>;
 case 'users':return <Users size={size}/>;
 case 'graduation-cap':return <GraduationCap size={size}/>;
 case 'house':return <House size={size}/>;
 case 'activity':return <Activity size={size}/>;
 case 'heart-pulse':return <HeartPulse size={size}/>;
 case 'heart':return <HeartPulse size={size}/>;
 case 'chart-no-axes-combined':return <ChartNoAxesCombined size={size}/>;
 case 'landmark':return <Landmark size={size}/>;
 case 'route':return <Compass size={size}/>;
 case 'shield-check':return <ShieldCheck size={size}/>;
 default:return <Flag size={size}/>;
 }
}
function StoryCard({item,onClick}:{item:DatoExplorador;onClick:()=>void}){
 return <motion.button layout type="button" className="xp-stat-card" whileHover={{y:-5}} whileTap={{scale:.98}} onClick={onClick}>
  <div className="xp-stat-top"><span>{item.sector}</span><ArrowUpRight size={17}/></div><strong className="xp-stat-value">{nf(item.valor,2)} <span>{item.unidad}</span></strong>
  <h3>{item.nombre}</h3><footer><span>{item.anio} · {item.fuente}</span><span className="xp-stat-arrow"><ArrowRight size={15}/></span></footer>
 </motion.button>;
}
export default function ObservatoryExperience(){
 const {feed,loading,error}=usePublicFeed();
 const reduced=useReducedMotion();
 const all=useMemo(()=>reunirEstadisticas(feed),[feed]);
 const [macro,setMacro]=useState<string>('Todos');
 const [tema,setTema]=useState<string>('Todos');
 const [anio,setAnio]=useState<string>('Todos');
 const [clase,setClase]=useState<'Todas'|ClaseDato>('Todas');
 const [buscar,setBuscar]=useState('');
 const [vista,setVista]=useState<'historias'|'territorio'|'catalogo'>('historias');
 const [detalle,setDetalle]=useState<DatoExplorador|null>(null);
 const [menu,setMenu]=useState(false);
 const [verMas,setVerMas]=useState(false);
 const [tituloClic,setTituloClic]=useState(false);
 const mapear=useMemo(()=>new Map(all.map(x=>[x.id,clasificarDato(x)])),[all]);
 const tematicos=useMemo(()=>all.filter(d=>(tema==='Todos'||mapear.get(d.id)===tema)&&(macro==='Todos'||temasTerritoriales.find(t=>t.id===mapear.get(d.id))?.macro===macro)),[all,tema,macro,mapear]);
 const filtered=useMemo(()=>filtrarEstadisticas(tematicos,buscar,anio==='Todos'?'Todos':Number(anio),clase),[tematicos,buscar,anio,clase]);
 const topic=temasTerritoriales.find(t=>t.id===tema);
 const years=[...new Set(all.map(d=>d.anio))].sort((a,b)=>b-a);
 const cards=Array.from(new Map(filtered.filter(d=>d.clase==='Publicado'||d.clase==='Calculado').sort((a,b)=>b.anio-a.anio).map(r=>[r.nombre+'|'+r.unidad,r])).values()).slice(0,verMas?48:8);
 const catalogo=indicadoresICET.filter(i=>tema==='Todos'||numeroTema.get(i.numero)?.id===tema).filter(i=>macro==='Todos'||numeroTema.get(i.numero)?.macro===macro).filter(i=>!buscar||(i.nombre+' '+i.codigo).toLowerCase().includes(buscar.toLowerCase()));
 const count=(t:TemaTerritorial)=>all.filter(d=>mapear.get(d.id)===t.id).length;
 const reset=()=>{setMacro('Todos');setTema('Todos');setAnio('Todos');setClase('Todas');setBuscar('');setVerMas(false)};
 const seleccionarTema=(id:string)=>{setTema(id);setAnio('Todos');setClase('Todas');setBuscar('');setVerMas(false);setVista('historias');setMenu(false)};
 return <div className="xp-app">
  <a className="xp-skip" href="#xp-main">Ir al contenido estadístico</a>
  <aside className={'xp-side '+(menu?'is-open':'')} aria-label="Navegación temática del Observatorio">
   <div className="xp-logo"><span className="xp-logo-mark"><Globe2 size={26}/></span><div><strong>SAN PEDRO</strong><small>Observatorio de datos abiertos</small></div></div>
   <div className="xp-side-kicker">EXPLORA EL TERRITORIO</div>
   <nav className="xp-primary-nav">
    <button aria-pressed={tema==='Todos'&&macro==='Todos'} className={tema==='Todos'&&macro==='Todos'?'active':''} onClick={reset}><Compass size={18}/> Panorama general <ArrowRight size={15}/></button>
    <button aria-pressed={vista==='territorio'} onClick={()=>{setVista('territorio');setMenu(false)}}><MapPinned size={18}/> Mapa del municipio <ArrowRight size={15}/></button>
    <button aria-pressed={vista==='catalogo'} onClick={()=>{setVista('catalogo');setMenu(false)}}><BookOpen size={18}/> Los 66 indicadores <ArrowRight size={15}/></button>
   </nav>
   <div className="xp-side-kicker">ÁREAS DE CONOCIMIENTO</div>
   <nav className="xp-side-groups">{macroDimensiones.map(m=><div key={m} className="xp-nav-cluster"><button className={'xp-nav-group '+(macro===m?'selected':'')} aria-expanded={macro===m} onClick={()=>{setMacro(macro===m?'Todos':m);setTema('Todos');setVista('historias');setMenu(false)}}><span className="xp-cluster-dot"/>{m}<ChevronDown size={14}/></button>
    <AnimatePresence initial={false}>{macro===m&&<motion.div initial={reduced?false:{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={reduced?{}:{height:0,opacity:0}} className="xp-subnav">{temasTerritoriales.filter(t=>t.macro===m).map(t=><button key={t.id} aria-pressed={tema===t.id} onClick={()=>seleccionarTema(t.id)} className={tema===t.id?'active':''}><IconTheme name={t.icono} size={16}/><span>{t.nombre}</span><small>{t.items.length}</small></button>)}</motion.div>}</AnimatePresence>
   </div>)}</nav>
   <div className="xp-sidebar-bottom"><span><span className="xp-online"/> {loading?'Conectando fuentes…':error?'Datos locales disponibles':'Fuentes conectadas'}</span><small>Municipio 76670 · Valle del Cauca</small><Link href="/documentos/">Consultar biblioteca <ExternalLink size={12}/></Link></div>
  </aside>
  {menu&&<div className="xp-menu-overlay" onClick={()=>setMenu(false)}/>}
  <main className="xp-main" id="xp-main">
   <header className="xp-header"><div className="xp-breadcrumb"><button className="xp-mobile-nav" onClick={()=>setMenu(!menu)} aria-label="Abrir navegación"><Menu size={21}/></button><span>Observatorio</span><ArrowRight size={13}/><strong>{topic?.nombre||macro==='Todos'?'Panorama territorial':macro}</strong></div><div className="xp-header-actions"><span className="xp-period"><span/> Última consulta · {new Date().getFullYear()}</span><Link href="/comparar/" title="Explorador de series">Comparar datos <ArrowUpRight size={15}/></Link></div></header>
   <div className="xp-body">
    <section className="xp-hero"><div className="xp-hero-content"><span className="xp-kicker"><Sparkles size={14}/> UNA NUEVA FORMA DE DESCUBRIR SAN PEDRO</span><button className="xp-hero-title" onClick={()=>{setTituloClic(v=>!v);setVista(vista==='territorio'?'historias':'territorio')}} aria-label="Alternar exploración estadística y territorial"><h1>{tituloClic?'Cada rincón tiene una historia.':topic?topic.pregunta:'Un territorio que cobra vida con sus datos.'}</h1><ArrowUpRight size={23}/></button><p>Explora historias, transforma estadísticas en visualizaciones y descubre el municipio desde fuentes públicas con fechas y procedencia visibles.</p><div className="xp-hero-actions"><button onClick={()=>{setVista('historias');document.getElementById('xp-lab')?.scrollIntoView({behavior:'smooth'})}}>Descubrir las cifras <ArrowRight size={16}/></button><button className="xp-hero-outline" onClick={()=>setVista('territorio')}><MapPinned size={16}/> Explorar el mapa</button></div></div><div className="xp-hero-orbit" aria-hidden="true"><div className="xp-orbit xp-orbit-1"/><div className="xp-orbit xp-orbit-2"/><div className="xp-orbit xp-orbit-3"/><div className="xp-orbit-globe"><Globe2 size={90} strokeWidth={.8}/></div><span className="xp-orbit-label xp-label-1">DANE</span><span className="xp-orbit-label xp-label-2">76670</span><span className="xp-orbit-label xp-label-3">DATOS ABIERTOS</span></div></section>
    <section className="xp-ticker" aria-label="Capacidades de consulta"><div><Database size={19}/><span>{nf(all.length,0)} <small>observaciones disponibles</small></span></div><div><Layers3 size={19}/><span>{temasTerritoriales.length} <small>temas de vida municipal</small></span></div><div><BookOpen size={19}/><span>66 <small>preguntas del DANE</small></span></div><div><Compass size={19}/><span>{years.length} <small>vigencias documentadas</small></span></div></section>
    <section className="xp-theme-section"><div className="xp-section-heading"><div><span className="xp-overline">EXPLORA SEGÚN TUS INTERESES</span><h2>Los grandes temas de nuestro municipio.</h2><p>No más listados interminables. Elige una conversación para descubrir los datos relevantes.</p></div><button onClick={reset}><Filter size={16}/> Limpiar filtros</button></div><div className="xp-theme-grid">{temasTerritoriales.filter(t=>macro==='Todos'||t.macro===macro).map(t=><motion.button whileHover={reduced?{}:{y:-5}} whileTap={reduced?{}:{scale:.98}} type="button" key={t.id} onClick={()=>seleccionarTema(t.id)} aria-pressed={tema===t.id} className={'xp-theme '+(tema===t.id?'chosen':'')} style={{'--xp-topic':t.color} as React.CSSProperties}><span className="xp-theme-icon"><IconTheme name={t.icono} size={24}/></span><span className="xp-theme-meta">{t.items.length} indicadores DANE</span><strong>{t.nombre}</strong><small>{t.descripcion}</small><footer><span>{count(t)} registros temáticos</span><ArrowUpRight size={18}/></footer></motion.button>)}</div></section>
    <section className="xp-workspace" id="xp-lab"><div className="xp-section-heading"><div><span className="xp-overline">EL LABORATORIO DEL TERRITORIO</span><h2>{topic?topic.nombre:'Descubre qué cuentan las cifras.'}</h2><p>{topic?.descripcion||'Visualizaciones que puedes explorar, filtrar y consultar a detalle.'}</p></div><div className="xp-workspace-view" role="group" aria-label="Modo de exploración">{[['historias','Gráficas'],['territorio','Geografía'],['catalogo','Indicadores']].map(([k,v])=><button key={k} className={vista===k?'active':''} aria-pressed={vista===k} onClick={()=>setVista(k as typeof vista)}>{v}</button>)}</div></div>
    <div className="xp-filterbar"><label className="xp-searchbox"><Search size={19}/><input value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar cifras, temas, fuentes…" aria-label="Buscar en estadísticas del municipio"/>{buscar&&<button onClick={()=>setBuscar('')} aria-label="Limpiar búsqueda"><X size={14}/></button>}</label><label className="xp-dropdown"><span>Vigencia</span><select value={anio} onChange={e=>setAnio(e.target.value)}><option value="Todos">Todos los años</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></label><label className="xp-dropdown"><span>Naturaleza</span><select value={clase} onChange={e=>setClase(e.target.value)}>{['Todas','Publicado','Calculado','Relacionado','Estimación'].map(x=><option key={x}>{x}</option>)}</select></label><button className="xp-reset" onClick={reset} aria-label="Restablecer todos los filtros"><SlidersHorizontal size={18}/></button></div>
    {vista==='historias'&&<>
     <AnimatedCharts datos={filtered} titulo={topic?'Explora '+topic.nombre.toLocaleLowerCase('es'):'Tendencias y comparaciones'} onOpen={setDetalle}/>
     <div className="xp-section-heading xp-heading-spaced"><div><span className="xp-overline">DATOS PARA DESCUBRIR</span><h2>Cada estadística tiene una historia.</h2><p>{filtered.length} observaciones en la selección, con año y fuente disponibles.</p></div><button onClick={()=>setVerMas(v=>!v)}>{verMas?'Mostrar menos':'Ver más estadísticas'} <ArrowRight size={15}/></button></div>
     <div className="xp-stat-grid">{cards.map(d=><StoryCard key={d.id} item={d} onClick={()=>setDetalle(d)}/>)}</div>
     {!cards.length&&<div className="xp-empty">No hay cifras compatibles con los filtros seleccionados. Prueba otra vigencia o temática.</div>}
    </>}
    {vista==='territorio'&&<ArcgisLocalMap datos={all}/>}
    {vista==='catalogo'&&<section className="xp-indicator-panel"><p className="xp-overline">DICCIONARIO DE 66 PREGUNTAS DANE · CLASIFICACIÓN CIUDADANA</p><div className="xp-indicator-grid">{catalogo.map(i=>{const t=numeroTema.get(i.numero);const relacionados=itemsPorIndicador(all,i.codigo);return <button key={i.codigo} className="xp-indicator-row" onClick={()=>{setTema(t?.id||'Todos');setVista('historias');setBuscar(i.nombre.split(' ').slice(0,3).join(' '))}}><span className="xp-indicator-code">{i.codigo}</span><span><strong>{i.nombre}</strong><small>{t?.nombre} · {relacionados.length?relacionados.length+' registros con relación explícita':'Consultar estadísticas del sector'}</small></span><ArrowUpRight size={16}/></button>})}</div><Link className="xp-indicator-more" href="/icet/recuperados/">Consultar batería y fuentes documentales <ArrowRight size={16}/></Link></section>}
    </section>
    <section className="xp-visit-map"><div><span className="xp-overline">GEOVISOR ARC GIS</span><h2>Del dato al lugar.</h2><p>Explora centros poblados del MGN 2025 sobre el contorno real de San Pedro y consulta su ficha territorial.</p><button onClick={()=>{setVista('territorio');document.getElementById('xp-lab')?.scrollIntoView({behavior:'smooth'})}}>Entrar al mapa interactivo <ArrowUpRight size={16}/></button></div><div className="xp-map-illustration"><MapPinned size={100} strokeWidth={1}/><span>LAT 4° · LON −76°</span></div></section>
    <footer className="xp-footer"><div><Globe2 size={22}/><b>OBSERVATORIO SAN PEDRO</b></div><p>Datos abiertos para entender y transformar nuestro territorio. Las cifras observadas y los cálculos conservan sus vigencias.</p><nav><Link href="/documentos/">Fuentes</Link><Link href="/mapa/">Geovisor completo</Link><Link href="/estimador/">Estimaciones</Link><Link href="/icet/">ICET</Link></nav></footer>
   </div>
  </main>
  <AnimatePresence>{detalle&&<motion.div className="xp-detail-backdrop" onClick={()=>setDetalle(null)} initial={reduced?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.section role="dialog" aria-modal="true" aria-label="Detalle estadístico" className="xp-detail-modal" onClick={e=>e.stopPropagation()} initial={reduced?false:{opacity:0,y:35}} animate={{opacity:1,y:0}} exit={{opacity:0,y:35}}><button className="xp-modal-close" onClick={()=>setDetalle(null)} aria-label="Cerrar detalle"><X size={18}/></button><span className="xp-overline">{detalle.sector} · {detalle.anio}</span><h2>{detalle.nombre}</h2><strong className="xp-detail-big">{nf(detalle.valor,2)} <span>{detalle.unidad}</span></strong><div className="xp-detail-fields"><div><span>Vigencia del registro</span><strong>{detalle.anio}</strong></div><div><span>Clase</span><strong>{detalle.clase}</strong></div><div><span>Fuente estadística</span><strong>{detalle.fuente}</strong></div>{detalle.codigoICET&&<div><span>Vínculo</span><strong>{detalle.codigoICET}</strong></div>}</div>{detalle.nota&&<p>{detalle.nota}</p>}<div className="xp-modal-actions">{detalle.fuenteUrl?<a target="_blank" rel="noopener noreferrer" href={detalle.fuenteUrl}>Consultar fuente <ExternalLink size={15}/></a>:<Link href="/documentos/" onClick={()=>setDetalle(null)}>Ir a biblioteca <BookOpen size={15}/></Link>}<button onClick={()=>setDetalle(null)}>Cerrar ficha <Check size={15}/></button></div></motion.section></motion.div>}</AnimatePresence>
 </div>;
}
