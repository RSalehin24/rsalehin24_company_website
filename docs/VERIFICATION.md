# Implementation verification

Verified on 2026-10-09 against the Astro production output. The GitHub Actions workflow builds and deploys pushes to main after GitHub Pages is enabled. Local preview: http://127.0.0.1:4321.

## Build and technical checks

- Astro production build: 12 localized content routes, English/Bangla 404 pages and sitemap generated.
- Astro check: zero errors, warnings or hints.
- Node tests: 13 passed, covering provider configuration, fixed-recipient email delivery, exact binary attachment encoding, validation, upload/request limits, spam verification, origin/method checks and provider failures/timeouts.
- Static verification passed for default, Formspree and Cloudflare/Brevo output: unique localized titles and descriptions, self-canonicals, reciprocal en/bn and x-default links, Open Graph metadata, business/service structured data, sitemap, robots, CNAME, links, responsive images and 404 noindex.
- Public HTML contains no repository links, localhost references or developer setup instructions. Company contact details match the supplied reference.

## Browser checks

- All 12 content routes load at 360, 768 and 1440px with no horizontal overflow or broken images.
- Final automated axe scans passed across 36 route/viewport combinations, including WCAG 2 A/AA, 2.1 AA, 2.2 AA and best-practice rules.
- Mobile menu open/close, Escape and focus restoration, keyboard skip link and visible focus passed.
- Reduced-motion behavior and corresponding-page language switches passed.
- All 12 routes passed 200% page zoom and a separate 200% text enlargement check.
- All 12 routes remain readable with JavaScript disabled; mobile navigation remains available.
- English and Bangla recovery pages verified.
- Desktop/mobile screenshots were visually inspected. Final screenshots and machine-readable results are in ignored .audit/.
- No browser JavaScript errors occurred.

## Contact behavior

Tested both languages using separate production fixtures for Cloudflare/Brevo and Formspree. Browser requests and the Turnstile widget are intercepted; Worker tests mock both provider APIs. No real inquiry was sent.

- Missing endpoint: direct email/phone options, with no form or unavailable submit button.
- Required fields, whitespace-only name, invalid email, missing subject and localized inline errors.
- Multipart submission includes the subject, message, filename and exact binary attachment bytes.
- Unsupported, empty and oversized files are blocked before submission. Server tests independently enforce file type, one-file and size rules.
- Service preselection from inquiry links.
- Network failure, provider validation errors, rate limits, malformed JSON and unconfirmed responses: subject/message and selected file retained, retry enabled.
- A simulated 40-second timeout preserves the draft and file, reports an error and re-enables submission.
- Progress state and duplicate-submit prevention while a request is pending.
- Confirmed success: localized feedback and reset form.
- Honeypot: filled spam field blocks outgoing requests.
- Configured HTML form retains native validation and a Formspree action without JavaScript.
- Cloudflare delivery verifies tokens before sending and refreshes them after attempts. Expired tokens, missing/failed verification and a blocked verification script are covered. Its no-JavaScript state disables sending and displays direct alternatives.
- Both providers and languages passed mobile/tablet/desktop axe checks and layout checks, including 200% zoom. Compact Turnstile dimensions are represented by the browser mock. The actual provider widget still requires a live setup check; it uses English because Bengali is unsupported by Turnstile.
- Direct panel contains separate Gmail and email app links with an encoded inquiry subject, plus a call link to +8801608537383. Gmail popup navigation and prefilled recipient/subject are tested using intercepted browser requests; no real Gmail draft or message is created.
- English/Bangla copy-email success, denied clipboard permission and missing Clipboard API tested. Failure selects the address for manual copying and re-enables the action.
- The email address remains selectable and Gmail, email app and phone links remain visible without JavaScript. Opening a visitor’s external email app depends on that visitor’s configured mail handler; the copy option supports webmail.

The Cloudflare Worker, Turnstile widget and Brevo secrets are not configured in the owner's account. Deploying them and confirming inbox/attachment receipt remain required to enable live sending. Missing public configuration continues to show direct options. See [CONTACT.md](CONTACT.md). Mocked tests cannot establish actual mail receipt.

## Refactoring and brand checks

Reviewed the project against `AGENTS.md`. Page selection is now separate from page content; six page components use a shared introduction where applicable, and Home/Services reuse the process section. Header/footer use one wordmark component. Form submission state is encapsulated in a controller, with field validation and email copying in separate modules. No dependencies were added.

Header and footer wordmarks render `RSalehin24` without a dot, with lining numerals at the same font size as the main wordmark. This is checked across the mobile, tablet and desktop viewports. Production build, static checks, configured and unconfigured contact states, all-route browser checks and accessibility scans were rerun after refactoring.

## Live domain checks

GitHub Pages is configured to publish through GitHub Actions, with `www.rsalehin24.me` as the custom domain and HTTPS enforcement enabled. GitHub approved a certificate covering both `www.rsalehin24.me` and `rsalehin24.me`. HTTPS requests to the root return 301 to www, preserving localized paths; the final page returns 200. Verified with normal TLS validation and public DNS over HTTPS, along with DNS queries to Cloudflare, Google and the network resolver. A previously cached empty DNS result can still affect a local browser independently of the working public configuration.

## Mobile Lighthouse

Earlier production-preview lab results using Lighthouse 13.5.0 and installed Chrome. All 12 content pages met the requested targets of performance >=90, accessibility >=95 and SEO >=95. These scores predate the attachment form; its configured states passed browser/axe checks, and Lighthouse should be rechecked after the live delivery service is enabled.

| Route | Performance | Accessibility | SEO |
| --- | ---: | ---: | ---: |
| / | 97 | 100 | 100 |
| /bn/ | 96 | 100 | 100 |
| /services/ | 99 | 100 | 100 |
| /products/ | 99 | 100 | 100 |
| /about/ | 98 | 100 | 100 |
| /contact/ | 99 | 100 | 100 |
| /privacy/ | 99 | 100 | 100 |
| /bn/services/ | 99 | 100 | 100 |
| /bn/products/ | 99 | 100 | 100 |
| /bn/about/ | 96 | 100 | 100 |
| /bn/contact/ | 98 | 100 | 100 |
| /bn/privacy/ | 98 | 100 | 100 |

Fonts and images are self-hosted. Responsive hero images were compressed and cropped at build time, and the primary English/Bengali font is preloaded. Full Lighthouse JSON/HTML reports are stored in .audit/. Deployed scores can vary with network and hosting conditions.

## Remaining launch work

Follow [CONTACT.md](CONTACT.md) to configure and verify Cloudflare/Brevo sending, and [LAUNCH.md](LAUNCH.md) to submit the sitemap to Search Console. Pages publishing, the custom domain, DNS and HTTPS have been configured; recheck them after future hosting or DNS changes.

EPUB Reader returned external HTTP 200 on 2026-10-09. Recheck reachability immediately before launch. eLibrary has no live button; Personal Financial Management is explicitly planned and at inception.
