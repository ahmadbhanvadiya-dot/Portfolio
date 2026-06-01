"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section
      id="about"
      className="max-w-5xl mx-auto px-6 py-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold text-center mb-8">
          About Me
        </h2>

        <p className="text-lg text-gray-400 leading-relaxed text-center max-w-3xl mx-auto">
          I'm Ahmad Bhanvadiya, a Computer Science student who loves building software that solves real-world problems. I enjoy creating modern web applications, experimenting with new technologies, and participating in hackathons. Whether it's developing full-stack projects, automating tasks, or turning an idea into a working product, I'm always excited to learn, build, and create solutions that make a meaningful impact.
        </p>
      </motion.div>
    </section>
  );
}