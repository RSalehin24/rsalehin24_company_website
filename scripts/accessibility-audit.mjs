import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4321';
const keys=['','services/','products/','about/','contact/','privacy/'];
const routes=['','bn/'].flatMap(prefix=>keys.map(key=>'/'+prefix+key));
const jobs=[360,768,1440].flatMap(width=>routes.map(route=>({width,route})));
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
const results=[];
await mkdir('.audit',{recursive:true});
try{
 // Bounded browser concurrency keeps the full accessibility scan practical.
 await Promise.all(Array.from({length:3},async()=>{
  const context=await browser.newContext();const page=await context.newPage();
  while(jobs.length){
   const {width,route}=jobs.shift();await page.setViewportSize({width,height:900});await page.goto(base+route);
   await page.evaluate(()=>document.fonts.ready);
   const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']).analyze();
   const violations=scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));
   results.push({width,route,violations});assert.deepEqual(violations,[],'Accessibility '+route+' at '+width);
   if(width===1440 && route==='/')await page.screenshot({path:'.audit/preview.png'});
  }
  await context.close();
 }));
 // Test text enlargement separately from page zoom.
 const large=await browser.newPage({viewport:{width:1280,height:900}});
 for(const route of routes){
  await large.goto(base+route);await large.evaluate(()=>document.documentElement.style.fontSize='200%');
  assert.equal(await large.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'200% text '+route);
  await expect(large.locator('h1')).toBeVisible();
 }
 for(const route of ['/404.html','/bn/404/']){
  await large.goto(base+route);await expect(large.locator('h1')).toBeVisible();
  assert.equal(await large.locator('meta[name="robots"]').getAttribute('content'),'noindex, follow');
 }
 await writeFile('.audit/accessibility-results.json',JSON.stringify({date:new Date().toISOString(),results,textEnlargement:'12 routes passed at 200%',notFound:'both localized recovery pages passed'},null,2));
 console.log('Final WCAG and best-practice scans: 36 route/viewport combinations passed. All 12 routes pass 200% text enlargement; both 404 pages verified.');
}finally{await browser.close();}
