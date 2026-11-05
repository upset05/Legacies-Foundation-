# Legacies Global site review report

**Review date:** 2 November 2026

## Summary

This update addresses the crowded page presentation, blurred visual placeholders for the two editorial concepts, the recurring home entrance, the reported theme-switch issue, and local HTML files appearing unstyled when opened from File Explorer.

The shared navigation and footer remain consistent, and the original dark, editorial visual direction is retained.

## Hostinger static deployment and contact update

### What was broken

- Hostinger was importing the repository source files directly. The shared header, navigation and footer exist as build-time partial markers in those sources, so a raw-file deployment left those areas missing.
- Source pages included relative stylesheet, image and script URLs. Those URLs can resolve against the wrong path on clean, nested routes.
- The previous `vercel.json` described Vercel build and routing behavior; it does not configure Apache on Hostinger.
- The browser's ICO favicon contained a standalone “F” rather than the Legacies wordmark.
- The Contact page offered email details but did not provide the requested enquiry form.
- The shared desktop navigation allowed the page stylesheet's wider pill dimensions to differ from the compact Home navigation.

### Changes made

- The build now emits a committed `public_html/` deployment folder alongside `dist/`. Every HTML page in it has the shared head, navigation and footer expanded before deploy, and all page-level CSS, script and image references resolve from the site root.
- Added `.htaccess` rules for HTTPS, non-www redirects, clean URLs, `/api/apply`, `/api/contact`, `/api/mcp`, Markdown homepage negotiation, security headers and the custom 404 document.
- Removed `vercel.json`; Apache behavior is now defined by `.htaccess`.
- Added PHP application and contact endpoints with input validation, honeypot checks and a file-backed per-IP rate limit. They use the host's PHP `mail()` transport to send to `legacies@legacies.global`. The existing public, read-only MCP route also has a PHP implementation for static hosting.
- Replaced the “F” favicon with the Legacies logo artwork and wordmark; the build generates a PNG-backed ICO from the actual local logo.
- Reworked Contact into a desktop two-column support-email/enquiry layout that stacks on mobile. The form collects name, email, enquiry category and message.
- Standardized the shared desktop navigation to the compact 900px Home pill size.

### Hostinger deployment instructions

- The web document root is Hostinger's `public_html` directory. Put the **contents** of this repository's generated `public_html/` folder directly inside it; do not create an extra nested `public_html/public_html/`.
- If Git deployment has a source subfolder/output-directory selector, choose repository `public_html/` and publish its *contents* to the document root. If the Git UI only provides a destination directory, that field does not select a source subfolder: use the web root as the destination and deploy the bundle contents via File Manager/CI, or use a branch whose root contains the bundle. Do not create a nested `public_html/public_html/`.
- Hostinger must run PHP and permit outgoing `mail()`; the sender mailbox and domain SPF/DKIM settings need to be configured in hPanel for reliable delivery. No mail credentials are included in source.

### Verification

- `npm run build` produced 13 complete pages in `dist/` and `public_html/`.
- A generated-output audit found the shared header, nav and footer on all 13 pages, no remaining partial markers, no missing root-resolved asset or route references, and no non-root relative `href`, `src` or `srcset` paths.
- Browser checks of the local generated site confirmed the shared navigation and footer on every route, correct Contact form layout at desktop and mobile widths, and no missing local assets or HTTP 404 responses.
- PHP CLI is not installed in the local environment, so PHP syntax lint and live mail delivery could not be exercised here. The PHP endpoints require verification on the Hostinger PHP runtime.

## Changes made

### Home entrance and galaxy effect

- Restored the live site's cursor-reactive galaxy effect in `assets/js/home-intro.js`: 110 drifting, twinkling points, soft nebula glows, cursor repulsion within 140px, and nearby connecting lines.
- The entrance appears at most once every five minutes. It records the last display in local storage and falls back to session storage when needed. The interval is set by `cooldown` in `index.html`.
- Added the **Move to explore · Click to enter** prompt. Visitors can dismiss with the **Enter site** button, a click or tap on the intro, or Escape; it also dismisses automatically after four seconds. Reduced-motion preferences use a brief 150ms dismissal and skip the particle animation.
- Removed the separate CSS auto-exit timer so the entrance is controlled by one JavaScript timer and the galaxy remains visible for the full intro.

### Onboarding location and craft fields

- Replaced the free-text country field with a complete selector of 249 ISO country and territory entries.
- Added country-specific city suggestions from a bundled GeoNames-derived dataset. The selected country's list loads on demand; applicants can still type a city that is not listed.
- Grouped 21 craft choices into clothing, textile and surface craft, accessories and adornment, and objects or other practices.
- Added city to the application email and server-side validation, and updated the endpoint's accepted craft values to match the expanded dropdown.
- Added attribution for the GeoNames-derived city data and country list. Country choices and city suggestions do not call a third-party API.
- Updated Sharp to a patched version after the dependency audit flagged the prior version; the build now requires Node 20.9 or newer.

### Across Borders and Showcases

- Added three soft-focus image panels to Across Borders for **Place**, **Practice**, and **Encounter**. Their captions explain the cultural-discovery idea. The page labels the images as visual placeholders and does not invent a location or maker.
- Simplified the Showcase introduction and removed the separate, repeated application callout from the top of the page.
- Updated the generated Showcase cards to use blurred local images and explicit placeholder copy. The cards are not presented as real products, designers, or collections.
- Kept the longer editorial sections below the visual introduction, with internal links between the concepts and partner application.

### Navigation and theme switch

- The desktop navigation changes to the compact menu below 900px to avoid squeezing the links beside the brand and controls.
- Consolidated the theme behavior in `site.js`. The same control now applies to shared pages, updates its accessible label, saves the choice, restores it between pages, and follows the operating-system preference until a visitor chooses a theme.
- Removed duplicate page-specific theme handlers from the home, careers, and catalogue scripts.

### File Explorer and local preview

- Added `assets/js/file-preview.js` as a local-file-only helper. It supplies the shared header and footer, loads the stylesheet, resolves local image and script paths, and maps clean routes to their HTML files for direct file previews.
- Changed source CSS and JavaScript references to paths that work from their source folders. The build still emits the deployable clean-route pages.
- Updated the VS Code launch configuration to open the local preview. The normal preview command is `npm run preview`; direct `file://` previews are for visual review and do not replace a web server.
- Updated `README.md` with the preview guidance and direct-file limitations.

### Related project context

The project also includes the static build pipeline, shared page partials, self-hosted image and font assets, clean-route pages, SEO metadata, sitemap and robots files, onboarding form scaffolding, and deployment configuration. These parts are in the current worktree; not all were introduced in this specific refinement.

## Files changed for this refinement

- `.vscode/launch.json`
- `.vscode/tasks.json`
- `README.md`
- `REVIEW-REPORT.md`
- `index.html`
- `across-borders/index.html`
- `showcases/index.html`
- `careers.html`
- `catalogue.html`
- `onboarding/index.html`
- `onboarding/thank-you/index.html`
- `privacy/index.html`
- `stories/index.html`
- `404.html`
- `partials/shared-head.html`
- `styles.css`
- `site.js`
- `assets/js/home-intro.js`
- `assets/js/file-preview.js`
- `scripts/build-site.mjs`

The worktree contained other modified and untracked files before this refinement. They were left intact.

## Verification

- `npm run build` completed successfully: 10 pages generated and 0 live Showcase profiles.
- `node --check` passed for the build script, theme script, entrance script, and file-preview helper.
- `git diff --check` passed.
- Generated HTML audit passed: each of the 10 built pages has one stylesheet link and no unresolved shared-page placeholders.
- Browser checks confirmed that the galaxy canvas draws, the entrance skip works, and returning to Home before the cooldown does not show the entrance again.
- Browser checks confirmed automatic dismissal after the intro interval and quick dismissal when reduced motion is enabled.
- Browser checks confirmed theme changes on Across Borders, Showcases, Onboarding, Careers, and Catalogue, with the selected value saved for subsequent pages.
- Browser checks confirmed the mobile navigation opens and there is no horizontal page overflow at a 390px viewport.
- Direct `file://` checks confirmed that styles, logos, and blurred Across Borders images load from the source folders.
- No automated VS Code test controller is configured for this project, so no automated test suite was available.

## Latest visual and performance pass

- Kept the Catalogue's lightweight, pre-blurred image backdrop and gave Across Borders, Showcases, Onboarding, and Careers individual low-file-size atmosphere images and color tints. These are compact crops of the existing site photography, not invented designer or product photos.
- Removed the Catalogue's four stacked full-size photos and unused mouse-follow reveal layer. Its centered introduction retains the original Catalogue backdrop treatment.
- Centered editorial-page introductions and Catalogue content, reduced repeated section and footer divider lines, and kept the existing typography and palette.
- Refined the desktop navigation with a subtle gold-thread accent and a restrained active-page marker. The mobile menu now has a compact floating panel, animated menu icon, accessible expanded state, Escape and outside-click dismissal, and closes when a route is selected.
- Added WebP sources to Across Borders' visual panels so deployed pages can prefer optimized versions while direct file previews retain their PNG fallback.
- Tuned the Home entrance canvas to 110 stars, with cursor repulsion and local connecting lines to make the galaxy field explorable while keeping its rendering work bounded.
- Kept the Catalogue stylesheet reference relative in the source HTML for File Explorer previews; the build rewrites it to a root-relative URL so the clean deployed route still loads correctly.
- Set the entrance cooldown to five minutes, matching the interval observed on the live site.
- Updated the Home page's H1 and description to name sustainable artisan fashion clearly, while preserving the original centered hero layout. Added relevant `knowsAbout` topics to the Organization JSON-LD and a description to the WebSite JSON-LD; these improve entity context but do not guarantee search rankings.

### Files changed in this pass

- `styles.css`
- `catalogue.html`
- `across-borders/index.html`
- `partials/site-header.html`
- `site.js`
- `assets/js/file-preview.js`
- `assets/js/home-intro.js`
- `scripts/build-site.mjs`
- `assets/img/legacies-editorial-backdrop.webp`
- `assets/img/across-borders-atmosphere.webp`
- `assets/img/showcases-atmosphere.webp`
- `assets/img/onboarding-atmosphere.webp`
- `assets/img/careers-atmosphere.webp`
- `REVIEW-REPORT.md`

### Verification for this pass

- `npm run build` completed successfully: 10 pages generated and 0 live Showcase profiles.
- `node --check` passed for the build script, theme script, entrance script, and file-preview helper; `git diff --check` passed.
- The generated Catalogue uses `/styles.css`, and the CSS, font, backdrop, and favicon requests return HTTP 200 in the local preview.
- Desktop browser review confirmed the Catalogue and Across Borders introductions are horizontally centered, use the shared backdrop, and have no horizontal overflow.
- Mobile browser review confirmed the Across Borders cards stack within the viewport, the navigation opens, reports its expanded state, dismisses with Escape, and theme switching works.
- Across Borders panels load their self-hosted WebP sources at 1200 × 896.
- A direct `file://` Catalogue preview loads `styles.css` and the compact backdrop image and renders the shared header and footer.
- The Home page now identifies sustainable artisan fashion in its visible H1, title, description and structured data, with a five-minute entrance cooldown.
- Final intro checks on the local build confirmed pointer movement reveals the custom cursor, activating the skip control dismisses the intro, automatic dismissal occurs after four seconds, and a reload within five minutes skips the entrance. Reduced-motion mode dismisses the intro after its brief 150ms interval.
- The onboarding build contains 249 unique country codes, 249 per-country city datasets and four craft-category groups. Browser checks loaded Ghana's city list, suggested Accra, accepted it with arrow-key selection, and selected Handwoven textiles.
- `npm audit` reported zero vulnerabilities after updating Sharp; the site build and JavaScript syntax checks passed.
- Homepage wording was not changed in this onboarding update.

## Review notes and remaining manual work

- The five-minute entrance cooldown matches the live site's observed behavior. Adjust `cooldown` in `index.html` if a different revisit interval is preferred.
- Showcase cards and Across Borders images remain explicit placeholders until approved maker content and licensed images are available.
- The onboarding endpoint and profile/social details still need the real production values described in the project configuration and SEO checklist.
- A `file://` page is not a full website server. Clean routes, server functions, and form submissions should be reviewed through `npm run preview` or a deployment.
- That earlier refinement review predated the Hostinger publish; the current deployment status is recorded below.

## 4 November 2026 — Agent readiness and Hostinger publish

### Changes made

- Added the requested `Content-Signal: search=yes, ai-train=no` directive and removed the robots exclusion for the noindex thank-you page so crawlers can see its `noindex` metadata.
- Expanded `sitemap.xml` to include all eight indexable pages, with `lastmod` values. Draft legal/privacy pages, the thank-you page, stories scaffolding and the 404 page remain out of the sitemap because they are `noindex`.
- Added `llms.txt` and an `index.md` representation of the existing homepage copy. The homepage serves Markdown for `Accept: text/markdown`; HTML responses advertise the Markdown and `llms.txt` resources in an RFC 8288 `Link` header. The Vercel configuration has matching response handling.
- Added `/about`, `/contact` and `/terms`. About and Contact are indexable. Terms is explicitly a draft, remains `noindex`, and must be reviewed before it is treated as final legal text.
- Added AboutPage, ContactPage, Article and Service structured data, while retaining the site's Organization, WebSite, BreadcrumbList and onboarding FAQPage markup. No Product markup was added because the Showcase entries are placeholders, not actual offers.
- Kept telephone and street address out of structured data because the owner asked not to publish either. Contact schema provides the public email address instead.
- Added a public read-only MCP JSON-RPC endpoint at `/api/mcp`, with `initialize`, `tools/list` and two tools: `get_business_overview` and `list_public_pages`. Added the server card at `/.well-known/mcp/server-card.json`.
- Added feature-detected WebMCP registration in `site.js`; it registers a read-only overview tool only in browsers that expose `navigator.modelContext`.
- Added an Express production server for Hostinger. It serves the generated pages, permanent clean-URL redirects, the existing `/api/apply` handler, Markdown negotiation and the MCP endpoint. Added the runtime dependency and `npm start`.
- Linked About, Contact and Terms in the shared footer and routed the navigation Contact link to `/contact`. No homepage wording was changed.
- Registered the Hostinger MCP server in the VS Code user configuration with `npx -y @hostinger/mcp@latest`; the configuration contains no credentials.

### Hostinger deployment

- Confirmed `legacies.global` is an enabled Hostinger Node.js website and checked its document root before replacing the existing site files. Kept DNS and mail records unchanged.
- Built and uploaded a source archive that excluded `dist`, `node_modules`, `.git`, `.hostinger` and environment/credential files. Hostinger used Node.js 22, Express, `server.js`, `npm run build` and `dist/`.
- The first archive deployment completed, but the Git auto-deploy triggered by the push initially used Hostinger's unset defaults (`appType: other`, no output directory), making `/catalogue` and `/careers` return 404. Re-deployed the pushed `main` commit with explicit Express settings and verified the stored settings now read Node.js 22, Express, `dist`, `server.js`, `build`, and npm.
- Final Hostinger build `01a1a81d-0b98-720f-be33-b369017d22b8` completed from `upset05/Legacies-Foundation-` `main` at commit `b8f811c`. It generated 13 pages, 0 live Showcase profiles and 0 npm vulnerabilities. The Hostinger server and CDN cache was cleared after the final publish. Git auto-deployment remains enabled with the corrected build settings.
- Live checks returned 200 for Home, About, Contact, Terms, Across Borders, Showcases, Onboarding, Catalogue, Careers, sitemap, robots, `llms.txt`, `index.md` and the MCP server card. Live Markdown negotiation, the homepage Link header, and MCP initialize/tool-list calls passed.
- Legacy `/index.html`, `/about/index.html`, `/careers.html`, `/onboarding/index.html` and `/across-borders/index.html` returned 301 redirects to clean URLs.

### Verification

- `npm run build` passed; `node --check` passed for `server.js`, `api/mcp.js`, `site.js` and the build script.
- Automated generated-page audit passed for all 13 HTML files: unique titles under 60 characters, descriptions under 160 characters, exactly one H1, canonical URLs, valid JSON-LD and social image tags. The sitemap exactly matched the eight indexable pages.
- Local and live HTTP checks covered HTML and Markdown responses, Link/Vary headers, clean routes, the MCP card, JSON-RPC initialization, tool discovery and a read-only tool call.
- `npm audit --omit=dev` reported zero vulnerabilities. Lighthouse was not run, so no Lighthouse scores are claimed.
- The Hostinger environment-variable list is empty; onboarding email delivery remains unavailable until the two Resend settings below are entered in hPanel.

### Manual follow-up

1. In hPanel, set `RESEND_API_KEY` and `RESEND_FROM` in the website's Node.js environment variables to enable onboarding email delivery. Keep both values out of Git and source files.
2. Replace the social profile placeholders in the shared footer and the Organization `sameAs` data with the verified accounts.
3. Replace `REPLACE_WITH_INDEXNOW_KEY.txt` with the actual IndexNow key and matching filename before submitting URLs.
4. Have the Terms and Privacy drafts reviewed and completed before removing their `noindex` directives.
5. Add the domain to Google Search Console using its DNS verification flow and import it into Bing Webmaster Tools if desired.
6. Telephone and street address remain intentionally unpublished. Add them only if that policy changes and the owner supplies verified details.
