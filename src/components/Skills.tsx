"use client";

import { useState } from "react";
import { skills, type Skill } from "@/data/site";
import Section from "./Section";
import TextMorph from "./TextMorph";

const list = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

/**
 * Skills with their evidence. A skill used in the projects above is a button: pointing at
 * it or focusing it previews which projects use it, and a click (or Enter) pins that answer.
 * Skills no project on the page shows are listed as plain text.
 */
export default function Skills() {
  const [hovered, setHovered] = useState<Skill | null>(null);
  const [pinned, setPinned] = useState<Skill | null>(null);
  const current = hovered ?? pinned;

  return (
    <Section id="skills" title="Skills" aside="What I work with. Choose one to see which projects use it.">
      <div
        className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
        data-skills
        data-has-current={current ? "" : undefined}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(null)}
      >
        {skills.map((s) => (
          <div key={s.group}>
            <h3 className="border-b border-hairline pb-3 font-mono text-[12px] text-graphite">{s.group}</h3>
            <ul className="mt-2.5">
              {s.items.map((item) => {
                const isCurrent = current?.name === item.name;
                if (item.usedIn.length === 0) {
                  return (
                    <li key={item.name} className="skill skill--plain py-2.5 text-[16px] tracking-[-0.01em] lg:py-1.5">
                      {item.name}
                    </li>
                  );
                }
                return (
                  <li key={item.name}>
                    <button
                      type="button"
                      aria-pressed={pinned?.name === item.name}
                      data-current={isCurrent ? "" : undefined}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(item)}
                      onFocus={() => setHovered(item)}
                      onBlur={() => setHovered(null)}
                      onClick={() => setPinned((p) => (p?.name === item.name ? null : item))}
                      className="skill -mx-1 min-h-11 rounded-[3px] px-1 py-2.5 text-left text-[16px] tracking-[-0.01em] lg:min-h-0 lg:py-1.5"
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

      {/* Sticky on phones so the answer is on screen wherever the tapped skill is. */}
      <p
        aria-live="polite"
        className="sticky bottom-0 z-10 mt-12 border-t border-hairline bg-paper py-4 text-[15px] leading-relaxed text-graphite sm:static sm:bg-transparent sm:pb-0"
      >
        <TextMorph
          parts={
            current
              ? [
                  { text: current.name, className: "text-ink" },
                  { text: " is used in " },
                  { text: list(current.usedIn), className: "text-ink" },
                  { text: "." },
                ]
              : "Choose a skill to see which projects use it."
          }
        />
      </p>
    </Section>
  );
}
