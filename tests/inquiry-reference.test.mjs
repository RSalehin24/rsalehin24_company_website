import test from 'node:test';
import assert from 'node:assert/strict';
import { nextInquiryReference } from '../worker/inquiry-reference.mjs';
import { inquiryStorage } from './helpers/inquiry-storage.mjs';

test('numbers inquiries in order using the requested date format and prefix', async () => {
  const storage = inquiryStorage();
  const now = new Date('2026-08-10T04:00:00Z');
  const references = [];
  for (let index = 0; index < 3; index++) references.push(await nextInquiryReference(storage, now));
  assert.deepEqual(references, ['RS24-10Aug2026-0001', 'RS24-10Aug2026-0002', 'RS24-10Aug2026-0003']);
  assert.deepEqual([...storage.values], [['10Aug2026', 3]]);
});

test('resets at Dhaka midnight and retains previous days through storage reloads', async () => {
  const first = inquiryStorage();
  assert.equal(await nextInquiryReference(first, new Date('2026-12-31T17:59:59.999Z')), 'RS24-31Dec2026-0001');
  const restarted = inquiryStorage(first.values);
  assert.equal(await nextInquiryReference(restarted, new Date('2026-12-31T18:00:00Z')), 'RS24-01Jan2027-0001');
  assert.equal(await nextInquiryReference(restarted, new Date('2026-12-31T17:59:59.999Z')), 'RS24-31Dec2026-0002');
});

test('allocates distinct consecutive references to simultaneous requests', async () => {
  const storage = inquiryStorage();
  const now = new Date('2026-09-01T00:00:00Z');
  const references = await Promise.all(Array.from({ length: 50 }, () => nextInquiryReference(storage, now)));
  assert.equal(new Set(references).size, 50);
  assert.equal(references[0], 'RS24-01Sep2026-0001');
  assert.equal(references.at(-1), 'RS24-01Sep2026-0050');
});

test('extends the order number beyond four digits instead of wrapping', async () => {
  const storage = inquiryStorage([['10Aug2026', 9999]]);
  assert.equal(await nextInquiryReference(storage, new Date('2026-08-10T04:00:00Z')), 'RS24-10Aug2026-10000');
});

test('rejects invalid or exhausted counters without changing stored values', async () => {
  for (const value of [-1, 1.5, '3', Number.MAX_SAFE_INTEGER]) {
    const storage = inquiryStorage([['10Aug2026', value]]);
    await assert.rejects(nextInquiryReference(storage, new Date('2026-08-10T04:00:00Z')), /Invalid inquiry counter/);
    assert.equal(storage.values.get('10Aug2026'), value);
  }
});
