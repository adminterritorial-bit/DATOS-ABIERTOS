#!/usr/bin/env python3
"""Modelos exploratorios de áreas pequeñas: SAN PEDRO 76670.
Entradas: población DANE PPED 2018/2026; notificaciones SIVIGILA 2018 y flota RUNT 2026
de municipios comparables; análisis leave-one-out y amplitud intermunicipal.
NO transforma ausencia de San Pedro en caso oficial cero.
"""
from __future__ import annotations
import json, urllib.request, urllib.parse, math, pathlib, statistics, random
from collections import defaultdict
from python_calamine import CalamineWorkbook
CODES=['76036','76111','76113','76318','76616','76670','76834','76890']
NEIGHBORS=[c for c in CODES if c!='76670']
SRC_DANE='https://www.dane.gov.co/files/censo2018/proyecciones-de-poblacion/Municipal/PPED-AreaMun-2018-2042_VP.xlsx'
SRC_INS='https://www.datos.gov.co/d/xd2n-cu8j'
SRC_RUNT='https://www.datos.gov.co/d/u3vn-bdcy'
OUT=pathlib.Path('src/data');OUT.mkdir(parents=True,exist_ok=True)
def get(url,args=None,timeout=140):
 u=url+('?'+urllib.parse.urlencode(args) if args else '')
 req=urllib.request.Request(u,headers={'User-Agent':'SanPedro-Observatorio-Comparables/1.0','Accept':'application/json'})
 with urllib.request.urlopen(req,timeout=timeout) as r:return json.load(r)
def pop_dane():
 req=urllib.request.Request(SRC_DANE,headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(req,timeout=165) as r:data=r.read(10000000)
 if data[:2]!=b'PK':raise ValueError('DANE workbook invalid')
 import tempfile
 with tempfile.NamedTemporaryFile(suffix='.xlsx') as f:
  f.write(data);f.flush()
  sh=CalamineWorkbook.from_path(f.name).get_sheet_by_name('PobMunicipalxÁrea').to_python()
 result={}
 for row in sh:
  if len(row)<7:continue
  code=str(row[2]).split('.')[0]
  if code not in CODES:continue
  try:y=int(float(row[4])); n=int(float(row[6]))
  except (ValueError,TypeError):continue
  if y not in (2018,2026):continue
  rec=result.setdefault((code,y),{})
  area=str(row[5])
  if area=='Total':rec['total']=n
  elif area.startswith('Cabecera'):rec['urbano']=n
  elif area.startswith('Centros'):rec['rural']=n
 for code in CODES:
  for y in (2018,2026):
   r=result.get((code,y),{})
   if not r.get('total') or r.get('urbano',0)+r.get('rural',0)!=r.get('total'):raise ValueError(f'DANE no tiene población válida {code} {y}')
 return result
def ins_counts():
 data={}
 for code in CODES:
  dep=int(code[:2]);mun=int(code[2:])
  records=get('https://www.datos.gov.co/resource/xd2n-cu8j.json',
       {'$where':f'cod_mun_o={mun} AND cod_dpto_o={dep}','$select':'cod_eve,sum(conteo_casos) as casos',
        '$group':'cod_eve','$limit':1000},timeout=85)
  data[code]={str(r.get('cod_eve')):float(r.get('casos') or 0) for r in records}
 return data
def runt_counts():
 alias={'76036':'ANDALUCIA','76111':'BUGA','76113':'BUGALAGRANDE','76318':'GUACARI',
        '76616':'RIOFRIO','76670':'SAN PEDRO','76834':'TULUA','76890':'YOTOCO'}
 data={}
 for code,name in alias.items():
  # RUNT 2.0 registrations aggregated by year-of-registration: sum cohort years
  # ONLY latest publication month/year to prevent counting same cumulative total repeatedly.
  where=f"upper(nombre_departamento)='VALLE DEL CAUCA' AND upper(nombre_municipio)='{name}' AND a_o_de_publicacion=2026 AND mes_de_publicacion='OCTUBRE'"
  try:
   rows=get('https://www.datos.gov.co/resource/u3vn-bdcy.json',
     {'$where':where,'$select':'nombre_servicio,estado_del_vehiculo,sum(cantidad) as cantidad',
       '$group':'nombre_servicio,estado_del_vehiculo','$limit':300},timeout=100)
   if not isinstance(rows,list):raise ValueError('respuesta no tabular')
   states=defaultdict(float);serv=defaultdict(float)
   for r in rows:
    st=str(r.get('estado_del_vehiculo','')).upper()
    if st not in ('ACTIVO','INCONSISTENTE'):continue
    n=float(r.get('cantidad') or 0)
    states[st]+=n;serv[str(r.get('nombre_servicio','')).upper()]+=n
   data[code]={'municipio':name,'total':sum(states.values()),'servicios':dict(serv),'estados':dict(states),'filas':len(rows)}
   print('RUNT_MUNICIPIO',code,data[code])
  except Exception as e:print('RUNT_ERROR',code,str(e)[:190])
 return data
def distance(a,b,pop,year):
 a1=pop[(a,year)];b1=pop[(b,year)]
 logdist=abs(math.log(a1['total']/b1['total']))
 urban_dist=abs(a1['urbano']/a1['total']-b1['urbano']/b1['total'])
 return logdist+2*urban_dist
def weighted_rate(target,comparators,values,pop,year):
 neighbors=sorted([c for c in comparators if c in values and c!=target and pop[(c,year)]['total']>0],
     key=lambda c:distance(target,c,pop,year))[:7]
 if not neighbors:return None
 # Positive smoothing accounts for distance, not automatically inventing local observations.
 weights={c:1/(0.20+distance(target,c,pop,year)) for c in neighbors}
 n=sum(weights[c]*(values[c]/pop[(c,year)]['total']) for c in neighbors)/sum(weights.values())
 return n,neighbors,weights
def weighted_eval(target,values,pop,year):
 x=weighted_rate(target,list(values),values,pop,year)
 if not x:return None
 frac,neighbors,weights=x
 rates=[values[c]/pop[(c,year)]['total'] for c in neighbors]
 return {'proporcion':frac,'vecinos':neighbors,'pesos':{k:round(v,6) for k,v in weights.items()},
   'rango_vecinos':[min(rates),max(rates)]}
def loo(vals,pop,year):
 errors=[]
 for c in vals:
  rem={k:v for k,v in vals.items() if k!=c}
  est=weighted_eval(c,rem,pop,year)
  if est:
   act=vals[c]/pop[(c,year)]['total']
   errors.append(abs(est['proporcion']-act)*100000)
 return errors
def main():
 pop=pop_dane(); ins=ins_counts();runt=runt_counts()
 data={'municipio':'San Pedro','divipola':'76670','modelo':'análogos territoriales por distancia demográfica (población + fracción urbana)',
    'poblacion_dane':{'fuente':SRC_DANE,'base_2018':pop[('76670',2018)],'base_2026':pop[('76670',2026)]},
    'version':'1.1','estimaciones':[],'rechazadas':[],'observaciones_comparadores':[]}
 def append(icet,label,vals,year,unit,scale,source,variable,note,min_neighbors=2):
  v=weighted_eval('76670',vals,pop,year)
  if not v or len(v['vecinos'])<min_neighbors:return
  if all(float(vals[c])==0 for c in v['vecinos']):
   data['rechazadas'].append({'icet':icet,'motivo':'Municipios comparables sin eventos notificados: no transformar ausencia de filas en estimación oficial cero'})
   return
  if scale=='cuenta':
   positive_rates=[vals[c]/pop[(c,year)]['total'] for c in v['vecinos'] if vals[c]>0]
   if len(positive_rates)<4 or max(positive_rates)/min(positive_rates)>8:
    data['rechazadas'].append({'icet':icet,'motivo':'RUNT tiene sesgo de municipio de matriculación: tasas vecinales difieren más de 8 veces o hay escasa cobertura. Modelo rechazado, no publicar total municipal estimado.',
       'rango_vehiculos_por_habitante':[round(min(positive_rates),5),round(max(positive_rates),5)]})
    print('MODELO_RECHAZADO',icet,'heterogeneidad intermunicipal extrema')
    return
  target=pop[('76670',year)]['total']
  result=v['proporcion']*target if scale=='cuenta' else v['proporcion']*scale
  multiplier=1 if scale=='cuenta' else scale
  observed=[vals[c]/pop[(c,year)]['total']*multiplier for c in v['vecinos']]
  errors=loo(vals,pop,year)
  record={'id':'EST-'+icet.replace('-','')+'-'+str(year),'icet':icet,'nombre':label,'valor':round(result,2),
   'unidad':unit,'anio':year,'tipo':'ESTIMACION_EXPLORATORIA_NO_OFICIAL','nivel':'D',
   'fuente':source,'fuente_poblacion':SRC_DANE,'municipios_referencia':v['vecinos'],
   'n_observaciones_referencia':len(v['vecinos']),'insumo':variable,'valores_observados_referencia':{c:vals[c] for c in v['vecinos']},
   'poblaciones_referencia':{c:pop[(c,year)]['total'] for c in v['vecinos']},
   'pesos':v['pesos'],'rango_tasas_referencia':[round(min(observed),3),round(max(observed),3)],
   'error_abs_loo_mediano':round(statistics.median(errors),3) if errors else None,
   'escala_error_loo':'diferencia en razón por 100.000 habitantes (no intervalo predictivo)',
   'formula':'Tasa esperada = suma[peso_i * (conteo_i / población_i)] / suma[peso_i]; peso_i = 1 / (0,20 + |ln(P_i/P_sp)| + 2*|urb_i/P_i - urb_sp/P_sp|)',
   'nota':note}
  data['estimaciones'].append(record)
  print('ESTIMACION',icet,year,round(result,3),unit,'VECINOS',v['vecinos'],'LOO',record['error_abs_loo_mediano'])
 for icet,label,codes,unit in [
 ('ICET-27','Incidencia territorial de notificaciones de hepatitis B 2018 (referencia analógica)',['340'],'notificaciones por 100.000 hab.'),
 ('ICET-28','Incidencia territorial de notificaciones de malaria 2018 (referencia analógica)',['465','470','480','490'],'notificaciones por 100.000 hab.'),
 ('ICET-29','Incidencia territorial de tuberculosis 2018 (referencia comparativa)',['810','820'],'notificaciones por 100.000 hab.')]:
  vals={c:sum(ins[c].get(v,0) for v in codes) for c in NEIGHBORS}
  # Zero is used strictly as missing event in complete INS annual events table of comparators,
  # not a claim that zero persons were affected in life.
  append(icet,label,vals,2018,unit,100000,SRC_INS,'SIVIGILA eventos '+','.join(codes),
    'ESCENARIO EXPLORATORIO. SIVIGILA 2018 notificaciones por municipio de origen/ocurrencia (no se confirma residencia ni incidencia real). La ausencia de fila se asume cero notificaciones en el extracto completo únicamente para estimar tasas vecinales; no es un cero oficial de San Pedro.',min_neighbors=4)
 vals={c:runt[c]['total'] for c in NEIGHBORS if c in runt and runt[c]['total']>0}
 append('ICET-11','Parque automotor registrado, esperado desde municipios comparables',vals,2026,'vehículos estimados', 'cuenta',
   SRC_RUNT,'RUNT estado activo e inconsistente, corte octubre 2026',
   'ESCENARIO EXPLORATORIO, NO VEHÍCULOS REALES REGISTRADOS EN SAN PEDRO. No hay filas directas del municipio en este conjunto RUNT. Extrapolación de intensidad de matriculación por habitante entre municipios cercanos, ajustada por estructura urbana y tamaño. No supone que los vehículos circulen físicamente en San Pedro.',min_neighbors=4)
 (OUT/'escenariosComparables76670.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
 print('RESULTADOS_ESTIMADOS',len(data['estimaciones']))
if __name__=='__main__':
 try:main()
 except Exception as e:
  print('MODELO_ERROR',repr(e))
  raise
