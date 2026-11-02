import '../../src/style.css'
import './practice-labs.css'

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
export function shell(title, icon, kicker, description, content) {
  document.querySelector('#app').innerHTML = `<div class="page lab-page"><a class="skip" href="#project-content">Skip to project</a><header class="header"><a class="brand" href="https://codingmaxima.com/" aria-label="CodingMaxima"><img src="https://codingmaxima.com/assets/img/nlogo.png" alt="CodingMaxima"></a><span class="divider" aria-hidden="true"></span><div class="meta"><small>INDEPENDENT PRACTICE PROJECT</small><strong>${escapeHtml(title)}</strong></div></header><main class="lab-content" id="project-content"><section class="lab-intro"><p class="lab-kicker"><span aria-hidden="true">${escapeHtml(icon)}</span> ${escapeHtml(kicker)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></section>${content}</main><footer class="footer"><span><strong>CodingMaxima</strong> · Learn visually. Think logically. Code confidently.</span><span>INDEPENDENT PROJECT</span></footer></div>`
}
export const empty = (icon, title, message) => `<div class="lab-empty"><span aria-hidden="true">${escapeHtml(icon)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p></div>`
