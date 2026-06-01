"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const sections = ["hero", "projects", "skills", "contact"];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;

      sections.forEach((section) => {
        const el = document.getElementById(section);
        if (!el) return;

        if (
          scrollPos >= el.offsetTop &&
          scrollPos < el.offsetTop + el.offsetHeight
        ) {
          setActive(section);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClass = (section: string) =>
    `transition ${
      active === section
        ? "text-white font-semibold"
        : "text-gray-400 hover:text-white"
    }`;

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl 
                    bg-white/5 backdrop-blur-md border border-white/10 
                    rounded-2xl z-50">

      <div className="flex justify-between items-center px-6 py-3">
        <h1 className="font-bold">Ahmad.dev</h1>

        <div className="flex gap-6 text-sm">
          <a href="#hero" className={linkClass("hero")}>Home</a>
          <a href="#projects" className={linkClass("projects")}>Projects</a>
          <a href="#skills" className={linkClass("skills")}>Skills</a>
          <a href="#contact" className={linkClass("contact")}>Contact</a>
        </div>
      </div>

    </nav>
  );
}