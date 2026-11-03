# Legacies Global website

This is a static HTML, CSS and vanilla JavaScript site. Run `npm ci` followed by `npm run build`; the deployable site is emitted to `dist/`. The build expands the shared header, footer and head partials, renders the Showcase cards from `data/partners.json`, creates WebP image variants, and generates profile pages only for approved live partner records.

For a complete local preview with working clean URLs, navigation and server-backed form behavior, run `npm run preview` and open `http://127.0.0.1:4173/`. In VS Code, press F5 to start that preview and open it in Chrome. HTML pages opened directly from File Explorer now load their styles and local images too; direct `file://` previews are static, so form submissions still require the local preview server or a deployed endpoint.

## Publishing a partner profile in under five minutes

1. Get the maker's written approval for their name, location, craft, story, collaboration description and each image/alt-text pair.
2. Add approved gallery files to `assets/img/` and create an entry in `data/partners.json` with `status: "live"`, a unique lowercase `slug`, `profileType` (`Person` or `Organization`), `featuredPieceName`, `name`, `location`, `craft`, `collectionName`, `seoTitle`, `seoDescription`, `story`, `collaborationDetails`, `lastmod` and a `gallery` array (`src`, `alt`, `width`, `height`, and optional `caption`).
3. Keep the story at 150 words or more. The build rejects short stories, missing image alt text/dimensions, invalid slugs and overlong SEO metadata.
4. Run `npm run build` and review `dist/showcases/<slug>/`, the generated Showcase card and the sitemap URL.
5. Commit the approved content and assets, deploy, and confirm the canonical URL, structured data and image rights.

Legacies Showcases is a curated edit of exceptional pieces; Legacies Across Borders gives audiences context to encounter cultures and makers through work from different places. The current dataset contains three clearly marked featured-piece placeholders only. No partner identity or individual profile is published.

## Configuration

Copy `.env.example` into a local environment file for API development, then configure the real Resend values in the Vercel project. Never commit secrets. Review [MIGRATION.md](./MIGRATION.md) before changing DNS or moving off GitHub Pages.

The onboarding country selector contains all 249 country and territory entries from ISO 3166-1. After a country is selected, its searchable city suggestions load from the locally bundled GeoNames-derived dataset; applicants can still type a city that is not listed. City suggestions cover populated places over 1,000 people and administrative seats down to PPLA3, rather than every village or settlement. Dataset attribution and licensing are included in `assets/data/cities/ATTRIBUTION.txt`.

The `/stories` route and story template are scaffolding only; the journal is noindex until approved posts are ready. Editorial outlines in `drafts/` are not copied into the deployable build.
