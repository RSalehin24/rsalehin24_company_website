import test from 'node:test';
import assert from 'node:assert/strict';
import { formEndpoint, contactDelivery } from '../src/lib/form-config.mjs';
test('missing configuration leaves the delivery form unavailable', () => {
 for (const value of [undefined,'','  ','\n']) assert.equal(formEndpoint(value),null);
});
test('Worker delivery requires a public endpoint and public spam-check key', () => {
 assert.equal(contactDelivery(), null);
 assert.deepEqual(contactDelivery({workerEndpoint:'https://rsalehin24-contact.example.workers.dev/contact',turnstileSiteKey:'public-site-key'}),
  {endpoint:'https://rsalehin24-contact.example.workers.dev/contact',provider:'brevo',siteKey:'public-site-key'});
 for(const workerEndpoint of ['http://example.com/contact','https://user:password@example.com/contact','https://example.com/contact?secret=1','https://example.com/contact#secret','https://example.com/elsewhere']) {
  assert.throws(()=>contactDelivery({workerEndpoint,turnstileSiteKey:'public-site-key'}));
 }
 assert.throws(()=>contactDelivery({workerEndpoint:'https://example.com/contact'}));
 assert.equal(contactDelivery({formspreeEndpoint:'https://formspree.io/f/abcd1234'}).provider,'formspree');
});
test('accepts one public Formspree endpoint', () => {
 assert.equal(formEndpoint(' https://formspree.io/f/abcd1234 '),'https://formspree.io/f/abcd1234');
});
test('rejects placeholders and non-Formspree destinations', () => {
 for (const value of ['https://formspree.io/f/YOUR_FORM_ID','http://formspree.io/f/abcd','https://formspree.io.evil.test/f/abcd','https://example.com/f/abcd','https://formspree.io/f/abcd?token=secret','https://formspree.io/f/abcd/','mailto:mail@rsalehin24.me']) assert.throws(() => formEndpoint(value));
});
