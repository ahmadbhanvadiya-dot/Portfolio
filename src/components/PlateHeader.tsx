import type { ReactNode } from "react";
import { PlateNumber, RegMark } from "./print";

type Props = {
  id: string;
  n: string;
  slug: string;
  title: ReactNode;
  aside?: ReactNode;
};

/**
 * The head of every plate (section): a slug line like a press sheet's, an outline plate
 * number the title prints over, and the title at display scale sliding up through a mask
 * the first time it is seen. The parent sets `data-scroll` and `.scroll-rule`.
 */
export default function PlateHeader({ id, n, slug, title, aside }: Props) {
  return (
    <header className="relative mb-12 lg:mb-20">
      <PlateNumber n={n} className="plate-head__number" />
      <div className="flex items-center justify-between gap-4 pt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-graphite sm:text-[12px]">
        <span className="flex items-center gap-3">
          <RegMark size={14} />
          Plate {n} / {slug}
        </span>
        <span aria-hidden="true">{id.toUpperCase()}.SHEET</span>
      </div>
      <div className="relative mt-8 grid gap-6 lg:mt-14 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 id={`${id}-title`} className="plate-title mask lg:col-span-8">
          <span className="mask-inner">{title}</span>
        </h2>
        {aside && <div className="max-w-[40ch] text-[15px] leading-relaxed text-graphite lg:col-span-4 lg:pb-3">{aside}</div>}
      </div>
    </header>
  );
}
