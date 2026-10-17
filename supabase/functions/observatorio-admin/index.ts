// Public configuration contains only the intended-to-be-public Supabase anon key.
// All catalog/import operations require a user access token and an assigned observatorio role.
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, content-type, apikey','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:cors});
Deno.serve(async (request:Request)=>{
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 const url=Deno.env.get('SUPABASE_URL');const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');const anon=Deno.env.get('SUPABASE_ANON_KEY');
 if(!url||!service||!anon)return json({error:'configuration_unavailable'},503);
 const current=new URL(request.url);
 if(request.method==='GET'&&current.searchParams.get('config')==='1')return json({supabase_url:url,anon_key:anon});
 if(!['GET','POST'].includes(request.method))return json({error:'method_not_allowed'},405);
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
 if(!token || token.length>8000)return json({error:'authentication_required'},401);
 const auth=await fetch(url+'/auth/v1/user',{headers:{apikey:service,authorization:'Bearer '+token}});
 if(!auth.ok)return json({error:'invalid_session'},401);
 const user=await auth.json();
 if(typeof user?.id!=='string')return json({error:'invalid_session'},401);
 const rpc=async(path:string,body:Record<string,unknown>)=>fetch(url+'/rest/v1/rpc/'+path,{method:'POST',headers:{apikey:service,authorization:'Bearer '+service,'content-type':'application/json',accept:'application/json'},body:JSON.stringify(body)});
 try {
   if(request.method==='GET'){
     const list=await rpc('observatorio_admin_catalog',{p_actor:user.id});
     if(!list.ok)return json({error:'access_denied'},403);
     return json({indicadores:await list.json(),usuario:user.email||null});
   }
   const raw=await request.text();if(raw.length>85000)return json({error:'payload_too_large'},413);
   const body=JSON.parse(raw);
   if(body?.op!=='import'||!Array.isArray(body.rows)||body.rows.length===0||body.rows.length>200)return json({error:'import_invalid'},400);
   const result=await rpc('observatorio_admin_ingest',{p_actor:user.id,p_rows:body.rows});
   if(!result.ok)return json({error:result.status===400?'invalid_statistical_rows':'access_denied_or_import_failed'},result.status===403?403:400);
   return json(await result.json());
 }catch{return json({error:'request_failed'},400)}
});
