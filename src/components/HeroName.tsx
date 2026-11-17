"use client";

import { useEffect, useRef } from "react";

const FIRST = "AHMAD";

// Resting width on the Anybody wdth axis (50–150): condensed, so the word can be set as
// large as the column allows (see .hn-line--first).
const REST = 72;
// How far a letter right under the cursor opens; each line's total opening is still capped
// to the room left in the column.
const WIDE = { first: 128, last: 92 } as const;
const RADIUS = 210; // px of influence around the cursor

/**
 * The name as the opening image: AHMAD across the column, printed in two inks. Nothing
 * else shares its row. (The line machinery below also handles a second line, unused now.)
 *
 * - Cursor-reactive type: every letter widens along Anybody's width axis as the cursor
 *   comes near (a gaussian falloff), and relaxes back as it leaves. Smoothed per letter.
 * - Misregistration: the ultramarine plate sits a few pixels off the ink plate and drifts
 *   with the cursor, like a press slightly out of register; the two inks overprint.
 * - Entrance: letters open from condensed to their resting width, staggered, once.
 *
 * Direct style writes in a rAF that runs only while something is moving; nothing
 * re-renders. Touch: entrance only, plates fixed in a slight offset. Reduced motion: no
 * entrance, no reaction. Screen readers get the name once (the plates are aria-hidden).
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
    const blues = Array.from(root.querySelectorAll<HTMLElement>(".hn-plate--blue"));
    const n = inkChars.length;
    const line = inkChars.map((c) => (c.closest<HTMLElement>("[data-line]")?.dataset.line === "last" ? "last" : "first"));
    const base = Float32Array.from(line, () => REST);
    const wide = Float32Array.from(line, (l) => WIDE[l]);
    const current = reduced ? Float32Array.from(base) : new Float32Array(n).fill(50);
    let centers: { x: number; y: number }[] = [];
    // Width budget per line: the px between the resting line's end and the column edge. The
    // letters' combined growth is held inside it every frame, so a line never passes the
    // column. Measured only while the letters rest; until then a line does not open at all.
    const lineIdx = { first: [] as number[], last: [] as number[] };
    line.forEach((l, i) => lineIdx[l].push(i));
    const spare = { first: 0, last: 0 };
    // Each letter's growth in px per unit of wdth, measured on the real glyph (it varies a
    // lot: V opens three times faster than the full stop).
    const pxPerUnit = new Float32Array(n);
    const prev = new Float32Array(n);
    let budgetStale = true;
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
    const offset = (x: number, y: number) => {
      const t = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      for (const b of blues) b.style.transform = t;
    };
    const measure = () => {
      centers = inkChars.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 + window.scrollY };
      });
      budgetStale = true;
    };
    const measureBudgets = () => {
      const column = root.getBoundingClientRect();
      // Sample each glyph a little open and fully open, and keep the steeper slope (growth is
      // not linear for every letter). Synchronous, restored before anything paints.
      for (let i = 0; i < n; i++) {
        const c = inkChars[i];
        const w = (v: number) => {
          c.style.fontVariationSettings = `"wdth" ${v}`;
          return c.getBoundingClientRect().width;
        };
        const span = wide[i] - base[i];
        const w0 = w(base[i]);
        const near = (w(base[i] + 4) - w0) / 4;
        const full = (w(wide[i]) - w0) / span;
        pxPerUnit[i] = Math.max(near, full, 0);
        set(i, current[i]);
      }
      for (const l of ["first", "last"] as const) {
        const idx = lineIdx[l];
        if (!idx.length) continue;
        const end = inkChars[idx[idx.length - 1]].getBoundingClientRect().right;
        // 0.7: a line opens ~20% more than its glyphs' summed growth (spacing between the
        // glyphs moves too); tested across cursor sweeps, the line ends ≥6px inside.
        spare[l] = Math.max(0, column.right - end) * 0.7;
      }
      budgetStale = false;
    };

    const frame = (now: number) => {
      raf = 0;
      let busy = false;
      const t = (now - born) / 1000;
      for (let i = 0; i < n; i++) {
        let goal = base[i];
        if (fine && centers[i]) {
          const dx = px - centers[i].x;
          const dy = py + window.scrollY - centers[i].y;
          goal = base[i] + (wide[i] - base[i]) * Math.exp(-(dx * dx + dy * dy) / (2 * RADIUS * RADIUS));
        }
        // Entrance: each letter released 45ms after the previous.
        const target = t > 0.15 + i * 0.045 ? goal : 50;
        prev[i] = current[i];
        const next = current[i] + (target - current[i]) * 0.16;
        current[i] = Math.abs(target - next) < 0.05 ? target : next;
      }
      // Keep each line inside the column: if its letters' combined growth would pass the
      // spare width, scale every opening letter back by the same share.
      for (const l of ["first", "last"] as const) {
        let grown = 0;
        for (const i of lineIdx[l]) {
          if (current[i] > base[i]) grown += pxPerUnit[i] * (current[i] - base[i]);
        }
        if (grown > spare[l]) {
          const k = spare[l] / grown;
          for (const i of lineIdx[l]) {
            if (current[i] > base[i]) current[i] = base[i] + (current[i] - base[i]) * k;
          }
        }
      }
      for (let i = 0; i < n; i++) {
        // Settled (or held at the budget): stop asking for frames.
        if (Math.abs(current[i] - prev[i]) > 0.05) busy = true;
        set(i, current[i]);
      }
      mx += (tmx - mx) * 0.1;
      my += (tmy - my) * 0.1;
      if (Math.abs(tmx - mx) > 0.05 || Math.abs(tmy - my) > 0.05) busy = true;
      offset(6 + mx, 4 + my);
      // Letters at rest after the entrance or a resize: measure how far each line may open.
      if (budgetStale && t > 1.2 && current.every((w, i) => Math.abs(w - base[i]) < 0.1)) measureBudgets();
      if (busy || t < 1.2) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      for (let i = 0; i < n; i++) set(i, base[i]);
      offset(6, 4);
      return;
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      const r = root.getBoundingClientRect();
      // Off screen there is nothing to react: let the loop rest.
      if (r.bottom < 0) return;
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

  const chars = (text: string) =>
    Array.from(text).map((ch, i) => (
      <span key={i} className="hn-ch">
        {ch}
      </span>
    ));
  // One line in two inks: the ink plate in flow, the blue plate overprinting it.
  const nameLine = (text: string, which: "first" | "last") => (
    <span className={`hn-line hn-line--${which}`} data-line={which} aria-hidden="true">
      <span className="hn-plate hn-plate--ink">{chars(text)}</span>
      <span className="hn-plate hn-plate--blue">{chars(text)}</span>
    </span>
  );

  return (
    <div ref={ref} className="hero-name">
      <h1 className="sr-only">Ahmad Bhanvadiya</h1>
      <div className="hn-grid">
        {nameLine(FIRST, "first")}
      </div>
    </div>
  );
}
