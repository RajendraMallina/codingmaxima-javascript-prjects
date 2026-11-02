# Public API practice projects

These five projects use public browser requests. Open a project from the gallery and use the browser's Network tab to see the request URL, HTTP status, and JSON response. No API key or backend is needed for these examples. An internet connection is required for the API results.

## 1. Country Explorer

Search for a full or partial country name. The `/name/{name}` endpoint returns matching records; opening a result displays its nested languages, currencies, population, and other details. The last five viewed countries are stored in this browser. Selecting a recent item looks it up by its country code using `/alpha/{code}`. A missing country or a failed request produces a message.

Practice tracing: form submission → URL encoding → `fetch` → JSON array → result selection → browser storage. See [countries.dev documentation](https://countries.dev/docs).

## 2. GitHub Profile Explorer

Enter a username such as `octocat`. One request loads the public profile and another loads repositories. Repository-name search uses GitHub's repository search endpoint, while Previous and Next request another page. Sorting by name applies to the current page; recently updated is the API order. Opening details sends a further request for that repository.

GitHub limits unauthenticated requests, and repository search can have additional limits. The page displays a message when access is restricted or a rate limit is reached. See [GitHub's rate-limit documentation](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

## 3. Weather Dashboard

Search for a city and choose a specific location from the matching results. The geocoding API supplies its coordinates, and the forecast API uses those coordinates to return current weather and a seven-day forecast. Similar city names can therefore refer to different places. Forecast values and dates use the selected location's time zone.

Practice tracing two related requests and handling a missing location, an unavailable forecast, and a later search that finishes before an earlier one. See [Open-Meteo geocoding](https://open-meteo.com/en/docs/geocoding-api) and [forecast documentation](https://open-meteo.com/en/docs). The provider's free public service is intended for non-commercial use; check its current terms for other uses.

## 4. Currency Converter

The currency list comes from Frankfurter. Enter a non-negative amount, select a pair, and optionally choose a historical date. The result is `amount × rate`; the displayed date is the date returned by the API. If the currencies are the same, the rate is 1 without requesting an exchange rate. Some pairs or dates may have no available rate.

These are reference rates, not live trading prices. See [Frankfurter documentation](https://frankfurter.dev/).

## 5. Book Discovery

Search Open Library by title or author and move between pages. Results can omit a cover, author, or year. Each Open Library link leads to a catalog record; it does not promise a free full text. Searches are made when the form is submitted, and repeated searches within the same page session use an in-memory cache.

“Add to reading list” adds a book to the existing Personal Reading Tracker with status **Want to read**. Existing entries are retained, duplicates are detected, and invalid stored data is not overwritten. Both projects must be opened on the same browser origin (the same scheme, host, and port), because browser storage is isolated by origin. Thus an Angular shelf and a React shelf on different local ports are separate.

See the [Open Library Search API](https://openlibrary.org/dev/docs/api/search) and its [usage guidelines](https://openlibrary.org/developers/api).

## Concepts to look for

- `fetch` is asynchronous. A response can arrive after a newer request, so request counters prevent older results from replacing newer ones.
- Check `response.ok` or the HTTP status before reading successful data. Network failures and empty results are separate cases.
- Query parameters and path segments need URL encoding; the projects use `URLSearchParams` and `encodeURIComponent`.
- APIs can omit fields. The UI displays a fallback rather than assuming every value exists.
- Angular signals, React state, and JavaScript DOM updates each render the same user-facing workflows using the conventions of their collection.
