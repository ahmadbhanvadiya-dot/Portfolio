"use client";

import { useEffect } from "react";

/**
 * The page's one scroll gesture: when a section first comes into view its hairline draws
 * across and its title settles. Marks `[data-scroll]` elements with `.in-view`, once.
 * Content is visible without script (the hidden state needs `html.js`), and reduced motion
 * collapses the transition to nothing.
 */
export default function ScrollMotion() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-scroll]");
    // Which way the reader is travelling: reveals open from the edge they arrive at.
    let lastY = window.scrollY;
    let dir: "up" | "down" = "down";
    const onScroll = () => {
      const y = window.scrollY;
      if (y !== lastY) dir = y < lastY ? "up" : "down";
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => {
        // Items arriving together are staggered (60ms apart) so they read as one cascade.
        let n = 0;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.style.setProperty("--sd", `${n++ * 60}ms`);
          if (el.dataset.enter !== dir) {
            // Swap the hidden state first (it has no transition), then reveal from it.
            el.dataset.enter = dir;
            void el.offsetWidth;
          }
          el.classList.add("in-view");
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}
