'use client';
import {ArrowUpRight,Globe2,HeartPulse,Landmark,ShieldCheck} from 'lucide-react';
import DoorArtwork from './DoorArtwork';
import {macroDimensiones,temasTerritoriales} from '@/lib/territorialTaxonomy';
const descriptions=['El entorno que habitamos: agua, suelo y ambiente.','Las personas en el centro: población, educación y salud.','Los recursos, la gestión y las decisiones públicas.','La vida en comunidad y la construcción de paz.'];
const icons=[Globe2,HeartPulse,Landmark,ShieldCheck];
const accents=['#129a87','#347cbb','#9368ab','#bd8440'];
export default function DiscoveryDoorways({active,onChoose}:{active:string;onChoose:(macro:string)=>void}){
 return <section className="discovery" aria-labelledby="discovery-title"><header><div><span className="xp-overline">CADA PREGUNTA ABRE UN CAMINO</span><h2 id="discovery-title">¿Por dónde quieres empezar?</h2><p>Cuatro miradas para recorrer las 14 categorías del observatorio.</p></div>{active!=='Todos'&&<button className="discovery-reset" onClick={()=>onChoose('Todos')}>Ver todas las miradas</button>}</header><div className="discovery-grid">{macroDimensiones.map((macro,i)=>{const Icon=icons[i];const topics=temasTerritoriales.filter(t=>t.macro===macro);return <button key={macro} className="discovery-doorway" aria-pressed={active===macro} onClick={()=>onChoose(macro)} style={{'--door-accent':accents[i]} as React.CSSProperties}><span className="discovery-art" aria-hidden="true"><DoorArtwork index={i}/><Icon size={36} strokeWidth={1.5}/><b>{String(i+1).padStart(2,'0')}</b></span><span className="discovery-topic-count">{topics.length} CATEGORÍAS</span><h3>{macro}</h3><p>{descriptions[i]}</p><footer><span>{topics.map(t=>t.nombre).slice(0,2).join(' · ')}</span><ArrowUpRight size={20}/></footer></button>})}</div></section>;
}
