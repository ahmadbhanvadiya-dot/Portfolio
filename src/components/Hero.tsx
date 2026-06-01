"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="h-screen flex flex-col items-center justify-center text-center px-6">
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-6xl font-bold"
      >
        Ahmad
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-xl text-gray-400 mt-4"
      >
        Full-Stack Developer | Python Builder | CS Student
      </motion.p>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-gray-500 mt-3 max-w-xl"
      >
        I build real-world software using modern web technologies and Python.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex gap-4"
      >
        <a href="#projects" className="px-5 py-2 bg-white text-black rounded-xl">
          View Projects
        </a>
        <a href="#contact" className="px-5 py-2 border border-white rounded-xl">
          Contact
        </a>
      </motion.div>

    </section>
  );
}