import { shell, escapeHtml as e } from "../practice-shared/lab.js";
import "../practice-shared/api-projects.css";
let currencies = [],
  amount = "100",
  base = "USD",
  quote = "EUR",
  date = "",
  result = null,
  status = "Loading currencies…",
  request = 0;
const number = (n) => n.toLocaleString(undefined, { maximumFractionDigits: 4 });
function render() {
  const options = (current) =>
    currencies
      .map(
        (c) =>
          `<option value="${e(c.iso_code)}" ${c.iso_code === current ? "selected" : ""}>${e(c.iso_code)} · ${e(c.name)}</option>`,
      )
      .join("");
  shell(
    "Currency Converter",
    "↔",
    "PUBLIC APIS · CURRENCY",
    "Convert an amount with the latest available rate, or select a date to explore historical rates.",
    `<div class="lab-layout"><section class="lab-card"><div class="lab-card-body"><div class="lab-card-heading"><div><h2>Convert currencies</h2><p>Rates are reference rates, not live trading prices.</p></div><span class="lab-icon" aria-hidden="true">↔</span></div><form class="lab-form" id="currency-form"><div class="lab-field"><label for="currency-amount">Amount</label><input id="currency-amount" type="number" min="0" step="any" value="${e(amount)}" required></div><div class="lab-fields"><div class="lab-field"><label for="currency-base">From</label><select id="currency-base">${options(base)}</select></div><div class="lab-field"><label for="currency-quote">To</label><select id="currency-quote">${options(quote)}</select></div></div><button type="button" class="lab-button" id="currency-swap">⇄ Swap currencies</button><div class="lab-field"><label for="currency-date">Historical date (optional)</label><input id="currency-date" type="date" value="${e(date)}"></div><button class="lab-button primary" ${currencies.length ? "" : "disabled"}>Convert</button>${currencies.length ? "" : '<button class="lab-button" type="button" id="currency-retry">Retry currencies</button>'}</form></div></section><div class="api-stack"><section class="lab-card"><div class="lab-card-body"><h2 class="api-section-title">Conversion result</h2><p class="api-status" role="status" aria-live="polite">${e(status)}</p>${result ? `<div class="api-detail"><div><span>Converted amount</span><strong>${e(number(result.amount * result.rate))} ${e(result.quote)}</strong></div><div><span>Exchange rate</span><strong>1 ${e(result.base)} = ${e(number(result.rate))} ${e(result.quote)}</strong></div><div><span>Rate date</span><strong>${e(result.date || "Same currency")}</strong></div></div>` : ""}</div></section><p class="api-note">Rates from <a class="api-source" href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer">Frankfurter ↗</a>. Availability varies by currency and date.</p></div></div>`,
  );
  function capture() {
    amount = document.querySelector("#currency-amount").value;
    base = document.querySelector("#currency-base").value;
    quote = document.querySelector("#currency-quote").value;
    date = document.querySelector("#currency-date").value;
  }
  document
    .querySelector("#currency-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      capture();
      void convert();
    });
  document.querySelector("#currency-swap").addEventListener("click", () => {
    capture();
    [base, quote] = [quote, base];
    result = null;
    render();
  });
  document
    .querySelector("#currency-retry")
    ?.addEventListener("click", () => void loadCurrencies());
}
async function loadCurrencies() {
  status = "Loading currencies…";
  render();
  try {
    const response = await fetch("https://api.frankfurter.dev/v2/currencies");
    if (!response.ok) throw Error();
    const data = await response.json();
    currencies = Array.isArray(data)
      ? data.filter(
          (c) =>
            c && typeof c.iso_code === "string" && typeof c.name === "string",
        )
      : [];
    if (!currencies.length) throw Error();
    status = "Enter an amount and choose currencies.";
  } catch {
    status = "Could not load currencies. Check your connection and retry.";
  }
  render();
}
async function convert() {
  const id = ++request,
    n = Number(amount),
    from = base,
    to = quote,
    when = date;
  result = null;
  if (amount.trim() === "" || !Number.isFinite(n) || n < 0) {
    status = "Enter a non-negative amount.";
    render();
    return;
  }
  if (from === to) {
    result = { amount: n, base: from, quote: to, rate: 1, date: "" };
    status = "Both currencies are the same.";
    render();
    return;
  }
  status = "Loading exchange rate…";
  render();
  try {
    const params = new URLSearchParams({ base: from, quotes: to });
    if (when) params.set("date", when);
    const response = await fetch(
      "https://api.frankfurter.dev/v2/rates?" + params,
    );
    if (!response.ok) throw Error();
    const rows = await response.json();
    if (id !== request) return;
    const row = Array.isArray(rows)
      ? rows.find((x) => x.quote === to)
      : undefined;
    if (
      !row ||
      typeof row.rate !== "number" ||
      !Number.isFinite(row.rate) ||
      !row.date
    ) {
      status = "No rate is available for this currency pair and date.";
    } else {
      result = {
        amount: n,
        base: from,
        quote: to,
        rate: row.rate,
        date: row.date,
      };
      status = when ? "Historical rate" : "Latest available rate";
    }
  } catch {
    if (id !== request) return;
    status = "Could not load a rate. Try another date or try again later.";
  }
  render();
}
void loadCurrencies();
