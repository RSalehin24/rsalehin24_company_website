# Enable the email form

The English and Bangla contact pages include name, reply email, optional company/phone, service interest, subject, message and optional attachments, with a 20 MiB combined selection limit (labelled 20 MB) and no fixed file-count limit. The recommended delivery path is GitHub Pages → Cloudflare Worker → Brevo → `mail@rsalehin24.me`. The website stays hosted on GitHub Pages.

## Pending large-file delivery decision

Multiple-file selection, combined-size validation and safe filename numbering are enabled. [Brevo limits the complete email to 20 MB](https://help.brevo.com/hc/en-us/articles/4402811730962-Add-an-attachment-to-a-transactional-email), including attachments and message content. Base64 encoding expands files by roughly one third, so a full 20 MiB selection cannot reliably fit in that message limit. Before encoding or contacting Brevo, the Worker estimates the encoded size with allowances for ZIP containers, MIME line breaks, headers and message bodies. Oversized deliveries return `emailSize` with a localized explanation and retain the draft and all selected files. Send fewer files at a time or use direct contact. Private, expiring download links remain an option requiring the owner's delivery choice; no upload storage or download-link service has been added.

| File category | Accepted extensions |
| --- | --- |
| Documents | `.pdf`, `.doc`, `.docs`, `.docx` |
| Excel spreadsheets | `.xls`, `.xlsx` |
| Text | `.txt`, `.md` |
| Images | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.avif`, `.heic`, `.heif`, `.tif`, `.tiff`, `.bmp`, `.ico`, `.dcx`, `.jp2`, `.jxl`, `.psd`, `.exr` |

Extensions are case-insensitive. Excel's extension is `.xlsx`; the misspelling `.xlxs` is rejected. The same shared rules validate file type, filename and size in the browser and Worker. The form accepts these files without rendering uploaded images or documents.

The Worker keeps filenames containing only ASCII letters, digits, spaces, dots, underscores and hyphens. Other characters, including Bengali letters, punctuation and the narrow no-break space used in macOS screenshot names, trigger a replacement name by type: `pic_01.png`, `pdf_01.pdf`, `doc_01.docx`, `excel_01.xlsx` or `text_01.txt`, retaining the actual extension. This prevents the authentication failure reproduced with a Unicode screenshot filename. Numbering starts at `01` for each category in each inquiry and grows to `02`, `03` and beyond. Original safe names are reserved first to prevent collisions; duplicate names also receive a unique replacement. No global file counter is kept. Filename path separators, control characters and excessive length remain invalid. Renaming changes neither the file contents nor the visitor's local files.

Brevo rejects some original extensions (a live `.md` test returned `Unsupported file format: md`). The Worker places DOCS, Markdown, SVG, DCX, WebP, AVIF, HEIC, HEIF, ICO, JP2, JXL, PSD and EXR files in a standard stored ZIP attachment named `delivery-name.ext.zip`. Its entry uses the same safe delivery filename; unzipping restores the exact binary contents. Other supported formats, including PNG, PDF, Word, Excel and TXT, remain direct attachments even when renamed. For example, `বাংলা.png` becomes `pic_01.png`, while `বাংলা.md` becomes `text_01.md` inside `text_01.md.zip`. A localized notice explains renaming and ZIP delivery before submission. Formspree continues to upload the original file and provide its download link.

Until a provider is configured, the public site shows direct contact options. A local preview or successful automated test cannot confirm inbox delivery.

## Current deployment

Configured on 2026-10-09:

- Worker: `rsalehin24-contact`, with endpoint `https://rsalehin24-contact.rsalehin24.workers.dev/contact`.
- Managed Turnstile widget: `RSalehin24 contact`, allowing `www.rsalehin24.me` and `rsalehin24.me`, with pre-clearance off.
- Brevo: transactional email enabled; `website@rsalehin24.me` is active registered sender ID `10`, displayed as `RSalehin24 website`. The Worker references that ID directly and delivers inquiries to `mail@rsalehin24.me`. The Brevo API key and Turnstile secret are private Worker secret bindings.
- Cloudflare Email Routing: incoming mail to `website@rsalehin24.me` forwards to the same verified inbox as `mail@rsalehin24.me`. Brevo handles sending; the existing inbox handles incoming messages.
- Inquiry numbering: the `INQUIRY_COUNTER` Durable Object binding stores daily sequence numbers, with dates interpreted in `Asia/Dhaka`. New inquiries use `[RS24-DDMonYYYY-NNNN] : Entered subject`.
- GitHub: both public contact variables are configured. The website is deployed by GitHub Pages.

After switching to a registered sender ID, a real English website submission titled `Website registered sender test` was delivered at 2026-10-09 16:10 UTC. Brevo reported delivery, Cloudflare recorded SPF/DKIM/DMARC pass, and the owner confirmed inbox receipt. The owner then requested a separate sending address, so `website@rsalehin24.me` was created and verified for the website.

A test titled `RSalehin24 - new website email address test` was sent from `website@rsalehin24.me` to `mail@rsalehin24.me` with a bilingual TXT attachment. Brevo reported delivery at 2026-10-09 16:16 UTC, and Cloudflare recorded SPF/DKIM/DMARC pass and successful forwarding. This test called the delivery module using the new registered sender.

Earlier website submissions bounced with failed DMARC and neutral DKIM even while direct provider tests succeeded. Reauthentication alone did not resolve them. Private Worker diagnostics verified the API key and exact attachment bytes through multipart parsing; their code and bindings were removed afterward, and version previews remain disabled. The domain's DMARC reject policy remains enabled. Repeat the human-completed checks below after future sender or provider changes; a separate real Bangla form submission has not yet been confirmed.

The Worker was uploaded through the Cloudflare API. GitHub Pages deployments update the website; redeploy the Worker separately after changes to `worker/` or `src/lib/contact-rules.mjs`, or connect Cloudflare Git builds as described below. Local credentials are kept in ignored `worker/.dev.vars.setup`; never commit or paste them into chat.

## 1. Prepare Brevo

In your existing Brevo account, confirm that transactional email sending is enabled and that `mail@rsalehin24.me` is a verified sender. The existing Brevo DNS records help authenticate your domain, but they do not create an API key or confirm that transactional sending is enabled. Create an API key in Brevo's SMTP & API settings. Keep it for the Worker secret below; do not put it in GitHub variables, website code or a chat message.

The Worker fixes the recipient to `mail@rsalehin24.me`, uses your verified sender in the From header, and sets Reply-To to the visitor's email. It sends a plain text and escaped HTML version of the message, project details and optional base64-encoded attachments. The visitor cannot choose another recipient.

[Brevo transactional email API](https://developers.brevo.com/reference/send-transac-email).

## 2. Create the spam check

In Cloudflare → Turnstile, create a **Managed** widget for `www.rsalehin24.me` and `rsalehin24.me`. Keep pre-clearance off. Copy the public **site key** and private **secret key**. The site uses the public key; the Worker verifies the secret, token hostname and `contact` action before sending any email. Tokens are single-use and are refreshed after each submission attempt.

[Turnstile widget setup](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/), [server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

The horizontal widget uses Cloudflare's flexible size: 65 px tall, filling the available width with a 300 px minimum. Narrow layouts center it within the form, with extra panel width below 360 px. It loads when a visitor focuses the form or scrolls within 300 px of the check, and its space is reserved to avoid a layout jump. Browsers without IntersectionObserver load it immediately. Its own interface uses English because [Turnstile does not currently support Bengali](https://developers.cloudflare.com/turnstile/reference/supported-languages/); the form labels, validation and feedback remain fully localized. See [widget sizes](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/#widget-sizes).

## 3. Deploy the Worker

The Worker deploys separately from the GitHub Pages website. For future manual deployments, authenticate Wrangler to the correct Cloudflare account, then run `npx wrangler deploy --config worker/wrangler.jsonc` from the repository root. Existing Worker secrets stay private; check that both secret bindings remain present after deployment.

To automate future Worker deployments, connect the existing Worker to this GitHub repository through Cloudflare → Workers & Pages → Git builds, using these settings:

| Setting | Value |
| --- | --- |
| Worker name | `rsalehin24-contact` |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | `npm test` |
| Deploy command | `npx wrangler deploy --config worker/wrangler.jsonc` |

The entry point is `worker/index.mjs`, exporting the contact handler and `InquiryCounter` Durable Object. No additional repository dependency is required. Keep the Worker name consistent with `worker/wrangler.jsonc`. Disable deployments from non-production branches unless you intend to configure previews separately.

The configuration creates the SQLite-backed `InquiryCounter` class with migration `inquiry-counter-v1` and binds it as `INQUIRY_COUNTER`. Keep this namespace, migration history and the `daily-inquiries` object name unchanged during redeployments so existing daily counts persist. Deploy with the complete configuration; uploading only the contact handler or omitting its Durable Object binding will disable submissions.

Open the Worker → Settings → Variables and Secrets. Add these as **Secret** values:

- `BREVO_API_KEY`: the API key created in Brevo.
- `TURNSTILE_SECRET_KEY`: the private Turnstile secret key.

The plain text variables in `worker/wrangler.jsonc` select `BREVO_SENDER_EMAIL=website@rsalehin24.me` and `BREVO_SENDER_ID=10`, verified against this Brevo account. With an ID configured, Brevo uses the registered sender's address and display name. An invalid ID fails before either provider is contacted. If you change Brevo accounts or senders, update both values to match a verified sender and deploy again. Remove the ID to use Brevo's email/name selection instead. The recipient remains fixed at `mail@rsalehin24.me`, and Reply-To remains the visitor's address.

Copy the deployed Worker URL and append `/contact`, for example `https://rsalehin24-contact.YOUR_SUBDOMAIN.workers.dev/contact`. Keep its `workers.dev` URL enabled. No DNS changes to www, the apex, mail, library or ereader are needed. Requests without the approved website origin or with missing credentials are rejected; opening the URL directly in a browser is not an email test.

[Cloudflare Git builds](https://developers.cloudflare.com/workers/ci-cd/builds/), [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

## 4. Enable the form on GitHub Pages

In the GitHub repository → Settings → Secrets and variables → Actions → **Variables**, add:

- `PUBLIC_CONTACT_ENDPOINT`: the deployed Worker URL ending in `/contact`.
- `PUBLIC_TURNSTILE_SITE_KEY`: the public Turnstile site key.

Leave `PUBLIC_FORMSPREE_ENDPOINT` empty for this setup. Never add the Brevo API key or Turnstile secret to a `PUBLIC_` variable. Rerun the **Build and deploy to GitHub Pages** workflow. Changing a variable alone does not rebuild the static site.

For local development, put the same public values in ignored `.env`, then rebuild. Turnstile must allow your local hostname if you want to test the real widget locally. The Worker accepts only the two production website origins; use the mocked audit for local testing without weakening the production origin checks.

## 5. Confirm delivery

From the deployed English contact page, submit a message with a small attachment and a reply email you control. Confirm all of the following in `mail@rsalehin24.me`:

- The message arrived, with a subject such as `[RS24-10Aug2026-0003] : Business website for ABC` and the full body.
- The reference in the subject and message matches the reference shown in the form confirmation.
- The attachment opens and contains the original file contents.
- Reply uses the visitor's email.
- Company, phone and service details are included.

Repeat from the Bangla page, including Bengali subject/body text. The success message means Brevo accepted the send request; it does not prove that the mailbox received it. Check Brevo's transactional logs and spam folder if receipt is delayed. Monitor account sending limits, Worker CPU limits and large-file behavior on your chosen service plans.

If an accepted message bounces with `DMARC checks failed`, compare Brevo's transactional event with Cloudflare Email Routing's authentication results. Check both DKIM records against the domain configuration in Brevo, and refresh [domain authentication](https://developers.brevo.com/docs/domain-authentication-and-verification) when appropriate. Confirm DKIM/DMARC pass on a subsequent test. A domain showing authenticated in the dashboard alone does not prove that an individual email passed authentication.

For an attachment-related bounce, also check that the deployed Worker includes the current attachment rules. Filenames with restricted characters must be replaced with a safe name before sending or archiving. Supported formats such as PNG must remain direct attachments after renaming. Do not weaken the domain's DMARC policy to accept these messages.

The frontend preserves text and all selected files on errors, prevents duplicate clicks, and resets only after confirmed acceptance. It has a 40-second timeout. The Worker validates every file and their combined size, with a separate 1 MiB allowance for multipart metadata in the bounded request. It checks a honeypot and verifies Turnstile, and does not store submissions in a database or log their contents. It stores only dated daily counters in a Durable Object. It does not retry an uncertain send automatically. With JavaScript disabled or a blocked verification service, visitors can use the visible direct email and phone links.

## Inquiry references and inbox organization

New Cloudflare/Brevo inquiries receive a reference such as `RS24-10Aug2026-0003`: the `RS24` prefix, the date in Dhaka, and the third verified submission reserved that day. English month abbreviations and Latin digits keep the identifier identical in both languages. The sequence starts at `0001` on each new Dhaka date, grows beyond four digits when necessary, and survives deployments. One persistent object allocates numbers atomically, including simultaneous submissions across both languages and website origins. Existing emails are not renumbered.

References are generated by the server after input validation and Turnstile verification, then included in the subject as `[reference] : Entered subject`, in both email bodies, and in successful form responses. Both email bodies show Client Name, Company, Email, Phone, Service and Inquiry reference first, followed by `---` and the client's message. Invalid and spam submissions do not consume numbers. A provider rejection or uncertain delivery can leave a reserved number unused; it is never reassigned. The reference identifies the verified request order, rather than a guaranteed delivered-email count. No client names, email addresses, messages or attachments are saved in the counter storage. Formspree retains its existing behavior without these references.

To separate website inquiries and subsequent replies in Gmail, [create a filter](https://support.google.com/mail/answer/6579) with **Subject** `RS24-`, then apply a **Website inquiries** label. Search for a complete reference to find a particular request, or `subject:RS24-10Aug2026` to find that day's inquiries. Keep the reference when an inquiry becomes a project. The visitor remains the Reply-To recipient; no automatic client copy or acknowledgement is enabled.

## Formspree alternative

The existing Formspree integration remains available. Create and verify a form delivering to `mail@rsalehin24.me`, with file uploads enabled. File uploads require a paid Personal, Professional or Business plan; notification emails contain download links rather than actual attached files. Enable provider storage, configure spam protection and restrict allowed domains. Configure `PUBLIC_FORMSPREE_ENDPOINT` using the public `https://formspree.io/f/FORM_ID` URL, leave both Worker variables empty, and rebuild. The privacy notice and file help adapt to this provider.

Test actual receipt, subject, reply address, message and file download links in both languages. Also test native submission with JavaScript disabled. Formspree enforces its own upload limits; the updated enhanced frontend applies the site's combined 20 MiB limit, while native submissions use the provider's limits. A free Formspree form cannot satisfy the attachment requirement.

[Formspree file uploads](https://help.formspree.io/articles/building-your-form/file-uploads/), [plans and file delivery](https://formspree.io/plans/).
