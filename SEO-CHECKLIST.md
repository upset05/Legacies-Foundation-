# SEO maintenance checklist

- Keep one concise, distinct title (under 60 characters), description (under 160), canonical, H1 and social metadata on every published page.
- Use only clean, lowercase URLs in navigation and body copy. Confirm permanent redirects for retired `.html` paths after each deployment.
- Update `sitemap.xml` and `<lastmod>` only when indexable content changes. Exclude noindex pages, drafts, templates and placeholder partner profiles.
- Add each partner profile only after approved copy, image rights, descriptive alt text and production details are confirmed. Set its dataset record to `live` and rebuild.
- Validate JSON-LD after changing visible page content. FAQ structured data must match the published questions and answers exactly.
- Keep images self-hosted under `assets/img/`; provide meaningful alt text or `alt=""` for decorative imagery, dimensions, and WebP with a fallback.
- Replace every social profile placeholder in the home Organization JSON-LD and shared footer. Remove placeholder routes and verify all internal links.
- Before launch, test the form end to end, verify email delivery, spam controls, rate limits and the reviewed privacy notice.
- Review Search Console coverage, sitemap processing, Core Web Vitals, mobile accessibility, broken links and Lighthouse results after deployment.
- Generate a real IndexNow key, place it in a same-named `.txt` file at the site root with the key as its contents, then update the build file list.
