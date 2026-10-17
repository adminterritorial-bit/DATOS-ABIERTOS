'use client';
import {useEffect,useMemo,useRef} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {Info,ArrowUpRight,TrendingUp,BarChart3,Activity,Layers3,PieChart as PieIcon} from 'lucide-react';
import type {DatoExplorador} from '@/lib/territorialDataset';
import * as echarts from 'echarts/core';
import {LineChart,BarChart,PieChart,TreemapChart,HeatmapChart,GaugeChart} from 'echarts/charts';
import {GridComponent,TooltipComponent,LegendComponent,VisualMapComponent} from 'echarts/components';
import {SVGRenderer} from 'echarts/renderers';
echarts.use([LineChart,BarChart,PieChart,TreemapChart,HeatmapChart,GaugeChart,GridComponent,TooltipComponent,LegendComponent,VisualMapComponent,SVGRenderer]);
const palette=['#0da990','#3387d5','#7358c8','#eb9c42','#db637d','#37b0d0','#a4be45'];
const fmt=(n:number)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(n);
type Panel={id:string;title:string;subtitle:string;label:string;option:echarts.EChartsCoreOption;rows:DatoExplorador[];source:string};
function ChartFrame({option,onPick}:{option:echarts.EChartsCoreOption;onPick:(i:number)=>void}){
 const ref=useRef<HTMLDivElement>(null),click=useRef(onPick);useEffect(()=>{click.current=onPick},[onPick]);
 useEffect(()=>{if(!ref.current)return;const instance=echarts.init(ref.current,null,{renderer:'svg'});instance.setOption(option,true);const handler=(e:{dataIndex?:number})=>{if(Number.isInteger(e.dataIndex))click.current(e.dataIndex!)};instance.on('click',handler);const observer=new ResizeObserver(()=>instance.resize());observer.observe(ref.current);return()=>{observer.disconnect();instance.off('click',handler);instance.dispose()}},[option]);
 return <div className="g4-ecplot n5-chart-canvas" ref={ref}/>;
}
const keyOf=(d:DatoExplorador)=>d.nombre.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()+'|'+d.unidad;
const units=(d:DatoExplorador)=>d.unidad.trim().toLowerCase();
export default function ChartWall({datos,onOpen,title='El municipio en cinco perspectivas'}:{datos:DatoExplorador[];onOpen:(d:DatoExplorador)=>void;title?:string}){
 const reduced=useReducedMotion();
 const panels=useMemo(()=>{
  const rows=datos.filter(d=>Number.isFinite(d.valor)&&d.anio>=1900&&d.anio<=2030);
  const countBy=(f:(r:DatoExplorador)=>string)=>{const m=new Map<string,number>();rows.forEach(x=>m.set(f(x),(m.get(f(x))||0)+1));return [...m.entries()].sort((a,b)=>b[1]-a[1])};
  const group=new Map<string,DatoExplorador[]>();rows.forEach(d=>{const k=keyOf(d);group.set(k,[...(group.get(k)||[]),d])});
  const histories=[...group.values()].map(g=>[...new Map(g.map(x=>[x.anio,x])).values()].sort((a,b)=>a.anio-b.anio)).filter(g=>g.length>=2).sort((a,b)=>b.length-a.length);
  const main=histories[0]||[];
  const latest=rows.length?Math.max(...rows.map(d=>d.anio)):2025;
  const values=[...new Map(rows.filter(x=>x.anio===latest).map(x=>[keyOf(x),x])).values()];
  const byUnit=new Map<string,DatoExplorador[]>();values.forEach(d=>byUnit.set(units(d),[...(byUnit.get(units(d))||[]),d]));
  const ranked=[...byUnit.values()].filter(g=>g.length>=2).sort((a,b)=>b.length-a.length)[0]?.sort((a,b)=>b.valor-a.valor).slice(0,9)||[];
  const sectorCounts=countBy(x=>x.sector).slice(0,10);
  const yearCounts=countBy(x=>String(x.anio)).sort((a,b)=>Number(a[0])-Number(b[0]));
  const sources=countBy(x=>x.fuente).slice(0,8);
  const result:Panel[]=[];
  const base={animation:!reduced,animationDuration:750,tooltip:{trigger:'axis'},textStyle:{fontFamily:'Century Gothic, sans-serif',fontSize:11}} as const;
  const xStyle={axisLine:{show:false},axisTick:{show:false},axisLabel:{color:'#69849d',fontSize:10}};
  const yStyle={axisLine:{show:false},splitLine:{lineStyle:{color:'#e6f0f5',type:'dashed'}},axisLabel:{color:'#69849d',fontSize:10}};
  const timeline=main.length?main.map(d=>[String(d.anio),d.valor] as const):yearCounts;
  result.push({id:'trend',title:'Evolución en el tiempo',subtitle:main.length?main[0].nombre+' · '+main[0].unidad:'Disponibilidad de registros por vigencia',label:'HISTORIA',rows:main,source:main.at(-1)?.fuente||'Inventario de registros',option:{...base,grid:{left:52,right:20,top:23,bottom:42},xAxis:{type:'category',data:timeline.map(t=>t[0]),...xStyle},yAxis:{type:'value',scale:true,...yStyle},series:[{type:'line',smooth:true,data:timeline.map(t=>t[1]),lineStyle:{width:4,color:'#0daf98'},itemStyle:{color:'#0daf98'},symbolSize:8,areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'rgba(17,187,154,.36)'},{offset:1,color:'rgba(17,187,154,.01)'}]}}}]}} as Panel);
  const compare=ranked.length>=2?ranked:[];const barData=compare.length?compare.map(d=>[d.nombre,d.valor] as const):sectorCounts;const barRows=compare;
  result.push({id:'compare',title:'Comparar magnitudes',subtitle:compare.length?'Misma unidad ('+compare[0].unidad+') · año '+latest:'Cantidad de observaciones por sector',label:'COMPARACIÓN',rows:barRows,source:compare[0]?.fuente||'Inventario de registros',option:{...base,grid:{left:20,right:15,top:14,bottom:95},xAxis:{type:'category',data:barData.map(t=>t[0].length>21?t[0].slice(0,20)+'…':t[0]),axisLabel:{rotate:32,color:'#66829b',fontSize:9},axisLine:{show:false},axisTick:{show:false}},yAxis:{type:'value',...yStyle},series:[{type:'bar',data:barData.map(t=>t[1]),barMaxWidth:35,itemStyle:{borderRadius:[7,7,0,0],color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'#2fcef0'},{offset:1,color:'#126bd2'}]}}}]}} as Panel);
  const percentage=values.filter(d=>['%','porcentaje','por ciento'].includes(units(d))&&d.valor>=0&&d.valor<=100).slice(0,4);
  if(percentage.length){
   result.push({id:'percent',title:'Medidores de cobertura',subtitle:'Cada porcentaje conserva su propio universo de referencia',label:'PORCENTAJE',rows:percentage,source:percentage[0].fuente,option:{animation:!reduced,tooltip:{trigger:'item',formatter:'{b}: {c}%'},series:percentage.map((d,i)=>({name:d.nombre,type:'gauge',startAngle:225,endAngle:-45,min:0,max:100,radius:'85%',center:[(i%2)*45+27.5+'%',Math.floor(i/2)*46+28+'%'],progress:{show:true,width:10,itemStyle:{color:palette[i]}},axisLine:{lineStyle:{width:10,color:[[1,'#e5eff4']]}},axisTick:{show:false},splitLine:{show:false},axisLabel:{show:false},pointer:{show:false},title:{show:true,offsetCenter:[0,'57%'],fontSize:9,color:'#506f86',overflow:'truncate',width:125},detail:{fontSize:19,fontWeight:'bold',color:'#164567',formatter:'{value}%',offsetCenter:[0,'10%']},data:[{value:d.valor,name:d.nombre.length>21?d.nombre.slice(0,20)+'…':d.nombre}]}))}} as Panel);
  }else{const sourcesData=sources.length?sources:sectorCounts;result.push({id:'percent',title:'Procedencia de los datos',subtitle:'Registros por fuente · no es distribución poblacional',label:'FUENTES',rows:[],source:'Catálogo documental',option:{animation:!reduced,color:palette,tooltip:{trigger:'item'},series:[{type:'pie',radius:['48%','76%'],center:['50%','46%'],label:{show:false},data:sourcesData.map(([name,value])=>({name,value}))}]}} as Panel)}
  const blocks=compare.filter(d=>d.valor>=0).slice(0,12);const blockData=blocks.length>=3?blocks.map((d,i)=>({name:d.nombre,value:d.valor,itemStyle:{color:palette[i%palette.length]}})):sectorCounts.map(([name,value],i)=>({name,value,itemStyle:{color:palette[i%palette.length]}}));
  result.push({id:'areas',title:'Mapa visual de magnitudes',subtitle:blocks.length>=3?'Área relativa · '+compare[0].unidad+' · '+latest:'Tamaño relativo de los grupos de registros',label:'RELACIONES',rows:blocks.length>=3?blocks:[],source:blocks[0]?.fuente||'Catálogo estadístico',option:{animation:!reduced,tooltip:{trigger:'item'},series:[{type:'treemap',left:'3%',right:'3%',top:'6%',bottom:'6%',roam:false,visibleMin:0,itemStyle:{borderRadius:8,borderColor:'#fff',borderWidth:3},label:{color:'#fff',fontWeight:'bold',fontSize:11,overflow:'truncate'},data:blockData}]}} as Panel);
  const multiple=histories.slice(0,4);const years=[...new Set(multiple.flatMap(h=>h.map(d=>String(d.anio))))].sort();
  if(multiple.length>=2)result.push({id:'index',title:'Historias en paralelo',subtitle:'Series indexadas: primera vigencia de cada indicador = 100',label:'CAMBIOS',rows:[],source:'Series documentadas, cálculo reproducible',option:{...base,color:palette,tooltip:{trigger:'axis'},legend:{bottom:0,type:'scroll',textStyle:{fontSize:9,color:'#587890'}},grid:{left:45,right:20,top:20,bottom:78},xAxis:{type:'category',data:years,...xStyle},yAxis:{type:'value',...yStyle},series:multiple.map(h=>({name:h[0].nombre,type:'line',smooth:true,showSymbol:false,data:years.map(y=>{const d=h.find(x=>String(x.anio)===y);return d&&h[0].valor!==0?Math.round(d.valor/h[0].valor*10000)/100:null})}))}} as Panel);
  else result.push({id:'index',title:'Cobertura de la información',subtitle:'Cantidad de registros en las diferentes vigencias',label:'VIGENCIAS',rows:[],source:'Catálogo de registros',option:{...base,grid:{left:48,right:20,top:22,bottom:44},xAxis:{type:'category',data:yearCounts.map(x=>x[0]),...xStyle},yAxis:{type:'value',...yStyle},series:[{type:'bar',data:yearCounts.map(x=>x[1]),barMaxWidth:34,itemStyle:{color:'#6b65c9',borderRadius:[7,7,0,0]}}]}} as Panel);
  return result;
 },[datos,reduced]);
 return <section className="n5-chart-wall"><div className="n5-gallery-title"><div><span className="g4-eyebrow">PANEL PRINCIPAL · CINCO GRÁFICAS ESTABLES</span><h2>{title}</h2><p>Selecciona un tema y las cinco vistas se actualizarán sin cambiar de posición.</p></div><span>5 visualizaciones</span></div><div className="n5-five-grid">{panels.map((panel,i)=><motion.article className={'g4-chart-card n5-data-panel n5-panel-'+i} key={panel.id} layout transition={{layout:{type:'spring',stiffness:260,damping:29}}}><header><div><span className="g4-eyebrow">{panel.label}</span><h3>{panel.title}</h3><p>{panel.subtitle}</p></div><span className="g4-chart-orb">{i===0?<TrendingUp size={21}/>:i===1?<BarChart3 size={21}/>:i===2?<Activity size={21}/>:i===3?<Layers3 size={21}/>:<PieIcon size={21}/>}</span></header><ChartFrame option={panel.option} onPick={index=>{const d=panel.rows[index];if(d)onOpen(d)}}/><footer><span><Info size={13}/>{panel.source}</span><button onClick={()=>{if(panel.rows[0])onOpen(panel.rows[0]);else document.getElementById('xp-lab')?.scrollIntoView({behavior:'smooth'})}}>Detalles <ArrowUpRight size={15}/></button></footer></motion.article>)}</div></section>
}
