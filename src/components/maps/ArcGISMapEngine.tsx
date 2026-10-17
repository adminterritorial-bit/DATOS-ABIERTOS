'use client';
import {useEffect,useRef,useState} from 'react';
import municipalGeo from '@/data/geografiaMunicipal76670.json';

export type GeoSelection={
 kind:'municipal'|'place';
 name:string;code:string;area?:number;altitude?:number;year?:number;
};
type Props={visible:boolean;onSelect:(selection:GeoSelection)=>void;onStatus:(message:string)=>void;onReady?:(ready:boolean)=>void;onPlaces?:(places:{code:string;name:string}[])=>void;cameraCommand?:{type:'home'|'in'|'out';nonce:number};focusKey?:string};
const DANE='https://geoportal.dane.gov.co/mparcgis/rest/services/Divipola/Serv_DIVIPOLA_MGN_2025/FeatureServer/305';
const feature=(municipalGeo as unknown as {features:{properties:{codigo:string};geometry:{type:string;coordinates:number[][][]|number[][][][]}}[]}).features.find(f=>f.properties.codigo==='76670');
function polygons(){if(!feature)return[];return feature.geometry.type==='Polygon'?[feature.geometry.coordinates as number[][][]]:(feature.geometry.coordinates as number[][][][])}
const shapes=polygons().flat();
const extent=shapes.flat().reduce((e,p)=>[Math.min(e[0],p[0]),Math.min(e[1],p[1]),Math.max(e[2],p[0]),Math.max(e[3],p[1])],[180,90,-180,-90]);
const center:[number,number]=[(extent[0]+extent[2])/2,(extent[1]+extent[3])/2];
export default function ArcGISMapEngine({visible,onSelect,onStatus,onReady,onPlaces,focusKey,cameraCommand}:Props){
 const mount=useRef<HTMLDivElement>(null);
 const viewRef=useRef<{destroy:()=>void;goTo:(target:unknown,options?:unknown)=>Promise<unknown>;hitTest:(event:unknown)=>Promise<{results:{graphic?:{attributes?:Record<string,unknown>}}[]}>;on:(event:string,handler:(event:unknown)=>void)=>{remove:()=>void}}|null>(null);
 const graphicsRef=useRef<{visible:boolean}|null>(null);
 const goHome=useRef<(()=>void)|null>(null);
 const zoomRef=useRef<((step:number)=>void)|null>(null);
 const focusRef=useRef<Map<string,()=>void>>(new Map());
 const selectRef=useRef(onSelect),statusRef=useRef(onStatus),readyRef=useRef(onReady),placesRef=useRef(onPlaces);
 const [failure,setFailure]=useState('');
 const [retry,setRetry]=useState(0);
 useEffect(()=>{selectRef.current=onSelect;statusRef.current=onStatus;readyRef.current=onReady;placesRef.current=onPlaces},[onSelect,onStatus,onReady,onPlaces]);
 useEffect(()=>{if(graphicsRef.current)graphicsRef.current.visible=visible},[visible]);
 useEffect(()=>{if(focusKey==='home')goHome.current?.();else if(focusKey)focusRef.current.get(focusKey)?.()},[focusKey]);
 useEffect(()=>{if(!cameraCommand)return;if(cameraCommand.type==='home')goHome.current?.();if(cameraCommand.type==='in')zoomRef.current?.(1);if(cameraCommand.type==='out')zoomRef.current?.(-1)},[cameraCommand]);
 useEffect(()=>{
  let destroyed=false;let cleanup=()=>{};
  const load=async()=>{
   if(!mount.current||!feature){setFailure('No se pudo cargar el perímetro municipal oficial.');return}
   try{
    setFailure('');statusRef.current('Iniciando cartografía interactiva…');
    const [Map,MapView,WebTileLayer,Basemap,Graphic,GraphicsLayer,Polygon,Point,PictureMarkerSymbol,FeatureLayer]=await Promise.all([
      import('@arcgis/core/Map.js'),import('@arcgis/core/views/MapView.js'),
      import('@arcgis/core/layers/WebTileLayer.js'),import('@arcgis/core/Basemap.js'),
      import('@arcgis/core/Graphic.js'),import('@arcgis/core/layers/GraphicsLayer.js'),
      import('@arcgis/core/geometry/Polygon.js'),import('@arcgis/core/geometry/Point.js'),
      import('@arcgis/core/symbols/PictureMarkerSymbol.js'),import('@arcgis/core/layers/FeatureLayer.js')
    ]);
    if(destroyed)return;
    const basePath=window.location.pathname.startsWith('/DATOS-ABIERTOS')?'/DATOS-ABIERTOS':'';
    const osm=new WebTileLayer.default({urlTemplate:'https://tile.openstreetmap.org/{level}/{col}/{row}.png',copyright:'© OpenStreetMap contributors · ODbL'});
    const map=new Map.default({basemap:new Basemap.default({baseLayers:[osm],title:'OpenStreetMap · calles reales'})});
    const territoryLayer=new GraphicsLayer.default({title:'Límite oficial DANE 2025',listMode:'hide'});
    const markerLayer=new GraphicsLayer.default({title:'Banderas de lugares georreferenciados'});
    const consultLayer=new GraphicsLayer.default({title:'Portal de consulta municipal'});
    map.addMany([territoryLayer,markerLayer,consultLayer]);
    const polygon=new Polygon.default({rings:shapes,spatialReference:{wkid:4326}});
    const border=new Graphic.default({geometry:polygon,attributes:{code:'76670',kind:'boundary'},symbol:{type:'simple-fill',color:[30,174,139,.13],outline:{color:[18,134,120,.94],width:2.4}}});
    territoryLayer.add(border);
    const view=new MapView.default({container:mount.current,map,center,zoom:12,popupEnabled:false,ui:{components:['attribution']},constraints:{rotationEnabled:false,minZoom:9,maxZoom:18}});
    viewRef.current=view as unknown as typeof viewRef.current;
    const flag=(file:string,size=64)=>new PictureMarkerSymbol.default({url:basePath+'/geo-flags/'+file+'.svg',width:size,height:size*1.25,yoffset:20});
    const city=new Graphic.default({geometry:new Point.default({longitude:center[0],latitude:center[1]}),attributes:{kind:'municipal',code:'76670',name:'San Pedro · consulta municipal'},symbol:flag('municipal',72)});
    consultLayer.add(city);
    await view.when();
    if(destroyed){view.destroy();return}
    const home=()=>{void view.goTo(polygon.extent.expand(1.25),{duration:650}).catch(()=>{})};
    goHome.current=home;zoomRef.current=(step)=>{void view.goTo({zoom:Math.min(18,Math.max(9,view.zoom+step))},{duration:380}).catch(()=>{})};home();readyRef.current?.(true);
    statusRef.current('Mapa real activo · límite DANE 2025 · 1 punto de consulta municipal');
    const click=view.on('click',async ev=>{
      const result=await view.hitTest(ev,{include:[markerLayer,consultLayer]}).catch(()=>null);
      if(!result||destroyed)return;
      const hit=result.results.find((r)=>'graphic'in r&&r.graphic?.attributes?.kind);
      const a=hit&&'graphic'in hit?hit.graphic?.attributes:undefined;
      if(!a)return;
      if(a.kind==='municipal')selectRef.current({kind:'municipal',name:'San Pedro · indicadores municipales',code:'76670'});
      else if(a.kind==='place')selectRef.current({kind:'place',name:String(a.name||'Centro poblado'),code:String(a.code||''),area:Number(a.area)||undefined,altitude:Number(a.altitude)||undefined,year:Number(a.year)||2025});
    });
    cleanup=()=>{click.remove();view.destroy();viewRef.current=null;graphicsRef.current=null;goHome.current=null;zoomRef.current=null;focusRef.current.clear();readyRef.current?.(false)};
    graphicsRef.current=markerLayer as unknown as {visible:boolean};markerLayer.visible=visible;
    // A remote source can be blocked by CORS. This cannot remove the OSM basemap or municipal access.
    try{
     const remote=new FeatureLayer.default({url:DANE,outFields:['*'],definitionExpression:"MPIO_CDPMP = '76670'",visible:false});
     const query=remote.createQuery();query.where="MPIO_CDPMP = '76670'";query.outFields=['*'];query.returnGeometry=true;query.outSpatialReference={wkid:4326};
     const features=await remote.queryFeatures(query);
     if(destroyed)return;
     let count=0;const seen=new Set<string>();const placeList:{code:string;name:string}[]=[];
     for(const f of features.features){
      const a=f.attributes;const code=String(a.ZU_CDIVI||'');
      if(!code||seen.has(code)||!f.geometry||f.geometry.type!=='polygon')continue;
      seen.add(code);
      const centroid=(f.geometry as InstanceType<typeof Polygon.default>).centroid;
      if(!centroid||!Number.isFinite(centroid.longitude))continue;
      focusRef.current.set(code,()=>{void view.goTo({center:centroid,zoom:15},{duration:650}).catch(()=>{})});
      markerLayer.add(new Graphic.default({geometry:centroid,attributes:{kind:'place',name:String(a.ZU_CNMBRE||'Centro poblado'),code,area:a.ZU_NAREA,altitude:a.ZU_NALTD,year:a.ZU_NANO},symbol:flag('territory',57)}));
      count++;placeList.push({code,name:String(a.ZU_CNMBRE||'Centro poblado')});
     }
     placesRef.current?.(placeList);
     statusRef.current(count?count+' lugares DANE con banderas georreferenciadas · 1 portal municipal':'Mapa real disponible · 1 portal municipal');
    }catch(error){
      // The municipal boundary is bundled from the same DANE MGN dataset, independently of this request.
      statusRef.current('Mapa geográfico disponible · capa remota de centros poblados temporalmente inaccesible');
    }
   }catch(e){if(destroyed)return;setFailure('No se pudo iniciar ArcGIS Maps SDK. Verifica los recursos cartográficos y vuelve a intentar.');statusRef.current(e instanceof Error?e.message:'Error del mapa');readyRef.current?.(false)}
  };
  void load();
  return ()=>{destroyed=true;cleanup();if(viewRef.current){viewRef.current.destroy();viewRef.current=null}};
 },[retry]);
 return <div className="g4-map-host"><div className="g4-map-viewport" ref={mount} aria-label="Mapa geográfico real de San Pedro con calles, relieve y banderas ancladas a coordenadas"/>{failure&&<div className="g4-map-error"><strong>Cartografía no disponible</strong><p>{failure}</p><button onClick={()=>setRetry(v=>v+1)}>Reintentar carga</button></div>}</div>;
}
