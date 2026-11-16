"use client";

import { useEffect, useRef } from "react";

/**
 * Ink in the hero: the pointer leaves a faint trail of drops and a click or tap lets a
 * full drop bleed into the paper, with a few satellite droplets, using the same organic
 * edge as the theme transition (shared noise texture, domain-warped fbm, pigment rim).
 *
 * Purpose: the page's signature material answers the visitor on the first screen.
 * Performance: one small WebGL2 canvas behind the hero text, at most 1.5x DPR; it renders
 * only while ink is alive and the hero is on screen, then stops. Off under reduced motion
 * and without WebGL2 (the hero is complete without it). Kept out of the ink snapshots.
 */

const MAX_DROPS = 64;

const VERT = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = (cells: number) => /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uNoise;
uniform vec2 uRes;      // device px
uniform float uDpr;
uniform float uTime;
uniform int uCount;
uniform vec4 uDrops[${MAX_DROPS}]; // x, y (CSS px), birth (s), size (CSS px)
uniform vec3 uInk;
uniform float uStrength;
out vec4 outColor;

const float INV_CELLS = 1.0 / ${cells.toFixed(1)};
float gnoise(vec2 p) { return textureLod(uNoise, p * INV_CELLS, 0.0).r * 2.0 - 1.0; }
float gnoise2(vec2 p) { return textureLod(uNoise, p * INV_CELLS, 0.0).g * 2.0 - 1.0; }
const mat2 OCT = mat2(0.8, 0.6, -0.6, 0.8) * 2.03;
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * gnoise(p); p = OCT * p + 17.13; a *= 0.5; }
  return s / 0.9375;
}

void main() {
  vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  // Shared fields, computed once per pixel: a slow warp for the edges, paper fibres.
  vec2 q = css / 180.0;
  float warp = fbm(q + vec2(0.0, uTime * 0.02));
  float fibre = gnoise2(css * 0.33) * 0.65 + gnoise2(OCT * css * 0.33 + 5.3) * 0.35;

  float cover = 0.0;
  for (int i = 0; i < ${MAX_DROPS}; i++) {
    if (i >= uCount) break;
    vec4 d = uDrops[i];
    float age = uTime - d.z;
    if (age < 0.0) continue;
    // Bleeds out fast, then creeps (capillary), and dries away after a while.
    float grow = 1.0 - exp(-age * 2.6) + age * 0.015;
    float R = d.w * grow;
    float dry = exp(-max(0.0, age - 1.6) / 2.4);
    if (dry < 0.01) continue;
    vec2 rel = css - d.xy;
    float dist = length(rel);
    if (dist > R * 1.6 + 24.0) continue;
    vec2 dir = rel / max(dist, 1e-3);
    float seed = float(i) * 7.31 + d.z;
    float lobes = fbm(dir * 1.4 + seed) * 0.6 + warp * 0.4;
    float f = dist - R * (1.0 + 0.28 * lobes) + fibre * 1.6;
    float soft = 1.2;
    float inked = 1.0 - smoothstep(-soft, soft, f);
    // Pigment pools at the rim, the centre stays thinner.
    float rim = exp(-pow((f + 2.5) / 3.0, 2.0)) * inked;
    float body = inked * mix(0.55, 0.8, smoothstep(0.0, R * 0.6, -f));
    float a = clamp(body + rim * 0.6, 0.0, 1.0) * dry;
    cover = 1.0 - (1.0 - cover) * (1.0 - a);
  }
  float alpha = cover * uStrength;
  outColor = vec4(uInk * alpha, alpha);
}`;

type Drop = { x: number; y: number; t: number; size: number };

export default function HeroInk() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    if (!canvas || !hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    let disposed = false;
    let raf = 0;
    let visible = true;
    const drops: Drop[] = [];
    const start = performance.now();
    const now = () => (performance.now() - start) / 1000;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // ---- GL setup (reuses the transition's noise texture) ----
    let program: WebGLProgram | null = null;
    let locs: Record<string, WebGLUniformLocation | null> = {};
    const setup = async () => {
      const { createNoiseTexture, NOISE_CELLS } = await import("@/ink/noiseTexture");
      const { createProgram } = await import("@/ink/program");
      if (disposed) return;
      const prog = createProgram(gl, VERT, FRAG(NOISE_CELLS));
      program = prog.program;
      gl.useProgram(program);
      gl.bindVertexArray(gl.createVertexArray());
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, createNoiseTexture(gl));
      locs = Object.fromEntries(
        ["uNoise", "uRes", "uDpr", "uTime", "uCount", "uDrops", "uInk", "uStrength"].map((n) => [n, prog.uniform(n)]),
      );
      gl.uniform1i(locs.uNoise, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      resize();
      // Only now is "Drop ink" true: tell the context cursor.
      hero.dataset.cursor = "Drop ink";
      // An invitation, once: a slow drop in the hero's empty side after the entrance.
      window.setTimeout(() => {
        const r = canvas.getBoundingClientRect();
        if (window.scrollY < r.height / 2) addDrop(r.width * 0.74, r.height * 0.42, Math.min(r.width, 1000) * 0.13);
      }, 1500);
    };

    // ---- theme: ink colour and strength follow the page ----
    let ink: [number, number, number] = [0.93, 0.92, 0.9];
    let strength = 0.12;
    const readTheme = () => {
      // Drops print in the ultramarine process ink: a second ink on the sheet.
      const dark = document.documentElement.getAttribute("data-theme") !== "light";
      ink = dark ? [0.204, 0.259, 1] : [0.141, 0.2, 0.94];
      strength = dark ? 0.46 : 0.3;
      kick();
    };
    const themeObs = new MutationObserver(readTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      kick();
    };

    const alive = (t: number) => drops.some((d) => t - d.t < 1.6 + 2.4 * 4.6);

    const frame = () => {
      raf = 0;
      if (disposed || !program) return;
      const t = now();
      while (drops.length && t - drops[0].t > 1.6 + 2.4 * 4.6) drops.shift();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const data = new Float32Array(MAX_DROPS * 4);
      drops.forEach((d, i) => data.set([d.x, d.y, d.t, d.size], i * 4));
      gl.uniform2f(locs.uRes, canvas.width, canvas.height);
      gl.uniform1f(locs.uDpr, dpr);
      gl.uniform1f(locs.uTime, t);
      gl.uniform1i(locs.uCount, drops.length);
      gl.uniform4fv(locs.uDrops, data);
      gl.uniform3fv(locs.uInk, ink);
      gl.uniform1f(locs.uStrength, strength);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (visible && alive(t)) raf = requestAnimationFrame(frame);
    };
    function kick() {
      if (!raf && visible && program) raf = requestAnimationFrame(frame);
    }

    function addDrop(x: number, y: number, size: number, delay = 0) {
      drops.push({ x, y, t: now() + delay, size });
      while (drops.length > MAX_DROPS) drops.shift();
      kick();
    }

    // ---- input ----
    let lastX = -1e9;
    let lastY = -1e9;
    // Listen on the window: the canvas spans the full width, the hero only its column.
    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const inside = e.clientY >= r.top && e.clientY <= r.bottom;
      return { x: e.clientX - r.left, y: e.clientY - r.top, inside };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const p = local(e);
      if (!p.inside) return;
      // Close, slightly scattered drops merge into one wet stroke rather than a row of dots.
      const gap = Math.hypot(p.x - lastX, p.y - lastY);
      if (gap < 22) return;
      const jitter = () => (Math.random() - 0.5) * 6;
      if (gap < 120) {
        // Fill a fast move so the stroke stays continuous.
        const steps = Math.min(4, Math.floor(gap / 22));
        for (let k = 1; k < steps; k++) {
          const f = k / steps;
          addDrop(lastX + (p.x - lastX) * f + jitter(), lastY + (p.y - lastY) * f + jitter(), 8 + Math.random() * 6);
        }
      }
      lastX = p.x;
      lastY = p.y;
      addDrop(p.x + jitter(), p.y + jitter(), 9 + Math.random() * 8);
    };
    const onDown = (e: PointerEvent) => {
      // Links and buttons keep their own job.
      if ((e.target as Element).closest("a, button, header, .menu-panel")) return;
      const p = local(e);
      if (!p.inside) return;
      const size = 70 + Math.random() * 60;
      addDrop(p.x, p.y, size);
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const dist = size * (0.95 + Math.random() * 0.6);
        addDrop(p.x + Math.cos(a) * dist, p.y + Math.sin(a) * dist, 4 + Math.random() * 7, 0.08 + Math.random() * 0.12);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(hero);
    const ro = new ResizeObserver(resize);
    ro.observe(hero);
    const onLost = (e: Event) => {
      e.preventDefault();
      disposed = true;
      cancelAnimationFrame(raf);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    readTheme();
    void setup();

    return () => {
      disposed = true;
      delete hero.dataset.cursor;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("webglcontextlost", onLost);
      io.disconnect();
      ro.disconnect();
      themeObs.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-html2canvas-ignore=""
      // Full viewport width behind the hero column, below the text (z -1 without isolating the
      // hero, so the travelling name can still rise above the bar).
      style={{ left: "calc(50% - 50vw)", width: "100vw" }}
      className="pointer-events-none absolute inset-y-0 -z-10 h-full"
    />
  );
}
