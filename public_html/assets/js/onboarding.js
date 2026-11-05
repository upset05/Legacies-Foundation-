const form = document.getElementById("partnerApplication");
const statusMessage = document.getElementById("applicationStatus");
const startedAt = document.getElementById("startedAt");
const bio = document.getElementById("bio");
const bioCount = document.getElementById("bioCount");
const country = document.getElementById("country");
const city = document.getElementById("city");
const cityHint = document.getElementById("cityHint");
const citySuggestions = document.getElementById("citySuggestions");
const citiesByCountry = new Map();
let activeCityIndex = -1;

if (startedAt) startedAt.value = String(Date.now());

function setFieldError(field, message) {
  const error = document.getElementById(`${field.id}Error`);
  const invalid = Boolean(message);
  field.setAttribute("aria-invalid", String(invalid));
  if (!error) return;
  error.textContent = message || "";
  error.hidden = !invalid;
}

function validateUrl(field) {
  field.setCustomValidity("");
  if (!field.value.trim()) return;
  try {
    const url = new URL(field.value);
    if (!["http:", "https:"].includes(url.protocol)) {
      field.setCustomValidity("Enter a full website address beginning with https://.");
    }
  } catch {
    field.setCustomValidity("Enter a full website address beginning with https://.");
  }
}

function closeCitySuggestions() {
  citySuggestions.hidden = true;
  city.setAttribute("aria-expanded", "false");
  city.removeAttribute("aria-activedescendant");
  activeCityIndex = -1;
}

function chooseCity(name) {
  city.value = name;
  closeCitySuggestions();
  setFieldError(city, city.validationMessage);
}

function renderCitySuggestions() {
  const query = city.value.trim().toLocaleLowerCase();
  citySuggestions.replaceChildren();
  activeCityIndex = -1;

  if (query.length < 2) {
    closeCitySuggestions();
    cityHint.textContent = "Type at least two characters to search. You can enter a city not shown.";
    return;
  }

  const cityNames = citiesByCountry.get(country.selectedOptions[0]?.dataset.countryCode);
  if (!cityNames) {
    closeCitySuggestions();
    return;
  }

  const startsWith = [];
  const contains = [];
  for (const name of cityNames) {
    const normalizedName = name.toLocaleLowerCase();
    if (normalizedName.startsWith(query)) startsWith.push(name);
    else if (normalizedName.includes(query)) contains.push(name);
  }
  const matches = [...startsWith, ...contains].slice(0, 12);

  if (matches.length === 0) {
    closeCitySuggestions();
    cityHint.textContent = "No matching city in the list. You can enter the city name manually.";
    return;
  }

  matches.forEach((name, index) => {
    const option = document.createElement("li");
    option.id = `city-suggestion-${index}`;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.tabIndex = -1;
    option.textContent = name;
    citySuggestions.append(option);
  });
  citySuggestions.hidden = false;
  city.setAttribute("aria-expanded", "true");
  cityHint.textContent = `${matches.length} suggestion${matches.length === 1 ? "" : "s"}. Choose one or enter your city manually.`;
}

async function loadCitiesForCountry() {
  city.value = "";
  closeCitySuggestions();
  setFieldError(city, "");
  const countryCode = country.selectedOptions[0]?.dataset.countryCode;

  if (!countryCode) {
    city.disabled = true;
    city.placeholder = "";
    cityHint.textContent = "Choose a country to search its city list.";
    return;
  }

  city.disabled = false;
  city.placeholder = "Loading city list…";
  cityHint.textContent = "Loading city suggestions…";

  try {
    let names = citiesByCountry.get(countryCode);
    if (!names) {
      const response = await fetch(`/assets/data/cities/${countryCode}.json`);
      if (!response.ok) throw new Error(`City list request failed with status ${response.status}.`);
      names = await response.json();
      if (!Array.isArray(names) || names.some(name => typeof name !== "string")) {
        throw new Error("The city list response has an invalid format.");
      }
      citiesByCountry.set(countryCode, names);
    }

    if (country.selectedOptions[0]?.dataset.countryCode !== countryCode) return;
    city.placeholder = "Start typing a city";
    cityHint.textContent = names.length
      ? "Type to search listed cities. You can also enter a city not shown."
      : "No cities are listed for this country yet. You can enter your city manually.";
  } catch (error) {
    console.error(`Unable to load city suggestions for ${countryCode}.`, error);
    if (country.selectedOptions[0]?.dataset.countryCode !== countryCode) return;
    city.placeholder = "Enter your city";
    cityHint.textContent = "City suggestions could not be loaded. You can still enter your city manually.";
  }
}

if (country && city && cityHint && citySuggestions) {
  country.addEventListener("change", loadCitiesForCountry);
  city.addEventListener("input", renderCitySuggestions);
  city.addEventListener("keydown", event => {
    const options = [...citySuggestions.querySelectorAll('[role="option"]')];
    if (event.key === "ArrowDown" && options.length) {
      event.preventDefault();
      activeCityIndex = (activeCityIndex + 1) % options.length;
    } else if (event.key === "ArrowUp" && options.length) {
      event.preventDefault();
      activeCityIndex = (activeCityIndex - 1 + options.length) % options.length;
    } else if (event.key === "Enter" && activeCityIndex >= 0) {
      event.preventDefault();
      chooseCity(options[activeCityIndex].textContent);
      return;
    } else if (event.key === "Escape") {
      closeCitySuggestions();
      return;
    } else {
      return;
    }

    options.forEach((option, index) => option.setAttribute("aria-selected", String(index === activeCityIndex)));
    city.setAttribute("aria-activedescendant", options[activeCityIndex].id);
  });
  citySuggestions.addEventListener("mousedown", event => event.preventDefault());
  citySuggestions.addEventListener("click", event => {
    const option = event.target.closest('[role="option"]');
    if (option) chooseCity(option.textContent);
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".city-field")) closeCitySuggestions();
  });
}

if (bio && bioCount) {
  const updateCount = () => { bioCount.textContent = `${bio.value.length} of 800 characters`; };
  bio.addEventListener("input", updateCount);
  updateCount();
}

if (form && statusMessage) {
  const fields = [...form.querySelectorAll("input, select, textarea")]
    .filter(field => !["companyWebsite", "startedAt"].includes(field.name));

  fields.forEach(field => {
    field.addEventListener("input", () => {
      if (field.type === "url") validateUrl(field);
      setFieldError(field, field.validationMessage);
    });
    field.addEventListener("change", () => {
      if (field.type === "url") validateUrl(field);
      setFieldError(field, field.validationMessage);
    });
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    statusMessage.textContent = "";
    fields.filter(field => field.type === "url").forEach(validateUrl);
    const valid = fields.every(field => {
      setFieldError(field, field.validationMessage);
      return field.checkValidity();
    });
    if (!valid) {
      form.reportValidity();
      fields.find(field => !field.checkValidity())?.focus();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Submitting…";
    statusMessage.textContent = "Submitting your application.";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || "Your application could not be sent.");
      window.location.assign("/onboarding/thank-you");
    } catch (error) {
      statusMessage.textContent = `${error.message} Please email `;
      const emailLink = document.createElement("a");
      emailLink.href = "mailto:legacies@legacies.global";
      emailLink.textContent = "legacies@legacies.global";
      statusMessage.append(emailLink, " if you need help.");
      submitButton.disabled = false;
      submitButton.textContent = "Submit application";
    }
  });
}
