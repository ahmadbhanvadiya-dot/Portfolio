"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section
      id="about"
      className="max-w-5xl mx-auto px-6 py-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold text-center mb-8">
          About Me
        </h2>

        <p className="text-lg text-gray-400 leading-relaxed text-center max-w-3xl mx-auto">
          I'm Ahmad Bhanvadiya, a Computer Science student passionate about
          building real-world software products. I enjoy creating modern web
          applications, exploring new technologies, participating in hackathons,
          and turning ideas into practical solutions. My interests include
          full-stack development, automation, and building products that solve
          meaningful problems.
        </p>
      </motion.div>
    </section>
  );
}