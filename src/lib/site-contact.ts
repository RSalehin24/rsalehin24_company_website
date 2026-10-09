import { contactDelivery } from './form-config.mjs';

export const delivery = contactDelivery({
  workerEndpoint: import.meta.env.PUBLIC_CONTACT_ENDPOINT,
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY,
  formspreeEndpoint: import.meta.env.PUBLIC_FORMSPREE_ENDPOINT,
});
