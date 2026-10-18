import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('artifacts/visual',{recursive:true});
const errors=[];
const base=(process.env.OBSERVATORIO_BASE_URL||'http://localhost:3000/DATOS-ABIERTOS').replace(/\/$/,'');
for(const viewport of [{name:'fullhd',width:1920,height:1080},{name:'2k',width:2560,height:1440},{name:'4k',width:3840,height:2160},{name:'desktop',width:1440,height:900},{name:'tablet',width:1024,height:768},{name:'mobile',width:390,height:844}]){
 const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(viewport.name+': '+e.message.slice(0,250)));
 try{
  const r=await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:70000});
  if(r?.status()!==200)errors.push(viewport.name+': HTTP '+r?.status());
  await page.getByRole('heading',{level:1}).first().waitFor({timeout:15000});
  await page.locator('.n5-navigation').waitFor();
  await page.locator('.n5-banner-frame').waitFor();
  if(viewport.width>900&&await page.evaluate(()=>document.querySelector('.xp-main').getBoundingClientRect().left<document.querySelector('.xp-side').getBoundingClientRect().right-1))errors.push(viewport.name+': main content overlaps institutional sidebar');
  await page.waitForFunction(()=>{
    const image=document.querySelector('.n5-banner-slide img');
    return !!image && image.complete && image.naturalWidth>=2000;
  },{timeout:22000}).catch(()=>errors.push(viewport.name+': first supplied banner is missing or not high resolution'));
  if(viewport.name==='desktop'){
    for(let slide=1;slide<4;slide++){
      await page.getByRole('button',{name:'Banner siguiente'}).click();
      await page.waitForFunction(()=>{const img=document.querySelector('.n5-banner-slide img');return !!img&&img.complete&&img.naturalWidth>=2000},null,{timeout:10000}).catch(()=>errors.push('banner '+slide+': missing original image'));
    }
    await page.getByRole('button',{name:'Mostrar: Observatorio de Datos'}).click();
  }

  await page.getByRole('heading',{name:'Así está San Pedro.'}).waitFor();
  if(viewport.name==='desktop'){
    await page.locator('.panorama-kpi').nth(3).click();
    await page.getByRole('dialog',{name:'Detalle de gestión municipal'}).waitFor();
    if(!await page.getByRole('dialog').getByText('Índice de Transparencia y Acceso a la Información',{exact:true}).count())errors.push('ITA headline link opened a different record');
    await page.keyboard.press('Escape');
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    await page.getByRole('heading',{name:'Así está San Pedro.'}).waitFor();
  }
  if(await page.locator('.panorama-kpi').count()!==4)errors.push(viewport.name+': four headline indicators missing');
  await page.getByRole('tab',{name:'Cobertura eléctrica',exact:true}).click();
  if(await page.locator('.panorama-energy>div').count()!==3)errors.push('Panorama: comparable energy territories missing');
  await page.locator('.panorama-table summary').click();
  if(await page.locator('.panorama-table tbody tr').count()!==3)errors.push('Panorama: energy denominators missing');
  await page.locator('.panorama-table summary').click();
  if(['desktop','mobile'].includes(viewport.name))await page.locator('.panorama').screenshot({path:'artifacts/visual/panorama-energy-'+viewport.name+'.png'});
  await page.getByRole('tab',{name:'Inversión municipal',exact:true}).click();
  if(await page.locator('.panorama-investment>div').count()!==8)errors.push('Panorama: eight department shares missing');
  await page.locator('.panorama-table summary').click();
  if(await page.locator('.panorama-table tbody tr').count()!==8)errors.push('Panorama: investment values missing');
  await page.locator('.panorama-table summary').click();
  if(['desktop','mobile'].includes(viewport.name))await page.locator('.panorama').screenshot({path:'artifacts/visual/panorama-investment-'+viewport.name+'.png'});
  await page.getByRole('tab',{name:'Inversión municipal',exact:true}).press('Home');
  if(await page.getByRole('tab',{name:'Conectividad',exact:true}).getAttribute('aria-selected')!=='true')errors.push('Panorama: keyboard tab navigation failed');
  await page.locator('.panorama-table summary').click();
  if(await page.locator('.panorama-table tbody tr').count()!==7)errors.push('Panorama: same-quarter historical series missing');
  await page.locator('.panorama-table summary').click();
  await page.locator('.panorama').screenshot({path:'artifacts/visual/panorama-'+viewport.name+'.png'});
  const filterPosition=await page.evaluate(()=>document.querySelector('.xp-filterbar').getBoundingClientRect().top<document.querySelector('.n5-chart-wall').getBoundingClientRect().top);
  if(!filterPosition)errors.push('Panorama: filters do not precede affected charts');
  await page.locator('.n5-data-panel').first().waitFor({state:'visible',timeout:45000});
  if(await page.locator('.n5-data-panel').count()!==5)errors.push(viewport.name+': expected exactly five stable chart panels');
  const over=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
  if(over)errors.push(viewport.name+': horizontal overflow');

  await page.locator('.g4-logo img').waitFor({timeout:12000});
  if(!await page.locator('.g4-logo img').evaluate(el=>el.complete&&el.naturalWidth>200))errors.push(viewport.name+': municipal logo not loading');
  await page.getByRole('button',{name:'Mostrar: Observatorio de Datos'}).click();
  await page.waitForFunction(()=>{const img=document.querySelector('.n5-banner-image');return img&&img.complete&&img.naturalWidth>=2000&&getComputedStyle(img).opacity==='1'},null,{timeout:15000});
  await page.waitForTimeout(1400);
  await page.locator('.n5-banner-frame').screenshot({path:'artifacts/visual/banner-'+viewport.name+'.png'});
  if(await page.locator('.n5-data-panel').count()!==5)errors.push(viewport.name+': five-chart layout missing');
  await page.screenshot({path:'artifacts/visual/'+viewport.name+'.png',fullPage:true});
  const history=page.getByRole('combobox',{name:'Elegir serie histórica del tablero'});
  if(await history.count()){
    const second=await history.locator('option').nth(1).getAttribute('value');
    await history.selectOption(second);
    const chosen=await history.locator('option:checked').textContent();
    if(await page.locator('.n5-panel-0 header p').textContent()!==chosen)errors.push('Historical series selection lost context');
  }
  await page.getByRole('combobox',{name:'Elegir temática para las cinco gráficas'}).selectOption('educacion');
  if(await page.locator('.n5-data-panel').count()!==5)errors.push(viewport.name+': topic swap altered panel count');
  await page.getByRole('button',{name:'Indicadores',exact:true}).click();
  if(!await page.locator('.xp-indicator-row').count())errors.push(viewport.name+': no indicator catalog');
  await page.getByRole('button',{name:'Geografía',exact:true}).click();

  await page.locator('.g4-map-viewport').waitFor({timeout:45000});
  try{
    await page.locator('.g4-map-viewport.esri-view, .g4-map-viewport .esri-view, .g4-map-viewport .esri-view-surface').first().waitFor({state:'attached',timeout:35000});
  }catch(mapError){
    await page.locator('.g4-map-scene').screenshot({path:'artifacts/visual/geo-diagnostic-'+viewport.name+'.png'}).catch(()=>{});
    const status=await page.locator('.g4-map-status').allTextContents();
    const errorText=await page.locator('.g4-map-error').allTextContents();
    const mapDOM=await page.locator('.g4-map-viewport').evaluate(el=>({cls:el.className,html:el.innerHTML.slice(0,280)})).catch(()=>null);
    errors.push(viewport.name+': ArcGIS failed to mount: '+JSON.stringify({status,errorText,mapDOM}).slice(0,900));
    throw mapError;
  }
  await page.locator('.g4-map-toolbar button[aria-label="Acercar mapa"]').click();
  await page.locator('.g4-map-toolbar button[aria-label="Centrar en San Pedro"]').click();
  await page.locator('.g4-map-toolbar button').filter({hasText:'Indicadores'}).click();
  await page.locator('.g4-console .g4-record').first().waitFor({timeout:16000});
  await page.locator('.g4-console .g4-record').first().click();
  await page.getByRole('dialog',{name:/Ficha de/}).waitFor({timeout:10000});
  await page.getByRole('button',{name:'Cerrar ventana'}).click();
  await page.locator('.n5-place-list').waitFor({timeout:17000});
  if(await page.locator('.n5-place-list button').count()!==7)errors.push(viewport.name+': expected seven DANE places');
  if(await page.locator('.g4-map-error').count())errors.push(viewport.name+': cartography failed');
  const firstPlace=page.locator('.n5-place-list button').first();
  if(await firstPlace.count()){await firstPlace.click();await page.getByRole('dialog',{name:/Información del lugar/}).waitFor({timeout:10000});await page.locator('.n5-place-popup').screenshot({path:'artifacts/visual/popup-'+viewport.name+'.png'});await page.getByRole('button',{name:'Cerrar información del lugar'}).click()}
  await page.locator('.g4-map-viewport').screenshot({path:'artifacts/visual/geo-'+viewport.name+'.png'});


  if(viewport.name==='desktop'){
    await page.goto(base+'/temas/',{waitUntil:'domcontentloaded',timeout:70000});
    await page.locator('.n5-themes-grid .n5-tile').first().waitFor({timeout:16000});
    if(await page.locator('.n5-themes-grid .n5-tile').count()!==14)errors.push('theme explorer: expected fourteen topic cards');
    await page.getByRole('button',{name:/Educación y aprendizaje/}).first().click();
    if(await page.locator('.n5-data-panel').count()!==5)errors.push('theme explorer: five charts did not remain stable');
    await page.screenshot({path:'artifacts/visual/topics-desktop.png',fullPage:true});
    await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:70000});
  }
  await page.goto(base+'/rendicion/?vista=ejecucion',{waitUntil:'domcontentloaded'});
  await page.locator('.v6-tabs [aria-selected="true"]').filter({hasText:'Ejecución'}).waitFor();
  await page.getByRole('tab',{name:'Inversión',exact:true}).click();
  await page.getByRole('heading',{name:'Las cifras detrás de la gestión.'}).waitFor();
  if(await page.locator('.v6-budget-bars>button').count()!==8)errors.push(viewport.name+': budget components missing');
  await page.locator('.v6-budget-bars>button').first().click();
  await page.getByRole('dialog',{name:'Detalle de gestión municipal'}).waitFor();
  await page.keyboard.press('Escape');
  if(await page.getByRole('dialog').count())errors.push(viewport.name+': municipal dialog Escape failed');
  await page.getByRole('combobox',{name:'Dependencia',exact:true}).selectOption('Hacienda');
  const fraction=await page.locator('.v6-budget-stack>button').evaluate(el=>el.getBoundingClientRect().width/el.parentElement.getBoundingClientRect().width);
  if(fraction<0.03||fraction>0.05)errors.push('Budget filter changed total denominator');
  await page.getByRole('button',{name:'Restablecer',exact:true}).click();
  await page.getByRole('tab',{name:'Ejecución',exact:true}).click();
  if(await page.locator('.v6-execution [role=progressbar]').count()!==10)errors.push('Execution figures missing');
  await page.screenshot({path:'artifacts/visual/gestion-'+viewport.name+'.png',fullPage:true});
  await page.getByRole('tab',{name:'Alcance social'}).click();
  if(await page.locator('.v6-reach>button').count()!==8)errors.push('Reach figures missing');
  await page.getByRole('textbox',{name:'Buscar en rendición de cuentas'}).fill('esterilizaciones');
  if(await page.locator('tbody tr').count()!==1)errors.push('Municipal search failed');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))errors.push(viewport.name+': municipal page overflow');
  await page.goto(base+'/catalogo/?buscar=Personas%20beneficiadas%20por%20cultura',{waitUntil:'domcontentloaded'});
  await page.getByRole('table').waitFor();
  if(!await page.getByText('> 8.000',{exact:false}).count())errors.push('Catalog lost greater-than precision');
  await page.goto(base+'/territorios/?vista=internet',{waitUntil:'domcontentloaded'});
  await page.locator('.v6-tabs [aria-selected="true"]').filter({hasText:'Internet fijo'}).waitFor();
  await page.getByRole('tab',{name:'Energía · UPME 2024'}).click();
  await page.getByRole('heading',{name:'San Pedro, en perspectiva.'}).waitFor();
  if(await page.locator('.v6-energy-rates>div').count()!==7)errors.push('Energy territories missing');
  await page.screenshot({path:'artifacts/visual/comparadores-'+viewport.name+'.png',fullPage:true});
  await page.getByRole('tab',{name:'Internet fijo · MinTIC'}).click();
  await page.locator('.recharts-line').nth(2).waitFor({state:'attached',timeout:15000});
  await page.screenshot({path:'artifacts/visual/internet-'+viewport.name+'.png',fullPage:true});
  if(await page.locator('.recharts-line').count()!==3)errors.push('MinTIC series missing');
  await page.getByRole('tab',{name:'Contexto nacional · DANE 2025'}).click();
  await page.locator('.v6-series-label select').selectOption('4');
  if(!await page.getByText('82,3 % de personas de 5 años y más · 2025').count())errors.push('National series selection failed');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))errors.push(viewport.name+': territorial page overflow');
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  if(viewport.name==='mobile'){
   await page.getByRole('button',{name:'Abrir navegación'}).click();
   if(!await page.locator('.xp-side.is-open').count())errors.push('mobile sidebar cannot open');
   await page.getByRole('button',{name:/Inicio · Mi Observatorio/}).click();
  }
 }catch(e){errors.push(viewport.name+': '+String(e).slice(0,300))}
 await page.close();
}
await browser.close();
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Verified URL: '+base);
console.log('PASS: 4:1 timed carousel, 5 charts, 14 separate topic cards, ArcGIS popup, mobile folder sidebar and no page overflow');
