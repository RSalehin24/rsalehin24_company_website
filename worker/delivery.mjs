import { ContactError, isEmail } from './validation.mjs';
import { encodeAttachment } from './attachments.mjs';

export const recipient = 'mail@rsalehin24.me';
const turnstileURL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const brevoURL = 'https://api.brevo.com/v3/smtp/email';
const verificationTimeout = 10_000;
const deliveryTimeout = 20_000;

export function emailSender(env) {
  if (!isEmail(env.BREVO_SENDER_EMAIL)) throw new ContactError('unconfigured', 503);
  if (!env.BREVO_SENDER_ID) return { email: env.BREVO_SENDER_EMAIL, name: 'RSalehin24 website' };
  const id = Number(env.BREVO_SENDER_ID);
  if (!Number.isSafeInteger(id) || id < 1) throw new ContactError('unconfigured', 503);
  return { id };
}

export async function verifyChallenge(context, fetchRequest) {
  const token = context.form.get('cf-turnstile-response');
  if (typeof token !== 'string' || !token || token.length > 2048) throw new ContactError('challenge', 422);
  const body = new URLSearchParams({ secret: context.env.TURNSTILE_SECRET_KEY, response: token });
  const address = context.request.headers.get('CF-Connecting-IP');
  if (address) body.set('remoteip', address);
  const response = await fetchRequest(turnstileURL, { method: 'POST', body, signal: AbortSignal.timeout(verificationTimeout) });
  const result = await response.json();
  const hostname = new URL(context.request.headers.get('Origin')).hostname;
  if (!response.ok || result.success !== true || result.hostname !== hostname || result.action !== 'contact') {
    throw new ContactError('challenge', 422);
  }
}

function emailText(inquiry) {
  return `Client Name: ${inquiry.name}\nCompany: ${inquiry.company || 'Not supplied'}\nEmail: ${inquiry.email}\nPhone: ${inquiry.phone || 'Not supplied'}\nService: ${inquiry.service}\nInquiry reference: ${inquiry.reference}\n\n---\n\n${inquiry.message}`;
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

async function emailPayload(inquiry, sender) {
  const text = emailText(inquiry);
  const payload = {
    sender,
    to: [{ email: recipient, name: 'RSalehin24' }],
    replyTo: { email: inquiry.email, name: inquiry.name },
    subject: `[${inquiry.reference}] : ${inquiry.subject}`, textContent: text,
    htmlContent: `<html><body><pre style="white-space:pre-wrap;font-family:sans-serif">${escapeHTML(text)}</pre></body></html>`,
  };
  if (inquiry.attachment) payload.attachment = [await encodeAttachment(inquiry.attachment)];
  return payload;
}

export async function deliverInquiry(context, fetchRequest) {
  const payload = await emailPayload(context.inquiry, emailSender(context.env));
  const response = await fetchRequest(brevoURL, {
    method: 'POST', headers: { 'api-key': context.env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(deliveryTimeout),
  });
  if (response.status === 429) throw new ContactError('rate', 429);
  if (!response.ok) throw new ContactError('delivery', 502);
  const result = await response.json();
  if (typeof result.messageId !== 'string' || !result.messageId) throw new ContactError('delivery', 502);
}
