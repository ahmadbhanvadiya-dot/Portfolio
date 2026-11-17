import { site } from "@/data/site";
import HeroName from "./HeroName";
import HeroPress from "./HeroPress";
import { ArrowUpRight } from "./Icons";
import { RegMark } from "./print";

/**
 * Plate 00, the opening scene, composed as one poster:
 *
 *   slug line (plate, discipline)
 *   AHMAD                the stage: the full column, nothing set over it
 *   ─────────────────── a rule ties the name to what follows
 *   the Press            statement that decodes project by project, beside a pile of
 *                        proof prints you can fling through (HeroPress)
 *   status bar
 *
 * The name never shares a row with anything, so nothing can sit on it. Registration
 * marks frame the sheet. Full-bleed; the content keeps the 1400px grid.
 */
export default function Hero() {
  return (
    <section id="home" data-ink-fixh className="hero relative flex min-h-[100svh] flex-col overflow-hidden pt-14">
      {/* Sheet furniture: registration marks in the corners. */}
      <RegMark className="hero-reg hero-reg--tl" />
      <RegMark className="hero-reg hero-reg--tr" />
      <RegMark className="hero-reg hero-reg--bl" />
      <RegMark className="hero-reg hero-reg--br" />

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-5 sm:px-8 lg:px-12">
        <div
          className="enter flex items-center gap-10 pt-6 font-mono text-[11px] uppercase tracking-[0.08em] text-graphite sm:text-[12px]"
          style={{ ["--i" as string]: 0 }}
        >
          {/* Left-set: the top right belongs to the rulers' live readout. */}
          <span>Plate 00 / Portfolio</span>
          <span className="hidden sm:inline">Computer science / Full-stack / Python</span>
        </div>

        <div className="hero-stage flex flex-1 flex-col justify-center">
          <HeroName />

          <div className="hero-below enter" style={{ ["--i" as string]: 3 }}>
            <HeroPress />
          </div>
        </div>

        <div
          className="enter flex flex-col gap-4 border-t border-hairline py-5 text-[13px] sm:flex-row sm:items-center sm:justify-between"
          style={{ ["--i" as string]: 5 }}
        >
          <p className="hero-status">
            <span className="status-dot" aria-hidden="true" />
            <span>
              <span className="text-ink">Available for software engineering internships</span>
              <span className="text-graphite"> and select collaborations</span>
            </span>
          </p>
          <ul className="flex gap-6 font-mono text-graphite">
            {[
              { label: "GitHub", href: site.github },
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
