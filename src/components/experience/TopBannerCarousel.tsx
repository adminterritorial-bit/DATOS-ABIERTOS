'use client';
import {useEffect,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {ChevronLeft,ChevronRight,Pause,Play,ArrowUpRight} from 'lucide-react';
import Link from 'next/link';
const BASE='/DATOS-ABIERTOS/banners/';
export const slides=[
 {name:'Observatorio de Datos',src:BASE+'observatorio.avif',text:'Datos que cuentan lo que somos',link:'/temas/'},
 {name:'San Pedro en el mapa',src:BASE+'geografia.avif',text:'Conoce tu territorio, punto a punto',link:'/mapa/'},
 {name:'Un nuevo futuro se avecina',src:BASE+'futuro.avif',text:'Descubre las historias detrás de los datos',link:'/temas/'},
 {name:'Creado por Juan E. Perez T.',src:BASE+'creditos.avif',text:'Tecnología que acerca a las personas',link:'/documentos/'}
];
export default function TopBannerCarousel(){
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[failed,setFailed]=useState<Record<number,boolean>>({}),[loaded,setLoaded]=useState<Record<number,boolean>>({});
 const reduced=useReducedMotion();
 const select=(n:number)=>setIndex((n+slides.length)%slides.length);
 useEffect(()=>{if(paused||reduced)return;const id=window.setInterval(()=>setIndex(v=>(v+1)%slides.length),7200);return()=>window.clearInterval(id)},[paused,reduced]);
 return <section className="n5-banner" aria-label="Novedades del Observatorio" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={(e)=>{if(!e.currentTarget.contains(e.relatedTarget))setPaused(false)}}>
  <div className="n5-banner-frame"><AnimatePresence initial={false} mode="wait"><motion.div key={index} className="n5-banner-slide" initial={reduced?false:{opacity:0,scale:1.025}} animate={{opacity:1,scale:1}} exit={reduced?{}:{opacity:0,scale:1.01}} transition={{duration:.7,ease:[.2,.73,.2,1]}}>
   <div className="n5-banner-fallback"><div className="n5-banner-shimmer"/><span className="n5-banner-fallback-kicker">OBSERVATORIO DE DATOS ABIERTOS · SAN PEDRO</span><h2>{slides[index].name}</h2><p>{slides[index].text}</p></div>
   {!failed[index]&&<img className="n5-banner-image" style={{opacity:loaded[index]?1:0}} src={slides[index].src} alt={slides[index].name} width={1200} height={300} draggable={false} onLoad={()=>setLoaded(v=>({...v,[index]:true}))} onError={()=>setFailed(v=>({...v,[index]:true}))}/>} 
   <Link href={slides[index].link} className="n5-banner-hit" aria-label={'Abrir '+slides[index].name}><span>Explorar <ArrowUpRight size={15}/></span></Link>
  </motion.div></AnimatePresence></div>
  <div className="n5-banner-controls"><div className="n5-banner-dots" role="group" aria-label="Elegir banner">{slides.map((s,i)=><button key={s.name} aria-label={'Mostrar: '+s.name} aria-current={index===i?'true':undefined} className={i===index?'selected':''} onClick={()=>select(i)}><span/></button>)}</div><span className="n5-slide-counter">{String(index+1).padStart(2,'0')} / 04</span><button aria-label="Banner anterior" onClick={()=>select(index-1)}><ChevronLeft size={17}/></button><button aria-label="Banner siguiente" onClick={()=>select(index+1)}><ChevronRight size={17}/></button><button onClick={()=>setPaused(v=>!v)} aria-label={paused?'Reanudar banners':'Pausar banners'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button></div>
 </section>
}