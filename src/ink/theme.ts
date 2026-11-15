export type Theme = "light" | "dark";

/** The theme currently rendered: an explicit choice, or the system preference. */
export function getTheme(): Theme {
  const set = document.documentElement.getAttribute("data-theme");
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function otherTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

/** Instantly applies a theme to the live DOM, remembers it, and syncs the toggle's ARIA state. */
export function applyTheme(theme: Theme, toggle?: HTMLButtonElement | null): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  toggle?.setAttribute("aria-pressed", String(theme === "dark"));
}
