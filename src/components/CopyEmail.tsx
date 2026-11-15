"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "./Icons";

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

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-hairline-strong px-3.5 font-mono text-[12px] text-graphite transition-colors duration-200 hover:border-ink hover:text-ink"
    >
      {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
      <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
    </button>
  );
}
