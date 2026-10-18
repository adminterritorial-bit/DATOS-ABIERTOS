'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {ArrowLeft,ArrowRight,ArrowUpRight,FolderOpen,Search,SlidersHorizontal,X} from 'lucide-react';
import {usePublicFeed} from '@/lib/usePublicFeed';
import {reunirEstadisticas} from '@/lib/territorialDataset';
import type {DatoExplorador} from '@/lib/territorialDataset';
import {macroDimensiones,numeroTema,temasTerritoriales} from '@/lib/territorialTaxonomy';
import CountingValue from './CountingValue';
import ChartWall from './ChartWall';
import SectorDashboard from './SectorDashboard';
import DataProvenance from './DataProvenance';
import {useDialogFocus} from '@/components/useDialogFocus';
const tokens:Record<string,RegExp>={
 ambiente:/ambiente|residuo|recicl|forestal|vertimiento|ecolog|sostenib/,
 suelo:/suelo|catastro|predi|agric|pecuar|cultivo|rural/,
 servicios:/electric|energia|acueducto|alcantarillado|saneamiento|agua potable|servicios publicos/,
 poblacion:/poblacion|habitantes|demogra|natalidad|fecundidad/,
 educacion:/educacion|matricula|estudiante|escolar|colegio|desercion|alfabet/,
 vivienda:/vivienda|deficit|pobreza|hogar/,
 epidemiologia:/epidemiolog|dengue|tubercul|malaria|hepatitis|vih/,
 atencion:/salud|vacuna|afiliaci|medic|embarazo|materna|pediatr/,
 mortalidad:/mortalidad|defuncion|fallecim|muertes/,
 economia:/economia|presupuesto|finanza|recaudo|ingresos|valor agregado/,
 gobierno:/gobierno|alcaldia|institucion|administrac|desempeno/,
 transporte:/vehiculo|transito|automotor|movilidad|accidente/,
 seguridad:/seguridad|homicidio|hurtos?|violencia|suicidio|feminicid/,
 victimas:/victima|conflicto armado|reparacion|ruv|desplazamiento/
};
function matches(d:DatoExplorador,id:string){if(d.codigoICET?.startsWith('ICET-'))return numeroTema.get(Number(d.codigoICET.slice(-2)))?.id===id;return Boolean(tokens[id]?.test((d.sector+' '+d.nombre).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()))}
export default function ThemeExplorer(){
 const {feed}=usePublicFeed(),reduced=useReducedMotion();
 const data=useMemo(()=>reunirEstadisticas(feed),[feed]);
 const [topic,setTopic]=useState('poblacion'),[q,setQ]=useState(''),[detail,setDetail]=useState<DatoExplorador|null>(null);
 const [group,setGroup]=useState('Todas');
 const dialogRef=useDialogFocus(!!detail,()=>setDetail(null));
 useEffect(()=>{const id=new URLSearchParams(window.location.search).get('tema');if(temasTerritoriales.some(t=>t.id===id))setTopic(id!);},[]);
 const options=temasTerritoriales.filter(t=>(group==='Todas'||t.macro===group)&&t.nombre.toLocaleLowerCase('es').includes(q.toLocaleLowerCase('es')));
 const selected=temasTerritoriales.find(t=>t.id===topic)!;
 const rows=useMemo(()=>data.filter(d=>matches(d,topic)),[data,topic]);
 return <main className="n5-themes-page"><header className="n5-themes-header"><Link href="/"><ArrowLeft size={18}/> Volver al Observatorio</Link><strong>EXPLORADOR DE TEMAS</strong><Link href="/mapa/">Geovisor <ArrowUpRight size={16}/></Link></header>
 <div className="n5-themes-body"><div className="n5-themes-hero"><div><span>UNA BIBLIOTECA PARA TODAS LAS EDADES</span><h1>¿Qué te gustaría conocer de San Pedro?</h1><p>Elige una categoría. Las cinco gráficas permanecen en su lugar y cambian con la información correspondiente.</p></div><div className="n5-topic-count"><CountingValue value={14}/><small>temas para explorar</small></div></div>
 <div className="n5-themes-filters"><label><Search size={19}/><input aria-label="Buscar tema" placeholder="Busca una temática..." value={q} onChange={e=>setQ(e.target.value)}/>{q&&<button onClick={()=>setQ('')} aria-label="Limpiar"><X size={14}/></button>}</label><select aria-label="Agrupar por área" value={group} onChange={e=>setGroup(e.target.value)}><option value="Todas">Todas las áreas</option>{macroDimensiones.map(m=><option key={m}>{m}</option>)}</select></div>
 <div className="n5-themes-grid">{options.map(t=><motion.button type="button" key={t.id} whileHover={reduced?{}:{y:-4,scale:1.01}} aria-pressed={topic===t.id} className={'n5-tile '+(topic===t.id?'active':'')} onClick={()=>setTopic(t.id)} style={{'--topic-accent':t.color} as React.CSSProperties}><span className="n5-tile-orb"><FolderOpen size={22}/></span><strong>{t.nombre}</strong><span>{t.descripcion}</span><footer><b>{t.items.length} preguntas DANE</b><ArrowUpRight size={19}/></footer></motion.button>)}</div>
 <section className="n5-selected-topic"><span className="g4-eyebrow">SELECCIÓN ACTUAL</span><h2>{selected.nombre}</h2><p>{selected.pregunta}</p><div><b><CountingValue value={rows.length}/> registros relacionados con el tema</b><Link href={{pathname:'/',query:{tema:topic}}}>Abrir este tema en el inicio <ArrowRight size={16}/></Link></div></section>
 <SectorDashboard datos={data} tema={topic} onOpen={setDetail}/><ChartWall datos={rows} title={'Cinco formas de explorar: '+selected.nombre} onOpen={setDetail}/>
 <AnimatePresence>{detail&&<motion.div className="g4-dialog-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setDetail(null)}><motion.section ref={dialogRef} className="g4-dialog" role="dialog" aria-modal="true" aria-label="Ficha de indicador" initial={{y:30}} animate={{y:0}} exit={{y:30}} onClick={e=>e.stopPropagation()}><button className="g4-close" onClick={()=>setDetail(null)} aria-label="Cerrar"><X size={19}/></button><span className="g4-eyebrow">{detail.sector} · {detail.anio}</span><h2>{detail.nombre}</h2><strong className="g4-number">{detail.precision==='superior a'?'> ':['aproximado','estimación institucional'].includes(detail.precision||'')?'≈ ':''}<CountingValue value={detail.valor} maximumFractionDigits={2}/> <small>{detail.unidad}</small></strong><p>Fuente: {detail.fuente}</p><p>{detail.origen||'Estadística documentada'} · {detail.clase}</p>{detail.nota&&<p>{detail.nota}</p>}<p>Alcance del dato: municipio de San Pedro (76670), vigencia {detail.anio}.</p><DataProvenance datum={detail}/>{detail.fuenteUrl&&<a href={detail.fuenteUrl} target="_blank" rel="noopener noreferrer">Consultar fuente <ArrowUpRight size={16}/></a>}<footer><button onClick={()=>setDetail(null)}>Cerrar ficha</button></footer></motion.section></motion.div>}</AnimatePresence>
 </div></main>;
}