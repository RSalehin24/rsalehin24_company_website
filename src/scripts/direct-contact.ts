async function copyEmail(address: HTMLInputElement, button: HTMLButtonElement, feedback: HTMLElement) {
  button.disabled = true;
  try {
    await navigator.clipboard.writeText(address.value);
    feedback.textContent = button.dataset.copied || '';
  } catch {
    address.focus();
    address.select();
    feedback.textContent = button.dataset.copyError || '';
  } finally {
    button.disabled = false;
  }
}

function initializeContactMethods(panel: HTMLElement) {
  const button = panel.querySelector<HTMLButtonElement>('[data-copy-email]');
  const address = panel.querySelector<HTMLInputElement>('[data-email-address]');
  const feedback = panel.querySelector<HTMLElement>('[data-copy-feedback]');
  if (!button || !address || !feedback) return;

  button.hidden = false;
  button.addEventListener('click', () => copyEmail(address, button, feedback));
}

document.querySelectorAll<HTMLElement>('[data-contact-methods]').forEach(initializeContactMethods);
