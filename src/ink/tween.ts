/**
 * Minimal requestAnimationFrame tween: stands in for the reference's GSAP tweens, which
 * were used only for an eased 0..1 progress, a local clock and a time scale.
 */

export type Ease = (t: number) => number;

export const ease = {
  none: (t: number) => t,
  power1Out: (t: number) => 1 - (1 - t) ** 2,
  power3Out: (t: number) => 1 - (1 - t) ** 3,
  power2InOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
} satisfies Record<string, Ease>;

export interface TweenOptions {
  /** Seconds. */
  duration: number;
  /** Receives the elapsed local time in seconds (already time-scaled). */
  onUpdate: (time: number) => void;
  onComplete?: () => void;
  timeScale?: number;
}

export class Tween {
  private elapsed = 0;
  private scale: number;
  private raf = 0;
  private last = 0;
  private dead = false;
  private readonly opts: TweenOptions;

  constructor(opts: TweenOptions) {
    this.opts = opts;
    this.scale = opts.timeScale ?? 1;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  /** Local seconds since start. */
  time(): number {
    return this.elapsed;
  }

  timeScale(scale: number): void {
    this.scale = scale;
  }

  kill(): void {
    this.dead = true;
    cancelAnimationFrame(this.raf);
  }

  private tick = (now: number): void => {
    if (this.dead) return;
    // Lag smoothing (as GSAP's default): a gap over 500ms (background tab, debugger, a long
    // task) counts as one 33ms frame, so the spread never jumps straight to the end; normal
    // slow frames keep real time.
    const raw = Math.max(0, (now - this.last) / 1000);
    const dt = raw > 0.5 ? 0.033 : raw;
    this.last = now;
    this.elapsed = Math.min(this.opts.duration, this.elapsed + dt * this.scale);
    this.opts.onUpdate(this.elapsed);
    if (this.elapsed >= this.opts.duration) {
      this.dead = true;
      this.opts.onComplete?.();
      return;
    }
    this.raf = requestAnimationFrame(this.tick);
  };
}
