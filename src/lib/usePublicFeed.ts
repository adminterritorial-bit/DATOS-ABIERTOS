'use client';
import {createContext,createElement,useContext,useEffect,useState} from 'react';
import {obtenerFeed} from './publicFeed';
import type {FeedPublico} from './publicFeed';

type PublicFeedState={feed:FeedPublico|null;error:string|undefined;loading:boolean};
const PublicFeedContext=createContext<PublicFeedState|null>(null);
/** One shared request for the persistent app shell; standalone consumers retain a fallback. */
function useFeedRequest(enabled:boolean){
 const [feed,setFeed]=useState<FeedPublico|null>(null);
 const [error,setError]=useState<string|undefined>();
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  if(!enabled)return;
  const controller=new AbortController();
  obtenerFeed({signal:controller.signal}).then(value=>{
   if(!controller.signal.aborted){setFeed(value);setError(undefined);setLoading(false)}
  }).catch(e=>{
   if(!controller.signal.aborted){setError(e instanceof Error?e.message:'No se pudo consultar Supabase');setLoading(false)}
  });
  return ()=>controller.abort();
 },[enabled]);
 return {feed,error,loading};
}

export function PublicFeedProvider({children}:{children:React.ReactNode}){const value=useFeedRequest(true);return createElement(PublicFeedContext.Provider,{value},children);}
export function usePublicFeed(){const shared=useContext(PublicFeedContext);const fallback=useFeedRequest(shared===null);return shared||fallback;}
