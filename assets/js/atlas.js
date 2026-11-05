const countrySelect = document.getElementById("atlasCountry");
const regionSelect = document.getElementById("atlasRegion");
const profilesContainer = document.getElementById("atlasProfiles");
const emptyMessage = document.getElementById("atlasEmpty");
const locationNote = document.getElementById("atlasLocationNote");
const eyebrow = document.getElementById("atlasEyebrow");
const prompt = document.getElementById("atlasHorizonPrompt");
const promptClose = document.getElementById("atlasPromptClose");
const exploreOther = document.getElementById("atlasExploreOther");
let atlasPartners = [];

const regionByCountry = new Map();
const regionCountries = {
  africa: "DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW",
  "asia-pacific": "AF AM AZ BD BT BN KH CN CY GE IN ID IR IQ IL JP JO KZ KW KG LA LB MY MV MN MM NP KP KR OM PK PS PH QA SA SG LK SY TJ TH TL TR TM AE UZ VN YE TW AU FJ KI MH FM NR NZ PW PG WS SB TO TV VU",
  europe: "AL AD AT BY BE BA BG HR CZ DK EE FI FR DE GR HU IS IE IT XK LV LI LT LU MT MD MC ME NL MK NO PL PT RO SM RS SK SI ES SE CH UA GB VA RU",
  "middle-east": "BH EG IR IQ IL JO KW LB OM PS QA SA SY TR AE YE",
  americas: "AG AR BS BB BZ BO BR CA CL CO CR CU DM DO EC SV GD GT GY HT HN JM MX NI PA PY PE KN LC VC SR TT US UY VE",
};

for (const [region, codes] of Object.entries(regionCountries)) {
  for (const code of codes.split(" ")) regionByCountry.set(code, region);
}

function findCountryOption(code) {
  return [...countrySelect.options].find(option => option.dataset.countryCode === code);
}

function detectCountryCode() {
  for (const language of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    try {
      const code = new Intl.Locale(language).region;
      if (code && findCountryOption(code)) return code;
    } catch (error) {
      console.warn("Unable to read a country from a browser language preference.", error);
    }
  }
  return null;
}

function setStartingPoint() {
  let savedCode = null;
  try {
    savedCode = localStorage.getItem("lg-atlas-country");
  } catch (error) {
    console.warn("Unable to read the saved Atlas country.", error);
  }

  const code = (savedCode && findCountryOption(savedCode) ? savedCode : null) || detectCountryCode();
  const option = code ? findCountryOption(code) : null;
  if (!option) return;

  countrySelect.value = option.value;
  regionSelect.value = regionByCountry.get(code) || "";
  locationNote.textContent = `Beginning with ${option.value}; change either selection to explore elsewhere.`;
}

function createEditorialCard(partner) {
  const card = document.createElement("a");
  card.className = "atlas-profile-card";
  card.href = `/showcases/${encodeURIComponent(partner.slug)}`;

  const label = document.createElement("span");
  label.textContent = "Approved designer profile";
  const title = document.createElement("h3");
  title.textContent = partner.featuredPieceName || partner.collectionName || partner.name;
  const details = document.createElement("p");
  details.textContent = [partner.name, partner.craft, partner.location].filter(Boolean).join(" · ");

  card.append(label, title, details);
  return card;
}

function renderEdit() {
  const selectedCountryOption = countrySelect.selectedOptions[0];
  const countryOption = selectedCountryOption?.dataset.countryCode ? selectedCountryOption : null;
  const countryCode = countryOption?.dataset.countryCode || "";
  const region = regionSelect.value;
  let matches = [];

  if (countryCode) {
    matches = atlasPartners.filter(partner => partner.status === "live" && partner.countryCode === countryCode);
  } else if (region) {
    const regionCodes = new Set((regionCountries[region] || "").split(" "));
    matches = atlasPartners.filter(partner => partner.status === "live" && regionCodes.has(partner.countryCode));
  }

  profilesContainer.replaceChildren(...matches.map(createEditorialCard));
  emptyMessage.hidden = matches.length > 0;

  if (matches.length > 0) {
    eyebrow.textContent = countryOption ? `The ${countryOption.value} edit` : "The regional edit";
    emptyMessage.textContent = "";
    locationNote.textContent = `${matches.length} approved profile${matches.length === 1 ? "" : "s"} ready to discover.`;
  } else if (countryOption) {
    eyebrow.textContent = `A starting point for ${countryOption.value}`;
    emptyMessage.textContent = `There are no approved designer profiles published for ${countryOption.value} yet. The Atlas will add real work here as makers choose to share it.`;
    locationNote.textContent = "Your country is a starting point, not a boundary.";
  } else if (region) {
    eyebrow.textContent = "The wider edit";
    emptyMessage.textContent = "There are no approved profiles in this regional edit yet. We will not fill the space with invented products or makers.";
    locationNote.textContent = "A broader view, with the same care for each story.";
  } else {
    eyebrow.textContent = "The opening edit";
    emptyMessage.textContent = "Choose a country or region to see the relevant approved profiles when they are available.";
    locationNote.textContent = "Choose a country to set your first horizon.";
  }
}

countrySelect.addEventListener("change", () => {
  const code = countrySelect.selectedOptions[0]?.dataset.countryCode || "";
  regionSelect.value = regionByCountry.get(code) || "";
  try {
    if (code) localStorage.setItem("lg-atlas-country", code);
    else localStorage.removeItem("lg-atlas-country");
  } catch (error) {
    console.warn("Unable to save the selected Atlas country.", error);
  }
  renderEdit();
});

regionSelect.addEventListener("change", () => {
  countrySelect.value = "";
  try {
    localStorage.removeItem("lg-atlas-country");
  } catch (error) {
    console.warn("Unable to clear the saved Atlas country.", error);
  }
  renderEdit();
});

fetch("/data/partners.json")
  .then(response => {
    if (!response.ok) throw new Error(`Could not load approved designer profiles (${response.status}).`);
    return response.json();
  })
  .then(data => {
    atlasPartners = Array.isArray(data.partners) ? data.partners : [];
    setStartingPoint();
    renderEdit();
  })
  .catch(error => {
    console.error("The Legacies Atlas could not load its designer profiles.", error);
    atlasPartners = [];
    setStartingPoint();
    renderEdit();
  });

let promptDismissed = false;
try {
  promptDismissed = sessionStorage.getItem("lg-atlas-prompt-dismissed") === "true";
} catch (error) {
  console.warn("Unable to read Atlas prompt preference.", error);
}

const promptObserver = new IntersectionObserver(entries => {
  if (!promptDismissed && entries.some(entry => entry.isIntersecting)) prompt.hidden = false;
});
promptObserver.observe(document.getElementById("atlasScrollSentinel"));

promptClose.addEventListener("click", () => {
  promptDismissed = true;
  prompt.hidden = true;
  try {
    sessionStorage.setItem("lg-atlas-prompt-dismissed", "true");
  } catch (error) {
    console.warn("Unable to save Atlas prompt preference.", error);
  }
});

exploreOther.addEventListener("click", () => {
  prompt.hidden = true;
  regionSelect.focus();
  regionSelect.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
});
