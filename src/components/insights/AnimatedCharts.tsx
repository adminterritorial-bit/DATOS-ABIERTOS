'use client';
import {useMemo,useState} from 'react';
import {AreaChart,Area,BarChart,Bar,CartesianGrid,XAxis,YAxis,Tooltip,Legend,ResponsiveContainer,PieChart,Pie,Cell,ReferenceLine} from 'recharts';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {AreaChart as AreaIcon,BarChart3,ChartPie,Info,ZoomIn} from 'lucide-react';
import type {DatoExplorador} from '@/lib/territorialDataset';
const format=(x:number,digits=1)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:digits}).format(x);
type ChartMode='tendencia'|'ranking'|'participacion';
const PALETTE=['#287bf1','#24b7ab','#956de7','#e4a258','#f0727b','#67a7ce'];
const barUnitExcluded=(s:string)=>/COP|\$|habitantes|hectáreas|tonelada|productores|personas|casos|UPA|matriculad/i.test(s);
function cleanUnit(d:DatoExplorador){return d.unidad.trim().toLocaleLowerCase('es-CO');}
const tooltipStyle={background:'rgba(255,255,255,.98)',border:'1px solid #e6edf7',borderRadius:14,boxShadow:'0 14px 38px rgba(16,44,89,.13)',fontSize:12,color:'#234469'};
interface Props {datos:DatoExplorador[];titulo?:string;onOpen:(r:DatoExplorador)=>void}
export default function AnimatedCharts({datos,titulo,onOpen}:Props){
 const reduced=useReducedMotion();
 const [tipo,setTipo]=useState<ChartMode>('tendencia');
 const [seleccion,setSeleccion]=useState<string>('');
 const grupos=useMemo(()=>{
  const m=new Map<string,DatoExplorador[]>();
  for(const d of datos.filter(x=>x.clase==='Publicado'||x.clase==='Calculado')){
   const key=cleanUnit(d);const arr=m.get(key)||[];arr.push(d);m.set(key,arr);
  }
  const relevance=(entry:[string,DatoExplorador[]])=>{
   const [unit,rows]=entry;
   const byName=new Map<string,Set<number>>();
   for(const r of rows){
    const years=byName.get(r.nombre)||new Set<number>();
    years.add(r.anio);
    byName.set(r.nombre,years);
   }
   const maxYears=Math.max(0,...[...byName.values()].map(ys=>ys.size));
   const current=Math.max(...rows.map(r=>r.anio));
   const contemporary=rows.filter(r=>r.anio===current).length;
   const population=rows.some(r=>/proyecci[oó]n.*poblaci[oó]n|poblaci[oó]n.*proyectad/i.test(r.nombre))
       &&/personas|habitantes/i.test(unit)?1500:0;
   const geographyOnly=/^regiones$|^municipios$|^tipos$/.test(unit)?-900:0;
   return population+geographyOnly+maxYears*14+Math.min(contemporary,12)*5+Math.min(rows.length,40);
  };
  return [...m.entries()].sort((a,b)=>relevance(b)-relevance(a));
 },[datos]);
 const unidad=grupos.some(g=>g[0]===seleccion)?seleccion:(grupos[0]?.[0]||'');
 const base=grupos.find(x=>x[0]===unidad)?.[1]||[];
 const years=useMemo(()=>[...new Set(base.map(d=>d.anio))].sort((a,b)=>a-b),[base]);
 const latest=years[years.length-1];
 const byName=useMemo(()=>{
  const m=new Map<string,DatoExplorador[]>();
  for(const d of base){let a=m.get(d.nombre)||[];a.push(d);m.set(d.nombre,a)}
  return [...m.values()].sort((a,b)=>b.length-a.length);
 },[base]);
 const serie=byName.find(s=>s.length>=2)||null;
 const temporal=serie?[...serie].sort((a,b)=>a.anio-b.anio).map(x=>({name:String(x.anio),valor:x.valor,source:x})):null;
 const comparables=base.filter(x=>x.anio===latest);
 const ranking=Array.from(new Map(comparables.map(x=>[x.nombre,x])).values()).sort((a,b)=>b.valor-a.valor).slice(0,9).map((x,i)=>({...x,name:x.nombre.length>28?x.nombre.slice(0,26)+'…':x.nombre,indice:i}));
 const areParts=ranking.length>=2&&ranking.length<=6&&!barUnitExcluded(unidad)&&ranking.every(r=>r.valor>=0)&&Math.abs(ranking.reduce((n,r)=>n+r.valor,0)-100)<1.5&&ranking.every(r=>r.nombre.toLowerCase().split(' ').slice(0,2).join(' ')===ranking[0].nombre.toLowerCase().split(' ').slice(0,2).join(' '));
 const disponible:ChartMode[]=areParts?['ranking','tendencia','participacion']:['ranking','tendencia'];
 const chosen=tipo==='participacion'&&!areParts?'ranking':tipo;
 const active=chosen==='tendencia'&&!temporal?'ranking':chosen;
 const empty=!ranking.length;
 return <section className="xp-chart-panel">
  <div className="xp-chart-header"><div><span className="xp-overline">LABORATORIO DE VISUALIZACIÓN</span><h2>{titulo||'Las cifras en movimiento'}</h2><p>Selecciona la unidad, explora cada elemento y abre su ficha original.</p></div>
   <label className="xp-unit-selector">Unidad comparable<select value={unidad} onChange={e=>{setSeleccion(e.target.value);setTipo('ranking')}} aria-label="Unidad de las estadísticas">{grupos.map(([key,values])=><option key={key} value={key}>{values[0].unidad} · {values.length} registros</option>)}</select></label>
  </div>
  <div className="xp-chart-tabs" role="group" aria-label="Tipo de visualización">
   {disponible.map(t=><button key={t} type="button" aria-pressed={active===t} className={active===t?'is-selected':''} onClick={()=>setTipo(t)}>{t==='tendencia'?<AreaIcon size={16}/>:t==='ranking'?<BarChart3 size={16}/>:<ChartPie size={16}/>} {t==='tendencia'?'Evolución':t==='ranking'?'Comparar':'Distribución'}</button>)}
  </div>
  {empty?<div className="xp-chart-empty">No hay registros comparables con esta unidad y filtro.</div>:
   <AnimatePresence mode="wait"><motion.div key={active+'-'+unidad} className="xp-chart-plot" initial={reduced?false:{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={reduced?{}:{opacity:0,y:-12}} transition={{duration:.35,ease:[.2,.8,.2,1]}}>
    {active==='tendencia'&&temporal?
     <ResponsiveContainer width="100%" height={335}>
      <AreaChart data={temporal} margin={{top:25,right:23,left:2,bottom:8}}>
       <defs><linearGradient id="xp-area-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#418dfc" stopOpacity=".40"/><stop offset="100%" stopColor="#7bc8f6" stopOpacity="0"/></linearGradient></defs>
       <CartesianGrid stroke="#e9eff9" strokeDasharray="4 8" vertical={false}/>
       <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill:'#7590ae',fontSize:11}}/>
       <YAxis tickLine={false} axisLine={false} width={52} tick={{fill:'#8b9eb6',fontSize:11}} tickFormatter={x=>format(x,0)}/>
       <Tooltip contentStyle={tooltipStyle} formatter={value=>[format(Number(value),2)+' '+unidad,serie?.[0]?.nombre||'Indicador']}/>
       <Area type="monotone" dataKey="valor" stroke="#287bf1" strokeWidth={3.5} fill="url(#xp-area-fill)" dot={{r:4,fill:'#fff',stroke:'#287bf1',strokeWidth:2}} activeDot={{r:7,stroke:'#fff',strokeWidth:3,fill:'#287bf1',onClick:(_evt:unknown,payload:any)=>{if(payload?.payload?.source)onOpen(payload.payload.source)}}} isAnimationActive={!reduced} animationDuration={1150}/>
      </AreaChart>
     </ResponsiveContainer>
    :active==='participacion'&&areParts?
     <div className="xp-pie-stage"><ResponsiveContainer width="100%" height={320}><PieChart><Pie data={ranking} dataKey="valor" nameKey="name" innerRadius="63%" outerRadius="84%" paddingAngle={3} cornerRadius={8} isAnimationActive={!reduced} animationDuration={1000} onClick={(_p,index)=>onOpen(ranking[index])}>{ranking.map((d,i)=><Cell key={d.id} fill={PALETTE[i%PALETTE.length]}/>)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={x=>format(Number(x),2)+' '+unidad}/></PieChart></ResponsiveContainer><div className="xp-pie-legend">{ranking.map((d,i)=><button key={d.id} onClick={()=>onOpen(d)}><span style={{background:PALETTE[i%PALETTE.length]}}/>{d.name} <b>{format(d.valor,1)}</b></button>)}</div></div>
    :<ResponsiveContainer width="100%" height={Math.max(315,ranking.length*42+70)}>
      <BarChart data={[...ranking].reverse()} layout="vertical" margin={{top:10,right:30,bottom:10,left:6}}>
       <defs><linearGradient id="xp-bar-shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#2e75ed"/><stop offset="75%" stopColor="#20a9ca"/><stop offset="100%" stopColor="#56d6c3"/></linearGradient></defs>
       <CartesianGrid stroke="#edf2f9" strokeDasharray="4 8" horizontal={false}/>
       <XAxis type="number" tickLine={false} axisLine={false} tick={{fill:'#7a90ab',fontSize:11}} tickFormatter={x=>format(x,0)}/>
       <YAxis dataKey="name" type="category" width={175} tickLine={false} axisLine={false} tick={{fill:'#496882',fontSize:11}}/>
       <Tooltip cursor={{fill:'rgba(50,121,241,.05)'}} contentStyle={tooltipStyle} formatter={x=>format(Number(x),2)+' '+unidad}/>
       <Bar dataKey="valor" fill="url(#xp-bar-shine)" radius={[0,10,10,0]} maxBarSize={23} isAnimationActive={!reduced} animationDuration={950} onClick={(v)=>{const payload=v as unknown as {payload?:{id?:string}};const row=ranking.find(x=>x.id===payload?.payload?.id);if(row)onOpen(row)}}/>
      </BarChart>
     </ResponsiveContainer>}
   </motion.div></AnimatePresence>}
  <div className="xp-chart-bottom"><Info size={15}/><span>{active==='tendencia'&&temporal?serie?.[0].nombre:active==='ranking'?'Comparación por '+unidad+' · vigencia '+latest:'Participación de categorías comparables'} · Pulsa una barra, sección o punto para consultar su procedencia. No se combinan unidades diferentes.</span><ZoomIn size={16}/></div>
 </section>;
}
