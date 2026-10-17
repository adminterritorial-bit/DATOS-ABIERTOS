#!/usr/bin/env python3
"""Consulta de datos abiertos de UPME y RUV para San Pedro 76670.
Nunca convierte no-disponible a cero. Guarda únicamente agregados y metadatos;
no publica microdatos personales. Ejecutable desde GitHub Actions.
"""
import datetime as dt, json, pathlib, time, urllib.request, urllib.parse
from collections import Counter, defaultdict

CODE="76670"
OUT=pathlib.Path("out/masivo_76670"); OUT.mkdir(parents=True,exist_ok=True)
UPME="https://geo.upme.gov.co/server/rest/services/Capas_EnergiaElectrica/indice_cobertura_energia_electrica_mpio/FeatureServer/26/query"
RUV={"municipal":"ykxr-xynr","por_hecho":"9qih-4vkc"}
REPORT={"municipio":"San Pedro","divipola":CODE,"extraido_utc":dt.datetime.now(dt.timezone.utc).isoformat(),"fuentes":{},"observaciones":[]}

def fetch(url,params=None,timeout=70):
    uri=url+("?"+urllib.parse.urlencode(params) if params else "")
    req=urllib.request.Request(uri,headers={"User-Agent":"Observatorio-San-Pedro-76670/1.0","Accept":"application/json"})
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req,timeout=timeout) as r:
                data=r.read(30000001)
            if len(data)>30000000:raise ValueError("Respuesta supera 30 MB")
            d=json.loads(data)
            if isinstance(d,dict) and "error" in d:raise ValueError(str(d.get("message",d["error"]))[:300])
            return d
        except Exception as e:
            if attempt:raise
            time.sleep(2)

def number(v):
    try:
        x=float(str(v))
        return x if -1e12<x<1e12 else None
    except (TypeError,ValueError):return None

def put(id,nombre,valor,unidad,anio,fuente,icet=None,metodo="PUBLICADO",nota=""):
    x=number(valor)
    if x is not None:
        REPORT["observaciones"].append(dict(id=id,nombre=nombre,valor=x,unidad=unidad,anio=anio,fuente=fuente,divipola=CODE,icet=icet,metodo=metodo,nota=nota))

def extract_upme():
    item=REPORT["fuentes"]["UPME_ICEE"]={"estado":"consultando","url":UPME}
    params={"where":"cod_mpio='76670'","outFields":"*","returnGeometry":"false","f":"json","resultRecordCount":2000}
    try:
        response=fetch(UPME,params,timeout=95)
        features=response.get("features",[])
        item["filas_municipales"]=len(features)
        item["registros_originales"]=[f.get("attributes",{}) for f in features]
        item["estado"]="extraido" if features else "sin_fila_devueltas"
        for f in features:
            a=f.get("attributes",{})
            if str(a.get("cod_mpio","")).strip() not in ("76670","76670.0"):continue
            ys=str(a.get("vigencia","")).strip()
            import re
            m=re.search(r"(20[0123]\d)",ys); yr=int(m.group(1)) if m else None
            suffix=str(yr or ys or "sin_fecha")
            cs=number(a.get("vcstotal"));vt=number(a.get("vttotal"));ice=number(a.get("iceetotal"))
            expected=(cs*100/vt) if cs is not None and vt and vt>0 else None
            if ice is not None and 0<=ice<=1 and expected is not None and abs(ice*100-expected)<3:ice*=100
            if ice is not None and expected is not None and abs(ice-expected)>5:
                item.setdefault("alertas",[]).append("ICEE vs componentes difieren "+suffix)
            elif ice is not None:put("UPME-ICEE-"+suffix,"Cobertura de energía eléctrica ICEE total",ice,"%",yr,UPME,icet="ICET-65")
            if expected is not None:put("UPME-ICEE-CALC-"+suffix,"Cobertura energética reconstruida por viviendas",round(expected,3),"%",yr,UPME,icet="ICET-65",metodo="CALCULADO",nota="100 × viviendas con servicio / viviendas totales")
            for k,n in [("vcstotal","Viviendas conectadas"),("vttotal","Viviendas existentes"),("vsstotal","Viviendas sin conexión")]:
                put("UPME-"+k+"-"+suffix,n,a.get(k),"viviendas",yr,UPME)
            for k,n in [("iceeurbano","Cobertura urbana de energía"),("iceerural","Cobertura rural de energía")]:
                put("UPME-"+k+"-"+suffix,n,a.get(k),"%",yr,UPME)
    except Exception as e:item.update(estado="error_consulta",incidencia=str(e)[:350])

def extract_ruv():
    for tipo,dataset in RUV.items():
        url="https://www.datos.gov.co/resource/"+dataset+".json"
        item=REPORT["fuentes"]["RUV_"+tipo]={"estado":"consultando","url":url,"dataset":dataset}
        try:
            rows=[]
            for offset in range(0,100000,5000):
                part=fetch(url,{"$where":"cod_ciudad_muni=76670","$limit":5000,"$offset":offset,"$order":":id"},timeout=90)
                if not isinstance(part,list):raise ValueError("Formato Socrata inesperado")
                rows.extend(part)
                if len(part)<5000:break
            item["filas_municipales"]=len(rows)
            if len(rows)>=100000:item["estado"]="paginacion_incompleta";continue
            if not rows:item["estado"]="sin_filas_devueltas";continue
            item["estado"]="extraido"
            item["campos"]=list(rows[0])
            item["cortes"]=dict(Counter(str(x.get("fecha_corte")) for x in rows).most_common(15))
            item["tipos_reporte"]=dict(Counter(str(x.get("nom_rpt")) for x in rows).most_common(20))
            if tipo=="por_hecho":
                out=defaultdict(lambda:{"filas":0,"per_ocu_sum_celdas":0.0,"per_ubic_sum_celdas":0.0,"per_decla_sum_celdas":0.0})
                for a in rows:
                    k=(str(a.get("fecha_corte","")),str(a.get("nom_rpt","")),str(a.get("hecho","")))
                    out[k]["filas"]+=1
                    for v,f in [("per_ocu","per_ocu_sum_celdas"),("per_ubic","per_ubic_sum_celdas"),("per_decla","per_decla_sum_celdas")]:
                        x=number(a.get(v))
                        if x is not None:out[k][f]+=x
                item["agregados_exploratorios_por_hecho"]=[dict(fecha_corte=k[0],tipo_reporte=k[1],hecho=k[2],**v) for k,v in out.items()]
                item["nota"]="La suma de celdas por hecho NO acredita víctimas únicas, ni directamente las variables ICET-59/62/63."
        except Exception as e:item.update(estado="error_consulta",incidencia=str(e)[:350])


def inspect_candidate_datasets():
    # Discovery of public source schemas; only use values if municipality and meaning match.
    ids={
      "SISPRO_MORTALIDAD_MORBILIDAD":"4e4i-ua65",
      "SSPD_RESIDUOS_GENERADOS":"d7pt-p5fi",
      "ACUEDUCTOS_VALLE":"yac9-kq7d",
      "ACUEDUCTOS_COLOMBIA":"6j4v-nnai",
      "SSPD_RUPS":"4qkq-csdn",
      "SALUD_RESOLUCION_256":"m8se-7v3b",
      "INS_SIVIGILA_2019":"qvnt-2igj",
    }
    for label,dataset in ids.items():
        item=REPORT["fuentes"][label]={"dataset":dataset,"estado":"consultando","url":"https://www.datos.gov.co/d/"+dataset}
        try:
            meta=fetch("https://www.datos.gov.co/api/views/"+dataset+".json",timeout=35)
            cols=[{"campo":c.get("fieldName"),"etiqueta":c.get("name"),"tipo":c.get("dataTypeName")} for c in meta.get("columns",[]) if c.get("fieldName")]
            item["columnas"]=cols
            name_map={c["campo"].lower():c["campo"] for c in cols}
            field=next((name_map[v] for v in ("cod_ciudad_muni","codigo_dane_municipio","codigo_municipio","cod_mpio","codmunicipio","divipola","cod_dane","codigo_dane","cod_municipio","municipio") if v in name_map),None)
            if not field:
                field=next((c["campo"] for c in cols if "municip" in c["campo"].lower()),None)
            if not field:
                item["estado"]="columnas_sin_codigo_municipio";continue
            field_type=next((c["tipo"] for c in cols if c["campo"]==field),"text")
            if "code" in field.lower() or "cod" in field.lower() or field.lower()=="divipola":
                w=field+"=76670" if field_type=="number" else field+"='76670'"
            else:
                w="upper("+field+") like '%SAN PEDRO%'"
            item["filtro"]=w
            rows=fetch("https://www.datos.gov.co/resource/"+dataset+".json",{"$where":w,"$limit":15},timeout=60)
            if not isinstance(rows,list):raise ValueError("Listado Socrata no recibido")
            item["filas_muestra"]=len(rows)
            # Inspect at most 5 anonymous tabular rows for data meaning/territory,
            # never expose personal identifiers or health microdata in logs.
            sanitized=[]
            for row in rows[:5]:
                slim={}
                for c in cols:
                    key=c["campo"]; k=key.lower()
                    if any(x in k for x in ("nombre_persona","apellido","identific","documento","telefono","direccion","correo","email","paciente")):continue
                    if key in row:slim[key]=str(row[key])[:95]
                sanitized.append(slim)
            item["muestra"]=sanitized
            item["estado"]="muestra_municipal_extraida" if rows else "sin_filas_coincidentes"
            if rows:print("MUESTRA_FUENTE_"+label+"="+json.dumps({"columnas":cols[:25],"muestra":sanitized[:3]},ensure_ascii=False)[:11000])
        except Exception as e:item.update(estado="error_consulta",incidencia=str(e)[:300])


def extract_sectoral_statistics():
    # Dataset public national: indicators mortalidad/morbilidad, municipality+year
    label="SALUD_MORTALIDAD_MORBILIDAD"
    id="4e4i-ua65"
    url="https://www.datos.gov.co/resource/"+id+".json"
    src=REPORT["fuentes"][label]={"estado":"consultando","url":url}
    try:
        data=fetch(url,{"$where":"codmunicipio='76670'","$limit":50000,"$order":"a_o DESC"},timeout=100)
        if not isinstance(data,list):raise ValueError("Respuesta no tabular")
        # independent verification of both department and municipal code
        rows=[r for r in data if str(r.get("codmunicipio"))=="76670" and str(r.get("coddepartamento")) in ("76","76.0") and "san pedro" in str(r.get("municipio","")).lower()]
        src["filas_coincidentes"]=len(rows)
        if len(data)>=50000:src["estado"]="limite_paginacion";return
        src["estado"]="extraido" if rows else "sin_filas"
        src["indicadores"]=sorted(set(str(x.get("indicador")) for x in rows))
        src["anios"]=sorted(set(str(x.get("a_o")) for x in rows))
        src["filas_agrupadas"]=[]
        seen=set()
        for r in rows:
            name=str(r.get("indicador","")).strip()
            yr=int(float(r.get("a_o"))) if number(r.get("a_o")) is not None else None
            v=number(r.get("valor_indicador"))
            if not name or v is None or yr is None:continue
            k=(name,yr,v)
            if k in seen:continue
            seen.add(k)
            src["filas_agrupadas"].append({"indicador":name,"anio":yr,"valor":v})
        print("SALUD_76670_INDICADORES="+json.dumps(src["filas_agrupadas"][:300],ensure_ascii=False)[:28000])
        # no units available in dataset: preserve original as value without invented % or rates.
    except Exception as e:src.update(estado="error_consulta",incidencia=str(e)[:350])

def extract_services_76670():
    # Clean municipality+department instead of imprecise name search, which matches
    # SAN PEDRO DE LOS MILAGROS (Antioquia) and other homonyms.
    cases=[
      ("SSPD_RESIDUOS_SAN_PEDRO","d7pt-p5fi",
       "upper(departamento_rea_de_prestaci)='VALLE DEL CAUCA' AND upper(municipio_rea_de_prestaci)='SAN PEDRO'"),
      ("SSPD_ACUEDUCTOS_SAN_PEDRO","yac9-kq7d",
       "upper(departamento_prestacion)='VALLE DEL CAUCA' AND upper(municipio_prestacion)='SAN PEDRO'"),
      ("SSPD_RUPS_SAN_PEDRO","4qkq-csdn",
       "upper(departamento_prestacion)='VALLE DEL CAUCA' AND upper(municipio_prestacion)='SAN PEDRO'")
    ]
    for label,id,w in cases:
        url="https://www.datos.gov.co/resource/"+id+".json"
        src=REPORT["fuentes"][label]={"estado":"consultando","url":url}
        try:
            data=fetch(url,{"$where":w,"$limit":15000},timeout=100)
            if not isinstance(data,list):raise ValueError("Formato no tabular")
            src["filas_municipales"]=len(data)
            if len(data)>=15000:src["estado"]="limite_paginacion";continue
            src["estado"]="extraido" if data else "sin_filas"
            if label=="SSPD_RESIDUOS_SAN_PEDRO":
                key_year="a_o_del_cargue"
                src["anios"]=dict(Counter(str(r.get(key_year)) for r in data))
                src["sitios_destino"]=dict(Counter(str(r.get("tipo_de_sitio_destino")) for r in data))
                grouped=defaultdict(lambda:{"filas":0,"ton_no_aprovechables":0.0,"ton_aprovechables":0.0,"ton_rechazo":0.0})
                for r in data:
                    year=str(r.get(key_year) or "sin_fecha")
                    k=(year,str(r.get("tipo_de_sitio_destino") or ""))
                    grouped[k]["filas"]+=1
                    for field,dest in [("toneladas_de_residuos_no","ton_no_aprovechables"),
                                       ("toneladas_de_residuos","ton_aprovechables"),
                                       ("toneladas_del_rechazo_de","ton_rechazo")]:
                        x=number(r.get(field))
                        if x is not None:grouped[k][dest]+=x
                src["por_anio_y_destino"]=[dict(anio=k[0],tipo_destino=k[1],**v) for k,v in grouped.items()]
                print("RESIDUOS_76670="+json.dumps(src["por_anio_y_destino"][:70],ensure_ascii=False)[:16000])
            else:
                src["tipos_servicio"]=dict(Counter(str(r.get("servicio")) for r in data))
                src["prestadores_operativos"]=len(set(str(r.get("nombre")) for r in data if str(r.get("estado","")).upper()=="OPERATIVA"))
                print("SERVICIOS_76670_"+label+"="+json.dumps({"filas":len(data),"servicios":src["tipos_servicio"],"prestadores":src["prestadores_operativos"]},ensure_ascii=False))
        except Exception as e:src.update(estado="error_consulta",incidencia=str(e)[:350])

def discover():
    terms={"SISPRO":["SISPRO indicadores municipales salud","morbilidad municipios Colombia"],
           "INS":["SIVIGILA notificaciones evento municipio","tuberculosis dengue municipios"],
           "SSPD":["SUI cobertura acueducto municipios","SUI servicios públicos aprovechamiento residuos"]}
    for sector,queries in terms.items():
        result=[]
        for q in queries:
            try:
                d=fetch("https://www.datos.gov.co/api/catalog/v1",{"search_context":"datos.gov.co","q":q,"limit":10},timeout=30)
                for r in d.get("results",[]):
                    rr=r.get("resource",{});id=rr.get("id")
                    if id:result.append({"dataset":id,"nombre":rr.get("name"),"url":"https://www.datos.gov.co/d/"+id})
            except Exception as e:result.append({"consulta":q,"error":str(e)[:150]})
        REPORT["fuentes"][sector+"_DISCOVERY"]={"estado":"busqueda_metadatos_no_confirma_cifras","datasets":result[:30]}

if __name__=="__main__":
    extract_upme();extract_ruv();discover();inspect_candidate_datasets();extract_sectoral_statistics();extract_services_76670()
    output=OUT/"respuesta_gubernamental_76670.json"
    output.write_text(json.dumps(REPORT,ensure_ascii=False,indent=2),encoding="utf-8")
    print("MUNICIPIO 76670, REGISTROS REPRODUCIBLES",len(REPORT["observaciones"]))
    for k,v in REPORT["fuentes"].items():
        print("FUENTE",k,v.get("estado"),"FILAS",v.get("filas_municipales","-"),"ERROR",v.get("incidencia",""))
    print("OBSERVACIONES_PUBLICABLES_JSON="+json.dumps(REPORT["observaciones"],ensure_ascii=False)[:30000])
    print("ARTEFACTO_JSON="+str(output))
    for key in ("RUV_por_hecho", "RUV_municipal"):
        item=REPORT["fuentes"].get(key,{})
        print("RUV_RESUMEN_"+key+"="+json.dumps({"cortes":item.get("cortes"),"tipos_reporte":item.get("tipos_reporte")},ensure_ascii=False)[:16000])
        if key=="RUV_por_hecho":
            rows=item.get("agregados_exploratorios_por_hecho",[])
            print("RUV_HECHOS_ULTIMOS="+json.dumps(rows[-80:],ensure_ascii=False)[:25000])
    for key in ("SISPRO_DISCOVERY","INS_DISCOVERY","SSPD_DISCOVERY"):
        print("CATALOGO_"+key+"="+json.dumps(REPORT["fuentes"].get(key,{}).get("datasets",[])[:14],ensure_ascii=False)[:11000])
