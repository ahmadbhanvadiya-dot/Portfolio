import { site } from "@/data/site";
import { ArrowUp } from "./Icons";
import { ColorBar, RegMark } from "./print";
import Year from "./Year";

/** The colophon: what the sheet was printed with, and the way back to the top. */
export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
      <div className="grid gap-6 border-t border-hairline py-8 font-mono text-[12px] text-graphite sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-3">
          <p className="flex items-center gap-3 text-ink">
            <RegMark size={14} />
            {site.name} © <Year />
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 uppercase tracking-[0.06em]">
            <ColorBar />
            <span>Printed in two inks / Anybody, Schibsted Grotesk, Geist Mono</span>
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="link -my-3 py-3 hover:text-ink">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="link -my-3 py-3 hover:text-ink">
            LinkedIn
          </a>
          <a href="#home" className="group -my-2.5 ml-auto inline-flex items-center gap-1.5 py-2.5 hover:text-ink sm:ml-4">
            Back to top
            <ArrowUp size={13} className="transition-transform duration-150 ease-out group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
