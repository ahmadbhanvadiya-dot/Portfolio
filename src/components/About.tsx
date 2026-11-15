import Section from "./Section";

const facts = [
  { term: "Studying", detail: "Computer Science" },
  { term: "Working in", detail: "Python, TypeScript, Next.js, Flutter" },
  { term: "Outside class", detail: "Hackathons and side projects" },
];

export default function About() {
  return (
    <Section id="about" title="About">
      <div className="max-w-[44rem]">
        <p className="text-[clamp(1.375rem,2.6vw,2rem)] font-normal leading-[1.3] tracking-[-0.02em]">
          I&apos;m a Computer Science student who likes building software people can
          actually use: small, practical products that start as an idea and end up on a
          real URL.
        </p>
        <div className="mt-8 space-y-5 text-[1.0625rem] leading-relaxed text-graphite">
          <p>
            Most of what I build is full-stack web. Next.js and TypeScript on the front,
            Python and Supabase behind it. I write a lot of Python, and it&apos;s usually
            where I start when I need to work something out.
          </p>
          <p>
            I&apos;m still learning the web properly, one project at a time. I also like
            hackathons, where a deadline forces you to decide what actually matters.
            SmartCommute AI started as a Smart India Hackathon project.
          </p>
        </div>
      </div>

      <dl className="mt-14 grid gap-px overflow-hidden border-t border-hairline sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.term} className="py-5 sm:pr-6">
            <dt className="font-mono text-[12px] text-graphite">{f.term}</dt>
            <dd className="mt-1.5 text-[15px]">{f.detail}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
