import { shell, escapeHtml as e } from "../practice-shared/lab.js";
import "../practice-shared/api-projects.css";
let username = "",
  repoSearch = "",
  sort = "updated",
  profile = null,
  repos = [],
  detail = null,
  page = 1,
  total = 0,
  status = "Search for a public GitHub profile.",
  repoStatus = "",
  request = 0,
  repoRequest = 0,
  activeSearch = "";
async function json(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (response.status === 404)
    throw Error(
      "No profile or repository found. Check the name and try again.",
    );
  if (response.status === 403 || response.status === 429)
    throw Error(
      "GitHub request limit reached or access restricted. Please try again later.",
    );
  if (!response.ok)
    throw Error("GitHub is temporarily unavailable. Please try again.");
  return response.json();
}
function avatar(user) {
  try {
    const url = new URL(user.avatar_url || "");
    return url.protocol === "https:" &&
      url.hostname === "avatars.githubusercontent.com"
      ? url.href
      : "";
  } catch {
    return "";
  }
}
function render() {
  const profileUrl =
    "https://github.com/" + encodeURIComponent(profile?.login || "");
  const card = profile
    ? `<section class="lab-card"><div class="lab-card-body"><div class="api-title">${avatar(profile) ? `<img class="api-avatar" src="${e(avatar(profile))}" alt="">` : ""}<div><h2>${e(profile.name || profile.login)}</h2><p class="api-note">@${e(profile.login)}</p></div></div><p class="api-note api-subtitle">${e(profile.bio || "No bio provided.")}</p><div class="api-detail">${[
        ["Public repositories", profile.public_repos ?? "Not available"],
        ["Followers", profile.followers ?? "Not available"],
        ["Following", profile.following ?? "Not available"],
        ["Location", profile.location || "Not provided"],
      ]
        .map(
          ([k, v]) => `<div><span>${e(k)}</span><strong>${e(v)}</strong></div>`,
        )
        .join(
          "",
        )}</div><p class="api-note api-subtitle"><a class="api-source" href="${e(profileUrl)}" target="_blank" rel="noopener noreferrer">View profile on GitHub ↗</a></p></div></section>`
    : "";
  const rows =
    sort === "name"
      ? [...repos].sort((a, b) => a.name.localeCompare(b.name))
      : repos;
  const repository = profile
    ? `<section class="lab-card"><div class="lab-card-body"><h2 class="api-section-title">Repositories</h2><form class="lab-form" id="github-repo-form"><div class="lab-field"><label for="github-repos">Search repository names</label><input id="github-repos" value="${e(repoSearch)}" placeholder="Search all repositories" maxlength="100"></div><button class="lab-button">Search repositories</button></form><div class="lab-field api-subtitle"><label for="github-sort">Sort this page</label><select id="github-sort"><option value="updated" ${sort === "updated" ? "selected" : ""}>Recently updated</option><option value="name" ${sort === "name" ? "selected" : ""}>Name</option></select></div><p class="api-status api-subtitle" role="status" aria-live="polite">${e(repoStatus)}</p><div class="api-results">${rows.map((repo) => `<article class="api-result"><div><h3>${e(repo.name)}</h3><p>${e(repo.description || "No description provided.")}</p><p>${e(repo.language || "Language unavailable")} · ★ ${e(repo.stargazers_count ?? 0)}</p></div><button class="lab-button small" type="button" data-detail="${e(repo.name)}">View details</button></article>`).join("")}</div><div class="api-pager"><button class="lab-button small" id="previous" type="button" ${page <= 1 ? "disabled" : ""}>Previous</button><span>Page ${page}</span><button class="lab-button small" id="next" type="button" ${page * 10 >= total ? "disabled" : ""}>Next</button></div></div></section>`
    : "";
  const details = detail
    ? `<section class="lab-card"><div class="lab-card-body"><h2 class="api-section-title">${e(detail.name)}</h2><p class="api-note">${e(detail.description || "No description provided.")}</p><div class="api-detail">${[
        ["Language", detail.language || "Not available"],
        ["Stars", detail.stargazers_count ?? 0],
        ["Forks", detail.forks_count ?? 0],
        ["Default branch", detail.default_branch || "Not available"],
        ["Open issues", detail.open_issues_count ?? 0],
        ["Last updated", detail.updated_at || "Not available"],
      ]
        .map(
          ([k, v]) => `<div><span>${e(k)}</span><strong>${e(v)}</strong></div>`,
        )
        .join(
          "",
        )}</div><p class="api-note api-subtitle"><a class="api-source" href="${e(profileUrl + "/" + encodeURIComponent(detail.name))}" target="_blank" rel="noopener noreferrer">View repository on GitHub ↗</a></p></div></section>`
    : "";
  shell(
    "GitHub Profile Explorer",
    "⌘",
    "PUBLIC APIS · DEVELOPERS",
    "Explore a public profile, search repositories, and open repository details.",
    `<div class="lab-layout"><div class="api-stack"><section class="lab-card"><div class="lab-card-body"><div class="lab-card-heading"><div><h2>Find a developer</h2><p>Enter a GitHub username.</p></div><span class="lab-icon" aria-hidden="true">⌕</span></div><form class="lab-form" id="github-profile-form"><div class="lab-field"><label for="github-username">Username</label><input id="github-username" value="${e(username)}" placeholder="Try octocat" maxlength="39" required></div><button class="lab-button primary">Find profile</button></form><p class="api-status api-subtitle" role="status" aria-live="polite">${e(status)}</p></div></section>${card}</div><div class="api-stack">${repository}${details}<p class="api-note">Public data from <a class="api-source" href="https://docs.github.com/en/rest" target="_blank" rel="noopener noreferrer">GitHub REST API ↗</a>. Unauthenticated requests are limited.</p></div></div>`,
  );
  document
    .querySelector("#github-profile-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      username = document.querySelector("#github-username").value.trim();
      void searchProfile();
    });
  document
    .querySelector("#github-repo-form")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      repoSearch = document.querySelector("#github-repos").value;
      activeSearch = repoSearch.trim();
      void loadRepos(1);
    });
  document
    .querySelector("#github-sort")
    ?.addEventListener("change", (event) => {
      repoSearch = document.querySelector("#github-repos").value;
      sort = event.target.value;
      render();
    });
  document
    .querySelectorAll("[data-detail]")
    .forEach((button) =>
      button.addEventListener(
        "click",
        () =>
          void show(repos.find((row) => row.name === button.dataset.detail)),
      ),
    );
  document
    .querySelector("#previous")
    ?.addEventListener("click", () => void loadRepos(page - 1));
  document
    .querySelector("#next")
    ?.addEventListener("click", () => void loadRepos(page + 1));
}
async function searchProfile() {
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) {
    status = "Enter a valid GitHub username.";
    render();
    return;
  }
  const id = ++request;
  repoRequest++;
  profile = null;
  repos = [];
  detail = null;
  repoStatus = "";
  status = "Loading profile…";
  render();
  try {
    const data = await json(
      "https://api.github.com/users/" + encodeURIComponent(username),
    );
    if (id !== request) return;
    if (!data || typeof data.login !== "string")
      throw Error("Profile data is unavailable.");
    profile = data;
    status = "Profile loaded.";
    repoSearch = "";
    activeSearch = "";
    void loadRepos(1);
  } catch (error) {
    if (id === request) {
      status =
        error instanceof Error ? error.message : "Could not connect to GitHub.";
      render();
    }
  }
}
async function loadRepos(next) {
  if (!profile) return;
  const user = profile,
    id = ++repoRequest;
  page = next;
  detail = null;
  repos = [];
  repoStatus = "Loading repositories…";
  render();
  try {
    let url;
    if (activeSearch) {
      const params = new URLSearchParams({
        q: `user:${user.login} ${activeSearch} in:name`,
        per_page: "10",
        page: String(next),
        sort: "updated",
        order: "desc",
      });
      url = "https://api.github.com/search/repositories?" + params;
    } else
      url =
        "https://api.github.com/users/" +
        encodeURIComponent(user.login) +
        "/repos?" +
        new URLSearchParams({
          per_page: "10",
          page: String(next),
          sort: "updated",
          direction: "desc",
        });
    const data = await json(url);
    if (id !== repoRequest) return;
    const rows = Array.isArray(data) ? data : data.items || [];
    repos = rows.filter((row) => row && typeof row.name === "string");
    total = Array.isArray(data)
      ? user.public_repos || 0
      : data.total_count || 0;
    repoStatus = rows.length
      ? "Choose a repository for details."
      : "No repositories found.";
  } catch (error) {
    if (id !== repoRequest) return;
    total = 0;
    repoStatus =
      error instanceof Error ? error.message : "Could not load repositories.";
  }
  render();
}
async function show(repo) {
  if (!profile || !repo) return;
  const id = ++repoRequest;
  detail = null;
  repoStatus = "Loading repository details…";
  render();
  try {
    const data = await json(
      "https://api.github.com/repos/" +
        encodeURIComponent(profile.login) +
        "/" +
        encodeURIComponent(repo.name),
    );
    if (id !== repoRequest) return;
    detail = data;
    repoStatus = "Repository details loaded.";
  } catch (error) {
    if (id !== repoRequest) return;
    repoStatus =
      error instanceof Error
        ? error.message
        : "Could not load repository details.";
  }
  render();
}
render();
