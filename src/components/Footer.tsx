import { site } from "@/data/site";
import { ArrowUp } from "./Icons";
import Year from "./Year";

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-5 border-t border-hairline py-8 text-[13px] text-graphite sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="text-ink">{site.name}</span> © <Year />
        </p>
        <div className="flex items-center gap-6 font-mono">
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="link -my-3 py-3 hover:text-ink">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="link -my-3 py-3 hover:text-ink">
            LinkedIn
          </a>
          <a href="#home" className="group -my-2.5 ml-auto inline-flex items-center gap-1.5 py-2.5 hover:text-ink sm:ml-4">
            Back to top
            <ArrowUp
              size={13}
              className="transition-transform duration-150 ease-out group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
