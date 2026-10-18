export const shellSections=[
 {id:'inicio',href:'/',title:'Panorama territorial',group:'OBSERVATORIO'},
 {id:'temas',href:'/temas/',title:'Explorador de temas',group:'DESCUBRIR'},
 {id:'catalogo',href:'/catalogo/',title:'Catálogo de datos',group:'CONSULTAR'},
 {id:'mapa',href:'/mapa/',title:'Exploración territorial',group:'UBICAR'},
 {id:'rendicion',href:'/rendicion/',title:'Gestión municipal 2025',group:'GESTIÓN MUNICIPAL'},
 {id:'territorios',href:'/territorios/',title:'Comparación territorial',group:'COMPARAR'},
 {id:'comparar',href:'/comparar/',title:'Comparación de series',group:'COMPARAR'},
 {id:'documentos',href:'/documentos/',title:'Biblioteca de fuentes',group:'VERIFICAR'},
 {id:'icet',href:'/icet/',title:'Indicadores DANE',group:'ESTADÍSTICAS'},
 {id:'poblacion',href:'/poblacion/',title:'Población y demografía',group:'ESTADÍSTICAS'},
 {id:'seguridad',href:'/seguridad/',title:'Seguridad ciudadana',group:'ESTADÍSTICAS'},
 {id:'pdt',href:'/pdt/',title:'Plan de Desarrollo',group:'GESTIÓN MUNICIPAL'},
 {id:'estimador',href:'/estimador/',title:'Laboratorio estadístico',group:'EXPLORAR'},
 {id:'admin',href:'/admin/',title:'Administración',group:'GESTIÓN DEL OBSERVATORIO'}
];
export function normalizeAppPath(value){const path=String(value||'/').split(/[?#]/)[0].replace(/^\/DATOS-ABIERTOS(?=\/|$)/,'')||'/';return path.endsWith('/')?path:path+'/';}
export function sectionForPath(value){const path=normalizeAppPath(value);return shellSections.find(s=>s.href==='/'?path==='/':path===s.href||path.startsWith(s.href))||{id:'otro',href:'/',title:'Observatorio San Pedro',group:'OBSERVATORIO'};}
