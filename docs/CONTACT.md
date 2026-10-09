# Enable the email form

The English and Bangla contact pages include name, reply email, optional company/phone, service interest, subject, message and one optional attachment. Allowed files are PDF, DOC, DOCX, TXT, PNG and JPEG, up to 5 MiB (labelled 5 MB). The recommended delivery path is GitHub Pages → Cloudflare Worker → Brevo → `mail@rsalehin24.me`. Files arrive as actual email attachments. The website stays hosted on GitHub Pages.

Until a provider is configured, the public site shows direct contact options. A local preview or successful automated test cannot confirm inbox delivery.

## Current deployment

Configured on 2026-10-09:

- Worker: `rsalehin24-contact`, with endpoint `https://rsalehin24-contact.rsalehin24.workers.dev/contact`.
- Managed Turnstile widget: `RSalehin24 contact`, allowing `www.rsalehin24.me` and `rsalehin24.me`, with pre-clearance off.
- Brevo: transactional email enabled; `mail@rsalehin24.me` is an active sender. The Brevo API key and Turnstile secret are private Worker secret bindings.
- GitHub: both public contact variables are configured. The website is deployed by GitHub Pages.

A provider verification email with English/Bangla text and a real TXT attachment was accepted by Brevo, and its delivery log reports `delivered`. The owner confirmed mailbox receipt and correct attachment contents. Complete the real form checks below; this provider test alone does not verify the complete browser submission path.

The automated live form tests stopped at the English human check: Turnstile rejected the automated browser and did not issue a token. The owner's later website submission reached Brevo but Cloudflare Email Routing rejected it for failed DMARC, with DKIM recorded as neutral. DNS records matched Brevo's authenticated domain. After refreshing domain authentication through Brevo's API, both new English/Bangla attachment tests passed SPF, DKIM and DMARC and showed delivered in Cloudflare's log. These two tests exercised the delivery module directly; confirm mailbox receipt and retry the website form using the steps below.

The Worker was uploaded through the Cloudflare API. GitHub Pages deployments update the website; redeploy the Worker separately after changes to `worker/` or `src/lib/contact-rules.mjs`, or connect Cloudflare Git builds as described below. Local credentials are kept in ignored `worker/.dev.vars.setup`; never commit or paste them into chat.

## 1. Prepare Brevo

In your existing Brevo account, confirm that transactional email sending is enabled and that `mail@rsalehin24.me` is a verified sender. The existing Brevo DNS records help authenticate your domain, but they do not create an API key or confirm that transactional sending is enabled. Create an API key in Brevo's SMTP & API settings. Keep it for the Worker secret below; do not put it in GitHub variables, website code or a chat message.

The Worker fixes the recipient to `mail@rsalehin24.me`, uses your verified sender in the From header, and sets Reply-To to the visitor's email. It sends a plain text and escaped HTML version of the message, project details and the optional base64-encoded attachment. The visitor cannot choose another recipient.

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

The entry point is `worker/contact.mjs`. No additional repository dependency is required. Keep the Worker name consistent with `worker/wrangler.jsonc`. Disable deployments from non-production branches unless you intend to configure previews separately.

Open the Worker → Settings → Variables and Secrets. Add these as **Secret** values:

- `BREVO_API_KEY`: the API key created in Brevo.
- `TURNSTILE_SECRET_KEY`: the private Turnstile secret key.

The plain text variable `BREVO_SENDER_EMAIL` defaults to `mail@rsalehin24.me` in `worker/wrangler.jsonc`. If Brevo verifies a different sender, change this value in that file and deploy again. The recipient remains fixed.

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

- The message arrived, with the entered subject and full body.
- The attachment opens and contains the original file contents.
- Reply uses the visitor's email.
- Company, phone and service details are included.

Repeat from the Bangla page, including Bengali subject/body text. The success message means Brevo accepted the send request; it does not prove that the mailbox received it. Check Brevo's transactional logs and spam folder if receipt is delayed. Monitor account sending limits, Worker CPU limits and large-file behavior on your chosen service plans.

If an accepted message bounces with `DMARC checks failed`, compare Brevo's transactional event with Cloudflare Email Routing's authentication results. Check both DKIM records against the domain configuration in Brevo, and refresh [domain authentication](https://developers.brevo.com/docs/domain-authentication-and-verification) when appropriate. Confirm DKIM/DMARC pass on a subsequent test. A domain showing authenticated in the dashboard alone does not prove that an individual email passed authentication.

The frontend preserves text and the selected file on errors, prevents duplicate clicks, and resets only after confirmed acceptance. It has a 40-second timeout. The Worker limits total request size, validates fields/files, checks a honeypot, verifies Turnstile, and does not store submissions in a database or log their contents. It does not retry an uncertain send automatically. With JavaScript disabled or a blocked verification service, visitors can use the visible direct email and phone links.

## Formspree alternative

The existing Formspree integration remains available. Create and verify a form delivering to `mail@rsalehin24.me`, with file uploads enabled. File uploads require a paid Personal, Professional or Business plan; notification emails contain download links rather than actual attached files. Enable provider storage, configure spam protection and restrict allowed domains. Configure `PUBLIC_FORMSPREE_ENDPOINT` using the public `https://formspree.io/f/FORM_ID` URL, leave both Worker variables empty, and rebuild. The privacy notice and file help adapt to this provider.

Test actual receipt, subject, reply address, message and file download links in both languages. Also test native submission with JavaScript disabled. Formspree enforces its own upload limits; the enhanced frontend applies the site's 5 MiB limit, while native submissions use the provider's limits. A free Formspree form cannot satisfy the attachment requirement.

[Formspree file uploads](https://help.formspree.io/articles/building-your-form/file-uploads/), [plans and file delivery](https://formspree.io/plans/).
