import { ContactError } from './validation.mjs';

function inquiryDate(now) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka', day: '2-digit', month: 'short', year: 'numeric',
  }).formatToParts(now);
  const date = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${date.day}${date.month}${date.year}`;
}

export async function nextInquiryReference(storage, now = new Date()) {
  const date = inquiryDate(now);
  return storage.transaction(async transaction => {
    const previous = (await transaction.get(date)) ?? 0;
    if (!Number.isSafeInteger(previous) || previous < 0 || previous === Number.MAX_SAFE_INTEGER) {
      throw new Error('Invalid inquiry counter');
    }
    const sequence = previous + 1;
    await transaction.put(date, sequence);
    return `RS24-${date}-${String(sequence).padStart(4, '0')}`;
  });
}

export async function reserveInquiryReference(namespace) {
  if (!namespace) throw new ContactError('unconfigured', 503);
  return namespace.getByName('daily-inquiries').nextReference();
}
