import { BACKGROUND } from "./params";

export type Theme = "light" | "dark";

/** The theme currently rendered. Dark unless the visitor chose light (set before paint). */
export function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function otherTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

/** Instantly applies a theme to the live DOM, remembers it, and syncs the toggle's ARIA state. */
export function applyTheme(theme: Theme, toggle?: HTMLButtonElement | null): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BACKGROUND[theme]);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  toggle?.setAttribute("aria-pressed", String(theme === "dark"));
}
