import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];
for(const device of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
 const page=await browser.newPage({viewport:{width:device.width,height:device.height}});
 page.on('pageerror',e=>errors.push(device.name+': '+String(e).slice(0,200)));
 const base='http://127.0.0.1:3000/DATOS-ABIERTOS';
 try{
  await page.goto(base+'/',{waitUntil:'networkidle',timeout:60000});
  await page.getByRole('button',{name:'Buscar en el Observatorio'}).click();
  await page.getByRole('dialog',{name:'Búsqueda global de datos'}).waitFor();
  await page.getByRole('textbox',{name:'Escribe tu búsqueda'}).fill('ICET-16');
  await page.getByText('ICET-16',{exact:false}).first().waitFor();
  await page.keyboard.press('Escape');
  if(await page.getByRole('dialog',{name:'Búsqueda global de datos'}).count())errors.push(device.name+': Escape did not close command palette');
  for(const route of ['/documentos/','/comparar/']){
   const response=await page.goto(base+route,{waitUntil:'networkidle',timeout:60000});
   if(response?.status()!==200)errors.push(device.name+route+': HTTP '+response?.status());
   await page.getByRole('heading',{level:1}).first().waitFor();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
   if(overflow)errors.push(device.name+route+': horizontal overflow');
  }
 }catch(e){errors.push(device.name+': '+String(e).slice(0,270))}
 finally{await page.close();}
}
await browser.close();
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('PASS: citizen search, Escape, documents, comparison and mobile navigation');
