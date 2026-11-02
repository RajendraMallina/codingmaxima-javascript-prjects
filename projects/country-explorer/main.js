import { shell, escapeHtml as e } from "../practice-shared/lab.js";
import "../practice-shared/api-projects.css";

const key = "codingmaxima.country-recent.v1";
let query = "",
  results = [],
  selected = null,
  recent = [],
  status = "Search for a country to begin.",
  request = 0;
try {
  const saved = JSON.parse(localStorage.getItem(key) || "[]");
  if (Array.isArray(saved))
    recent = saved
      .filter(
        (v) => v && typeof v.name === "string" && typeof v.code === "string",
      )
      .slice(0, 5);
} catch {
  /* History is optional. */
}
function flag(country) {
  try {
    const url = new URL(
      country.flags?.svg || country.flags?.png || country.flag || "",
    );
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}
function render() {
  const details = selected
    ? `<section class="lab-card"><div class="lab-card-body"><div class="lab-card-heading"><div><h2>${e(selected.name)}</h2><p>${e(selected.subregion || selected.region || "Country details")}</p></div>${flag(selected) ? `<img class="api-flag" src="${e(flag(selected))}" alt="">` : ""}</div><div class="api-detail">${[
        ["Capital", selected.capital],
        ["Region", selected.region],
        [
          "Population",
          typeof selected.population === "number"
            ? selected.population.toLocaleString()
            : "",
        ],
        [
          "Languages",
          selected.languages
            ?.map((x) => x.name)
            .filter(Boolean)
            .join(", "),
        ],
        [
          "Currencies",
          selected.currencies
            ?.map((x) => [x.name, x.code].filter(Boolean).join(" · "))
            .filter(Boolean)
            .join(", "),
        ],
        ["Time zones", selected.timezones?.join(", ")],
      ]
        .map(
          ([label, value]) =>
            `<div><span>${e(label)}</span><strong>${e(value || "Not available")}</strong></div>`,
        )
        .join("")}</div></div></section>`
    : "";
  shell(
    "Country Explorer",
    "◎",
    "PUBLIC APIS · DISCOVERY",
    "Discover countries, explore their details, and return to places you have viewed recently.",
    `<div class="lab-layout"><div class="api-stack"><section class="lab-card"><div class="lab-card-body"><div class="lab-card-heading"><div><h2>Find a country</h2><p>Search by full or partial country name.</p></div><span class="lab-icon" aria-hidden="true">⌕</span></div><form class="lab-form" id="country-form"><div class="lab-field"><label for="country-query">Country name</label><input id="country-query" value="${e(query)}" placeholder="Try India or United" maxlength="100" required></div><button class="lab-button primary">Search countries</button></form></div></section><section class="lab-card"><div class="lab-card-body"><h2 class="api-section-title">Recently viewed</h2><p class="api-note">Saved in this browser.</p><div class="api-chips">${recent.length ? recent.map((item, i) => `<button class="lab-button small" type="button" data-recent="${i}">${e(item.name)}</button>`).join("") : '<p class="api-note">Countries you open will appear here.</p>'}</div></div></section></div><div class="api-stack"><section class="lab-card"><div class="lab-card-body"><h2 class="api-section-title">Search results</h2><p class="api-status" role="status" aria-live="polite">${e(status)}</p><div class="api-results">${results.map((country, i) => `<article class="api-result"><div class="api-title">${flag(country) ? `<img class="api-flag" src="${e(flag(country))}" alt="">` : ""}<div><h3>${e(country.name)}</h3><p>${e(country.capital || "Capital unavailable")} · ${e(country.region || "Region unavailable")}</p></div></div><button class="lab-button small" type="button" data-detail="${i}">View details</button></article>`).join("")}</div></div></section>${details}<p class="api-note">Country data from <a class="api-source" href="https://countries.dev/" target="_blank" rel="noopener noreferrer">countries.dev ↗</a></p></div></div>`,
  );
  document
    .querySelector("#country-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      query = document.querySelector("#country-query").value.trim();
      if (!query) {
        status = "Enter a country name.";
        render();
        return;
      }
      void load("name/" + encodeURIComponent(query));
    });
  document
    .querySelectorAll("[data-detail]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        show(results[Number(button.dataset.detail)]),
      ),
    );
  document
    .querySelectorAll("[data-recent]")
    .forEach((button) =>
      button.addEventListener(
        "click",
        () =>
          void load(
            "alpha/" +
              encodeURIComponent(recent[Number(button.dataset.recent)].code),
            true,
          ),
      ),
    );
}
function show(country) {
  selected = country;
  if (country.alpha2Code) {
    recent = [
      { name: country.name, code: country.alpha2Code },
      ...recent.filter((item) => item.code !== country.alpha2Code),
    ].slice(0, 5);
    try {
      localStorage.setItem(key, JSON.stringify(recent));
    } catch {
      /* Browsing still works without storage. */
    }
  }
  render();
}
async function load(path, detail = false) {
  const id = ++request;
  status = "Searching countries…";
  results = [];
  selected = null;
  render();
  try {
    const response = await fetch("https://countries.dev/" + path);
    if (response.status === 404)
      throw new Error("No country found. Try another name.");
    if (response.status === 429)
      throw new Error("Too many requests. Please try again later.");
    if (!response.ok)
      throw new Error(
        "Country data is temporarily unavailable. Please try again.",
      );
    const data = await response.json();
    if (id !== request) return;
    results = (Array.isArray(data) ? data : [data]).filter(
      (row) => row && typeof row.name === "string",
    );
    status = results.length
      ? `${results.length} ${results.length === 1 ? "country" : "countries"} found.`
      : "No country found. Try another name.";
    if (detail && results.length) show(results[0]);
    else render();
  } catch (error) {
    if (id === request) {
      status =
        error instanceof Error
          ? error.message
          : "Could not connect. Check your internet and try again.";
      render();
    }
  }
}
render();
