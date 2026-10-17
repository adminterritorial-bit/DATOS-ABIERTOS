'use client';
import Link from 'next/link';
import {useEffect} from 'react';
import {formatear} from '@/lib/publicFeed';
import {usePublicFeed} from '@/lib/usePublicFeed';
import type {FeedPublico} from '@/lib/publicFeed';
import {indicadoresICET} from '@/lib/icetCatalog';
import {ICET_TOTAL,icetVigenciaActual,vincularICET} from '@/lib/icetMapping';
import {ArrowLeft,ExternalLink,Database,TrendingUp} from 'lucide-react';
export default function ICET(){
 const {feed}=usePublicFeed();
 useEffect(()=>{const codigo=new URLSearchParams(location.search).get('q');if(codigo&&/^ICET-\d{2}$/.test(codigo)){document.getElementById(codigo)?.scrollIntoView({behavior:'smooth',block:'center'});}},[]);
 const linked=feed?vincularICET(feed):[];
 const latest=icetVigenciaActual(linked);
 const map=new Map(latest.map(x=>[x.codigo,x]));
 const areas=[...new Set(indicadoresICET.map(i=>i.area))];
 return <main className="ot-app" style={{display:'block',minHeight:'100vh'}}><div className="ot-main" style={{maxWidth:1240}}>
 <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:8,fontSize:12,fontWeight:800,color:'#126dd8'}}><ArrowLeft size={17}/> Inicio del Observatorio</Link>
 <div className="ot-hero" style={{marginTop:24,minHeight:230}}><div className="ot-hero-info"><div className="ot-overline"><span/> INTELIGENCIA TERRITORIAL · DANE</div><h1>Indicadores <em>ICET</em></h1><p>66 variables del instrumento, relacionadas con las cifras municipales recuperadas. Cada valor conserva su fuente, unidad y vigencia.</p></div><div className="ot-hero-graphic"><div className="ot-floating-box"><small>INDICADORES CON CIFRA</small><strong>{latest.length}/{ICET_TOTAL}</strong><small>Fuentes oficiales municipales</small></div></div></div>
 <div className="ot-kpis" style={{gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',marginTop:20}}>
 <article className="ot-kpi"><div className="ot-kpi-top">Batería de referencia <Database size={17}/></div><strong>{ICET_TOTAL}</strong><small>Indicadores catalogados</small></article>
 <article className="ot-kpi"><div className="ot-kpi-top">Con valores recuperados <TrendingUp size={17}/></div><strong>{latest.length}</strong><small>Relaciones explícitas y vigencia</small></article>
 <article className="ot-kpi"><div className="ot-kpi-top">Registros históricos</div><strong>{linked.length}</strong><small>Serie demográfica incluida</small></article>
 </div>
 {feed?<section className="ot-panel"><div className="ot-panel-head"><div><span className="ot-small-heading">CIFRAS DOCUMENTADAS</span><h2 style={{font:'800 20px Manrope',margin:'10px 0'}}>Resultados municipales recuperados</h2><p>No se sustituyen años históricos por 2025 ni tasas por conteos.</p></div></div>
 <div className="ot-data-grid">{latest.map(({codigo,registro,relacion})=>{
 const ind=indicadoresICET.find(x=>x.codigo===codigo);
 const historico=linked.filter(x=>x.codigo===codigo);
 return <article key={codigo} className="ot-data-card" style={{minHeight:215}}>
 <span className="ot-small-heading">{codigo} · {ind?.area||registro.tema}</span>
 <h3 style={{fontSize:12,lineHeight:1.65,color:'#536f8c',margin:'14px 0'}}>{ind?.nombre||registro.nombre}</h3>
 <strong style={{font:'800 26px Manrope,Arial',color:'#126fda',margin:'auto 0 4px'}}>{formatear(Number(registro.valor),2)} <small style={{fontWeight:600,fontSize:10,color:'#8ca3b6'}}>{registro.unidad}</small></strong>
 <div style={{fontSize:11,color:'#617e98',fontWeight:700}}>{registro.anio} · {relacion.equivalencia==='derivada'?'Suma de sectores':'Dato de la fuente'}</div>
 {historico.length>1&&<details style={{fontSize:10,color:'#6b839e',marginTop:9}}><summary style={{cursor:'pointer'}}>Consultar serie {historico.length} años</summary><div style={{display:'flex',flexWrap:'wrap',gap:9,padding:'9px 0'}}>{historico.slice(0,30).map(x=><span key={x.registro.id+'-'+x.registro.anio}>{x.registro.anio}: {formatear(Number(x.registro.valor),2)}</span>)}</div></details>}
 <div className="ot-data-foot"><span>Vigencia: {registro.anio}</span><a href={registro.fuente_url} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,color:'#126fda'}}>Fuente <ExternalLink size={14}/></a></div></article>})}</div>
 </section>:<p className="ot-error">No está disponible la conexión estadística en este momento; no se mostrarán valores simulados.</p>}
 <section className="ot-panel" style={{marginTop:20}}><div className="ot-panel-head"><div><span className="ot-small-heading">CONSULTA DE LA BATERÍA COMPLETA</span><h2 style={{font:'800 21px Manrope',margin:'8px 0'}}>Diccionario de 66 indicadores</h2><p>La ausencia de una cifra no significa cero ni falta de gestión del municipio.</p></div></div>
 {areas.map(area=><details key={area} open={area==='Económico'||area==='Sociodemográfico'} style={{borderTop:'1px solid #e8eef6',padding:'15px 0'}}><summary style={{cursor:'pointer',fontSize:12,fontWeight:800,color:'#335878'}}>{area} · {indicadoresICET.filter(x=>x.area===area).length}</summary>
 <div style={{display:'grid',gap:0,marginTop:11}}>{indicadoresICET.filter(x=>x.area===area).map(ind=>{
  const row=map.get(ind.codigo);
  return <div key={ind.codigo} id={ind.codigo} style={{scrollMarginTop:25,display:'grid',gridTemplateColumns:'60px minmax(0,1fr) minmax(130px,200px)',gap:12,padding:'11px 7px',alignItems:'center',borderBottom:'1px solid #eff3f8',fontSize:11}}>
   <strong style={{color:'#176bca'}}>{ind.codigo}</strong><span style={{color:'#5b7086',lineHeight:1.6}}>{ind.nombre}</span>
   <span style={{textAlign:'right',color:row?'#0f6dd2':'#a1afbd',fontWeight:row?800:500}}>{row?formatear(Number(row.registro.valor),2)+' '+row.registro.unidad+' · '+row.registro.anio:'—'}</span></div>})}</div></details>)}
 <p className="ot-fineprint">La presencia de una estadística pública no acredita por sí misma la disponibilidad histórica que evalúa el cuestionario ICET del DANE.</p></section>
 </div></main>
}