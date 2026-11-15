import { skills } from "@/data/site";
import Section from "./Section";

export default function Skills() {
  return (
    <Section id="skills" title="Skills" aside="What I work with, grouped by where it sits in a project.">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {skills.map((s) => (
          <div key={s.group}>
            <h3 className="border-b border-hairline pb-3 font-mono text-[12px] text-graphite">
              {s.group}
            </h3>
            <ul className="mt-4 space-y-2 text-[16px] tracking-[-0.01em]">
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
