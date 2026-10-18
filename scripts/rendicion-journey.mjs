import fs from 'node:fs';
import {chromium} from 'playwright';
const base=(process.env.OBSERVATORIO_BASE_URL||'http://localhost:3000/DATOS-ABIERTOS').replace(/\/$/,'');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];fs.mkdirSync('artifacts/visual',{recursive:true});
for(const device of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844},{name:'small',width:320,height:812}]){
 const page=await browser.newPage({viewport:{width:device.width,height:device.height}});page.on('pageerror',e=>errors.push(device.name+' '+page.url()+': '+e.message));
 try{
  await page.goto(base+'/rendicion/',{waitUntil:'networkidle'});await page.locator('[data-rendicion="visual"]').waitFor();
  if(await page.getByRole('tab',{selected:true}).textContent()!=='Panorama')errors.push('Rendición must open on its visual overview');
  if(await page.getByRole('table').isVisible())errors.push('The full register table still dominates the initial view');
  if(await page.locator('.rc-donut-plot circle[role="button"]').count()!==8)errors.push('The overview donut must preserve eight departments');
  if(await page.locator('.rc-preview-rings .rc-ring-card').count()!==4)errors.push('The overview is missing four program gauges');
  if(await page.locator('.rc-finance-grid .rc-card').count()!==2)errors.push('Revenue and IBR visuals are missing');
  await page.screenshot({path:`artifacts/visual/rendicion-panorama-${device.name}.png`,fullPage:true});
  await page.locator('.rc-donut-plot circle[role="button"]').last().focus();await page.keyboard.press('Enter');
  await page.getByRole('dialog',{name:'Detalle de gestión municipal'}).waitFor();
  if(!await page.getByRole('dialog').getByRole('link',{name:'Abrir fuente'}).getAttribute('href').then(x=>x.endsWith('#page=9')))errors.push('Donut detail lost source page');
  await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
  await page.getByRole('tab',{name:'Panorama',exact:true}).focus();await page.keyboard.press('ArrowRight');
  await page.getByRole('tab',{name:'Inversión',selected:true,exact:true}).waitFor();
  await page.getByRole('combobox',{name:'Dependencia',exact:true}).selectOption('Hacienda');
  const ratio=await page.locator('.rc-bar-track>i').evaluate(el=>el.getBoundingClientRect().width/el.parentElement.getBoundingClientRect().width);if(ratio<.03||ratio>.04)errors.push('Filtered budget changed its denominator');
  await page.getByRole('button',{name:'Restablecer',exact:true}).click();
  await page.getByRole('tab',{name:'Finanzas',exact:true}).click();
  if(!await page.locator('.rc-finance-number').first().textContent().then(x=>x.includes('139,1')))errors.push('Revenue above 100% was clipped or changed');
  await page.screenshot({path:`artifacts/visual/rendicion-finanzas-${device.name}.png`,fullPage:true});
  await page.getByRole('tab',{name:'Compromisos 2026',exact:true}).click();
  if(await page.locator('.rc-projections button').count()!==2)errors.push('Two distinct 2026 projections must remain separate');
  if(!await page.getByText('Compromisos, no ejecución',{exact:true}).isVisible())errors.push('2026 commitments were not distinguished from execution');
  await page.getByRole('textbox',{name:'Buscar en rendición de cuentas'}).fill('cultura');
  if(!await page.getByRole('table').isVisible())errors.push('Searching should open the source register');
  if(!await page.locator('tbody').textContent().then(x=>x.includes('> 8.000')))errors.push('Culture lower bound disappeared');
  await page.getByRole('button',{name:'Restablecer',exact:true}).click();
  await page.getByRole('tab',{name:'Alcance social',exact:true}).click();
  if(await page.locator('.rc-outcomes').first().getByRole('button').count()!==8)errors.push('Social reach must keep eight separate programs');
  await page.screenshot({path:`artifacts/visual/rendicion-alcance-${device.name}.png`,fullPage:true});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))errors.push(device.name+': horizontal overflow');
 }catch(e){errors.push(device.name+': '+e.message);}
 await page.close();if(errors.length)break;
}
await browser.close();if(errors.length)throw new Error(errors.join('\n'));console.log('PASS: visual management dashboard, chart details, source links, keyboard tabs, fixed denominators, revenue above target, separate 2026 estimates and mobile layouts');
