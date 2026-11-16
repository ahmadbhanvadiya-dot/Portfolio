import PlateHeader from "./PlateHeader";
import ScrollWords from "./ScrollWords";

/** The three steps every project here went through, in Ahmad's own terms. */
const steps = [
  {
    word: "Idea",
    text: "Small, practical products. Some start at a hackathon, the way SmartCommute AI did.",
  },
  {
    word: "Build",
    text: "Full-stack web: Next.js and TypeScript on the front, Python and Supabase behind it. Flutter when it has to live on a phone.",
  },
  {
    word: "Real URL",
    text: "It isn't done until someone can open it. Four of the five projects below are live.",
  },
];

/**
 * Plate 01, how I build: the statement lights up as it is read, then the process as a real
 * three-step sequence (the only place the page numbers things that are a sequence).
 */
export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
      <div data-scroll className="scroll-rule pb-28 sm:pb-40">
        <PlateHeader id="about" n="01" slug="About" title="How I build" />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8 lg:col-start-3">
            <ScrollWords
              className="text-[clamp(1.6rem,3.2vw,2.75rem)] font-normal leading-[1.18] tracking-[-0.025em]"
              text="I'm a Computer Science student who likes building software people can use: small, practical products that start as an idea and end up on a real URL."
            />
            <p className="mt-8 max-w-[56ch] text-[1.0625rem] leading-relaxed text-graphite">
              I write a lot of Python, and it&apos;s usually where I start when I need to work something
              out. I&apos;m still learning the web properly, one project at a time, and I like hackathons,
              where a deadline forces you to decide what actually matters. SmartCommute AI started as a
              Smart India Hackathon project.
            </p>
          </div>
        </div>

        <ol className="process mt-20 grid border-t border-hairline sm:grid-cols-3 lg:mt-28">
          {steps.map((s, i) => (
            <li key={s.word} data-scroll className="process-step relative border-b border-hairline py-8 sm:border-b-0 sm:border-r sm:pr-8 sm:last:border-r-0 lg:py-10 [&:not(:first-child)]:sm:pl-8">
              <span className="font-mono text-[12px] text-graphite">{String(i + 1).padStart(2, "0")}</span>
              <p className="process-word mask mt-3">
                <span className="mask-inner">{s.word}</span>
              </p>
              <p className="row-rest mt-4 max-w-[34ch] text-[15px] leading-relaxed text-graphite">{s.text}</p>
              {i < steps.length - 1 && <span className="process-arrow" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
