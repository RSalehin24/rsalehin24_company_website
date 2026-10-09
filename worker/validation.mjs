import { attachmentError, attachmentLimit } from '../src/lib/contact-rules.mjs';

export const requestLimit = attachmentLimit + 128 * 1024;
const fieldRules = {
  name: { required: true, max: 120 }, email: { required: true, max: 254 },
  subject: { required: true, max: 160 }, message: { required: true, max: 5000 },
  company: { max: 160 }, phone: { max: 50 }, service: { required: true, max: 30 },
};
const services = new Set(['websites', 'applications', 'automation', 'other']);

export class ContactError extends Error {
  constructor(code, status = 400, field) {
    super(code);
    this.code = code;
    this.status = status;
    this.field = field;
  }
}

export function isEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
}

function readText(form, name) {
  const values = form.getAll(name);
  if (values.length > 1 || (values.length && typeof values[0] !== 'string')) throw new ContactError('invalid', 422, name);
  const value = (values[0] || '').trim();
  const rule = fieldRules[name];
  if ((rule.required && !value) || value.length > rule.max || /[\u0000\u007f]/.test(value)) {
    throw new ContactError('invalid', 422, name);
  }
  if (name !== 'message' && /[\r\n]/.test(value)) throw new ContactError('invalid', 422, name);
  return value;
}

function readAttachment(form) {
  const files = form.getAll('attachment');
  if (files.length > 1 || (files.length && !(files[0] instanceof File))) throw new ContactError('invalid', 422, 'attachment');
  const file = files[0];
  if (!file || (!file.name && file.size === 0)) return null;
  const error = attachmentError(file);
  if (error) throw new ContactError(error, 422, 'attachment');
  return file;
}

export function readInquiry(form) {
  if (form.get('_gotcha')) throw new ContactError('spam', 422);
  const inquiry = Object.fromEntries(Object.keys(fieldRules).map(name => [name, readText(form, name)]));
  if (!isEmail(inquiry.email)) throw new ContactError('invalid', 422, 'email');
  if (!services.has(inquiry.service)) throw new ContactError('invalid', 422, 'service');
  return { ...inquiry, attachment: readAttachment(form) };
}

async function readLimitedBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new ContactError('invalid', 400);
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > requestLimit) throw new ContactError('tooLarge', 413);
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  return new Blob(chunks);
}

export async function readSubmission(request) {
  if (!request.headers.get('Content-Type')?.startsWith('multipart/form-data;')) throw new ContactError('invalid', 415);
  if (Number(request.headers.get('Content-Length')) > requestLimit) throw new ContactError('tooLarge', 413);
  const body = await readLimitedBody(request);
  try {
    return await new Response(body, { headers: { 'Content-Type': request.headers.get('Content-Type') } }).formData();
  } catch { throw new ContactError('invalid', 400); }
}
