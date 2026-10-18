import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const base=process.env.OBSERVATORIO_BASE_URL||'http://localhost:3000/DATOS-ABIERTOS';
fs.mkdirSync('artifacts/hydration',{recursive:true});
for(let attempt=0;attempt<2;attempt++){
 const page=await browser.newPage();
 page.on('console',message=>{if(message.type()==='error')console.log('BROWSER CONSOLE:',page.url(),message.text())});
 page.on('pageerror',error=>console.log('BROWSER ERROR:',page.url(),error.stack));
 await page.goto(base+'/mapa/region/',{waitUntil:'networkidle',timeout:120000});
 await page.locator('#xp-main h1').waitFor();
 await page.screenshot({path:`artifacts/hydration/region-${attempt}.png`});
 fs.writeFileSync(`artifacts/hydration/region-${attempt}.html`,await page.content());
 console.log('Region loaded:',await page.locator('#xp-main h1').innerText());
 await page.close();
}
await browser.close();
