# RSalehin24 company website

Premium bilingual Astro static site for a Dhaka-based software business. English starts at `/`; Bangla starts at `/bn/`. The canonical domain is `https://www.rsalehin24.me`.

## Local development

Use Node.js 22.12 or newer and npm. The lockfile is included for reproducible installs.

```sh
npm ci
npm run dev
```

To check the production output:

```sh
npm run check
npm test
npm run build
npm run verify
npm run preview -- --host 127.0.0.1 --port 4321
```

Open `http://127.0.0.1:4321`. Primary content is rendered into HTML; JavaScript enhances the menu, email copying and configured contact form.

## Content and assets

- `src/data/site.ts` holds company details, both languages, page metadata, service descriptions, product stages and process content.
- `src/layouts/PageLayout.astro` handles shared navigation, footer, canonical/hreflang, Open Graph text and structured data.
- `src/components/SitePage.astro` selects a page component from `src/components/pages/`; `PageIntro.astro`, `ProcessSection.astro` and `Wordmark.astro` share repeated sections.
- `src/components/ContactForm.astro` renders a configured form or `DirectContact.astro`. `ContactMethods.astro` provides the email app link, call action and selectable/copyable email address.
- `src/scripts/contact.ts` manages submission state; `src/lib/contact-validation.ts` handles field validation and errors.
- `src/styles/global.css` contains the dark forest design and responsive rules.
- `src/assets/forest-lake.jpg` is the licensed source photo; Astro creates local responsive WebP and JPEG output.
- Company details were taken from the supplied `info.md` reference and are centralized in `src/data/site.ts`.

Update both `content.en` and `content.bn` together. Keep matching service/product IDs and page keys. Use factual descriptions; do not add unsupported clients, awards, pricing, team sizes or delivery promises. Update contact details in `company`, including both address translations.

EPUB Reader is linked only to `company.readerUrl`, verified against its domain file. eLibrary is marked deployment in progress with no live button. Personal Financial Management is at inception, with capabilities explicitly planned. To release a product, verify its public URL and capabilities, then update both languages and `ProductCard.astro` deliberately; adding an unverified URL is not a status change.

## Contact delivery

Leave `PUBLIC_FORMSPREE_ENDPOINT` empty until the owner creates a Formspree form and confirms delivery to `mail@rsalehin24.me`. The default production site provides email and phone actions together. Email links open the visitor’s configured email app; visitors using webmail can copy the address instead. When clipboard access fails, the address is selected for manual copying. Without JavaScript, the email address remains selectable and both contact links remain usable.

Copy `.env.example` to `.env` for local configuration. This is a public form URL, not an API key. Only `https://formspree.io/f/FORM_ID` is accepted; invalid values fail the build. Rebuild after changing the value. See [launch instructions](docs/LAUNCH.md) for GitHub configuration and actual email verification.

Native HTML validation works without JavaScript. Enhanced submission adds localized inline validation, progress, duplicate prevention, a 20-second timeout, provider error handling and retained input on failure. Success means Formspree returned `ok: true`; it is not proof of email receipt. Honeypot protection is included; configure provider spam filtering and allowed domains in Formspree.

## Browser verification

`npm run audit` uses installed Chrome by default. It builds a separate ignored fixture with a dummy Formspree URL and intercepts every request to that URL; it never sends an actual inquiry. It checks all routes at 360, 768 and 1440px, automated WCAG scans, keyboard/menu behavior, reduced motion, zoom, no-JavaScript readability, both-language contact states, clipboard success/failure/unavailability, and the shared wordmark.

```sh
npm run audit
npm run audit:a11y
npm run audit:lighthouse
```

Run Lighthouse while the preview above is active. It audits mobile performance, accessibility and SEO. Reports and screenshots are stored in ignored `.audit/`. Override `AUDIT_URL` if using another preview origin or `CHROME_PATH` for a custom Chrome install. `BROWSER_CHANNEL=chromium npm run audit` works after `npx playwright install chromium`.

Automated checks complement visual inspection. Confirm the configured form's real email receipt after launch. See [verification report](docs/VERIFICATION.md), [asset credits](docs/ASSETS.md) and [deployment instructions](docs/LAUNCH.md).
