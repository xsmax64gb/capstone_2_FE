"use client";

import { useI18n } from "@/lib/i18n/context";
import { resolvePhrase } from "@/lib/i18n/messages";

type BilingualProps = {
  /** Vietnamese key (must exist in `PHRASES`) */
  viKey: string;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  as?: "div" | "span" | "p" | "h1" | "h2" | "h3";
};

export function Bilingual({
  viKey,
  className,
  primaryClassName = "block",
  secondaryClassName = "mt-2 block text-base font-normal text-slate-500 md:text-lg",
  as: Tag = "div",
}: BilingualProps) {
  const { lang } = useI18n();
  const p = resolvePhrase(viKey.trim());
  if (!p) {
    return <Tag className={className}>{viKey}</Tag>;
  }
  const primary = lang === "vi" ? p.vi : p.en;
  const secondary = lang === "vi" ? p.en : p.vi;
  return (
    <Tag className={className}>
      <span className={primaryClassName}>{primary}</span>
      <span className={secondaryClassName}>{secondary}</span>
    </Tag>
  );
}
