'use client';
import {useRef,useState} from 'react';
import './panorama.css';
import Link from 'next/link';
import {ArrowRight,ArrowUpRight,ChartNoAxesCombined,ExternalLink,Landmark,Lightbulb,Radio,ShieldCheck} from 'lucide-react';
import internet from '@/data/conectividadV6.json';
import energy from '@/data/energiaV6.json';
import management from '@/data/rendicion2025.json';
import {connectivityStory,energyStory,investmentStory} from '@/lib/panorama.mjs';
import CountingValue from './CountingValue';

const connectivity=connectivityStory(internet.municipal);
const electricity=energyStory(energy);
const investment=investmentStory(management.registros);
const transparency=management.registros.find(r=>r.id==='RC25-ITA')!;
const format=(value:number,digits=1)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:digits}).format(value);
const colors=['#159f8b','#3385cb','#7164bb','#c69238','#c76382','#248fa5','#7b9950','#64768c'];
const views=[{id:'internet',label:'Conectividad',icon:Radio},{id:'energy',label:'Cobertura eléctrica',icon:Lightbulb},{id:'investment',label:'Inversión municipal',icon:Landmark}] as const;
type View=typeof views[number]['id'];

function ConnectivityPlot(){
 const points=connectivity.points;
 const max=Math.ceil(Math.max(...points.map(p=>p.accesos))/250)*250;
 const coords=points.map((p,i)=>({x:58+i*610/(points.length-1),y:204-p.accesos/max*170}));
 const path=coords.map(p=>p.x+','+p.y).join(' ');
 return <svg className="panorama-line" viewBox="0 0 720 250" role="img" aria-label={'Accesos de internet fijo en San Pedro, tercer trimestre de 2017 a 2023. Último valor: '+connectivity.latest.accesos+'. Valores completos en la tabla desplegable.'}>
  <defs><linearGradient id="panorama-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1aa995" stopOpacity=".24"/><stop offset="100%" stopColor="#1aa995" stopOpacity="0"/></linearGradient></defs>
  {[0,.5,1].map(f=><g key={f}><line x1="58" x2="680" y1={204-f*170} y2={204-f*170} stroke="#dce8ed" strokeDasharray="4 5"/><text x="43" y={208-f*170} textAnchor="end">{format(f*max,0)}</text></g>)}
  <polygon points={`58,204 ${path} 668,204`} fill="url(#panorama-fill)"/>
  <polyline points={path} fill="none" stroke="#139c8c" strokeWidth="3.5" strokeLinejoin="round"/>
  {coords.map((p,i)=><g key={points[i].anno}><circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#139c8c" strokeWidth="3"><title>{points[i].anno+' · T'+connectivity.quarter+': '+format(points[i].accesos,0)+' accesos'}</title></circle><text x={p.x} y="236" textAnchor="middle">{points[i].anno}</text></g>)}
 </svg>;
}

export default function MunicipalPanorama(){
 const [view,setView]=useState<View>('internet');
 const tabs=useRef<(HTMLButtonElement|null)[]>([]);
 const index=views.findIndex(v=>v.id===view);
 const selectTab=(next:number)=>{setView(views[next].id);tabs.current[next]?.focus()};
 const title=view==='internet'?'Cómo cambia nuestra conectividad':view==='energy'?'San Pedro frente al Valle y al país':'Dónde se concentra la inversión reportada';
 const change=connectivity.change;
 const source=view==='internet'?internet.fuente:view==='energy'?energy.fuente+'?where=vigencia%3D%272024%27&outFields=cod_mpio,municipio,vcstotal,vttotal,iceetotal&returnGeometry=false&f=pjson':management.url+'#page=9';
 const sourceName=view==='internet'?'MinTIC · Colombia TIC':view==='energy'?'UPME · ICEE 2024':'Alcaldía de San Pedro · Rendición 2025';
 return <section className="panorama" aria-labelledby="panorama-title">
  <header className="panorama-heading"><div><span className="xp-overline">UNA MIRADA A LO ESENCIAL</span><h2 id="panorama-title">Así está San Pedro.</h2><p>Cifras para entender el territorio, con el contexto que necesitan.</p></div><Link href="/territorios/">Comparar territorios <ArrowUpRight size={17}/></Link></header>
  <div className="panorama-kpis">
   <Link href="/rendicion/" className="panorama-kpi"><Landmark size={20}/><span>Inversión base analizada</span><strong>$<CountingValue value={investment.total/1e6}/><small> millones</small></strong><p>Gestión municipal · 2025</p><footer>Ocho dependencias <ArrowUpRight size={15}/></footer></Link>
   <Link href="/territorios/" className="panorama-kpi"><Lightbulb size={20}/><span>Cobertura eléctrica</span><strong><CountingValue value={electricity.rows[0].valor} maximumFractionDigits={1} suffix=" %"/></strong><p>Viviendas con servicio · UPME 2024</p><footer>{format(electricity.gap)} puntos sobre el Valle <ArrowUpRight size={15}/></footer></Link>
   <Link href="/territorios/?vista=internet" className="panorama-kpi"><Radio size={20}/><span>Accesos de internet fijo</span><strong><CountingValue value={connectivity.latest.accesos}/></strong><p>San Pedro · {connectivity.latest.anno} T{connectivity.quarter}</p><footer>MinTIC · accesos, no personas <ArrowUpRight size={15}/></footer></Link>
   <Link href="/rendicion/?dato=RC25-ITA" className="panorama-kpi"><ShieldCheck size={20}/><span>Transparencia y acceso · ITA</span><strong><CountingValue value={transparency.valor}/><small> / 100</small></strong><p>Resultado de gestión reportado · 2025</p><footer>Consultar informe municipal <ArrowUpRight size={15}/></footer></Link>
  </div>
  <div className="panorama-story">
   <div className="panorama-main"><div className="panorama-tabs" role="tablist" aria-label="Historias del municipio">{views.map((v,i)=><button key={v.id} ref={el=>{tabs.current[i]=el}} id={'panorama-tab-'+v.id} role="tab" aria-selected={view===v.id} aria-controls="panorama-panel" tabIndex={view===v.id?0:-1} onClick={()=>setView(v.id)} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();selectTab(e.key==='Home'?0:e.key==='End'?views.length-1:(index+(e.key==='ArrowRight'?1:-1)+views.length)%views.length)}}}><v.icon size={16}/>{v.label}</button>)}</div>
    <div id="panorama-panel" role="tabpanel" aria-labelledby={'panorama-tab-'+view} tabIndex={0}>
     <div className="panorama-chart-heading"><span>{view==='investment'?'GESTIÓN MUNICIPAL':'ESTADÍSTICA OFICIAL · CÁLCULO CON COMPONENTES'}</span><h3>{title}</h3><p>{view==='internet'?'Accesos reportados en el tercer trimestre de cada año · 2017–2023':view==='energy'?'Viviendas con servicio / viviendas totales · misma vigencia, 2024':'Participación en la base de $'+format(investment.total,0)+' · vigencia 2025'}</p></div>
     {view==='internet'?<ConnectivityPlot/>:view==='energy'?<div className="panorama-bars panorama-energy">{electricity.rows.map((r,i)=><div key={r.nombre}><span>{r.nombre}</span><div><i style={{width:r.valor+'%',background:colors[i]}}/></div><strong>{format(r.valor)} %</strong></div>)}</div>:<div className="panorama-bars panorama-investment">{investment.rows.map((r,i)=><div key={r.id}><span>{r.dependencia}</span><div><i style={{width:r.share+'%',background:colors[i]}}/></div><strong>{format(r.share)} %</strong></div>)}</div>}
     <details key={view} className="panorama-table"><summary>Consultar valores y metodología</summary><p>{view==='internet'?internet.metodo:view==='energy'?energy.metodo:management.advertencia}</p><div><table><caption>{title}</caption><thead><tr><th scope="col">{view==='internet'?'Periodo':'Territorio o dependencia'}</th><th scope="col">{view==='investment'?'Inversión (COP)':view==='energy'?'Viviendas con servicio':'Accesos'}</th>{view==='energy'&&<th scope="col">Viviendas totales</th>}</tr></thead><tbody>{view==='internet'?connectivity.points.map(p=><tr key={p.anno}><th scope="row">{p.anno} T{p.trimestre}</th><td>{format(p.accesos,0)}</td></tr>):view==='energy'?electricity.rows.map(r=><tr key={r.nombre}><th scope="row">{r.nombre}</th><td>{format(r.numerador,0)}</td><td>{format(r.denominador,0)}</td></tr>):investment.rows.map(r=><tr key={r.id}><th scope="row">{r.dependencia}</th><td>${format(r.valor,0)}</td></tr>)}</tbody></table></div></details>
     <a className="panorama-source" href={source} target="_blank" rel="noopener noreferrer"><ExternalLink size={13}/>{sourceName}</a>
    </div>
   </div>
   <aside className="panorama-insight" aria-label="Lectura de la gráfica"><span><ChartNoAxesCombined size={19}/> LO QUE NOS CUENTA</span><strong>{view==='internet'?(change===null?'Sin base comparable':(change>=0?'+':'')+format(change)+' %'):view==='energy'?'+'+format(electricity.gap)+' pp':format(investment.rows[0].share)+' %'}</strong><h3>{view==='internet'?'Cambio frente al mismo trimestre del año anterior':view==='energy'?'Diferencia frente al Valle del Cauca':'De la base analizada corresponde a Planeación e Infraestructura'}</h3><p>{view==='internet'?'De '+format(connectivity.previous?.accesos||0,0)+' a '+format(connectivity.latest.accesos,0)+' accesos entre '+(connectivity.latest.anno-1)+' y '+connectivity.latest.anno+'. Los accesos no representan personas únicas ni cobertura de hogares.':view==='energy'?'La diferencia se expresa en puntos porcentuales. Los agregados del Valle y Colombia se calculan con viviendas, sin promediar porcentajes municipales.':'Esta distribución representa la inversión reportada de ocho dependencias. No es un porcentaje de ejecución ni el presupuesto total del municipio.'}</p><Link href={view==='investment'?'/rendicion/':view==='internet'?'/territorios/?vista=internet':'/territorios/'}>Explorar esta historia <ArrowRight size={17}/></Link><small>Las vigencias se muestran por separado. Una cifra histórica no describe automáticamente la situación actual.</small></aside>
  </div>
 </section>;
}
