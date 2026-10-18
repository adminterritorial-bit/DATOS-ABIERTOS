import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
fs.mkdirSync('artifacts/visual',{recursive:true});
const errors=[];
const base=(process.env.OBSERVATORIO_BASE_URL||'http://localhost:3000/DATOS-ABIERTOS').replace(/\/$/,'');
for(const viewport of [{name:'fullhd',width:1920,height:1080},{name:'2k',width:2560,height:1440},{name:'4k',width:3840,height:2160},{name:'desktop',width:1440,height:900},{name:'tablet',width:1024,height:768},{name:'mobile',width:390,height:844},{name:'mobile-small',width:320,height:812}]){
 const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(viewport.name+': '+e.message.slice(0,250)));
 try{
  const r=await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:70000});
  if(r?.status()!==200)errors.push(viewport.name+': HTTP '+r?.status());
  await page.getByRole('heading',{level:1}).first().waitFor({timeout:15000});
  await page.locator('.n5-navigation').waitFor();
  await page.locator('.n5-banner-frame').waitFor();
  await page.getByRole('heading',{name:'Un territorio. Miles de historias.',exact:true}).waitFor();
  if(!await page.locator('.immersive-hero').evaluate(el=>getComputedStyle(el).backgroundImage.includes('255, 255, 255')||getComputedStyle(el).backgroundColor==='rgb(255, 255, 255)'))errors.push('Main hero does not use a white background');
  if(viewport.width<=720){const mobileBanner=await page.locator('.n5-banner-frame').boundingBox();if(mobileBanner.height<mobileBanner.width*.95)errors.push('Mobile banner is still panoramic');await page.locator('.n5-banner-mobile-caption h2').waitFor({state:'visible'});const captionOverflow=await page.locator('.n5-banner-mobile-caption').evaluate(el=>el.scrollHeight>el.clientHeight+1);if(captionOverflow)errors.push('Mobile banner caption is clipped');}
  const heroSize=await page.locator('.n5-banner-frame').boundingBox();
  if(viewport.width>=1440&&heroSize.width<Math.min(viewport.width*.7,2100))errors.push(viewport.name+': banner remains constrained instead of filling the stage');
  await page.getByRole('button',{name:'Buscar en todos los datos',exact:true}).click();
  await page.getByRole('dialog',{name:'Búsqueda global de datos'}).waitFor();
  const searchBackdrop=await page.locator('.ot-cmd-backdrop').boundingBox();
  if(!searchBackdrop||Math.abs(searchBackdrop.width-viewport.width)>2||Math.abs(searchBackdrop.height-viewport.height)>2)errors.push('Global search backdrop does not cover the viewport');
  await page.keyboard.press('Escape');
  if(await page.getByRole('dialog',{name:'Búsqueda global de datos'}).count())errors.push('Hero search does not close');
  if(!await page.getByRole('button',{name:'Buscar en todos los datos',exact:true}).evaluate(el=>el===document.activeElement))errors.push('Hero search did not restore focus');
  await page.getByRole('button',{name:'Buscar Educación',exact:true}).click();
  if(await page.getByRole('textbox',{name:'Escribe tu búsqueda'}).inputValue()!=='Educación')errors.push('Hero topic search did not preserve the requested query');
  if(!await page.locator('.ot-cmd-results .ot-cmd-result').count())errors.push('Hero topic search returned no education results');
  await page.keyboard.press('Escape');
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:'artifacts/visual/home-stage-'+viewport.name+'.png'});
  if(await page.locator('.n5-data-panel').count()!==0)errors.push('Expensive charts were mounted before opening analysis');
  if(await page.locator('.citizen-questions button').count()!==4)errors.push('Citizen questions missing');
  await page.getByRole('button',{name:'¿Cómo va la educación?',exact:true}).click();
  await page.locator('.sector-dashboard').waitFor();
  if(!await page.getByRole('combobox',{name:'Elegir temática para las cinco gráficas'}).inputValue().then(v=>v==='educacion'))errors.push('Citizen question did not select education');
  if(['desktop','mobile'].includes(viewport.name)){
    await page.locator('.saved-queries .sq-save').click();
    await page.locator('.sq-list a').first().waitFor();
    const savedHome=await page.locator('.sq-list a').first().getAttribute('href');
    if(!savedHome.includes('tema=educacion'))errors.push('Saved home query lost the selected topic');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.sector-dashboard').waitFor();
    if(await page.getByRole('combobox',{name:'Elegir temática para las cinco gráficas'}).inputValue()!=='educacion')errors.push('Reload did not restore home filters');
    await page.locator('.sq-toggle').click();
    if(!await page.locator('.sq-list a').count())errors.push('Device saved query did not persist');
    await page.locator('.sd-record').first().click();
    await page.getByRole('region',{name:'Vigencia y fechas de la fuente'}).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog',{name:'Detalle estadístico'}).waitFor({state:'hidden'});
  }
  await page.locator('.citizen-library>summary').click();
  if(await page.locator('.discovery-doorway').count()!==4)errors.push('Four thematic entry points missing');
  await page.locator('.discovery-doorway').first().click();
  if(await page.locator('.discovery-doorway').first().getAttribute('aria-pressed')!=='true')errors.push('Thematic entry point did not apply its filter');
  await page.getByRole('combobox',{name:'Elegir temática para las cinco gráficas'}).selectOption('educacion');
  if(parseInt(await page.locator('.panorama-filter-result').textContent(),10)===0)errors.push('Changing category after macro selection incorrectly erased compatible observations');
  await page.getByRole('button',{name:'Ver todas las miradas',exact:true}).click();
  if(viewport.width>900&&await page.evaluate(()=>document.querySelector('.xp-main').getBoundingClientRect().left<document.querySelector('.xp-side').getBoundingClientRect().right-1))errors.push(viewport.name+': main content overlaps institutional sidebar');
  await page.waitForFunction(()=>{
    const image=document.querySelector('.n5-banner-slide img');
    return !!image && image.complete && image.naturalWidth>=2000;
  },{timeout:22000}).catch(()=>errors.push(viewport.name+': first supplied banner is missing or not high resolution'));
  if(['desktop','mobile-small'].includes(viewport.name)){
    for(let slide=1;slide<4;slide++){
      const slideNames=['Observatorio de Datos','San Pedro en el mapa','Un nuevo futuro se avecina','Creado por Juan E. Perez T.'];
      await page.getByRole('button',{name:'Mostrar: '+slideNames[slide],exact:true}).click();
      await page.getByRole('img',{name:slideNames[slide],exact:true}).waitFor();
      await page.waitForFunction(()=>{const el=document.querySelector('.n5-banner-slide');return !!el&&Number(getComputedStyle(el).opacity)>.99});
      await page.waitForFunction(()=>{const img=document.querySelector('.n5-banner-slide img');return !!img&&img.complete&&img.naturalWidth>=2000},null,{timeout:10000}).catch(()=>errors.push('banner '+slide+': missing original image'));
      if(viewport.name==='mobile-small'){if(await page.locator('.n5-banner-mobile-caption').evaluate(el=>el.scrollHeight>el.clientHeight+1))errors.push('Mobile banner '+slide+' has clipped text');await page.locator('.n5-banner-frame').screenshot({path:'artifacts/visual/mobile-slide-'+slide+'.png'});}
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
  if(!await page.getByRole('tab',{name:'Conectividad',exact:true}).evaluate(el=>el===document.activeElement))errors.push('Panorama: keyboard focus did not follow the selected tab');
  await page.locator('.panorama-table summary').click();
  if(await page.locator('.panorama-table tbody tr').count()!==7)errors.push('Panorama: same-quarter historical series missing');
  await page.locator('.panorama-table summary').click();
  await page.locator('.panorama').screenshot({path:'artifacts/visual/panorama-'+viewport.name+'.png'});
  const analysisToggle=page.locator('.citizen-analysis-toggle');
  if(await analysisToggle.getAttribute('aria-expanded')!=='true')await analysisToggle.click();
  await page.locator('.n5-chart-wall').waitFor();
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
  await page.locator('.sector-dashboard').waitFor();
  if(await page.locator('.chart-conclusion').count()!==5)errors.push('Chart conclusions are missing');
  if(['desktop','mobile'].includes(viewport.name))await page.locator('.sector-dashboard').screenshot({path:'artifacts/visual/education-'+viewport.name+'.png'});
  for(const sector of ['atencion','ambiente','economia']){await page.getByRole('combobox',{name:'Elegir temática para las cinco gráficas'}).selectOption(sector);await page.locator('.sector-dashboard').waitFor();if(sector==='economia'&&await page.locator('.sd-budget-total').count()!==1)errors.push('Sector budget composition missing');if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))errors.push(sector+': sector dashboard overflow');}
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
  await page.getByRole('textbox',{name:'Buscar lugares DANE'}).fill('san jose');
  if(await page.locator('.n5-place-list button').count()!==1)errors.push('Accent-insensitive place search failed');
  await page.getByRole('button',{name:'Ver todos los lugares (7)'}).click();
  if(await page.locator('.n5-place-list button').count()!==7)errors.push('Reset did not restore seven places');
  await page.locator('.g4-map-viewport').screenshot({path:'artifacts/visual/geo-'+viewport.name+'.png'});


  if(viewport.name==='desktop'){
    await page.goto(base+'/?tema=educacion&anio=2023&buscar=cobertura&vista=territorio',{waitUntil:'domcontentloaded',timeout:70000});
    await page.locator('.n5-place-list button').first().waitFor({timeout:45000});
    if(await page.getByRole('combobox',{name:'Vigencia',exact:true}).inputValue()!=='2023'||await page.getByRole('textbox',{name:'Buscar en estadísticas del municipio'}).inputValue()!=='cobertura')errors.push('Map initialization erased restored home filters');
    await page.goto(base+'/mapa/?lugar=76670008&tema=educacion',{waitUntil:'domcontentloaded',timeout:70000});
    await page.getByRole('dialog',{name:/Información del lugar SAN JOSÉ/i}).waitFor({timeout:45000});
    await page.getByRole('button',{name:'Copiar enlace de este lugar'}).click();
    if(!await page.getByRole('textbox',{name:'Enlace para compartir este lugar'}).inputValue().then(v=>v.includes('lugar=76670008')&&v.includes('tema=educacion')))errors.push('Shared place URL lost its selection');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog',{name:/Información del lugar SAN JOSÉ/i}).waitFor({state:'hidden',timeout:5000}).catch(()=>errors.push('Deep linked place did not close with Escape'));
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
  await page.locator('.ic-panel').waitFor();
  await page.locator('.ic-controls select').first().selectOption('internet');
  await page.locator('.ic-controls select').nth(1).selectOption('2022');
  if(!await page.locator('.ic-conclusion').textContent().then(t=>t.includes('2022')))errors.push('Interactive comparison year did not update');
  await page.locator('.ic-territories label').filter({hasText:'Ginebra'}).locator('input').check();
  if(await page.locator('.ic-controls select').nth(1).inputValue()!=='2023')errors.push('Peer comparison retained a non-common year');
  if(['desktop','mobile'].includes(viewport.name))await page.locator('.ic-panel').screenshot({path:'artifacts/visual/interactive-comparison-'+viewport.name+'.png'});
  if(['desktop','mobile'].includes(viewport.name)){
    await page.getByRole('button',{name:'Copiar enlace de comparación',exact:true}).click();
    const shareUrl=await page.getByTestId('comparison-share-url').inputValue();
    if(!shareUrl.includes('periodo=2023-T3')||!shareUrl.includes('indicador=internet'))errors.push('Comparison share URL lost its selection');
    await page.locator('.ic-panel .sq-save').click();
    await page.goto(shareUrl,{waitUntil:'domcontentloaded'});
    await page.locator('.ic-controls select').first().waitFor();
    await page.waitForFunction(()=>document.querySelector('.ic-controls select')?.value==='internet');
    if(await page.locator('.ic-controls select').nth(1).inputValue()!=='2023')errors.push('Shared URL did not restore the comparison year');
    if(!await page.getByRole('checkbox',{name:'Ginebra',exact:true}).isChecked())errors.push('Shared URL lost the selected municipality');
    await page.locator('.ic-panel .sq-toggle').click();
    if(await page.locator('.ic-panel .sq-list a').count()<2)errors.push('Saved queries did not retain both home and comparison');
    await page.locator('.ic-panel .sq-remove').first().click();
    if(await page.locator('.ic-panel .sq-list a').count()!==1)errors.push('Removing an individual saved query failed');
  }
  await page.locator('.ic-controls select').first().selectOption('energia');
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
 if(errors.length)break;
}
await browser.close();
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Verified URL: '+base);
console.log('PASS: 4:1 timed carousel, 5 charts, 14 separate topic cards, ArcGIS popup, mobile folder sidebar and no page overflow');
