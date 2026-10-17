#!/usr/bin/env python3
"""Descarga controlada de dos documentos aprobados del Concejo de San Pedro.
Solo documentos oficiales públicos; conserva hash y resultado de cada solicitud.
"""
import datetime, hashlib, json, pathlib, urllib.request
out=pathlib.Path("documentos_oficiales");out.mkdir(exist_ok=True)
fuentes={
 "PDT_2024_2027.pdf":"https://www.concejosanpedrovalle.gov.co/wp-content/uploads/2024/06/ACUERDO-MUNICIPAL-004-2024-PLAN-DE-DESARROLLO-2024-2027.pdf",
 "PTS_2024_2027.pdf":"https://www.concejosanpedrovalle.gov.co/wp-content/uploads/2024/06/PLAN-TERRITORIAL-DE-SALUD-2024-2027.pdf"
}
manifest=[]
for name,url in fuentes.items():
 info={"nombre":name,"url":url,"descarga_utc":datetime.datetime.now(datetime.timezone.utc).isoformat()}
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; ObservatorioSanPedro/1.0; scientific research)"})
  with urllib.request.urlopen(req,timeout=95) as res:
   payload=res.read(50_000_001)
  if len(payload)>50_000_000 or not payload.startswith(b"%PDF"):
   raise ValueError("El recurso no devolvió un PDF válido o excedió 50 MB")
  (out/name).write_bytes(payload)
  info.update({"estado":"descargado","bytes":len(payload),"sha256":hashlib.sha256(payload).hexdigest()})
 except Exception as ex:
  info.update({"estado":"error","incidencia":str(ex)[:300]})
 manifest.append(info)
 print(name,info["estado"],info.get("bytes"),info.get("incidencia",""))
(out/"MANIFIESTO.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
