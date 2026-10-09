const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form) {
 const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
 const status = form.querySelector<HTMLElement>('[data-form-status]')!;
 const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('.form-field input, .form-field select, .form-field textarea'));
 const service = form.querySelector<HTMLSelectElement>('[name="service"]');
 const interest = new URLSearchParams(location.search).get('service');
 if (service && interest && Array.from(service.options).some(option => option.value === interest)) service.value = interest;
 form.noValidate = true;
 let sending = false;
 const show = (text: string, state: string) => { status.textContent = text; status.dataset.state = state; };
 const clearField = (field: typeof fields[number]) => {
  field.removeAttribute('aria-invalid');
  const error = document.getElementById(field.id + '-error');
  if (error) error.textContent = '';
 };
 const setError = (field: typeof fields[number], text: string) => {
  field.setAttribute('aria-invalid','true');
  const error = document.getElementById(field.id + '-error');
  if (error) error.textContent = text;
 };
 fields.forEach(field => field.addEventListener('input', () => clearField(field)));
 form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending) return;
  fields.forEach(clearField);
  const invalid = fields.filter(field => !field.validity.valid || (field.required && !field.value.trim()));
  if (invalid.length) {
   invalid.forEach(field => setError(field, (field.validity.typeMismatch ? form.dataset.emailError : field.validity.tooLong ? form.dataset.longError : form.dataset.requiredError) || ''));
   show(form.dataset.invalid || '', 'error'); invalid[0].focus(); return;
  }
  if (form.querySelector<HTMLInputElement>('[name="_gotcha"]')?.value) { show(form.dataset.error || '', 'error'); return; }
  sending = true; button.disabled = true; form.setAttribute('aria-busy','true');
  button.textContent = form.dataset.sending || ''; show(form.dataset.progress || '', 'pending');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
   const response = await fetch(form.action, { method:'POST', body:new FormData(form), headers:{ Accept:'application/json' }, signal:controller.signal });
   const result = await response.json();
   if (!response.ok || result.ok !== true) {
    if (Array.isArray(result.errors)) for (const error of result.errors) {
     const field = fields.find(field => field.name === error.field);
     if (field) setError(field, (field.type === 'email' ? form.dataset.emailError : form.dataset.invalid) || '');
    }
    throw new Error('Submission was not confirmed');
   }
   form.reset(); show(form.dataset.success || '', 'success'); status.focus();
  } catch {
   show(form.dataset.error || '', 'error'); status.focus();
  } finally {
   clearTimeout(timeout); sending = false; button.disabled = false;
   button.textContent = form.dataset.submitLabel || ''; form.removeAttribute('aria-busy');
  }
 });
}
