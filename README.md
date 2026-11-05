# Legacies Global website

This is a static HTML, CSS and vanilla JavaScript site. Run `npm ci` followed by `npm run build` to assemble the shared header, navigation, footer and metadata into every page, render Showcase cards, create WebP image variants and prepare both `dist/` and the committed, deploy-ready `public_html/` folder. `public_html/` contains complete static pages and their assets plus small PHP endpoints; it does not need Node.js, Express or a server-side build step at runtime.

For a complete local preview with working clean URLs and navigation, run `npm run preview` and open `http://127.0.0.1:4173/`. In VS Code, press F5 to start that preview and open it in Chrome. Direct `file://` previews remain static; PHP forms require a PHP-enabled web server.

## Hostinger static deployment

The website's document root on Hostinger is `/domains/legacies.global/public_html` (the exact account path may differ). The generated `public_html/` folder in this repository is the static deployment bundle. Its contents (`index.html`, `.htaccess`, `assets/`, `api/`, and page folders) must sit directly in the Hostinger web root—not inside `public_html/public_html/`.

If Git deployment has a **source subfolder/output directory** option, select the repository's `public_html/` folder and deploy its contents to the domain's document root. If Git deployment only has a **destination directory** field, leave that at the web root/default; that field does not select a source subfolder. In that case, deploy the contents of the generated bundle using File Manager or CI, or use a branch whose repository root contains the generated bundle. Do not set the destination to `public_html` when the domain root is already `public_html`, as that creates an extra nesting level.

The `.htaccess` file handles HTTPS and non-www redirects, clean URLs, PHP endpoint routing and the custom 404 page. The application and contact forms use `mail()` to send to `legacies@legacies.global`; Hostinger must have PHP and outgoing mail enabled. Verify the sending mailbox and its SPF/DKIM setup in hPanel if messages are not delivered. No mail password or API secret is stored in this repository.

## Publishing a partner profile in under five minutes

1. Get the maker's written approval for their name, location, craft, story, collaboration description and each image/alt-text pair.
2. Add approved gallery files to `assets/img/` and create an entry in `data/partners.json` with `status: "live"`, a unique lowercase `slug`, `profileType` (`Person` or `Organization`), `featuredPieceName`, `name`, `location`, `craft`, `collectionName`, `seoTitle`, `seoDescription`, `story`, `collaborationDetails`, `lastmod` and a `gallery` array (`src`, `alt`, `width`, `height`, and optional `caption`).
3. Keep the story at 150 words or more. The build rejects short stories, missing image alt text/dimensions, invalid slugs and overlong SEO metadata.
4. Run `npm run build` and review `dist/showcases/<slug>/`, the generated Showcase card and the sitemap URL.
5. Commit the approved content and assets, deploy, and confirm the canonical URL, structured data and image rights.

Legacies Showcases is a curated edit of exceptional pieces; Legacies Across Borders gives audiences context to encounter cultures and makers through work from different places. The current dataset contains three clearly marked featured-piece placeholders only. No partner identity or individual profile is published.

## Configuration

Node is used only for the optional local assembly step; no Node process or Express package is needed on Hostinger at runtime. Review [MIGRATION.md](./MIGRATION.md) before changing DNS or moving off GitHub Pages.

## Agent-readable resources

- `/llms.txt` summarizes the site and links its key pages.
- `/index.md` is returned from the homepage when the request prefers `text/markdown`; the HTML response also advertises it with a `Link` header.
- `/.well-known/mcp/server-card.json` describes the public read-only MCP service at `/api/mcp`.
- `site.js` registers a read-only WebMCP overview tool when the browser exposes `navigator.modelContext`.
- The Terms page is a draft and remains `noindex` until reviewed. No phone number or street address is published or invented.

The onboarding country selector contains all 249 country and territory entries from ISO 3166-1. After a country is selected, its searchable city suggestions load from the locally bundled GeoNames-derived dataset; applicants can still type a city that is not listed. City suggestions cover populated places over 1,000 people and administrative seats down to PPLA3, rather than every village or settlement. Dataset attribution and licensing are included in `assets/data/cities/ATTRIBUTION.txt`.

The `/stories` route and story template are scaffolding only; the journal is noindex until approved posts are ready. Editorial outlines in `drafts/` are not copied into the deployable build.
