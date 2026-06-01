"use client";

import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section
      id="contact"
      className="max-w-6xl mx-auto px-6 py-32"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold">
          Let's Connect
        </h2>

        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
          I'm always interested in collaborating on projects, hackathons,
          internships, and exciting opportunities in tech.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {/* GitHub */}
        <a
          href="https://github.com/ahmadbhanvadiya-dot"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 rounded-2xl border border-purple-500/20 bg-white/5 backdrop-blur-md glow-hover text-center"
        >
          <h3 className="text-xl font-semibold mb-2">
            GitHub
          </h3>

          <p className="text-gray-400 text-sm">
            Explore my projects and open-source work.
          </p>
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/ahmad-bhanvadia-03e10"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 rounded-2xl border border-purple-500/20 bg-white/5 backdrop-blur-md glow-hover text-center"
        >
          <h3 className="text-xl font-semibold mb-2">
            LinkedIn
          </h3>

          <p className="text-gray-400 text-sm">
            Connect with me professionally.
          </p>
        </a>

        {/* Email */}
        <a
          href="mailto:bhanvadiyaahmad@gmail.com"
          className="p-6 rounded-2xl border border-purple-500/20 bg-white/5 backdrop-blur-md glow-hover text-center"
        >
          <h3 className="text-xl font-semibold mb-2">
            Email
          </h3>

          <p className="text-gray-400 text-sm">
            bhanvadiyaahmad@gmail.com
          </p>
        </a>
      </motion.div>
    </section>
  );
}