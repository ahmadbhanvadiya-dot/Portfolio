import { projects, site } from "@/data/site";
import HeroInk from "./HeroInk";
import HeroName from "./HeroName";
import { ArrowDown, ArrowUpRight } from "./Icons";
import { ColorBar, RegMark } from "./print";

const live = (slug: string) => projects.find((p) => p.slug === slug)?.live ?? site.github;
const liveCount = projects.filter((p) => p.live).length;

function Inline({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="link-strong text-ink">
      {children}
    </a>
  );
}

/**
 * Plate 00, the opening scene: the name at poster scale in two inks (HeroName), ink you can
 * drop on the sheet (HeroInk), registration marks framing it, and a spec panel that says
 * what is built and where to look. Full-bleed; the content keeps the 1200px grid.
 */
export default function Hero() {
  return (
    <section id="home" data-ink-fixh className="hero relative flex min-h-[100svh] flex-col overflow-hidden pt-14">
      <HeroInk />

      {/* Sheet furniture: registration marks in the corners, the plate's slug line. */}
      <RegMark className="hero-reg hero-reg--tl" />
      <RegMark className="hero-reg hero-reg--tr" />
      <RegMark className="hero-reg hero-reg--bl" />
      <RegMark className="hero-reg hero-reg--br" />

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-5 sm:px-8 lg:px-12">
        <div className="enter flex items-center justify-between gap-4 pt-6 font-mono text-[11px] uppercase tracking-[0.08em] text-graphite sm:text-[12px]" style={{ ["--i" as string]: 0 }}>
          <span>Plate 00 / Portfolio</span>
          <span className="hidden sm:inline">Computer science / Full-stack / Python</span>
          <span>
            {projects.length} built / {liveCount} live
          </span>
        </div>

        <div className="relative flex flex-1 flex-col justify-center py-8 lg:py-4">
          <HeroName />

          {/* The spec panel sits in the gap beside the short middle line on large screens. */}
          <div className="hero-spec enter mt-10 max-w-[30rem] lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:-translate-y-[10%]" style={{ ["--i" as string]: 3 }}>
            <p className="font-display text-[clamp(1.75rem,3vw,2.6rem)] font-bold uppercase leading-[0.95] tracking-[-0.01em]" style={{ fontVariationSettings: '"wdth" 112' }}>
              <span className="highlight">I build things you can open.</span>
            </p>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-graphite">
              Computer science student. So far: a bus-route planner for the Smart India Hackathon{" "}
              (<Inline href={live("smartcommute")}>SmartCommute AI</Inline>), an emergency health profile
              behind a QR code (<Inline href={live("vitl")}>Vitl</Inline>) and a record tool for field drug
              tests (<Inline href={live("narcolens")}>NarcoLens</Inline>). All live, all on{" "}
              <Inline href={site.github}>GitHub</Inline>.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a
                href="#work"
                data-magnetic
                className="press cta group inline-flex h-12 items-center gap-3 rounded-[3px] bg-ink pl-5 pr-4 font-mono text-[13px] uppercase tracking-[0.06em] text-paper"
              >
                Enter the work
                <ArrowDown className="transition-transform duration-150 ease-out group-hover:translate-y-0.5" />
              </a>
              <a href="#contact" data-magnetic className="link-strong -my-3 py-3 font-mono text-[13px] uppercase tracking-[0.06em]">
                Get in touch
              </a>
            </div>
          </div>
        </div>

        <div className="enter flex flex-col gap-4 border-t border-hairline py-5 text-[13px] sm:flex-row sm:items-center sm:justify-between" style={{ ["--i" as string]: 5 }}>
          <p className="flex items-center gap-4 text-ink">
            <ColorBar />
            <span className="flex items-center gap-2.5">
              <span className="status-dot" aria-hidden="true" />
              Open to internships &amp; collaborations
            </span>
          </p>
          <ul className="flex gap-6 font-mono text-graphite">
            {[
              { label: "LinkedIn", href: site.linkedin },
              { label: "Résumé", href: site.resume },
            ].map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link nudge -my-3 inline-flex items-center gap-1 py-3 hover:text-ink"
                >
                  {l.label}
                  <ArrowUpRight size={12} className="nudge__arrow" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
