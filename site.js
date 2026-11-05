const siteBody = document.body;
const themeToggle = document.getElementById("themeToggle");
const themePreferenceKey = "lg-theme";

function applyTheme(theme, persist = false) {
  siteBody.dataset.theme = theme;
  siteBody.classList.add("themed");
  themeToggle?.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  if (persist) {
    try {
      localStorage.setItem(themePreferenceKey, theme);
    } catch (error) {
      console.warn("Unable to save the selected colour theme.", error);
    }
  }
}

let savedTheme = null;
try {
  const storedTheme = localStorage.getItem(themePreferenceKey);
  if (storedTheme === "dark" || storedTheme === "light") savedTheme = storedTheme;
} catch (error) {
  console.warn("Unable to read the saved colour theme.", error);
}
applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));

themeToggle?.addEventListener("click", () => {
  applyTheme(siteBody.dataset.theme === "dark" ? "light" : "dark", true);
});

window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", event => {
  try {
    if (!localStorage.getItem(themePreferenceKey)) applyTheme(event.matches ? "light" : "dark");
  } catch (error) {
    console.warn("Unable to read the saved colour theme.", error);
    applyTheme(event.matches ? "light" : "dark");
  }
});

document.querySelectorAll(".mobile-menu").forEach(menu => {
  const summary = menu.querySelector("summary");
  const updateMenuState = () => {
    summary?.setAttribute("aria-expanded", String(menu.open));
    summary?.setAttribute("aria-label", menu.open ? "Close site navigation" : "Open site navigation");
  };
  updateMenuState();
  menu.addEventListener("toggle", () => {
    updateMenuState();
  });
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

const modelContext = navigator.modelContext;
if (modelContext && typeof modelContext.registerTool === "function") {
  try {
    Promise.resolve(modelContext.registerTool({
      name: "legacies_global_overview",
      description: "Return public information about Legacies Global and links to its website pages.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: async () => ({
        name: "Legacies Global",
        website: "https://legacies.global/",
        email: "legacies@legacies.global",
        focus: "Artisan design, cultural innovation, considered fashion editions and editorial collaboration.",
        pages: [
          "https://legacies.global/about",
          "https://legacies.global/across-borders",
          "https://legacies.global/showcases",
          "https://legacies.global/catalogue",
          "https://legacies.global/onboarding",
          "https://legacies.global/contact",
        ],
        note: "No public telephone number or street address is published.",
      }),
    })).catch(error => {
      console.warn("Unable to register the Legacies Global WebMCP tool.", error);
    });
  } catch (error) {
    console.warn("Unable to register the Legacies Global WebMCP tool.", error);
  }
}
