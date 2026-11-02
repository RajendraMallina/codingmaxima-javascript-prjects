import { shell, escapeHtml as e } from "../practice-shared/lab.js";
import { seedReading } from "../practice-shared/reading-catalog.js";
import { isReading, studioKeys } from "../practice-shared/studio-data.js";
import "../practice-shared/api-projects.css";
let query = "",
  type = "title",
  books = [],
  status = "Search for a title or author to begin.",
  shelfStatus = "",
  page = 1,
  total = 0,
  request = 0,
  active = { query: "", type: "title" };
const cache = new Map();
const author = (book) =>
    book.author_name?.filter((name) => typeof name === "string").join(", ") ||
    "Unknown author",
  url = (book) =>
    /^\/works\/OL\d+W$/.test(book.key)
      ? "https://openlibrary.org" + book.key
      : "",
  cover = (book) =>
    typeof book.cover_i === "number" &&
    Number.isSafeInteger(book.cover_i) &&
    book.cover_i > 0
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : "";
function render() {
  shell(
    "Book Discovery",
    "▤",
    "PUBLIC APIS · BOOKS",
    "Discover books by title or author and add interesting finds to your reading library.",
    `<div class="lab-layout"><section class="lab-card"><div class="lab-card-body"><div class="lab-card-heading"><div><h2>Find a book</h2><p>Search Open Library's book catalog.</p></div><span class="lab-icon" aria-hidden="true">⌕</span></div><form class="lab-form" id="book-form"><div class="lab-field"><label for="book-type">Search by</label><select id="book-type"><option value="title" ${type === "title" ? "selected" : ""}>Title</option><option value="author" ${type === "author" ? "selected" : ""}>Author</option></select></div><div class="lab-field"><label for="book-query">Search terms</label><input id="book-query" value="${e(query)}" placeholder="Try Pride and Prejudice" maxlength="150" required></div><button class="lab-button primary">Search books</button></form><p class="api-note api-subtitle">Search results are catalog records; a free full text is not available for every book.</p><p class="api-note"><a href="/projects/reading-tracker/" class="api-source">Open Personal Reading Tracker →</a></p></div></section><div class="api-stack"><section class="lab-card"><div class="lab-card-body"><h2 class="api-section-title">Search results</h2><p class="api-status" role="status" aria-live="polite">${e(status)}</p><p class="api-status" role="status" aria-live="polite">${e(shelfStatus)}</p><div class="api-results">${books.map((book, i) => `<article class="api-result"><div class="api-title">${cover(book) ? `<img class="api-cover" src="${e(cover(book))}" alt="" loading="lazy">` : ""}<div><h3>${e(book.title)}</h3><p>${e(author(book))} · ${e(book.first_publish_year || "Year unavailable")}</p>${url(book) ? `<a class="api-source" href="${e(url(book))}" target="_blank" rel="noopener noreferrer">View on Open Library ↗</a>` : ""}</div></div><button class="lab-button small" type="button" data-add="${i}">Add to reading list</button></article>`).join("")}</div>${total > 10 ? `<div class="api-pager"><button class="lab-button small" id="previous" type="button" ${page <= 1 ? "disabled" : ""}>Previous</button><span>Page ${page} of ${Math.ceil(total / 10)}</span><button class="lab-button small" id="next" type="button" ${page * 10 >= total ? "disabled" : ""}>Next</button></div>` : ""}</div></section><p class="api-note">Book data from <a class="api-source" href="https://openlibrary.org/" target="_blank" rel="noopener noreferrer">Open Library ↗</a></p></div></div>`,
  );
  document.querySelector("#book-form").addEventListener("submit", (event) => {
    event.preventDefault();
    query = document.querySelector("#book-query").value.trim();
    type = document.querySelector("#book-type").value;
    if (!query) {
      status = "Enter a title or author.";
      render();
      return;
    }
    active = { query, type };
    void load(1);
  });
  document
    .querySelectorAll("[data-add]")
    .forEach((b) =>
      b.addEventListener("click", () => add(books[Number(b.dataset.add)])),
    );
  document
    .querySelector("#previous")
    ?.addEventListener("click", () => void load(page - 1));
  document
    .querySelector("#next")
    ?.addEventListener("click", () => void load(page + 1));
}
async function load(next) {
  const id = ++request;
  books = [];
  status = "Searching Open Library…";
  page = next;
  render();
  const params = new URLSearchParams({
      [active.type]: active.query,
      page: String(next),
      limit: "10",
      fields: "key,title,author_name,first_publish_year,cover_i",
    }),
    key = params.toString();
  try {
    let data = cache.get(key);
    if (!data) {
      const response = await fetch(
        "https://openlibrary.org/search.json?" + params,
      );
      if (!response.ok) throw Error();
      data = await response.json();
      if (!Array.isArray(data.docs) || typeof data.numFound !== "number")
        throw Error();
      cache.set(key, data);
    }
    if (id !== request) return;
    books = data.docs.filter(
      (book) =>
        book && typeof book.title === "string" && typeof book.key === "string",
    );
    total = data.numFound;
    status = total
      ? `${total.toLocaleString()} results found.`
      : "No books found. Try another search.";
  } catch {
    if (id !== request) return;
    total = 0;
    status = "Could not load books. Check your connection and try again.";
  }
  render();
}
function add(book) {
  const link = url(book);
  if (!link) {
    shelfStatus =
      "This result cannot be saved because its Open Library link is unavailable.";
    render();
    return;
  }
  try {
    const raw = localStorage.getItem(studioKeys.reading),
      saved = raw === null ? seedReading() : JSON.parse(raw);
    if (!Array.isArray(saved) || !saved.every(isReading)) {
      shelfStatus =
        "Your reading library could not be read, so it was not changed.";
      render();
      return;
    }
    const id = "openlibrary-" + book.key.split("/").pop();
    if (saved.some((item) => item.id === id || item.url === link)) {
      shelfStatus = "This book is already in your reading library.";
      render();
      return;
    }
    const item = {
      id,
      title: book.title.slice(0, 180),
      author: author(book).slice(0, 120),
      type: "Book",
      subject: "Books",
      url: link,
      source: "Open Library",
      status: "Want to read",
      progress: 0,
      notes: "",
    };
    localStorage.setItem(studioKeys.reading, JSON.stringify([item, ...saved]));
    shelfStatus = "Added to your reading library.";
  } catch {
    shelfStatus =
      "Could not save your book. Check that browser storage is available.";
  }
  render();
}
render();
