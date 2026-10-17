'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,BookOpen,ExternalLink,FileText,Search,ShieldCheck} from 'lucide-react';
import {usePublicFeed} from '@/lib/usePublicFeed';
type Fuente={url:string;nombre:string;temas:string[];anios:number[];registros:number;formato:'PDF'|'Portal oficial'};
const hostOf=(s:string)=>{try{return new URL(s).hostname}catch{return ''}};
export default function Documentos(){
 const {feed,loading,error}=usePublicFeed();
 const [busca,setBusca]=useState(''),[tema,setTema]=useState('Todas'),[vista,setVista]=useState<Fuente|null>(null);
 const docs=useMemo(()=>{
  const grouped=new Map<string,Fuente>();
  for(const r of feed?.registros||[]){
   if(!r.fuente_url||!/^https:\/\//i.test(r.fuente_url))continue;
   const url=r.fuente_url.split('#')[0];
   const item=grouped.get(url)||{url,nombre:r.fuente,temas:[],anios:[],registros:0,formato:/\.pdf(?:\?|$)/i.test(url)?'PDF' as const:'Portal oficial' as const};
   if(!item.temas.includes(r.tema))item.temas.push(r.tema);
   if(!item.anios.includes(r.anio))item.anios.push(r.anio);
   item.registros++;
   grouped.set(url,item);
  }
  return [...grouped.values()].sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
 },[feed]);
 const categorias=['Todas',...new Set(docs.flatMap(d=>d.temas))].sort();
 const seleccion=docs.filter(d=>(tema==='Todas'||d.temas.includes(tema))&&(!busca||[d.nombre,d.url,...d.temas].join(' ').toLowerCase().includes(busca.toLowerCase())));
 return <main className="ot-app" style={{display:'block',minHeight:'100vh'}}><div className="ot-main" style={{maxWidth:1190}}>
 <Link href="/" className="ot-back-link"><ArrowLeft size={17}/> Volver al Observatorio</Link>
 <div className="ot-heading-strip"><div><span className="ot-small-heading">BIBLIOTECA DE PROCEDENCIA</span><h1 className="ot-library-heading">Documentos y fuentes del territorio</h1><p>Consulta los productores y referencias que respaldan las cifras publicadas de San Pedro, código 76670.</p></div><BookOpen color="#1271d4" size={31}/></div>
 <section className="ot-panel"><div className="ot-filters"><label className="ot-search"><Search size={17}/><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar fuente, entidad o temática" aria-label="Buscar fuente documental"/></label><label className="ot-select-label">Sector <select value={tema} onChange={e=>setTema(e.target.value)}>{categorias.map(c=><option key={c}>{c}</option>)}</select></label></div>
 {loading?<p className="ot-doc-notice" role="status">Consultando documentos oficiales...</p>:error?<p className="ot-doc-notice" role="alert">La biblioteca está temporalmente fuera de servicio. No se muestran referencias inventadas.</p>:<p className="ot-results">{seleccion.length} referencias con cifras vinculadas</p>}
 <div className="ot-document-grid">{seleccion.map(d=><article className="ot-document-card" key={d.url}>
  <div className="ot-document-top"><FileText size={20}/><span>{d.formato}</span></div>
  <h2>{d.nombre}</h2><p>{hostOf(d.url)} · {d.registros} registros en la biblioteca</p>
  <div className="ot-document-meta"><span>Vigencias: {d.anios.sort((a,b)=>a-b).join(', ')}</span><span>{d.temas.join(' · ')}</span></div>
  <div className="ot-document-actions">{d.formato==='PDF'&&<button type="button" className="ot-icon-action" onClick={()=>setVista(d)}>Ver documento</button>}<a href={d.url} target="_blank" rel="noopener noreferrer" className="ot-btn ot-export">Abrir fuente <ExternalLink size={14}/></a></div>
 </article>)}</div>
 {!loading&&!seleccion.length&&<div className="ot-empty">Prueba otro sector o término de búsqueda.</div>}
 <p className="ot-fineprint"><ShieldCheck size={15}/> Las referencias proceden del catálogo estadístico; no se suben documentos personales ni archivos administrativos privados. Algunas entidades pueden impedir la vista embebida.</p>
 </section>
 {vista&&<div className="ot-modal-backdrop" onClick={()=>setVista(null)}><section role="dialog" aria-modal="true" aria-label={'Documento '+vista.nombre} className="ot-document-modal" onClick={e=>e.stopPropagation()}>
 <div className="ot-document-modal-head"><strong>{vista.nombre}</strong><button aria-label="Cerrar documento" onClick={()=>setVista(null)}>Cerrar</button></div>
 <iframe title={vista.nombre} src={vista.url} loading="lazy" referrerPolicy="no-referrer"/>
 <p>Si la entidad impide la vista integrada, <a href={vista.url} target="_blank" rel="noopener noreferrer">abre el PDF en su página oficial</a>.</p>
 </section></div>}
 </div></main>;
}
