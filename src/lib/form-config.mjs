export function formEndpoint(value = '') {
  const endpoint = value.trim();
  if (!endpoint) return null;
  if (!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)) {
    throw new Error('PUBLIC_FORMSPREE_ENDPOINT must be empty or a public https://formspree.io/f/FORM_ID URL.');
  }
  return endpoint;
}
