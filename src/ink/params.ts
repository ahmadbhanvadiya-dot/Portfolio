// Adapted from codemure-official/ink-bleed-theme-changer (MIT, see LICENSE-ink-bleed).
import type { Theme } from "./theme";

/** Look of the ink. Values are the reference's defaults. */
export interface InkParams {
  /** Seconds for the spread (before the 150ms fade). */
  duration: number;
  /** Tendril reach multiplier, 0 = clean blob. */
  tendril: number;
  /** Noise frequency multiplier: lower = bigger, lazier shapes. */
  noiseScale: number;
  /** Frontier half-width in CSS px. */
  softness: number;
  /** Speed at which the shape evolves during the spread. */
  drift: number;
  /** Global playback rate. */
  timeScale: number;
}

export const inkParams: InkParams = {
  duration: 1.4,
  tendril: 1,
  noiseScale: 1,
  softness: 1.4,
  drift: 1,
  timeScale: 1,
};

/**
 * Pigment colour pooled at the frontier, keyed by the theme being revealed.
 * Tuned to this site's grounds: a touch denser than #121210, a touch brighter than #f5f3ee.
 */
export const RIM_COLOR: Record<Theme, [number, number, number]> = {
  dark: [0.02, 0.02, 0.018],
  light: [1.0, 0.99, 0.962],
};

/** Page background per theme (html2canvas fills the snapshot with it). Mirrors globals.css. */
export const BACKGROUND: Record<Theme, string> = {
  light: "#f0ece2",
  dark: "#0f0f0d",
};
