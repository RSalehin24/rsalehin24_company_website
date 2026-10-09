import test from 'node:test';
import assert from 'node:assert/strict';
import { formEndpoint } from '../src/lib/form-config.mjs';
test('missing configuration leaves the delivery form unavailable', () => {
 for (const value of [undefined,'','  ','\n']) assert.equal(formEndpoint(value),null);
});
test('accepts one public Formspree endpoint', () => {
 assert.equal(formEndpoint(' https://formspree.io/f/abcd1234 '),'https://formspree.io/f/abcd1234');
});
test('rejects placeholders and non-Formspree destinations', () => {
 for (const value of ['https://formspree.io/f/YOUR_FORM_ID','http://formspree.io/f/abcd','https://formspree.io.evil.test/f/abcd','https://example.com/f/abcd','https://formspree.io/f/abcd?token=secret','https://formspree.io/f/abcd/','mailto:mail@rsalehin24.me']) assert.throws(() => formEndpoint(value));
});
