"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { projects, skills } from "@/data/site";
import Section from "./Section";
import TextMorph from "./TextMorph";

const list = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

const allSkills = skills.flatMap((g) => g.items);
const projectNames = projects.map((p) => p.name);
/** Every real link between a skill and a project on this page. */
const links = allSkills.flatMap((s) => s.usedIn.map((p) => ({ skill: s.name, project: p })));
const skillsOf = (project: string) => allSkills.filter((s) => s.usedIn.includes(project)).map((s) => s.name);

type Focus = { kind: "skill" | "project"; name: string } | null;

const key = (skill: string, project: string) => `${skill}|${project}`;

/**
 * Skills ↔ projects map. On large screens the projects sit in a column beside the skills
 * and every real link is drawn as a faint curve, so the section reads as a diagram at rest.
 * Pointing at (or focusing) a skill draws its links in the accent and lights its projects;
 * pointing at a project does the reverse. A click or Enter pins the answer. Project nodes
 * can be dragged: the node follows the pointer 1:1, its curves follow it, and on release it
 * springs home carrying its velocity. Below the large breakpoint the curves are left out
 * (they would cross a stacked layout) and the highlight alone carries the answer.
 * Skills no project shows stay plain text. Reduced motion: lines appear without drawing,
 * the spring-back is instant.
 */
export default function Skills() {
  const [hovered, setHovered] = useState<Focus>(null);
  const [pinned, setPinned] = useState<Focus>(null);
  const current = hovered ?? pinned;

  const mapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const skillEls = useRef(new Map<string, HTMLElement>());
  const projectEls = useRef(new Map<string, HTMLElement>());
  const offsets = useRef(new Map<string, { x: number; y: number }>());

  const activeLinks = new Set(
    current
      ? links
          .filter((l) => (current.kind === "skill" ? l.skill === current.name : l.project === current.name))
          .map((l) => key(l.skill, l.project))
      : [],
  );
  const litSkills = new Set(
    current ? (current.kind === "skill" ? [current.name] : skillsOf(current.name)) : [],
  );
  const litProjects = new Set(
    current
      ? current.kind === "project"
        ? [current.name]
        : (allSkills.find((s) => s.name === current.name)?.usedIn ?? [])
      : [],
  );

  // ---- geometry: curves from a skill's right edge to a project's left edge ----
  const drawPaths = useCallback((only?: string) => {
    const map = mapRef.current;
    const svg = svgRef.current;
    if (!map || !svg) return;
    const box = map.getBoundingClientRect();
    if (box.width === 0) return;
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    svg.querySelectorAll<SVGPathElement>("path[data-link]").forEach((path) => {
      const [skill, project] = path.dataset.link!.split("|");
      if (only && project !== only) return;
      const s = skillEls.current.get(skill)?.getBoundingClientRect();
      const p = projectEls.current.get(project)?.getBoundingClientRect();
      if (!s || !p) return;
      const x1 = s.right - box.left + 6;
      const y1 = s.top + s.height / 2 - box.top;
      const x2 = p.left - box.left - 6;
      const y2 = p.top + p.height / 2 - box.top;
      const c = Math.max(40, (x2 - x1) * 0.5);
      path.setAttribute("d", `M${x1.toFixed(1)} ${y1.toFixed(1)}C${(x1 + c).toFixed(1)} ${y1.toFixed(1)} ${(x2 - c).toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
    });
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    drawPaths();
    const ro = new ResizeObserver(() => drawPaths());
    ro.observe(map);
    void document.fonts.ready.then(() => drawPaths());
    return () => ro.disconnect();
  }, [drawPaths]);

  // ---- drag a project node: 1:1 tracking, spring home with release velocity ----
  const drag = useRef<{
    name: string;
    id: number;
    x0: number;
    y0: number;
    moved: boolean;
    samples: { t: number; x: number; y: number }[];
  } | null>(null);
  const springs = useRef(new Map<string, number>());

  const place = (name: string) => {
    const el = projectEls.current.get(name);
    const o = offsets.current.get(name) ?? { x: 0, y: 0 };
    if (el) el.style.transform = o.x || o.y ? `translate3d(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px, 0)` : "";
    drawPaths(name);
  };

  const springHome = (name: string, vx: number, vy: number) => {
    cancelAnimationFrame(springs.current.get(name) ?? 0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      offsets.current.set(name, { x: 0, y: 0 });
      place(name);
      return;
    }
    const k = 260; // 1/s²
    const c = 2 * Math.sqrt(k) * 0.72; // a little bounce: a drag applied force
    let last = 0;
    let v = { x: vx, y: vy };
    const step = (now: number) => {
      const dt = last ? Math.min(0.032, (now - last) / 1000) : 1 / 60;
      last = now;
      const o = offsets.current.get(name) ?? { x: 0, y: 0 };
      v = { x: v.x + (-k * o.x - c * v.x) * dt, y: v.y + (-k * o.y - c * v.y) * dt };
      const next = { x: o.x + v.x * dt, y: o.y + v.y * dt };
      const done = Math.hypot(next.x, next.y) < 0.3 && Math.hypot(v.x, v.y) < 10;
      offsets.current.set(name, done ? { x: 0, y: 0 } : next);
      place(name);
      if (!done) springs.current.set(name, requestAnimationFrame(step));
    };
    springs.current.set(name, requestAnimationFrame(step));
  };

  const onNodeDown = (e: React.PointerEvent, name: string) => {
    if (e.button !== 0 || e.pointerType === "touch") return; // touch taps; no scroll trap
    cancelAnimationFrame(springs.current.get(name) ?? 0);
    const o = offsets.current.get(name) ?? { x: 0, y: 0 };
    drag.current = {
      name,
      id: e.pointerId,
      x0: e.clientX - o.x,
      y0: e.clientY - o.y,
      moved: false,
      samples: [{ t: e.timeStamp, x: e.clientX, y: e.clientY }],
    };
  };
  const onNodeMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const x = e.clientX - d.x0;
    const y = e.clientY - d.y0;
    if (!d.moved) {
      if (Math.hypot(x - (offsets.current.get(d.name)?.x ?? 0), y - (offsets.current.get(d.name)?.y ?? 0)) < 5) return;
      d.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      (e.currentTarget as HTMLElement).classList.add("is-dragging");
      setHovered({ kind: "project", name: d.name });
    }
    d.samples.push({ t: e.timeStamp, x: e.clientX, y: e.clientY });
    while (d.samples.length > 2 && e.timeStamp - d.samples[0].t > 90) d.samples.shift();
    offsets.current.set(d.name, { x, y });
    place(d.name);
  };
  const onNodeUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const el = e.currentTarget as HTMLElement;
    el.classList.remove("is-dragging");
    if (!d.moved) return; // a click: handled by onClick
    const a = d.samples[0];
    const b = d.samples[d.samples.length - 1];
    const dt = Math.max(1, b.t - a.t);
    springHome(d.name, ((b.x - a.x) / dt) * 1000, ((b.y - a.y) / dt) * 1000);
    // The click that follows a drag is not a pin.
    const swallow = (ev: Event) => {
      ev.stopPropagation();
      ev.preventDefault();
    };
    el.addEventListener("click", swallow, { capture: true, once: true });
    window.setTimeout(() => el.removeEventListener("click", swallow, { capture: true }), 0);
  };

  useEffect(() => {
    const s = springs.current;
    return () => s.forEach((id) => cancelAnimationFrame(id));
  }, []);

  const toggle = (f: NonNullable<Focus>) =>
    setPinned((p) => (p?.kind === f.kind && p.name === f.name ? null : f));

  const answer = current
    ? current.kind === "skill"
      ? [
          { text: current.name, className: "text-ink" },
          { text: " is used in " },
          { text: list(allSkills.find((s) => s.name === current.name)?.usedIn ?? []), className: "text-ink" },
          { text: "." },
        ]
      : [
          { text: current.name, className: "text-ink" },
          { text: " uses " },
          { text: list(skillsOf(current.name)), className: "text-ink" },
          { text: "." },
        ]
    : "Choose a skill or a project to see how they connect.";

  return (
    <Section id="skills" title="Skills" aside="What I work with, and where. Point at a skill or a project; drag a project to play.">
      <div
        ref={mapRef}
        className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-x-24"
        data-skills
        data-has-current={current ? "" : undefined}
        onPointerLeave={(e) => e.pointerType === "mouse" && !drag.current && setHovered(null)}
      >
        {/* Curves sit under the labels (each label has the page ground behind it). */}
        <svg ref={svgRef} aria-hidden="true" className="skill-links pointer-events-none absolute inset-0 hidden h-full w-full lg:block">
          {links.map((l) => (
            <path key={`b-${key(l.skill, l.project)}`} data-link={key(l.skill, l.project)} className="skill-link" />
          ))}
          {links.map((l) => (
            <path
              key={`a-${key(l.skill, l.project)}`}
              data-link={key(l.skill, l.project)}
              pathLength={1}
              data-on={activeLinks.has(key(l.skill, l.project)) ? "" : undefined}
              className="skill-link skill-link--active"
            />
          ))}
        </svg>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          {skills.map((s) => (
            <div key={s.group}>
              <h3 className="border-b border-hairline pb-3 font-mono text-[12px] text-graphite">{s.group}</h3>
              <ul className="mt-2.5">
                {s.items.map((item) => {
                  if (item.usedIn.length === 0) {
                    return (
                      <li key={item.name} className="skill skill--plain py-2.5 text-[16px] tracking-[-0.01em] lg:py-1.5">
                        {item.name}
                      </li>
                    );
                  }
                  const f = { kind: "skill" as const, name: item.name };
                  return (
                    <li key={item.name}>
                      <button
                        ref={(el) => {
                          if (el) skillEls.current.set(item.name, el);
                        }}
                        type="button"
                        aria-pressed={pinned?.kind === "skill" && pinned.name === item.name}
                        data-current={litSkills.has(item.name) ? "" : undefined}
                        onPointerEnter={(e) => e.pointerType === "mouse" && !drag.current && setHovered(f)}
                        onFocus={() => setHovered(f)}
                        onBlur={() => setHovered(null)}
                        onClick={() => toggle(f)}
                        className="skill relative -mx-1 min-h-11 rounded-[3px] bg-paper px-1 py-2.5 text-left text-[16px] tracking-[-0.01em] lg:min-h-0 lg:py-1.5"
                      >
                        {item.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 lg:mt-0">
          <h3 className="border-b border-hairline pb-3 font-mono text-[12px] text-graphite">Projects</h3>
          <ul className="mt-2.5 flex flex-wrap gap-x-5 lg:block">
            {projectNames.map((name) => {
              const f = { kind: "project" as const, name };
              return (
                <li key={name}>
                  <button
                    ref={(el) => {
                      if (el) projectEls.current.set(name, el);
                    }}
                    type="button"
                    aria-pressed={pinned?.kind === "project" && pinned.name === name}
                    data-current={litProjects.has(name) ? "" : undefined}
                    onPointerEnter={(e) => e.pointerType === "mouse" && !drag.current && setHovered(f)}
                    onPointerDown={(e) => onNodeDown(e, name)}
                    onPointerMove={onNodeMove}
                    onPointerUp={onNodeUp}
                    onPointerCancel={onNodeUp}
                    onFocus={() => setHovered(f)}
                    onBlur={() => setHovered(null)}
                    onClick={() => toggle(f)}
                    data-cursor="Drag"
                    className="skill project-node relative -mx-1 min-h-11 rounded-[3px] bg-paper px-1 py-2.5 text-left text-[16px] tracking-[-0.01em] lg:min-h-0 lg:py-2"
                  >
                    <span className="project-node__dot" aria-hidden="true" />
                    {name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Sticky on phones so the answer is on screen wherever the tapped item is. */}
      <p
        aria-live="polite"
        className="sticky bottom-0 z-10 mt-12 min-h-[5.5rem] border-t border-hairline bg-paper py-4 text-[15px] leading-relaxed text-graphite sm:static sm:min-h-0 sm:bg-transparent sm:pb-0"
      >
        <TextMorph parts={answer} />
      </p>
    </Section>
  );
}
