export default function Skills() {
  const skills = [
    "Python",
    "JavaScript",
    "TypeScript",
    "Next.js",
    "React",
    "Tailwind CSS",
    "Git",
    "APIs",
  ];

  return (
    <section id="skills" className="py-20 px-6 max-w-5xl mx-auto">
      
      <h2 className="text-3xl font-bold mb-10">Skills</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {skills.map((skill, i) => (
          <div
            key={i}
            className="p-4 border border-white/10 rounded-xl bg-white/5 text-center hover:bg-white/10 transition"
          >
            {skill}
          </div>
        ))}
      </div>

    </section>
  );
}