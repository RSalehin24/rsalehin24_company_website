import { company, pageKeys, pagePath } from '../data/site';
export const GET = () => {
 const urls = (['en', 'bn'] as const).flatMap(lang => pageKeys.map(page => '<url><loc>'+company.domain+pagePath(lang,page)+'</loc>'+(['en','bn'] as const).map(other => '<xhtml:link rel="alternate" hreflang="'+other+'" href="'+company.domain+pagePath(other,page)+'"/>').join('')+'<xhtml:link rel="alternate" hreflang="x-default" href="'+company.domain+pagePath('en',page)+'"/></url>')).join('');
 return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+urls+'</urlset>', { headers: { 'Content-Type': 'application/xml' } });
};
