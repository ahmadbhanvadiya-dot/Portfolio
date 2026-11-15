import { site } from "@/data/site";
import { ArrowDown, ArrowUpRight } from "./Icons";

const metaLinks = [
  { label: "GitHub", href: site.github, external: true },
  { label: "LinkedIn", href: site.linkedin, external: true },
  { label: "Résumé", href: site.resume, external: true },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="mx-auto mb-14 flex min-h-[100svh] max-w-[1200px] flex-col px-5 pt-14 sm:mb-20 sm:px-8 lg:px-10"
    >
      <div className="flex flex-1 flex-col justify-center py-16 sm:py-24">
        <h1 className="max-w-[15ch] text-[clamp(2.5rem,7.4vw,5.75rem)] font-medium leading-[0.98] tracking-[-0.04em]">
          <span className="enter block" style={{ ["--i" as string]: 0 }}>
            Ahmad Bhanvadiya.
          </span>
          <span className="enter block text-graphite" style={{ ["--i" as string]: 1 }}>
            Building thoughtful digital experiences.
          </span>
        </h1>

        <p
          className="enter mt-8 max-w-[52ch] text-[1.0625rem] leading-relaxed text-graphite sm:mt-10 sm:text-[1.25rem] sm:leading-[1.55]"
          style={{ ["--i" as string]: 3 }}
        >
          Computer Science student and developer exploring the intersection of software
          engineering, product thinking, and creative technology. I enjoy turning ideas
          into useful real-world products.
        </p>

        <div
          className="enter mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"
          style={{ ["--i" as string]: 4 }}
        >
          <a
            href="#work"
            className="group inline-flex h-11 items-center gap-2.5 rounded-[4px] bg-ink pl-5 pr-4 text-[15px] font-medium text-paper transition-[transform,background-color] duration-300 ease-out-expo hover:bg-accent hover:text-accent-ink active:scale-[0.98]"
          >
            View selected work
            <ArrowDown className="transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5" />
          </a>
          <a href="#contact" className="link-strong text-[15px] font-medium">
            Get in touch
          </a>
        </div>
      </div>

      <div
        className="enter flex flex-col gap-4 border-t border-hairline py-5 text-[13px] sm:flex-row sm:items-center sm:justify-between"
        style={{ ["--i" as string]: 6 }}
      >
        <p className="flex items-center gap-2.5 text-ink">
          <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
          Open to internships &amp; collaborations
        </p>
        <ul className="flex gap-6 font-mono text-graphite">
          {metaLinks.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link inline-flex items-center gap-1 hover:text-ink"
              >
                {l.label}
                <ArrowUpRight size={12} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
