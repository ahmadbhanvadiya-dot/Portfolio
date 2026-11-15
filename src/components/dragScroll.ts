/**
 * Drag-to-scroll for a screenshot of a live page inside a fixed frame: the frame behaves
 * like a miniature browser viewport.
 *
 * Gesture rules (gestures / animate skills):
 *  - Track phase: the page moves 1:1 with the pointer. No easing, no React state, a
 *    direct `transform` write on the moving element only.
 *  - Past the top or bottom it rubber-bands (iOS formula), never stops dead.
 *  - Release: it keeps the release velocity and decelerates like iOS scrolling
 *    (0.998 per ms); past an edge a near-critically damped spring brings it back.
 *  - Interruptible: a new press catches it wherever it is, at whatever speed.
 *  - Touch only: if the drag starts at an edge heading out (at the top and pulling down,
 *    at the bottom and pushing up), the gesture scrolls the page instead, so a finger that
 *    lands on a preview is never trapped.
 *  - A tap (no movement) is still a click; a drag never fires one.
 *  - Reduced motion: tracking stays (the user is making the motion); the coast and the
 *    spring are dropped, release settles in place.
 */

const DECELERATION = 0.998; // per ms, iOS UIScrollView "normal"
const SPRING_K = 380; // 1/s², pull back from past an edge
const SPRING_C = 2 * Math.sqrt(SPRING_K) * 0.92; // just under critical: a hint of settle
const DRAG_SLOP = 6; // px before a press becomes a drag
const VELOCITY_WINDOW = 90; // ms of samples used for the release velocity

/** iOS-style rubber band: the further past the edge, the less it gives. */
function rubber(distance: number, dimension: number): number {
  const c = 0.55;
  return (1 - 1 / ((distance * c) / dimension + 1)) * dimension;
}

type Options = {
  /** Called on a tap that did not become a drag (the frame is not itself a link). */
  onTap?: () => void;
  /** Hand vertical drags that start at an edge to the page (touch only). */
  chainToPage?: boolean;
};

export class DragScroll {
  private readonly frame: HTMLElement;
  private readonly opts: Options;
  private track: HTMLElement | null = null;
  private thumb: HTMLElement | null = null;

  private offset = 0; // px, 0 at the top, negative scrolls down the page
  private velocity = 0; // px/s
  private raf = 0;
  private last = 0;
  private pageVelocity = 0; // px/s, for a handed-off page fling

  private pointerId: number | null = null;
  private pointerType = "mouse";
  private startX = 0;
  private startY = 0;
  private startOffset = 0;
  private lastY = 0;
  private mode: "pending" | "inner" | "page" | null = null;
  private samples: { t: number; y: number }[] = [];
  private suppressClick = false;
  private readonly reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly cleanup: (() => void)[] = [];

  constructor(frame: HTMLElement, opts: Options = {}) {
    this.frame = frame;
    this.opts = opts;
    this.thumb = frame.querySelector<HTMLElement>(".scrub-thumb");
    const on = <K extends keyof HTMLElementEventMap>(
      type: K,
      fn: (e: HTMLElementEventMap[K]) => void,
      options?: AddEventListenerOptions,
    ) => {
      frame.addEventListener(type, fn, options);
      this.cleanup.push(() => frame.removeEventListener(type, fn, options));
    };
    on("pointerdown", this.onDown);
    on("pointermove", this.onMove);
    on("pointerup", this.onUp);
    on("pointercancel", this.onUp);
    on("lostpointercapture", this.onUp);
    // A drag must never also follow the link underneath.
    on("click", (e) => {
      if (!this.suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
      this.suppressClick = false;
    }, { capture: true });
    on("dragstart", (e) => e.preventDefault());
    // Any other scroll input stops a handed-off page fling.
    const stopPage = () => (this.pageVelocity = 0);
    window.addEventListener("wheel", stopPage, { passive: true });
    window.addEventListener("touchstart", stopPage, { passive: true });
    this.cleanup.push(() => {
      window.removeEventListener("wheel", stopPage);
      window.removeEventListener("touchstart", stopPage);
    });
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.cleanup.forEach((fn) => fn());
  }

  /** Point at a new page (e.g. another project): starts at its top. */
  setTrack(track: HTMLElement | null): void {
    if (track === this.track) return;
    this.track = track;
    this.reset();
  }

  /** Back to the top at once (ink snapshots, project switch). */
  reset(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.velocity = 0;
    this.offset = 0;
    this.render();
  }

  private max(): number {
    if (!this.track) return 0;
    return Math.max(0, this.track.offsetHeight - this.frame.clientHeight);
  }

  private render(): void {
    const track = this.track;
    if (!track) return;
    track.style.transform = `translate3d(0, ${this.offset.toFixed(2)}px, 0)`;
    const thumb = this.thumb;
    if (thumb && track.offsetHeight > 0) {
      const visible = Math.min(1, this.frame.clientHeight / track.offsetHeight);
      const max = this.max();
      const progress = max > 0 ? Math.min(1, Math.max(0, -this.offset / max)) : 0;
      thumb.style.height = `${(visible * 100).toFixed(2)}%`;
      thumb.style.transform = `translate3d(0, ${((progress * (1 - visible)) / visible) * 100}%, 0)`;
    }
  }

  // ---------- track phase ----------

  private onDown = (e: PointerEvent): void => {
    if (e.button !== 0 || this.pointerId !== null || !this.track) return;
    // Catch a coasting page where it is: interruptible.
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.velocity = 0;
    this.pageVelocity = 0;
    this.pointerId = e.pointerId;
    this.pointerType = e.pointerType;
    this.startX = e.clientX;
    this.startY = this.lastY = e.clientY;
    this.startOffset = this.offset;
    this.mode = "pending";
    this.samples = [{ t: e.timeStamp, y: e.clientY }];
  };

  private onMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId || !this.mode) return;
    const dy = e.clientY - this.startY;
    const dx = e.clientX - this.startX;

    if (this.mode === "pending") {
      if (Math.abs(dy) < DRAG_SLOP && Math.abs(dx) < DRAG_SLOP) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.end(); // sideways: not a scroll gesture
        return;
      }
      const max = this.max();
      const atTop = this.offset >= -0.5;
      const atBottom = this.offset <= -max + 0.5;
      const leaving = (dy > 0 && atTop) || (dy < 0 && atBottom) || max === 0;
      this.mode = this.opts.chainToPage && this.pointerType !== "mouse" && leaving ? "page" : "inner";
      this.frame.setPointerCapture(e.pointerId);
      this.frame.classList.add("is-dragging");
      this.suppressClick = true;
      // Re-base so the content does not jump by the slop distance.
      this.startY = this.lastY = e.clientY;
      this.startOffset = this.offset;
    }

    this.samples.push({ t: e.timeStamp, y: e.clientY });
    while (this.samples.length > 2 && e.timeStamp - this.samples[0].t > VELOCITY_WINDOW) this.samples.shift();

    if (this.mode === "page") {
      window.scrollBy(0, -(e.clientY - this.lastY));
      this.lastY = e.clientY;
      return;
    }

    const max = this.max();
    const h = this.frame.clientHeight;
    const raw = this.startOffset + (e.clientY - this.startY);
    if (raw > 0) this.offset = rubber(raw, h);
    else if (raw < -max) this.offset = -max - rubber(-max - raw, h);
    else this.offset = raw;
    this.lastY = e.clientY;
    this.render();
  };

  // ---------- release phase ----------

  private onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.pointerId) return;
    const mode = this.mode;
    const first = this.samples[0];
    const lastSample = this.samples[this.samples.length - 1];
    const dt = lastSample && first ? lastSample.t - first.t : 0;
    const v = dt > 0 ? ((lastSample.y - first.y) / dt) * 1000 : 0; // px/s
    this.end();

    if (mode === "pending") {
      // A tap: the frame's own link handles it, or the caller does.
      this.suppressClick = false;
      this.opts.onTap?.();
      return;
    }
    if (mode === "page") {
      this.pageVelocity = this.reduced.matches ? 0 : -v;
      if (this.pageVelocity) this.start();
      return;
    }
    this.velocity = this.reduced.matches ? 0 : v;
    this.start();
  };

  private end(): void {
    if (this.pointerId !== null && this.frame.hasPointerCapture(this.pointerId)) {
      this.frame.releasePointerCapture(this.pointerId);
    }
    this.pointerId = null;
    this.mode = null;
    this.frame.classList.remove("is-dragging");
  }

  private start(): void {
    this.last = 0;
    if (!this.raf) this.raf = requestAnimationFrame(this.step);
  }

  private step = (now: number): void => {
    const dt = this.last ? Math.min(0.032, (now - this.last) / 1000) : 1 / 60;
    this.last = now;
    let busy = false;

    // Handed-off page fling: the page coasts with the same deceleration.
    if (this.pageVelocity) {
      window.scrollBy(0, this.pageVelocity * dt);
      this.pageVelocity *= DECELERATION ** (dt * 1000);
      if (Math.abs(this.pageVelocity) < 15) this.pageVelocity = 0;
      else busy = true;
    }

    const max = this.max();
    const bound = this.offset > 0 ? 0 : this.offset < -max ? -max : null;
    if (this.reduced.matches) {
      // No coast, no spring: settle where it is (or at the edge it was pulled past).
      if (bound !== null) this.offset = bound;
      this.velocity = 0;
    } else if (bound !== null) {
      // Past an edge: spring back, carrying whatever velocity it arrived with.
      const x = this.offset - bound;
      this.velocity += (-SPRING_K * x - SPRING_C * this.velocity) * dt;
      this.offset += this.velocity * dt;
      if (Math.abs(this.offset - bound) < 0.3 && Math.abs(this.velocity) < 8) {
        this.offset = bound;
        this.velocity = 0;
      } else busy = true;
    } else if (this.velocity) {
      // Inside: coast and decelerate; crossing an edge hands over to the spring above.
      this.offset += this.velocity * dt;
      this.velocity *= DECELERATION ** (dt * 1000);
      if (Math.abs(this.velocity) < 10) this.velocity = 0;
      busy = true;
    }
    this.render();
    this.raf = busy ? requestAnimationFrame(this.step) : 0;
  };
}
