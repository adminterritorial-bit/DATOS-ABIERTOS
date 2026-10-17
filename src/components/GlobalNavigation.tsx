'use client';
import {FileText,BarChart3} from 'lucide-react';
import CitizenSearch from './CitizenSearch';
import {usePublicFeed} from '@/lib/usePublicFeed';
import {MotionButton} from '@/components/ui/MotionButton';

export default function GlobalNavigation(){
 const {feed}=usePublicFeed();
 return <nav className="ot-global-placement" aria-label="Accesos ciudadanos">
  <MotionButton type="button" className="ot-global-documents" onClick={()=>window.location.assign('/DATOS-ABIERTOS/documentos/')} title="Consultar fuentes oficiales" aria-label="Abrir biblioteca documental"><FileText size={16}/> Biblioteca</MotionButton>
  <MotionButton type="button" className="ot-global-documents" onClick={()=>window.location.assign('/DATOS-ABIERTOS/comparar/')} title="Comparar vigencias" aria-label="Comparar datos y vigencias"><BarChart3 size={16}/> Comparar</MotionButton>
  <CitizenSearch feed={feed}/>
 </nav>;
}
