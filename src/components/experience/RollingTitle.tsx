'use client';
import {motion,useReducedMotion} from 'motion/react';
/** One clear vertical text transition per actual value change. Respects reduced motion. */
export default function RollingTitle({text,className}:{text:string;className?:string}){
 const reduced=useReducedMotion();
 return <span className={'n5-rolling-text '+(className||'')} aria-label={text}><motion.span key={text} initial={reduced?false:{y:'65%',opacity:0,filter:'blur(5px)'}} animate={{y:'0%',opacity:1,filter:'blur(0px)'}} transition={{duration:.43,ease:[.16,.93,.25,1]}}>{text}</motion.span></span>;
}
