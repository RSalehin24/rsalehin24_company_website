import { attachmentsError, attachmentLimit } from '../src/lib/contact-rules.mjs';

const multipartOverheadLimit = 1024 * 1024;
export const requestLimit = attachmentLimit + multipartOverheadLimit;
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

function readAttachments(form) {
  const files = form.getAll('attachment');
  if (files.some(file => !(file instanceof File))) throw new ContactError('invalid', 422, 'attachment');
  const error = attachmentsError(files);
  if (error) throw new ContactError(error, 422, 'attachment');
  return files.filter(file => file.name || file.size);
}

export function readInquiry(form) {
  if (form.get('_gotcha')) throw new ContactError('spam', 422);
  const inquiry = Object.fromEntries(Object.keys(fieldRules).map(name => [name, readText(form, name)]));
  if (!isEmail(inquiry.email)) throw new ContactError('invalid', 422, 'email');
  if (!services.has(inquiry.service)) throw new ContactError('invalid', 422, 'service');
  return { ...inquiry, attachments: readAttachments(form) };
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
