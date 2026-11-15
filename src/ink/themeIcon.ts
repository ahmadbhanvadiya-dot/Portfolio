// Adapted from codemure-official/ink-bleed-theme-changer (MIT, see LICENSE-ink-bleed).
// The reference morphs the sun into a moon with GSAP's MorphSVG; here the body is a
// crescent computed from two circles (body minus a "bite"), so every in-between frame is a
// real shape and no plugin is needed. Poses, stagger and timing follow the reference.
import { ease as easing, Tween, type Ease } from "./tween";
import type { Theme } from "./theme";

const RAYS = 8;

interface Pose {
  /** Body circle radius (centre 12,12). */
  r: number;
  /** Bite circle: centre and radius. Outside the body = full sun disc. */
  bx: number;
  by: number;
  br: number;
  rays: { scale: number; opacity: number; rotation: number };
  /** Whole-icon rotation, degrees. */
  icon: number;
}

const POSE: Record<Theme, Pose> = {
  light: { r: 4.6, bx: 23.5, by: 0.5, br: 6.8, rays: { scale: 1, opacity: 1, rotation: 0 }, icon: 0 },
  dark: { r: 8.2, bx: 16.6, by: 7.4, br: 6.8, rays: { scale: 0.2, opacity: 0, rotation: -60 }, icon: -25 },
};

interface State {
  r: number;
  bx: number;
  by: number;
  br: number;
  icon: number;
  rays: { scale: number; opacity: number; rotation: number }[];
}

export interface MorphOptions {
  duration: number;
  ease: Ease;
  timeScale: number;
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** SVG path for circle (12,12,r) minus circle (bx,by,br). */
export function crescentPath(r: number, bx: number, by: number, br: number): string {
  const cx = 12;
  const cy = 12;
  const circle = `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
  const dx = bx - cx;
  const dy = by - cy;
  const d = Math.hypot(dx, dy);
  if (d >= r + br - 1e-3) return circle; // no overlap: full disc
  if (d + r <= br) return ""; // bitten away entirely
  if (d + br <= r) return circle; // bite inside the disc (not used by the poses)
  // Intersection points of the two circles.
  const a = (r * r - br * br + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r * r - a * a));
  const mx = cx + (a * dx) / d;
  const my = cy + (a * dy) / d;
  const p1x = mx + (h * dy) / d;
  const p1y = my - (h * dx) / d;
  const p2x = mx - (h * dy) / d;
  const p2y = my + (h * dx) / d;
  // Body arc from p1 to p2 away from the bite (large when the bite centre is outside the
  // body's half-plane cut by the chord), then the bite arc back, inside the body.
  const largeBody = a > 0 ? 1 : 0;
  const largeBite = d * d + br * br - r * r < 0 ? 1 : 0;
  const f = (n: number) => n.toFixed(3);
  return `M${f(p1x)} ${f(p1y)}A${r} ${r} 0 ${largeBody} 0 ${f(p2x)} ${f(p2y)}A${br} ${br} 0 ${largeBite} 1 ${f(p1x)} ${f(p1y)}z`;
}

function poseState(theme: Theme): State {
  const p = POSE[theme];
  return { r: p.r, bx: p.bx, by: p.by, br: p.br, icon: p.icon, rays: Array.from({ length: RAYS }, () => ({ ...p.rays })) };
}

/**
 * The toggle's sun ↔ moon icon. Animates in lock-step with the ink: same duration, ease
 * and time scale; rays retract / bloom one after another, like the ink sweeping round.
 */
export class ThemeIcon {
  private readonly svg: SVGSVGElement;
  private readonly body: SVGPathElement | null;
  private readonly rays: SVGLineElement[];
  private state: State;
  private tween: Tween | null = null;

  constructor(svg: SVGSVGElement, theme: Theme) {
    this.svg = svg;
    this.body = svg.querySelector(".ink-icon__body");
    this.rays = Array.from(svg.querySelectorAll<SVGLineElement>(".ink-icon__rays line"));
    this.state = poseState(theme);
    this.render();
  }

  kill(): void {
    this.tween?.kill();
    this.tween = null;
  }

  setTimeScale(scale: number): void {
    this.tween?.timeScale(scale);
  }

  /** Copies another icon's current pose (the overlay proxy picks up the live icon). */
  copyFrom(other: ThemeIcon): void {
    this.kill();
    this.state = structuredClone(other.state);
    this.render();
  }

  /** Jump to a theme's pose without animating. */
  set(theme: Theme): void {
    this.kill();
    this.state = poseState(theme);
    this.render();
  }

  /** Animate to a theme's pose, starting from wherever the icon currently is. */
  morphTo(theme: Theme, opts: MorphOptions, onComplete?: () => void): void {
    this.kill();
    const from = structuredClone(this.state);
    const to = POSE[theme];
    const stagger = opts.duration * 0.035;
    const total = opts.duration + stagger * (RAYS - 1);
    this.tween = new Tween({
      duration: total,
      timeScale: opts.timeScale,
      onUpdate: (time) => {
        const p = opts.ease(Math.min(1, time / opts.duration));
        const s = this.state;
        s.r = lerp(from.r, to.r, p);
        s.bx = lerp(from.bx, to.bx, p);
        s.by = lerp(from.by, to.by, p);
        s.br = lerp(from.br, to.br, p);
        s.icon = lerp(from.icon, to.icon, p);
        s.rays.forEach((ray, i) => {
          const q = opts.ease(Math.min(1, Math.max(0, (time - i * stagger) / opts.duration)));
          const f = from.rays[i]!;
          ray.scale = lerp(f.scale, to.rays.scale, q);
          ray.opacity = lerp(f.opacity, to.rays.opacity, q);
          ray.rotation = lerp(f.rotation, to.rays.rotation, q);
        });
        this.render();
      },
      onComplete: () => {
        this.tween = null;
        onComplete?.();
      },
    });
  }

  private render(): void {
    const s = this.state;
    this.body?.setAttribute("d", crescentPath(s.r, s.bx, s.by, s.br));
    this.svg.style.transform = `rotate(${s.icon}deg)`;
    this.rays.forEach((line, i) => {
      const ray = s.rays[i]!;
      line.style.transform = `rotate(${ray.rotation}deg) scale(${ray.scale})`;
      line.style.opacity = String(ray.opacity);
    });
  }
}

export const iconEase = easing;
