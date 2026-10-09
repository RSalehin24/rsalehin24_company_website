export type ContactField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function validationMessage(field: ContactField, labels: DOMStringMap): string | null {
  if (field.required && !field.value.trim()) return labels.requiredError || '';
  if (field.validity.typeMismatch) return labels.emailError || '';
  if ('maxLength' in field && field.maxLength > 0 && field.value.length > field.maxLength) {
    return labels.longError || '';
  }
  return field.validity.valid ? null : labels.invalid || '';
}

export function showFieldError(field: ContactField, message: string) {
  field.setAttribute('aria-invalid', 'true');
  const feedback = field.closest('.form-field')?.querySelector<HTMLElement>('.field-error');
  if (feedback) feedback.textContent = message;
}

export function clearFieldError(field: ContactField) {
  field.removeAttribute('aria-invalid');
  const feedback = field.closest('.form-field')?.querySelector<HTMLElement>('.field-error');
  if (feedback) feedback.textContent = '';
}
