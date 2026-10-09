const header = document.querySelector<HTMLElement>('[data-site-header]');
const button = header?.querySelector<HTMLButtonElement>('.menu-toggle');
if (header && button) {
 const label = button.querySelector<HTMLElement>('[data-menu-label]');
 const close = (focus = false) => {
  header.dataset.open = 'false';
  button.setAttribute('aria-expanded', 'false');
  if (label) label.textContent = button.dataset.openLabel || '';
  if (focus) button.focus();
 };
 header.dataset.enhanced = 'true';
 button.hidden = false;
 button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  header.dataset.open = String(open);
  button.setAttribute('aria-expanded', String(open));
  if (label) label.textContent = (open ? button.dataset.closeLabel : button.dataset.openLabel) || '';
 });
 header.addEventListener('keydown', event => {
  if (event.key === 'Escape' && header.dataset.open === 'true') close(true);
 });
 document.addEventListener('click', event => {
  if (event.target instanceof Node && !header.contains(event.target)) close();
 });
 const desktop = matchMedia('(min-width: 960px)');
 desktop.addEventListener('change', () => close());
}
