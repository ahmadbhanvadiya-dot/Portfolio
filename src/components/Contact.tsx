import { site } from "@/data/site";
import CopyEmail from "./CopyEmail";
import { ArrowUpRight } from "./Icons";
import { PlateNumber, RegMark } from "./print";

const elsewhere = [
  { label: "GitHub", handle: "ahmadbhanvadiya-dot", href: site.github },
  { label: "LinkedIn", handle: "ahmad-bhanvadia-03e10", href: site.linkedin },
  { label: "Résumé", handle: "PDF", href: site.resume },
];

const HEADLINE = "Have something interesting in mind?";

/**
 * Plate 04, the last sheet: the question at poster scale, printed in two inks like the
 * name on Plate 00, and the address marked with the highlighter.
 */
export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
      <div data-scroll className="scroll-rule relative pb-24 sm:pb-32">
        <PlateNumber n="04" className="plate-head__number" />
        <div className="flex items-center justify-between gap-4 pt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-graphite sm:text-[12px]">
          <span className="flex items-center gap-3">
            <RegMark size={14} />
            Plate 04 / Contact
          </span>
          <span aria-hidden="true">CONTACT.SHEET</span>
        </div>

        <h2 id="contact-title" className="contact-title mask mt-10 lg:mt-16">
          <span className="mask-inner relative block">
            <span className="contact-title__ink">{HEADLINE}</span>
            <span className="contact-title__blue" aria-hidden="true">
              {HEADLINE}
            </span>
          </span>
        </h2>

        <div className="mt-12 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          <p className="row-rest max-w-[42ch] text-[1.0625rem] leading-relaxed text-graphite sm:text-[1.25rem] sm:leading-[1.55] lg:col-span-5">
            I&apos;m always interested in building useful things, exploring new ideas, and
            connecting with people who enjoy creating.
          </p>
          <div className="row-rest flex flex-col items-start gap-5 lg:col-span-7 lg:items-end">
            <a
              href={`mailto:${site.email}`}
              data-cursor="Write"
              className="contact-email -my-2 break-all py-2 font-display text-[clamp(1.4rem,3.6vw,2.75rem)] font-bold"
            >
              <span className="highlight">{site.email}</span>
            </a>
            <CopyEmail email={site.email} />
          </div>
        </div>

        <ul className="row-rest mt-16 grid border-t border-hairline sm:mt-24 sm:grid-cols-3">
          {elsewhere.map((l, i) => (
            <li key={l.label} className="border-b border-hairline sm:border-b-0 sm:border-r sm:last:border-r-0">
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-6 sm:px-6 sm:first:pl-0"
              >
                <span>
                  <span className="font-mono text-[11px] text-graphite">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-1 block font-display text-[22px] font-bold uppercase" style={{ fontVariationSettings: '"wdth" 90' }}>
                    {l.label}
                  </span>
                  <span className="mt-0.5 block font-mono text-[12px] text-graphite">{l.handle}</span>
                </span>
                <ArrowUpRight
                  size={20}
                  className="text-graphite transition-[transform,color] duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
