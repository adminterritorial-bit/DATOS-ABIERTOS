import Link from 'next/link';
import {ArrowUpRight,BookOpen,ChartNoAxesCombined,Files,Landmark,MapPinned} from 'lucide-react';
import './information-guide.css';

const routes=[
 {href:'/catalogo/',eyebrow:'INDICADORES Y OBSERVACIONES',title:'Consultar una cifra',description:'Busca por indicador, sector y vigencia. Revisa el valor, su unidad y la fuente.',action:'Abrir el catálogo',Icon:BookOpen},
 {href:'/territorios/',eyebrow:'SAN PEDRO EN CONTEXTO',title:'Comparar territorios',description:'Contrasta energía e internet con otros territorios, usando períodos comparables.',action:'Construir una comparación',Icon:ChartNoAxesCombined},
 {href:'/mapa/',eyebrow:'EL DATO EN SU LUGAR',title:'Explorar el mapa',description:'Ubica la cabecera y los centros poblados en los siete lugares del marco DANE.',action:'Recorrer el territorio',Icon:MapPinned},
 {href:'/rendicion/',eyebrow:'GESTIÓN MUNICIPAL · 2025',title:'Revisar recursos y resultados',description:'Consulta la inversión reportada, los programas y su alcance en el informe municipal.',action:'Ver la rendición de cuentas',Icon:Landmark,compact:true},
 {href:'/documentos/',eyebrow:'DOCUMENTOS Y METODOLOGÍA',title:'Verificar la fuente',description:'Abre las bases oficiales y los documentos que respaldan las cifras del observatorio.',action:'Consultar documentos',Icon:Files,compact:true}
];
/** Intent-based entry points complement the thematic menu without repeating it. */
export default function InformationGuide(){
 return <section className="information-guide" aria-labelledby="information-guide-title"><header className="ig-heading"><div><span className="ig-eyebrow">UNA RUTA PARA CADA CONSULTA</span><h2 id="information-guide-title">Encuentra tu información</h2></div><p>Elige lo que necesitas hacer.<br/>Cada ruta te acerca al dato y a su contexto.</p></header><nav className="ig-routes" aria-label="Rutas para encontrar información">{routes.map(({href,eyebrow,title,description,action,Icon,compact})=><Link href={href} key={href} className={`ig-route${compact?' ig-route--compact':''}`}><div className="ig-route-top"><span className="ig-icon"><Icon size={24} strokeWidth={1.4} aria-hidden="true"/></span><span className="ig-route-corner" aria-hidden="true"><ArrowUpRight size={16}/></span></div><div className="ig-route-body"><span className="ig-route-eyebrow">{eyebrow}</span><h3>{title}</h3><p>{description}</p><span className="ig-route-action">{action}<ArrowUpRight size={13} aria-hidden="true"/></span></div></Link>)}</nav></section>;
}
