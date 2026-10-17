'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {indicadoresICET} from '@/lib/icetCatalog';
import {AlertTriangle,ArrowLeft,CheckCircle2,Download,Search,SlidersHorizontal} from 'lucide-react';
type EstadoFiltro='todos'|'pendiente';
export default function ICETPage(){
 const [query,setQuery]=useState('');const [area,setArea]=useState('todas');
 const [dependencia,setDependencia]=useState('todas');const [expandido,setExpandido]=useState<string|null>(null);
 const areas=['todas',...new Set(indicadoresICET.map(x=>x.area))];
 const dependencias=['todas',...new Set(indicadoresICET.map(x=>x.secretaria))];
 const list=useMemo(()=>indicadoresICET.filter(i=> (area==='todas'||i.area===area)&&(dependencia==='todas'||i.secretaria===dependencia)&& (i.nombre.toLowerCase().includes(query.toLowerCase())||String(i.numero)===query||i.codigo.toLowerCase()===query.toLowerCase())),[query,area,dependencia]);
 function downloadCsv(){
  const lines=[['Código','Número','Indicador','Área','Dependencia propuesta','Estado 2025','Dato 2025','Variables requeridas'],...list.map(i=>[i.codigo,i.numero,i.nombre,i.area,i.secretaria,i.estado,'',i.campos.join(' | ')])];
  const csv=lines.map(row=>row.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='catalogo-icet-san-pedro-2025.csv';a.click();URL.revokeObjectURL(url);
 }
 return <main style={{maxWidth:1200,margin:'auto',padding:'35px 22px',color:'#193350'}}>
 <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:8,color:'#0b68d3',fontWeight:700}}><ArrowLeft size={16}/> Volver al observatorio</Link>
 <div style={{marginTop:32,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}><div><p style={{color:'#1269d9',fontSize:12,fontWeight:800,letterSpacing:2}}>MÓDULO ESTADÍSTICO OFICIAL</p><h1 style={{fontSize:'clamp(27px,3vw,42px)',margin:'8px 0'}}>Catálogo ICET / DANE · 2025</h1><p style={{color:'#71869f',maxWidth:690,lineHeight:1.7}}>Todos los 66 indicadores del cuestionario están estructurados como solicitudes de información. La ausencia de información no significa cero ni indica por sí sola indisponibilidad en el portal municipal.</p></div><button onClick={downloadCsv} style={{display:'flex',gap:9,alignItems:'center',padding:'12px 18px',border:0,borderRadius:10,background:'#0966d4',color:'white',fontWeight:700}}><Download size={16}/> Exportar pendientes</button></div>
 <div style={{background:'#eef5ff',padding:18,borderRadius:12,margin:'22px 0',display:'flex',gap:13,alignItems:'start'}}><AlertTriangle color="#266ec1" size={22}/><div><strong>Instrumento de recopilación, no formulario DANE presentado.</strong><p style={{color:'#5e7594',lineHeight:1.6,margin:'5px 0 0'}}>Los valores asociados deben comprobar vigencia 2025, definición, nivel territorial, fuente y publicación municipal si posteriormente se responde el cuestionario de disponibilidad. No se asignan valores por similitud semántica.</p></div></div>
 <div style={{display:'flex',flexWrap:'wrap',gap:12,margin:'24px 0'}}><label style={{display:'flex',alignItems:'center',gap:9,background:'white',border:'1px solid #dce6f1',padding:'11px 13px',borderRadius:10,flex:'2 1 230px'}}><Search size={16}/><input aria-label="Buscar indicador" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nombre o número..." style={{border:0,outline:0,width:'100%',background:'transparent'}}/></label><label style={{display:'flex',alignItems:'center',gap:9,background:'white',border:'1px solid #dce6f1',padding:'11px 13px',borderRadius:10,flex:'1 1 190px'}}><SlidersHorizontal size={16}/><select aria-label="Área" value={area} onChange={e=>setArea(e.target.value)} style={{border:0,width:'100%',background:'transparent'}}>{areas.map(x=><option key={x} value={x}>{x==='todas'?'Todas las áreas':x}</option>)}</select></label><select aria-label="Dependencia" value={dependencia} onChange={e=>setDependencia(e.target.value)} style={{flex:'1 1 210px',border:'1px solid #dce6f1',padding:12,borderRadius:10,background:'white'}}>{dependencias.map(x=><option key={x} value={x}>{x==='todas'?'Todas las dependencias':x}</option>)}</select></div>
 <div style={{display:'flex',justifyContent:'space-between',marginBottom:14,color:'#71869f',fontSize:12}}><strong>{list.length} de 66 indicadores</strong><span>DIVIPOLA 76670</span></div>
 <div style={{display:'grid',gap:10}}>{list.map(i=><article key={i.codigo} style={{background:'white',border:'1px solid #e4ebf4',borderRadius:13,padding:'18px 20px'}}>
 <button onClick={()=>setExpandido(expandido===i.codigo?null:i.codigo)} aria-expanded={expandido===i.codigo} style={{width:'100%',background:'transparent',border:0,textAlign:'left',display:'flex',gap:14,alignItems:'flex-start'}}>
 <span style={{borderRadius:10,background:'#eaf3ff',padding:'9px 11px',fontWeight:800,color:'#0966cf'}}>{i.numero}</span>
 <span style={{flex:1}}><strong style={{fontSize:14,lineHeight:1.5,display:'block'}}>{i.nombre}</strong><small style={{fontSize:11,color:'#7890a8',lineHeight:1.8}}>{i.area} · {i.secretaria}</small></span><span style={{fontSize:10,color:'#b3750e',whiteSpace:'nowrap',background:'#fff7e9',padding:'7px 9px',borderRadius:7}}>Dato por verificar</span>
 </button>{expandido===i.codigo&&<div style={{borderTop:'1px solid #edf1f8',marginTop:14,paddingTop:14}}><p style={{fontSize:11,color:'#657a92'}}>Cantidades y variables que debe suministrar la dependencia:</p><ul style={{paddingLeft:22,lineHeight:2}}>{i.campos.map(v=><li key={v}>{v}</li>)}</ul><p style={{fontSize:11,color:'#59708a'}}>Entidades de consulta: {i.fuentesPropuestas.join(' · ')}</p><p style={{color:'#a16c0e',fontSize:11}}>Hasta recibir fuente oficial y numeradores, valor 2025 = pendiente (nunca 0).</p></div>}</article>)}</div>
 <div style={{padding:'35px 0',color:'#8498ad',fontSize:12}}>Asignación por dependencia: preliminar; la Secretaría de Planeación debe ratificarla contra el organigrama.</div>
 </main>;
}
