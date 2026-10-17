#!/usr/bin/env python3
"""Extract 2024 five-year bands of San Pedro from the official DANE age/sex/area population workbook."""
import urllib.request,tempfile,json,re,pathlib
from python_calamine import CalamineWorkbook
SOURCE='https://www.dane.gov.co/files/censo2018/proyecciones-de-poblacion/Municipal/PPED-AreaSexoEdadMun-2018-2042_VP.xlsx'
req=urllib.request.Request(SOURCE,headers={'User-Agent':'Mozilla/5.0'})
with urllib.request.urlopen(req,timeout=150) as r:data=r.read(90_000_001)
print('DANE_AGE_SIZE',len(data))
if not data.startswith(b'PK') or len(data)>90_000_000:raise ValueError('DANE age workbook format invalid')
with tempfile.NamedTemporaryFile(suffix='.xlsx') as f:
 f.write(data);f.flush()
 book=CalamineWorkbook.from_path(f.name)
 print('DANE_AGE_SHEETS',book.sheet_names)
 for sheet in book.sheet_names:
  rows=book.get_sheet_by_name(sheet).to_python()
  print('DANE_AGE_SHEET',sheet,'ROWS',len(rows),'HEAD',json.dumps(rows[:9],ensure_ascii=False)[:5200])
  subset=[]
  for i,row in enumerate(rows):
   if len(row)<7:continue
   as_strings=[str(x).strip() for x in row]
   if any(x in ('76670','76670.0') for x in as_strings) and any(x in ('2024','2024.0') for x in as_strings):
    subset.append((i+1,[str(x)[:80] for x in row[:16]]))
  print('DANE_AGE_MATCHES',sheet,len(subset),'SAMPLE',json.dumps(subset[:12],ensure_ascii=False)[:7500])
