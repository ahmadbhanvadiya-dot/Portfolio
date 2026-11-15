"use client";

/** Current year, evaluated in the browser so a static build never shows a stale year. */
export default function Year() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
