'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,FileCheck2,Users,Map,Database,TrendingUp} from 'lucide-react';
import {poblacionDane,fuentePoblacionDane} from '@/lib/danePopulation';
type Serie='total'|'cabecera'|'rural';
const labels:Record<Serie,string>={total:'Población total',cabecera:'Cabecera municipal',rural:'Centros poblados y rural disperso'};
const format=(n:number)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(n);
export default function PoblacionDanePage(){
 const [serie,setSerie]=useState<Serie>('total'); const [anio,setAnio]=useState(2025);
 const dato=poblacionDane.find(x=>x.anio===anio)||poblacionDane[7];
 const years=[...poblacionDane];
 const chart=useMemo(()=>{
  const min=Math.floor(Math.min(...years.map(r=>r[serie]))/1000)*1000;
  const max=Math.ceil(Math.max(...years.map(r=>r[serie]))/1000)*1000;
  const x=(i:number)=>52+i*(734/(years.length-1));const y=(v:number)=>230-(v-min)/(max-min)*188;
  const points=years.map((r,i)=>`${x(i).toFixed(2)},${y(r[serie]).toFixed(2)}`).join(' ');
  return {min,max,x,y,points};
 },[serie]);
 const labelTitle='DANE · Población municipal por área';
 const cardStyle:React.CSSProperties={background:'#fff',padding:22,borderRadius:14,border:'1px solid #e8edf5'};
 return <main style={{maxWidth:1250,margin:'auto',padding:'32px 22px 50px',color:'#193554'}}>
 <Link href="/" style={{display:'inline-flex',gap:8,alignItems:'center',color:'#0667cf',fontWeight:700}}><ArrowLeft size={16}/> Observatorio</Link>
 <section style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:25,alignItems:'center',marginTop:30}}>
 <div><p style={{fontSize:10,fontWeight:800,letterSpacing:2,color:'#0769d6'}}>DEMOGRAFÍA · DIVIPOLA 76670</p><h1 style={{fontSize:'clamp(28px,4vw,43px)',margin:'8px 0 10px',letterSpacing:'-1.2px'}}>San Pedro, población por área</h1><p style={{color:'#7790a8',maxWidth:650,lineHeight:1.7}}>Proyecciones oficiales del DANE para 2018–2042, desagregadas entre cabecera y centros poblados con rural disperso. Los años futuros son proyecciones, no hechos censados.</p></div>
 <label style={{fontSize:12,color:'#546f88',fontWeight:700}}>Vigencia analizada
 <select aria-label="Año de la población" value={anio} onChange={e=>setAnio(Number(e.target.value))} style={{display:'block',background:'white',marginTop:9,padding:'12px 18px',border:'1px solid #dbe6f3',borderRadius:10,minWidth:160}}>{poblacionDane.map(x=><option key={x.anio} value={x.anio}>{x.anio}{x.anio>2025?' · proyección futura':''}</option>)}</select>
 </label></section>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,margin:'23px 0'}}>
 {([{titulo:'Población total',val:dato.total,Icon:Users},{titulo:'Cabecera municipal',val:dato.cabecera,Icon:Map},{titulo:'Centros poblados y rural disperso',val:dato.rural,Icon:Database}]).map(x=><article key={x.titulo} style={cardStyle}><span style={{display:'flex',justifyContent:'space-between',gap:10,color:'#7690aa',fontSize:11,fontWeight:700}}>{x.titulo}<x.Icon size={17} color="#0869d7"/></span><strong style={{display:'block',fontSize:33,fontWeight:800,letterSpacing:'-1px',margin:'13px 0 5px'}}>{format(x.val)}</strong><small style={{color:'#8fa0b4'}}>Personas · {anio}{anio>2025?' · proyección':''}</small></article>)}
 </div>
 <section style={{...cardStyle,marginTop:18}}>
 <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:20}}>
  <div><p style={{fontSize:10,color:'#0871df',letterSpacing:1.4,fontWeight:800}}>SERIE DEMOGRÁFICA</p><h2 style={{fontSize:20,margin:'6px 0 4px'}}>Evolución de la población proyectada</h2><small style={{color:'#8da3b8'}}>Cada punto es una vigencia del libro oficial del DANE</small></div>
  <div style={{display:'flex',flexWrap:'wrap',gap:7}}>{(Object.keys(labels) as Serie[]).map(key=><button key={key} onClick={()=>setSerie(key)} style={{padding:'10px 12px',borderRadius:9,border:'1px solid #dce7f4',background:serie===key?'#076bd8':'#f4f8ff',color:serie===key?'#fff':'#436486',fontWeight:700,fontSize:10}}>{labels[key]}</button>)}</div>
 </div>
 <div style={{overflowX:'auto',marginTop:25}}><svg viewBox="0 0 820 280" role="img" aria-label={'Gráfico anual de '+labels[serie]+' entre 2018 y 2042'} style={{width:'100%',minWidth:500}}>
 {Array.from({length:5},(_,i)=>{const n=chart.min+(chart.max-chart.min)*i/4;const y=chart.y(n);return <g key={i}><line x1="52" x2="786" y1={y} y2={y} stroke="#e9eff6"/><text x="43" y={y+4} fontSize="10" textAnchor="end" fill="#7d91a8">{format(n)}</text></g>})}
 <polyline points={chart.points} fill="none" stroke="#0b6edc" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round"/>
 {years.filter(x=>x.anio===anio).map(r=>{const i=years.findIndex(x=>x.anio===r.anio);return <g key={r.anio}><circle cx={chart.x(i)} cy={chart.y(r[serie])} r="7" fill="#fff" stroke="#075fce" strokeWidth="4"/><text x={chart.x(i)} y={chart.y(r[serie])-17} textAnchor="middle" fontSize="12" fill="#075fce" fontWeight="700">{format(r[serie])}</text></g>})}
 {years.filter(x=>[2018,2022,2025,2030,2035,2042].includes(x.anio)).map(r=><text key={r.anio} x={chart.x(years.findIndex(z=>z.anio===r.anio))} y="257" textAnchor="middle" fontSize="11" fill="#7d91a8">{r.anio}</text>)}
 </svg></div><p style={{fontSize:11,color:'#8195a9',margin:0,lineHeight:1.7}}>La serie está expresada en personas. Comparar población total y subáreas dentro del mismo año es válido, pero no debe interpretarse como variación causal ni como cifra censada.</p>
 </section>
 <section style={{...cardStyle,marginTop:20,overflowX:'auto'}}><h2 style={{fontSize:19,marginTop:0}}>Serie anual disponible</h2><table style={{width:'100%',borderCollapse:'collapse',minWidth:570}}><thead><tr style={{background:'#edf5ff'}}>{['Año','Total','Cabecera','Centros poblados y rural disperso','Condición'].map(x=><th key={x} style={{padding:'12px',fontSize:11,textAlign:'left'}}>{x}</th>)}</tr></thead><tbody>{poblacionDane.map(x=><tr key={x.anio} style={{background:x.anio===anio?'#f0f7ff':'transparent'}}><td style={{padding:'10px 12px',borderBottom:'1px solid #edf1f6',fontWeight:800}}>{x.anio}</td>{[x.total,x.cabecera,x.rural].map((v,i)=><td key={i} style={{padding:'10px 12px',borderBottom:'1px solid #edf1f6',fontSize:12}}>{format(v)}</td>)}<td style={{padding:'10px 12px',borderBottom:'1px solid #edf1f6',fontSize:11,color:'#8295ad'}}>{x.anio>2025?'Proyección futura':'Proyección histórica'}</td></tr>)}</tbody></table></section>
 <div style={{...cardStyle,marginTop:20,display:'flex',gap:14,alignItems:'start'}}><FileCheck2 size={23} color="#0969d6"/><div><strong>Origen primario verificado</strong><p style={{fontSize:12,lineHeight:1.7,color:'#6d849c'}}>{labelTitle}. Libro PPED-AreaMun-2018-2042_VP.xlsx, hoja PobMunicipalxÁrea, publicado el 8 de agosto de 2025. Filtrado por DIVIPOLA 76670 (no 70717, San Pedro en Sucre).</p><a href={fuentePoblacionDane.url} target="_blank" rel="noopener noreferrer" style={{color:'#0866d2',fontWeight:800,fontSize:12,display:'inline-flex',alignItems:'center',gap:5}}>Consultar archivo oficial del DANE <ArrowUpRight size={14}/></a></div></div>
 </main>;
}
