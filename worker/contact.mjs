import { ContactError, readInquiry, readSubmission } from './validation.mjs';
import { deliverInquiry, emailSender, verifyChallenge } from './delivery.mjs';

const origins = new Set(['https://www.rsalehin24.me', 'https://rsalehin24.me']);

function responseFor(request, result, status = 200) {
  const origin = request.headers.get('Origin');
  const headers = { 'Cache-Control': 'no-store', Vary: 'Origin' };
  if (origins.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Accept, Content-Type';
  }
  return status === 204 ? new Response(null, { status, headers }) : Response.json(result, { status, headers });
}

function checkRequest(request, env) {
  if (new URL(request.url).pathname !== '/contact') throw new ContactError('notFound', 404);
  if (!origins.has(request.headers.get('Origin'))) throw new ContactError('origin', 403);
  if (request.method !== 'POST' && request.method !== 'OPTIONS') throw new ContactError('method', 405);
  if (request.method === 'OPTIONS') return;
  if (!env.BREVO_API_KEY || !env.TURNSTILE_SECRET_KEY) {
    throw new ContactError('unconfigured', 503);
  }
  emailSender(env);
}

async function acceptSubmission(request, env, fetchRequest) {
  const form = await readSubmission(request);
  const inquiry = readInquiry(form);
  await verifyChallenge({ form, request, env }, fetchRequest);
  await deliverInquiry({ inquiry, env }, fetchRequest);
}

export async function handleContact(request, env, fetchRequest = fetch) {
  try {
    checkRequest(request, env);
    if (request.method === 'OPTIONS') return responseFor(request, null, 204);
    await acceptSubmission(request, env, fetchRequest);
    return responseFor(request, { ok: true });
  } catch (error) {
    const failure = error instanceof ContactError ? error : new ContactError('delivery', 502);
    if (!(error instanceof ContactError)) console.error('Contact service request failed');
    const errors = failure.field ? [{ field: failure.field }] : [];
    return responseFor(request, { ok: false, code: failure.code, errors }, failure.status);
  }
}

export default { fetch(request, env) { return handleContact(request, env); } };
