'use client';
import {useEffect,useRef} from 'react';
/** Trap focus, close on Escape, restore the opener and prevent background scrolling. */
export function useDialogFocus(open:boolean,onClose:()=>void){
 const ref=useRef<HTMLElement>(null),close=useRef(onClose);
 close.current=onClose;
 useEffect(()=>{
  if(!open)return;
  const previous=document.activeElement as HTMLElement|null;
  const overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const focus=()=>ref.current?.querySelector<HTMLElement>('button,a[href],input,select,[tabindex="0"]')?.focus();
  const frame=requestAnimationFrame(focus);
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();close.current();return}
   if(e.key!=='Tab'||!ref.current)return;
   const items=Array.from(ref.current.querySelectorAll<HTMLElement>('button,a[href],input,select,[tabindex="0"]')).filter(x=>!x.hasAttribute('disabled')&&x.getClientRects().length>0);
   const first=items[0],last=items.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
  };
  document.addEventListener('keydown',key);
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',key);document.body.style.overflow=overflow;previous?.focus()};
 },[open]);
 return ref;
}
