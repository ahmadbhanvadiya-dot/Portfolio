"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { InkTransition } from "@/ink/inkTransition";
import { getTheme, type Theme } from "@/ink/theme";

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  mq.addEventListener("change", cb);
  return () => {
    obs.disconnect();
    mq.removeEventListener("change", cb);
  };
}

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export default function ThemeToggle() {
  // null on the server so the first client render matches the HTML.
  const theme = useSyncExternalStore<Theme | null>(subscribe, getTheme, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inkRef = useRef<InkTransition | null>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    let cancelled = false;
    let ink: InkTransition | null = null;
    const canvas = document.createElement("canvas");
    canvas.className = "ink-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("data-html2canvas-ignore", "");
    document.body.append(canvas);

    // The transition code (and its WebGL setup) loads after first paint.
    void import("@/ink/inkTransition").then(({ InkTransition }) => {
      if (cancelled) return;
      // ?gl=0 forces the CSS fallback (what browsers without WebGL2 get).
      const webgl = new URLSearchParams(location.search).get("gl") !== "0";
      ink = new InkTransition(canvas, button, { webgl });
      inkRef.current = ink;
      button.dataset.ready = "";
      if (process.env.NODE_ENV !== "production") {
        Object.assign(window, { __ink: ink });
        void import("@/ink/capture").then((m) => Object.assign(window, { __inkCapture: m }));
      }
    });

    return () => {
      cancelled = true;
      ink?.dispose();
      canvas.remove();
      inkRef.current = null;
    };
  }, []);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const ink = inkRef.current;
    if (!ink) {
      // Not loaded yet: switch plainly rather than ignore the click.
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* storage unavailable */
      }
      return;
    }
    // detail === 0 means a keyboard-activated click (Enter/Space): spread from the button.
    ink.toggle(e.detail === 0 ? undefined : { x: e.clientX, y: e.clientY });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      data-ink-live
      aria-label={theme ? `Switch to ${next} theme` : "Toggle theme"}
      className="theme-toggle press grid size-11 place-items-center rounded-[4px] text-graphite hover:bg-surface hover:text-ink"
    >
      <svg className="ink-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
        <path className="ink-icon__body" d="M7.4 12a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0z" />
        <g className="ink-icon__rays">
          {/* The angle lives on the group so the animated transform on each line stays free. */}
          {RAY_ANGLES.map((a) => (
            <g key={a} transform={`rotate(${a} 12 12)`}>
              <line x1="12" y1="2.6" x2="12" y2="4.4" />
            </g>
          ))}
        </g>
      </svg>
    </button>
  );
}
