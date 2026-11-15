"use client";

import { useEffect, useRef } from "react";

/**
 * A paragraph that lights up word by word as it is read down the screen: each word goes
 * from graphite to ink as the paragraph travels from the lower part of the screen to the
 * upper third. Words stay lit (it marks reading progress, it does not run backwards).
 * Unlit words are still full-contrast text (graphite passes AA), so nothing is hidden.
 * Direct class writes in a rAF, no React state per scroll. Reduced motion: all lit.
 */
export default function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    const litAll = () => words.forEach((w) => w.setAttribute("data-lit", ""));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      litAll();
      return;
    }
    let lit = 0;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the paragraph's top reaches 85% of the screen, 1 when its bottom reaches 40%.
      const start = vh * 0.85;
      const end = vh * 0.4;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      const target = Math.round(p * words.length);
      for (; lit < target; lit++) words[lit].setAttribute("data-lit", "");
      if (lit >= words.length) window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const parts = text.split(/(\s+)/);
  return (
    <p ref={ref} className={`scroll-words ${className}`}>
      {parts.map((part, i) =>
        /^\s+$/.test(part) ? (
          part
        ) : (
          <span key={i} data-w="">
            {part}
          </span>
        ),
      )}
    </p>
  );
}
