# Launch RSalehin24 on GitHub Pages

## Email delivery: required to enable the form

Follow [CONTACT.md](CONTACT.md) to deploy the Cloudflare Worker, configure Brevo and Turnstile, and set the two public GitHub variables. This enables subject, message and attachment submission directly on the site, with delivery to `mail@rsalehin24.me`. The existing Formspree alternative requires a paid plan for uploads and delivers file links. Keep delivery unconfigured until it is ready; direct email and phone remain available.

Confirm inbox receipt in both languages, the entered subject/body, reply address and attachment contents. Automated tests mock the sending APIs and cannot verify actual receipt.

## Repository and Pages

The prepared workflow is `.github/workflows/deploy.yml`. It uses npm's lockfile, checks types and configuration, builds all pages, validates output, uploads `dist/`, and deploys to the `github-pages` environment. Pull requests run build checks without publishing.

1. Commit the site source and `package-lock.json`, then push to the repository's `main` branch.
2. Open repository Settings → Pages. Set Source to **GitHub Actions**.
3. In Pages → Custom domain, enter **www.rsalehin24.me**. The owner adds this domain as selected in the plan.
4. Run the deployment workflow or push a change to main. Review the build/deploy result in Actions.
5. Verify the Pages custom-domain check after configuring DNS, and enable **Enforce HTTPS** when the certificate is available.

`public/CNAME` is included with the selected domain, but a custom Actions deployment still requires setting the custom domain in repository Settings. GitHub documents that CNAME files are ignored for custom workflow domain configuration.

Astro is configured with the custom domain and root paths, so no repository `base` is used. Preview locally until the domain is attached; the default repository subpath is not the intended production URL.

[Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/), [GitHub custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## DNS

At your DNS provider, configure the following records. Preserve unrelated mail, verification and product-subdomain records.

| Name | Type | Value |
| --- | --- | --- |
| www | CNAME | rsalehin24.github.io |
| @ | A | 185.199.108.153 |
| @ | A | 185.199.109.153 |
| @ | A | 185.199.110.153 |
| @ | A | 185.199.111.153 |

The `www` CNAME points to the account's GitHub Pages domain without the repository name. With both apex and www records set, and www chosen in Pages, GitHub redirects the apex to www. Do not point www to the apex. Check the official guide above for current DNS values and optional IPv6 records. These values were checked on 2026-10-09.

Keep the Cloudflare web records **DNS only** while verifying GitHub Pages. Both domains need a valid certificate before an HTTPS redirect can succeed. If DNS has just changed, GitHub may provision a replacement certificate; keep the domain set to `www.rsalehin24.me` and enable Enforce HTTPS when issuance finishes. GitHub documents that HTTPS availability and DNS propagation can take up to 24 hours.

A Firefox “Server Not Found” message can persist while a network or browser caches an earlier empty DNS response. Compare the default resolver with public resolvers (`dig rsalehin24.me A`, `dig @1.1.1.1 rsalehin24.me A`, `dig @8.8.8.8 rsalehin24.me A`). If public DNS returns all four GitHub IPs while the default returns no answers, allow the cached response to expire or use Firefox DNS over HTTPS with a public provider. Do not replace the correct DNS records to work around a cached result. See [Firefox DNS over HTTPS settings](https://support.mozilla.org/en-US/kb/dns-over-https).

Verify `https://www.rsalehin24.me/` and `https://rsalehin24.me/`, the apex redirect, HTTPS certificate and every English/Bangla route. Check a nonexistent path returns a 404 status and a helpful page. GitHub Pages serves the global English 404; it links to a full Bangla 404 page.

## Search visibility

1. Verify the domain in Google Search Console using the supplied DNS TXT record.
2. Submit `https://www.rsalehin24.me/sitemap.xml`.
3. Inspect the Home, Services and Bangla Home URLs. Confirm their canonical URLs and crawl availability.
4. Check service structured data and hreflang relationships after deployment. Each of the twelve content pages has its own title, description and canonical, reciprocal en/bn links, and English x-default.
5. Run PageSpeed Insights against the deployed domain; local Lighthouse scores are lab results and can change with hosting/network conditions.

Technical readiness and useful Dhaka/Bangladesh content do not guarantee search rankings. [Google localized page guidance](https://developers.google.com/search/docs/specialty/international/localized-versions), [Search Console sitemap instructions](https://support.google.com/webmasters/answer/7451001).

## Final launch checks

- Recheck `https://ereader.rsalehin24.me` and the public product states.
- Confirm actual email and attachment receipt in both languages using [CONTACT.md](CONTACT.md).
- Confirm public pages contain no repository links or development instructions.
- Confirm all text and images load, the menu and language switch work, and mobile/desktop layouts remain usable.
- Confirm privacy text still matches hosting, fields and providers. No analytics are included in the initial release.
