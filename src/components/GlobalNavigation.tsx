'use client';
import {FileText} from 'lucide-react';
import CitizenSearch from './CitizenSearch';
import {usePublicFeed} from '@/lib/usePublicFeed';
import {MotionButton} from '@/components/ui/MotionButton';

export default function GlobalNavigation(){
 const {feed}=usePublicFeed();
 return <nav className="ot-global-placement" aria-label="Accesos ciudadanos">
  <MotionButton type="button" className="ot-global-documents" onClick={()=>window.location.assign('/DATOS-ABIERTOS/documentos/')} title="Consultar fuentes oficiales" aria-label="Abrir biblioteca documental"><FileText size={16}/> Biblioteca</MotionButton>
  <CitizenSearch feed={feed}/>
 </nav>;
}
