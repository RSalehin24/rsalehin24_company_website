import test from 'node:test';
import assert from 'node:assert/strict';
import { handleContact } from '../worker/contact.mjs';
import { attachmentLimit, attachmentError } from '../src/lib/contact-rules.mjs';
import { requestLimit } from '../worker/validation.mjs';
import { createAttachmentArchive } from '../worker/attachment-archive.mjs';
import { nextInquiryReference } from '../worker/inquiry-reference.mjs';
import { inquiryStorage } from './helpers/inquiry-storage.mjs';

const reference = 'RS24-10Aug2026-0003';
const env = {
 BREVO_API_KEY: 'test-api-key', TURNSTILE_SECRET_KEY: 'test-secret-key', BREVO_SENDER_EMAIL: 'mail@rsalehin24.me',
 INQUIRY_COUNTER: {getByName(name) { assert.equal(name,'daily-inquiries'); return {nextReference:async()=>reference}; }},
};
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
 assert.deepEqual(await response.json(),{ok:true,reference});
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
 assert.equal(payload.subject,'['+reference+'] : A new website');
 assert.equal(payload.textContent,'Client Name: A Client\nCompany: A company\nEmail: client@example.com\nPhone: +8801234567890\nService: websites\nInquiry reference: '+reference+'\n\n---\n\nA project brief.\r\nবাংলা বার্তা <script>bad()</script>');
 assert.ok(payload.htmlContent.includes(reference));
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

test('keeps inquiries addressed to the company inbox when using a separate website sender', async () => {
 for (const senderId of [undefined,'10']) {
  const mock = deliveryMock();
  const senderEnv = {...env, BREVO_SENDER_EMAIL:'website@rsalehin24.me', BREVO_SENDER_ID:senderId};
  const response = await handleContact(requestFor(inquiryForm()), senderEnv, mock.fetchRequest);
  assert.equal(response.status,200);
  const payload = JSON.parse(mock.calls[1].request.body);
  assert.deepEqual(payload.to,[{email:'mail@rsalehin24.me',name:'RSalehin24'}]);
  assert.deepEqual(payload.replyTo,{email:'client@example.com',name:'A Client'});
  assert.deepEqual(payload.sender, senderId ? {id:10} : {email:'website@rsalehin24.me',name:'RSalehin24 website'});
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

test('renames a large PNG with a macOS Unicode filename and delivers it directly', async () => {
 const name = 'Screenshot 2026-10-09 at 10.41.57\u202fPM.png';
 const content = new Uint8Array(1_139_016).fill(128);
 const form = inquiryForm();
 form.append('attachment',new File([content],name,{type:'image/png'}));
 const mock = deliveryMock();
 const response = await handleContact(requestFor(form),env,mock.fetchRequest);
 assert.deepEqual(await response.json(),{ok:true,reference});
 const attachment = JSON.parse(mock.calls[1].request.body).attachment[0];
 assert.equal(attachment.name,'pic_01.png');
 assert.deepEqual(Buffer.from(attachment.content,'base64'),Buffer.from(content));
});

test('renames PDF, documents, spreadsheets and text after multipart parsing, preserving bytes', async () => {
 for (const [name,filename] of [['প্রস্তাবনা.pdf','pdf_01.pdf'],['প্রস্তাবনা.docx','doc_01.docx'],['হিসাব.xlsx','excel_01.xlsx'],['নোট.txt','text_01.txt'],['নোট.md','text_01.md.zip']]) {
  const form = inquiryForm();
  form.append('attachment',new File([binary],name));
  const mock = deliveryMock();
  const response = await handleContact(requestFor(form),env,mock.fetchRequest);
  assert.equal(response.status,200);
  const attachment = JSON.parse(mock.calls[1].request.body).attachment[0];
  assert.equal(attachment.name,filename);
  const expected = filename.endsWith('.zip') ? createAttachmentArchive('text_01.md',binary) : binary;
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

test('enforces every attachment type, empty-file and combined-size rule on the server', async () => {
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
 form.append('attachment','not a file');
 assert.equal((await handleContact(requestFor(form),env,deliveryMock().fetchRequest)).status,422);
 assert.equal(attachmentError({name:'brief.PDF',size:attachmentLimit}),null);
 assert.equal(attachmentError(undefined),null);
});

test('delivers multiple files with per-category numbering and one inquiry reference', async () => {
 const form = inquiryForm();
 for(const name of ['ছবি.png','দ্বিতীয়.jpg','প্রস্তাব.pdf','নোট.txt','নোট.md'])form.append('attachment',new File([binary],name));
 const mock = deliveryMock();
 const response = await handleContact(requestFor(form),env,mock.fetchRequest);
 assert.deepEqual(await response.json(),{ok:true,reference});
 assert.equal(mock.calls.length,2);
 const payload = JSON.parse(mock.calls[1].request.body);
 assert.deepEqual(payload.attachment.map(file=>file.name),['pic_01.png','pic_02.jpg','pdf_01.pdf','text_01.txt','text_02.md.zip']);
 assert.deepEqual(Buffer.from(payload.attachment[0].content,'base64'),Buffer.from(binary));
 assert.deepEqual(Buffer.from(payload.attachment[4].content,'base64'),Buffer.from(createAttachmentArchive('text_02.md',binary)));
});

test('checks the complete selection before contacting providers and accepts the exact combined limit', async () => {
 const content = new Uint8Array(attachmentLimit/2);
 const form = inquiryForm({'cf-turnstile-response':null});
 form.append('attachment',new File([content],'first.pdf'));
 form.append('attachment',new File([content],'second.png'));
 const mock = deliveryMock();
 const response = await handleContact(requestFor(form),env,mock.fetchRequest);
 assert.equal(response.status,422);
 assert.equal((await response.json()).code,'challenge');
 assert.equal(mock.calls.length,0);
 form.append('attachment',new File(['x'],'extra.txt'));
 const oversized = await handleContact(requestFor(form),env,mock.fetchRequest);
 assert.equal(oversized.status,422);
 assert.equal((await oversized.json()).code,'fileSizeError');
 assert.equal(mock.calls.length,0);
});

test('has no fixed attachment-count limit and rejects an invalid later file before sending', async () => {
 const form = inquiryForm();
 for(let index=0;index<100;index++)form.append('attachment',new File(['note'],`note_${index}.txt`));
 const mock = deliveryMock();
 const response = await handleContact(requestFor(form),env,mock.fetchRequest);
 assert.equal(response.status,200);
 assert.equal(JSON.parse(mock.calls[1].request.body).attachment.length,100);
 form.append('attachment',new File(['invalid'],'program.exe'));
 const rejected = deliveryMock();
 const failure = await handleContact(requestFor(form),env,rejected.fetchRequest);
 assert.equal(failure.status,422);
 assert.deepEqual((await failure.json()).errors,[{field:'attachment'}]);
 assert.equal(rejected.calls.length,0);
});

test('rejects email-encoding overflow before sending while allowing selections that fit', async () => {
 for(const [size,expectedStatus] of [[13*1024*1024,200],[15*1024*1024,422]]) {
  const form = inquiryForm();
  form.append('attachment',new File([new Uint8Array(size)],'large.png'));
  const mock = deliveryMock();
  const response = await handleContact(requestFor(form),env,mock.fetchRequest);
  assert.equal(response.status,expectedStatus);
  const result = await response.json();
  if(expectedStatus===200)assert.deepEqual(result,{ok:true,reference});
  else assert.deepEqual(result,{ok:false,code:'emailSize',errors:[{field:'attachment'}]});
  assert.equal(mock.calls.length,expectedStatus===200?2:1);
 }
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

test('only allocates references after validation and spam verification, ignoring client-supplied references', async () => {
 const storage = inquiryStorage();
 const counter = {getByName:()=>({nextReference:()=>nextInquiryReference(storage,new Date('2026-08-10T04:00:00Z'))})};
 const configured = {...env,INQUIRY_COUNTER:counter};
 await handleContact(requestFor(inquiryForm({email:'invalid'})),configured,deliveryMock().fetchRequest);
 await handleContact(requestFor(inquiryForm()),configured,deliveryMock({challenge:{success:false}}).fetchRequest);
 assert.equal(storage.values.size,0);
 const mock = deliveryMock();
 const result = await handleContact(requestFor(inquiryForm({reference:'forged-reference'})),configured,mock.fetchRequest);
 assert.deepEqual(await result.json(),{ok:true,reference:'RS24-10Aug2026-0001'});
 assert.equal(JSON.parse(mock.calls[1].request.body).subject,'[RS24-10Aug2026-0001] : A new website');
});

test('does not reuse a reserved reference after a provider rejection', async () => {
 const storage = inquiryStorage();
 const configured = {...env,INQUIRY_COUNTER:{getByName:()=>({nextReference:()=>nextInquiryReference(storage,new Date('2026-08-10T04:00:00Z'))})}};
 const rejected = await handleContact(requestFor(inquiryForm()),configured,deliveryMock({status:400}).fetchRequest);
 assert.equal(rejected.status,502);
 assert.equal('reference' in await rejected.json(),false);
 const accepted = await handleContact(requestFor(inquiryForm()),configured,deliveryMock().fetchRequest);
 assert.deepEqual(await accepted.json(),{ok:true,reference:'RS24-10Aug2026-0002'});
});

test('fails safely if persistent reference storage is missing or unavailable', async context => {
 const mock = deliveryMock();
 const missing = await handleContact(requestFor(inquiryForm()),{...env,INQUIRY_COUNTER:undefined},mock.fetchRequest);
 assert.equal(missing.status,503);
 assert.equal(mock.calls.length,0);
 const log = context.mock.method(console,'error',()=>{});
 const unavailable = {...env,INQUIRY_COUNTER:{getByName:()=>({nextReference:async()=>{throw new Error('Storage unavailable');}})}};
 const response = await handleContact(requestFor(inquiryForm()),unavailable,mock.fetchRequest);
 assert.equal(response.status,502);
 assert.deepEqual(await response.json(),{ok:false,code:'delivery',errors:[]});
 assert.equal(mock.calls.length,1);
 assert.equal(log.mock.calls.length,1);
});
