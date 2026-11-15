import Section from "./Section";

export default function About() {
  return (
    <Section id="about" title="About">
      <div className="max-w-[44rem]">
        <p className="text-[clamp(1.375rem,2.6vw,2rem)] font-normal leading-[1.3] tracking-[-0.02em]">
          I&apos;m a Computer Science student who likes building software people can
          use: small, practical products that start as an idea and end up on a
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

    </Section>
  );
}
