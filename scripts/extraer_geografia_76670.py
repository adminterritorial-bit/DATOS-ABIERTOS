#!/usr/bin/env python3
"""Geometría georreferenciada oficial DANE MGN 2025 y capa ICEE UPME de vecinos.
Almacena datos estrictamente agregados por municipio; sin coordenadas inventadas.
"""
import json, pathlib, datetime, urllib.request, urllib.parse
ROOT=pathlib.Path('src/data');ROOT.mkdir(parents=True,exist_ok=True)
codes=['76670','76834','76111','76036','76318','76616','76113','76890'] # región San Pedro y municipios contextuales
DANE='https://geoportal.dane.gov.co/mparcgis/rest/services/Divipola/Serv_DIVIPOLA_MGN_2025/FeatureServer/317/query'
UPME='https://geo.upme.gov.co/server/rest/services/Capas_EnergiaElectrica/indice_cobertura_energia_electrica_mpio/FeatureServer/26/query'
def get(base,args,timeout=115):
 uri=base+'?'+urllib.parse.urlencode(args)
 req=urllib.request.Request(uri,headers={'User-Agent':'SanPedro-OpenData-Geovisor/1.0','Accept':'application/json'})
 with urllib.request.urlopen(req,timeout=timeout) as r:return json.load(r)
def normalized_code(attrs):
 for k,v in attrs.items():
  if k.upper() in ('MPIO_CDPMP','CODIGO_DANE','COD_MPIO','MPCODIGO') and v is not None:
   return str(v).split('.')[0].zfill(5)
 return ''
def export():
 attrs=','.join("'"+i+"'" for i in codes)
 geo=get(DANE,{'where':'MPIO_CDPMP IN ('+attrs+')','outFields':'*','outSR':4326,'f':'geojson','geometryPrecision':5,'returnGeometry':'true'})
 if geo.get('type')!='FeatureCollection' or 'features' not in geo:raise ValueError('No GeoJSON DANE')
 selected=[]
 for f in geo['features']:
  code=normalized_code(f.get('properties',{}))
  if code not in codes or not f.get('geometry'):continue
  props=f.get('properties',{})
  selected.append({'type':'Feature','properties':{'codigo':code,'municipio':str(props.get('MPIO_CNMBRE',props.get('mpio_cnmbre',code))),'departamento':'Valle del Cauca','source':'DANE MGN DIVIPOLA 2025'},'geometry':f['geometry']})
 if '76670' not in [f['properties']['codigo'] for f in selected]:raise ValueError('DANE no devolvió polígono 76670; no publicar geografía incompleta')
 payload={'type':'FeatureCollection','fuente':DANE,'corte':'2025','features':selected}
 (ROOT/'geografiaMunicipal76670.json').write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 print('GEO_DANE_MUNICIPIOS='+str([(f['properties']['codigo'],f['properties']['municipio']) for f in selected]))
 try:
  data=get(UPME,{'where':'cod_mpio IN ('+attrs+')','outFields':'*','returnGeometry':'false','f':'json'},timeout=90)
  rows=[]
  for f in data.get('features',[]):
   x=f.get('attributes',{});code=str(x.get('cod_mpio','')).split('.')[0].zfill(5)
   if code not in codes:continue
   ice=x.get('iceetotal')
   try:ice=float(ice)
   except (ValueError,TypeError):continue
   if not (0<=ice<=100):continue
   rows.append({'divipola':code,'anio':int(x.get('vigencia')),'indicador':'ICET-65','valor':ice,'unidad':'%','fuente':UPME,
     'viviendas_conectadas':x.get('vcstotal'),'viviendas_total':x.get('vttotal')})
  if not any(x['divipola']=='76670' for x in rows):raise ValueError('UPME no devolvió San Pedro')
  (ROOT/'energiaMunicipiosReferencia.json').write_text(json.dumps({'fuente':UPME,'registros':rows},ensure_ascii=False,indent=2),encoding='utf-8')
  print('ENERGIA_MUNICIPIOS='+str([(x['divipola'],x['anio'],x['valor']) for x in rows]))
 except Exception as e:print('ENERGIA_REF_NO_ACTUALIZADA '+repr(e))
if __name__=='__main__':export()
