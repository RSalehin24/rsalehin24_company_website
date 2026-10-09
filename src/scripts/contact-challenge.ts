type TurnstileOptions = {
  sitekey: string; action: string; language: string; theme: string; size: string;
  'error-callback': () => void; 'expired-callback': () => void;
};
type TurnstileAPI = {
  render(element: HTMLElement, options: TurnstileOptions): string;
  reset(widget: string): void;
};
declare global { interface Window { turnstile?: TurnstileAPI; } }

function loadTurnstile(): Promise<TurnstileAPI> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.addEventListener('load', () => {
      if (!window.turnstile) return reject(new Error('Verification did not load'));
      // ready() rejects async scripts; the load event already guarantees API availability.
      resolve(window.turnstile);
    }, { once: true });
    script.addEventListener('error', () => reject(new Error('Verification is unavailable')), { once: true });
    document.head.append(script);
  });
}

export class ContactChallenge {
  private widget: string | undefined;
  private api: TurnstileAPI | undefined;
  private rendering: Promise<void> | undefined;

  constructor(private readonly form: HTMLFormElement, private readonly showError: () => void) {}

  initialize() {
    const container = this.form.querySelector<HTMLElement>('[data-turnstile]');
    if (!container) return;
    if (!('IntersectionObserver' in window)) { void this.render(container); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) start();
    }, { rootMargin: '300px' });
    const start = () => {
      observer.disconnect();
      this.form.removeEventListener('focusin', start);
      this.rendering ??= this.render(container);
    };
    // Keep verification traffic out of the initial page load, ready before submission.
    this.form.addEventListener('focusin', start, { once: true });
    observer.observe(container);
  }

  private async render(container: HTMLElement) {
    try {
      this.api = await loadTurnstile();
      this.widget = this.api.render(container, {
        sitekey: container.dataset.sitekey || '', action: 'contact',
        // Turnstile does not currently support Bangla.
        language: 'en', theme: 'dark', size: 'compact',
        'error-callback': this.showError, 'expired-callback': () => this.reset(),
      });
    } catch { this.showError(); }
  }

  hasToken() {
    if (this.form.dataset.provider !== 'brevo') return true;
    return Boolean(this.form.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value);
  }

  reset() {
    if (this.api && this.widget !== undefined) this.api.reset(this.widget);
  }
}
