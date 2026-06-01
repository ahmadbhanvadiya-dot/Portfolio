"use client";

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl 
                    bg-white/5 backdrop-blur-md border border-white/10 
                    rounded-2xl z-50">
      
      <div className="flex justify-between items-center px-6 py-3">

        <h1 className="font-bold">Ahmad.dev</h1>

        <div className="flex gap-6 text-sm text-gray-300">
          <a href="#projects" className="hover:text-white transition">Projects</a>
          <a href="#skills" className="hover:text-white transition">Skills</a>
          <a href="#contact" className="hover:text-white transition">Contact</a>
        </div>

      </div>

    </nav>
  );
}