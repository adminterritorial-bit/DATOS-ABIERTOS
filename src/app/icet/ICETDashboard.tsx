'use client';

import {useMemo,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowDownToLine,ArrowLeft,ArrowRight,BookOpen,CalendarDays,ChartColumnIncreasing,ChevronDown,Database,ExternalLink,FileText,Filter,Info,MapPinned,Search,ShieldCheck,TrendingUp,Users,X} from 'lucide-react';
import {indicadoresICET} from '@/lib/icetCatalog';
import {recetasEstimacion} from '@/lib/recetasEstimacion';
import {ICET_DIRECTAS as DIRECTAS,ICET_RELACIONADAS as RELACIONADAS,ICET_VINCULOS as VINCULOS,ICET_ESCENARIOS as ESCENARIOS} from '@/lib/icetVinculos';
import {observacionesTerriData, type ObservacionTerritorial} from '@/lib/terriDataExpanded';
import {observacionesDocumentales,observacionesDocumentalesConAnio} from '@/lib/observacionesDocumentales2026';
import {observacionesExternas} from '@/lib/observacionesFuentesExternas';
import {indicadoresCalculados} from '@/lib/indicadoresCalculados';
import {observacionesINS} from '@/lib/observacionesINS';
import {observacionesDaneMortalidad} from '@/lib/observacionesDaneMortalidad';
import {estimacionesMunicipales} from '@/lib/estimacionesMunicipales';
import datosMasivos from '@/data/fuentesMasivas76670.json';
import './icet-dashboard.css';
type DatoVisual=ObservacionTerritorial & {nota?:string};

const fuenteDocumental=observacionesDocumentalesConAnio.map(r=>({
 id:r.id,titulo:r.nombre,sector:r.sector,valor:r.valor,unidad:r.unidad,
 anio:r.anio,pagina:r.pagina,fuente:r.fuente,divipola:'76670',
 estado:'DOCUMENTADO_EN_ARCHIVO',fechaGeneracion:r.periodo
}));
const externals=[...observacionesExternas,...indicadoresCalculados,...observacionesINS,...observacionesDaneMortalidad,...estimacionesMunicipales].filter(x=>x.anio!==null).map(x=>({id:x.id,titulo:x.nombre,sector:x.sector,valor:x.valor,unidad:x.unidad,anio:x.anio as number,pagina:x.pagina,fuente:x.fuente,divipola:'76670',estado:x.id.startsWith('EST-')?'ESTIMACION_EXPLORATORIA':'FUENTE_OFICIAL',fechaGeneracion:x.periodo,nota:x.nota}));
const basemasiva:DatoVisual[]=datosMasivos.observaciones
 .filter(r=>r.divipola==='76670'&&typeof r.anio==='number'&&Number.isFinite(r.valor))
 .map(r=>({id:r.id,titulo:r.nombre,sector:r.sector,valor:r.valor,unidad:r.unidad,
  anio:r.anio as number,pagina:0,fuente:r.fuente,divipola:'76670',
  estado:r.metodo,fechaGeneracion:'Registro de fuente pública',nota:r.nota}));
const OBS:DatoVisual[]=Array.from(new Map([...observacionesTerriData,...fuenteDocumental,...externals,...basemasiva]
 .filter(d=>d.divipola==='76670'&&Number.isFinite(d.valor)).map(d=>[d.id,d] as const)).values());
const ASOCIADOS=indicadoresICET.flatMap(i=>{
 const d=OBS.find(row=>row.id===VINCULOS[i.numero]);
 return d?[{indicador:i,observacion:d}]:[];
});
const SECTORES=['Todos',...new Set(OBS.map(o=>o.sector))].sort((a,b)=>a==='Todos'?-1:b==='Todos'?1:a.localeCompare(b,'es'));
const ANIOS=['Todos',...new Set(OBS.map(o=>String(o.anio)))].sort((a,b)=>a==='Todos'?-1:b==='Todos'?1:Number(b)-Number(a));
const N=(x:number,n=1)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:n}).format(x);
function salidaCsv(rows:ObservacionTerritorial[],nombre:string){
 const cols=['id','titulo','sector','valor','unidad','anio','fuente','pagina','divipola'];
 const clean=(s:unknown)=>{let v=String(s??'');if(/^[\s]*[=+@\-]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"';};
 const output=[cols.map(clean).join(';'),...rows.map(r=>cols.map(c=>clean(r[c as keyof ObservacionTerritorial])).join(';'))].join('\r\n');
 const blob=new Blob(['\uFEFF'+output],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob);
 const el=document.createElement('a');el.href=url;el.download=nombre;el.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const colores=['#2679ea','#48b9bd','#8367e4','#e8a65e','#22a77d','#5a91e4'];
export default function ICETDashboard(){
 const [sector,setSector]=useState('Todos');
 const [anio,setAnio]=useState('Todos');
 const [busqueda,setBusqueda]=useState('');
 const [soloCifras,setSoloCifras]=useState(false);
 const [detalle,setDetalle]=useState<DatoVisual|null>(null);
 const [mostrarCatalogo,setMostrarCatalogo]=useState(false);
 const [categoriaICET,setCategoriaICET]=useState('Todas');
 const [qICET,setQICET]=useState('');
 const [indicadorAbierto,setIndicadorAbierto]=useState<number|null>(null);
 const categoriasICET=['Todas',...new Set(indicadoresICET.map(x=>x.area))];
 const datos=useMemo(()=>OBS.filter(r=>(sector==='Todos'||r.sector===sector)&&(anio==='Todos'||String(r.anio)===anio)&&r.titulo.toLocaleLowerCase('es').includes(busqueda.toLocaleLowerCase('es'))),[sector,anio,busqueda]);
 const catalogo=useMemo(()=>indicadoresICET.filter(i=>(categoriaICET==='Todas'||i.area===categoriaICET)&&(!soloCifras||VINCULOS[i.numero])&&(i.nombre.toLocaleLowerCase('es').includes(qICET.toLocaleLowerCase('es'))||String(i.numero)===qICET.trim())),[categoriaICET,qICET,soloCifras]);
 const nDirectos=Object.keys(DIRECTAS).length;
 const nRelacionados=Object.keys(RELACIONADAS).filter(n=>!DIRECTAS[Number(n)]).length;
 const nEstimados=Object.keys(ESCENARIOS).filter(n=>!DIRECTAS[Number(n)]&&!RELACIONADAS[Number(n)]).length;
 const cuentaSector=Object.entries(OBS.reduce<Record<string,number>>((a,x)=>{a[x.sector]=(a[x.sector]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]);
 const cultivos=OBS.filter(r=>r.anio===2025&&r.sector==='Economía'&&((r.unidad==='t')||r.unidad==='toneladas')&&/(cultivo|caña|tomate)/i.test(r.titulo)).sort((a,b)=>b.valor-a.valor);
 const maxCosecha=Math.max(...cultivos.map(x=>x.valor),1);
 const areaUrbana=OBS.find(r=>r.id==='TERRI-009');
 const areaRural=OBS.find(r=>r.id==='TERRI-003');
 const total=OBS.find(r=>r.id==='TERRI-001');
 const urbanPercent=total&&areaUrbana?areaUrbana.valor/total.valor*100:0;
 const destacados=[...ASOCIADOS].sort((a,b)=>a.indicador.numero-b.indicador.numero);
 const sourceLink='https://terridata.dnp.gov.co/';
 const sociales=observacionesDocumentales.filter(d=>d.anio===null);
 return <div className="ci-app">
  <header className="ci-topbar">
   <div className="ci-brand"><Image src="/escudo-san-pedro.png" alt="Identidad institucional de la Alcaldía de San Pedro" width={137} height={60}/><div><strong>OBSERVATORIO <span>SAN PEDRO</span></strong><small>Inteligencia territorial · Valle del Cauca</small></div></div>
   <nav className="ci-toplinks" aria-label="Secciones del observatorio"><Link href="/">Panorama</Link><Link className="ci-active" href="/icet">Indicadores DANE</Link><Link href="/documentos">Documentos</Link><Link href="/pdt">Plan de Desarrollo</Link></nav>
   <Link href="/" className="ci-back"><ArrowLeft size={17}/> Volver</Link>
  </header>
  <main className="ci-container">
   <section className="ci-hero"><div className="ci-hero-copy"><span className="ci-kicker"><span className="ci-pulse"/> INTELIGENCIA ESTADÍSTICA MUNICIPAL</span><h1>Los indicadores cuentan<br/><em>la historia del territorio.</em></h1><p>Explora las cifras recuperadas de San Pedro, consulta las fuentes originales y navega la batería de 66 indicadores de capacidad estadística territorial.</p><div className="ci-hero-actions"><button onClick={()=>document.getElementById('ci-explorador')?.scrollIntoView({behavior:'smooth'})}>Explorar indicadores <ArrowRight size={17}/></button><Link href="/documentos" className="ci-secondary ci-hero-doc-link">Consultar documentos <BookOpen size={16}/></Link></div><div className="ci-hero-meta"><MapPinned size={15}/> Municipio DIVIPOLA 76670 <span/> Datos con año y fuente identificados</div></div><div className="ci-hero-visual" aria-hidden="true"><div className="ci-halo ci-halo-a"/><div className="ci-halo ci-halo-b"/><div className="ci-floating"><span>INFORMACIÓN TERRITORIAL</span><strong>66</strong><small>indicadores en el catálogo ICET</small><div className="ci-float-strip"><span/><span/><span/><span/><span/><span/></div></div></div></section>
   <section className="ci-stats" aria-label="Resumen de información">
    <article className="ci-stat"><div><span>Batería ICET</span><BookOpen size={19}/></div><strong>66</strong><small>Definiciones estadísticas catalogadas</small></article>
    <article className="ci-stat"><div><span>Correspondencias directas</span><ShieldCheck size={19}/></div><strong>{nDirectos}</strong><small>Con cifras documentadas y período real</small></article>
    <article className="ci-stat"><div><span>Observaciones recuperadas</span><Database size={19}/></div><strong>{OBS.length}</strong><small>Registros de la ficha TerriData</small></article>
    <article className="ci-stat"><div><span>Períodos disponibles</span><CalendarDays size={19}/></div><strong>{new Set(OBS.map(x=>x.anio)).size}</strong><small>Años representados en el conjunto</small></article>
   </section>
   <div className="ci-section-title"><div><div className="ci-eyebrow">INDICADORES CON VALOR</div><h2>Una mirada a la evidencia recuperada</h2><p>Estas cifras contienen indicadores ICET y estadísticas relacionadas, cada una con vigencia estadística y metodología consultable.</p></div><span className="ci-count">{ASOCIADOS.length} indicadores con valores asociados ({nDirectos} vinculados, {nRelacionados} relacionados y {nEstimados} escenarios)</span></div>
   <div className="ci-featured">{destacados.map(({indicador,observacion},idx)=><button type="button" key={indicador.numero} className="ci-feature-card" onClick={()=>setDetalle(observacion)}><div className="ci-feature-top"><span>ICET {String(indicador.numero).padStart(2,'0')}{DIRECTAS[indicador.numero]?' · Valor':ESCENARIOS[indicador.numero]?' · Estimación de referencia':' · Dato relacionado'}</span><span className="ci-feature-icon" style={{color:colores[idx%colores.length],background:colores[idx%colores.length]+'16'}}><TrendingUp size={19}/></span></div><h3>{DIRECTAS[indicador.numero]?indicador.nombre:observacion.titulo}</h3><div className="ci-figure">{N(observacion.valor,2)}<small>{observacion.unidad}</small></div><div className="ci-feature-bottom"><span>{observacion.anio} · {DIRECTAS[indicador.numero]?'Indicador':ESCENARIOS[indicador.numero]?'Escenario regional':'Estadística relacionada'}</span><ArrowRight size={16}/></div></button>)}</div>
   <section className="ci-two-col" aria-label="Visualizaciones territoriales">
    <div className="ci-panel"><div className="ci-panel-heading"><div><div className="ci-eyebrow">DEMOGRAFÍA · 2026</div><h3>Composición poblacional</h3><p>Proyección DANE documentada por zona</p></div><Users size={20}/></div>
    {total&&areaUrbana&&areaRural?<div className="ci-pop-layout"><div className="ci-ring" style={{background:`conic-gradient(#1b73e7 0% ${urbanPercent}%,#38bec0 ${urbanPercent}% 100%)`}}><div><strong>{N(total.valor,0)}</strong><small>Habitantes</small></div></div><div className="ci-ring-legend"><div><span className="ci-dot" style={{background:'#1b73e7'}}/> Cabecera <strong>{N(areaUrbana.valor,0)}</strong><small>{N(urbanPercent)} %</small></div><div><span className="ci-dot" style={{background:'#38bec0'}}/> Centros poblados y rural <strong>{N(areaRural.valor,0)}</strong><small>{N(100-urbanPercent)} %</small></div></div></div>:<p>Consulta el catálogo demográfico.</p>}
    <div className="ci-panel-foot">Fuente: ficha TerriData / DANE · proyección 2026</div></div>
    <div className="ci-panel"><div className="ci-panel-heading"><div><div className="ci-eyebrow">COBERTURA DOCUMENTAL</div><h3>Registros por sector</h3><p>Distribución de las observaciones extraídas, no desempeño institucional</p></div><ChartColumnIncreasing size={20}/></div><div className="ci-bars">{cuentaSector.slice(0,7).map(([name,num],i)=><button key={name} onClick={()=>{setSector(name);document.getElementById('ci-explorador')?.scrollIntoView({behavior:'smooth'});}}><span>{name}</span><div className="ci-bar-track"><div style={{width:(num/cuentaSector[0][1]*100)+'%',background:colores[i%colores.length]}}/></div><strong>{num}</strong></button>)}</div><div className="ci-panel-foot">Cada observación conserva su año y documento de origen.</div></div>
   </section>
   {cultivos.length>0&&<section className="ci-panel ci-agro"><div className="ci-panel-heading"><div><div className="ci-eyebrow">PRODUCCIÓN AGRÍCOLA · 2025</div><h3>Cultivos registrados en la ficha territorial</h3><p>Magnitudes documentadas en toneladas. No equivalen a la producción municipal total.</p></div><TrendingUp size={20}/></div><div className="ci-agro-grid">{cultivos.slice(0,6).map((x,i)=><button key={x.id} onClick={()=>setDetalle(x)}><span>{x.titulo.replace(/Primer cultivo (permanente|transitorio) en términos de toneladas producidas/,'Cultivo')}</span><strong>{N(x.valor,1)} <small>t</small></strong><div className="ci-agro-track"><div style={{width:(x.valor/maxCosecha*100)+'%',background:colores[i%colores.length]}}/></div></button>)}</div></section>}
   <section className="ci-panel ci-social"><div className="ci-panel-heading"><div><div className="ci-eyebrow">REGISTRO SOCIAL DE HOGARES · ARCHIVO INSTITUCIONAL</div><h3>Caracterización social del municipio</h3><p>Datos agregados del reporte RSH/SISBÉN; el documento suministrado no consigna fecha de corte.</p></div><Users size={20}/></div><div className="ci-agro-grid">{sociales.map(d=><article key={d.id} className="ci-social-cell"><span>{d.nombre}</span><strong>{N(d.valor,0)} <small>{d.unidad}</small></strong></article>)}</div><div className="ci-panel-foot">Fuente: reporte RUI-SISBEN.pdf, página 1. Indicadores de distintos registros administrativos; no sumar sus universos.</div></section>
   <section className="ci-panel ci-explorer" id="ci-explorador"><div className="ci-panel-heading ci-explorer-head"><div><div className="ci-eyebrow">EXPLORADOR INTERACTIVO</div><h2>Datos del territorio</h2><p>Consulta los registros disponibles sin perder su período ni su fuente.</p></div><button className="ci-download" onClick={()=>salidaCsv(datos,'san-pedro-indicadores-territoriales.csv')} disabled={!datos.length}><ArrowDownToLine size={16}/> Descargar CSV</button></div>
    <div className="ci-filters"><label className="ci-search"><Search size={17}/><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar indicador o tema..." aria-label="Buscar datos"/></label><label className="ci-select"><Filter size={16}/><select aria-label="Sector" value={sector} onChange={e=>setSector(e.target.value)}>{SECTORES.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={16}/></label><label className="ci-select"><CalendarDays size={16}/><select aria-label="Año" value={anio} onChange={e=>setAnio(e.target.value)}>{ANIOS.map(y=><option key={y}>{y}</option>)}</select><ChevronDown size={16}/></label></div>
    <div className="ci-results-count"><span>{datos.length} observaciones con cifras</span><button onClick={()=>{setSector('Todos');setAnio('Todos');setBusqueda('');}}>Restablecer filtros</button></div>
    {datos.length?<div className="ci-data-grid">{datos.map((d,i)=><button className="ci-data-card" key={d.id} onClick={()=>setDetalle(d)}><div className="ci-data-top"><span>{d.sector}</span><span>{d.anio}</span></div><h3>{d.titulo}</h3><div className="ci-data-number">{N(d.valor,2)} <small>{d.unidad}</small></div><div className="ci-data-bottom"><FileText size={14}/>{d.fuente.replace(/\.pdf$/i,'')}<ArrowRight size={15}/></div></button>)}</div>:<div className="ci-no-results">No hay observaciones que coincidan con esos filtros. <button onClick={()=>{setSector('Todos');setAnio('Todos');setBusqueda('');}}>Ver todos los datos</button></div>}
   </section>
   <section id="ci-catalogo" className="ci-panel ci-full-list"><div className="ci-panel-heading ci-catalog-header"><div><div className="ci-eyebrow">BATERÍA DE CAPACIDAD ESTADÍSTICA TERRITORIAL</div><h2>Los 66 indicadores DANE / ICET</h2><p>Catálogo completo del cuestionario, con cifras asociadas donde existe correspondencia exacta.</p></div><button onClick={()=>setMostrarCatalogo(!mostrarCatalogo)} className="ci-toggle">{mostrarCatalogo?'Ocultar lista':'Explorar los 66'} <ChevronDown size={17} style={{transform:mostrarCatalogo?'rotate(180deg)':undefined}}/></button></div>
    {mostrarCatalogo&&<><div className="ci-filters"><label className="ci-search"><Search size={17}/><input value={qICET} onChange={e=>setQICET(e.target.value)} placeholder="Buscar por número o nombre..." aria-label="Buscar indicador ICET"/></label><label className="ci-select"><Filter size={16}/><select aria-label="Área ICET" value={categoriaICET} onChange={e=>setCategoriaICET(e.target.value)}>{categoriasICET.map(x=><option key={x}>{x}</option>)}</select><ChevronDown size={16}/></label><button className={'ci-filter-toggle '+(soloCifras?'ci-filter-selected':'')} onClick={()=>setSoloCifras(!soloCifras)}>{soloCifras?'Ver todos':'Solo con cifras'}</button></div><div className="ci-results-count">{catalogo.length} de 66 indicadores</div><div className="ci-catalog-items">{catalogo.map(i=>{const linked=ASOCIADOS.find(x=>x.indicador.numero===i.numero)?.observacion;return <article key={i.numero} className="ci-catalog-item"><button aria-expanded={indicadorAbierto===i.numero} onClick={()=>setIndicadorAbierto(indicadorAbierto===i.numero?null:i.numero)}><span className="ci-catalog-index">{String(i.numero).padStart(2,'0')}</span><span className="ci-catalog-info"><strong>{i.nombre}</strong><small>{i.area}</small></span>{linked&&<span className="ci-inline-value">{N(linked.valor,2)} <small>{linked.unidad} · {linked.anio}{ESCENARIOS[i.numero]?' · Estimación':!DIRECTAS[i.numero]?' · Relacionado':''}</small></span>}<ChevronDown size={17}/></button>{indicadorAbierto===i.numero&&<div className="ci-catalog-detail">{linked?<p><strong>{linked.titulo}: {N(linked.valor,2)} {linked.unidad}</strong> · {linked.anio}. Fuente: {linked.fuente}, {linked.pagina>0?'página '+linked.pagina:'portal oficial'}.  <button className="ci-text-button" onClick={()=>setDetalle(linked)}>Abrir ficha de origen <ArrowRight size={13}/></button></p>:<p>Definición del indicador disponible en la batería ICET. Consulta las cifras territoriales relacionadas en el explorador superior.</p>}<p>Variables estadísticas: {i.campos.join(' · ')}</p>{recetasEstimacion.some(r=>r.numero===i.numero)&&<p><Link className="ci-text-button" href={'/estimador?icet='+i.numero}>Calcular línea base con componentes oficiales o municipios comparables <ArrowRight size={14}/></Link></p>}</div>}</article>})}</div></>}
   </section>
   <footer className="ci-footer"><span>Observatorio territorial de San Pedro · Valle del Cauca · DIVIPOLA 76670</span><span>Las fuentes mantienen sus vigencias originales. Datos ausentes nunca se sustituyen por cero.</span></footer>
  </main>
  {detalle&&<div className="ci-modal-mask" role="presentation" onClick={()=>setDetalle(null)}><section role="dialog" aria-modal="true" aria-label="Ficha del indicador" className="ci-modal" onClick={e=>e.stopPropagation()}><div className="ci-modal-head"><span>FICHA DE INFORMACIÓN ESTADÍSTICA</span><button aria-label="Cerrar ficha" onClick={()=>setDetalle(null)}><X size={19}/></button></div><h2>{detalle.titulo}</h2><div className="ci-modal-value">{N(detalle.valor,2)} <small>{detalle.unidad}</small></div><div className="ci-modal-meta"><div><small>Vigencia</small><strong>{detalle.anio}</strong></div><div><small>Territorio</small><strong>San Pedro · 76670</strong></div><div><small>Sector</small><strong>{detalle.sector}</strong></div><div><small>Documento</small><strong>{detalle.fuente}</strong></div><div><small>Página</small><strong>{detalle.pagina>0?detalle.pagina:'Página web / conjunto descargable'}</strong></div><div><small>Fecha ficha</small><strong>{detalle.fechaGeneracion}</strong></div></div><p><Info size={16}/> Valor documentado o calculado con las fuentes citadas, respetando su vigencia original.</p>{detalle.nota&&<div className="ci-calculation-note"><strong>Metodología y fórmula</strong><p>{detalle.nota}</p></div>}{(detalle.fuente.toLowerCase().includes('terridata')||detalle.fuente.startsWith('https://'))&&<a className="ci-modal-link" href={detalle.fuente.startsWith('https://')?detalle.fuente:sourceLink} rel="noopener noreferrer" target="_blank">Consultar fuente original <ExternalLink size={15}/></a>}</section></div>}
 </div>;
}
