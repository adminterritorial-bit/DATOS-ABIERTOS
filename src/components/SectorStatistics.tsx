import type {FeedPublico,ObservacionPublica} from '@/lib/publicFeed';
import {formatear} from '@/lib/publicFeed';
import {ExternalLink} from 'lucide-react';
function ficha(r:ObservacionPublica) {return <article key={r.codigo} className="ot-data-card" style={{minHeight:174}}>
 <div className="ot-data-top"><span>{r.anio} · {r.tema}</span></div><h4>{r.nombre}</h4>
 <strong>{formatear(Number(r.valor),r.unidad==='COP'?0:2)} <small>{r.unidad}</small></strong>
 <div className="ot-data-foot"><span>{r.tipo==='presupuesto_inicial'?'Presupuesto inicial · no ejecución':r.tipo==='derivado'?'Cálculo documentado':'Fuente departamental'}</span><a href={r.fuente_url} target="_blank" rel="noopener noreferrer" aria-label={'Consultar fuente de '+r.nombre}>Fuente <ExternalLink size={13}/></a></div>
 </article>}
export default function SectorStatistics({feed}:{feed:FeedPublico|null}){
 const r=feed?.registros||[];
 const ag=r.filter(x=>x.codigo.startsWith('AGRO-'));
 const fin=r.filter(x=>x.codigo.startsWith('PRES-'));
 if(!ag.length&&!fin.length)return null;
 const years=[...new Set(ag.map(x=>x.anio))].sort((a,b)=>a-b);
 return <div className="ot-secondary-grid" style={{marginBottom:20}}>
  <section className="ot-panel"><div className="ot-panel-head"><div><span className="ot-small-heading">DESARROLLO RURAL</span><h3>Catastro agropecuario</h3><p>San Pedro · producción y caracterización · {years.join(' / ')}</p></div></div><div className="ot-data-grid" style={{gridTemplateColumns:'repeat(2,minmax(0,1fr))'}}>{ag.filter(x=>['AGRO-2023-TON','AGRO-2023-AREA','AGRO-2023-UPA','AGRO-2024-ASOC'].includes(x.codigo)).map(ficha)}</div></section>
  <section className="ot-panel"><div className="ot-panel-head"><div><span className="ot-small-heading">HACIENDA PÚBLICA</span><h3>Presupuesto inicial 2025</h3><p>Valores del Acuerdo 010/2024 · no representan ejecución.</p></div></div><div className="ot-data-grid" style={{gridTemplateColumns:'repeat(2,minmax(0,1fr))'}}>{fin.filter(x=>['PRES-2025-TOTAL','PRES-2025-TRIB','PRES-2025-NOTRIB','PRES-2025-CAP'].includes(x.codigo)).map(ficha)}</div><p className="ot-fineprint">El enlace original del acuerdo presupuestal requiere restauración. Las cifras se presentan como transcripción del presupuesto aprobado, no como recaudo.</p></section>
 </div>;
}
