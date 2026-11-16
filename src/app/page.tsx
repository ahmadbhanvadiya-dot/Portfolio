import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollMotion from "@/components/ScrollMotion";
import SmartCursor from "@/components/SmartCursor";
import Rulers from "@/components/Rulers";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
      <ScrollMotion />
      <SmartCursor />
      <Rulers />
      <div className="grain" aria-hidden="true" data-html2canvas-ignore="" />
    </>
  );
}
