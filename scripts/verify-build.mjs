import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const origin = 'https://www.rsalehin24.me';
const root = resolve(process.argv[2] || 'dist');
const keys = ['','services/','products/','about/','contact/','privacy/'];
const routes = ['','bn/'].flatMap(prefix => keys.map(key => '/'+prefix+key));
const titles = new Set(), descriptions = new Set();
const attrs = text => Object.fromEntries([...text.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const tags = (html,tag) => [...html.matchAll(new RegExp('<'+tag+'\\b[^>]*>','g'))].map(m=>attrs(m[0]));
const fileFor = path => path.endsWith('/') ? join(root,path,'index.html') : join(root,path);
const exists = async path => { try { await stat(path); return true; } catch { return false; } };
const files=[];
async function walk(path){for(const ent of await readdir(path,{withFileTypes:true})){const full=join(path,ent.name);if(ent.isDirectory())await walk(full);else files.push(full);}}
await walk(root);
for (const route of routes) {
 const html=await readFile(fileFor(route),'utf8');
 assert.match(html,new RegExp('<html lang="'+(route.startsWith('/bn/')?'bn':'en')+'"'));
 assert.equal((html.match(/<h1\b/g)||[]).length,1,'one H1 at '+route);
 assert.ok(!html.includes('brand-dot'),'wordmark dot at '+route);
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1]; assert.ok(title); assert.ok(!titles.has(title)); titles.add(title);
 const metas=tags(html,'meta');const description=metas.find(m=>m.name==='description')?.content;
 assert.ok(description?.length>40);assert.ok(!descriptions.has(description));descriptions.add(description);
 const links=tags(html,'link');
 assert.equal(links.find(l=>l.rel==='canonical')?.href,origin+route);
 const suffix=route.replace(/^\/bn\//,'/');const en=origin+suffix;const bn=origin+'/bn'+suffix;
 for(const [lang,url] of [['en',en],['bn',bn],['x-default',en]])assert.equal(links.find(l=>l.hreflang===lang)?.href,url,'hreflang '+route);
 assert.equal(metas.find(m=>m.property==='og:url')?.content,origin+route);
 assert.equal(metas.find(m=>m.property==='og:title')?.content,title);
 assert.equal(metas.find(m=>m.property==='og:description')?.content,description);
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 const data=Array.isArray(schema)?schema:[schema];const business=data[0];
 assert.equal(business.name,'RSalehin24');assert.equal(business.telephone,'+8801608537383');assert.equal(business.address.postalCode,'1209');
 if(route.includes('/services/'))assert.equal(data.filter(d=>d['@type']==='Service').length,3);
 if(route.endsWith('contact/')) {
  assert.ok(html.includes('mailto:mail@rsalehin24.me'));assert.ok(html.includes('tel:+8801608537383'));
  const forms=tags(html,'form');
  if(forms.length){assert.equal(forms.length,1);assert.match(forms[0].action,/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/);assert.equal(forms[0].method,'POST');assert.ok(!html.includes('data-direct-contact'));}
  else {assert.ok(html.includes('data-direct-contact'));assert.ok(!html.includes('<form '));assert.ok(html.includes('data-copy-email'));assert.ok(html.includes('data-email-address'));}
 }
}
for(const file of files.filter(f=>f.endsWith('.html'))) {
 const html=await readFile(file,'utf8');
 assert.ok(!/https?:\/\/(?:www\.)?github\.com\//i.test(html),'repository link in '+file);
 assert.ok(!/localhost|127\.0\.0\.1|your-org|YOUR_FORM_ID|npm (?:run|install)/i.test(html));
 for (const tag of [...tags(html,'a'),...tags(html,'link'),...tags(html,'script'),...tags(html,'img')]) {
  const ref=tag.href||tag.src;if(!ref||!ref.startsWith('/'))continue;
  const url=new URL(ref,origin);const target=fileFor(decodeURIComponent(url.pathname));assert.ok(await exists(target),'missing '+ref+' in '+file);
  if(url.hash){const targetHTML=await readFile(target,'utf8');assert.ok(targetHTML.includes('id="'+url.hash.slice(1)+'"'),'missing anchor '+ref);}
 }
 for(const tag of tags(html,'img')) {assert.ok(tag.alt);assert.ok(tag.width&&tag.height);}
 for(const tag of [...tags(html,'img'),...tags(html,'source')])for(const src of (tag.srcset||'').split(',').filter(Boolean)){const path=src.trim().split(/\s+/)[0];assert.ok(await exists(fileFor(path)),'missing responsive image '+path);}
}
for(const path of ['/404.html','/bn/404/']){const html=await readFile(fileFor(path),'utf8');assert.match(html,/name="robots" content="noindex, follow"/);}
const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.deepEqual(new Set(urls),new Set(routes.map(r=>origin+r)));
assert.equal((sitemap.match(/hreflang="x-default"/g)||[]).length,12);
assert.match(await readFile(join(root,'robots.txt'),'utf8'),/Sitemap: https:\/\/www\.rsalehin24\.me\/sitemap\.xml/);
assert.equal((await readFile(join(root,'CNAME'),'utf8')).trim(),'www.rsalehin24.me');
console.log('Verified 12 localized routes, metadata, reciprocal hreflang, structured data, sitemap, internal links, images, 404s and contact fallback.');
