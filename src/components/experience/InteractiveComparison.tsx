'use client';
import {useEffect,useId,useState} from 'react';
import {ArrowUpRight,Copy,SlidersHorizontal} from 'lucide-react';
import energy from '@/data/energiaV6.json';
import internet from '@/data/conectividadV6.json';
import {commonPeriods,compareTerritories,createComparisonData,type Indicator} from '@/lib/interactiveComparison.mjs';
import {buildComparisonUrl,buildSavedComparisonPath,readComparisonQuery} from '@/lib/comparisonLinks.mjs';
import SavedQueries from './SavedQueries';
import './interactive-comparison.css';

const data=createComparisonData(energy,internet);
const nf=(value:number)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(value);
const signed=(value:number)=>(value>0?'+':'')+nf(value);
const displayPeriod=(value:string)=>value.replace('-',' ');
const defaults=['76670','76','CO'];

export default function InteractiveComparison(){
 const id=useId();
 const [indicator,setIndicator]=useState<Indicator>('energia');
 const [selected,setSelected]=useState(defaults);
 const [chosenPeriod,setChosenPeriod]=useState('2024');
 const [ready,setReady]=useState(false);
 const [shareUrl,setShareUrl]=useState('');
 const [copyStatus,setCopyStatus]=useState('');
 const periods=commonPeriods(data,indicator,selected);
 const period=periods.includes(chosenPeriod)?chosenPeriod:periods.at(-1)??'';
 const years=[...new Set(periods.map(p=>p.slice(0,4)))];
 const year=period.slice(0,4);
 const quarters=periods.filter(p=>p.startsWith(year));
 const rows=compareTerritories(data,indicator,period,selected);
 const unit=indicator==='energia'?'%':'accesos';
 const base=rows[0];
 const other=rows.find(r=>r.code!==base?.code);
 const max=indicator==='energia'?100:Math.max(...rows.map(r=>r.value),1);
 const hasPeers=selected.some(code=>!defaults.includes(code));
 useEffect(()=>{
  const restore=()=>{
   const restored=readComparisonQuery(window.location.search,data);
   setIndicator(restored.indicator);setSelected(restored.territories);setChosenPeriod(restored.period);setCopyStatus('');setReady(true);
  };
  restore();
  window.addEventListener('popstate',restore);window.addEventListener('observatorio:source-tab-change',restore);
  return ()=>{window.removeEventListener('popstate',restore);window.removeEventListener('observatorio:source-tab-change',restore);};
 },[]);
 useEffect(()=>{
  if(!ready)return;
  const selection={indicator,period,territories:selected};
  const url=buildComparisonUrl(window.location.href,selection,data);
  if(url!==window.location.href)window.history.replaceState(window.history.state,'',url);
  setShareUrl(url);setCopyStatus('');
  window.dispatchEvent(new CustomEvent('observatorio:comparison-change',{detail:{url,selection}}));
 },[ready,indicator,period,selected]);
 const copyLink=async()=>{
  // Read the current URL so a source-tab query or anchor set elsewhere is preserved.
  const url=buildComparisonUrl(window.location.href,{indicator,period,territories:selected},data);
  setShareUrl(url);
  try{
   if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
   await navigator.clipboard.writeText(url);
   setCopyStatus('Enlace copiado. Al abrirlo se recupera esta comparación.');
  }catch{
   setCopyStatus('Selecciona y copia el enlace del campo de abajo.');
  }
 };
 const toggle=(code:string)=>{
  const next=selected.includes(code)?selected.filter(c=>c!==code):[...selected,code];
  if(next.length){setSelected(next);const available=commonPeriods(data,indicator,next);if(!available.includes(period))setChosenPeriod(available.at(-1)??'');}
 };
 const changeIndicator=(next:Indicator)=>{setIndicator(next);setChosenPeriod(commonPeriods(data,next,selected).at(-1)??'');};
 const conclusion=other
  ? `${base.name} registra ${nf(base.value)} ${unit} en ${displayPeriod(period)}. ${other.name} ${Math.abs(other.gap)<0.005?'tiene el mismo valor':`se sitúa ${nf(Math.abs(other.gap))} ${other.gapUnit} ${other.gap>0?'por encima':'por debajo'}`} de ${base.name}.`
  :base?`${base.name} registra ${nf(base.value)} ${unit} en ${displayPeriod(period)}. Selecciona otro territorio para calcular una diferencia.`:'No hay observaciones comunes para esta selección.';
 return <section className="ic-panel" aria-labelledby={`${id}-title`}>
  <div className="ic-heading"><div><span className="ic-eyebrow"><SlidersHorizontal size={15} aria-hidden="true"/> EXPLORA LOS DATOS</span><h2 id={`${id}-title`}>Construye tu comparación</h2><p>Elige una medida, un período y los territorios que quieres contrastar.</p></div><span className="ic-official">Fuentes oficiales · datos observados</span></div>
  <div className="ic-controls">
   <label htmlFor={`${id}-indicator`}>Indicador<select id={`${id}-indicator`} value={indicator} onChange={e=>changeIndicator(e.target.value as Indicator)}><option value="energia">Cobertura de energía eléctrica · %</option><option value="internet">Accesos a internet fijo · cantidad</option></select></label>
   <label htmlFor={`${id}-year`}>Año<select id={`${id}-year`} value={year} onChange={e=>setChosenPeriod(periods.filter(p=>p.startsWith(e.target.value)).at(-1)??'')}>{years.map(y=><option key={y}>{y}</option>)}</select></label>
   {indicator==='internet'&&<label htmlFor={`${id}-quarter`}>Trimestre<select id={`${id}-quarter`} value={period} onChange={e=>setChosenPeriod(e.target.value)}>{quarters.map(p=><option key={p} value={p}>T{p.split('T')[1]}</option>)}</select></label>}
  </div>
  <fieldset className="ic-territories" aria-describedby={`${id}-availability`}><legend>Territorios <span>· el primero seleccionado es la referencia</span></legend><div>{data.territories.map(t=><label key={t.code} className={selected.includes(t.code)?'is-selected':''}><input type="checkbox" checked={selected.includes(t.code)} disabled={selected.length===1&&selected.includes(t.code)} onChange={()=>toggle(t.code)}/>{t.name}{selected[0]===t.code&&<span className="ic-base">Referencia</span>}</label>)}</div></fieldset>
  <p className="ic-availability" id={`${id}-availability`}>{indicator==='energia'?'Vigencia disponible: 2024. Coberturas calculadas con viviendas con servicio y viviendas totales.':hasPeers?'Con municipios de referencia, el único período común disponible es 2023 T3. Retíralos para explorar 2017–2023 con San Pedro, Valle y Colombia.':'Períodos comunes disponibles: 2017 T1–2023 T3. Cada dato es un stock trimestral; los trimestres no se suman.'}</p>
  <div className="ic-share"><div className="ic-share-heading"><span>Comparte esta selección</span><button type="button" onClick={copyLink} disabled={!ready} data-testid="comparison-copy-link"><Copy size={15} aria-hidden="true"/> Copiar enlace de comparación</button></div><label htmlFor={`${id}-share-url`}>Enlace de la comparación</label><input id={`${id}-share-url`} data-testid="comparison-share-url" type="url" readOnly value={shareUrl} onFocus={e=>e.currentTarget.select()} aria-describedby={`${id}-copy-status`} spellCheck={false}/><p id={`${id}-copy-status`} role="status" aria-live="polite">{copyStatus||'Conserva el indicador, el período y el orden de los territorios.'}</p></div>
  {ready&&shareUrl&&<SavedQueries url={buildSavedComparisonPath(shareUrl,{indicator,period,territories:selected},data)} label={`${indicator==='energia'?'Energía eléctrica':'Internet fijo'} · ${displayPeriod(period)} · ${selected.map(code=>data.territories.find(t=>t.code===code)?.name??code).join(', ')}`}/>}
  <div className="ic-results" aria-live="polite" aria-atomic="true"><div className="ic-result-heading"><h3>{indicator==='energia'?'Cobertura eléctrica':'Accesos a internet fijo'}</h3><span>{displayPeriod(period)} · {rows.length} territorios</span></div>
   <div className="ic-bars" aria-hidden="true">{rows.map(r=><div className="ic-bar-row" key={r.code}><div><span>{r.name}</span><strong>{nf(r.value)} {unit}</strong></div><div className="ic-bar-track"><i className={r.code===base?.code?'ic-reference-bar':''} style={{width:`${r.value/max*100}%`}}/></div></div>)}</div>
   <p className="ic-conclusion">{conclusion}</p>
  </div>
  {indicator==='internet'&&<p className="ic-note">Son cantidades de accesos, no porcentajes de cobertura ni hogares conectados. Las diferencias también reflejan el tamaño de cada territorio; esta comparación no establece un ranking de cobertura.</p>}
  {indicator==='internet'&&period==='2017-T1'&&selected.includes('76670')&&<p className="ic-note">El registro de San Pedro en 2017 T1 es de 10 accesos. Esta base pequeña amplifica las diferencias relativas; consulta los valores absolutos al interpretarlas.</p>}
  <div className="ic-table-scroll" tabIndex={0} role="region" aria-label="Tabla de comparación; desplaza horizontalmente para consultar todas las columnas"><table><caption>Valores y diferencias frente a {base?.name} · {displayPeriod(period)}</caption><thead><tr><th scope="col">Territorio</th><th scope="col">{indicator==='energia'?'Cobertura (%)':'Accesos'}</th>{indicator==='energia'&&<><th scope="col">Viviendas con servicio</th><th scope="col">Viviendas totales</th></>}<th scope="col">Diferencia ({indicator==='energia'?'pp':'accesos'})</th>{indicator==='internet'&&<th scope="col">Diferencia relativa (%)</th>}</tr></thead><tbody>{rows.map(r=><tr key={r.code}><th scope="row">{r.name}{r.code===base.code&&<small>Referencia</small>}</th><td>{nf(r.value)}</td>{indicator==='energia'&&<><td>{nf(r.numerator)}</td><td>{nf(r.denominator!)}</td></>}<td>{r.code===base.code?'—':signed(r.gap)}</td>{indicator==='internet'&&<td>{r.code===base.code?'—':r.relative===null?'No calculable (base cero)':signed(r.relative)}</td>}</tr>)}</tbody></table></div>
  <details className="ic-method"><summary>Cómo se calcula · fuentes y fechas</summary><div><p>{indicator==='energia'?energy.metodo:internet.metodo}</p><p>{indicator==='energia'?'La diferencia entre coberturas se expresa en puntos porcentuales (pp), no en porcentaje de crecimiento. Colombia agrega 1.122 municipios y Valle del Cauca, 42; no se promedian las siete cifras de esta vista.':'Diferencia absoluta = accesos del territorio − accesos de la referencia. Diferencia relativa = 100 × diferencia absoluta / accesos de la referencia; con base cero no se calcula. No se dispone aquí de un denominador comparable de hogares.'}</p><p>{internet.criterioComparables}</p><p>Vigencia: {indicator==='energia'?'2024':'2017 T1–2023 T3; municipios de referencia: 2023 T3'}. Fuente consultada el 17 de octubre de 2026.</p><a href={indicator==='energia'?energy.fuente+'?where=vigencia%3D%272024%27&outFields=cod_mpio,municipio,vcstotal,vttotal&returnGeometry=false&f=pjson':'https://www.datos.gov.co/d/n48w-gutb'} target="_blank" rel="noopener noreferrer">Abrir fuente {indicator==='energia'?'UPME':'MinTIC · Colombia TIC'} <ArrowUpRight size={14} aria-hidden="true"/></a></div></details>
 </section>;
}
