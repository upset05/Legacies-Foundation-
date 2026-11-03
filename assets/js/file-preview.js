const fileRoot = document.documentElement.dataset.fileRoot || "./";

function localFileUrl(value) {
  if (!value.startsWith("/")) return value;
  const [pathname, suffix = ""] = value.split(/(?=[?#])/, 2);
  const route = pathname.replace(/^\/+|\/+$/g, "");
  const file = !route ? "index.html"
    : /\.[a-z0-9]+$/i.test(route) ? route
    : route === "careers" || route === "catalogue" ? `${route}.html`
    : `${route}/index.html`;
  return `${fileRoot}${file}${suffix}`;
}

function rewriteFileUrls(node) {
  if (!(node instanceof Element)) return;
  const elements = [node, ...node.querySelectorAll("[href^='/'], [src^='/'], [srcset]")];
  for (const element of elements) {
    if (element instanceof HTMLSourceElement && element.hasAttribute("srcset")) {
      element.remove();
      continue;
    }
    if (element instanceof HTMLLinkElement && element.rel === "stylesheet"
      && element.id !== "file-preview-stylesheet") {
      element.remove();
      continue;
    }
    for (const attribute of ["href", "src"]) {
      const value = element.getAttribute(attribute);
      if (value?.startsWith("/")) element.setAttribute(attribute, localFileUrl(value));
    }
    const srcset = element.getAttribute("srcset");
    if (srcset) {
      element.setAttribute("srcset", srcset.replace(/(^|,\s*)(\/[^\s,]+)/g, (_match, prefix, url) => `${prefix}${localFileUrl(url)}`));
    }
  }
}

function hydrateFilePreviewPlaceholder(node) {
  if (node.nodeType !== Node.COMMENT_NODE) return;
  const placeholder = node.data.trim();
  const logo = `${fileRoot}assets/img/legacies-global-logo.png`;
  const header = `<header class="site-header">
    <nav class="nav visible" id="navBar" aria-label="Main navigation"><div class="nav-inner">
      <a href="/" class="nav-logo" aria-label="Legacies Global home"><img src="${logo}" width="1080" height="1080" alt="Legacies Global brand mark" class="nav-logo-img"><span class="nav-logo-name">Legacies Global</span></a>
      <ul class="nav-links"><li><a href="/">Home</a></li><li><a href="/across-borders">Across Borders</a></li><li><a href="/showcases">Showcases</a></li><li><a href="/onboarding">Onboarding</a></li><li><a href="/catalogue">Catalogue</a></li><li><a href="/careers">Careers</a></li><li><a href="mailto:legacies@legacies.global">Contact</a></li></ul>
      <div class="nav-right"><button class="theme-pill" id="themeToggle" type="button" aria-label="Toggle colour theme"><svg class="theme-icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg><svg class="theme-icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"></path></svg></button>
        <details class="mobile-menu"><summary aria-label="Open site navigation" aria-controls="mobileNavigation" aria-expanded="false"><span></span><span></span><span></span></summary><ul class="mobile-menu-panel" id="mobileNavigation"><li><a href="/">Home</a></li><li><a href="/across-borders">Across Borders</a></li><li><a href="/showcases">Showcases</a></li><li><a href="/onboarding">Onboarding</a></li><li><a href="/catalogue">Catalogue</a></li><li><a href="/careers">Careers</a></li><li><a href="mailto:legacies@legacies.global">Contact</a></li></ul></details>
      </div>
    </div></nav>
  </header>`;
  const footer = `<footer class="footer"><div class="footer-inner">
    <div class="footer-brand"><a href="/" aria-label="Legacies Global home"><img src="${logo}" width="1080" height="1080" alt="Legacies Global brand mark" class="footer-brand-logo" loading="lazy" decoding="async"></a><p class="footer-brand-tagline">Crafted globally · Built for the world</p></div>
    <div class="footer-bottom"><p class="footer-copy">© 2025 Legacies Global. All rights reserved.</p><nav class="footer-links" aria-label="Footer navigation"><a href="/">Home</a><a href="/across-borders">Across Borders</a><a href="/showcases">Showcases</a><a href="/onboarding">Onboarding</a><a href="/catalogue">Catalogue</a><a href="/careers">Careers</a><a href="mailto:legacies@legacies.global">Contact</a></nav></div>
  </div></footer>`;
  let markup;
  if (placeholder === "SITE_HEADER") markup = header;
  else if (placeholder === "SITE_FOOTER") markup = footer;
  else if (placeholder === "SITE_SCRIPT") {
    const script = document.createElement("script");
    script.src = new URL(`${fileRoot}site.js`, document.baseURI).href;
    node.replaceWith(script);
    return;
  } else if (placeholder === "PARTNER_CARDS") {
    markup = ["editorial-artisan-fashion", "artisan-design-detail", "editorial-artisan-fashion"].map(image => `
      <article class="profile-card profile-card-placeholder" aria-label="Featured piece coming soon">
        <picture class="placeholder-media"><img src="${fileRoot}assets/img/${image}.png" width="1200" height="896" alt="" loading="lazy" decoding="async"></picture>
        <span class="profile-index">Image placeholder</span><h3>A featured piece to come</h3><p>Illustrative image only</p>
      </article>`).join("");
  } else if (placeholder === "SITE_HEAD_SHARED") {
    node.remove();
    return;
  } else {
    return;
  }

  const template = document.createElement("template");
  template.innerHTML = markup;
  node.replaceWith(template.content);

  if (placeholder === "SITE_HEADER") {
    document.querySelectorAll(".mobile-menu").forEach(menu => {
      const summary = menu.querySelector("summary");
      const updateMenuState = () => {
        summary?.setAttribute("aria-expanded", String(menu.open));
        summary?.setAttribute("aria-label", menu.open ? "Close site navigation" : "Open site navigation");
      };
      updateMenuState();
      menu.addEventListener("toggle", updateMenuState);
      menu.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          menu.open = false;
          summary?.focus();
        }
      });
      document.addEventListener("pointerdown", event => {
        if (menu.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
      });
      menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => { menu.open = false; });
      });
    });
  }
}

function hydrateFilePreviewPlaceholders(node = document.documentElement) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_COMMENT);
  const comments = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach(hydrateFilePreviewPlaceholder);
}

if (!document.querySelector('link[rel="stylesheet"]')) {
  const stylesheet = document.createElement("link");
  stylesheet.id = "file-preview-stylesheet";
  stylesheet.rel = "stylesheet";
  stylesheet.href = `${fileRoot}styles.css`;
  document.head.append(stylesheet);
}

const observer = new MutationObserver(records => {
  for (const record of records) {
    record.addedNodes.forEach(node => {
      hydrateFilePreviewPlaceholder(node);
      rewriteFileUrls(node);
    });
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });
hydrateFilePreviewPlaceholders();
rewriteFileUrls(document.documentElement);
