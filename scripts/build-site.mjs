import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const cities = require("cities.json");
const countries = require("country-list").getData();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const routes = [
  "index.html",
  "careers.html",
  "catalogue.html",
  "across-borders",
  "showcases",
  "onboarding",
  "privacy",
  "about",
  "contact",
  "terms",
  "stories",
  "404.html",
];
const staticFiles = [
  "assets",
  "styles.css",
  "site.js",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "index.md",
  ".well-known",
  ".htaccess",
  "favicon.ico",
  "favicon.svg",
  "apple-touch-icon.png",
  "site.webmanifest",
];

function addFilePreviewSupport(html, relativePath) {
  const directory = path.dirname(relativePath);
  const fileRoot = `${path.relative(directory, ".").split(path.sep).join("/") || "."}/`;
  html = html.replace(/<html\b([^>]*)>/i, (_match, attributes) => {
    const cleanAttributes = attributes.replace(/\sdata-file-root=["'][^"']*["']/i, "");
    return `<html${cleanAttributes} data-file-root="${fileRoot}">`;
  });
  if (html.includes('id="file-preview-loader"')) return html;
  const loader = `<script id="file-preview-loader">
    if (location.protocol === "file:") {
      const helper = document.createElement("script");
      helper.src = \`\${document.documentElement.dataset.fileRoot || "./"}assets/js/file-preview.js\`;
      document.head.append(helper);
    }
  </script>`;
  return html.replace("</head>", `${loader}\n</head>`);
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

function currentPathFromCanonical(html) {
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  if (!canonical) throw new Error("Every HTML page must provide a self-referencing canonical URL.");
  return new URL(canonical).pathname.replace(/\/$/, "") || "/";
}

function renderNavigation(partial, currentPath) {
  return partial.replace(/data-nav-path="([^"]+)"/g, (_match, navPath) => {
    const isCurrent = currentPath === navPath
      || (navPath === "/onboarding" && currentPath.startsWith("/onboarding/"));
    return isCurrent ? 'aria-current="page"' : "";
  });
}

function ensureStylesheet(html, relativePath) {
  if (relativePath === "catalogue.html") {
    html = html.replace(/(<link\b[^>]*href=["'])styles\.css(["'][^>]*>)/i, "$1/styles.css$2");
  }
  if (/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](?:\/|(?:\.\.\/)*)styles\.css["']/i.test(html)) return html;
  return html.replace("</head>", '  <link rel="stylesheet" href="/styles.css">\n</head>');
}

function useSiteRootAssetPaths(html) {
  return html
    .replace(/((?:href|src|srcset)=["'])\.\.\//g, "$1/")
    .replace(/((?:href|src|srcset)=["'])styles\.css(["'])/g, "$1/styles.css$2")
    .replace(/((?:href|src|srcset)=["'])assets\//g, "$1/assets/");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function renderPlaceholderCard(index) {
  const image = index % 2 === 0 ? "editorial-artisan-fashion" : "artisan-design-detail";
  return `<article class="profile-card profile-card-placeholder" aria-label="Featured piece coming soon">
    <picture class="placeholder-media"><source srcset="/assets/img/${image}.webp" type="image/webp"><img src="/assets/img/${image}.png" width="1200" height="896" alt="" loading="lazy" decoding="async"></picture>
    <span class="profile-index">Image placeholder</span>
    <h3>A featured piece to come</h3>
    <p>Illustrative image only</p>
  </article>`;
}

function renderPartnerCards(partners) {
  const cards = partners.map((partner, index) => {
    if (partner.status !== "live") return renderPlaceholderCard(index);
    return `<a class="profile-card" href="/showcases/${escapeHtml(partner.slug)}">
      <span class="profile-index">Featured piece</span>
      <h3>${escapeHtml(partner.featuredPieceName || partner.collectionName)}</h3>
      <p>${escapeHtml(partner.name)} · ${escapeHtml(partner.craft)} · ${escapeHtml(partner.location)}</p>
    </a>`;
  });
  return cards.join("\n");
}

function liveProfileSchema(partner) {
  const creatorType = partner.profileType === "Organization" ? "Organization" : "Person";
  const graph = [
    {
      "@type": creatorType,
      "@id": `https://legacies.global/showcases/${partner.slug}#creator`,
      name: partner.name,
      ...(partner.profileType === "Organization" ? { location: partner.location } : {}),
    },
    {
      "@type": "CreativeWork",
      "@id": `https://legacies.global/showcases/${partner.slug}#collection`,
      name: partner.featuredPieceName || partner.collectionName,
      description: partner.story,
      creator: { "@id": `https://legacies.global/showcases/${partner.slug}#creator` },
      image: partner.gallery.map(image => `https://legacies.global${image.src}`),
    },
  ];
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

function renderGallery(images) {
  return images.map(image => {
    const fileName = path.basename(image.src);
    if (image.src !== `/assets/img/${fileName}` || !/\.(png|jpe?g)$/i.test(fileName)) {
      throw new Error(`Profile gallery images must use a supported local image in /assets/img/: ${image.src}`);
    }
    const webpSource = image.src.replace(/\.(png|jpe?g)$/i, ".webp");
    return `<figure>
    <picture><source srcset="${escapeHtml(webpSource)}" type="image/webp"><img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async"></picture>
    <figcaption>${escapeHtml(image.caption || image.alt)}</figcaption>
  </figure>`;
  }).join("\n");
}

function renderLiveProfile(template, partner) {
  const storyWords = partner.story.trim().split(/\s+/).length;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(partner.slug)) throw new Error(`Invalid profile slug: ${partner.slug}`);
  if (!partner.seoTitle || partner.seoTitle.length >= 60 || !partner.seoDescription || partner.seoDescription.length >= 160) {
    throw new Error(`Live profile ${partner.slug} needs a title under 60 characters and a description under 160 characters.`);
  }
  if (storyWords < 150) throw new Error(`Live profile ${partner.slug} needs a story of at least 150 words.`);
  if (!["Person", "Organization"].includes(partner.profileType)) throw new Error(`Invalid profileType for ${partner.slug}.`);
  if (!partner.gallery?.length || partner.gallery.some(image => !image.alt || !image.src?.startsWith("/assets/img/")
    || !Number.isInteger(image.width) || image.width <= 0 || !Number.isInteger(image.height) || image.height <= 0)) {
    throw new Error(`Live profile ${partner.slug} needs gallery images under /assets/img/ with descriptive alt text.`);
  }

  const replacements = {
    "{{PROFILE_TITLE}}": escapeHtml(partner.seoTitle),
    "{{PROFILE_DESCRIPTION}}": escapeHtml(partner.seoDescription),
    "{{PROFILE_NAME}}": escapeHtml(partner.name),
    "{{PROFILE_LOCATION}}": escapeHtml(partner.location),
    "{{PROFILE_CRAFT}}": escapeHtml(partner.craft),
    "{{PROFILE_COLLECTION}}": escapeHtml(partner.collectionName),
    "{{PROFILE_PIECE}}": escapeHtml(partner.featuredPieceName || partner.collectionName),
    "{{PROFILE_NAME_JSON}}": JSON.stringify(partner.name).replace(/</g, "\\u003c"),
    "{{PROFILE_STORY}}": partner.story.split(/\n{2,}/).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("\n"),
    "{{PROFILE_GALLERY}}": renderGallery(partner.gallery),
    "{{PROFILE_COLLABORATION}}": escapeHtml(partner.collaborationDetails),
    "{{PROFILE_CANONICAL}}": `https://legacies.global/showcases/${escapeHtml(partner.slug)}`,
    "{{PROFILE_SCHEMA}}": liveProfileSchema(partner),
  };
  return Object.entries(replacements).reduce((page, [token, replacement]) => page.replaceAll(token, replacement), template);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const item of [...routes, ...staticFiles, "data/partners.json", "REPLACE_WITH_INDEXNOW_KEY.txt"]) {
  const source = path.join(root, item);
  if (await exists(source)) await cp(source, path.join(output, item), { recursive: true });
}
for (const item of ["api/apply.php", "api/contact.php", "api/mcp.php", "api/_shared.php"]) {
  const source = path.join(root, item);
  if (await exists(source)) await cp(source, path.join(output, item), { recursive: true });
}

const partialsDirectory = path.join(root, "partials");
const sharedHead = await readFile(path.join(partialsDirectory, "shared-head.html"), "utf8");
const headerPartial = await readFile(path.join(partialsDirectory, "site-header.html"), "utf8");
const footerPartial = await readFile(path.join(partialsDirectory, "site-footer.html"), "utf8");
const partnerData = JSON.parse(await readFile(path.join(root, "data", "partners.json"), "utf8"));
const template = await readFile(path.join(root, "templates", "showcase-profile.template.html"), "utf8");
const generatedProfiles = [];
const htmlPaths = [];
const countryDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryOptions = countries
  .map(country => ({
    ...country,
    displayName: countryDisplayNames.of(country.code) || country.name,
  }))
  .sort((left, right) => left.displayName.localeCompare(right.displayName))
  .map(country => `<option value="${escapeHtml(country.displayName)}" data-country-code="${escapeHtml(country.code)}">${escapeHtml(country.displayName)}</option>`)
  .join("");
const citiesByCountry = new Map(countries.map(country => [country.code, new Set()]));
for (const city of cities) {
  citiesByCountry.get(city.country)?.add(city.name);
}
const citiesOutput = path.join(output, "assets", "data", "cities");
await mkdir(citiesOutput, { recursive: true });
for (const [countryCode, cityNames] of citiesByCountry) {
  const sortedNames = [...cityNames].sort((left, right) => left.localeCompare(right));
  await writeFile(path.join(citiesOutput, `${countryCode}.json`), JSON.stringify(sortedNames));
}

for (const route of routes) {
  const sourcePath = path.join(root, route);
  if (await exists(sourcePath)) {
    const info = await stat(sourcePath);
    if (info.isFile() && sourcePath.endsWith(".html")) htmlPaths.push(sourcePath);
    else if (info.isDirectory()) htmlPaths.push(...await htmlFiles(sourcePath));
  }
}

for (const sourcePath of htmlPaths) {
  const relativePath = path.relative(root, sourcePath);
  let html = await readFile(sourcePath, "utf8");
  const currentPath = currentPathFromCanonical(html);
  html = html
    .replace("<!-- SITE_HEAD_SHARED -->", sharedHead)
    .replace("<!-- SITE_HEADER -->", renderNavigation(headerPartial, currentPath))
    .replace("<!-- SITE_FOOTER -->", footerPartial)
    .replace("<!-- SITE_SCRIPT -->", '<script src="/site.js" defer></script>');
  html = html.replace("<!-- COUNTRY_OPTIONS -->", countryOptions);
  html = useSiteRootAssetPaths(html);
  html = ensureStylesheet(html, relativePath);
  html = addFilePreviewSupport(html, relativePath);
  if (html.includes("<!-- PARTNER_CARDS -->")) {
    html = html.replace("<!-- PARTNER_CARDS -->", renderPartnerCards(partnerData.partners));
  }
  await writeFile(path.join(output, relativePath), html);
}

for (const partner of partnerData.partners) {
  if (partner.status !== "live") continue;
  const profilePath = `/showcases/${partner.slug}`;
  const page = renderLiveProfile(template, partner)
    .replace("<!-- SITE_HEAD_SHARED -->", sharedHead)
    .replace("<!-- SITE_HEADER -->", renderNavigation(headerPartial, profilePath))
    .replace("<!-- SITE_FOOTER -->", footerPartial)
    .replace("<!-- SITE_SCRIPT -->", '<script src="/site.js" defer></script>');
  const profileRelativePath = path.join("showcases", partner.slug, "index.html");
  const styledPage = addFilePreviewSupport(useSiteRootAssetPaths(ensureStylesheet(page)), profileRelativePath);
  const destination = path.join(output, "showcases", partner.slug, "index.html");
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, styledPage);
  generatedProfiles.push({ path: profilePath, lastmod: partner.lastmod || new Date().toISOString().slice(0, 10) });
}

if (generatedProfiles.length) {
  const sitemapPath = path.join(output, "sitemap.xml");
  let sitemap = await readFile(sitemapPath, "utf8");
  const profileUrls = generatedProfiles.map(profile => `  <url><loc>https://legacies.global${profile.path}</loc><lastmod>${escapeHtml(profile.lastmod)}</lastmod></url>`).join("\n");
  sitemap = sitemap.replace("</urlset>", `${profileUrls}\n</urlset>`);
  await writeFile(sitemapPath, sitemap);
}

const imageDirectory = path.join(output, "assets", "img");
if (await exists(imageDirectory)) {
  for (const imageName of await readdir(imageDirectory)) {
    if (!/\.(png|jpe?g)$/i.test(imageName) || imageName === "og-legacies-global.jpg") continue;
    const imagePath = path.join(imageDirectory, imageName);
    const webpPath = imagePath.replace(/\.(png|jpe?g)$/i, ".webp");
    await sharp(imagePath).webp({ quality: 82, effort: 5 }).toFile(webpPath);
  }
}

const faviconPng = await sharp(path.join(root, "assets", "img", "legacies-global-logo.png"))
  .resize(64, 64, { fit: "contain" })
  .png()
  .toBuffer();
const faviconHeader = Buffer.alloc(22);
faviconHeader.writeUInt16LE(0, 0);
faviconHeader.writeUInt16LE(1, 2);
faviconHeader.writeUInt16LE(1, 4);
faviconHeader.writeUInt8(64, 6);
faviconHeader.writeUInt8(64, 7);
faviconHeader.writeUInt16LE(1, 10);
faviconHeader.writeUInt16LE(32, 12);
faviconHeader.writeUInt32LE(faviconPng.length, 14);
faviconHeader.writeUInt32LE(faviconHeader.length, 18);
await writeFile(path.join(output, "favicon.ico"), Buffer.concat([faviconHeader, faviconPng]));

const deployDirectory = path.join(root, "public_html");
await rm(deployDirectory, { recursive: true, force: true });
await cp(output, deployDirectory, { recursive: true });

console.log(`Built ${htmlPaths.length} pages and ${generatedProfiles.length} live partner profiles in dist/ and public_html/.`);
