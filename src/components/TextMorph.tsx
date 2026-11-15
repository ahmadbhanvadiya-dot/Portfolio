"use client";

import { useEffect, useState } from "react";

export type MorphPart = { text: string; className?: string };

type Props = {
  /** Plain text, or styled parts that read as one line. */
  parts: string | MorphPart[];
  className?: string;
};

const toParts = (parts: string | MorphPart[]): MorphPart[] =>
  typeof parts === "string" ? [{ text: parts }] : parts;

/**
 * Text morph: when the text changes, the old line lifts away and the new one arrives
 * character by character (10ms apart, capped), so the eye lands on what changed.
 * Words stay whole for wrapping. The first render does not animate; screen readers get
 * the plain text once; the ink snapshots and reduced motion show the settled line.
 */
export default function TextMorph({ parts, className = "" }: Props) {
  const list = toParts(parts);
  const text = list.map((p) => p.text).join("");
  const [shown, setShown] = useState({ text, list, version: 0 });
  const [leaving, setLeaving] = useState<{ list: MorphPart[]; version: number } | null>(null);

  // New text: keep the old line long enough to lift away (derived during render).
  if (text !== shown.text) {
    setLeaving({ list: shown.list, version: shown.version });
    setShown({ text, list, version: shown.version + 1 });
  }
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(null), 180);
    return () => window.clearTimeout(t);
  }, [leaving]);

  let index = 0;
  const render = (items: MorphPart[], animate: boolean) =>
    items.map((part, pi) => (
      <span key={pi} className={part.className}>
        {part.text.split(/(\s+)/).map((word, wi) =>
          /^\s+$/.test(word) || word === "" ? (
            word
          ) : (
            <span key={wi} className="morph-word">
              {Array.from(word).map((ch, ci) => {
                const i = index++;
                return animate ? (
                  <span key={ci} className="morph-char" style={{ ["--c" as string]: Math.min(i, 24) }}>
                    {ch}
                  </span>
                ) : (
                  <span key={ci}>{ch}</span>
                );
              })}
            </span>
          ),
        )}
      </span>
    ));

  return (
    <span className={`morph ${className}`}>
      <span className="sr-only">{shown.text}</span>
      <span aria-hidden="true" key={shown.version} className="morph-line">
        {render(shown.list, shown.version > 0)}
      </span>
      {leaving && (
        <span aria-hidden="true" key={`out-${leaving.version}`} className="morph-out">
          {render(leaving.list, false)}
        </span>
      )}
    </span>
  );
}
