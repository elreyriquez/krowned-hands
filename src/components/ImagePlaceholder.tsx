import { ReactNode } from "react";

type Props = {
  /** Short description the client will replace with real photography. */
  label: string;
  /** CSS aspect ratio e.g. "16/9", "3/4", "1/1". */
  ratio?: string;
  /** Optional tone: default | dark | gold */
  tone?: "default" | "dark" | "gold";
  className?: string;
  children?: ReactNode;
  /** Shown as a small caption (e.g. "Image: hero portrait, 16/9"). */
  hint?: string;
  /** Rounded corners — default `lg`. */
  rounded?: "none" | "md" | "lg" | "xl";
};

const roundedMap = {
  none: "rounded-none",
  md: "rounded-md",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
};

/**
 * Clearly-marked slot for client photography.
 * Uses CSS aspect-ratio so it never collapses, and an inline caption
 * so content owners know exactly what belongs there.
 */
export function ImagePlaceholder({
  label,
  ratio = "16/9",
  tone = "default",
  className = "",
  children,
  hint,
  rounded = "lg",
}: Props) {
  const toneClass =
    tone === "dark"
      ? "bg-[var(--kh-charcoal)] text-[var(--kh-cream)]/80 border-[color-mix(in_srgb,var(--kh-gold)_35%,transparent)]"
      : tone === "gold"
      ? "bg-gradient-to-br from-[var(--kh-sand)] to-[var(--kh-ochre)] text-[var(--kh-brown)] border-[var(--kh-gold)]"
      : "bg-[color-mix(in_srgb,var(--kh-sand)_55%,var(--kh-cream-soft))] text-[var(--kh-brown-soft)] border-[var(--kh-line)]";

  return (
    <div
      className={`relative w-full overflow-hidden border ${roundedMap[rounded]} ${toneClass} ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={`Image placeholder: ${label}`}
    >
      {/* Watercolor texture hint */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(60% 45% at 20% 20%, color-mix(in srgb, var(--kh-ochre) 30%, transparent), transparent 70%), radial-gradient(55% 50% at 85% 80%, color-mix(in srgb, var(--kh-sand) 65%, transparent), transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      <div className="relative h-full w-full flex flex-col items-center justify-center text-center px-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden className="opacity-60 mb-2">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="8.5" cy="10.5" r="1.4" fill="currentColor" />
          <path d="M4 17l5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.4" fill="none" />
        </svg>
        <p className="font-serif text-base md:text-lg leading-snug">{label}</p>
        {hint ? <p className="mt-1 text-xs uppercase tracking-[0.18em] opacity-70">{hint}</p> : null}
        {children}
      </div>
    </div>
  );
}
