import fs from 'node:fs';
import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('artifacts/visual',{recursive:true});
let failures=[];
for(const config of [{name:'desktop',width:1440,height:900},{name:'tablet',width:1024,height:768},{name:'mobile',width:390,height:844}]){
 const page=await browser.newPage({viewport:{width:config.width,height:config.height},deviceScaleFactor:1});
 page.on('pageerror',e=>failures.push(config.name+': '+String(e).slice(0,200)));
 await page.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle',timeout:60000});
 await page.screenshot({path:'artifacts/visual/'+config.name+'.png',fullPage:true});
 const h=await page.locator('h1').first().innerText();
 if(!h.includes('territorio'))failures.push(config.name+': heading missing');
 const text=await page.locator('body').innerText();
 if(!text.includes('17.275'))failures.push(config.name+': DANE 2025 value missing');
 const metrics=await page.locator('.ot-data-card').count();
 if(metrics<6)failures.push(config.name+': too few data cards ('+metrics+')');
 const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
 if(horizontal)failures.push(config.name+': horizontal page overflow');
 if(config.name==='mobile'){
  await page.getByRole('button',{name:'Abrir menú'}).click();
  if(!await page.getByRole('button',{name:'Seguridad',exact:true}).isVisible())failures.push('mobile menu is not visible');
  await page.getByRole('button',{name:'Cerrar navegación'}).click();
 }
 if(config.name==='desktop'){
  await page.getByRole('button',{name:'2025'}).count(); // no-op if select displayed
  await page.getByRole('button',{name:'CSV',exact:true}).click();
 }
 await page.close();
}
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('All screenshots and interaction checks passed');
