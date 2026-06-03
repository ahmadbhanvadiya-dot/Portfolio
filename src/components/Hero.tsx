"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center text-center px-6"
      
    >
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[140px] rounded-full top-[-120px] left-[-120px]" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full bottom-[-120px] right-[-120px]" />

      <div className="relative z-10 max-w-5xl">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex items-center px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-sm mb-6"
        >
          🚀 Open to Internships & Collaborations
        </motion.div>

        {/* Name */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl font-semibold text-gray-300 mb-4"
        >
          Ahmad Bhanvadiya
        </motion.h2>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl md:text-8xl font-extrabold leading-tight tracking-tight"
        >
          Turning Ideas{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            Into Real Products
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-8 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
        >
          Computer Science student passionate about building web applications,
          automation systems, and innovative products. I enjoy transforming
          ideas into practical solutions using Next.js, TypeScript, Python,
          and modern technologies.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-col md:flex-row gap-4 justify-center items-center"
        >
          {/* Primary CTA */}
          <a
            href="#projects"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition"
          >
            View Projects
          </a>

          {/* Contact */}
          <a
            href="#contact"
            className="px-6 py-3 rounded-xl border border-purple-500/30 hover:bg-purple-500/10 transition"
          >
            Contact Me
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/ahmadbhanvadiya-dot"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-purple-500/30 hover:bg-purple-500/10 transition"
          >
            GitHub
          </a>

          {/* Resume */}
          <a
            href="/Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-purple-500/30 hover:bg-purple-500/10 transition"
          >
            Resume
          </a>
        </motion.div>
      </div>
    </section>
  );
}