"use client";

import { useEffect, useRef, useState } from "react";
import { navLinks, site } from "@/data/site";
import TextMorph from "./TextMorph";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [active, setActive] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
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
  }, [active]);
  // The bar's own look (hairline, name) is seen on every toggle: refresh it promptly.
  const firstBarState = useRef(true);
  useEffect(() => {
    if (firstBarState.current) {
      firstBarState.current = false;
      return;
    }
    window.dispatchEvent(new CustomEvent("ink:dirty", { detail: { urgent: true } }));
  }, [scrolled]);


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

  // Origin-aware menu: the sheet is revealed from the Menu button's own box. The button's
  // position is measured into the sheet's clip (on open, and on resize while open), so the
  // reveal starts and ends exactly on the trigger at any viewport size.
  const placeOrigin = () => {
    const b = menuButton.current?.getBoundingClientRect();
    const p = panel.current;
    if (!b || !p) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    p.style.setProperty("--m-top", `${b.top}px`);
    p.style.setProperty("--m-right", `${w - b.right}px`);
    p.style.setProperty("--m-bottom", `${h - b.bottom}px`);
    p.style.setProperty("--m-left", `${b.left}px`);
  };
  useEffect(() => {
    placeOrigin();
    window.addEventListener("resize", placeOrigin);
    return () => window.removeEventListener("resize", placeOrigin);
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
      className={`fixed inset-x-0 top-0 z-50 bg-paper transition-[border-color] duration-200 border-b ${
        scrolled || open ? "border-hairline" : "border-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="relative z-10 mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12"
      >
        <a
          href="#home"
          className="group -m-2 flex items-center gap-3 p-2"
          aria-label={`${site.name}, back to top`}
          onClick={() => setOpen(false)}
        >
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-[3px] bg-ink font-mono text-[11px] font-medium tracking-tight text-paper transition-transform duration-200 ease-out group-hover:-rotate-6"
          >
            AB
          </span>
          {/* Section readout: where you are on the sheet, morphing as you scroll. */}
          <span className="font-mono text-[12px] uppercase tracking-[0.08em]">
            <TextMorph
              parts={[
                { text: `${String(Math.max(0, navLinks.findIndex((l) => l.id === active))).padStart(2, "0")} / `, className: "text-graphite" },
                { text: active === "home" ? "Index" : (navLinks.find((l) => l.id === active)?.label ?? "") },
              ]}
            />
          </span>
        </a>

        <div className="flex items-center gap-1 md:gap-2">
          <ul className="mr-2 hidden items-center gap-6 md:flex">
            {navLinks.map((l) => {
              const isActive = active === l.id;
              return (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`nav-link relative py-2.5 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors duration-150 ${
                      isActive ? "text-ink" : "text-graphite hover:text-ink"
                    }`}
                  >
                    <span className="mr-1.5 text-[10px] text-graphite" aria-hidden="true">
                      {String(navLinks.indexOf(l)).padStart(2, "0")}
                    </span>
                    {l.label}
                    {/* Active: a lime bar printed under the label. */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 bottom-1 h-[3px] origin-left bg-lime transition-transform duration-200 ease-out ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <ThemeToggle />

          <button
            ref={menuButton}
            type="button"
            className="press -mr-2 flex h-11 items-center px-2 text-[14px] md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => {
              placeOrigin();
              setOpen((o) => !o);
            }}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {/* Mobile menu: drops in under the bar (absolute, so the header's own box stays 56px). */}
      <div
        id="mobile-menu"
        data-open={open ? "" : undefined}
        aria-hidden={!open}
        ref={panel}
        className="menu-panel fixed inset-x-0 top-0 h-[100dvh] overflow-y-auto bg-paper px-5 pb-10 pt-20 sm:px-8 md:hidden"
      >
        <ul className="flex flex-col">
          {navLinks.map((l, i) => (
            <li key={l.id} className="menu-item border-b border-hairline" style={{ ["--i" as string]: i }}>
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
        <div
          className="menu-item mt-6 flex flex-wrap gap-x-6 font-mono text-[13px] text-graphite"
          style={{ ["--i" as string]: navLinks.length }}
        >
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="link py-3 hover:text-ink">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="link py-3 hover:text-ink">
            LinkedIn
          </a>
          <a href={site.resume} target="_blank" rel="noopener noreferrer" className="link py-3 hover:text-ink">
            Résumé
          </a>
          <a href={`mailto:${site.email}`} className="link py-3 hover:text-ink">
            Email
          </a>
        </div>
      </div>
    </header>
  );
}
