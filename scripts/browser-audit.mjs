import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const artifacts=resolve('.audit');await mkdir(artifacts,{recursive:true});
const keys=['','services/','products/','about/','contact/','privacy/'];
const routes=['','bn/'].flatMap(prefix=>keys.map(key=>'/'+prefix+key));
const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain'};
async function serve(root){
 const server=createServer(async(req,res)=>{
  try{
   const path=decodeURIComponent(new URL(req.url,'http://local').pathname);
   let file=resolve(root,'.'+path);
   if(!file.startsWith(resolve(root)+ '/') && file!==resolve(root)){res.writeHead(403);return res.end();}
   let info=await stat(file).catch(()=>null);
   if(info?.isDirectory())file=join(file,'index.html');
   let data=await readFile(file).catch(()=>null);
   if(!data){res.writeHead(404,{'Content-Type':'text/html'});return res.end(await readFile(join(root,'404.html')));}
   res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(data);
  }catch{res.writeHead(500);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 return {server,url:'http://127.0.0.1:'+server.address().port};
}
const configured=join(artifacts,'form-site');
execFileSync(process.execPath,['node_modules/astro/bin/astro.mjs','build','--outDir',configured],{env:{...process.env,PUBLIC_FORMSPREE_ENDPOINT:'https://formspree.io/f/audit1234',ASTRO_TELEMETRY_DISABLED:'1'},stdio:'pipe'});
const main=await serve(resolve('dist')), fixture=await serve(configured);
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'chrome',headless:true});
let checks=0;const results=[];
try{
 const ctx=await browser.newContext();const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [360,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of routes){
   const response=await page.goto(main.url+route);assert.equal(response.status(),200);
   await page.evaluate(()=>document.fonts.ready);
   await expect(page.locator('h1')).toBeVisible();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width+' '+route);
   assert.equal(await page.evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0)),true,'images '+route);
   if(!process.env.AUDIT_SKIP_AXE) { const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
   assert.deepEqual(a11y.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],'accessibility '+width+' '+route); }
   checks++;
   if(width===1440 && route==='/')await page.screenshot({path:join(artifacts,'home-desktop.png'),fullPage:true});
   if(width===360 && route==='/')await page.screenshot({path:join(artifacts,'home-mobile.png'),fullPage:true});
   if(width===360 && route==='/bn/')await page.screenshot({path:join(artifacts,'home-bangla-mobile.png'),fullPage:true});
  }
 }
 results.push(process.env.AUDIT_SKIP_AXE ? '36 route/viewport and image checks passed (accessibility scan skipped for focused retest)' : '36 route/viewport checks, image loading and WCAG automated scans passed');
 await page.setViewportSize({width:360,height:800});await page.goto(main.url+'/');
 const menu=page.locator('.menu-toggle');await expect(menu).toBeVisible();
 await menu.click();await expect(menu).toHaveAttribute('aria-expanded','true');await expect(page.locator('#primary-navigation')).toBeVisible();
 await menu.press('Escape');await expect(menu).toHaveAttribute('aria-expanded','false');await expect(menu).toBeFocused();
 await menu.click();await page.locator('#primary-navigation a[href="/services/"]').click();await expect(page).toHaveURL(main.url+'/services/');
 await page.keyboard.press('Tab');await expect(page.locator('.skip-link')).toBeFocused();
 assert.equal(await page.locator('.skip-link').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 await page.keyboard.press('Enter');await expect(page.locator('#main')).toBeFocused();
 for(const route of routes){
  await page.setViewportSize({width:1280,height:900});await page.goto(main.url+route);
  await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'200% zoom '+route);checks++;
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(main.url+'/');
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 for(const route of routes){await page.goto(main.url+route);const alternate=await page.locator('.language-link').getAttribute('href');assert.ok(routes.includes(alternate));}
 results.push('Mobile menu, Escape, keyboard skip link, visible focus, reduced motion, 200% zoom and language counterparts passed');
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:360,height:800}});
 const plain=await nojs.newPage();
 for(const route of routes){await plain.goto(main.url+route);await expect(plain.locator('h1')).toBeVisible();await expect(plain.locator('#primary-navigation')).toBeVisible();assert.equal(await plain.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks++;}
 await plain.goto(fixture.url+'/contact/');await expect(plain.locator('form')).toHaveAttribute('action','https://formspree.io/f/audit1234');assert.equal(await plain.locator('form').evaluate(e=>e.noValidate),false);await nojs.close();
 results.push('All primary content and navigation readable without JavaScript; configured form retains native validation');
 await page.setViewportSize({width:1440,height:1000});
 for(const language of ['en','bn']){
  const route=language==='en'?'/contact/':'/bn/contact/';await page.goto(main.url+route);
  await expect(page.locator('[data-direct-contact]')).toBeVisible();assert.equal(await page.locator('form').count(),0);
  await page.goto(fixture.url+route+'?service=automation');
  const form=page.locator('form');const submit=form.locator('button[type="submit"]');const status=form.locator('[data-form-status]');
  await expect(page.locator('#service')).toHaveValue('automation');
  let calls=0,mode='success',release;
  await page.route('https://formspree.io/**',async routed=>{
   if(routed.request().method()==='OPTIONS')return routed.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'accept, content-type'}});
   calls++;const headers={'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
   if(mode==='slow')await new Promise(r=>release=r);
   if(mode==='network')return routed.abort('internetdisconnected');
   if(mode==='provider')return routed.fulfill({status:422,headers,body:JSON.stringify({errors:[{field:'email',message:'Invalid email'}]})});
   if(mode==='rate')return routed.fulfill({status:429,headers,body:'{"error":"rate limited"}'});
   if(mode==='malformed')return routed.fulfill({status:200,headers,body:'invalid'});
   if(mode==='unconfirmed')return routed.fulfill({status:200,headers,body:'{"ok":false}'});
   return routed.fulfill({status:200,headers,body:'{"ok":true}'});
  });
  await submit.click();await expect(page.locator('#name')).toBeFocused();await expect(page.locator('#name')).toHaveAttribute('aria-invalid','true');assert.equal(calls,0);
  await page.locator('#name').fill('  ');await page.locator('#email').fill('invalid');await page.locator('#message').fill('A useful project brief.');
  await submit.click();await expect(page.locator('#email')).toHaveAttribute('aria-invalid','true');assert.equal(calls,0);
  await page.locator('#name').fill('Test Inquiry');await page.locator('#email').fill('test@example.com');
  for(mode of ['network','provider','rate','malformed','unconfirmed']){
   await submit.click();await expect(status).toHaveAttribute('data-state','error');await expect(page.locator('#message')).toHaveValue('A useful project brief.');await expect(submit).toBeEnabled();
  }
  mode='slow';const before=calls;await submit.click();await expect(submit).toBeDisabled();await expect(form).toHaveAttribute('aria-busy','true');await expect(status).toHaveAttribute('data-state','pending');
  await form.evaluate(f=>{f.requestSubmit();f.requestSubmit();});assert.equal(calls,before+1);release();
  await expect(status).toHaveAttribute('data-state','success');await expect(page.locator('#message')).toHaveValue('');await expect(submit).toBeEnabled();
  await page.locator('#name').fill('Test Inquiry');await page.locator('#email').fill('test@example.com');await page.locator('#message').fill('Second inquiry');await page.locator('#service').selectOption('websites');
  await page.locator('[name="_gotcha"]').evaluate(e=>e.value='spam');const spamCalls=calls;await submit.click();await expect(status).toHaveAttribute('data-state','error');assert.equal(calls,spamCalls);
  const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.deepEqual(a11y.violations,[]);
  await page.unroute('https://formspree.io/**');
 }
 results.push('Both languages: missing endpoint, validation, service selection, preserved error text, provider/network/rate/invalid-response errors, progress, duplicate prevention, success and honeypot passed; no real submission sent');
 assert.deepEqual(errors,[]);results.push('No browser JavaScript errors');
 await writeFile(join(artifacts,'browser-results.json'),JSON.stringify({date:new Date().toISOString(),checks,results},null,2));
 console.log(results.join('\n'));
}finally{await browser.close();main.server.close();fixture.server.close();}
