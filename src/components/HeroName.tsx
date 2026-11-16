"use client";

import { useEffect, useRef } from "react";

const LINES = ["AHMAD", "BHAN", "VADIYA."];
// Resting width on the Anybody wdth axis (50–150). Phones have no cursor to widen the
// letters, so the name rests wide enough to fill the screen there.
const restingWidth = () => (window.matchMedia("(max-width: 640px)").matches ? 104 : 72);
const WIDE = 128; // a letter right under the cursor
const RADIUS = 210; // px of influence

/**
 * The name as the opening image, printed in two inks.
 *
 * - Cursor-reactive type: every letter widens along Anybody's width axis as the cursor
 *   comes near (a gaussian falloff), and relaxes back as it leaves. Smoothed per letter.
 * - Misregistration: the ultramarine plate sits a few pixels off the ink plate and drifts
 *   with the cursor, like a press slightly out of register; the two inks overprint.
 * - Entrance: letters open from condensed to their resting width, staggered, once.
 *
 * Direct style writes in a rAF; nothing re-renders. Touch: entrance only, plates fixed in
 * a slight offset. Reduced motion: no entrance, no reaction; the offset stays as identity.
 * Screen readers get the name once (the plates are aria-hidden).
 */
export default function HeroName() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const inkChars = Array.from(root.querySelectorAll<HTMLElement>(".hn-plate--ink .hn-ch"));
    const blueChars = Array.from(root.querySelectorAll<HTMLElement>(".hn-plate--blue .hn-ch"));
    const blue = root.querySelector<HTMLElement>(".hn-plate--blue");
    const n = inkChars.length;
    const BASE = restingWidth();
    const current = new Float32Array(n).fill(reduced ? BASE : 50);
    const target = new Float32Array(n).fill(BASE);
    let centers: { x: number; y: number }[] = [];
    let px = -1e4;
    let py = -1e4;
    let mx = 0; // misregistration
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    let raf = 0;
    const born = performance.now();

    const set = (i: number, w: number) => {
      const v = `"wdth" ${w.toFixed(1)}`;
      inkChars[i].style.fontVariationSettings = v;
      blueChars[i].style.fontVariationSettings = v;
    };
    const measure = () => {
      centers = inkChars.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 + window.scrollY };
      });
    };

    const frame = (now: number) => {
      raf = 0;
      let busy = false;
      const t = (now - born) / 1000;
      for (let i = 0; i < n; i++) {
        // Entrance: each letter released 45ms after the previous.
        const released = reduced || t > 0.15 + i * 0.045;
        let goal = BASE;
        if (released && fine && centers[i]) {
          const dx = px - centers[i].x;
          const dy = py + window.scrollY - centers[i].y;
          goal = BASE + (WIDE - BASE) * Math.exp(-(dx * dx + dy * dy) / (2 * RADIUS * RADIUS));
        }
        target[i] = released ? goal : 50;
        const next = current[i] + (target[i] - current[i]) * 0.16;
        if (Math.abs(next - current[i]) > 0.05) busy = true;
        current[i] = Math.abs(target[i] - next) < 0.05 ? target[i] : next;
        set(i, current[i]);
      }
      mx += (tmx - mx) * 0.1;
      my += (tmy - my) * 0.1;
      if (Math.abs(tmx - mx) > 0.05 || Math.abs(tmy - my) > 0.05) busy = true;
      if (blue) blue.style.transform = `translate3d(${(6 + mx).toFixed(2)}px, ${(4 + my).toFixed(2)}px, 0)`;
      if (busy || t < 1.2) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      const r = root.getBoundingClientRect();
      // The blue plate drifts away from the cursor, up to ±10px.
      tmx = Math.max(-10, Math.min(10, ((r.left + r.width / 2 - px) / r.width) * 16));
      tmy = Math.max(-8, Math.min(8, ((r.top + r.height / 2 - py) / r.height) * 12));
      kick();
    };
    const onLeave = () => {
      px = py = -1e4;
      tmx = tmy = 0;
      kick();
    };

    measure();
    if (reduced) {
      for (let i = 0; i < n; i++) set(i, BASE);
      if (blue) blue.style.transform = "translate3d(6px, 4px, 0)";
      return;
    }
    kick();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(() => {
      measure();
      kick();
    });
    ro.observe(root);
    void document.fonts.ready.then(measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
    };
  }, []);

  const plate = (kind: "ink" | "blue") => (
    <span className={`hn-plate hn-plate--${kind}`} aria-hidden="true">
      {LINES.map((line) => (
        <span key={line} className="hn-line">
          {Array.from(line).map((ch, i) => (
            <span key={i} className="hn-ch">
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );

  return (
    <div ref={ref} className="hero-name">
      <h1 className="sr-only">Ahmad Bhanvadiya</h1>
      {/* Ink plate in flow; the blue plate overprints it, slightly out of register. */}
      {plate("ink")}
      {plate("blue")}
    </div>
  );
}
