"use client";

import { useEffect, useRef } from "react";

/**
 * Coordinate rulers along the left and top edges (desktop, fine pointer): tick marks every
 * 40px with a live readout of the cursor position and how far down the page you are. They
 * locate the visitor on the "sheet" and give the press-room grid a working purpose.
 * Direct DOM writes in a rAF; no React state per move. Hidden on touch and small screens.
 */
export default function Rulers() {
  const xRef = useRef<HTMLSpanElement>(null);
  const yRef = useRef<HTMLSpanElement>(null);
  const markX = useRef<HTMLSpanElement>(null);
  const markY = useRef<HTMLSpanElement>(null);
  const depth = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    let px = 0;
    let py = 0;
    let raf = 0;
    const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");
    const draw = () => {
      raf = 0;
      const docY = py + window.scrollY;
      if (xRef.current) xRef.current.textContent = `X ${pad(px)}`;
      if (yRef.current) yRef.current.textContent = `Y ${pad(docY)}`;
      if (markX.current) markX.current.style.transform = `translate3d(${px}px,0,0)`;
      if (markY.current) markY.current.style.transform = `translate3d(0,${py}px,0)`;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (depth.current) depth.current.textContent = `${String(Math.round((window.scrollY / Math.max(1, max)) * 100)).padStart(3, "0")}%`;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    kick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", kick);
    };
  }, []);

  return (
    <div className="rulers" aria-hidden="true" data-html2canvas-ignore="">
      <span className="ruler ruler--top">
        <span ref={markX} className="ruler__mark ruler__mark--x" />
      </span>
      <span className="ruler ruler--left">
        <span ref={markY} className="ruler__mark ruler__mark--y" />
      </span>
      <span className="ruler__readout">
        <span ref={xRef}>X 0000</span>
        <span ref={yRef}>Y 0000</span>
        <span ref={depth}>000%</span>
      </span>
    </div>
  );
}
