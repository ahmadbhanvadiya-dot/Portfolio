export const site = {
  name: "Ahmad Bhanvadiya",
  url: "https://portfolio-ahmadbhanvadiya.vercel.app",
  email: "bhanvadiyaahmad@gmail.com",
  github: "https://github.com/ahmadbhanvadiya-dot",
  linkedin: "https://www.linkedin.com/in/ahmad-bhanvadia-03e10",
  resume: "/Resume.pdf",
  description:
    "Computer Science student and developer exploring the intersection of software engineering, product thinking, and creative technology.",
};

export const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

export type Project = {
  slug: string;
  name: string;
  category: string;
  description: string;
  stack: string[];
  github: string;
  live?: string;
  /** Screenshot of the live demo, captured from the deployed site. */
  preview?: string;
};

export const projects: Project[] = [
  {
    slug: "smartcommute",
    name: "SmartCommute AI",
    category: "Web + mobile app",
    description:
      "Transit route planning on real TGSRTC bus data with transfer detection and journey-time analysis, plus a logistics side for freight routes and cost estimates.",
    stack: ["Next.js", "TypeScript", "FastAPI", "Leaflet", "OpenStreetMap", "Expo"],
    github: "https://github.com/ahmadbhanvadiya-dot/Smartcommute-web",
    live: "https://smartcommute-web-three.vercel.app",
    preview: "/work/smartcommute.png",
  },
  {
    slug: "narcolens",
    name: "NarcoLens",
    category: "Web app",
    description:
      "A digital companion for field drug testing: officers document presumptive tests, attach images for analysis, and verify records later.",
    stack: ["Next.js", "TypeScript", "Supabase", "Python"],
    github: "https://github.com/ahmadbhanvadiya-dot/narcolens",
    live: "https://narcolens.vercel.app",
    preview: "/work/narcolens.png",
  },
  {
    slug: "vitl",
    name: "Vitl",
    category: "Health tech",
    description:
      "A digital health profile behind a QR code, so the medical details that matter in an emergency are one scan away.",
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    github: "https://github.com/ahmadbhanvadiya-dot/vitl",
    live: "https://vitl-delta.vercel.app",
  },
  {
    slug: "freshlify",
    name: "Freshlify",
    category: "Mobile app",
    description:
      "Tracks the freshness and expiry of everyday products. Scan a code or read a label with on-device text recognition, and get reminded before things go off.",
    stack: ["Flutter", "Dart", "ML Kit", "SQLite"],
    github: "https://github.com/ahmadbhanvadiya-dot/freshlifyv3",
  },
  {
    slug: "meridian",
    name: "The Meridian Restro",
    category: "Website",
    description:
      "A responsive website for a restaurant: menu, specialties, cuisines and contact, built by hand without a framework.",
    stack: ["HTML", "CSS"],
    github: "https://github.com/ahmadbhanvadiya-dot/MeridianRestro",
    live: "https://themeridianrestro.netlify.app",
    preview: "/work/meridian.png",
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "TypeScript", "JavaScript", "C", "Dart"] },
  { group: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "HTML", "CSS"] },
  { group: "Backend", items: ["Node.js", "FastAPI", "Supabase", "REST APIs"] },
  { group: "Mobile", items: ["Flutter", "React Native", "Expo"] },
  { group: "Tools", items: ["Git", "GitHub", "VS Code", "Vercel"] },
];
