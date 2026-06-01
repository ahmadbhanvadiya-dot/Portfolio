"use client";

export default function Projects() {
  const projects = [
    {
      title: "Medicine Dispensing System",
      desc: "Automates medicine scheduling with smart logic."
    },
    {
      title: "QR Health System",
      desc: "Scans QR and processes medical data digitally."
    }
  ];

  return (
    <section id="projects" className="py-24 px-6 max-w-6xl mx-auto">

      <h2 className="text-3xl font-bold mb-10">Things I’ve Built</h2>

      <div className="grid md:grid-cols-2 gap-6">

        {projects.map((p, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 
                       hover:bg-white/10 hover:scale-[1.03] transition"
          >
            <h3 className="text-xl font-semibold">{p.title}</h3>
            <p className="text-gray-400 mt-2">{p.desc}</p>
          </div>
        ))}

      </div>

    </section>
  );
}