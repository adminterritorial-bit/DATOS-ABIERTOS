'use client';
import {usePathname} from 'next/navigation';
import {FileText,BarChart3} from 'lucide-react';
import CitizenSearch from './CitizenSearch';
import {usePublicFeed} from '@/lib/usePublicFeed';
import {MotionButton} from '@/components/ui/MotionButton';

function Utilities(){
 const {feed}=usePublicFeed();
 return <nav className="ot-global-placement" aria-label="Accesos ciudadanos">
  <MotionButton type="button" className="ot-global-documents" onClick={()=>window.location.assign('/DATOS-ABIERTOS/documentos/')} title="Consultar fuentes oficiales" aria-label="Abrir biblioteca documental"><FileText size={16}/> Biblioteca</MotionButton>
  <MotionButton type="button" className="ot-global-documents" onClick={()=>window.location.assign('/DATOS-ABIERTOS/comparar/')} title="Comparar vigencias" aria-label="Comparar datos y vigencias"><BarChart3 size={16}/> Comparar</MotionButton>
  <CitizenSearch feed={feed}/>
 </nav>;
}
export default function GlobalNavigation(){
 const path=usePathname();
 // The rebuilt homepage has its own integrated header search and navigation.
 if(path==='/'||path==='/DATOS-ABIERTOS'||path==='/DATOS-ABIERTOS/')return null;
 return <Utilities/>;
}
