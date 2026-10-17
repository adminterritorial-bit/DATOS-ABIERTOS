import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('artifacts/visual',{recursive:true});
const errors=[];
for(const viewport of [{name:'desktop',width:1440,height:900},{name:'tablet',width:1024,height:768},{name:'mobile',width:390,height:844}]){
 const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(viewport.name+': '+e.message.slice(0,250)));
 try{
  const r=await page.goto('http://localhost:3000/DATOS-ABIERTOS/',{waitUntil:'domcontentloaded',timeout:70000});
  if(r?.status()!==200)errors.push(viewport.name+': HTTP '+r?.status());
  await page.getByRole('heading',{level:1}).first().waitFor({timeout:15000});
  await page.locator('.xp-theme').first().waitFor();
  if(await page.locator('.xp-theme').count()!==14)errors.push(viewport.name+': taxonomy tiles !=14');
  if(await page.locator('.xp-theme[aria-pressed="true"]').count()>1)errors.push(viewport.name+': multiple topic selected');
  const over=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
  if(over)errors.push(viewport.name+': horizontal overflow');

  await page.locator('.g4-logo img').waitFor({timeout:12000});
  await page.waitForTimeout(1300);
  if(await page.locator('.g4-chart-card').count()<3)errors.push(viewport.name+': fewer than three simultaneous chart panels');
  await page.screenshot({path:'artifacts/visual/'+viewport.name+'.png',fullPage:true});
  await page.getByRole('button',{name:/Educación y aprendizaje/}).last().click();
  if(!(await page.locator('.xp-theme.chosen').count()))errors.push(viewport.name+': topic filter did not apply');
  await page.getByRole('button',{name:'Indicadores',exact:true}).click();
  if(!await page.locator('.xp-indicator-row').count())errors.push(viewport.name+': no indicator catalog');
  await page.getByRole('button',{name:'Geografía',exact:true}).click();

  await page.locator('.g4-map-viewport').waitFor({timeout:45000});
  await page.locator('.g4-map-viewport .esri-view').waitFor({timeout:60000});
  await page.locator('.g4-map-toolbar button[aria-label="Acercar mapa"]').click();
  await page.locator('.g4-map-toolbar button[aria-label="Centrar en San Pedro"]').click();
  await page.locator('.g4-map-toolbar button').filter({hasText:'Indicadores'}).click();
  await page.locator('.g4-console .g4-record').first().waitFor({timeout:16000});
  await page.locator('.g4-console .g4-record').first().click();
  await page.getByRole('dialog',{name:/Ficha de/}).waitFor({timeout:10000});
  await page.getByRole('button',{name:'Cerrar ventana'}).click();
  await page.locator('.g4-map-viewport').screenshot({path:'artifacts/visual/geo-'+viewport.name+'.png'});

  if(viewport.name==='mobile'){
   await page.getByRole('button',{name:'Abrir navegación'}).click();
   if(!await page.locator('.xp-side.is-open').count())errors.push('mobile sidebar cannot open');
   await page.getByRole('button',{name:/Panorama general/}).click();
  }
 }catch(e){errors.push(viewport.name+': '+String(e).slice(0,300))}
 await page.close();
}
await browser.close();
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('PASS: redesigned observatory, 14 category tiles, chart/cat/map tabs, mobile navigation and no overflow');
