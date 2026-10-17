'use client';
import {useState} from 'react';
import {formatear} from '@/lib/publicFeed';
interface Serie {nombre:string; valores: {anio:number;valor:number}[]; color:string}
export default function LineChart({series}:{series:Serie[]}) {
 const [hover,setHover]=useState<number|null>(null);
 const [activas,setActivas]=useState<string[]>(series.map(s=>s.nombre));
 const subset=series.filter(s=>activas.includes(s.nombre));
 const years=[...new Set(series.flatMap(s=>s.valores.map(p=>p.anio)))].sort((a,b)=>a-b);
 const numbers=subset.flatMap(s=>s.valores.map(p=>p.valor));
 if (!years.length || !numbers.length)return <div className="ot-empty">La fuente no contiene una serie temporal comparable.</div>;
 const min=Math.min(...numbers)*.92, max=Math.max(...numbers)*1.045;
 const w=740,h=300,l=64,r=19,t=23,b=38;
 const fx=(yr:number)=>l+(years.length===1?0.5:(yr-years[0])/(years[years.length-1]-years[0]))*(w-l-r);
 const fy=(v:number)=>t+(1-(v-min)/Math.max(1,max-min))*(h-t-b);
 const colorClass=series.map(s=>s.color);
 const hoveredPoints=hover===null?[]:subset.flatMap(s=>s.valores.filter(p=>p.anio===hover).map(p=>({nombre:s.nombre,valor:p.valor,color:s.color})));
 return <div className="ot-line-wrap">
  <div className="ot-chart-legend" aria-label="Mostrar u ocultar series">{series.map(s=><button key={s.nombre} aria-pressed={activas.includes(s.nombre)} className={'ot-legend-item '+(!activas.includes(s.nombre)?'ot-legend-off':'')} onClick={()=>setActivas(current=>current.includes(s.nombre)?current.length>1?current.filter(x=>x!==s.nombre):current:[...current,s.nombre])}><span style={{background:s.color}}/>{s.nombre}</button>)}</div>
  <svg className="ot-chart-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Evolución anual de población por categoría">
   {[0,1,2,3,4].map(i=>{const v=min+(max-min)*i/4, y=fy(v);return <g key={i}><path d={`M${l},${y} L${w-r},${y}`} stroke="#e7edf4" strokeDasharray="5 5"/><text x={l-12} y={y+4} textAnchor="end" fontSize="12" fill="#8da0b5">{formatear(v,0)}</text></g>})}
   {years.map(y=><text key={y} x={fx(y)} y={h-10} textAnchor="middle" fontSize="12" fill="#91a1b3">{y}</text>)}
   {subset.map(s=>{const pts=s.valores.map(p=>[fx(p.anio),fy(p.valor)]); const d=pts.map(([x,y],i)=>(i?'L':'M')+x+','+y).join(' ');
     return <g key={s.nombre}><path d={d} fill="none" stroke={s.color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>{s.valores.map(p=><circle key={p.anio} cx={fx(p.anio)} cy={fy(p.valor)} r={hover===p.anio?6:3} fill={s.color} stroke="white" strokeWidth="2"/>)}</g>})}
   {hover!==null&&<line x1={fx(hover)} y1={t} x2={fx(hover)} y2={h-b} stroke="#9fb1ca" strokeDasharray="4 5"/>}
   {years.map(y=><rect key={y} x={fx(y)-(w-l-r)/Math.max(1,years.length)/2} y={t} width={(w-l-r)/Math.max(1,years.length)} height={h-t-b} fill="transparent" onMouseEnter={()=>setHover(y)} onMouseLeave={()=>setHover(null)}/>)}
  </svg>
  <div className="ot-chart-description">{hoveredPoints.length?<><b>{hover}</b> · {hoveredPoints.map(p=>`${p.nombre}: ${formatear(p.valor,0)}`).join('  |  ')}</>:<>Pasa el cursor sobre la gráfica para consultar cada vigencia. Se muestran proyecciones DANE, no conteos censales anuales.</>}</div>
 </div>;
}
