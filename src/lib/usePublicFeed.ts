'use client';
import {useEffect,useState} from 'react';
import {obtenerFeed} from './publicFeed';
import type {FeedPublico} from './publicFeed';

/** Live Supabase fetch on the visitor's browser. GitHub Pages does not run Next.js servers. */
export function usePublicFeed(){
 const [feed,setFeed]=useState<FeedPublico|null>(null);
 const [error,setError]=useState<string|undefined>();
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  const controller=new AbortController();
  obtenerFeed({signal:controller.signal}).then(value=>{
   if(!controller.signal.aborted){setFeed(value);setError(undefined);setLoading(false)}
  }).catch(e=>{
   if(!controller.signal.aborted){setError(e instanceof Error?e.message:'No se pudo consultar Supabase');setLoading(false)}
  });
  return ()=>controller.abort();
 },[]);
 return {feed,error,loading};
}
