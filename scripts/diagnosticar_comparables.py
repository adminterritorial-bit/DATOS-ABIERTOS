#!/usr/bin/env python3
"""Diagnóstico de insumos para modelos territoriales 2018 entre municipios del entorno.
No publica valores imputados sin validar numerador, población y definición.
"""
import json,urllib.request,urllib.parse,pathlib
from python_calamine import CalamineWorkbook
codes=['76036','76111','76113','76318','76616','76670','76834','76890']
url='https://www.dane.gov.co/files/censo2018/proyecciones-de-poblacion/Municipal/PPED-AreaMun-2018-2042_VP.xlsx'
def get(url,params):
 u=url+'?'+urllib.parse.urlencode(params)
 req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(req,timeout=150) as r:return json.load(r)
try:
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(req,timeout=160) as r:data=r.read(30000000)
 print('DANE_XLSX_BYTES',len(data))
 assert data[:2]==b'PK'
 pathlib.Path('out').mkdir(exist_ok=True)
 p=pathlib.Path('out/dane_poblacion_comparables.xlsx');p.write_bytes(data)
 wb=CalamineWorkbook.from_path(str(p))
 print('DANE_SHEETS',wb.sheet_names)
 for sh in wb.sheet_names:
  rows=wb.get_sheet_by_name(sh).to_python()
  print('DANE_HOJA',sh,'FILAS',len(rows),'ENCABEZADOS',json.dumps(rows[:7],ensure_ascii=False)[:3100])
  matches=[]
  for idx,row in enumerate(rows):
   ss=[str(x).strip().split('.')[0] for x in row]
   if any(c in ss for c in codes):
    matches.append({'linea':idx+1,'datos':[str(x)[:30] for x in row[:17]]})
    if len(matches)>=8:break
  print('DANE_COINCIDENCIAS',sh,json.dumps(matches,ensure_ascii=False)[:3600])
except Exception as e:print('DANE_ERROR',str(e)[:500])
for label,q in [('ANDALUCIA',"upper(nombre_municipio) like '%ANDALUCIA%'"),('TULUA',"upper(nombre_municipio) like '%TULU%'"),('BUGALAGRANDE',"upper(nombre_municipio) like '%BUGALAGRANDE%'"),('SAN PEDRO',"upper(nombre_municipio) like '%PEDRO%'")]:
 try:
  d=get('https://www.datos.gov.co/resource/u3vn-bdcy.json',{'$where':q,'$limit':5})
  print('RUNT_DIAG',label,len(d),json.dumps(d[:2],ensure_ascii=False)[:950])
 except Exception as e:print('RUNT_DIAG_ERROR',label,str(e)[:180])
for c in codes:
 try:
  code=int(c[2:]);dpt=int(c[:2])
  d=get('https://www.datos.gov.co/resource/xd2n-cu8j.json',{'$where':f'cod_mun_o={code} AND cod_dpto_o={dpt}', '$select':'cod_eve,nombre,sum(conteo_casos) as casos',
        '$group':'cod_eve,nombre','$order':'casos DESC','$limit':100})
  events=[{'nombre':x.get('nombre'),'cod':x.get('cod_eve'),'casos':x.get('casos')} for x in d]
  print('INS_COMPARABLE',c,'EVENTOS',len(events),json.dumps(events[:25],ensure_ascii=False)[:3300])
 except Exception as e:print('INS_COMPARABLE_ERROR',c,str(e)[:180])
