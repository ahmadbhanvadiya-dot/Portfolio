// Adapted from codemure-official/ink-bleed-theme-changer (MIT, see LICENSE-ink-bleed).
import { capturePage, layoutKey, liveLayers, renderScale } from "./capture";
import { inkParams } from "./params";
import { InkRenderer, type InkFrame, type InkSource, type LayerRect } from "./renderer";
import { applyTheme, getTheme, otherTheme, type Theme } from "./theme";
import { ThemeIcon } from "./themeIcon";
import { ease, Tween } from "./tween";

export interface Point {
  x: number;
  y: number;
}

const EASE = ease.power3Out;
const FADE_OUT = 0.15;
const RESIZE_DEBOUNCE_MS = 250;
/** CSS cross-fade used without WebGL2, with reduced motion, or before snapshots are ready. */
const CSS_FADE_S = 0.45;
/** Quiet time (no scroll / pointer / keys) before refreshing snapshots whose content changed. */
const IDLE_REFRESH_MS = 2500;
/** Content refreshes (nav state, selected project) run at most this often. */
const REFRESH_INTERVAL_MS = 12000;
/** Frames slower than this, on average over the first few, drop the overlay to 1x. */
const SLOW_FRAME_MS = 22;
/** First capture waits for the hero entrance (≈1.6s) so it never competes with it. */
const FIRST_CAPTURE_AT_MS = 2000;

/**
 * Spread shape over time (reference values). `growth`: base radius at progress 1 relative
 * to the farthest corner. `cleanupFrom`: fraction of the (linear) duration after which a
 * uniform extra reach eats whatever the noise left behind, so the page is fully covered
 * exactly at the end. `cleanupReach`: that extra reach at t = 1.
 */
export const SPREAD = { growth: 0.7, cleanupFrom: 0.45, cleanupReach: 0.4, cleanupPow: 2 };

type ActiveFrame = Omit<InkFrame, "progress" | "radius" | "time" | "cleanup">;

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Chrome {
  backgroundColor: RGBA;
  color: RGBA;
}

/**
 * Orchestrates the theme transition:
 *  1. keeps fresh snapshots of both themes on the GPU (pre-captured while idle, re-captured
 *     on layout change, or after content changes once the visitor is idle)
 *  2. on toggle, covers the page with the "from" image, flips the live DOM underneath,
 *     spreads the ink, then fades the overlay away onto the already-flipped page
 *  3. if toggled mid-spread, freezes the frame on screen and spreads the next ink over it
 *  4. falls back to a CSS colour cross-fade without WebGL2, with reduced motion, while the
 *     mobile menu is open, or before snapshots exist
 *
 * Site-specific: the toggle lives in the fixed header's stacking context, so it cannot sit
 * above the overlay. A fixed "proxy" copy of the button is shown above the canvas during the
 * spread and carries the icon morph and the chrome hand-over.
 */
export class InkTransition {
  private readonly renderer: InkRenderer | null;
  private readonly button: HTMLButtonElement;
  private readonly icon: ThemeIcon;
  private readonly proxy: HTMLElement;
  private readonly proxyIcon: ThemeIcon | null;
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly state = { progress: 0, time: 0 };
  private tween: Tween | null = null;
  private fade: Tween | null = null;
  private frame: ActiveFrame | null = null;
  private layers: HTMLElement[] = [];
  private cssFadeTimer = 0;

  private captureGen = 0;
  private capturing = false;
  private captureQueued = false;
  private resizeTimer = 0;
  private idleTimer = 0;
  private idleHandle = 0;
  private contentDirty = false;
  private lastRefresh = 0;
  /** Set once frames were too slow: later spreads start at 1x as well. */
  private degraded = false;
  /** Low-power hint: few cores or little memory start at 1x. */
  private readonly lowPower =
    (navigator.hardwareConcurrency || 8) <= 4 ||
    ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
  private disposed = false;
  private readonly cleanups: (() => void)[] = [];

  constructor(canvas: HTMLCanvasElement, button: HTMLButtonElement, opts: { webgl?: boolean } = {}) {
    this.button = button;
    const svg = button.querySelector("svg");
    if (!svg) throw new Error("[ink] toggle has no icon");
    this.icon = new ThemeIcon(svg, getTheme());
    button.setAttribute("aria-pressed", String(getTheme() === "dark"));

    // Proxy: a copy of the button above the overlay (see class comment).
    this.proxy = document.createElement("div");
    this.proxy.className = "ink-proxy";
    this.proxy.setAttribute("aria-hidden", "true");
    this.proxy.setAttribute("data-html2canvas-ignore", "");
    const proxySvg = svg.cloneNode(true) as SVGSVGElement;
    this.proxy.appendChild(proxySvg);
    document.body.appendChild(this.proxy);
    this.proxyIcon = new ThemeIcon(proxySvg, getTheme());

    this.renderer = opts.webgl === false ? null : InkRenderer.create(canvas);
    const root = document.documentElement;
    if (!this.renderer) {
      root.dataset.ink = "css";
      return;
    }
    root.dataset.ink = "webgl";

    this.renderer.resize(this.overlayScale());
    this.renderer.watchContext(
      () => this.cancel(),
      () => this.scheduleCapture(0),
    );

    this.listen(window, "resize", () => {
      this.renderer?.resize(this.overlayScale());
      if (this.frame) this.draw();
      this.scheduleCapture(RESIZE_DEBOUNCE_MS);
    });
    // Catches document-height changes that aren't window resizes (late fonts, images).
    const ro = new ResizeObserver(() => this.scheduleCapture(RESIZE_DEBOUNCE_MS));
    ro.observe(document.body);
    this.cleanups.push(() => ro.disconnect());
    // Snapshots are skipped under reduced motion; take them if the preference is lifted.
    this.listen(this.reducedMotion, "change", () => this.scheduleCapture(0));
    // Components announce content that changed without a layout change (active nav link,
    // selected project). Refresh once the visitor has been idle for a moment.
    // `detail.urgent` (header state a visitor sees on every toggle) skips the refresh
    // interval but still waits for the visitor to be idle.
    this.listen(window, "ink:dirty", (e) => {
      this.contentDirty = true;
      if ((e as CustomEvent<{ urgent?: boolean }>).detail?.urgent) this.lastRefresh = 0;
      this.armIdleRefresh();
    });
    for (const type of ["scroll", "pointermove", "keydown", "touchstart", "wheel"]) {
      this.listen(window, type, () => this.contentDirty && this.armIdleRefresh(), { passive: true });
    }
    void document.fonts.ready.then(() =>
      this.scheduleCapture(Math.max(0, FIRST_CAPTURE_AT_MS - performance.now())),
    );
  }

  get isWebGL(): boolean {
    return this.renderer !== null;
  }

  /** Releases listeners, timers, GPU memory and the proxy (React unmount / StrictMode). */
  dispose(): void {
    this.disposed = true;
    this.tween?.kill();
    this.fade?.kill();
    this.icon.kill();
    this.proxyIcon?.kill();
    window.clearTimeout(this.cssFadeTimer);
    window.clearTimeout(this.resizeTimer);
    window.clearTimeout(this.idleTimer);
    if (this.idleHandle && "cancelIdleCallback" in window) window.cancelIdleCallback(this.idleHandle);
    this.cleanups.forEach((fn) => fn());
    this.renderer?.dispose();
    this.renderer?.canvas.remove();
    this.proxy.remove();
    document.documentElement.classList.remove("theme-fade");
  }

  /** Live playback rate (slow motion, for inspection), applied to a running transition too. */
  setTimeScale(scale: number): void {
    inkParams.timeScale = scale;
    this.tween?.timeScale(scale);
    this.fade?.timeScale(scale);
    this.proxyIcon?.setTimeScale(scale);
  }

  /** Toggle the theme, spreading from `point` (viewport CSS px) or from the toggle button. */
  toggle(point?: Point): void {
    if (this.disposed) return;
    // The live DOM always holds the latest target, so this is right even mid-transition.
    const to = otherTheme(getTheme());
    const renderer = this.renderer;
    // Snapshots are keyed to the page's render scale; the overlay itself may draw coarser.
    const scale = renderScale();
    const drawScale = this.overlayScale();
    const interrupting = this.frame !== null;
    // Snapshots belong to the layer set they were captured with.
    const layers = this.layers;
    const key = layoutKey(scale, layers);
    const layersChanged = !sameElements(layers, liveLayers());

    const canAnimate =
      renderer !== null &&
      !renderer.isLost &&
      !this.reducedMotion.matches &&
      document.documentElement.dataset.menu !== "open" &&
      !layersChanged &&
      renderer.hasValid(to, key) &&
      (interrupting || renderer.hasValid(getTheme(), key));

    if (!canAnimate || !renderer) {
      this.cancel();
      this.crossFade(to);
      if (renderer && !this.reducedMotion.matches) this.scheduleCapture(0);
      return;
    }

    // Interrupted: freeze exactly what is on screen and spread the new ink over it.
    let from: InkSource = getTheme();
    if (interrupting) {
      this.tween?.kill();
      this.fade?.kill();
      this.tween = this.fade = null;
      renderer.resize(drawScale);
      renderer.setLayers(this.layerRects());
      const frozen = this.currentFrame();
      from = frozen && renderer.freeze(frozen) ? "composite" : getTheme();
    }

    const center = point ?? this.toggleCenter();
    const maxDist = farthestCorner(center);
    this.frame = { from, to, center, maxDist, seed: randomSeed() };
    this.state.progress = 0;
    this.state.time = 0;

    // Proxy takes over the button above the overlay, starting from what is on screen now.
    const chromeFrom = interrupting && this.proxy.classList.contains("is-active") ? this.readProxyChrome() : this.readChrome();
    if (!interrupting || !this.proxy.classList.contains("is-active")) this.proxyIcon?.copyFrom(this.icon);
    this.placeProxy(chromeFrom);

    renderer.resize(drawScale);
    this.draw();
    // Same task: the overlay (showing "from") and the flipped DOM hit the screen together.
    renderer.canvas.style.opacity = "1";
    renderer.canvas.classList.add("is-active");
    this.proxy.classList.add("is-active");
    // Live movers (panning screenshots) rest in their snapshot pose until the overlay lifts.
    if (!interrupting) window.dispatchEvent(new Event("ink:start"));
    applyTheme(to, this.button);
    this.icon.set(to); // the real icon is under the overlay; it waits in its final pose

    const duration = inkParams.duration;
    this.proxyIcon?.morphTo(to, { duration, ease: EASE, timeScale: inkParams.timeScale });
    const chromeTo = this.readChrome();
    const chromeDelay = this.inkArrival(center, maxDist, this.toggleCenter()) * duration;
    const swap = Math.min(0.18, duration * 0.15);

    // Adaptive quality: if the first frames are slow on this device, finish at 1x.
    let frames = 0;
    let firstFrameAt = 0;
    this.tween = new Tween({
      duration,
      timeScale: inkParams.timeScale,
      onUpdate: (time) => {
        const now = performance.now();
        if (frames === 0) firstFrameAt = now;
        else if (frames === 8 && !this.degraded && (now - firstFrameAt) / 8 > SLOW_FRAME_MS) {
          this.degraded = true;
          renderer.resize(1);
        }
        frames++;
        this.state.time = time;
        this.state.progress = EASE(time / duration);
        // Hold the old chrome until the ink reaches the button, then hand over.
        const k = Math.min(1, Math.max(0, (time - chromeDelay) / swap));
        this.paintProxyChrome(mixChrome(chromeFrom, chromeTo, ease.power1Out(k)));
        this.draw();
      },
      onComplete: () => this.finish(),
    });
  }

  private currentFrame(): InkFrame | null {
    if (!this.frame) return null;
    const { progress, time } = this.state;
    const { maxDist } = this.frame;
    const linear = Math.min(1, time / inkParams.duration);
    const ramp = Math.max(0, (linear - SPREAD.cleanupFrom) / (1 - SPREAD.cleanupFrom));
    // Second term only acts in the last ~3% (≈40ms): a guarantee for unlucky seeds so the
    // final frame is exactly the "to" snapshot before the fade.
    const cleanup =
      ramp ** SPREAD.cleanupPow * maxDist * SPREAD.cleanupReach + Math.max(0, (linear - 0.97) / 0.03) * maxDist;
    return { ...this.frame, progress, time, radius: progress * maxDist * SPREAD.growth, cleanup };
  }

  private draw(): void {
    const frame = this.currentFrame();
    if (!this.renderer || !frame) return;
    this.renderer.setLayers(this.layerRects());
    this.renderer.draw(frame);
  }

  private layerRects(): LayerRect[] {
    return this.layers.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    });
  }

  private finish(): void {
    const canvas = this.renderer?.canvas;
    this.tween = null;
    if (!canvas) return;
    this.fade = new Tween({
      duration: FADE_OUT,
      timeScale: inkParams.timeScale,
      onUpdate: (time) => {
        const o = String(1 - time / FADE_OUT);
        canvas.style.opacity = o;
        this.proxy.style.opacity = o;
      },
      onComplete: () => this.hide(),
    });
  }

  private hide(): void {
    const wasActive = this.frame !== null;
    this.fade = null;
    this.frame = null;
    if (wasActive) window.dispatchEvent(new Event("ink:end"));
    this.proxyIcon?.kill();
    this.proxy.classList.remove("is-active");
    this.proxy.style.opacity = "";
    this.renderer?.canvas.classList.remove("is-active");
    if (this.captureQueued) this.scheduleCapture(0);
    if (this.contentDirty) this.armIdleRefresh();
  }

  private cancel(): void {
    if (!this.frame) return;
    this.tween?.kill();
    this.fade?.kill();
    this.tween = null;
    this.hide();
  }

  /** Plain CSS colour transition (no WebGL2, reduced motion, menu open, or snapshots not ready). */
  private crossFade(to: Theme): void {
    const root = document.documentElement;
    const motion = !this.reducedMotion.matches;
    root.classList.add("theme-fade");
    root.style.setProperty("--theme-fade", `${CSS_FADE_S}s`);
    applyTheme(to, this.button);
    if (motion) {
      this.icon.morphTo(to, { duration: CSS_FADE_S * 1.6, ease: ease.power2InOut, timeScale: 1 });
    } else {
      this.icon.set(to);
    }
    window.clearTimeout(this.cssFadeTimer);
    this.cssFadeTimer = window.setTimeout(() => {
      root.classList.remove("theme-fade");
      if (this.captureQueued) this.scheduleCapture(0);
      if (this.contentDirty) this.armIdleRefresh();
    }, CSS_FADE_S * 1000 + 50);
  }

  /**
   * Fraction of the duration at which the base ink front reaches `target` (the eased
   * radius inverted; slightly early, since the noise lets the front lead).
   */
  private inkArrival(center: Point, maxDist: number, target: Point): number {
    const dist = Math.hypot(target.x - center.x, target.y - center.y);
    if (dist < 28) return 0;
    const p = Math.min(1, dist / (maxDist * SPREAD.growth * 1.15));
    // Inverse of power3.out, capped: the end-of-spread cleanup sweeps the last corners by ~85%.
    return Math.min(0.85, 1 - Math.cbrt(1 - p));
  }

  /**
   * Device px per CSS px for the overlay canvas. Never sharper than the snapshots it samples
   * (extra pixels would only interpolate them), 1x on low-power devices or after slow frames.
   */
  private overlayScale(): number {
    if (this.degraded || this.lowPower) return 1;
    const tex = this.renderer?.snapshotScale() ?? 0;
    return Math.max(1, Math.min(renderScale(), tex > 0 ? tex : renderScale()));
  }

  private toggleCenter(): Point {
    const r = this.button.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // ---------- Proxy button ----------

  private readChrome(): Chrome {
    const cs = getComputedStyle(this.button);
    return { backgroundColor: parseColor(cs.backgroundColor), color: parseColor(cs.color) };
  }

  private readProxyChrome(): Chrome {
    const cs = getComputedStyle(this.proxy);
    return { backgroundColor: parseColor(cs.backgroundColor), color: parseColor(cs.color) };
  }

  private placeProxy(chrome: Chrome): void {
    const r = this.button.getBoundingClientRect();
    const cs = getComputedStyle(this.button);
    const s = this.proxy.style;
    s.left = `${r.left}px`;
    s.top = `${r.top}px`;
    s.width = `${r.width}px`;
    s.height = `${r.height}px`;
    s.borderRadius = cs.borderRadius;
    s.opacity = "1";
    this.proxy.classList.toggle("is-focused", this.button.matches(":focus-visible"));
    this.paintProxyChrome(chrome);
  }

  private paintProxyChrome(c: Chrome): void {
    this.proxy.style.backgroundColor = toCss(c.backgroundColor);
    this.proxy.style.color = toCss(c.color);
  }

  // ---------- Capture scheduling ----------

  private listen(
    target: EventTarget,
    type: string,
    fn: EventListener,
    opts?: AddEventListenerOptions,
  ): void {
    target.addEventListener(type, fn, opts);
    this.cleanups.push(() => target.removeEventListener(type, fn, opts));
  }

  private armIdleRefresh(): void {
    window.clearTimeout(this.idleTimer);
    const sinceLast = performance.now() - this.lastRefresh;
    const wait = Math.max(IDLE_REFRESH_MS, REFRESH_INTERVAL_MS - sinceLast);
    this.idleTimer = window.setTimeout(() => {
      const run = () => {
        if (!this.contentDirty) return;
        this.contentDirty = false;
        this.lastRefresh = performance.now();
        // Recapture over the still-valid snapshots: a toggle meanwhile keeps its ink.
        void this.captureAll(true);
      };
      if ("requestIdleCallback" in window) {
        this.idleHandle = window.requestIdleCallback(run, { timeout: 2000 });
      } else {
        run();
      }
    }, wait);
  }

  private scheduleCapture(delay: number): void {
    window.clearTimeout(this.resizeTimer);
    // Never before the first-capture point (the ResizeObserver fires on observe, and fonts
    // or images settle during the entrance); then run when the main thread is idle.
    const wait = Math.max(delay, FIRST_CAPTURE_AT_MS - performance.now());
    this.resizeTimer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        this.idleHandle = window.requestIdleCallback(() => void this.captureAll(), { timeout: 1000 });
      } else {
        void this.captureAll();
      }
    }, wait);
  }

  private async captureAll(force = false): Promise<void> {
    const renderer = this.renderer;
    if (this.disposed || !renderer || renderer.isLost || this.reducedMotion.matches) return;

    // Capturing blocks the main thread; never do it mid-animation (or mid CSS fade, which
    // would bake half-transitioned colours into the snapshot).
    if (this.capturing || this.frame || document.documentElement.classList.contains("theme-fade")) {
      this.captureQueued = true;
      if (force) this.contentDirty = true;
      return;
    }

    const scale = renderScale();
    const layers = liveLayers();
    const key = layoutKey(scale, layers);
    const refresh = force || !sameElements(layers, this.layers);
    const current = getTheme();
    const themes: Theme[] = [current, otherTheme(current)].filter((t) => refresh || !renderer.hasValid(t, key));
    this.captureQueued = false;
    if (themes.length === 0) return;

    const gen = ++this.captureGen;
    this.capturing = true;
    try {
      for (const [n, theme] of themes.entries()) {
        // One theme per idle slot: two shorter main-thread blocks instead of one long one.
        if (n > 0) await idle();
        const snap = await capturePage(theme, scale, renderer.maxTextureSize, layers);
        if (gen !== this.captureGen || this.disposed) return;
        if (snap.key !== layoutKey(renderScale(), liveLayers())) {
          // Layout changed while capturing; this snapshot is already stale.
          this.captureQueued = true;
          break;
        }
        renderer.upload(snap);
        this.layers = layers;
        if (process.env.NODE_ENV !== "production") {
          console.debug(
            `[ink] captured ${theme} ${snap.canvas.width || "(freed)"} in ${snap.ms.toFixed(0)}ms`,
          );
        }
      }
    } catch (err) {
      console.error("[ink] capture failed", err);
    } finally {
      this.capturing = false;
    }
    if (this.captureQueued) this.scheduleCapture(RESIZE_DEBOUNCE_MS);
  }
}

function idle(): Promise<void> {
  return new Promise((resolve) => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout: 1000 });
    else setTimeout(resolve, 50);
  });
}

function sameElements(a: HTMLElement[], b: HTMLElement[]): boolean {
  return a.length === b.length && a.every((el, i) => el === b[i]);
}

function farthestCorner(p: Point): number {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  return (
    Math.max(Math.hypot(p.x, p.y), Math.hypot(w - p.x, p.y), Math.hypot(p.x, h - p.y), Math.hypot(w - p.x, h - p.y)) +
    4
  );
}

function randomSeed(): InkFrame["seed"] {
  return { x: Math.random() * 64 - 32, y: Math.random() * 64 - 32, angle: Math.random() * Math.PI * 2 };
}

function parseColor(value: string): RGBA {
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return { r: 0, g: 0, b: 0, a: 0 };
  const [r = 0, g = 0, b = 0, a = 1] = m[1]!.split(/[\s,/]+/).filter(Boolean).map(Number);
  return { r, g, b, a };
}

function toCss(c: RGBA): string {
  return `rgba(${c.r.toFixed(1)}, ${c.g.toFixed(1)}, ${c.b.toFixed(1)}, ${c.a.toFixed(3)})`;
}

function mixRGBA(a: RGBA, b: RGBA, t: number): RGBA {
  // Transparent ends keep the other end's hue so a fade never passes through black.
  const ca = a.a === 0 ? { ...b, a: 0 } : a;
  const cb = b.a === 0 ? { ...a, a: 0 } : b;
  return {
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
    a: ca.a + (cb.a - ca.a) * t,
  };
}

function mixChrome(a: Chrome, b: Chrome, t: number): Chrome {
  return { backgroundColor: mixRGBA(a.backgroundColor, b.backgroundColor, t), color: mixRGBA(a.color, b.color, t) };
}
