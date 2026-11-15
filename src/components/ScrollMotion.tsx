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
    const io = new IntersectionObserver(
      (entries) => {
        // Items arriving together are staggered (60ms apart) so they read as one cascade.
        let n = 0;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).style.setProperty("--sd", `${n++ * 60}ms`);
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return null;
}
