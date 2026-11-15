export const site = {
  name: "Ahmad Bhanvadiya",
  url: "https://portfolio-ahmadbhanvadiya.vercel.app",
  email: "bhanvadiyaahmad@gmail.com",
  github: "https://github.com/ahmadbhanvadiya-dot",
  linkedin: "https://www.linkedin.com/in/ahmad-bhanvadia-03e10",
  resume: "/Resume.pdf",
  description:
    "Computer science student building working software: a bus-route planner, an emergency health profile behind a QR code and a record tool for field drug tests.",
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
  /** Full-width screenshot of the live demo (captured at 1440px wide, top of the page). */
  preview?: { src: string; width: number; height: number };
  /**
   * Facts for the text-led plate when there is no screenshot to show: the screens in an
   * app's code, or the features its README lists.
   */
  index?: { label: string; items: string[] };
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
    preview: { src: "/work/smartcommute-page.png", width: 1440, height: 1062 },
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
    preview: { src: "/work/narcolens-page.png", width: 1440, height: 1326 },
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
    // Features as listed in the repository README.
    index: { label: "Features", items: ["Health profile", "QR access", "Emergency sharing"] },
  },
  {
    slug: "freshlify",
    name: "Freshlify",
    category: "Mobile app",
    description:
      "Tracks the freshness and expiry of everyday products. Scan a code or read a label with on-device text recognition, and get reminded before things go off.",
    stack: ["Flutter", "Dart", "ML Kit", "SQLite"],
    github: "https://github.com/ahmadbhanvadiya-dot/freshlifyv3",
    // lib/presentation in the repository; the repo holds no screenshots yet.
    index: { label: "Screens", items: ["Home", "Scanner", "Inventory", "Food items", "Product"] },
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
    preview: { src: "/work/meridian-page.png", width: 1440, height: 2700 },
  },
];

const SC = "SmartCommute AI";
const NL = "NarcoLens";
const VT = "Vitl";
const FL = "Freshlify";
const MR = "The Meridian Restro";

/**
 * Each skill lists the projects above that use it, read from their repositories
 * (package.json, pubspec.yaml, language stats, deploy target). An empty list means no
 * project on this page shows it yet; the page says so rather than inventing a link.
 */
export type Skill = { name: string; usedIn: string[] };

export const skills: { group: string; items: Skill[] }[] = [
  {
    group: "Languages",
    items: [
      { name: "Python", usedIn: [SC, NL] },
      { name: "TypeScript", usedIn: [SC, NL, VT] },
      { name: "JavaScript", usedIn: [] },
      { name: "C", usedIn: [] },
      { name: "Dart", usedIn: [FL] },
    ],
  },
  {
    group: "Frontend",
    items: [
      { name: "React", usedIn: [SC, NL, VT] },
      { name: "Next.js", usedIn: [SC, NL, VT] },
      { name: "Tailwind CSS", usedIn: [SC, NL, VT] },
      { name: "HTML", usedIn: [MR] },
      { name: "CSS", usedIn: [MR] },
    ],
  },
  {
    group: "Backend",
    items: [
      { name: "Node.js", usedIn: [] },
      { name: "FastAPI", usedIn: [SC] },
      { name: "Supabase", usedIn: [NL, VT] },
      { name: "REST APIs", usedIn: [SC] },
    ],
  },
  {
    group: "Mobile",
    items: [
      { name: "Flutter", usedIn: [FL] },
      { name: "React Native", usedIn: [SC] },
      { name: "Expo", usedIn: [SC] },
    ],
  },
  {
    group: "Tools",
    items: [
      { name: "Git", usedIn: [SC, NL, VT, FL, MR] },
      { name: "GitHub", usedIn: [SC, NL, VT, FL, MR] },
      { name: "VS Code", usedIn: [] },
      { name: "Vercel", usedIn: [SC, NL, VT] },
    ],
  },
];
