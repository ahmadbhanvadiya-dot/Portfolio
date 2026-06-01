export default function Hero() {
  return (
    <section className="h-screen flex flex-col items-center justify-center text-center px-6">
      
      <h1 className="text-5xl md:text-6xl font-bold">
        Ahmad
      </h1>

      <p className="text-xl text-gray-400 mt-4">
        Computer Science Student | Full-Stack Developer | Python Builder
      </p>

      <p className="text-gray-500 mt-3 max-w-xl">
        I build real-world software using modern web technologies and Python, focusing on clean design and practical problem solving.
      </p>

      <div className="mt-6 flex gap-4">
        <a href="#projects" className="px-5 py-2 bg-white text-black rounded-xl">
          View Projects
        </a>
        <a href="#contact" className="px-5 py-2 border border-white rounded-xl">
          Contact
        </a>
      </div>

    </section>
  );
}