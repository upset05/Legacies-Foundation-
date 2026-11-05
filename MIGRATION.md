# GitHub Pages to Vercel migration

The site build writes the deployable static site to `dist/` and the Hostinger-ready static bundle to `public_html/`. The Hostinger bundle uses PHP for its forms and `.htaccess` for Apache routing; it does not need Node at runtime. Vercel deployment remains a separate setup and does not use `.htaccess`.

## Plan and cutover

1. Create a Vercel project from the GitHub repository. Select **Other**, use `npm run build` as the build command, and set the output directory to `dist`.
2. Set `RESEND_API_KEY` and `RESEND_FROM` in Vercel project environment variables. `RESEND_FROM` must be a sender address verified with Resend. Do not commit the real values.
3. Deploy a preview and test each page, form submission, `.html` redirects, 404 handling, sitemap, robots, IndexNow key route, Open Graph image and response headers.
4. Before DNS changes, lower the DNS TTL to 300 seconds and record every existing DNS record. Preserve MX and email-related TXT records for `legacies@legacies.global`, and keep the Google and Bing verification TXT records. Do not change email records.
5. In Vercel **Project → Settings → Domains**, add `legacies.global` and `www.legacies.global`. Use the exact DNS values displayed for this project. The historically used apex A record (`76.76.21.21`) and `www` CNAME (`cname.vercel-dns.com`) are examples only; the dashboard values take precedence. Choose the apex as primary and redirect `www` to it.
6. Update only the website DNS records at the registrar. Wait for propagation, confirm Vercel has issued HTTPS, and verify the site on the real domain.
7. Only after Vercel is confirmed live, disable GitHub Pages and remove a GitHub Pages `CNAME` file if one exists. No `CNAME` file was present during this repository audit.
8. Re-test clean routes, the three legacy `.html` redirects, canonical tags, sitemap, robots, OG image and the onboarding form against the production domain.
9. Roll back by restoring the website DNS records recorded in step 4. Leave MX and email records unchanged.

## Form delivery

The Vercel function at `api/apply.js` sends application details through Resend to `legacies@legacies.global`. Create a Resend account, verify a sender domain, and set `RESEND_API_KEY` and `RESEND_FROM` in the Vercel project's environment settings. The in-memory IP rate limit is a best-effort guard in serverless environments; for durable limits across instances, connect a shared rate-limit store before launch.

## Commercial-plan note

Vercel Hobby is restricted to personal, non-commercial use. A fashion brand website is commercial, so plan for **Vercel Pro** or choose a free host without that restriction, such as Cloudflare Pages or Netlify. The supplied Vercel function and configuration are specific to the Vercel route. Hostinger instead uses the PHP endpoints in `public_html/api/` and Apache rules in `.htaccess`.

## After launch

- Verify `legacies.global` as a Domain property in Google Search Console using DNS TXT, then submit `/sitemap.xml`.
- Import the property into Bing Webmaster Tools from Search Console and set up IndexNow with the real key file.
- Use URL Inspection to request indexing for `/`, `/across-borders`, `/showcases`, `/onboarding`, `/careers` and `/catalogue`.
- Submit a real partner application and confirm the email arrives at `legacies@legacies.global`.
- Replace the social `sameAs` placeholders with approved profile URLs and redeploy.
- Ask the owner/legal adviser to review and replace the draft `/privacy` notice before collecting applications publicly.
