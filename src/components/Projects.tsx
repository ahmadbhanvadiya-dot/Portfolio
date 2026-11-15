"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/site";
import { ArrowUpRight } from "./Icons";
import { DragScroll } from "./dragScroll";
import Section from "./Section";
import TextMorph from "./TextMorph";

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
 * A screenshot of a live page in a frame you can drag through like a small browser
 * (see dragScroll.ts for the physics). `onTap` handles a plain tap when the frame is not
 * a link itself. Resets to the top while a theme transition runs, so it matches the ink
 * snapshots.
 */
function useDragScroll(
  frameRef: React.RefObject<HTMLElement | null>,
  opts: { chainToPage?: boolean; onTap?: () => void } = {},
) {
  const scroller = useRef<DragScroll | null>(null);
  const onTap = useRef(opts.onTap);
  useEffect(() => {
    onTap.current = opts.onTap;
  });
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const ds = new DragScroll(frame, {
      chainToPage: opts.chainToPage,
      onTap: () => onTap.current?.(),
    });
    ds.setTrack(frame.querySelector<HTMLElement>("[data-pan]"));
    scroller.current = ds;
    const reset = () => ds.reset();
    window.addEventListener("ink:start", reset);
    return () => {
      window.removeEventListener("ink:start", reset);
      ds.destroy();
      scroller.current = null;
    };
  }, [frameRef, opts.chainToPage]);
  return scroller;
}

/** Inline preview below the large breakpoint: full width on phones, a thumbnail on tablets. */
function InlineShot({ project, open }: { project: Project; open: () => void }) {
  const frameRef = useRef<HTMLDivElement>(null);
  useDragScroll(frameRef, { chainToPage: true, onTap: open });
  if (!project.preview) {
    return (
      <div className="shot relative mb-6 hidden aspect-[16/10] overflow-hidden rounded-[4px] border border-hairline bg-surface sm:mb-0 sm:block lg:hidden">
        <Plate project={project} compact />
      </div>
    );
  }
  return (
    <div
      ref={frameRef}
      className="shot drag-frame relative z-10 mb-6 aspect-[16/10] overflow-hidden rounded-[4px] border border-hairline bg-surface sm:mb-0 lg:hidden"
    >
      <div data-pan className="will-change-transform">
        <Image
          src={project.preview.src}
          alt=""
          width={project.preview.width}
          height={project.preview.height}
          sizes="(min-width: 640px) 35vw, 100vw"
          draggable={false}
          className="shot__img block h-auto w-full"
        />
      </div>
      <span className="scrub-rail" aria-hidden="true">
        <span className="scrub-thumb" />
      </span>
    </div>
  );
}

export default function Projects() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);
  // Keyboard selection swaps the preview instantly: keyboard actions never animate.
  const [instant, setInstant] = useState(false);
  const frameRef = useRef<HTMLAnchorElement>(null);
  const preview = useDragScroll(frameRef);
  const rowLinks = useRef<(HTMLAnchorElement | null)[]>([]);
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

  // Connected, direction-aware switch (Web Animations API, so every run starts from the
  // right edge whatever the previous direction was, and a rapid switch can settle the one
  // in flight). The incoming preview is wiped in from the side it travels from while its
  // page slides the last stretch into place; the outgoing page is pushed the other way and
  // dims beneath it. Both share one duration and curve, so they read as one movement.
  // Direction comes from the real indices: a higher index is further down the list.
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const running = useRef<Animation[]>([]);
  useEffect(() => {
    if (prev === null) return;
    for (const a of running.current) a.cancel();
    running.current = [];
    const incoming = layerRefs.current[active];
    const outgoing = layerRefs.current[prev];
    if (!incoming || instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const down = active > prev;
    const timing: KeyframeAnimationOptions = { duration: 320, easing: "cubic-bezier(0.23, 1, 0.32, 1)" };
    const inMedia = incoming.querySelector<HTMLElement>(".preview-media");
    const outMedia = outgoing?.querySelector<HTMLElement>(".preview-media");
    running.current = [
      incoming.animate(
        [{ clipPath: down ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
        timing,
      ),
      ...(inMedia
        ? [inMedia.animate([{ transform: `translateY(${down ? 14 : -14}%)` }, { transform: "none" }], timing)]
        : []),
      ...(outMedia
        ? [
            outMedia.animate(
              [
                { transform: "none", opacity: 1 },
                { transform: `translateY(${down ? -10 : 10}%)`, opacity: 0.45 },
              ],
              timing,
            ),
          ]
        : []),
    ];
    // `prev` and `instant` are set in the same update as `active`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  useEffect(() => () => running.current.forEach((a) => a.cancel()), []);

  // The draggable page is always the active project's; a new project starts at its top.
  useEffect(() => {
    preview.current?.setTrack(layerRefs.current[active]?.querySelector<HTMLElement>("[data-pan]") ?? null);
  }, [active, preview]);

  // Hover intent: a short pause before a row takes over, so a diagonal path toward the
  // preview doesn't switch projects on the way.
  const intent = useRef(0);
  useEffect(() => () => window.clearTimeout(intent.current), []);
  const hoverSelect = (i: number) => {
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => select(i), 90);
  };

  // Touch on a large screen has no hover to preview with: the first tap on a row shows its
  // preview, a second tap opens it.
  const lastPointer = useRef<string>("mouse");
  const onRowNameClick = (e: React.MouseEvent, i: number) => {
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (lastPointer.current === "touch" && wide && i !== active) {
      e.preventDefault();
      select(i);
    }
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
      aside="Things I've built, each with its source code and a live demo where there is one. Drag a preview to look through the live site."
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
              onPointerDown={(e) => {
                lastPointer.current = e.pointerType;
              }}
              onMouseEnter={() => hoverSelect(i)}
              onMouseLeave={() => window.clearTimeout(intent.current)}
              onFocus={(e) => select(i, e.target.matches(":focus-visible"))}
            >
              <div className="sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-8 lg:block">
                <InlineShot project={p} open={() => rowLinks.current[i]?.click()} />
                <div>
                  <h3 className="flex flex-col gap-1.5">
                    {/* Stretched over the whole row: the row is one target. */}
                    <a
                      href={primaryHref(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      ref={(el) => {
                        rowLinks.current[i] = el;
                      }}
                      onClick={(e) => onRowNameClick(e, i)}
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
              className="shot drag-frame relative block aspect-[16/10] overflow-hidden rounded-[4px] border border-hairline bg-surface shadow-[var(--shadow)]"
            >
              {projects.map((p, i) => {
                // At rest: the active preview on top, the previous one beneath it (it is still
                // visible while the incoming one wipes over it), the rest clipped away.
                const state = i === active ? "in" : i === prev ? "under" : "out";
                return (
                  <div
                    key={p.slug}
                    ref={(el) => {
                      layerRefs.current[i] = el;
                    }}
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
                          data-pan
                          className="will-change-transform"
                        >
                          <Image
                            src={p.preview.src}
                            alt=""
                            width={p.preview.width}
                            height={p.preview.height}
                            sizes="(min-width: 1200px) 640px, 56vw"
                            draggable={false}
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
              <span className="scrub-rail" data-hidden={activeProject.preview ? undefined : ""} aria-hidden="true">
                <span className="scrub-thumb" />
              </span>
            </a>
            <div className="mt-4 flex items-baseline justify-between gap-6 font-mono text-[12px] text-graphite">
              <TextMorph parts={activeProject.name} className="text-ink" />
              <TextMorph
                parts={
                  activeProject.preview
                    ? "Drag the preview to explore the site, click to open it"
                    : activeProject.live
                      ? "Click to open the live demo"
                      : "Click to open the code"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
