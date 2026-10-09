# Implementation verification

Verified on 2026-10-09 against the Astro production output. The GitHub Actions workflow builds and deploys pushes to main after GitHub Pages is enabled. Local preview: http://127.0.0.1:4321.

## Build and technical checks

- Astro production build: 12 localized content routes, English/Bangla 404 pages and sitemap generated.
- Astro check: zero errors, warnings or hints.
- Node tests: 39 passed, covering provider configuration, registered sender selection and invalid IDs, separate sender/recipient addresses, fixed-recipient email delivery, multiple attachments, combined 20 MiB boundaries, encoded-email overflow rejection, safe numbering and collision avoidance across all 26 extensions, exact binary attachment encoding, independent ZIP-format fixtures, macOS screenshot names with Unicode spaces, validation, upload/request limits, spam verification, origin/method checks, provider failures/timeouts and inquiry references.
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
- Multipart submission includes the subject, message, all selected filenames and exact binary attachment bytes. Both provider fixtures and languages accept two files totalling exactly 20 MiB and 100 small files, reject selections one byte over the combined limit, and validate later files independently. Worker tests cover the same combined boundary before spam verification and sending 100 files through mocked providers.
- Requested document/Excel/Markdown extensions and common image formats are accepted case-insensitively. Both localized browser forms accept XLSX, MD, DOCS, DCX, SVG, WebP, HEIC and AVIF; the server independently accepts all documented formats. The misspelled Excel extension `.xlxs` is rejected.
- Filenames with restricted characters are replaced by category, preserving the extension and exact bytes. All 26 accepted extensions are covered, including case-insensitive classification, ASCII punctuation, Unicode letters and hidden spaces. A 1,139,016-byte macOS PNG is delivered directly as `pic_01.png`; multipart regressions also cover PDF, Word, Excel, TXT and Markdown. Safe names remain unchanged, including ordinary spaces. Brevo-unsupported formats alone use a ZIP containing the safe delivery name and unchanged contents. The ZIP encoder matches an independent Python `zipfile` fixture. The localized upload hint explains renaming and ZIP delivery only for Brevo.
- Unsupported, empty and oversized files are blocked before submission. Server tests independently enforce file type, one-file and size rules.
- Service preselection from inquiry links.
- Network failure, provider validation errors, rate limits, malformed JSON and unconfirmed responses: subject/message and every selected file retained, retry enabled.
- A simulated 40-second timeout preserves the draft and both selected files, reports an error and re-enables submission.
- Progress state and duplicate-submit prevention while a request is pending.
- Confirmed success: localized feedback and reset form; Cloudflare/Brevo feedback includes the server-generated inquiry reference in both languages, while Formspree feedback remains unchanged.
- Inquiry references follow `RS24-10Aug2026-0003` and email subjects follow `[reference] : Entered subject`. Tests cover sequential and concurrent allocation, Dhaka midnight/year rollover, retained counts after storage reload, numbers beyond `9999`, invalid/exhausted storage, server control of references, missing/unavailable storage and provider errors. Invalid/spam requests reserve no number; a reserved number is never reused after a failed delivery.
- Honeypot: filled spam field blocks outgoing requests.
- Configured HTML form retains native validation and a Formspree action without JavaScript.
- Cloudflare delivery verifies tokens before sending and refreshes them after attempts. Expired tokens, missing/failed verification and a blocked verification script are covered. Its no-JavaScript state disables sending and displays direct alternatives.
- Both providers and languages passed mobile/tablet/desktop axe checks and layout checks, including 200% zoom. The horizontal Turnstile mock represents flexible width with a 300 px minimum and 65 px height; checks include 320 px phones and confirm the widget fits within the viewport. It uses English because Bengali is unsupported by Turnstile.
- Direct panel contains separate Gmail and email app links with an encoded inquiry subject, plus a call link to +8801608537383. Gmail popup navigation and prefilled recipient/subject are tested using intercepted browser requests; no real Gmail draft or message is created.
- English/Bangla copy-email success, denied clipboard permission and missing Clipboard API tested. Failure selects the address for manual copying and re-enables the action.
- The email address remains selectable and Gmail, email app and phone links remain visible without JavaScript. Opening a visitor’s external email app depends on that visitor’s configured mail handler; the copy option supports webmail.

The Cloudflare Worker, Managed Turnstile widget, private Brevo/Turnstile secret bindings and public GitHub variables are configured. Both localized forms are enabled on GitHub Pages. Missing public configuration continues to show direct options. See [CONTACT.md](CONTACT.md).

The multiple-attachment version validates a combined 20 MiB selection and independently checks estimated email size before encoding and provider submission. A selection that exceeds Brevo's total-message limit is rejected with localized feedback while retaining all files and text; browser tests cover this response in both languages. Worker regression checks allow a 13 MiB direct PNG and reject a 15 MiB PNG before contacting Brevo. These are mocked delivery checks, not maximum-size inbox tests. Full 20 MiB delivery remains subject to the choice in [CONTACT.md](CONTACT.md#pending-large-file-delivery-decision); no download-link storage has been configured.

## Live email deployment

A private, authenticated multipart test of the updated delivery module sent two PNGs and one bilingual TXT file, totalling 2,278,106 bytes, as direct attachments `pic_01.png`, `pic_02.png` and `text_01.txt`. The original filenames included a hidden macOS space and Bengali letters. Outgoing base64 hashes matched the original bytes. Brevo reported delivery at 2026-10-09 17:21:57 UTC, and Cloudflare recorded successful forwarding with SPF/DKIM/DMARC pass. The temporary Worker was removed. This confirms the renamed small-file delivery path, not full 20 MiB delivery or a human-completed Turnstile submission.

Inquiry `RS24-09Oct2026-0003` was accepted by Brevo but bounced with `DMARC checks failed`; Cloudflare recorded neutral DKIM and failed DMARC. The owner reported a 1.1 MB PNG, but the original file was unavailable for inspection. Controlled multipart tests used the same 1,139,016-byte PNG: ASCII filenames, including `latest screentshot.png`, delivered with SPF/DKIM/DMARC pass; a macOS screenshot filename containing U+202F reproduced the bounce. An initial workaround preserved that filename inside `attachment.zip`. Its live test, titled `TEST - PNG filename delivery fix`, delivered at 17:03 UTC with SPF/DKIM/DMARC pass. Python independently verified the ZIP's original filename, contents and CRC, and the temporary test Worker was removed. The production Worker was redeployed with the same counter namespace; www/apex preflights, Unicode PNG parsing and missing-token rejection passed. The owner then requested type-based renaming, replacing this ZIP workaround for provider-supported formats. A human website resubmission using the owner's original PNG remains unverified.

The deployed SQLite-backed inquiry counter allocated consecutive references `RS24-09Oct2026-0001` and `RS24-09Oct2026-0002` for two concurrent English/Bangla delivery checks on 2026-10-09. Both used the production counter namespace and delivery module with bilingual TXT attachments. Brevo reported both delivered at 16:35 UTC, with subjects formatted `[reference] : Entered subject`. An authenticated temporary Worker performed these server checks and was removed afterward; they do not replace a human-completed website submission through Turnstile. A second production deployment preserved the same counter namespace. Live www/apex preflights and missing-token rejection also passed after the change. The local email regression test verifies client details first, then `---` and the full message, with visitor Reply-To preserved.

- A real English website submission titled `Website registered sender test` was delivered at 2026-10-09 16:10 UTC after sender selection was changed to verified Brevo sender ID `4`. Brevo reported delivery, Cloudflare recorded SPF/DKIM/DMARC pass, and the owner confirmed inbox receipt. Earlier website messages had bounced with neutral DKIM and failed DMARC even while direct tests passed. The domain's reject policy remains enabled.
- At the owner's request, `website@rsalehin24.me` was then created as active registered sender ID `10`, named `RSalehin24 website`. Cloudflare Email Routing forwards incoming mail to that address to the existing verified inbox. The Worker selects this dedicated sender; inquiries still go to `mail@rsalehin24.me`, with the visitor's address as Reply-To. Regression tests cover both sender-ID and email/name selection with distinct sender and recipient addresses.
- The new sender sent `RSalehin24 - new website email address test` to `mail@rsalehin24.me` with a bilingual TXT attachment. Brevo reported delivered at 2026-10-09 16:16 UTC; Cloudflare recorded successful forwarding with SPF/DKIM/DMARC pass. The deployed Worker's sender email and ID match the repository configuration. This checks the new sender through the delivery module; the owner's earlier complete website test used sender ID `4`.
- Direct provider tests delivered English/Bangla text and real TXT, PNG and Markdown-in-ZIP attachments. The owner confirmed the original TXT test's receipt and contents. Private Worker diagnostics verified matching API credentials and exact binary bytes through multipart serialization, bounded parsing and email encoding, including filenames with spaces, parentheses and Bengali text. Temporary diagnostic code and bindings were removed, and version previews remain disabled.
- Live Worker checks passed for www/apex CORS preflights, blocked foreign origins, required-field validation and missing spam tokens. A 5 MiB upload was parsed and rejected for missing verification without sending email; this checks upload parsing, not maximum-size email delivery. Expanded file types passed production file validation before being rejected for deliberately missing spam tokens. Python independently opened the generated ZIP and verified its Bengali filename, contents and CRC.
- Browser audits use independent unconfigured/Formspree/Worker fixtures and intercept all submissions. Both production contact pages load the real verification frame after interaction, pass mobile WCAG scans without overflow, and produce no page JavaScript errors. The script loader renders after its load event, shares one script between focus/scroll triggers, reserves widget space, and covers token reset and blocked-script failures.
- Automated full-form sends stopped at the human check and produced no form POST. The owner's successful English submission verifies that path; a separate human-completed Bangla submission and maximum-size inbox delivery remain unverified.

A `401` from Cloudflare's `/pat/` endpoint can be expected when a browser cannot provide a Private Access Token; see [Cloudflare's explanation](https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/#error-code-401). A form success followed by a mail bounce requires checking Brevo and Cloudflare Email Routing delivery events, independently of widget console messages. Provider acceptance alone does not confirm inbox receipt.

## Refactoring and brand checks

Reviewed the project against `AGENTS.md`. Page selection is now separate from page content; six page components use a shared introduction where applicable, and Home/Services reuse the process section. Header/footer use one wordmark component. Form submission state is encapsulated in a controller, with field validation and email copying in separate modules. No dependencies were added.

Header and footer wordmarks render `RSalehin24™` without a dot, with the original lowercase n, lining numerals at the same font size as the main wordmark and a smaller superscript trademark symbol. The accessible name and company metadata remain `RSalehin24`. The English service-interest option reads `Something else / Not sure yet`; its capital N applies to the dropdown. These are checked across the mobile, tablet and desktop viewports. Production build, static checks, configured and unconfigured contact states, all-route browser checks and accessibility scans were rerun after refactoring.

## Live domain checks

GitHub Pages is configured to publish through GitHub Actions, with `www.rsalehin24.me` as the custom domain and HTTPS enforcement enabled. GitHub approved a certificate covering both `www.rsalehin24.me` and `rsalehin24.me`. HTTPS requests to the root return 301 to www, preserving localized paths; the final page returns 200. Verified with normal TLS validation and public DNS over HTTPS, along with DNS queries to Cloudflare, Google and the network resolver. A previously cached empty DNS result can still affect a local browser independently of the working public configuration.

## Mobile Lighthouse

Earlier production-preview lab results using Lighthouse 13.5.0 and installed Chrome. All 12 content pages met the requested targets of performance >=90, accessibility >=95 and SEO >=95. The following table predates the attachment form.

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

The live attachment form initially scored 98/100/100 in English and 74–75/100/100 in Bangla. The Bangla report showed verification traffic during the initial paint. After deferring Turnstile until form interaction or proximity, the configured production preview scored 98/100/100 in English and 99/100/100 in Bangla. After GitHub Pages deployed commit `d8d466a`, the production URLs scored 96/100/100 at `/contact/` and 100/100/100 at `/bn/contact/`. Scores are performance/accessibility/SEO, using the same mobile Lighthouse configuration.

After deployment of the expanded attachment formats in commit `ef3636c`, the live English form scored 99/100/100 and the Bangla form 100/100/100. Both served the complete 26-extension upload list and localized ZIP notice, loaded the real verification frame on interaction, and passed mobile WCAG scans without overflow or JavaScript errors.

Fonts and images are self-hosted. Responsive hero images were compressed and cropped at build time, and the primary English/Bengali font is preloaded. Full Lighthouse JSON/HTML reports are stored in .audit/. Deployed scores can vary with network and hosting conditions.

## Remaining launch work

Complete the localized form submission checks in [CONTACT.md](CONTACT.md), and follow [LAUNCH.md](LAUNCH.md) to submit the sitemap to Search Console. Cloudflare/Brevo delivery, Pages publishing, the custom domain, DNS and HTTPS are configured; recheck them after future hosting, provider or DNS changes.

EPUB Reader returned external HTTP 200 on 2026-10-09. Recheck reachability immediately before launch. eLibrary has no live button; Personal Financial Management is explicitly planned and at inception.
