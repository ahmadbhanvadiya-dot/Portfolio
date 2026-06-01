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
   <motion.section
  id="skills"
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>

      <div className="text-center mb-16">
  <h2 className="text-4xl font-bold">
    Skills & Technologies
  </h2>

  <p className="mt-4 text-gray-400">
    Tools and technologies I use to build modern applications.
  </p>
</div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {skills.map((skill, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
          className="p-4 rounded-xl border border-purple-500/20 bg-white/5 backdrop-blur-md shadow-lg glow-hover"
          >
            {skill}
          </motion.div>
        ))}

      </div>

   </motion.section>
  );
}