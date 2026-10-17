'use client';
import {useEffect} from 'react';
import {motion,animate,useMotionValue,useTransform,useReducedMotion} from 'motion/react';
export default function CountingValue({value,suffix='',maximumFractionDigits=0}:{value:number;suffix?:string;maximumFractionDigits?:number}){
 const reduced=useReducedMotion(),count=useMotionValue(reduced?value:0);
 const formatted=useTransform(count,v=>new Intl.NumberFormat('es-CO',{maximumFractionDigits}).format(v)+suffix);
 useEffect(()=>{if(reduced){count.set(value);return}const controls=animate(count,value,{duration:1.35,ease:[.18,.88,.24,1]});return ()=>controls.stop()},[value,reduced,count]);
 return <motion.span aria-label={new Intl.NumberFormat('es-CO',{maximumFractionDigits}).format(value)+suffix}>{formatted}</motion.span>;
}
