import { clearFieldError, showFieldError, validationMessage, type ContactField } from '../lib/contact-validation';

const submissionTimeout = 20_000;
type FeedbackState = 'pending' | 'success' | 'error';

function requiredElement<T extends Element>(form: HTMLFormElement, selector: string): T {
  const element = form.querySelector<T>(selector);
  if (!element) throw new Error(`Contact form is missing ${selector}`);
  return element;
}

function preselectService(form: HTMLFormElement) {
  const service = form.querySelector<HTMLSelectElement>('[name="service"]');
  const interest = new URLSearchParams(location.search).get('service');
  if (service && interest && Array.from(service.options).some(option => option.value === interest)) {
    service.value = interest;
  }
}

async function postInquiry(form: HTMLFormElement) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), submissionTimeout);
  try {
    const response = await fetch(form.action, {
      method: 'POST', body: new FormData(form),
      headers: { Accept: 'application/json' }, signal: controller.signal,
    });
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object') throw new Error('Invalid submission response');
    const accepted = response.ok && 'ok' in result && result.ok === true;
    const errors: unknown[] = 'errors' in result && Array.isArray(result.errors) ? result.errors : [];
    return { accepted, errors };
  } finally {
    clearTimeout(timeout);
  }
}

class ContactFormController {
  private readonly button: HTMLButtonElement;
  private readonly feedback: HTMLElement;
  private readonly fields: ContactField[];
  private sending = false;

  constructor(private readonly form: HTMLFormElement) {
    this.button = requiredElement(form, 'button[type="submit"]');
    this.feedback = requiredElement(form, '[data-form-status]');
    this.fields = Array.from(form.querySelectorAll<ContactField>('.form-field input, .form-field select, .form-field textarea'));
    preselectService(form);
    form.noValidate = true;
    this.fields.forEach(field => field.addEventListener('input', () => clearFieldError(field)));
    form.addEventListener('submit', event => this.submit(event));
  }

  private showFeedback(message: string, state: FeedbackState) {
    this.feedback.textContent = message;
    this.feedback.dataset.state = state;
  }

  private validate() {
    this.fields.forEach(clearFieldError);
    const invalid = this.fields.filter(field => {
      const message = validationMessage(field, this.form.dataset);
      if (message === null) return false;
      showFieldError(field, message);
      return true;
    });
    if (!invalid.length) return true;
    this.showFeedback(this.form.dataset.invalid || '', 'error');
    invalid[0].focus();
    return false;
  }

  private beginSubmission() {
    this.sending = true;
    this.button.disabled = true;
    this.form.setAttribute('aria-busy', 'true');
    this.button.textContent = this.form.dataset.sending || '';
    this.showFeedback(this.form.dataset.progress || '', 'pending');
  }

  private finishSubmission() {
    this.sending = false;
    this.button.disabled = false;
    this.button.textContent = this.form.dataset.submitLabel || '';
    this.form.removeAttribute('aria-busy');
  }

  private showProviderErrors(errors: unknown[]) {
    for (const error of errors) {
      if (!error || typeof error !== 'object' || !('field' in error)) continue;
      const field = this.fields.find(field => field.name === error.field);
      if (!field) continue;
      const message = field.type === 'email' ? this.form.dataset.emailError : this.form.dataset.invalid;
      showFieldError(field, message || '');
    }
  }

  private async sendInquiry() {
    const result = await postInquiry(this.form);
    if (!result.accepted) {
      this.showProviderErrors(result.errors);
      throw new Error('Submission was not confirmed');
    }
    this.form.reset();
    this.showFeedback(this.form.dataset.success || '', 'success');
    this.feedback.focus();
  }

  private async submit(event: SubmitEvent) {
    event.preventDefault();
    if (this.sending || !this.validate()) return;
    if (this.form.querySelector<HTMLInputElement>('[name="_gotcha"]')?.value) {
      this.showFeedback(this.form.dataset.error || '', 'error');
      return;
    }
    this.beginSubmission();
    try {
      await this.sendInquiry();
    } catch {
      this.showFeedback(this.form.dataset.error || '', 'error');
      this.feedback.focus();
    } finally {
      this.finishSubmission();
    }
  }
}

document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach(form => new ContactFormController(form));
