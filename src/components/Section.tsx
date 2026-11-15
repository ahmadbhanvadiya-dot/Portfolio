import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
};

/** Shared section frame: hairline rule, title in the left column, content on the right. */
export default function Section({ id, title, aside, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10"
    >
      <div className="grid gap-y-10 border-t border-hairline pb-24 pt-6 sm:pb-32 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <h2 id={`${id}-title`} className="text-[15px] font-medium tracking-[-0.01em]">
              {title}
            </h2>
            {aside && <div className="mt-2 text-[14px] leading-relaxed text-graphite">{aside}</div>}
          </div>
        </div>
        <div className="lg:col-span-9">{children}</div>
      </div>
    </section>
  );
}
