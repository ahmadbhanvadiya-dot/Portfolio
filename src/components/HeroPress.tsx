"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/site";
import { ArrowDown, ArrowUpRight } from "./Icons";
import { CropMarks } from "./print";

/** What each project is, in the fewest true words (from its repository and README). */
const PHRASE: Record<string, string> = {
  smartcommute: "bus-route planners",
  narcolens: "field-test records",
  vitl: "QR health profiles",
  freshlify: "expiry trackers",
  meridian: "restaurant sites",
};
// Where a print leads: the live demo when there is one, else the code.
const hrefOf = (p: Project) => p.live ?? p.github;
const hostOf = (p: Project) => (p.live ? new URL(p.live).host : "github.com");
const nn = (i: number) => String(i + 1).padStart(2, "0");

// Each print's resting pose in the pile: a little off square, like prints dropped on a desk.
const POSE = [
  { x: -6, y: 4, r: -5 },
  { x: 7, y: -5, r: 4 },
  { x: -3, y: 7, r: -2.5 },
  { x: 8, y: 3, r: 6.5 },
  { x: -8, y: -3, r: -7 },
];
const pose = (i: number) => POSE[i % POSE.length];
const SCRAMBLE = "ABCDEFGHJKLMNPRSTUVWXYZ#/+*<>=";
const THROW = 90; // px of drag that sends the top print to the back
const ON_TOP = "translate(0%, 0%) rotate(-1.5deg)"; // matches .press-print[data-on]

/**
 * The Press: the statement and the proof under the name.
 *
 * - Statement: "I build ___ you can open." The blank decodes through scrambled glyphs
 *   into what each project is; the last word is "read" for a project that has no demo.
 * - Proof pile: a print per project, real screenshots where they exist, the project's own
 *   colour where they don't. The current one lies on top; the rest stay scattered beneath.
 *   Fling the top print sideways to send it to the back; click it to open the project.
 * - Tabs with a timer bar drive both. The bar's animation *is* the clock (its end advances
 *   the press), so it pauses with CSS on hover, focus, drag and while off screen.
 *
 * Reduced motion: no clock, no scramble, no toss; prints change in place.
 */
export default function HeroPress() {
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const phraseRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const prevActive = useRef(0);
  const n = projects.length;
  const current = projects[active];

  const go = useCallback((next: number) => setActive(((next % n) + n) % n), [n]);

  // Decode the phrase: glyphs resolve left to right in ~0.5s. Direct text writes, no renders.
  useEffect(() => {
    const el = phraseRef.current;
    if (!el) return;
    const target = PHRASE[projects[active].slug].toUpperCase();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = target;
      return;
    }
    let tick = 0;
    const steps = 16;
    const id = window.setInterval(() => {
      tick++;
      const shown = Math.floor((tick / steps) * target.length);
      el.textContent = Array.from(target, (ch, i) =>
        i < shown || ch === " " || ch === "-" ? ch : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0],
      ).join("");
      if (tick >= steps) {
        el.textContent = target;
        window.clearInterval(id);
      }
    }, 32);
    return () => window.clearInterval(id);
  }, [active]);

  // The print leaving the top is tossed aside and slid under the pile (z drops mid-flight).
  useEffect(() => {
    const from = prevActive.current;
    prevActive.current = active;
    if (from === active) return;
    const card = cardRefs.current[from];
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const p = pose(from);
    const dir = card.dataset.toss === "left" ? -1 : 1;
    // Start from where the print was let go (a fling), else from its place on top.
    const start = card.dataset.from || ON_TOP;
    delete card.dataset.toss;
    delete card.dataset.from;
    card.animate(
      [
        { transform: start, zIndex: 30 },
        { transform: `translate(${dir * 62}%, -6%) rotate(${dir * 14}deg)`, zIndex: 30, offset: 0.42 },
        { transform: `translate(${dir * 62}%, -6%) rotate(${dir * 14}deg)`, zIndex: 0, offset: 0.43 },
        { transform: `translate(${p.x}%, ${p.y}%) rotate(${p.r}deg)`, zIndex: 0 },
      ],
      { duration: 720, easing: "cubic-bezier(0.32, 0.72, 0, 1)" },
    );
  }, [active]);

  // Off screen, the clock stops (the bar's animation pauses, so nothing advances).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) delete root.dataset.idle;
      else root.dataset.idle = "";
    });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // Drag the top print: it follows the pointer and leans; past THROW it is sent to the back.
  const drag = useRef<{ id: number; x0: number; y0: number; dx: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.button !== 0) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, moved: false };
  };
  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.moved) {
      // Vertical first means the reader is scrolling: let the page have it.
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        drag.current = null;
        return;
      }
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      rootRef.current?.setAttribute("data-dragging", "");
    }
    d.dx = dx;
    e.currentTarget.style.transition = "none";
    e.currentTarget.style.transform = `translate(${dx}px, ${dy * 0.25}px) rotate(${dx * 0.04}deg)`;
  };
  const onUp = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const d = drag.current;
    drag.current = null;
    rootRef.current?.removeAttribute("data-dragging");
    if (!d || d.id !== e.pointerId || !d.moved) return;
    const card = e.currentTarget;
    card.style.transition = "";
    // The click that ends a drag is not an open.
    card.addEventListener("click", (ev) => ev.preventDefault(), { capture: true, once: true });
    if (Math.abs(d.dx) > THROW) {
      card.dataset.toss = d.dx < 0 ? "left" : "right";
      card.dataset.from = card.style.transform;
      go(active + 1);
    } else {
      card.style.transform = "";
    }
  };

  return (
    <div ref={rootRef} className="press-block">
      {/* The statement, once, for screen readers; the animated copy is decorative. */}
      <p className="sr-only">
        I build software you can open: {projects.map((p) => `${p.name}, ${PHRASE[p.slug]}`).join("; ")}.
      </p>

      <div className="press-statement" aria-hidden="true">
        <span className="press-line">I build</span>
        <span className="press-line">
          {/* Text written by the decode effect; React only renders the first phrase. */}
          <span className="highlight press-phrase" ref={phraseRef}>
            {PHRASE[projects[0].slug].toUpperCase()}
          </span>
        </span>
        <span className="press-line press-tail">
          you can <span key={current.live ? "open" : "read"} className="press-tail-word">{current.live ? "open" : "read"}</span>.
        </span>
      </div>

      <div className="press-copy">
        <p className="press-intro">
          Computer science student and full-stack developer, working across Next.js, Python and
          Flutter. {n} projects built, {projects.filter((p) => p.live).length} of them live.
        </p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
          <a
            href="#work"
            data-magnetic
            className="press cta group inline-flex h-12 items-center gap-3 rounded-[3px] bg-ink pl-5 pr-4 font-mono text-[13px] uppercase tracking-[0.06em] text-paper"
          >
            Enter the work
            <ArrowDown className="transition-transform duration-150 ease-out group-hover:translate-y-0.5" />
          </a>
          <a href="#contact" data-magnetic className="link-strong -my-3 py-3 font-mono text-[13px] uppercase tracking-[0.06em]">
            Get in touch
          </a>
        </div>
      </div>

      <div className="press-proof">
        <div className="press-pile">
          {projects.map((p, i) => {
            const on = i === active;
            const ps = pose(i);
            // Depth: the current print on top, the others by how recently they were on top.
            const depth = (i - active + n) % n;
            return (
              <a
                key={p.slug}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                href={hrefOf(p)}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={on ? 0 : -1}
                aria-hidden={on ? undefined : true}
                aria-label={on ? `${p.name}: ${p.live ? "open the live site" : "open the code on GitHub"} (new tab)` : undefined}
                data-cursor={on ? "Drag or open" : undefined}
                data-on={on ? "" : undefined}
                draggable={false}
                onPointerDown={on ? onDown : undefined}
                onPointerMove={on ? onMove : undefined}
                onPointerUp={on ? onUp : undefined}
                onPointerCancel={on ? onUp : undefined}
                className="press-print"
                style={{
                  ["--tone" as string]: p.tone,
                  zIndex: on ? 20 : 10 - depth,
                  transform: on ? undefined : `translate(${ps.x}%, ${ps.y}%) rotate(${ps.r}deg)`,
                }}
              >
                <CropMarks />
                <span className="press-print__bar">
                  <span className="truncate">{hostOf(p)}</span>
                  <span className="press-print__tag">{p.live ? "Live" : "Code"}</span>
                </span>
                <span className="press-print__face">
                  {p.preview ? (
                    <Image
                      src={p.preview.src}
                      alt=""
                      width={p.preview.width}
                      height={p.preview.height}
                      sizes="(min-width: 1024px) 34vw, 90vw"
                      draggable={false}
                      className="press-print__img"
                    />
                  ) : (
                    <span className="press-print__plate">
                      <span className="press-print__plate-name">{p.name}</span>
                      {p.index && (
                        <span className="press-print__plate-list">
                          {p.index.items.join(" / ")}
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <span className="press-print__foot">
                  <span>
                    {nn(i)} / {p.name}
                  </span>
                  <ArrowUpRight size={12} />
                </span>
              </a>
            );
          })}
        </div>

        <div className="press-tabs" role="group" aria-label="Choose a project">
          {projects.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              aria-pressed={i === active}
              onClick={() => go(i)}
              className="press-tab"
            >
              <span className="press-tab__n">{nn(i)}</span>
              <span className="press-tab__name">{p.name}</span>
              {i === active && (
                <span key={active} className="press-tab__bar" onAnimationEnd={() => go(active + 1)} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
