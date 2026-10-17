#!/usr/bin/env python3
"""Extract DANE definitive 2024 *residence*-based municipal death-cause table.
Public aggregated counts only; never individual death records nor names.
"""
import json,urllib.request,pathlib,tempfile,re
from python_calamine import CalamineWorkbook
URL='https://www.dane.gov.co/files/operaciones/EEVV/2026/6-feb-2026/anex-EEVV-DefuncionesNoFetalesCuadroUnificado-2024.xlsx'
DEST=pathlib.Path('src/data/daneDefunciones76670_2024.json')
req=urllib.request.Request(URL,headers={'User-Agent':'Mozilla/5.0'})
with urllib.request.urlopen(req,timeout=150) as r:data=r.read(20000001)
if not data.startswith(b'PK') or len(data)>20000000:raise ValueError('DANE XLSX could not be verified')
with tempfile.NamedTemporaryFile(suffix='.xlsx') as f:
 f.write(data);f.flush()
 wb=CalamineWorkbook.from_path(f.name)
 causes=wb.get_sheet_by_name('Cuadro5').to_python()
 total_rows=wb.get_sheet_by_name('Cuadro4').to_python()
ages=['menor_1','edad_1_4','edad_5_14','edad_15_44','edad_45_64','edad_65_84','edad_85_99','edad_100_mas','desconocida']
def count(v):
 if v is None or str(v).strip() in ('','-'):return 0
 try:
  x=int(float(v))
  if x<0:raise ValueError('negative count')
  return x
 except Exception as e:raise ValueError('invalid DANE count '+repr(v)) from e
def parse(row):
 return {'total':count(row[5]),'hombres':count(row[6]),'mujeres':count(row[7]),'indeterminado':count(row[8]),
  'edades':{label:sum(count(row[9+3*i+j]) for j in range(3)) for i,label in enumerate(ages)}}
subset=[(i,r) for i,r in enumerate(causes) if len(r)>35 and str(r[1])=='76670' and str(r[0])=='76']
if not subset:raise ValueError('No municipal death table San Pedro 76670')
group_total=next((parse(row) for i,row in subset if str(row[4]).strip()=='TOTAL'),None)
if group_total is None:raise ValueError('Missing DANE TOTAL row')
entries=[]
for i,row in subset:
 name=str(row[4]).strip()
 if name=='TOTAL' or not name:continue
 value=parse(row)
 # Detailed cause code same as DANE list 6/67. Cannot compare exact CIE-10 if broader grouping.
 match=re.match(r'^(\d{3})\s+(.*)$',name)
 if match:code,title=match.groups()
 else:code='';title=name
 entries.append({'grupo':code,'nombre':title,'fila_original':i+1,**value})
if sum(x['total'] for x in entries)!=group_total['total']:
 raise ValueError('Cause list is not exhaustive - DO NOT infer true zero for omitted causes')
if any(sum(x['edades'].values())!=x['total'] or x['hombres']+x['mujeres']+x['indeterminado']!=x['total'] for x in entries):
 raise ValueError('Age/sex grouping invalid')
residence=[row for row in total_rows if len(row)>8 and str(row[0])=='76' and str(row[1])=='76670' and str(row[4]).strip()=='TOTAL']
if len(residence)!=1 or count(residence[0][5])!=group_total['total']:raise ValueError('DANE residence total conflict')
out={'municipio':'San Pedro','divipola':'76670','anio':2024,'territorio':'municipio de residencia habitual del fallecido',
 'fuente':URL,'tabla':'Cuadro5 (causa 6/67 OPS) y Cuadro4 (residencia)','total_defunciones':group_total['total'],
 'total_hombres':group_total['hombres'],'total_mujeres':group_total['mujeres'],
 'registros_causa':entries,'verificaciones':['suma causas=defunciones residentes',
    'grupo de edades suma total de cada causa','municipio de residencia, no ocurrencia']}
DEST.parent.mkdir(parents=True,exist_ok=True)
DEST.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print('DANE_RESIDENTES_76670',group_total['total'],'CAUSAS',len(entries))
for x in entries:print('DANE_CAUSA',x['grupo'],x['nombre'],'TOTAL',x['total'],'EDADES',x['edades'])
print('JSON_PUBLICABLE',str(DEST))
