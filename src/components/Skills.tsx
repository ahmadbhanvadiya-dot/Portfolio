export default function Skills() {
  const skills = [
    "Python",
    "JavaScript",
    "TypeScript",
    "Next.js",
    "React",
    "Tailwind CSS",
    "Git",
    "Node.js",
  ];

  return (
    <section id="projects" className="scroll-mt-24 py-28 px-6">
        <section id="skills"></section>

      <h2 className="text-4xl font-bold mb-12">
        Skills & Tools
      </h2>

      <div className="flex flex-wrap gap-4">

        {skills.map((skill, i) => (
          <div
            key={i}
            className="px-5 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md glow glow-hover"
                       
          >
            {skill}
          </div>
        ))}

      </div>

    </section>
  );
}