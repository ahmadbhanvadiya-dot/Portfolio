"use client";

import { motion } from "framer-motion";

export default function Projects() {
  const projects = [
    {
      title: "Medicine Dispensing System",
      desc: "Automates medicine scheduling and dispensing with smart logic.",
      tag: "IoT / Automation",
    },
    {
      title: "QR Health Scanner",
      desc: "QR-based system for fast medical data access and scanning.",
      tag: "Full Stack",
    },
  ];

  return (
    <section id="projects" className="relative px-6 max-w-6xl mx-auto">

      {/* title */}
      <h2 className="text-4xl font-bold mb-12 text-center">
        Featured Projects
      </h2>

      {/* grid */}
      <div className="grid md:grid-cols-2 gap-8">

        {projects.map((p, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="relative p-6 rounded-2xl border border-white/10 
                       bg-white/5 backdrop-blur-md overflow-hidden"
          >

            {/* glow background on hover */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition 
                            bg-gradient-to-r from-purple-500/10 to-blue-500/10" />

            <div className="relative z-10">

              {/* tag */}
              <span className="text-xs px-3 py-1 rounded-full border border-white/20 text-gray-300">
                {p.tag}
              </span>

              {/* title */}
              <h3 className="text-2xl font-semibold mt-4">
                {p.title}
              </h3>

              {/* description */}
              <p className="text-gray-400 mt-3 leading-relaxed">
                {p.desc}
              </p>

              {/* action */}
              <div className="mt-6 text-sm text-gray-300 hover:text-white cursor-pointer">
                View Details →
              </div>

            </div>

          </motion.div>
        ))}

      </div>

    </section>
  );
}