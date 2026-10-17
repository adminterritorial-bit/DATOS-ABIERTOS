'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {ArrowUpRight,BarChart3,ChartColumnIncreasing,ChartNetwork,ChartPie,ChartSpline,Grid2x2,Info,Activity} from 'lucide-react';
import type {DatoExplorador} from '@/lib/territorialDataset';
import * as echarts from 'echarts/core';
import {LineChart,BarChart,PieChart,ScatterChart,TreemapChart} from 'echarts/charts';
import {GridComponent,TooltipComponent,LegendComponent,DataZoomComponent} from 'echarts/components';
import {SVGRenderer} from 'echarts/renderers';
echarts.use([LineChart,BarChart,PieChart,ScatterChart,TreemapChart,GridComponent,TooltipComponent,LegendComponent,DataZoomComponent,SVGRenderer]);
type Option=echarts.EChartsCoreOption;
const COLOR=['#21b99b','#368af0','#8267c8','#f6aa54','#d36e89','#24acc7','#89b25f'];
const nf=(n:number)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(n);
function Plot({option,onSelect}:{option:Option;onSelect?:(index:number)=>void}){
 const ref=useRef<HTMLDivElement>(null);const onSelectRef=useRef(onSelect);
 useEffect(()=>{onSelectRef.current=onSelect},[onSelect]);
 useEffect(()=>{
  if(!ref.current)return;
  const chart=echarts.init(ref.current,null,{renderer:'svg'});
  chart.setOption(option,true);
  const handler=(e:{dataIndex?:number})=>{if(typeof e.dataIndex==='number')onSelectRef.current?.(e.dataIndex)};
  chart.on('click',handler);
  const resize=new ResizeObserver(()=>chart.resize());resize.observe(ref.current);
  return ()=>{resize.disconnect();chart.off('click',handler);chart.dispose()};
 },[option]);
 return <div className="g4-ecplot" ref={ref}/>;
}
interface Panel{title:string;subtitle:string;type:string;option:Option;source:string;point?:DatoExplorador[]}
function seriesOf(data:DatoExplorador[],reg:RegExp){
 const candidates=data.filter(d=>reg.test((d.nombre+' '+d.sector).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase())&&Number.isFinite(d.valor));
 const bySeries=new Map<string,DatoExplorador[]>();
 for(const d of candidates){const key=d.nombre+'|'+d.unidad;bySeries.set(key,[...(bySeries.get(key)||[]),d])}
 return [...bySeries.values()].map(rows=>[...new Map(rows.map(x=>[x.anio,x])).values()].sort((a,b)=>a.anio-b.anio)).filter(r=>r.length>=2).sort((a,b)=>b.length-a.length);
}
function latestSameUnit(data:DatoExplorador[],reg:RegExp){
 const candidates=data.filter(d=>reg.test((d.nombre+' '+d.sector).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()));
 const units=new Map<string,DatoExplorador[]>();
 for(const d of candidates){const key=d.unidad+'|'+d.anio;units.set(key,[...(units.get(key)||[]),d])}
 const g=[...units.values()].sort((a,b)=>b.length-a.length)[0]||[];
 return [...new Map(g.map(x=>[x.nombre,x])).values()].sort((a,b)=>b.valor-a.valor).slice(0,8);
}
export default function ChartWall({datos,onOpen}:{datos:DatoExplorador[];onOpen:(record:DatoExplorador)=>void}){
 const reduced=useReducedMotion();
 const panels=useMemo(()=>{
  const rows=datos.filter(d=>(d.clase==='Publicado'||d.clase==='Calculado')&&d.anio>=2000&&Number.isFinite(d.valor));
  const output:Panel[]=[];
  const topics=[
   {re:/poblacion|demografia|habitantes/,title:'La población a través de los años',sector:'Población'},
   {re:/educacion|matricula|colegio|desercion/,title:'El pulso de la educación',sector:'Educación'},
   {re:/homicidio|hurto|violencia|seguridad/,title:'Convivencia en perspectiva',sector:'Seguridad'},
   {re:/salud|vacun|afiliaci|morbilidad|mortalidad/,title:'Salud y bienestar',sector:'Salud'}
  ];
  for(const t of topics){
   const series=seriesOf(rows,t.re)[0];
   if(series){
    output.push({title:t.title,subtitle:series[0].nombre+' · '+series[0].unidad,type:'TENDENCIA',source:series[series.length-1].fuente,point:series,
     option:{color:[COLOR[0]],animation:!reduced,animationDuration:1150,tooltip:{trigger:'axis',valueFormatter:(v:unknown)=>nf(Number(v))+' '+series[0].unidad},
      grid:{left:62,right:23,top:26,bottom:41},
      xAxis:{type:'category',data:series.map(d=>String(d.anio)),axisLine:{show:false},axisTick:{show:false},axisLabel:{color:'#8397b1',fontSize:10}},
      yAxis:{type:'value',scale:true,axisLine:{show:false},splitLine:{lineStyle:{color:'#eaf0f8',type:'dashed'}},axisLabel:{color:'#8397b1',fontSize:10}},
      series:[{type:'line',smooth:true,data:series.map(d=>d.valor),symbol:'circle',symbolSize:8,lineStyle:{width:4,color:'#20b99b'},itemStyle:{color:'#1ca18b'},areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'rgba(27,188,155,.36)'},{offset:1,color:'rgba(27,188,155,0)'}]}}}]}} as Panel);
   }else{
    const same=latestSameUnit(rows,t.re);
    if(same.length>=2)output.push({title:t.title,subtitle:'Comparación de '+same[0].unidad+' · '+same[0].anio,type:'COMPARACIÓN',source:same[0].fuente,point:same,
     option:{animation:!reduced,animationDuration:900,tooltip:{trigger:'axis'},grid:{left:26,right:24,top:15,bottom:100},xAxis:{type:'category',data:same.map(d=>d.nombre.length>17?d.nombre.slice(0,16)+'…':d.nombre),axisLabel:{rotate:32,fontSize:9,color:'#8198af'},axisTick:{show:false}},yAxis:{type:'value',splitLine:{lineStyle:{color:'#eef3f9'}}},series:[{type:'bar',data:same.map(d=>d.valor),barMaxWidth:25,itemStyle:{borderRadius:[8,8,0,0],color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'#2bc9ac'},{offset:1,color:'#3688e8'}]}}}]}} as Panel);
   }
  }
  const sectors=new Map<string,number>();for(const d of rows){sectors.set(d.sector,(sectors.get(d.sector)||0)+1)}
  const sectorCount=[...sectors].sort((a,b)=>b[1]-a[1]).slice(0,9);
  if(sectorCount.length>1)output.push({title:'El universo de nuestros datos',subtitle:'Distribución de registros disponibles por sector, no de personas',type:'COBERTURA ESTADÍSTICA',source:'Catálogo estadístico municipal',option:{
   animation:!reduced,animationDuration:1000,tooltip:{trigger:'item',formatter:'{b}: {c} registros ({d}%)'},legend:{type:'scroll',bottom:0,orient:'horizontal',textStyle:{color:'#647d97',fontSize:10}},
   color:COLOR,series:[{type:'pie',radius:['49%','73%'],center:['50%','43%'],itemStyle:{borderRadius:8,borderColor:'#fff',borderWidth:3},label:{show:false},data:sectorCount.map(([name,value])=>({name,value}))}]}} as Panel);
  const units=new Map<string,DatoExplorador[]>();for(const d of rows){const key=d.unidad+'|'+d.anio;units.set(key,[...(units.get(key)||[]),d])}
  const treemapData=[...units.values()].filter(g=>g.length>=6).sort((a,b)=>b.length-a.length)[0]?.filter(x=>x.valor>0).slice(0,16)||[];
  if(treemapData.length>=5)output.push({title:'Explora las magnitudes',subtitle:'Rectángulos proporcionales · misma unidad y vigencia',type:'MAPA DE ÁREAS',source:treemapData[0].fuente,point:treemapData,option:{
   color:COLOR,animation:!reduced,tooltip:{formatter:(p:any)=>p.name+'<br/>'+nf(p.value)+' '+treemapData[0].unidad},
   series:[{type:'treemap',width:'94%',height:'86%',left:'3%',top:'4%',roam:false,leafDepth:1,visibleMin:0,itemStyle:{borderColor:'#fff',borderWidth:3,borderRadius:7},label:{fontSize:10,overflow:'truncate'},data:treemapData.map((d,i)=>({name:d.nombre,value:d.valor,itemStyle:{color:COLOR[i%COLOR.length]}}))}]}} as Panel);
  const repeat=seriesOf(rows,/./).filter(s=>s.length>=4).slice(0,3);
  if(repeat.length>=2){
   const names=repeat.map(s=>s[0].nombre);
   output.push({title:'Series en paralelo',subtitle:'Comportamiento indexado (primer año = 100) · sin sumar unidades',type:'ÍNDICES NORMALIZADOS',source:'Series públicas del Observatorio',point:[],option:{
    animation:!reduced,tooltip:{trigger:'axis'},color:COLOR,legend:{data:names,bottom:0,textStyle:{color:'#6b86a2',fontSize:10}},
    grid:{left:48,right:16,top:19,bottom:61},xAxis:{type:'category',data:[...new Set(repeat.flatMap(s=>s.map(d=>String(d.anio))))].sort(),axisLabel:{color:'#7593ad'}},
    yAxis:{type:'value',axisLabel:{color:'#7593ad'},splitLine:{lineStyle:{color:'#e7eff9'}}},
    series:repeat.map(s=>({name:s[0].nombre,type:'line',smooth:true,showSymbol:false,lineStyle:{width:3},data:[...new Set(repeat.flatMap(s=>s.map(d=>String(d.anio))))].sort().map(y=>{const d=s.find(x=>String(x.anio)===y);return d&&s[0].valor!==0?Math.round(d.valor/s[0].valor*1000)/10:null})}))}} as Panel);
  }
  return output;
 },[datos,reduced]);
 if(!panels.length)return null;
 return <section className="g4-chart-wall"><div className="g4-gallery-heading"><div><span className="g4-eyebrow">EL MUNICIPIO EN VISUALIZACIONES</span><h2>No son solo números. Son historias que puedes explorar.</h2><p>Distintas representaciones de los registros existentes, cada una respetando unidades, fuente y vigencia.</p></div><span>{panels.length} vistas abiertas</span></div><div className="g4-chart-grid">{panels.map((p,i)=><motion.article key={p.title} className="g4-chart-card" initial={false} animate={{opacity:1,y:0}} transition={{duration:.45,delay:Math.min(i*.08,.3)}} whileHover={reduced?{}:{y:-4}}><header><div><span className="g4-eyebrow">{p.type}</span><h3>{p.title}</h3><p>{p.subtitle}</p></div><span className="g4-chart-orb"><ChartSpline size={22}/></span></header><Plot option={p.option} onSelect={index=>{const row=p.point?.[index];if(row)onOpen(row)}}/><footer><span title={p.source}><Info size={13}/>{p.source}</span><button onClick={()=>{const first=p.point?.[p.point.length-1];if(first)onOpen(first);else document.querySelector('#xp-lab')?.scrollIntoView({behavior:'smooth'})}}>Explorar <ArrowUpRight size={15}/></button></footer></motion.article>)}</div></section>;
}
