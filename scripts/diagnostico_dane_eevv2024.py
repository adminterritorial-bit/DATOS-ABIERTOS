#!/usr/bin/env python3
"""Investigación de estructura (SIN publicar Excel) de cuadros oficiales DANE EEVV 2024."""
import json,urllib.request,tempfile
from python_calamine import CalamineWorkbook
url='https://www.dane.gov.co/files/operaciones/EEVV/2026/6-feb-2026/anex-EEVV-DefuncionesNoFetalesCuadroUnificado-2024.xlsx'
req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
try:
 with urllib.request.urlopen(req,timeout=140) as response:
  blob=response.read(60_000_001)
 print('DANE_EEVV_BYTES',len(blob))
 if not blob.startswith(b'PK') or len(blob)>60_000_000:raise ValueError('Workbook inválido')
 with tempfile.NamedTemporaryFile(suffix='.xlsx') as f:
  f.write(blob);f.flush()
  book=CalamineWorkbook.from_path(f.name)
  print('DANE_EEVV_SHEETS',book.sheet_names)
  for sheet in book.sheet_names:
   rows=book.get_sheet_by_name(sheet).to_python()
   idx=[]
   for j,row in enumerate(rows):
    if any(str(x).strip().upper() in ('76670','76670.0','SAN PEDRO','SAN PEDRO VALLE DEL CAUCA') for x in row):
     idx.append(j)
   print('DANE_SHEET',sheet,'N',len(rows),'MUNICIPIO_COINCIDENCIAS',len(idx),'CABECERAS',json.dumps(rows[:10],ensure_ascii=False)[:2100])
   for j in idx[:12]:print('DANE_76670_LINEA',sheet,j+1,json.dumps(rows[j][:40],ensure_ascii=False)[:3200])
except Exception as e:print('DANE_EEVV_ERROR',repr(e))
