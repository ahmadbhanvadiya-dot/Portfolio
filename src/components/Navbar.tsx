"use client";

import { useEffect, useRef, useState } from "react";
import { navLinks, site } from "@/data/site";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [active, setActive] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const pendingTarget = useRef<string | null>(null);

  // Menu links: close first, then scroll once the scroll lock has been released.
  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    pendingTarget.current = id;
    setOpen(false);
  };

  useEffect(() => {
    if (open || !pendingTarget.current) return;
    const id = pendingTarget.current;
    pendingTarget.current = null;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }, [open]);

  // The header is in the ink snapshots: report state that changes it without a layout change.
  const firstNavState = useRef(true);
  useEffect(() => {
    if (firstNavState.current) {
      firstNavState.current = false;
      return;
    }
    window.dispatchEvent(new Event("ink:dirty"));
  }, [active, scrolled]);

  // The ink snapshots don't include the open menu; the transition cross-fades instead.
  useEffect(() => {
    const root = document.documentElement;
    if (open) root.dataset.menu = "open";
    else delete root.dataset.menu;
  }, [open]);

  // Hairline under the bar once the page has moved.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which section sits in the middle band of the viewport.
  useEffect(() => {
    const sections = navLinks
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Mobile menu: lock scroll, close on Escape or when widening past the breakpoint.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <header
      data-ink-layer
      className={`fixed inset-x-0 top-0 z-50 bg-paper transition-[border-color] duration-300 border-b ${
        scrolled || open ? "border-hairline" : "border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:px-10"
      >
        <a
          href="#home"
          className="group flex items-center gap-3"
          aria-label={`${site.name}, back to top`}
          onClick={() => setOpen(false)}
        >
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-[3px] bg-ink font-mono text-[11px] font-medium tracking-tight text-paper transition-transform duration-500 ease-out-expo group-hover:-rotate-6"
          >
            AB
          </span>
          <span className="hidden text-[15px] font-medium tracking-[-0.01em] sm:block">
            {site.name}
          </span>
        </a>

        <div className="flex items-center gap-1 md:gap-2">
          <ul className="mr-2 hidden items-center gap-7 md:flex">
            {navLinks.map((l) => {
              const isActive = active === l.id;
              return (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative py-1 text-[14px] transition-colors duration-200 ${
                      isActive ? "text-ink" : "text-graphite hover:text-ink"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute -left-3 top-1/2 size-1 -translate-y-1/2 rounded-full bg-accent transition-[opacity,transform] duration-300 ${
                        isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                      }`}
                    />
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <ThemeToggle />

          <button
            ref={menuButton}
            type="button"
            className="-mr-2 flex h-9 items-center px-2 text-[14px] md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="h-[calc(100dvh-3.5rem)] overflow-y-auto bg-paper px-5 pb-10 pt-6 sm:px-8 md:hidden"
      >
        <ul className="flex flex-col">
          {navLinks.map((l, i) => (
            <li key={l.id} className="enter border-b border-hairline" style={{ ["--i" as string]: i }}>
              <a
                ref={i === 0 ? firstLink : undefined}
                href={`#${l.id}`}
                onClick={(e) => goTo(e, l.id)}
                className={`flex items-baseline justify-between py-4 text-[2rem] font-medium leading-none tracking-[-0.03em] ${
                  active === l.id ? "text-ink" : "text-graphite"
                }`}
              >
                {l.label}
                {active === l.id && (
                  <span aria-hidden="true" className="size-1.5 -translate-y-2 rounded-full bg-accent" />
                )}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex gap-6 font-mono text-[13px] text-graphite">
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="link hover:text-ink">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="link hover:text-ink">
            LinkedIn
          </a>
          <a href={`mailto:${site.email}`} className="link hover:text-ink">
            Email
          </a>
        </div>
      </div>
    </header>
  );
}
