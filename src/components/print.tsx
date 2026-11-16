/**
 * OVERPRINT print vocabulary: the marks a press sheet carries, used as this site's grid
 * system and signature (not decoration for its own sake: they frame, number and locate).
 */

/** Registration target: circle + crosshair, as on every press sheet. */
export function RegMark({ className = "", size = 22 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      className={`regmark ${className}`}
    >
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 0v24M0 12h24" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Crop marks at the four corners of the parent (which must be positioned). */
export function CropMarks({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`crop-marks ${className}`}>
      <span className="crop crop--tl" />
      <span className="crop crop--tr" />
      <span className="crop crop--bl" />
      <span className="crop crop--br" />
    </span>
  );
}

/** Colour bar: the inks this site is printed in, with tints, like a press control strip. */
export function ColorBar({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`color-bar ${className}`}>
      <span style={{ background: "var(--blue)" }} />
      <span style={{ background: "var(--blue)", opacity: 0.5 }} />
      <span style={{ background: "var(--lime)" }} />
      <span style={{ background: "var(--lime)", opacity: 0.5 }} />
      <span style={{ background: "var(--ink)" }} />
      <span style={{ background: "var(--ink)", opacity: 0.5 }} />
      <span style={{ background: "var(--ink)", opacity: 0.2 }} />
    </span>
  );
}

/** Oversized plate number behind a section: outline type that the section's ink prints over. */
export function PlateNumber({ n, className = "" }: { n: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`plate-number ${className}`}>
      {n}
    </span>
  );
}
