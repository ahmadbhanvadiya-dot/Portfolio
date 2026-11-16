"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/site";
import { ArrowUpRight } from "./Icons";
import { DragScroll } from "./dragScroll";
import PlateHeader from "./PlateHeader";
import { CropMarks } from "./print";

/** Where a project's name and frame lead: the live demo when there is one, else the code. */
const primaryHref = (p: Project) => p.live ?? p.github;
const host = (p: Project) => (p.live ? new URL(p.live).host : "github.com/ahmadbhanvadiya-dot");
const nn = (i: number) => String(i + 1).padStart(2, "0");

function ProjectLinks({ project }: { project: Project }) {
  const links = [
    { label: "Code", href: project.github, aria: `${project.name} source code on GitHub (new tab)` },
    ...(project.live ? [{ label: "Live", href: project.live, aria: `${project.name} live demo (new tab)` }] : []),
  ];
  return (
    <div className="flex gap-7 font-mono text-[13px] uppercase tracking-[0.06em]">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.aria}
          className="link nudge -my-3 inline-flex items-center gap-1.5 py-3 text-ink"
        >
          {l.label}
          <ArrowUpRight size={12} className="nudge__arrow" />
        </a>
      ))}
    </div>
  );
}

/**
 * A frame you can drag through like a small browser (dragScroll.ts holds the physics).
 * A plain tap opens the project. Rests at the top during a theme transition so it matches
 * the ink snapshots.
 */
function useDragScroll(frameRef: React.RefObject<HTMLElement | null>, onTap: () => void) {
  const tap = useRef(onTap);
  useEffect(() => {
    tap.current = onTap;
  });
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const ds = new DragScroll(frame, { chainToPage: true, onTap: () => tap.current() });
    ds.setTrack(frame.querySelector<HTMLElement>("[data-pan]"));
    const reset = () => ds.reset();
    window.addEventListener("ink:start", reset);
    return () => {
      window.removeEventListener("ink:start", reset);
      ds.destroy();
    };
  }, [frameRef]);
}

/** Text shown inside a frame for a project with no screenshot: real facts, never a mock-up. */
function FrameText({ project }: { project: Project }) {
  return (
    <div className="frame-text flex h-full flex-col justify-between p-6 sm:p-8">
      <span className="flex justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-graphite">
        <span>{project.index?.label ?? project.category}</span>
        {project.index && <span>{String(project.index.items.length).padStart(2, "0")}</span>}
      </span>
      <div>
        {project.index && (
          <ul className="border-t border-hairline-strong">
            {project.index.items.map((item, i) => (
              <li key={item} className="frame-item flex items-baseline justify-between gap-4 border-b border-hairline py-2.5">
                {item}
                <span className="font-mono text-[11px] text-graphite">{nn(i)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-graphite">
          {project.live ? "Open the live demo" : "Code on GitHub"}
        </p>
      </div>
    </div>
  );
}

function Frame({ project, open }: { project: Project; open: () => void }) {
  const viewRef = useRef<HTMLDivElement>(null);
  useDragScroll(viewRef, open);
  const shot = project.preview;

  if (project.frame === "phone") {
    return (
      <div className="exhibit-frame phone-frame" ref={viewRef} data-cursor="Open">
        <span className="phone-notch" aria-hidden="true" />
        <FrameText project={project} />
      </div>
    );
  }
  return (
    <div className="exhibit-frame browser-frame">
      <div className="browser-bar" aria-hidden="true">
        <span className="browser-dots">
          <span />
          <span />
          <span />
        </span>
        <span className="browser-url">{host(project)}</span>
        <span className="browser-tag">{project.live ? "Live" : "Repo"}</span>
      </div>
      <div ref={viewRef} className={`browser-view shot${shot ? " drag-frame" : ""}`} data-cursor={shot ? "Drag" : "Open"}>
        {shot ? (
          <>
            <div data-pan className="will-change-transform">
              <Image
                src={shot.src}
                alt={`Screenshot of the ${project.name} live site`}
                width={shot.width}
                height={shot.height}
                sizes="(min-width: 1024px) 60vw, 100vw"
                draggable={false}
                className="block h-auto w-full"
              />
            </div>
            <span className="scrub-rail" aria-hidden="true">
              <span className="scrub-thumb" />
            </span>
          </>
        ) : (
          <FrameText project={project} />
        )}
      </div>
    </div>
  );
}

function Exhibit({ project, i }: { project: Project; i: number }) {
  const link = useRef<HTMLAnchorElement>(null);
  const side = i % 2 === 0 ? "right" : "left";
  return (
    <li
      id={`plate-${project.slug}`}
      data-scroll
      data-side={side}
      className="exhibit relative"
      style={{ ["--tone" as string]: project.tone }}
    >
      <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-graphite sm:text-[12px]">
        <span>
          Plate 02.{i + 1} / {project.category}
        </span>
        <span className="hidden sm:inline">{host(project)}</span>
      </div>

      <div className="exhibit-grid mt-8 lg:mt-12">
        <div className="exhibit-media relative">
          <span className="exhibit-numeral" aria-hidden="true">
            {nn(i)}
          </span>
          <span className="exhibit-slab exhibit-reveal" aria-hidden="true" />
          <div className="exhibit-reveal relative">
            <CropMarks />
            <Frame project={project} open={() => link.current?.click()} />
          </div>
        </div>

        <div className="exhibit-text relative">
          <h3 className="exhibit-name mask" data-text={project.name}>
            <a
              ref={link}
              href={primaryHref(project)}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="Open"
              className="mask-inner block"
            >
              {project.name}
              <span className="sr-only">, {project.live ? "open the live demo" : "open the code on GitHub"} (new tab)</span>
            </a>
          </h3>
          <p className="row-rest mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-graphite">{project.description}</p>
          <ul className="row-rest mt-6 flex flex-wrap gap-2" aria-label="Built with">
            {project.stack.map((t) => (
              <li key={t} className="stack-chip">
                {t}
              </li>
            ))}
          </ul>
          <div className="row-rest mt-8">
            <ProjectLinks project={project} />
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * Plate 02, the work as an exhibition: one plate per project, each in its own colour
 * (taken from the project's real interface), framed as what it is (a browser for the web,
 * a phone for the Flutter app). Frames wipe in from the direction you are scrolling; the
 * project name overprints the frame's edge. A sticky index tracks where you are.
 */
export default function Projects() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const plates = projects
      .map((p) => document.getElementById(`plate-${p.slug}`))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(plates.indexOf(e.target as HTMLElement));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    plates.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, []);

  // On narrow screens the index scrolls sideways: keep the current plate's link in view.
  const indexRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = indexRef.current;
    const link = list?.children[active] as HTMLElement | undefined;
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ left: link.offsetLeft - 12, behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  return (
    <section id="work" aria-labelledby="work-title" className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
      <div data-scroll className="scroll-rule pb-28 sm:pb-40">
        <PlateHeader
          id="work"
          n="02"
          slug="Work"
          title="Selected work"
          aside="Five projects, four of them live. Drag a frame to look through the real site; click to open it."
        />

        <nav aria-label="Projects" className="work-index" data-ink-layer>
          <ol ref={indexRef} className="relative flex gap-1 overflow-x-auto">
            {projects.map((p, i) => (
              <li key={p.slug} className="flex-none">
                <a
                  href={`#plate-${p.slug}`}
                  aria-current={active === i ? "true" : undefined}
                  className="work-index__link"
                  style={{ ["--tone" as string]: p.tone }}
                >
                  <span className="text-graphite">{nn(i)}</span> {p.name}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="mt-10 space-y-28 sm:space-y-40">
          {projects.map((p, i) => (
            <Exhibit key={p.slug} project={p} i={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
