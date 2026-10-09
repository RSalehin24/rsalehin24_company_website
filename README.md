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
- `src/components/SitePage.astro` selects a page component from `src/components/pages/`; `PageIntro.astro`, `ProcessSection.astro` and `Wordmark.astro` share repeated sections. The wordmark displays `RSalehin24™` with a small raised trademark symbol; company metadata keeps the supplied `RSalehin24` name.
- `src/components/ContactForm.astro` renders a configured form or `DirectContact.astro`. `ContactMethods.astro` provides Gmail and email app links, a call action and selectable/copyable email address.
- `src/scripts/contact.ts` manages submission state; `contact-challenge.ts` handles Turnstile and `src/lib/contact-validation.ts` handles validation. Shared file rules live in `src/lib/contact-rules.mjs`.
- `worker/index.mjs` exports the contact handler and persistent daily inquiry counter. `worker/contact.mjs` validates submissions and sends email with actual attachments through Brevo. `worker/wrangler.jsonc` configures its separate Cloudflare deployment and counter storage.
- `src/styles/global.css` contains the dark forest design and responsive rules.
- `src/assets/forest-lake.jpg` is the licensed source photo; Astro creates local responsive WebP and JPEG output.
- Company details were taken from the supplied `info.md` reference and are centralized in `src/data/site.ts`.

Update both `content.en` and `content.bn` together. Keep matching service/product IDs and page keys. Use factual descriptions; do not add unsupported clients, awards, pricing, team sizes or delivery promises. Update contact details in `company`, including both address translations.

EPUB Reader is linked only to `company.readerUrl`, verified against its domain file. eLibrary is marked deployment in progress with no live button. Personal Financial Management is at inception, with capabilities explicitly planned. To release a product, verify its public URL and capabilities, then update both languages and `ProductCard.astro` deliberately; adding an unverified URL is not a status change.

## Contact delivery

The form takes a reply email, subject, message and optional attachments, alongside the existing project fields. Cloudflare + Brevo sends from verified `website@rsalehin24.me` to `mail@rsalehin24.me`, with real attachments and the visitor's email as Reply-To. Subjects include a reference such as `[RS24-10Aug2026-0003] : Entered subject`, identifying the Dhaka date and daily request order. A persistent atomic counter prevents duplicates across simultaneous submissions and deployments; the reference also appears in the body and localized form confirmation. Incoming mail to the new address forwards to the existing inbox. The Worker, private secrets, Turnstile widget and public GitHub variables are configured. See [email setup](docs/CONTACT.md) for counter behavior, inbox organization, future Worker updates and inbox verification. No new website DNS records are required.

Copy `.env.example` to `.env` for local public configuration. Never embed an email API key or a Turnstile secret in the static site. The existing `PUBLIC_FORMSPREE_ENDPOINT` is an alternative; uploads require a paid Formspree plan and are delivered as file links. Worker configuration takes precedence when present. Missing configuration shows separate Gmail, email app, phone and copy-email actions. The address remains selectable without JavaScript; clipboard failures select it for manual copying.

Enhanced submission adds localized validation, progress, duplicate prevention, a 40-second timeout, provider error handling and retained text/files after errors. The form accepts multiple documents, Excel spreadsheets, text/Markdown files or supported images, with a combined 20 MiB selection limit and no fixed file-count limit; [CONTACT.md](docs/CONTACT.md) lists all extensions and the pending large-file delivery decision. The Worker rejects selections that exceed the email provider's limit after encoding, with localized feedback and all files retained. Filenames with restricted characters are replaced by type, such as `pic_01.png`, `pic_02.jpg`, `pdf_01.pdf` or `text_01.txt`, avoiding the authentication failure reproduced with a macOS screenshot name. Names are unique within each inquiry; safe names are retained unless duplicated. Contents and file extensions are retained; supported formats remain direct attachments. Only Brevo-unsupported formats arrive inside a ZIP, using the same safe filename inside the archive. The upload hint explains this behavior. Turnstile loads once when a visitor focuses the form or scrolls near the check, keeping its traffic out of the initial page load. The Worker independently validates limits and spam verification before sending. Success confirms provider acceptance, not inbox receipt. The Cloudflare form requires JavaScript for Turnstile and provides direct-contact alternatives; the Formspree form supports native submission without JavaScript.

## Browser verification

`npm run audit` uses installed Chrome by default. It builds isolated, ignored fixtures for unconfigured delivery and both providers, independently of your local public configuration. It intercepts all sends and the spam widget, and never sends an actual inquiry. It checks all routes at 360, 768 and 1440px, automated WCAG scans, keyboard/menu behavior, reduced motion, zoom, no-JavaScript readability, multipart file delivery, validation, retained files/text after errors, both-language contact states, clipboard behavior and the wordmark. Worker tests use mocked Brevo and Turnstile APIs and verify the binary attachment and fixed recipient.

```sh
npm run audit
npm run audit:a11y
npm run audit:lighthouse
```

Run Lighthouse while the preview above is active. It audits mobile performance, accessibility and SEO. Reports and screenshots are stored in ignored `.audit/`. Override `AUDIT_URL` if using another preview origin or `CHROME_PATH` for a custom Chrome install. `BROWSER_CHANNEL=chromium npm run audit` works after `npx playwright install chromium`.

Automated checks complement visual inspection. Confirm the configured form's real email receipt after launch. See [verification report](docs/VERIFICATION.md), [asset credits](docs/ASSETS.md) and [deployment instructions](docs/LAUNCH.md).
