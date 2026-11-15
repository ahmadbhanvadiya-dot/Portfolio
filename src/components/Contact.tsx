import { site } from "@/data/site";
import CopyEmail from "./CopyEmail";
import { ArrowUpRight } from "./Icons";

const elsewhere = [
  { label: "GitHub", handle: "ahmadbhanvadiya-dot", href: site.github },
  { label: "LinkedIn", handle: "ahmad-bhanvadia-03e10", href: site.linkedin },
  { label: "Résumé", handle: "PDF", href: site.resume },
];

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10"
    >
      <div data-scroll className="scroll-rule pb-24 pt-16 sm:pb-32 sm:pt-20">
        <h2
          id="contact-title"
          className="scroll-rise max-w-[14ch] text-[clamp(2.125rem,6.6vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.04em]"
        >
          Have something interesting in mind?
        </h2>
        <p className="mt-8 max-w-[46ch] text-[1.0625rem] leading-relaxed text-graphite sm:text-[1.25rem] sm:leading-[1.55]">
          I&apos;m always interested in building useful things, exploring new ideas, and
          connecting with people who enjoy creating.
        </p>

        <div className="mt-12 flex flex-col items-start gap-5 sm:mt-16 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
          <a
            href={`mailto:${site.email}`}
            className="link-strong -my-2 break-all py-2 text-[clamp(1.25rem,3.4vw,2.25rem)] font-medium tracking-[-0.03em] transition-colors hover:text-accent"
          >
            {site.email}
          </a>
          <CopyEmail email={site.email} />
        </div>

        <ul className="mt-16 grid border-t border-hairline sm:mt-20 sm:grid-cols-3">
          {elsewhere.map((l) => (
            <li key={l.label} className="border-b border-hairline sm:border-b-0">
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-5 sm:pr-8"
              >
                <span>
                  <span className="block text-[15px] font-medium">{l.label}</span>
                  <span className="mt-0.5 block font-mono text-[12px] text-graphite">{l.handle}</span>
                </span>
                <ArrowUpRight
                  size={18}
                  className="text-graphite transition-[transform,color] duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
