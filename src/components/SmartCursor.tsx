"use client";

import { useEffect, useRef } from "react";

/**
 * Context cursor and magnetic controls (mouse only).
 *
 * The native cursor stays. A small label joins it only where it tells you something the
 * pointer alone cannot: "Drag" over a live-site preview or a project node, "Open" over a
 * project, "Write" over the email address. It follows on a light spring and scales in from
 * 0.6 (never 0), 160ms in, 120ms out. Targets declare `data-cursor`; a link or button inside
 * a labelled area that has no label of its own hides it, so controls never get the wrong
 * one.
 *
 * Magnetic controls (`data-magnetic`) lean toward the pointer within a small field, up to
 * 8px, and settle back when it leaves. They use the `translate` property so the press scale
 * (`transform`) still composes. Off on touch and under reduced motion.
 */
export default function SmartCursor() {
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const label = labelRef.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!label || !fine.matches) return;

    let x = -100;
    let y = -100;
    let lx = -100;
    let ly = -100;
    let raf = 0;
    let text = "";
    let magnet: HTMLElement | null = null;

    const render = () => {
      raf = 0;
      const k = reduced.matches ? 1 : 0.32; // spring-ish follow, per frame
      lx += (x - lx) * k;
      ly += (y - ly) * k;
      label.style.transform = `translate3d(${(lx + 16).toFixed(1)}px, ${(ly + 18).toFixed(1)}px, 0)`;
      if (Math.abs(x - lx) > 0.2 || Math.abs(y - ly) > 0.2) raf = requestAnimationFrame(render);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const labelFor = (target: Element | null): string => {
      const area = target?.closest<HTMLElement>("[data-cursor]");
      if (!area) return "";
      const control = target?.closest("a, button");
      // A control inside a labelled area speaks for itself unless it is the labelled element.
      if (control && control !== area && area.contains(control) && !control.hasAttribute("data-cursor")) return "";
      return area.dataset.cursor ?? "";
    };

    const release = (el: HTMLElement) => {
      el.removeAttribute("data-pulling");
      el.style.translate = "";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (lx < -50) {
        lx = x;
        ly = y;
      }
      const next = labelFor(e.target as Element);
      if (next !== text) {
        text = next;
        if (next) label.firstElementChild!.textContent = next;
        label.toggleAttribute("data-on", Boolean(next));
      }
      kick();

      // Magnetic: the nearest control within its field leans toward the pointer.
      if (reduced.matches) return;
      const candidate = (e.target as Element).closest<HTMLElement>("[data-magnetic]");
      if (magnet && magnet !== candidate) release(magnet);
      magnet = candidate;
      if (candidate) {
        const r = candidate.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = Math.max(-8, Math.min(8, (x - cx) * 0.18));
        const dy = Math.max(-6, Math.min(6, (y - cy) * 0.28));
        candidate.setAttribute("data-pulling", "");
        candidate.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
      }
    };
    const onLeave = () => {
      text = "";
      label.removeAttribute("data-on");
      if (magnet) release(magnet);
      magnet = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (magnet) release(magnet);
    };
  }, []);

  return (
    <div ref={labelRef} className="smart-cursor" aria-hidden="true" data-html2canvas-ignore="">
      <span className="smart-cursor__label" />
    </div>
  );
}
