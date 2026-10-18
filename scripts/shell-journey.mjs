import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base=(process.env.OBSERVATORIO_BASE_URL||'http://localhost:3000/DATOS-ABIERTOS').replace(/\/$/,'');
const errors=[];fs.mkdirSync('artifacts/visual',{recursive:true});
for(const device of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
 const page=await browser.newPage({viewport:{width:device.width,height:device.height}});let feedRequests=0;
 page.on('request',r=>{if(r.url().includes('/functions/v1/observatorio-public-feed'))feedRequests++});page.on('pageerror',e=>errors.push(device.name+' '+page.url()+': '+e.message.slice(0,500)));
 const showMenu=async()=>{if(device.width<=900&&await page.getByRole('button',{name:'Abrir navegación',exact:true}).getAttribute('aria-expanded')!=='true')await page.getByRole('button',{name:'Abrir navegación',exact:true}).click()};
 try{
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'Un territorio. Miles de historias.',exact:true}).waitFor();
  const sidebar=await page.locator('#observatory-navigation').elementHandle();
  await showMenu();await page.locator('.n5-folder-trigger').filter({hasText:'Desarrollo humano'}).click();
  const transitions=[['temas','Explorar los 14 temas','button','¿Qué te gustaría conocer de San Pedro?'],['catalogo','Catálogo de datos','link','Datos abiertos del territorio'],['territorios','Comparar territorios','link','San Pedro, en perspectiva.'],['rendicion','Gestión municipal 2025','link','Las cifras detrás de la gestión.'],['documentos','Fuentes y documentos','link','Biblioteca de datos y documentos.']];
  for(const [route,label,role,heading] of transitions){
   await showMenu();await page.locator('.n5-toplinks').getByRole(role,{name:label,exact:true}).click();
   await page.waitForURL(new RegExp('/'+route+'/'));await page.getByRole('heading',{level:1,name:heading,exact:true}).waitFor();
   if(!await sidebar.evaluate(el=>el.isConnected&&el===document.getElementById('observatory-navigation')))errors.push(route+': sidebar remounted across client navigation');
   if(await page.locator('.shell-sidebar').count()!==1||await page.locator('.shell-header .ot-global-search').count()!==1)errors.push(route+': shared sidebar or search duplicated');
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))errors.push(device.name+' '+route+': horizontal overflow');
   if(device.width>900){const before=await page.locator('.shell-sidebar').boundingBox();await page.evaluate(()=>window.scrollTo(0,700));const after=await page.locator('.shell-sidebar').boundingBox();if(before.y!==after.y)errors.push(route+': sidebar moved when content scrolled');}
   else if(await page.getByRole('button',{name:'Abrir navegación',exact:true}).getAttribute('aria-expanded')!=='false')errors.push(route+': mobile menu remained open after navigation');
   if(['territorios','documentos'].includes(route))await page.screenshot({path:`artifacts/visual/shell-${route}-${device.name}.png`});
  }
  if(device.width<=900){await showMenu();await page.locator('.n5-toplinks').getByRole('link',{name:'Fuentes y documentos',exact:true}).click();if(await page.getByRole('button',{name:'Abrir navegación'}).getAttribute('aria-expanded')!=='false')errors.push('Selecting current mobile section left drawer open');}
  await showMenu();if(await page.locator('.n5-folder-trigger').filter({hasText:'Desarrollo humano'}).getAttribute('aria-expanded')!=='true')errors.push('Sidebar folder state was lost between sections');
  if(device.width<=900){await page.keyboard.press('Escape');await page.getByRole('button',{name:'Abrir navegación'}).waitFor();if(await page.getByRole('button',{name:'Abrir navegación'}).getAttribute('aria-expanded')!=='false')errors.push('Mobile drawer Escape failed');}
  if(feedRequests!==1)errors.push('Shared feed requested '+feedRequests+' times across client navigation instead of once');
  await page.getByRole('button',{name:'Buscar en el Observatorio',exact:true}).click();const search=page.getByRole('combobox',{name:'Escribe tu búsqueda',exact:true});await search.fill('energia 2024');
  await page.locator('.ot-cmd-result').first().waitFor();if(!await page.locator('.ot-search-metadata').count())errors.push('Search result provenance missing');
  await search.press('ArrowDown');if(!await search.getAttribute('aria-activedescendant'))errors.push('Search keyboard active result missing');
  await search.press('Escape');await page.getByRole('dialog',{name:'Búsqueda global de datos'}).waitFor({state:'hidden'});
  // Search twice within the same section: Next query-only navigation must update filters.
  for(const [route,query,label] of [['catalogo','energía','Buscar en el catálogo'],['catalogo','población','Buscar en el catálogo'],['rendicion','emprendimientos','Buscar en rendición de cuentas'],['rendicion','salud','Buscar en rendición de cuentas']]){
   await page.getByRole('button',{name:'Buscar en el Observatorio',exact:true}).click();await search.fill(query);
   const result=page.locator(`.ot-cmd-result[href*="/${route}/?buscar="]`).first();await result.waitFor();
   const destination=await result.getAttribute('href'),expected=new URL(destination,'https://example.test').searchParams.get('buscar');
   await result.click();await page.waitForFunction(({label,expected})=>document.querySelector(`[aria-label="${label}"]`)?.value===expected,{label,expected});
   if(!await sidebar.evaluate(el=>el.isConnected))errors.push('Search navigation remounted sidebar');
  }
  for(const code of ['ICET-16','ICET-01']){
   await page.getByRole('button',{name:'Buscar en el Observatorio',exact:true}).click();await search.fill(code);
   await page.locator(`.ot-cmd-result[href*="/icet/?q=${code}"]`).first().click();await page.locator('#'+code).waitFor({state:'visible'});
   if(await page.locator('[id^="ICET-"]').count()!==66)errors.push('ICET dictionary does not expose 66 indicators');
  }
  if(device.name==='desktop'){
   for(const route of ['icet/recuperados','poblacion','seguridad','comparar','pdt','estimador','mapa/region','admin']){
    await page.goto(base+'/'+route+'/',{waitUntil:'domcontentloaded'});await page.locator('#xp-main h1').first().waitFor({timeout:20000});
    if(await page.locator('.shell-sidebar').count()!==1)errors.push(route+': shared sidebar missing');
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))errors.push(route+': page overflow inside persistent layout');
   }
  }
 }catch(e){errors.push(device.name+': '+String(e).slice(0,1000));}
 await page.close();if(errors.length)break;
}
await browser.close();if(errors.length)throw new Error(errors.join('\n'));
console.log('PASS: persistent sidebar identity, fixed geometry, folder state, shared feed, route discovery, keyboard search and mobile drawer');
