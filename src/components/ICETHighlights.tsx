import Link from 'next/link';
import type {FeedPublico} from '@/lib/publicFeed';
import {formatear} from '@/lib/publicFeed';
import {icetVigenciaActual,vincularICET,ICET_TOTAL} from '@/lib/icetMapping';
import {ArrowRight,BookOpen} from 'lucide-react';
export default function ICETHighlights({feed}:{feed:FeedPublico|null}){
 const latest=feed?icetVigenciaActual(vincularICET(feed)):[];
 if(!latest.length)return null;
 return <section className="ot-panel" style={{marginBottom:20}}>
  <div className="ot-panel-head"><div><span className="ot-small-heading">INDICADORES OFICIALES · ICET</span><h3>Estadística disponible de la batería territorial</h3><p>{latest.length} indicadores con cifras recuperadas de {ICET_TOTAL} preguntas, cada uno en su año original.</p></div><Link className="ot-btn ot-export" href="/icet">Explorar ICET <ArrowRight size={16}/></Link></div>
  <div className="ot-data-grid">{latest.slice(0,6).map(({codigo,registro,relacion})=><article key={codigo} className="ot-data-card" style={{minHeight:140}}>
    <span className="ot-small-heading">{codigo} · {registro.anio}</span><h4 style={{minHeight:0,margin:'12px 0'}}>{registro.nombre}</h4><strong style={{marginTop:'auto'}}>{formatear(Number(registro.valor),2)} <small>{registro.unidad}</small></strong><div className="ot-data-foot"><span>{relacion.equivalencia==='derivada'?'Suma derivada':'Fuente primaria recuperada'}</span><span><BookOpen size={14}/></span></div>
  </article>)}</div>
 </section>
