"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "./Icons";

/**
 * Copy the address. The two states crossfade in place with a touch of blur (Emil's trick for
 * a swap that should read as one object changing), and the label is announced politely.
 */
export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  const layer = "col-start-1 row-start-1 flex items-center gap-2 transition-[opacity,filter,transform] duration-150 ease-out";
  const shown = "opacity-100 blur-0 scale-100";
  const hiddenState = "opacity-0 blur-[2px] scale-95";

  return (
    <button
      type="button"
      onClick={copy}
      className="press inline-grid h-11 items-center rounded-[4px] border border-hairline-strong px-4 font-mono text-[12px] text-graphite hover:border-ink hover:text-ink"
    >
      <span className={`${layer} ${copied ? hiddenState : shown}`} aria-hidden={copied}>
        <Copy size={14} />
        Copy email
      </span>
      <span className={`${layer} text-ink ${copied ? shown : hiddenState}`} aria-hidden={!copied}>
        <Check size={14} className="text-accent" />
        Copied
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Email address copied" : ""}
      </span>
    </button>
  );
}
