import { projects, site } from "@/data/site";
import HeroName from "./HeroName";
import { ArrowDown, ArrowUpRight } from "./Icons";
import { ColorBar, CropMarks, RegMark } from "./print";

const liveProjects = projects.filter((p) => p.live);

/**
 * Plate 00, the opening scene, composed as one poster:
 *
 *   slug line (plate, discipline)
 *   AHMAD / BHANVADIA.    the stage: the full column, nothing set over it
 *   ─────────────────── a rule ties the name to what follows
 *   live index (left)    statement panel (right): lime headline, text, actions
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
            {/* The statement: its own block, right of centre, under the surname. */}
            <div className="hero-spec">
              <CropMarks />
              <div className="hero-spec__meta">
                <span className="flex items-center gap-2.5">
                  <RegMark size={12} />
                  00.1 / Statement
                </span>
                <span>
                  {projects.length} built / {liveProjects.length} live
                </span>
              </div>
              <div className="hero-spec__body">
                <p className="hero-spec__headline">
                  <span className="highlight">I build things you can open.</span>
                </p>
                <p className="hero-spec__text">
                  Computer science student. So far: a bus-route planner for the Smart India
                  Hackathon, an emergency health profile behind a QR code and a record tool for
                  field drug tests. All live, all on{" "}
                  <a href={site.github} target="_blank" rel="noopener noreferrer" className="link-strong text-ink">
                    GitHub
                  </a>
                  .
                </p>
                <div className="hero-spec__actions">
                    <a
                      href="#work"
                      data-magnetic
                      className="press cta group inline-flex h-12 items-center gap-3 rounded-[3px] bg-ink pl-5 pr-4 font-mono text-[13px] uppercase tracking-[0.06em] text-paper"
                    >
                      Enter the work
                      <ArrowDown className="transition-transform duration-150 ease-out group-hover:translate-y-0.5" />
                    </a>
                    <a
                      href="#contact"
                      data-magnetic
                      className="link-strong -my-3 py-3 font-mono text-[13px] uppercase tracking-[0.06em]"
                    >
                      Get in touch
                    </a>
                </div>
              </div>
            </div>

            {/* The live projects, as an index under the first letters of the name. */}
            <nav aria-label="Live projects" className="hero-index">
              <p className="hero-index__label">
                <span>Live now</span>
                <span>{String(liveProjects.length).padStart(2, "0")}</span>
              </p>
              <ol>
                {liveProjects.map((p, i) => (
                  <li key={p.slug}>
                    <a href={p.live} target="_blank" rel="noopener noreferrer" className="hero-index__link nudge">
                      <span className="hero-index__n">{String(i + 1).padStart(2, "0")}</span>
                      <span className="hero-index__text">
                        <span className="hero-index__name">{p.name}</span>
                        <span className="hero-index__cat">{p.category}</span>
                      </span>
                      <ArrowUpRight size={12} className="nudge__arrow hero-index__arrow" />
                      <span className="sr-only"> (new tab)</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        <div
          className="enter flex flex-col gap-4 border-t border-hairline py-5 text-[13px] sm:flex-row sm:items-center sm:justify-between"
          style={{ ["--i" as string]: 5 }}
        >
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
