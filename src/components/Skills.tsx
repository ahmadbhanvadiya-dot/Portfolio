"use client";

import { motion } from "framer-motion";

export default function Skills() {
  const skills = [
    "Python",
    "JavaScript",
    "TypeScript",
    "Next.js",
    "React",
    "Tailwind CSS",
    "Node.js",
    "Git",
  ];

  return (
    <section id="skills" className="px-6 max-w-6xl mx-auto">

      <h2 className="text-4xl font-bold text-center tracking-tight">
        Skills & Technologies
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {skills.map((skill, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg glow-hover"
          >
            {skill}
          </motion.div>
        ))}

      </div>

    </section>
  );
}