"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { projects, type Project } from "@/data/site";
import { ArrowUpRight } from "./Icons";
import Section from "./Section";
import { useReveal } from "./useReveal";

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="flex gap-5 font-mono text-[13px]">
      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="link inline-flex items-center gap-1 text-ink"
        aria-label={`${project.name} source code on GitHub`}
      >
        Code
        <ArrowUpRight size={12} />
      </a>
      {project.live && (
        <a
          href={project.live}
          target="_blank"
          rel="noopener noreferrer"
          className="link inline-flex items-center gap-1 text-ink"
          aria-label={`${project.name} live demo`}
        >
          Live
          <ArrowUpRight size={12} />
        </a>
      )}
    </div>
  );
}

function Preview({
  project,
  sizes,
  compact = false,
}: {
  project: Project;
  sizes: string;
  compact?: boolean;
}) {
  if (project.preview) {
    return (
      <Image
        src={project.preview}
        alt={`Screenshot of the ${project.name} live site`}
        fill
        sizes={sizes}
        className="object-cover object-top"
      />
    );
  }
  // No live demo to capture: a typeset plate instead of an invented screenshot.
  if (compact) {
    return (
      <div className="flex h-full flex-col justify-end p-5">
        <span className="font-mono text-[12px] leading-relaxed text-graphite">
          {project.live ? "Live demo linked" : "No live demo"}
          <br />
          {project.stack.slice(0, 2).join(", ")}
        </span>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col justify-between p-6 sm:p-8">
      <span className="font-mono text-[12px] text-graphite">
        {project.category} · {project.stack.slice(0, 2).join(", ")}
      </span>
      <div>
        <p className="text-[clamp(2rem,4vw,3rem)] font-medium leading-none tracking-[-0.04em]">
          {project.name}
        </p>
        <p className="mt-3 text-[14px] text-graphite">
          {project.live
            ? "Best seen live: the demo link is in the list."
            : "No live demo. The code is on GitHub."}
        </p>
      </div>
    </div>
  );
}

export default function Projects() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  useReveal(listRef);

  const select = (i: number) => {
    if (i === active) return;
    setPrev(active);
    setActive(i);
  };

  return (
    <Section
      id="work"
      title="Selected work"
      aside="Things I've built, each with its source code and a live demo where there is one."
    >
      <div className="grid gap-x-10 lg:grid-cols-9">
        <ol
          ref={listRef}
          className="lg:col-span-5"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {projects.map((p, i) => {
            const isActive = active === i;
            const dim = hovering && !isActive;
            return (
              <li
                key={p.slug}
                data-reveal
                style={{ ["--i" as string]: i }}
                className="border-t border-hairline py-7 sm:py-8"
                onMouseEnter={() => select(i)}
                onFocus={() => select(i)}
              >
                <div className="sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-8 lg:block">
                  {/* Inline preview below the large breakpoint: full width on phones, a side thumbnail on tablets */}
                  <div
                    className={`relative mb-6 aspect-[16/10] overflow-hidden rounded-[4px] border border-hairline bg-surface sm:mb-0 lg:hidden ${p.preview ? "" : "hidden sm:block"}`}
                  >
                    <Preview project={p} sizes="(min-width: 640px) 35vw, 100vw" compact />
                  </div>
                  <div>
                    <div className="flex flex-col gap-1.5">
                      <h3
                        className={`whitespace-nowrap text-[clamp(1.625rem,3vw,2.25rem)] font-medium leading-[1.05] tracking-[-0.035em] transition-[color,transform] duration-500 ease-out-expo ${
                          dim ? "lg:text-graphite" : ""
                        } ${isActive && hovering ? "lg:translate-x-1.5" : ""}`}
                      >
                        {p.name}
                      </h3>
                      <span className="font-mono text-[12px] text-graphite">{p.category}</span>
                    </div>

                    <p className="mt-3 max-w-[54ch] text-[15px] leading-relaxed text-graphite sm:text-base">
                      {p.description}
                    </p>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-mono text-[12px] leading-relaxed text-graphite">
                        <span className="sr-only">Built with </span>
                        {p.stack.join(" / ")}
                      </p>
                      <ProjectLinks project={p} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Sticky preview frame on large screens */}
        <div className="hidden lg:col-span-4 lg:block" aria-hidden="true">
          <div className="sticky top-24">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] border border-hairline bg-surface shadow-[var(--shadow)]">
              {projects.map((p, i) => {
                // The incoming preview wipes up over the outgoing one, which holds still beneath it.
                const state = i === active ? "in" : i === prev ? "under" : "out";
                return (
                  <div
                    key={p.slug}
                    className={`absolute inset-0 bg-surface ease-out-expo ${
                      state === "in" ? "transition-[clip-path] duration-700" : ""
                    }`}
                    style={{
                      clipPath: state === "out" ? "inset(100% 0 0 0)" : "inset(0 0 0 0)",
                      zIndex: state === "in" ? 2 : state === "under" ? 1 : 0,
                    }}
                  >
                    <Preview project={p} sizes="(min-width: 1200px) 400px, 33vw" />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-baseline justify-between font-mono text-[12px] text-graphite">
              <span>{projects[active].name}</span>
              <span>
                {String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
