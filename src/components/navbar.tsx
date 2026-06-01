"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const sections = ["hero", "projects", "skills", "contact"];

    const handleScroll = () => {
      const pos = window.scrollY + 200;

      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;

        if (pos >= el.offsetTop && pos < el.offsetTop + el.offsetHeight) {
          setActive(id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClass = (id: string) =>
    `text-sm transition ${
      active === id
        ? "text-white font-semibold"
        : "text-gray-400 hover:text-white"
    }`;

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl 
                    bg-white/5 backdrop-blur-xl border border-white/10 
                    rounded-2xl z-50 shadow-lg">

      <div className="flex justify-between items-center px-6 py-3">

        <h1 className="font-bold">Portfolio</h1>

        <div className="flex gap-6">
          <a href="#hero" className={linkClass("hero")}>Home</a>
          <a href="#projects" className={linkClass("projects")}>Projects</a>
          <a href="#skills" className={linkClass("skills")}>Skills</a>
          <a href="#contact" className={linkClass("contact")}>Contact</a>
        </div>

      </div>
    </nav>
  );
}