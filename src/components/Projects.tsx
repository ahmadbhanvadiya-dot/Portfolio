"use client";

import { motion } from "framer-motion";

export default function Projects() {
  return (
    <section id="projects" className="py-20 px-6 max-w-5xl mx-auto">
      
      <h2 className="text-3xl font-bold mb-10">Projects</h2>

      <div className="grid md:grid-cols-2 gap-6">

        {[
          {
            title: "Medicine Dispensing System",
            desc: "Automates medicine scheduling and dispensing.",
          },
          {
            title: "QR Health Scan System",
            desc: "QR-based medical data scanning system.",
          }
        ].map((project, i) => (
          
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur"
          >
            <h3 className="text-xl font-semibold">{project.title}</h3>
            <p className="text-gray-400 mt-2">{project.desc}</p>
          </motion.div>

        ))}

      </div>

    </section>
  );
}