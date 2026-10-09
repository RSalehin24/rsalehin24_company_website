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
async function verifyDirectContact(page, language) {
 const panel=page.locator('[data-direct-contact]');
 await expect(panel.locator('a[href="tel:+8801608537383"]')).toBeVisible();
 const emailLink=panel.locator('a[href^="mailto:"]');
 await expect(emailLink).toBeVisible();
 const emailURL=new URL(await emailLink.getAttribute('href'));
 assert.equal(emailURL.pathname,'mail@rsalehin24.me');
 assert.ok(emailURL.searchParams.get('subject').includes('RSalehin24'));
 const gmailLink=panel.locator('a[href^="https://mail.google.com/mail/"]');
 await expect(gmailLink).toBeVisible();
 const gmailURL=new URL(await gmailLink.getAttribute('href'));
 assert.equal(gmailURL.origin,'https://mail.google.com');
 assert.equal(gmailURL.searchParams.get('view'),'cm');
 assert.equal(gmailURL.searchParams.get('to'),'mail@rsalehin24.me');
 assert.equal(gmailURL.searchParams.get('su'),emailURL.searchParams.get('subject'));
 await expect(gmailLink).toHaveAttribute('target','_blank');
 await expect(gmailLink).toHaveAttribute('rel','noopener noreferrer');
 await page.context().route('https://mail.google.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Gmail compose test</title>'}));
 const popupOpened=page.context().waitForEvent('page');
 await gmailLink.click();
 const popup=await popupOpened;
 await popup.waitForLoadState();
 assert.equal(popup.url(),gmailURL.href);
 await popup.close();
 await page.context().unroute('https://mail.google.com/**');
 const address=panel.locator('[data-email-address]');
 await expect(address).toHaveValue('mail@rsalehin24.me');
 await expect(address).toHaveAttribute('readonly','');
 const copy=panel.locator('[data-copy-email]');
 await expect(copy).toBeVisible();
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{document.body.dataset.copiedEmail=value;}}}));
 await copy.click();
 assert.equal(await page.evaluate(()=>document.body.dataset.copiedEmail),'mail@rsalehin24.me');
 await expect(panel.locator('[data-copy-feedback]')).toHaveText(await copy.getAttribute('data-copied'));
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Clipboard denied');}}}));
 await copy.click();
 await expect(panel.locator('[data-copy-feedback]')).toHaveText(await copy.getAttribute('data-copy-error'));
 await expect(address).toBeFocused();
 assert.equal(await address.evaluate(input=>input.selectionEnd-input.selectionStart), 'mail@rsalehin24.me'.length);
 await expect(copy).toBeEnabled();
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
 await copy.click();
 await expect(panel.locator('[data-copy-feedback]')).toHaveText(await copy.getAttribute('data-copy-error'));
 for(const width of [360,1440]) {
  await page.setViewportSize({width,height:1000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'contact actions overflow '+language+' '+width);
  await panel.screenshot({path:join(artifacts,'contact-'+language+'-'+width+'.png')});
 }
}
async function verifyWordmark(page) {
 const marks=page.locator('.wordmark');
 assert.equal(await marks.count(),2);
 for(const mark of await marks.all()) {
  assert.equal((await mark.innerText()).trim(),'RSalehin24');
  const sizes=await mark.evaluate(element=>({brand:getComputedStyle(element).fontSize,number:getComputedStyle(element.querySelector('.brand-number')).fontSize}));
  assert.equal(sizes.number,sizes.brand);
 }
}
const configured=join(artifacts,'form-site');
execFileSync(process.execPath,['node_modules/astro/bin/astro.mjs','build','--outDir',configured],{env:{...process.env,PUBLIC_CONTACT_ENDPOINT:'',PUBLIC_TURNSTILE_SITE_KEY:'',PUBLIC_FORMSPREE_ENDPOINT:'https://formspree.io/f/audit1234',ASTRO_TELEMETRY_DISABLED:'1'},stdio:'pipe'});
const workerConfigured=join(artifacts,'worker-site');
const workerEndpoint='https://rsalehin24-contact.example.workers.dev/contact';
execFileSync(process.execPath,['node_modules/astro/bin/astro.mjs','build','--outDir',workerConfigured],{env:{...process.env,PUBLIC_CONTACT_ENDPOINT:workerEndpoint,PUBLIC_TURNSTILE_SITE_KEY:'1x00000000000000000000AA',PUBLIC_FORMSPREE_ENDPOINT:'',ASTRO_TELEMETRY_DISABLED:'1'},stdio:'pipe'});
const main=await serve(resolve('dist')), fixture=await serve(configured), workerFixture=await serve(workerConfigured);
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
   if(route==='/')await verifyWordmark(page);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width+' '+route);
   for(const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(()=>image.evaluate(element=>element.complete&&element.naturalWidth>0),{message:'image loading '+route}).toBe(true);
   }
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
 for(const route of ['/contact/','/bn/contact/']) {
  await plain.goto(main.url+route);
  const panel=plain.locator('[data-direct-contact]');
  await expect(panel.locator('a[href="tel:+8801608537383"]')).toBeVisible();
  await expect(panel.locator('a[href^="https://mail.google.com/mail/"]')).toBeVisible();
  await expect(panel.locator('a[href^="mailto:"]')).toBeVisible();
  await expect(panel.locator('[data-email-address]')).toHaveValue('mail@rsalehin24.me');
  await expect(panel.locator('[data-copy-email]')).toBeHidden();
 }
 await plain.goto(fixture.url+'/contact/');await expect(plain.locator('form')).toHaveAttribute('action','https://formspree.io/f/audit1234');assert.equal(await plain.locator('form').evaluate(e=>e.noValidate),false);
 await expect(plain.locator('form')).toHaveAttribute('enctype','multipart/form-data');
 await plain.goto(workerFixture.url+'/contact/');await expect(plain.locator('button[type="submit"]')).toBeDisabled();await expect(plain.locator('noscript')).toBeVisible();
 await expect(plain.locator('.direct-details a[href="tel:+8801608537383"]')).toBeVisible();await nojs.close();
 results.push('All primary content and navigation readable without JavaScript; configured form retains native validation');
 const mockChallenge=`window.turnstile={ready:callback=>callback(),render:(container,options)=>{window.auditChallengeOptions=options;const widget=document.createElement('div');widget.style.width=options.size==='compact'?'150px':'300px';widget.style.height=options.size==='compact'?'140px':'65px';container.append(widget);const field=document.createElement('input');field.type='hidden';field.name='cf-turnstile-response';field.value='audit-token';container.append(field);return 'audit-widget';},reset:()=>{document.body.dataset.challengeResets=String(Number(document.body.dataset.challengeResets||0)+1);document.querySelector('[name="cf-turnstile-response"]').value='audit-token';}};`;
 await page.route('https://challenges.cloudflare.com/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:mockChallenge}));
 await page.setViewportSize({width:1440,height:1000});
 for(const language of ['en','bn']){
  const route=language==='en'?'/contact/':'/bn/contact/';await page.goto(main.url+route);
  await expect(page.locator('[data-direct-contact]')).toBeVisible();assert.equal(await page.locator('form').count(),0);
  await verifyDirectContact(page, language);
  for(const provider of ['formspree','brevo']) {
  const destination=provider==='brevo'?workerEndpoint:'https://formspree.io/f/audit1234';
  const base=provider==='brevo'?workerFixture.url:fixture.url;
  await page.goto(base+route+'?service=automation');
  const form=page.locator('form');const submit=form.locator('button[type="submit"]');const status=form.locator('[data-form-status]');
  await expect(form).toHaveAttribute('enctype','multipart/form-data');
  if(provider==='brevo'){
   await expect(page.locator('[name="cf-turnstile-response"]')).toHaveValue('audit-token');
   assert.equal(await page.evaluate(()=>window.auditChallengeOptions.size),'compact');
   assert.equal(await page.evaluate(()=>window.auditChallengeOptions.language),'en');
   const resets=await page.evaluate(()=>Number(document.body.dataset.challengeResets||0));
   await page.evaluate(()=>window.auditChallengeOptions['expired-callback']());
   assert.equal(await page.evaluate(()=>Number(document.body.dataset.challengeResets)),resets+1);
  }
  await expect(page.locator('#service')).toHaveValue('automation');
  let calls=0,mode='success',release;
  let lastSubmission;
  await page.route(destination,async routed=>{
   if(routed.request().method()==='OPTIONS')return routed.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'accept, content-type'}});
   calls++;lastSubmission=routed.request().postDataBuffer();const headers={'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
   if(mode==='slow')await new Promise(r=>release=r);
   if(mode==='network')return routed.abort('internetdisconnected');
   if(mode==='provider')return routed.fulfill({status:422,headers,body:JSON.stringify({errors:[{field:'email',message:'Invalid email'}]})});
   if(mode==='rate')return routed.fulfill({status:429,headers,body:'{"error":"rate limited"}'});
   if(mode==='malformed')return routed.fulfill({status:200,headers,body:'invalid'});
   if(mode==='unconfirmed')return routed.fulfill({status:200,headers,body:'{"ok":false}'});
   if(mode==='challenge')return routed.fulfill({status:422,headers,body:'{"ok":false,"code":"challenge"}'});
   return routed.fulfill({status:200,headers,body:'{"ok":true}'});
  });
  await submit.click();await expect(page.locator('#name')).toBeFocused();await expect(page.locator('#name')).toHaveAttribute('aria-invalid','true');assert.equal(calls,0);
  await page.locator('#name').fill('  ');await page.locator('#email').fill('invalid');await page.locator('#message').fill('A useful project brief.');
  await submit.click();await expect(page.locator('#email')).toHaveAttribute('aria-invalid','true');assert.equal(calls,0);
  await page.locator('#name').fill('Test Inquiry');await page.locator('#email').fill('test@example.com');
  await submit.click();await expect(page.locator('#subject')).toBeFocused();assert.equal(calls,0);
  await page.locator('#subject').fill('A project with an attachment');
  const attachment=page.locator('#attachment');
  for(const file of [{name:'unsafe.exe',mimeType:'application/octet-stream',buffer:Buffer.from('test')},{name:'empty.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(0)},{name:'large.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(5*1024*1024+1)}]) {
   await attachment.setInputFiles(file);await submit.click();await expect(attachment).toHaveAttribute('aria-invalid','true');await expect(attachment).toBeFocused();assert.equal(calls,0);
  }
  const fileBytes=Buffer.from([0,1,127,128,254,255]);
  await attachment.setInputFiles({name:'brief.pdf',mimeType:'application/pdf',buffer:fileBytes});
  if(provider==='brevo') {
   await page.locator('[name="cf-turnstile-response"]').evaluate(field=>field.value='');
   await submit.click();await expect(status).toHaveText(await form.getAttribute('data-challenge-error'));assert.equal(calls,0);
   await page.evaluate(()=>window.turnstile.reset('audit-widget'));
  }
  for(mode of ['network','provider','rate','malformed','unconfirmed']){
   await submit.click();await expect(status).toHaveAttribute('data-state','error');await expect(page.locator('#message')).toHaveValue('A useful project brief.');await expect(page.locator('#subject')).toHaveValue('A project with an attachment');assert.equal(await attachment.evaluate(input=>input.files[0].name),'brief.pdf');await expect(submit).toBeEnabled();
   if(mode==='rate')await expect(status).toHaveText(await form.getAttribute('data-rate-error'));
  }
  if(provider==='brevo'){mode='challenge';await submit.click();await expect(status).toHaveText(await form.getAttribute('data-challenge-error'));}
  assert.ok(lastSubmission.includes(Buffer.from('name="subject"')));assert.ok(lastSubmission.includes(Buffer.from('A project with an attachment')));assert.ok(lastSubmission.includes(Buffer.from('filename="brief.pdf"')));assert.ok(lastSubmission.includes(fileBytes));
  mode='slow';const before=calls;await submit.click();await expect(submit).toBeDisabled();await expect(form).toHaveAttribute('aria-busy','true');await expect(status).toHaveAttribute('data-state','pending');
  await form.evaluate(f=>{f.requestSubmit();f.requestSubmit();});assert.equal(calls,before+1);release();
  await expect(status).toHaveAttribute('data-state','success');await expect(page.locator('#message')).toHaveValue('');await expect(page.locator('#subject')).toHaveValue('');assert.equal(await attachment.evaluate(input=>input.files.length),0);await expect(submit).toBeEnabled();
  await page.locator('#name').fill('Test Inquiry');await page.locator('#email').fill('test@example.com');await page.locator('#subject').fill('Second subject');await page.locator('#message').fill('Second inquiry');await page.locator('#service').selectOption('websites');
  await page.locator('[name="_gotcha"]').evaluate(e=>e.value='spam');const spamCalls=calls;await submit.click();await expect(status).toHaveAttribute('data-state','error');assert.equal(calls,spamCalls);
  await page.locator('[name="_gotcha"]').evaluate(e=>e.value='');
  await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'form 200% zoom '+provider+' '+language);await page.evaluate(()=>document.documentElement.style.zoom='1');
  for(const width of [360,768,1440]) {
   await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'form overflow '+provider+' '+language+' '+width);
   const a11y=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.deepEqual(a11y.violations,[]);
   if(provider==='brevo')await page.locator('.contact-form-panel').screenshot({path:join(artifacts,'email-form-'+language+'-'+width+'.png')});
  }
  await page.unroute(destination);
  }
 }
 await page.route('https://challenges.cloudflare.com/**',route=>route.abort('internetdisconnected'));
 for(const route of ['/contact/','/bn/contact/']){
  await page.goto(workerFixture.url+route);const form=page.locator('form');
  await expect(form.locator('[data-form-status]')).toHaveText(await form.getAttribute('data-challenge-error'));
  await expect(page.locator('.direct-details a[href="tel:+8801608537383"]')).toBeVisible();
  assert.equal(await page.locator('[name="cf-turnstile-response"]').count(),0);
 }
 const timeoutPage=await ctx.newPage();await timeoutPage.clock.install();
 timeoutPage.on('pageerror',error=>errors.push(error.message));
 let timedRequest,timeoutCalls=0;
 await timeoutPage.route('https://formspree.io/f/audit1234',routed=>{timedRequest=routed;timeoutCalls++;});
 await timeoutPage.goto(fixture.url+'/contact/');
 for(const [name,value] of Object.entries({name:'Timeout test',email:'test@example.com',subject:'Keep my draft',message:'Keep this message'}))await timeoutPage.locator('#'+name).fill(value);
 await timeoutPage.locator('#service').selectOption('websites');
 await timeoutPage.locator('#attachment').setInputFiles({name:'brief.txt',mimeType:'text/plain',buffer:Buffer.from('keep this file')});
 await timeoutPage.locator('button[type="submit"]').click();await expect(timeoutPage.locator('form')).toHaveAttribute('aria-busy','true');
 await expect.poll(()=>timeoutCalls).toBe(1);await timeoutPage.clock.fastForward(41_000);
 await expect(timeoutPage.locator('[data-form-status]')).toHaveAttribute('data-state','error');
 await expect(timeoutPage.locator('#subject')).toHaveValue('Keep my draft');await expect(timeoutPage.locator('#message')).toHaveValue('Keep this message');
 assert.equal(await timeoutPage.locator('#attachment').evaluate(input=>input.files[0].name),'brief.txt');
 await expect(timeoutPage.locator('button[type="submit"]')).toBeEnabled();
 await timedRequest.abort();await timeoutPage.close();
 results.push('Both languages and providers: subject/body/attachment multipart delivery, attachment type/empty/size validation, spam verification and expiry, blocked verification script, missing endpoint, preserved text and files after errors, provider/network/rate/invalid-response errors, 40-second timeout, duplicate prevention, success reset and honeypot passed; no real submission sent');
 assert.deepEqual(errors,[]);results.push('No browser JavaScript errors');
 results.push('Both languages: Gmail compose links and popup navigation (intercepted), mail-app and call actions, encoded inquiry subject, copy success, clipboard denial/unavailability, manual selection and no-JavaScript contact options passed. Header/footer wordmarks have no dot and full-size numerals.');
 await writeFile(join(artifacts,'browser-results.json'),JSON.stringify({date:new Date().toISOString(),checks,results},null,2));
 console.log(results.join('\n'));
}finally{await browser.close();main.server.close();fixture.server.close();workerFixture.server.close();}
