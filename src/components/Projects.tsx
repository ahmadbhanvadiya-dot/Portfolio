export default function Projects() {
  return (
    <section id="projects" className="py-20 px-6 max-w-5xl mx-auto">
      
      <h2 className="text-3xl font-bold mb-10">Projects</h2>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="p-6 border border-white/10 rounded-xl">
          <h3 className="text-xl font-semibold">Medicine Dispensing System</h3>
          <p className="text-gray-400 mt-2">
            Automated system to improve medication adherence.
          </p>
        </div>

        <div className="p-6 border border-white/10 rounded-xl">
          <h3 className="text-xl font-semibold">QR Health Scan System</h3>
          <p className="text-gray-400 mt-2">
            QR-based medical data scanning system.
          </p>
        </div>

      </div>

    </section>
  );
}