"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute w-[400px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full top-10"></div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl md:text-7xl font-bold"
      >
        I build things for the web
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 mt-6 max-w-xl"
      >
        Full-Stack Developer • Python Builder • CS Student  
        I turn ideas into real, working software.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex gap-4"
      >
        <a className="px-6 py-3 bg-white text-black rounded-xl hover:scale-105 transition">
          View Projects
        </a>

        <a className="px-6 py-3 border border-white/20 rounded-xl hover:bg-white/10 transition">
          Contact Me
        </a>
      </motion.div>

    </section>
  );
}