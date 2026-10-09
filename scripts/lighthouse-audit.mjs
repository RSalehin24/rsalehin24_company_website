import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { mkdir, writeFile } from 'node:fs/promises';
const origin=process.env.AUDIT_URL||'http://127.0.0.1:4321';
await mkdir('.audit',{recursive:true});
const chrome=await launch({chromeFlags:['--headless','--no-sandbox'],chromePath:process.env.CHROME_PATH});
const results=[];
try{
 for(const route of (process.env.AUDIT_ROUTES ? process.env.AUDIT_ROUTES.split(',') : ['/','/bn/','/services/','/products/','/about/','/contact/','/privacy/'])){
  const report=await lighthouse(origin+route,{port:chrome.port,onlyCategories:['performance','accessibility','seo'],output:['json','html'],logLevel:'error'});
  const slug=route.replaceAll('/','-')||'home';await writeFile('.audit/lighthouse'+slug+'.json',report.report[0]);await writeFile('.audit/lighthouse'+slug+'.html',report.report[1]);
  const scores=Object.fromEntries(Object.entries(report.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)]));results.push({route,...scores});
  console.log(route,JSON.stringify(scores));
  if(scores.performance<90||scores.accessibility<95||scores.seo<95)console.log('Below target:',Object.values(report.lhr.audits).filter(a=>a.score!==null&&a.score<1).map(a=>a.id+': '+a.title).join(', '));
 }
 let previous=[];try{previous=JSON.parse(await (await import('node:fs/promises')).readFile('.audit/lighthouse-results.json','utf8'));}catch{}
 await writeFile('.audit/lighthouse-results.json',JSON.stringify([...previous.filter(p=>!results.some(r=>r.route===p.route)),...results],null,2));
 if(results.some(r=>r.performance<90||r.accessibility<95||r.seo<95))process.exitCode=1;
}finally{chrome.kill();}
