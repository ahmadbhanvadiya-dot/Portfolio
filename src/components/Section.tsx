import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  aside?: ReactNode;
  /**
   * Full width: the title sits above the content instead of in a sticky side column.
   * Used where the content itself needs the room (the work index and its preview).
   */
  wide?: boolean;
  children: ReactNode;
};

// Section titles sit above the content they introduce (project names top out at 2.25rem).
const titleClass =
  "text-[clamp(2rem,4vw,3.25rem)] font-medium leading-none tracking-[-0.035em]";
const asideClass = "max-w-[46ch] text-[14px] leading-relaxed text-graphite";

/** Shared section frame: hairline rule, then the title beside (or above) the content. */
export default function Section({ id, title, aside, wide = false, children }: SectionProps) {
  if (wide) {
    return (
      <section id={id} aria-labelledby={`${id}-title`} className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div data-scroll className="scroll-rule pb-24 pt-6 sm:pb-32">
          <div className="mb-10 grid gap-y-3 lg:mb-14 lg:grid-cols-12 lg:items-baseline lg:gap-x-10">
            <h2 id={`${id}-title`} className={`${titleClass} scroll-rise lg:col-span-5`}>
              {title}
            </h2>
            {aside && <div className={`${asideClass} lg:col-span-7`}>{aside}</div>}
          </div>
          {children}
        </div>
      </section>
    );
  }

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
      <div data-scroll className="scroll-rule grid gap-y-10 pb-24 pt-6 sm:pb-32 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24" data-ink-layer>
            <h2 id={`${id}-title`} className={`${titleClass} scroll-rise`}>
              {title}
            </h2>
            {aside && <div className={`mt-3 ${asideClass}`}>{aside}</div>}
          </div>
        </div>
        <div className="lg:col-span-9">{children}</div>
      </div>
    </section>
  );
}
