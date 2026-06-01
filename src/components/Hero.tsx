"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center text-center px-6"
    >
      {/* background glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[140px] rounded-full top-[-120px] left-[-120px]" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full bottom-[-120px] right-[-120px]" />

      <div className="relative z-10 max-w-4xl">

        {/* badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-300"
        >
          Full-Stack Developer • Building modern web apps
        </motion.div>

        {/* headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight"
        >
          I build{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            modern digital experiences
          </span>
        </motion.h1>

        {/* subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-6 text-lg md:text-xl max-w-2xl mx-auto"
        >
          I’m a developer focused on building clean, fast, and scalable web applications
          using modern technologies like Next.js, React, and Python.
        </motion.p>

        {/* buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col md:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#projects"
            className="px-6 py-3 rounded-xl bg-white text-black font-medium 
           hover:scale-105 transition glow-hover"
          >
            View Projects
          </a>

          <a
            href="#contact"
            className="px-6 py-3 rounded-xl border border-purple-500/30 
           hover:bg-purple-500/10 transition"
          >
            Contact Me
          </a>

          <a
  href="https://github.com/ahmadbhanvadiya-dot"
  target="_blank"
  rel="noopener noreferrer"
  className="px-6 py-3 rounded-xl border border-purple-500/30 hover:bg-purple-500/10 transition"
>
  GitHub
</a>

        </motion.div>


      </div>
    </section>
  );
}