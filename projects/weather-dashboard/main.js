import { shell, escapeHtml as e } from "../practice-shared/lab.js";
import "../practice-shared/api-projects.css";
let query = "",
  places = [],
  place = null,
  weather = null,
  status = "Search for a city to begin.",
  request = 0;
function label(c) {
  if (c === 0) return "Clear sky";
  if (c === 1 || c === 2) return "Partly cloudy";
  if (c === 3) return "Cloudy";
  if (c === 45 || c === 48) return "Fog";
  if (c >= 51 && c <= 67) return "Rain or drizzle";
  if (c >= 71 && c <= 77) return "Snow";
  if (c >= 80 && c <= 86) return "Showers";
  if (c >= 95) return "Thunderstorm";
  return "Conditions unavailable";
}
function value(n, suffix) {
  return typeof n === "number" && Number.isFinite(n)
    ? `${n}${suffix}`
    : "Not available";
}
function render() {
  const c = weather?.current,
    d = weather?.daily;
  const details = weather
    ? `<p class="api-note">Local time zone: ${e(weather.timezone || "Not available")}</p><div class="api-detail">${[
        ["Current temperature", value(c?.temperature_2m, "°C")],
        ["Conditions", label(c?.weather_code)],
        ["Feels like", value(c?.apparent_temperature, "°C")],
        ["Humidity", value(c?.relative_humidity_2m, "%")],
        ["Wind speed", value(c?.wind_speed_10m, " km/h")],
      ]
        .map(
          ([k, v]) => `<div><span>${e(k)}</span><strong>${e(v)}</strong></div>`,
        )
        .join(
          "",
        )}</div><h2 class="api-section-title api-subtitle">Seven-day forecast</h2><div class="api-results">${(d?.time || []).map((day, i) => `<div class="api-result"><div><h3>${e(day)}</h3><p>${e(label(d.weather_code?.[i]))} · Rain chance ${e(value(d.precipitation_probability_max?.[i], "%"))}</p></div><strong>${e(value(d.temperature_2m_max?.[i], "°"))} / ${e(value(d.temperature_2m_min?.[i], "°"))}</strong></div>`).join("")}</div>`
    : "";
  shell(
    "Weather Dashboard",
    "☀",
    "PUBLIC APIS · WEATHER",
    "Find a city, choose the right location, and explore its current conditions and seven-day forecast.",
    `<div class="lab-layout"><section class="lab-card"><div class="lab-card-body"><div class="lab-card-heading"><div><h2>Find a city</h2><p>Choose a matching location after searching.</p></div><span class="lab-icon" aria-hidden="true">⌕</span></div><form class="lab-form" id="weather-form"><div class="lab-field"><label for="weather-query">City name</label><input id="weather-query" value="${e(query)}" placeholder="Try London" maxlength="100" required></div><button class="lab-button primary">Search locations</button></form><div class="api-results">${places.map((item, i) => `<button type="button" class="lab-button" data-place="${i}">${e(item.name)}${item.admin1 ? ", " + e(item.admin1) : ""}${item.country ? ", " + e(item.country) : ""}</button>`).join("")}</div></div></section><div class="api-stack"><section class="lab-card"><div class="lab-card-body"><h2 class="api-section-title">${e(place?.name || "Your forecast")}${place?.country ? ", " + e(place.country) : ""}</h2><p class="api-status" role="status" aria-live="polite">${e(status)}</p>${details}</div></section><p class="api-note">Weather and location data from <a class="api-source" href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo ↗</a></p></div></div>`,
  );
  document
    .querySelector("#weather-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      query = document.querySelector("#weather-query").value.trim();
      if (query) void search();
      else {
        status = "Enter a city name.";
        render();
      }
    });
  document
    .querySelectorAll("[data-place]")
    .forEach((button) =>
      button.addEventListener(
        "click",
        () => void choose(places[Number(button.dataset.place)]),
      ),
    );
}
async function search() {
  const id = ++request;
  places = [];
  place = null;
  weather = null;
  status = "Searching locations…";
  render();
  try {
    const response = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?" +
        new URLSearchParams({
          name: query,
          count: "10",
          language: "en",
          format: "json",
        }),
    );
    if (!response.ok) throw Error();
    const data = await response.json();
    if (id !== request) return;
    places = (data.results || []).filter(
      (item) =>
        typeof item.latitude === "number" && typeof item.longitude === "number",
    );
    status = places.length
      ? "Choose a location to see its weather."
      : "No matching cities found. Try another name.";
    render();
  } catch {
    if (id === request) {
      status = "Could not load locations. Check your connection and try again.";
      render();
    }
  }
}
async function choose(item) {
  const id = ++request;
  place = item;
  weather = null;
  status = "Loading forecast…";
  render();
  const params = new URLSearchParams({
    latitude: String(item.latitude),
    longitude: String(item.longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
    daily:
      "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7",
  });
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?" + params,
    );
    if (!response.ok) throw Error();
    const data = await response.json();
    if (id !== request) return;
    if (!data.current || !data.daily) throw Error();
    weather = data;
    status = "Forecast loaded.";
    render();
  } catch {
    if (id === request) {
      status = "Could not load the forecast. Choose the location to retry.";
      render();
    }
  }
}
render();
