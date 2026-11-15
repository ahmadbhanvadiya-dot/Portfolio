// Adapted from codemure-official/ink-bleed-theme-changer (MIT, see LICENSE-ink-bleed).
import { BACKGROUND } from "./params";
import type { Theme } from "./theme";

/**
 * Full-document snapshots of the page in a given theme.
 *
 * As in the reference, the whole document is captured (not just the viewport) so a snapshot
 * stays valid while the user scrolls, and the theme is applied to html2canvas' *cloned*
 * document so the live page never flickers.
 *
 * Additions for this site:
 *  - Layers: fixed/sticky elements (`[data-ink-layer]`) are hidden in place and copied into a
 *    strip below the document, so the shader can draw them where they are on screen *now*.
 *  - The clone is normalised: no entrance animations or transitions, every reveal shown,
 *    no hover-only state, and the hero keeps the live page's height (it is sized in svh).
 *  - A pixel budget keeps two snapshots of a long page affordable on the GPU.
 */

export interface Snapshot {
  theme: Theme;
  canvas: HTMLCanvasElement;
  /** Texture pixels per CSS pixel. */
  scale: number;
  /** Layout this snapshot is valid for; see {@link layoutKey}. */
  key: string;
  /** Strip top (CSS px from the document top) of each layer copy, in layer order. */
  layerTops: number[];
  ms: number;
}

/** Max texels per snapshot (two are kept). 16M ≈ 64 MB each. */
const PIXEL_BUDGET = 16_000_000;
const STRIP_GAP = 8;

const isCoarsePointer = (): boolean => window.matchMedia("(pointer: coarse)").matches;

/** Device-pixel ratio used for both the snapshots and the overlay canvas. */
export function renderScale(): number {
  const cap = isCoarsePointer() ? 1.5 : 2;
  return Math.min(window.devicePixelRatio || 1, cap);
}

export function documentSize(): { width: number; height: number } {
  const el = document.documentElement;
  return { width: el.clientWidth, height: Math.max(el.scrollHeight, el.clientHeight) };
}

/**
 * Fixed and sticky elements that must follow the live scroll position. The header is
 * ordered last so it wins where a scrolled sticky element passes beneath it.
 */
export function liveLayers(): HTMLElement[] {
  const layers = Array.from(document.querySelectorAll<HTMLElement>("[data-ink-layer]")).filter((el) => {
    const cs = getComputedStyle(el);
    if (cs.position !== "sticky" && cs.position !== "fixed") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  return layers.sort((a, b) => Number(getComputedStyle(a).position === "fixed") - Number(getComputedStyle(b).position === "fixed"));
}

/**
 * Identifies the layout a snapshot depends on. Viewport height is deliberately excluded
 * (mobile URL-bar show/hide changes it without reflowing the document).
 */
export function layoutKey(scale: number, layers: HTMLElement[]): string {
  const { width, height } = documentSize();
  const sig = layers
    .map((el) => {
      const r = el.getBoundingClientRect();
      return `${Math.round(r.width)}x${Math.round(r.height)}`;
    })
    .join(",");
  return `${width}x${height}@${scale}|${sig}`;
}

export async function capturePage(
  theme: Theme,
  scale: number,
  maxTextureSize: number,
  layers: HTMLElement[],
): Promise<Snapshot> {
  const t0 = performance.now();
  const key = layoutKey(scale, layers);
  const { width, height } = documentSize();

  // Strip layout (CSS px) below the document.
  const all = Array.from(document.querySelectorAll<HTMLElement>("[data-ink-layer]"));
  const boxes = layers.map((el) => {
    const r = el.getBoundingClientRect();
    return { index: all.indexOf(el), width: Math.ceil(r.width), height: Math.ceil(r.height) };
  });
  const layerTops: number[] = [];
  let top = height + STRIP_GAP;
  for (const b of boxes) {
    layerTops.push(top);
    top += b.height + STRIP_GAP;
  }
  const totalHeight = top;

  // Never exceed what the GPU can hold, nor the memory budget; the shader handles any scale.
  const safeScale = Math.min(
    scale,
    maxTextureSize / width,
    maxTextureSize / totalHeight,
    Math.sqrt(PIXEL_BUDGET / (width * totalHeight)),
  );

  const fixedHeights = Array.from(document.querySelectorAll<HTMLElement>("[data-ink-fixh]")).map(
    (el) => el.getBoundingClientRect().height,
  );

  // Lazy-loaded: html2canvas is ~200 KB and only needed after first paint.
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(document.body, {
    scale: safeScale,
    backgroundColor: BACKGROUND[theme],
    x: 0,
    y: 0,
    width,
    height: totalHeight,
    scrollX: 0,
    scrollY: 0,
    // The clone iframe renders without a scrollbar, so give it the live page's
    // scrollbar-less width; otherwise centred content shifts by half a scrollbar.
    windowWidth: width,
    windowHeight: document.documentElement.clientHeight,
    logging: false,
    useCORS: true,
    onclone: (doc) => {
      const root = doc.documentElement;
      root.setAttribute("data-theme", theme);
      root.classList.remove("theme-fade");

      // Settled state only: no mid-animation frames baked into the snapshot.
      const style = doc.createElement("style");
      style.textContent =
        "*,*::before,*::after{animation:none!important;transition:none!important}";
      doc.head.appendChild(style);
      doc.querySelectorAll("[data-scroll]").forEach((el) => el.classList.add("in-view"));
      doc.querySelectorAll("[data-hovering]").forEach((el) => el.removeAttribute("data-hovering"));

      // svh/dvh resolve against the clone iframe, not the phone's real viewport.
      doc.querySelectorAll<HTMLElement>("[data-ink-fixh]").forEach((el, i) => {
        const h = fixedHeights[i];
        if (h) el.style.minHeight = `${h}px`;
      });

      // Copy each layer into the strip, then hide the original (keeping its layout box).
      const cloneLayers = Array.from(doc.querySelectorAll<HTMLElement>("[data-ink-layer]"));
      boxes.forEach((b, i) => {
        const original = cloneLayers[b.index];
        if (!original) return;
        const wrapper = doc.createElement("div");
        wrapper.style.cssText = `position:absolute;left:0;top:${layerTops[i]}px;width:${b.width}px;height:${b.height}px;overflow:hidden;margin:0;padding:0`;
        const copy = original.cloneNode(true) as HTMLElement;
        copy.style.position = "relative";
        copy.style.inset = "auto";
        copy.style.top = "auto";
        copy.style.margin = "0";
        copy.style.width = `${b.width}px`;
        wrapper.appendChild(copy);
        doc.body.appendChild(wrapper);
        original.style.visibility = "hidden";
      });

      // html2canvas copies the *live* page's computed styles inline onto SVG elements and
      // rasterises them out of context, so icons would keep the other theme's colour. Resolve
      // `currentColor` from the icon's HTML parent, which does follow the cloned theme.
      const view = doc.defaultView;
      doc.querySelectorAll<SVGSVGElement>("svg").forEach((svg) => {
        const host = svg.parentElement;
        if (!view || !host) return;
        const color = view.getComputedStyle(host).color;
        const liveColor = svg.style.color;
        for (const el of [svg, ...Array.from(svg.querySelectorAll<SVGElement>("*"))]) {
          el.style.color = color;
          for (const prop of ["stroke", "fill"]) {
            const attr = el.getAttribute(prop)?.toLowerCase();
            const inline = el.style.getPropertyValue(prop);
            if (attr === "currentcolor" || (liveColor && inline === liveColor)) {
              el.style.setProperty(prop, color);
            }
          }
        }
      });

      // The live toggle is drawn above the overlay, so leave a hole for it. `visibility`
      // (not data-html2canvas-ignore) keeps its box in the layout so the nav doesn't shift.
      // Panning screenshots are captured resting at the top of their page.
      doc.querySelectorAll<HTMLElement>("[data-pan]").forEach((el) => {
        el.style.transform = "none";
      });

      doc.querySelectorAll<HTMLElement>("[data-ink-live]").forEach((el) => {
        el.style.visibility = "hidden";
      });
    },
  });

  return { theme, canvas, scale: safeScale, key, layerTops, ms: performance.now() - t0 };
}
