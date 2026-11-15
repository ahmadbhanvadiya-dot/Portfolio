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
 * Text morph, character-aware: when the text changes, the characters the old and new text
 * share from the start stay exactly where they are; only the part that differs moves. The
 * old tail lifts away (160ms) while the new tail arrives character by character, 8ms
 * apart (capped), so the eye lands on what changed and the line stays readable throughout.
 * Words stay whole for wrapping. The first render does not animate; screen readers get the
 * plain text once (the caller's live region announces it); the ink snapshots and reduced
 * motion show the settled line.
 */
export default function TextMorph({ parts, className = "" }: Props) {
  const list = toParts(parts);
  const text = list.map((p) => p.text).join("");
  const [shown, setShown] = useState({ text, list, version: 0, prefix: 0 });
  const [leaving, setLeaving] = useState<{ list: MorphPart[]; version: number; prefix: number } | null>(null);

  // New text: keep the old line long enough to lift away (derived during render).
  if (text !== shown.text) {
    let prefix = 0;
    while (prefix < text.length && text[prefix] === shown.text[prefix]) prefix++;
    setLeaving({ list: shown.list, version: shown.version, prefix });
    setShown({ text, list, version: shown.version + 1, prefix });
  }
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(null), 180);
    return () => window.clearTimeout(t);
  }, [leaving]);

  /** mode "in": animate from `prefix` on; "out": hide the shared prefix (it stays in the new line). */
  const render = (items: MorphPart[], mode: "static" | "in" | "out", prefix: number) => {
    let pos = 0;
    return items.map((part, pi) => (
      <span key={pi} className={part.className}>
        {part.text.split(/(\s+)/).map((word, wi) => {
          if (/^\s+$/.test(word) || word === "") {
            pos += word.length;
            return word;
          }
          return (
            <span key={wi} className="morph-word">
              {Array.from(word).map((ch, ci) => {
                const i = pos++;
                if (mode === "in" && i >= prefix) {
                  return (
                    <span key={ci} className="morph-char" style={{ ["--c" as string]: Math.min(i - prefix, 12) }}>
                      {ch}
                    </span>
                  );
                }
                if (mode === "out" && i < prefix) {
                  return (
                    <span key={ci} style={{ visibility: "hidden" }}>
                      {ch}
                    </span>
                  );
                }
                return <span key={ci}>{ch}</span>;
              })}
            </span>
          );
        })}
      </span>
    ));
  };

  return (
    <span className={`morph ${className}`}>
      <span className="sr-only">{shown.text}</span>
      <span aria-hidden="true" key={shown.version} className="morph-line">
        {render(shown.list, shown.version > 0 ? "in" : "static", shown.prefix)}
      </span>
      {leaving && (
        <span aria-hidden="true" key={`out-${leaving.version}`} className="morph-out">
          {render(leaving.list, "out", leaving.prefix)}
        </span>
      )}
    </span>
  );
}
