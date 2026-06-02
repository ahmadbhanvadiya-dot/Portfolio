export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-32">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-500 text-sm">
          © 2026 Ahmad Bhanvadiya. All rights reserved.
        </p>

        <div className="flex gap-6 mt-4 md:mt-0">

          <a
            href="https://www.instagram.com/ahmad.bhanvadia/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            Insta
          </a>
          <a
            href="https://github.com/ahmadbhanvadiya-dot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/ahmad-bhanvadia-03e10"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}