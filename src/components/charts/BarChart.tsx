'use client';
import type {ObservacionPublica} from '@/lib/publicFeed';
import {formatear} from '@/lib/publicFeed';
export default function BarChart({datos,onSelect}:{datos:ObservacionPublica[];onSelect:(r:ObservacionPublica)=>void}) {
 const ordered=[...datos].sort((a,b)=>b.valor-a.valor);
 const mx=Math.max(1,...ordered.map(x=>x.valor));
 if(!ordered.length)return <div className="ot-empty">No existen cantidades homogéneas en esta selección.</div>;
 return <div className="ot-bar-list">{ordered.map((item,i)=><button key={item.id} className="ot-bar-row" onClick={()=>onSelect(item)}>
   <span className="ot-bar-label">{item.nombre.replace(/Primer cultivo permanente en términos de toneladas producidas \(|Primer cultivo transitorio en términos de toneladas producidas \(/,'').replace(/[()]/g,'')}</span>
   <span className="ot-bar-track"><span className="ot-bar-fill" style={{width:`${Math.max(2,item.valor/mx*100)}%`,transitionDelay:`${i*55}ms`}}/></span>
   <strong>{formatear(item.valor,1)}</strong>
 </button>)}</div>;
}
