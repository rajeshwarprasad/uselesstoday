// Shared client behaviour, loaded site-wide from Layout so the "Surprise me"
// CTA, the time-wasted counter, and the keyboard shortcuts work on every page
// (home + Privacy/Terms/About/Contact), not just where the wall is rendered.
// The browsable wall's search + category filter stays local to Directory.astro.
import { LINKS } from "../data/links";

// ── time-wasted counter (localStorage, per-day) ───────────────────────
const COUNT_KEY = "ut_clicks";
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
function readCount(): number {
  try {
    const raw = JSON.parse(localStorage.getItem(COUNT_KEY) || "{}");
    return raw.day === todayKey() ? Number(raw.n) || 0 : 0;
  } catch {
    return 0;
  }
}
function renderCount() {
  const n = readCount();
  document.querySelectorAll<HTMLElement>("[data-counter]").forEach((el) => {
    el.textContent = String(n);
  });
}
function bumpCount() {
  const n = readCount() + 1;
  try {
    localStorage.setItem(COUNT_KEY, JSON.stringify({ day: todayKey(), n }));
  } catch {}
  renderCount();
}
renderCount();

// any link flagged as a "useless click" bumps the counter
document.querySelectorAll<HTMLAnchorElement>("[data-count-link]").forEach((a) => {
  a.addEventListener("click", bumpCount);
});

// ── surprise me (no-repeat history) ───────────────────────────────────
let recent: number[] = [];
function surprise() {
  if (LINKS.length === 0) return;
  let i = 0;
  let guard = 0;
  do {
    i = Math.floor(Math.random() * LINKS.length);
    guard++;
  } while (recent.includes(i) && guard < 25);
  recent.push(i);
  if (recent.length > Math.min(8, LINKS.length - 1)) recent.shift();
  bumpCount();
  window.open(LINKS[i].url, "_blank", "noopener,noreferrer");
}
document.querySelectorAll<HTMLElement>("[data-surprise]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    surprise();
  });
});

// ── keyboard shortcuts: R/Space = surprise, / = focus search (if present) ──
document.addEventListener("keydown", (e) => {
  const t = e.target as HTMLElement;
  // ignore while typing or when a control is focused (don't double-fire / hijack Space)
  const interactive =
    t &&
    (t.tagName === "INPUT" ||
      t.tagName === "TEXTAREA" ||
      t.tagName === "BUTTON" ||
      t.tagName === "A" ||
      t.isContentEditable);
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "/" && !interactive) {
    const searchEl = document.querySelector<HTMLInputElement>("[data-search]");
    if (searchEl) {
      e.preventDefault();
      searchEl.focus();
    }
  } else if (!interactive && (e.key.toLowerCase() === "r" || e.code === "Space")) {
    e.preventDefault();
    surprise();
  }
});
