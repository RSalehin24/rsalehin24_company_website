import test from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../worker/contact.mjs';
import { attachmentLimit, attachmentError } from '../src/lib/contact-rules.mjs';
import { requestLimit } from '../worker/validation.mjs';
import { createAttachmentArchive } from '../worker/attachment-archive.mjs';

const env = { BREVO_API_KEY: 'test-api-key', TURNSTILE_SECRET_KEY: 'test-secret-key', BREVO_SENDER_EMAIL: 'mail@rsalehin24.me' };
const origin = 'https://www.rsalehin24.me';
const binary = Uint8Array.from({length:65539},(_,index)=>index%256);

function inquiryForm(overrides = {}) {
 const values = {name:'A Client',email:'client@example.com',subject:'A new website',message:'A project brief.\nবাংলা বার্তা <script>bad()</script>',service:'websites',company:'A company',phone:'+8801234567890','cf-turnstile-response':'test-token',...overrides};
 const form = new FormData();
 for(const [name,value] of Object.entries(values)) if(value !== null) form.append(name,value);
 return form;
}

function requestFor(form, overrides = {}) {
 return new Request('https://rsalehin24-contact.example.workers.dev/contact', {method:'POST',headers:{Origin:origin,'CF-Connecting-IP':'192.0.2.1'},body:form,...overrides});
}

function deliveryMock(options = {}) {
 const calls = [];
 const fetchRequest = async (url, request) => {
  calls.push({url,request});
  if(url.includes('siteverify')) return Response.json({success:true,hostname:'www.rsalehin24.me',action:'contact',...options.challenge});
  if(options.network) throw new Error('Network unavailable');
  return Response.json(options.result || {messageId:'test-message-id'}, {status:options.status || 201});
 };
 return {calls,fetchRequest};
}

test('delivers subject, body, reply address and binary attachment to the fixed recipient', async () => {
 const form = inquiryForm();
 form.append('to','attacker@example.com');
 form.append('attachment',new File([binary],'brief.pdf',{type:'application/pdf'}));
 const mock = deliveryMock();
 const response = await handleContact(requestFor(form),env,mock.fetchRequest);
 assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{ok:true});
 assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);
 assert.equal(response.headers.get('Cache-Control'),'no-store');
 assert.equal(mock.calls.length,2);
 const check = mock.calls[0].request.body;
 assert.equal(check.get('secret'),env.TURNSTILE_SECRET_KEY);
 assert.equal(check.get('remoteip'),'192.0.2.1');
 const mail = mock.calls[1].request;
 const payload = JSON.parse(mail.body);
 assert.deepEqual(payload.to,[{email:'mail@rsalehin24.me',name:'RSalehin24'}]);
 assert.equal(payload.sender.email,env.BREVO_SENDER_EMAIL);
 assert.deepEqual(payload.replyTo,{email:'client@example.com',name:'A Client'});
 assert.equal(payload.subject,'A new website');
 assert.ok(payload.textContent.includes('বাংলা বার্তা <script>bad()</script>'));
 assert.ok(payload.htmlContent.includes('&lt;script&gt;bad()&lt;/script&gt;'));
 assert.ok(!payload.htmlContent.includes('<script>'));
 assert.equal(mail.headers['api-key'],env.BREVO_API_KEY);
 assert.equal(payload.attachment[0].name,'brief.pdf');
 assert.deepEqual(Buffer.from(payload.attachment[0].content,'base64'),Buffer.from(binary));
});

test('supports no attachment and both website origins', async () => {
 for(const address of [origin,'https://rsalehin24.me']) {
  const mock = deliveryMock({challenge:{hostname:new URL(address).hostname}});
  const response = await handleContact(requestFor(inquiryForm(),{headers:{Origin:address}}),env,mock.fetchRequest);
  assert.equal(response.status,200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'),address);
  assert.ok(!('attachment' in JSON.parse(mock.calls[1].request.body)));
 }
});

test('uses the registered sender ID and rejects an invalid ID before contacting providers', async () => {
 const mock = deliveryMock();
 const form = inquiryForm();
 form.append('sender', 'attacker@example.com');
 const response = await handleContact(requestFor(form), {...env, BREVO_SENDER_ID:'4'}, mock.fetchRequest);
 assert.equal(response.status,200);
 assert.deepEqual(JSON.parse(mock.calls[1].request.body).sender,{id:4});
 for (const id of ['-1','0','invalid','1.5','9007199254740992']) {
  const rejected = deliveryMock();
  const result = await handleContact(requestFor(inquiryForm()), {...env, BREVO_SENDER_ID:id}, rejected.fetchRequest);
  assert.equal(result.status,503);
  assert.equal((await result.json()).code,'unconfigured');
  assert.equal(rejected.calls.length,0);
 }
});

test('delivers Excel directly and packages Markdown, SVG and DCX with their original names and bytes', async () => {
 for (const name of ['brief.xlsx', 'notes.md', 'image.svg', 'image.dcx', 'brief.docs']) {
  const form = inquiryForm();
  form.append('attachment',new File([binary],name));
  const mock = deliveryMock();
  const response = await handleContact(requestFor(form),env,mock.fetchRequest);
  assert.equal(response.status,200);
  const attachment = JSON.parse(mock.calls[1].request.body).attachment[0];
  const expected = name.endsWith('.xlsx') ? binary : createAttachmentArchive(name,binary);
  assert.equal(attachment.name,name.endsWith('.xlsx') ? name : name+'.zip');
  assert.deepEqual(Buffer.from(attachment.content,'base64'),Buffer.from(expected));
 }
});

test('rejects missing, duplicate, invalid and oversized fields before contacting providers', async () => {
 const invalid = [{email:null},{email:'invalid'},{subject:' '},{subject:'x'.repeat(161)},{subject:'Subject\r\nBcc: victim@example.com'},{message:'x'.repeat(5001)},{service:'invalid'},{_gotcha:'spam'}];
 const forms = invalid.map(inquiryForm);
 const duplicate = inquiryForm(); duplicate.append('email','other@example.com'); forms.push(duplicate);
 for(const form of forms) {
  const mock = deliveryMock();
  const response = await handleContact(requestFor(form),env,mock.fetchRequest);
  assert.equal(response.status,422);
  assert.equal((await response.json()).ok,false);
  assert.equal(mock.calls.length,0);
 }
});

test('enforces attachment types, size and one file on the server', async () => {
 const cases = [new File(['bad'],'program.exe'),new File([],'empty.pdf'),new File(['bad'],'../brief.pdf'),new File([new Uint8Array(attachmentLimit+1)],'large.pdf')];
 for(const file of cases) {
  const form = inquiryForm(); form.append('attachment',file);
  const mock = deliveryMock();
  const response = await handleContact(requestFor(form),env,mock.fetchRequest);
  assert.equal(response.status,422);
  assert.deepEqual((await response.json()).errors,[{field:'attachment'}]);
  assert.equal(mock.calls.length,0);
 }
 const form = inquiryForm();
 form.append('attachment',new File(['one'],'one.pdf'));
 form.append('attachment',new File(['two'],'two.pdf'));
 assert.equal((await handleContact(requestFor(form),env,deliveryMock().fetchRequest)).status,422);
 assert.equal(attachmentError({name:'brief.PDF',size:attachmentLimit}),null);
 assert.equal(attachmentError(undefined),null);
});

test('checks spam tokens, their hostname and action before sending mail', async () => {
 for(const challenge of [{success:false},{hostname:'attacker.example'},{action:'another-form'}]) {
  const mock = deliveryMock({challenge});
  const response = await handleContact(requestFor(inquiryForm()),env,mock.fetchRequest);
  assert.equal(response.status,422);
  assert.equal((await response.json()).code,'challenge');
  assert.equal(mock.calls.length,1);
 }
 const mock = deliveryMock();
 assert.equal((await handleContact(requestFor(inquiryForm({'cf-turnstile-response':null})),env,mock.fetchRequest)).status,422);
 assert.equal(mock.calls.length,0);
});

test('returns errors for provider rejection, rate limits and unconfirmed responses', async () => {
 for(const options of [{status:400},{status:429},{result:{ok:true}}]) {
  const response = await handleContact(requestFor(inquiryForm()),env,deliveryMock(options).fetchRequest);
  assert.equal(response.status,options.status===429?429:502);
  assert.equal((await response.json()).ok,false);
 }
});

test('returns a safe error when a provider connection times out', async context => {
 const log = context.mock.method(console,'error',()=>{});
 const mock = deliveryMock();
 const response = await handleContact(requestFor(inquiryForm()),env,async (url,options) => {
  if(url.includes('siteverify')) return mock.fetchRequest(url,options);
  assert.ok(options.signal instanceof AbortSignal);
  throw new DOMException('Provider timed out','TimeoutError');
 });
 assert.equal(response.status,502);
 assert.deepEqual(await response.json(),{ok:false,code:'delivery',errors:[]});
 assert.equal(log.mock.calls.length,1);
 assert.deepEqual(log.mock.calls[0].arguments,['Contact service request failed']);
});

test('rejects disallowed origins, methods and missing configuration', async () => {
 const mock = deliveryMock();
 const rejected = await handleContact(requestFor(inquiryForm(),{headers:{Origin:'https://attacker.example'}}),env,mock.fetchRequest);
 assert.equal(rejected.status,403);
 assert.equal(rejected.headers.get('Access-Control-Allow-Origin'),null);
 assert.equal((await handleContact(requestFor(inquiryForm()),{},mock.fetchRequest)).status,503);
 assert.equal((await handleContact(new Request('https://example.com/contact',{headers:{Origin:origin}}),env,mock.fetchRequest)).status,405);
 const options = await handleContact(new Request('https://example.com/contact',{method:'OPTIONS',headers:{Origin:origin}}),{},mock.fetchRequest);
 assert.equal(options.status,204);
 assert.equal(mock.calls.length,0);
});

test('caps the request body even when no content length is supplied', async () => {
 const large = requestFor(new Uint8Array(requestLimit+1),{headers:{Origin:origin,'Content-Type':'multipart/form-data; boundary=large'}});
 const response = await handleContact(large,env,deliveryMock().fetchRequest);
 assert.equal(response.status,413);
 const malformed = requestFor('invalid',{headers:{Origin:origin,'Content-Type':'multipart/form-data; boundary=missing'}});
 assert.equal((await handleContact(malformed,env,deliveryMock().fetchRequest)).status,400);
});
