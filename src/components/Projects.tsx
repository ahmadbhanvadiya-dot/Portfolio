"use client";

import { motion } from "framer-motion";

export default function Projects() {
  const projects = [
  {
    title: "Freshlify",
    description:
      "A QR-powered platform that enables consumers to instantly access detailed product information, ingredients, nutritional data, and transparency insights by scanning a code.",
    category: "Full Stack",
    featured: true,
    github: "https://github.com/yourusername/freshlify",
    demo: "https://freshlify.vercel.app",
  },
  {
    title: "QR Health Scanner",
    description:
      "QR-based system for fast medical data access and scanning.",
    category: "Full Stack",
    github: "https://github.com/yourusername/qr-health-scanner",
    demo: "#",
  },
];

  return (
    <section id="projects" className="relative px-6 max-w-6xl mx-auto">
        

      {/* title */}
      <div className="text-center mb-16">
  <h2 className="text-4xl font-bold">
    Featured Projects
  </h2>

  <p className="mt-4 text-gray-400">
    A selection of projects I've built and shipped.
  </p>
</div>

      {/* grid */}
      <div className="grid md:grid-cols-2 gap-12">

        {projects.map((p, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
           className="relative p-6 rounded-2xl border border-purple-500/20 bg-white/5 backdrop-blur-md shadow-lg glow-hover"
                       
          >

            {/* glow background on hover */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition 
                            bg-gradient-to-r from-purple-500/10 to-blue-500/10" />

            <div className="relative z-10">

              <div className="flex items-center gap-2">

  <span className="text-xs px-3 py-1 rounded-full border border-white/20 text-gray-300">
    {p.category}
  </span>

  {p.featured && (
    <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
      Featured
    </span>
  )}

</div>

<h3 className="text-2xl font-semibold mt-4">
  {p.title}
</h3>

<p className="text-gray-400 mt-3 leading-relaxed">
  {p.description}
</p>

              <div className="mt-6 flex gap-3">

  <a
    href={p.github}
    target="_blank"
    rel="noopener noreferrer"
    className="px-4 py-2 rounded-lg border border-white/10 hover:border-purple-500/40 hover:bg-white/5 transition"
  >
    GitHub
  </a>

  <a
    href={p.demo}
    target="_blank"
    rel="noopener noreferrer"
    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition"
  >
    Live Demo
  </a>

</div>

            </div>

          </motion.div>
        ))}

      </div>

    </section>
  );
}