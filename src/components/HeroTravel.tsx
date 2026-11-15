"use client";

import { useEffect } from "react";

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Hero → navigation continuity, driven directly by scroll position (no duration).
 *
 * The hero's "Ahmad Bhanvadiya." is one element that travels into the bar: as the page
 * scrolls, it scales down, slides left and rises faster than the page, arriving at the
 * bar's name slot at the same moment its untransformed position would reach the bar. The
 * last 8% of the travel hands it to the bar's own name, which is set in the same text, so
 * the swap is a crossfade between two copies of one word at the same size and place.
 *
 * Transform and opacity only, written straight to the two elements in a rAF (no React
 * state per scroll). Smoothstep at both ends, so it neither starts nor stops with a jolt.
 * Re-measured on resize and font load. Reduced motion: no travel; the bar's name fades
 * in once the hero's name has scrolled under it.
 */
export default function HeroTravel() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero-name]");
    const nav = document.querySelector<HTMLElement>(".nav-name");
    if (!hero || !nav) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let m = { left: 0, docTop: 0, width: 1, height: 1, navLeft: 0, navTop: 0, navWidth: 1, navHeight: 1 };
    let raf = 0;
    let arrived: boolean | null = null;

    const measure = () => {
      hero.style.transform = "";
      const h = hero.getBoundingClientRect();
      const n = nav.getBoundingClientRect();
      m = {
        left: h.left,
        docTop: h.top + window.scrollY,
        width: h.width || 1,
        height: h.height || 1,
        navLeft: n.left,
        navTop: n.top,
        navWidth: n.width || 1,
        navHeight: n.height || 1,
      };
    };

    const update = () => {
      raf = 0;
      // Travel ends when the untransformed name would reach the bar's name slot.
      const end = Math.max(1, m.docTop - m.navTop);
      const p = Math.min(1, Math.max(0, window.scrollY / end));
      const now = p >= 1;
      if (now !== arrived) {
        arrived = now;
        // The bar's look is in the ink snapshots: let them refresh promptly.
        window.dispatchEvent(new CustomEvent("ink:dirty", { detail: { urgent: true } }));
        nav.toggleAttribute("data-in", now);
      }

      if (reduced.matches) {
        hero.style.transform = "";
        hero.style.opacity = "";
        nav.style.opacity = "";
        return;
      }

      const k = smoothstep(0, 1, p);
      const s = 1 + (m.navWidth / m.width - 1) * k;
      const top = m.docTop - window.scrollY; // where the page has the name now
      const navAlignedTop = m.navTop + (m.navHeight - m.height * (m.navWidth / m.width)) / 2;
      const dy = (navAlignedTop - top) * k;
      const dx = (m.navLeft - m.left) * k;
      hero.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
      const hand = smoothstep(0.92, 1, p);
      hero.style.opacity = String(1 - hand);
      nav.style.opacity = String(hand);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    reduced.addEventListener("change", remeasure);
    void document.fonts.ready.then(remeasure);
    // The hero's entrance shifts nothing, but late layout (fonts, images) can.
    const ro = new ResizeObserver(remeasure);
    ro.observe(hero);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      reduced.removeEventListener("change", remeasure);
      ro.disconnect();
      hero.style.transform = "";
      hero.style.opacity = "";
      nav.style.opacity = "";
    };
  }, []);
  return null;
}
