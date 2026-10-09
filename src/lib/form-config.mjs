export function formEndpoint(value = '') {
  const endpoint = value.trim();
  if (!endpoint) return null;
  if (!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)) {
    throw new Error('PUBLIC_FORMSPREE_ENDPOINT must be empty or a public https://formspree.io/f/FORM_ID URL.');
  }
  return endpoint;
}

export function contactDelivery({ workerEndpoint = '', turnstileSiteKey = '', formspreeEndpoint = '' } = {}) {
  if (!workerEndpoint.trim()) {
    const endpoint = formEndpoint(formspreeEndpoint);
    return endpoint ? { endpoint, provider: 'formspree', siteKey: '' } : null;
  }
  const endpoint = new URL(workerEndpoint.trim());
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || endpoint.pathname !== '/contact') {
    throw new Error('PUBLIC_CONTACT_ENDPOINT must be a public HTTPS Worker URL ending in /contact, with no credentials or query parameters.');
  }
  const siteKey = turnstileSiteKey.trim();
  if (!/^[a-zA-Z0-9_-]{10,100}$/.test(siteKey)) {
    throw new Error('PUBLIC_TURNSTILE_SITE_KEY is required with PUBLIC_CONTACT_ENDPOINT. Use the public site key, never the secret key.');
  }
  return { endpoint: endpoint.href, provider: 'brevo', siteKey };
}
