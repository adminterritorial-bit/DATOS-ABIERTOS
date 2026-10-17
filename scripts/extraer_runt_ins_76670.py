#!/usr/bin/env python3
"""RUNT y SIVIGILA: filas oficiales agregadas del municipio San Pedro Valle 76670."""
import json,urllib.parse,urllib.request,pathlib
OUT=pathlib.Path('src/data');OUT.mkdir(parents=True,exist_ok=True)
def get(uri,query):
 url=uri+'?'+urllib.parse.urlencode(query)
 req=urllib.request.Request(url,headers={'User-Agent':'Observatorio-San-Pedro-76670/1.0','Accept':'application/json'})
 with urllib.request.urlopen(req,timeout=105) as r:return json.load(r)
def money(x):
 try:return float(x)
 except (ValueError,TypeError):return 0.0
def runt():
 uri='https://www.datos.gov.co/resource/u3vn-bdcy.json'
 where="upper(nombre_departamento)='VALLE DEL CAUCA' AND upper(nombre_municipio)='SAN PEDRO'"
 result=[]
 for n in range(0,75000,5000):
  rows=get(uri,{'$where':where,'$limit':5000,'$offset':n,'$order':':id'})
  if not isinstance(rows,list):raise ValueError('Respuesta RUNT no tabular')
  result+=rows
  if len(rows)<5000:break
 print('RUNT_SAN_PEDRO_FILAS',len(result))
 if not result:raise ValueError('RUNT no devolvió San Pedro Valle')
 cuts=sorted(set((str(x.get('a_o_de_publicacion','')),str(x.get('mes_de_publicacion',''))) for x in result))
 print('RUNT_CORTES',cuts[-12:])
 # Latest publication year, but month strings could be labels names. Choose most frequent/month if sortable.
 from collections import Counter
 counts=Counter((str(x.get('a_o_de_publicacion')),str(x.get('mes_de_publicacion'))) for x in result)
 latestyear=max(int(y) for y,m in counts if y.isdigit())
 months=[(m,c) for (y,m),c in counts.items() if y==str(latestyear)]
 print('RUNT_MESES_ULTIMO',months)
 # Keep latest publication available by chronological Spanish month mapping
 names={'ENERO':1,'FEBRERO':2,'MARZO':3,'ABRIL':4,'MAYO':5,'JUNIO':6,'JULIO':7,'AGOSTO':8,'SEPTIEMBRE':9,'OCTUBRE':10,'NOVIEMBRE':11,'DICIEMBRE':12}
 def nmonth(s):
  import unicodedata
  a=''.join(c for c in unicodedata.normalize('NFKD',s) if not unicodedata.combining(c)).upper()
  return names.get(a,int(s) if s.isdigit() else 0)
 month=max(months,key=lambda mc:nmonth(mc[0]))[0]
 cut=[x for x in result if str(x.get('a_o_de_publicacion'))==str(latestyear) and str(x.get('mes_de_publicacion'))==month]
 from collections import defaultdict
 by_state=defaultdict(float);by_class=defaultdict(float);by_service=defaultdict(float)
 for row in cut:
  val=money(row.get('cantidad'))
  st=str(row.get('estado_del_vehiculo','')).upper()
  by_state[st]+=val
  by_class[str(row.get('nombre_de_la_clase','')).upper()]+=val
  by_service[str(row.get('nombre_servicio','')).upper()]+=val
 payload={'dataset':'https://www.datos.gov.co/d/u3vn-bdcy','divipola':'76670','departamento':'Valle del Cauca','municipio':'San Pedro',
          'corte':str(latestyear)+'-'+month,'conteo_filas':len(cut),
          'por_estado':dict(by_state),'por_clase':dict(by_class),'por_servicio':dict(by_service),
          'total':sum(by_state.values())}
 (OUT/'runtSanPedro76670.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
 print('RUNT_AGREGADO',json.dumps(payload,ensure_ascii=False)[:13500])
def sivigila():
 # 2018 SIVIGILA INS: official event counts by municipality of OCCURRENCE (COD_MUN_O).
 base='https://www.datos.gov.co/resource/xd2n-cu8j.json'
 metadata=get('https://www.datos.gov.co/api/views/xd2n-cu8j.json',{})
 print('INS_COLUMNAS',[x.get('fieldName') for x in metadata.get('columns',[])])
 candidates=[]
 for where in ("cod_mun_o=76670","cod_mun_o=670 AND cod_dpto_o=76"):
  try:
   res=get(base,{'$where':where,'$limit':20000})
   if not isinstance(res,list):raise ValueError('no rows')
   print('INS_FILTRO',where,'filas',len(res))
   if res:candidates=res;break
  except Exception as e:print('INS_FILTRO_ERROR',where,str(e)[:200])
 if not candidates:
  print('INS_NO_COINCIDENCIAS 76670 / 670+76 (no asumir cero)');return
 from collections import defaultdict
 agg=defaultdict(float)
 for r in candidates:
  k=(str(r.get('ano','')),str(r.get('cod_eve','')),str(r.get('nombre','')))
  agg[k]+=money(r.get('conteo_casos'))
 results=[{'anio':int(a) if a.isdigit() else None,'codigo_evento':c,'evento':n,'casos_notificados':v} for (a,c,n),v in agg.items()]
 results.sort(key=lambda x: (x['anio'] or 0,x['codigo_evento']))
 payload={'fuente':'https://www.datos.gov.co/d/xd2n-cu8j','filtro':where,'geografia':'notificacion ocurrencia (según variable original)','eventos':results}
 (OUT/'insSivigilaSanPedro76670.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
 print('INS_EVENTOS_76670',json.dumps(results[:150],ensure_ascii=False)[:20000])
if __name__=='__main__':
 for fn in (runt,sivigila):
  try:fn()
  except Exception as e:print('ERROR_EXTRACCION',fn.__name__,repr(e))
