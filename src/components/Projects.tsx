"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/site";
import { ArrowUpRight } from "./Icons";
import Section from "./Section";

/** Where a project's name and preview lead: the live demo when there is one, else the code. */
const primaryHref = (p: Project) => p.live ?? p.github;

function ProjectLinks({ project }: { project: Project }) {
  const links = [
    { label: "Code", href: project.github, aria: `${project.name} source code on GitHub (new tab)` },
    ...(project.live
      ? [{ label: "Live", href: project.live, aria: `${project.name} live demo (new tab)` }]
      : []),
  ];
  return (
    // Above the row's stretched link, so each stays its own target.
    <div className="relative z-10 flex gap-6 font-mono text-[13px]">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.aria}
          className="link nudge -my-3 inline-flex items-center gap-1 py-3 text-ink"
        >
          {l.label}
          <ArrowUpRight size={12} className="nudge__arrow" />
        </a>
      ))}
    </div>
  );
}

/**
 * Text-led presentation for a project with no screenshot: its name set large, and for an
 * app, the screens that exist in its code. Never a mock-up.
 */
function Plate({ project, compact }: { project: Project; compact?: boolean }) {
  const where = project.live ? "Opens the live demo" : "Opens the code on GitHub";
  if (compact) {
    return (
      <div className="flex h-full flex-col justify-between p-5">
        <span className="font-mono text-[12px] text-graphite">
          {project.index?.label ?? project.category}
        </span>
        {project.index ? (
          <ul className="text-[14px] leading-snug">
            {project.index.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-[12px] text-graphite">{where}</p>
        )}
      </div>
    );
  }
  return (
    <div className="grid h-full grid-cols-[1fr_auto] gap-8 p-7 xl:p-9">
      <div className="flex flex-col justify-between">
        <span className="font-mono text-[12px] text-graphite">
          {project.category}, {project.stack.slice(0, 2).join(" and ")}
        </span>
        <div>
          <p className="text-[clamp(2.25rem,3.6vw,3.25rem)] font-medium leading-[0.95] tracking-[-0.045em]">
            {project.name}
          </p>
          <p className="mt-3 text-[14px] text-graphite">{where}</p>
        </div>
      </div>
      {project.index && (
        <div className="flex flex-col justify-end">
          <p className="mb-3 font-mono text-[12px] text-graphite">{project.index.label}</p>
          <ul className="min-w-40 border-t border-hairline-strong text-[15px]">
            {project.index.items.map((screen) => (
              <li key={screen} className="border-b border-hairline py-1.5">
                {screen}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Scrubbing the real site: while the pointer is over the preview, its vertical position
 * scrolls the (tall) screenshot. Smoothed toward the pointer so it glides rather than
 * jumps; back to the top when the pointer leaves. Transform only.
 */
function usePreviewScrub() {
  const frameRef = useRef<HTMLAnchorElement>(null);
  const target = useRef(0);
  const current = useRef(0);
  const raf = useRef(0);
  const layer = useRef<HTMLElement | null>(null);

  const apply = useCallback(() => {
    const el = layer.current;
    const frame = frameRef.current;
    if (!el || !frame) return;
    const max = Math.max(0, el.offsetHeight - frame.clientHeight);
    el.style.transform = `translate3d(0, ${(-current.current * max).toFixed(1)}px, 0)`;
    // The rail shows how much of the page is in view and where.
    const thumb = frame.querySelector<HTMLElement>(".scrub-thumb");
    if (thumb && el.offsetHeight > 0) {
      const visible = Math.min(1, frame.clientHeight / el.offsetHeight);
      thumb.style.height = `${(visible * 100).toFixed(2)}%`;
      thumb.style.transform = `translate3d(0, ${((current.current * (1 - visible)) / visible) * 100}%, 0)`;
    }
  }, []);

  const tick = useCallback(
    function step(last: number) {
      raf.current = requestAnimationFrame((now) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        // Critically damped approach, ~120ms time constant.
        current.current += (target.current - current.current) * (1 - Math.exp(-dt / 0.12));
        if (Math.abs(target.current - current.current) < 0.0005) current.current = target.current;
        apply();
        if (current.current !== target.current) step(now);
        else raf.current = 0;
      });
    },
    [apply],
  );

  const setTarget = useCallback(
    (value: number) => {
      target.current = value;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        current.current = value;
        apply();
        return;
      }
      if (!raf.current) tick(performance.now());
    },
    [apply, tick],
  );

  /** Point the scrub at the active project's screenshot, starting from its top. */
  const attach = useCallback(
    (el: HTMLElement | null) => {
      if (layer.current === el) return;
      layer.current = el;
      current.current = target.current = 0;
      apply();
    },
    [apply],
  );

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    // A margin at each end, so the top and the bottom of the page are easy to reach.
    const p = ((e.clientY - r.top) / r.height - 0.12) / 0.76;
    setTarget(Math.min(1, Math.max(0, p)));
  };
  const onPointerLeave = () => setTarget(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return { frameRef, attach, onPointerMove, onPointerLeave };
}

export default function Projects() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);
  // Keyboard selection swaps the preview instantly: keyboard actions never animate.
  const [instant, setInstant] = useState(false);
  const { frameRef, attach, onPointerMove, onPointerLeave } = usePreviewScrub();
  const activeProject = projects[active];

  // The selected project shows in the sticky preview: tell the ink transition its
  // snapshots are out of date (it refreshes them once the visitor is idle).
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    window.dispatchEvent(new Event("ink:dirty"));
  }, [active]);

  // Hover intent: a short pause before a row takes over, so a diagonal path toward the
  // preview doesn't switch projects on the way.
  const intent = useRef(0);
  useEffect(() => () => window.clearTimeout(intent.current), []);
  const hoverSelect = (i: number) => {
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => select(i), 90);
  };

  const select = (i: number, viaKeyboard = false) => {
    window.clearTimeout(intent.current);
    setInstant(viaKeyboard);
    if (i === active) return;
    setPrev(active);
    setActive(i);
  };

  return (
    <Section
      id="work"
      wide
      title="Selected work"
      aside="Things I've built, each with its source code and a live demo where there is one."
    >
      <div className="grid gap-x-12 lg:grid-cols-12">
        <ol
          data-work-list
          data-hovering={hovering ? "" : undefined}
          className="lg:col-span-5"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {projects.map((p, i) => (
            <li
              key={p.slug}
              data-active={active === i ? "" : undefined}
              className="work-row relative border-t border-hairline py-7 sm:py-8"
              onMouseEnter={() => hoverSelect(i)}
              onMouseLeave={() => window.clearTimeout(intent.current)}
              onFocus={(e) => select(i, e.target.matches(":focus-visible"))}
            >
              <div className="sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-8 lg:block">
                {/* Inline preview below the large breakpoint: full width on phones, a side thumbnail on tablets */}
                <div
                  className={`shot relative mb-6 aspect-[16/10] overflow-hidden rounded-[4px] border border-hairline bg-surface sm:mb-0 lg:hidden ${
                    p.preview ? "" : "hidden sm:block"
                  }`}
                >
                  {p.preview ? (
                    <Image
                      src={p.preview.src}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 35vw, 100vw"
                      className="shot__img object-cover object-top"
                    />
                  ) : (
                    <Plate project={p} compact />
                  )}
                </div>
                <div>
                  <h3 className="flex flex-col gap-1.5">
                    {/* Stretched over the whole row: the row is one target. */}
                    <a
                      href={primaryHref(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="work-name text-[clamp(1.625rem,3vw,2.25rem)] font-medium leading-[1.05] tracking-[-0.035em] after:absolute after:inset-0 after:content-['']"
                    >
                      {p.name}
                      <ArrowUpRight size={18} className="work-arrow ml-1.5 inline-block align-[0.15em] text-graphite" />
                      <span className="sr-only">
                        , {p.live ? "open the live demo" : "open the code on GitHub"} (new tab)
                      </span>
                    </a>
                    <span className="font-mono text-[12px] font-normal tracking-normal text-graphite">
                      {p.category}
                    </span>
                  </h3>

                  <p className="mt-3 max-w-[54ch] text-[15px] leading-relaxed text-graphite sm:text-base">
                    {p.description}
                  </p>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-10 lg:justify-between">
                    <p className="font-mono text-[12px] leading-relaxed text-graphite">
                      <span className="sr-only">Built with </span>
                      {p.stack.join(" / ")}
                    </p>
                    <ProjectLinks project={p} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Sticky preview on large screens: a mouse shortcut to the same link as the row. */}
        <div className="hidden lg:col-span-7 lg:block" aria-hidden="true">
          <div className="sticky top-24" data-ink-layer>
            <a
              ref={frameRef}
              href={primaryHref(activeProject)}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              data-instant={instant ? "" : undefined}
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
              className="shot relative block aspect-[16/10] overflow-hidden rounded-[4px] border border-hairline bg-surface shadow-[var(--shadow)]"
            >
              {projects.map((p, i) => {
                // The incoming preview wipes up over the outgoing one, which holds still beneath it.
                const state = i === active ? "in" : i === prev ? "under" : "out";
                return (
                  <div
                    key={p.slug}
                    className={`preview-layer absolute inset-0 overflow-hidden bg-surface ${
                      state === "in" ? "is-in" : ""
                    }`}
                    style={{
                      clipPath: state === "out" ? "inset(100% 0 0 0)" : "inset(0 0 0 0)",
                      zIndex: state === "in" ? 2 : state === "under" ? 1 : 0,
                    }}
                  >
                    {p.preview ? (
                      <div className="preview-media">
                        <div
                          ref={i === active ? attach : undefined}
                          className="will-change-transform"
                        >
                          <Image
                            src={p.preview.src}
                            alt=""
                            width={p.preview.width}
                            height={p.preview.height}
                            sizes="(min-width: 1200px) 640px, 56vw"
                            className="block h-auto w-full"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="preview-media h-full">
                        <Plate project={p} />
                      </div>
                    )}
                  </div>
                );
              })}
              {activeProject.preview && (
                <span className="scrub-rail" aria-hidden="true">
                  <span className="scrub-thumb" />
                </span>
              )}
            </a>
            <div className="mt-4 flex items-baseline justify-between gap-6 font-mono text-[12px] text-graphite">
              <span className="text-ink">{activeProject.name}</span>
              <span>
                {activeProject.preview
                  ? "Move down the preview to scroll the site, click to open it"
                  : activeProject.live
                    ? "Click to open the live demo"
                    : "Click to open the code"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
